// src/components/UserActivityChart.js
import React, { useMemo, useRef, useEffect, useState } from 'react'; // Added useRef, useEffect, useState
import { Box, Typography, Tooltip, useTheme, alpha } from '@mui/material';
import { format, startOfWeek, addDays, getMonth, getDay, parseISO } from 'date-fns'; // Removed isSameMonth as it wasn't used

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getColorForCount = (count, theme, accentColorInput) => {
  const baseColor = accentColorInput || theme.palette.primary.main;
  if (count === 0) return alpha(theme.palette.text.disabled, 0.15);
  if (count <= 2) return alpha(baseColor, 0.35);
  if (count <= 5) return alpha(baseColor, 0.6);
  if (count <= 9) return alpha(baseColor, 0.85);
  return baseColor;
};

const SQUARE_SIZE_XS = 12;
const SQUARE_SIZE_SM_UP = 14;
const SQUARE_GAP = 3; // Combined margin (1.5px on each side visually)

function UserActivityChart({ activityData, accentColor }) {
  const theme = useTheme();
  const chartContainerRef = useRef(null);
  const [visibleWeeks, setVisibleWeeks] = useState(53); // Default to a full year

  const fullChartData = useMemo(() => {
    // console.log("Recalculating fullChartData");
    const activityMap = new Map();
    (activityData || []).forEach(item => {
      const dateKey = item.date;
      activityMap.set(dateKey, item.count);
    });

    const weeks = [];
    const today = new Date();
    let currentDayPointer = startOfWeek(addDays(today, -(53 - 1) * 7), { weekStartsOn: 0 });

    for (let w = 0; w < 53; w++) { // Always calculate for a full year
      const week = [];
      let showMonthLabel = false;

      for (let d = 0; d < 7; d++) {
        const dayDate = addDays(currentDayPointer, d);
        const dateString = format(dayDate, 'yyyy-MM-dd');
        const count = activityMap.get(dateString) || 0;

        if (d === 0) {
            const monthOfFirstDayInWeek = getMonth(dayDate);
            if (w === 0 || getMonth(addDays(currentDayPointer, -7)) !== monthOfFirstDayInWeek) {
                if (dayDate <= today || w < 2 ) { // Show first few month labels even if slightly in future
                   showMonthLabel = true;
                }
            }
        }
        week.push({ date: dayDate, count, color: getColorForCount(count, theme, accentColor), dateString });
      }
      weeks.push({ id: `week-${w}`, days: week, monthLabel: showMonthLabel ? format(week[0].date, 'MMM') : null });
      currentDayPointer = addDays(currentDayPointer, 7);
    }
    return weeks;
  }, [activityData, theme, accentColor]);

  useEffect(() => {
    const calculateVisibleWeeks = () => {
      if (chartContainerRef.current) {
        const containerWidth = chartContainerRef.current.offsetWidth;
        // Estimate square size based on current breakpoint (this is an approximation)
        const isSmallScreen = window.innerWidth < theme.breakpoints.values.sm;
        const squareTotalWidth = (isSmallScreen ? SQUARE_SIZE_XS : SQUARE_SIZE_SM_UP) + SQUARE_GAP;
        
        // Subtract some width for day labels if you have them fixed on the left
        const availableWidthForSquares = containerWidth - 30; // Approx width for day labels
        
        const numWeeksThatFit = Math.floor(availableWidthForSquares / squareTotalWidth);
        setVisibleWeeks(Math.max(1, Math.min(numWeeksThatFit, 53))); // Show at least 1 week, max 53
      }
    };

    calculateVisibleWeeks(); // Initial calculation
    window.addEventListener('resize', calculateVisibleWeeks);
    return () => window.removeEventListener('resize', calculateVisibleWeeks);
  }, [theme.breakpoints.values.sm]);

  const chartDataToRender = useMemo(() => {
    return fullChartData.slice(-visibleWeeks); // Take the most recent 'visibleWeeks'
  }, [fullChartData, visibleWeeks]);


  const dayLabelsToDisplay = ['Mon', 'Wed', 'Fri'];

  if (!activityData) {
    return <Typography color="text.secondary">Loading activity data...</Typography>;
  }

  return (
    <Box ref={chartContainerRef} sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', overflow: 'hidden' /* Important: prevent internal scroll */ }}>
      {/* Day Labels Column */}
      <Box sx={{ display: 'flex', flexDirection: 'column', mr: 0.5, pt: '20px' }}>
        {DAYS_OF_WEEK.map((day, index) => (
          <Typography
            key={day}
            variant="caption"
            sx={{
              height: { xs: `${SQUARE_SIZE_XS + SQUARE_GAP -1}px`, sm: `${SQUARE_SIZE_SM_UP + SQUARE_GAP-1}px` },
              display: 'flex',
              alignItems: 'center',
              visibility: dayLabelsToDisplay.includes(day) ? 'visible' : 'hidden',
              fontSize: '0.6rem',
              color: theme.palette.text.secondary,
              lineHeight: 1,
            }}
          >
            {dayLabelsToDisplay.includes(day) ? day.charAt(0) : ''}
          </Typography>
        ))}
      </Box>

      {/* Activity Grid - This box will not scroll internally */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: { xs: '2px', sm: `${SQUARE_GAP -1}px` } }}>
        {chartDataToRender.map((week) => (
          <Box key={week.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography
              variant="caption"
              sx={{
                height: '20px',
                fontSize: '0.65rem',
                color: theme.palette.text.secondary,
                visibility: week.monthLabel ? 'visible' : 'hidden',
                width: { xs: `${SQUARE_SIZE_XS}px`, sm: `${SQUARE_SIZE_SM_UP}px` },
                textAlign: 'left',
                overflow: 'visible',
                whiteSpace: 'nowrap'
              }}
            >
              {week.monthLabel}
            </Typography>
            {week.days.map((day) => (
              <Tooltip
                key={day.dateString}
                title={day.date > new Date() ? 'Future date' : `${day.count} quiz${day.count === 1 ? '' : 'zes'} on ${format(day.date, 'MMM d, yyyy')}`}
                arrow
                placement="top"
              >
                <Box
                  sx={{
                    width: { xs: `${SQUARE_SIZE_XS}px`, sm: `${SQUARE_SIZE_SM_UP}px` },
                    height: { xs: `${SQUARE_SIZE_XS}px`, sm: `${SQUARE_SIZE_SM_UP}px` },
                    backgroundColor: day.date > new Date() ? alpha(theme.palette.action.disabledBackground, 0.2) : day.color,
                    borderRadius: '2px',
                    margin: `${(SQUARE_GAP-1)/2}px`, // Visual gap
                    '&:hover': {
                      outline: day.date <= new Date() && day.count > 0 ? `1px solid ${theme.palette.getContrastText(day.color)}` : 'none',
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