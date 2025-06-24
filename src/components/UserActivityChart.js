// src/components/UserActivityChart.js
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Box, Typography, Tooltip, useTheme, alpha } from '@mui/material';
import { format, startOfWeek, addDays, getMonth, getDay, parseISO, isSameDay } from 'date-fns'; // Added isSameDay
import useMediaQuery from '@mui/material/useMediaQuery'; // For more robust breakpoint detection

const DAYS_OF_WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Full labels
const DAY_LABELS_TO_DISPLAY_SHORT = ['Mon', 'Wed', 'Fri']; // Shortened for display

// Define square sizes and gaps as constants for easier adjustment
const SQUARE_SIZE_XS = 11;
const SQUARE_SIZE_SM_UP = 13;
const SQUARE_MARGIN = 1.5; // Margin on each side, so visual gap is SQUARE_MARGIN * 2
const MONTH_LABEL_HEIGHT = 20; // px
const DAY_LABEL_WIDTH = 25; // px, approximate width for the column of day labels

const getColorForCount = (count, theme, accentColorInput) => {
  const baseColor = accentColorInput || theme.palette.primary.main;
  if (count === 0) return alpha(theme.palette.text.disabled, 0.20); // Slightly more visible for no activity
  if (count <= 2) return alpha(baseColor, 0.35);
  if (count <= 4) return alpha(baseColor, 0.60); // Adjusted threshold
  if (count <= 7) return alpha(baseColor, 0.85); // Adjusted threshold
  return baseColor; // Full accent for 8+
};

function UserActivityChart({ activityData, accentColor }) {
  const theme = useTheme();
  const chartContainerRef = useRef(null); // Ref for the main chart container (excluding day labels)
  const [visibleWeeksCount, setVisibleWeeksCount] = useState(53); // Default to a full year

  // Use MUI's useMediaQuery for more reliable breakpoint detection
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm')); // Treat xs and sm similarly for square size

  // Calculate the full year's chart data (53 weeks)
  const fullYearChartData = useMemo(() => {
    const activityMap = new Map();
    (activityData || []).forEach(item => {
      if (item.date && typeof item.date === 'string') { // Ensure item.date exists
        activityMap.set(item.date, item.count); // Assuming item.date is 'YYYY-MM-DD'
      }
    });

    const weeks = [];
    const today = new Date();
    // Start from Sunday of (53 - 1) weeks ago to ensure 'today' is in the last column
    let currentColumnStartDate = startOfWeek(addDays(today, -(53 - 1) * 7), { weekStartsOn: 0 });

    for (let w = 0; w < 53; w++) {
      const weekDays = [];
      let showMonthLabel = false;

      for (let d = 0; d < 7; d++) {
        const dayDate = addDays(currentColumnStartDate, d);
        const dateString = format(dayDate, 'yyyy-MM-dd');
        const count = activityMap.get(dateString) || 0;

        // Determine if this day is the first of a new month within its column
        if (d === 0 || getDay(dayDate) === 0 /* Sunday */) { // Check for month label at start of week
            if (w === 0 || getMonth(dayDate) !== getMonth(addDays(dayDate, -7))) {
                 // Show month label if it's the first week or the month changes from the previous week's start
                 showMonthLabel = true;
            }
        } else if (isSameDay(dayDate, startOfWeek(dayDate, {weekStartsOn:0})) && getMonth(dayDate) !== getMonth(addDays(dayDate, -1))) {
            // Alternative check: if it's the first day of the week AND the month is different from the day before.
            // This might be redundant with the above check.
        }


        weekDays.push({
          date: dayDate,
          count: count,
          color: getColorForCount(count, theme, accentColor),
          dateString: dateString,
        });
      }
      weeks.push({
        id: `week-${w}`,
        days: weekDays,
        // Show month label for the first day of the week if it's the first day of a month,
        // or if it's the very first week being displayed.
        monthLabel: (getDay(weekDays[0].date) === 0 && weekDays[0].date.getDate() <= 7) || w === 0 || showMonthLabel
                      ? format(weekDays[0].date, 'MMM')
                      : null,
      });
      currentColumnStartDate = addDays(currentColumnStartDate, 7);
    }
    return weeks;
  }, [activityData, theme, accentColor]);

  // Effect to calculate how many weeks can fit without scrolling
  useEffect(() => {
    const calculateVisibleWeeks = () => {
      if (chartContainerRef.current) {
        const containerWidth = chartContainerRef.current.offsetWidth;
        const squareSize = isXsScreen ? SQUARE_SIZE_XS : SQUARE_SIZE_SM_UP;
        const squareTotalWidth = squareSize + (SQUARE_MARGIN * 2); // Square + its horizontal margins

        if (squareTotalWidth > 0) {
          const numWeeksThatFit = Math.floor(containerWidth / squareTotalWidth);
          setVisibleWeeksCount(Math.max(5, Math.min(numWeeksThatFit, 53))); // Show at least 5 weeks, max 53
        } else {
          setVisibleWeeksCount(isXsScreen ? 20 : 53); // Fallback
        }
      } else {
        // Fallback if ref not available yet (e.g., during SSR or initial very fast render)
        setVisibleWeeksCount(isXsScreen ? 20 : 53);
      }
    };

    calculateVisibleWeeks(); // Initial calculation
    const debouncedCalculate = setTimeout(calculateVisibleWeeks, 100); // Recalculate shortly after mount for accurate width

    window.addEventListener('resize', calculateVisibleWeeks);
    return () => {
      clearTimeout(debouncedCalculate);
      window.removeEventListener('resize', calculateVisibleWeeks);
    };
  }, [isXsScreen, theme.breakpoints.values.sm]); // Re-calculate if breakpoint changes

  // Slice the full year data to display only the visible weeks (most recent ones)
  const chartDataToRender = useMemo(() => {
    return fullYearChartData.slice(-visibleWeeksCount);
  }, [fullYearChartData, visibleWeeksCount]);


  if (!activityData) {
    return <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>Loading activity data...</Typography>;
  }
  if (activityData.length === 0 && fullYearChartData.every(week => week.days.every(day => day.count === 0))) {
      // This case is handled by the parent AccountPage now.
      // return <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No quiz activity recorded yet.</Typography>;
  }


  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', overflow: 'hidden' }}>
      {/* Day Labels Column */}
      <Box sx={{ display: 'flex', flexDirection: 'column', mr: 0.5, pt: `${MONTH_LABEL_HEIGHT}px`, width: `${DAY_LABEL_WIDTH}px`, flexShrink: 0 }}>
        {DAYS_OF_WEEK_LABELS.map((day, index) => (
          <Typography
            key={day}
            variant="caption"
            sx={{
              height: (isXsScreen ? SQUARE_SIZE_XS : SQUARE_SIZE_SM_UP) + (SQUARE_MARGIN * 2) -1, // Approximate height of a square + margins
              display: 'flex',
              alignItems: 'center',
              visibility: DAY_LABELS_TO_DISPLAY_SHORT.includes(day) ? 'visible' : 'hidden',
              fontSize: '0.6rem',
              lineHeight: 1,
              color: theme.palette.text.secondary,
            }}
          >
            {DAY_LABELS_TO_DISPLAY_SHORT.includes(day) ? day.charAt(0) : ''}
          </Typography>
        ))}
      </Box>

      {/* Activity Grid - This box will contain the visible weeks */}
      <Box ref={chartContainerRef} sx={{ display: 'flex', flexDirection: 'row', gap: `${SQUARE_MARGIN * 2}px`, width: '100%', overflow: 'hidden' }}>
        {chartDataToRender.map((week) => (
          <Box key={week.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Month Label */}
            <Typography
              variant="caption"
              sx={{
                height: `${MONTH_LABEL_HEIGHT}px`,
                fontSize: '0.65rem',
                color: theme.palette.text.secondary,
                // Month label visibility based on the first day of the *rendered* week
                visibility: week.days[0].date.getDate() <= 7 || week.id === chartDataToRender[0]?.id ? 'visible' : 'hidden',
                minWidth: (isXsScreen ? SQUARE_SIZE_XS : SQUARE_SIZE_SM_UP), // Ensure it takes at least square width
                textAlign: 'left',
                whiteSpace: 'nowrap',
                // Position it slightly to align better if needed
              }}
            >
              { (week.days[0].date.getDate() <= 7 || week.id === chartDataToRender[0]?.id) ? format(week.days[0].date, 'MMM') : ''}
            </Typography>
            {/* Day Squares */}
            {week.days.map((day) => (
              <Tooltip
                key={day.dateString}
                title={day.date > new Date() ? 'Future date' : `${day.count} quiz${day.count === 1 ? '' : 'zes'} on ${format(parseISO(day.dateString), 'MMM d, yyyy')}`}
                arrow
                placement="top"
              >
                <Box
                  sx={{
                    width: (isXsScreen ? SQUARE_SIZE_XS : SQUARE_SIZE_SM_UP),
                    height: (isXsScreen ? SQUARE_SIZE_XS : SQUARE_SIZE_SM_UP),
                    backgroundColor: day.date > new Date() ? alpha(theme.palette.action.disabledBackground, 0.3) : day.color,
                    borderRadius: '3px', // Slightly more rounded
                    // margin: `${SQUARE_MARGIN}px`, // This was creating double margin with gap on parent
                    cursor: day.date <= new Date() && day.count > 0 ? 'pointer' : 'default',
                    '&:hover': {
                      outline: day.date <= new Date() && day.count > 0 ? `1.5px solid ${alpha(theme.palette.getContrastText(day.color), 0.7)}` : 'none',
                    },
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default UserActivityChart;