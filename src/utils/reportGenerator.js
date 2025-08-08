// src/utils/reportGenerator.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Chart } from 'chart.js';

/**
 * A helper function that temporarily restyles a Chart.js chart for a high-contrast, light-mode PDF,
 * captures it using html2canvas, and then restores its original styles.
 * @param {HTMLElement} element - The DOM element that wraps the chart canvas.
 * @returns {Promise<string|null>} A promise that resolves to a base64 image data URL or null.
 */
const captureChartWithLightModeStyles = async (element) => {
  if (!element) return null;
  const canvas = element.querySelector('canvas');
  if (!canvas) {
    console.error("PDF Gen: Could not find a canvas element to capture.");
    return null;
  }
  const chartInstance = Chart.getChart(canvas);
  if (!chartInstance) {
    console.error("PDF Gen: Could not get Chart.js instance from the canvas.");
    return null;
  }

  const originalOptions = JSON.parse(JSON.stringify(chartInstance.options));
  const paperElement = element.querySelector('.MuiPaper-root');
  const originalPaperBg = paperElement ? paperElement.style.backgroundColor : '';

  // --- START OF FIX 1: Store original dataset colors ---
  const originalDatasetColors = [];
  chartInstance.data.datasets.forEach(dataset => {
    originalDatasetColors.push({
      backgroundColor: dataset.backgroundColor,
      borderColor: dataset.borderColor,
      pointBackgroundColor: dataset.pointBackgroundColor,
      pointBorderColor: dataset.pointBorderColor,
    });
  });
  // --- END OF FIX 1 ---

  try {
    const blackColor = '#000000';
    const lightModeGridColor = '#d1d1d1';

    // Apply high-contrast styles to the chart instance
    if (chartInstance.options.plugins.legend) chartInstance.options.plugins.legend.labels.color = blackColor;
    if (chartInstance.options.plugins.title) chartInstance.options.plugins.title.color = blackColor;
    if (chartInstance.options.scales.x) {
      chartInstance.options.scales.x.title.color = blackColor;
      chartInstance.options.scales.x.ticks.color = blackColor;
      chartInstance.options.scales.x.grid.color = lightModeGridColor;
    }
    if (chartInstance.options.scales.y) {
      chartInstance.options.scales.y.title.color = blackColor;
      chartInstance.options.scales.y.ticks.color = blackColor;
      chartInstance.options.scales.y.grid.color = lightModeGridColor;
    }

    // --- START OF FIX 1: Override dataset colors to black for PDF ---
    // NO LONGER OVERRIDING TO BLACK. We will keep the original colors.
    // This part is now removed to preserve the chart's original colors.
    // --- END OF FIX 1 ---

    chartInstance.update('none');
    if (paperElement) paperElement.style.backgroundColor = 'transparent';

    const capturedCanvas = await html2canvas(element, {
      scale: 2, useCORS: true, backgroundColor: '#ffffff',
    });
    return capturedCanvas.toDataURL('image/png');
  } catch (error) {
    console.error("PDF Gen: Error during chart capture:", error);
    return null;
  } finally {
    // Restore all original styles
    chartInstance.options.plugins = originalOptions.plugins;
    chartInstance.options.scales = originalOptions.scales;

    // --- START OF FIX 1: Restore original dataset colors ---
    // This is still needed to ensure the chart on the webpage returns to its original state,
    // even though we are not forcing black colors anymore. It handles any potential mutation.
    chartInstance.data.datasets.forEach((dataset, index) => {
      dataset.backgroundColor = originalDatasetColors[index].backgroundColor;
      dataset.borderColor = originalDatasetColors[index].borderColor;
      dataset.pointBackgroundColor = originalDatasetColors[index].pointBackgroundColor;
      dataset.pointBorderColor = originalDatasetColors[index].pointBorderColor;
    });
    // --- END OF FIX 1 ---

    chartInstance.update('none'); // Update again to apply all restored styles
    if (paperElement) paperElement.style.backgroundColor = originalPaperBg;
  }
};


/**
 * A generic capture function for non-chart components that handles restyling for a light-mode PDF.
 * This now includes changing text colors AND font sizes.
 * @param {HTMLElement} element - The DOM element to capture.
 * @returns {Promise<string|null>} A promise that resolves to a base64 image data URL or null.
 */
const captureElementAsImage = async (element) => {
  if (!element) return null;

  const paperElement = element.querySelector('.MuiPaper-root');
  const originalPaperBg = paperElement ? paperElement.style.backgroundColor : '';
  const textElements = element.querySelectorAll('.MuiTypography-root, .MuiListItemText-primary, .MuiListItemText-secondary');
  const originalTextColors = [];

  // --- START OF FIX 2: Find title and store its original size ---
  const titleElement = element.querySelector('.MuiTypography-h6');
  let originalTitleSize = '';
  if (titleElement) {
    originalTitleSize = titleElement.style.fontSize;
  }
  // --- END OF FIX 2 ---

  try {
    if (paperElement) paperElement.style.backgroundColor = 'transparent';
    textElements.forEach(el => {
      originalTextColors.push({ element: el, color: el.style.color });
      el.style.color = '#000000';
    });

    // --- START OF FIX 2: Temporarily increase title font size ---
    if (titleElement) {
      titleElement.style.fontSize = '22px'; // A larger, more readable size for the PDF header
      titleElement.style.fontWeight = 'bold';
    }
    // --- END OF FIX 2 ---

    const canvas = await html2canvas(element, {
      scale: 2, useCORS: true, backgroundColor: '#ffffff',
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error("PDF Gen: Error capturing element:", error);
    return null;
  } finally {
    if (paperElement) paperElement.style.backgroundColor = originalPaperBg;
    originalTextColors.forEach(item => {
      item.element.style.color = item.color;
    });

    // --- START OF FIX 2: Restore original title font size ---
    if (titleElement) {
      titleElement.style.fontSize = originalTitleSize;
      titleElement.style.fontWeight = ''; // Reset font weight
    }
    // --- END OF FIX 2 ---
  }
};


export const generateDashboardPdfReport = async ({
  currentUser,
  processedStats, // Pass the entire stats object
  activityChartRef,
  rollingAverageChartRef,
  difficultyBreakdownChartRef,
  topicPerformanceRef,
  allSubjects,
  timeFrequencyLabel,
  selectedSubject
}) => {
  if (!currentUser) {
    alert("User data not available for report.");
    return false;
  }
  
  if (!processedStats) {
      alert("No data available to generate a report.");
      return false;
  }

  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let currentY = margin;

    // --- Section 1: Header and Overall KPIs ---
    pdf.setFontSize(22); pdf.setFont(undefined, 'bold');
    pdf.text('ReactiQuiz Performance Report', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
    pdf.setFontSize(14); pdf.setFont(undefined, 'normal');
    pdf.text(`User: ${currentUser.name || 'N/A'}`, margin, currentY); currentY += 7;
    pdf.text(`Report Generated: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, margin, currentY); currentY += 7;
    pdf.text(`Time Period: ${timeFrequencyLabel}`, margin, currentY); currentY += 10;
    
    pdf.setFontSize(16); pdf.setFont(undefined, 'bold');
    pdf.text('Overall Performance Summary', margin, currentY); currentY += 8;
    
    // Using jspdf-autotable for a clean table layout
    autoTable(pdf, {
        startY: currentY,
        head: [['Metric', 'Value']],
        body: [
            ['Total Quizzes Solved', processedStats.totalQuizzes],
            ['Overall Average Score', `${processedStats.overallAverageScore.toFixed(1)}%`],
            ['Total Questions Answered', processedStats.overallQuestionStats.total],
            ['Total Correct Answers', processedStats.overallQuestionStats.correct],
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
    });
    currentY = pdf.lastAutoTable.finalY + 10;

    // --- Section 2: Difficulty Breakdown (if applicable) ---
    if (selectedSubject === 'all' && difficultyBreakdownChartRef?.current) {
        if (currentY + 70 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); currentY = margin; }
        const chartImg = await captureChartWithLightModeStyles(difficultyBreakdownChartRef.current);
        if (chartImg) {
            const imgProps = pdf.getImageProperties(chartImg);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
            pdf.addImage(chartImg, 'PNG', margin, currentY, contentWidth, imgHeight);
            currentY += imgHeight + 10;
        }
    }

    // --- Section 3: Subject Performance Table (if applicable) ---
    if (selectedSubject === 'all') {
        if (currentY + 30 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); currentY = margin; }
        pdf.setFontSize(16); pdf.setFont(undefined, 'bold');
        pdf.text('Performance by Subject', margin, currentY); currentY += 8;
        
        const subjectBody = Object.entries(processedStats.subjectBreakdowns).map(([key, data]) => [
            data.name,
            data.count,
            `${data.average.toFixed(1)}%`,
            `${data.totalCorrect} / ${data.totalQuestions}`
        ]);

        autoTable(pdf, {
            startY: currentY,
            head: [['Subject', 'Quizzes', 'Avg. Score', 'Correct/Total Qs']],
            body: subjectBody,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
        });
        currentY = pdf.lastAutoTable.finalY + 10;
    }

    // --- Section 4: Rolling Average Chart ---
    if (rollingAverageChartRef?.current) {
        if (currentY + 70 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); currentY = margin; }
        const chartImg = await captureChartWithLightModeStyles(rollingAverageChartRef.current);
        if (chartImg) {
            const imgProps = pdf.getImageProperties(chartImg);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
            pdf.addImage(chartImg, 'PNG', margin, currentY, contentWidth, imgHeight);
            currentY += imgHeight + 10;
        }
    }

    // --- Section 5: Activity Chart ---
    if (activityChartRef?.current) {
        if (currentY + 70 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); currentY = margin; }
        const chartImg = await captureChartWithLightModeStyles(activityChartRef.current);
        if (chartImg) {
            const imgProps = pdf.getImageProperties(chartImg);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
            pdf.addImage(chartImg, 'PNG', margin, currentY, contentWidth, imgHeight);
            currentY += imgHeight + 10;
        }
    }

    // --- Section 6: Topic Performance (if viewing a single subject) ---
    if (selectedSubject !== 'all' && topicPerformanceRef?.current) {
        if (currentY + 50 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); currentY = margin; }
        const topicImg = await captureElementAsImage(topicPerformanceRef.current);
        if (topicImg) {
            const imgProps = pdf.getImageProperties(topicImg);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
            pdf.addImage(topicImg, 'PNG', margin, currentY, contentWidth, imgHeight);
            currentY += imgHeight + 10;
        }
    }

    pdf.save(`ReactiQuiz_Report_${currentUser.name}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating PDF report:", error);
    alert("Failed to generate PDF report. See console for details.");
    return false;
  }
};