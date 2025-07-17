// src/utils/reportGenerator.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { Chart } from 'chart.js';

/**
 * A helper function that temporarily restyles a Chart.js chart for a light-mode PDF,
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

  try {
    const lightModeTextColor = '#212121';
    const lightModeGridColor = '#d1d1d1';

    if (chartInstance.options.plugins.legend) {
      chartInstance.options.plugins.legend.labels.color = lightModeTextColor;
    }
    if (chartInstance.options.plugins.title) {
      chartInstance.options.plugins.title.color = lightModeTextColor;
    }
    if (chartInstance.options.scales.x) {
      chartInstance.options.scales.x.title.color = lightModeTextColor;
      chartInstance.options.scales.x.ticks.color = lightModeTextColor;
      chartInstance.options.scales.x.grid.color = lightModeGridColor;
    }
    if (chartInstance.options.scales.y) {
      chartInstance.options.scales.y.title.color = lightModeTextColor;
      chartInstance.options.scales.y.ticks.color = lightModeTextColor;
      chartInstance.options.scales.y.grid.color = lightModeGridColor;
    }
    
    chartInstance.update('none');

    if (paperElement) {
      paperElement.style.backgroundColor = 'transparent';
    }

    const capturedCanvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    return capturedCanvas.toDataURL('image/png');

  } catch (error) {
    console.error("PDF Gen: Error during chart capture:", error);
    return null;
  } finally {
    chartInstance.options.plugins = originalOptions.plugins;
    chartInstance.options.scales = originalOptions.scales;
    chartInstance.update('none');
    
    if (paperElement) {
      paperElement.style.backgroundColor = originalPaperBg;
    }
  }
};

/**
 * A generic capture function for non-chart components that handles restyling for a light-mode PDF.
 * This now includes changing text colors.
 * @param {HTMLElement} element - The DOM element to capture.
 * @returns {Promise<string|null>} A promise that resolves to a base64 image data URL or null.
 */
const captureElementAsImage = async (element) => {
  if (!element) return null;
  
  const paperElement = element.querySelector('.MuiPaper-root');
  const originalPaperBg = paperElement ? paperElement.style.backgroundColor : '';
  
  // Find all text elements within the component to change their color
  const textElements = element.querySelectorAll('.MuiTypography-root, .MuiListItemText-primary, .MuiListItemText-secondary');
  const originalTextColors = [];

  try {
    // 1. Temporarily change styles for PDF capture
    if (paperElement) {
        paperElement.style.backgroundColor = 'transparent';
    }
    textElements.forEach(el => {
        originalTextColors.push({ element: el, color: el.style.color }); // Store original color
        el.style.color = '#000000'; // Set to black for the capture
    });

    // 2. Capture the element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error("PDF Gen: Error capturing element:", error);
    return null;
  } finally {
    // 3. Restore all original styles
    if (paperElement) {
        paperElement.style.backgroundColor = originalPaperBg;
    }
    originalTextColors.forEach(item => {
        item.element.style.color = item.color; // Restore original text color
    });
  }
};

/**
 * Generates and triggers the download of a PDF report for the user's dashboard.
 */
export const generateDashboardPdfReport = async ({
  currentUser,
  overallStats,
  activityChartElement,
  subjectAveragesChartElement,
  topicPerformanceElement,
  isSubjectSelected,
  timeFrequencyLabel
}) => {
  if (!currentUser) {
    alert("User data not available for report.");
    return false;
  }
  if (!activityChartElement) {
    alert("Activity Chart element not found. Cannot generate PDF.");
    return false;
  }

  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let currentY = margin;

    // --- PDF Header ---
    pdf.setFontSize(22);
    pdf.setFont(undefined, 'bold');
    pdf.text('ReactiQuiz User Analytics Report', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'normal');
    pdf.text(`User: ${currentUser.name || 'N/A'}`, margin, currentY);
    currentY += 7;
    pdf.text(`Report Generated: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, margin, currentY);
    currentY += 7;
    pdf.text(`Time Period: ${timeFrequencyLabel}`, margin, currentY);
    currentY += 10;

    // --- Overall Stats ---
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Overall Performance', margin, currentY);
    currentY += 7;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`- Total Quizzes Solved: ${overallStats.totalQuizzes}`, margin + 5, currentY);
    currentY += 6;
    pdf.text(`- Overall Average Score: ${overallStats.overallAverageScore}%`, margin + 5, currentY);
    currentY += 10;

    // --- Add Topic Performance if a subject is selected ---
    if (isSubjectSelected && topicPerformanceElement) {
      if (currentY + 7 > pageHeight - margin) { pdf.addPage(); currentY = margin; }
      
      const topicImgData = await captureElementAsImage(topicPerformanceElement);
      if (topicImgData) {
        const topicImgProps = pdf.getImageProperties(topicImgData);
        let topicImgHeight = (topicImgProps.height * contentWidth) / topicImgProps.width;
        if (topicImgHeight > pageHeight - margin - currentY - 5) { topicImgHeight = pageHeight - margin - currentY - 5; }
        if (currentY + topicImgHeight > pageHeight - margin) { pdf.addPage(); currentY = margin; }
        pdf.addImage(topicImgData, 'PNG', margin, currentY, contentWidth, topicImgHeight);
        currentY += topicImgHeight + 10;
      }
    }

    // --- Add Activity Chart (always) ---
    if (currentY + 7 > pageHeight - margin) { pdf.addPage(); currentY = margin; }
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Quiz Activity Overview', margin, currentY);
    currentY += 7;
    const activityImgData = await captureChartWithLightModeStyles(activityChartElement);
    if (activityImgData) {
      const activityImgProps = pdf.getImageProperties(activityImgData);
      let activityImgHeight = (activityImgProps.height * contentWidth) / activityImgProps.width;
      if (activityImgHeight > pageHeight - margin - currentY - 5) { activityImgHeight = pageHeight - margin - currentY - 5; }
      if (currentY + activityImgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
          pdf.setFontSize(16);
          pdf.setFont(undefined, 'bold');
          pdf.text('Quiz Activity Overview (Continued)', margin, currentY);
          currentY += 7;
      }
      pdf.addImage(activityImgData, 'PNG', margin, currentY, contentWidth, activityImgHeight);
      currentY += activityImgHeight + 10;
    } else {
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'italic');
        pdf.text('- Could not render activity chart -', margin, currentY);
        currentY += 10;
    }

    // --- Add Subject Averages Chart ONLY if NO specific subject is selected ---
    if (!isSubjectSelected) {
      if (currentY + 7 > pageHeight - margin) { pdf.addPage(); currentY = margin; }
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Average Score by Subject', margin, currentY);
      currentY += 7;

      const subjectImgData = await captureChartWithLightModeStyles(subjectAveragesChartElement);
      if (subjectImgData) {
        const subjectImgProps = pdf.getImageProperties(subjectImgData);
        let subjectImgHeight = (subjectImgProps.height * contentWidth) / subjectImgProps.width;
        if (subjectImgHeight > pageHeight - margin - currentY - 5) { subjectImgHeight = pageHeight - margin - currentY - 5; }
        if (currentY + subjectImgHeight > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('Average Score by Subject (Continued)', margin, currentY);
            currentY += 7;
        }
        pdf.addImage(subjectImgData, 'PNG', margin, currentY, contentWidth, subjectImgHeight);
      } else {
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'italic');
          pdf.text('- Subject averages chart is not applicable for this view or failed to render. -', margin, currentY);
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