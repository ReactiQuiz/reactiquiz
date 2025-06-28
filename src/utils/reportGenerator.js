// src/utils/reportGenerator.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { Chart } from 'chart.js';

const captureChartWithLightModeStyles = async (element) => {
  if (!element) return null;
  const canvas = element.querySelector('canvas');
  if (!canvas) {
    console.error("Could not find a canvas element within the provided element for PDF generation.");
    return null;
  }
  const chartInstance = Chart.getChart(canvas);
  if (!chartInstance) {
    console.error("Could not get Chart.js instance from the canvas.");
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
 * Generates and triggers the download of a PDF report for the user's dashboard.
 * @param {object} reportData - The data needed to generate the report.
 * @param {object} reportData.currentUser - The logged-in user object.
 * @param {object} reportData.overallStats - The calculated overall performance stats.
 * @param {HTMLElement} reportData.activityChartElement - The DOM element of the activity chart wrapper.
 * @param {HTMLElement} reportData.subjectAveragesChartElement - The DOM element of the subject averages chart wrapper.
 * @param {string} reportData.timeFrequencyLabel - The string label for the selected time period (e.g., "Last 30 Days").
 * @returns {Promise<boolean>} A promise that resolves to true on success, false on failure.
 */
export const generateDashboardPdfReport = async ({
  currentUser,
  overallStats,
  activityChartElement,
  subjectAveragesChartElement,
  timeFrequencyLabel
}) => {
  if (!currentUser) {
    alert("User data not available for report.");
    return false;
  }

  if (!activityChartElement || !subjectAveragesChartElement) {
    alert("Chart elements not found or not ready. Cannot generate PDF.");
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
    pdf.setFontSize(22); pdf.setFont(undefined, 'bold');
    pdf.text('ReactiQuiz User Analytics Report', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
    pdf.setFontSize(14); pdf.setFont(undefined, 'normal');
    pdf.text(`User: ${currentUser.name || 'N/A'}`, margin, currentY); currentY += 7;
    pdf.text(`Report Generated: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, margin, currentY); currentY += 7;
    pdf.text(`Time Period: ${timeFrequencyLabel}`, margin, currentY); currentY += 10;

    // --- Overall Stats ---
    pdf.setFontSize(16); pdf.setFont(undefined, 'bold');
    pdf.text('Overall Performance', margin, currentY); currentY += 7;
    pdf.setFontSize(12); pdf.setFont(undefined, 'normal');
    pdf.text(`- Total Quizzes Solved: ${overallStats.totalQuizzes}`, margin + 5, currentY); currentY += 6;
    pdf.text(`- Overall Average Score: ${overallStats.overallAverageScore}%`, margin + 5, currentY); currentY += 10;

    // --- Capture Activity Chart ---
    if (currentY + 7 > pageHeight - margin) { pdf.addPage(); currentY = margin; }
    pdf.setFontSize(16); pdf.setFont(undefined, 'bold');
    pdf.text('Quiz Activity Overview', margin, currentY); currentY += 7;

    const activityImgData = await captureChartWithLightModeStyles(activityChartElement);
    if (activityImgData) {
      const activityImgProps = pdf.getImageProperties(activityImgData);
      let activityImgHeight = (activityImgProps.height * contentWidth) / activityImgProps.width;
      if (activityImgHeight > pageHeight - margin - currentY - 5) { activityImgHeight = pageHeight - margin - currentY - 5; }
      if (currentY + activityImgHeight > pageHeight - margin) {
          pdf.addPage(); currentY = margin;
          pdf.setFontSize(16); pdf.setFont(undefined, 'bold'); pdf.text('Quiz Activity Overview (Continued)', margin, currentY); currentY += 7;
      }
      pdf.addImage(activityImgData, 'PNG', margin, currentY, contentWidth, activityImgHeight);
      currentY += activityImgHeight + 10;
    }

    // --- Capture Subject Averages Chart ---
    if (currentY + 7 > pageHeight - margin) { pdf.addPage(); currentY = margin; }
    pdf.setFontSize(16); pdf.setFont(undefined, 'bold');
    pdf.text('Average Score by Subject', margin, currentY); currentY += 7;

    const subjectImgData = await captureChartWithLightModeStyles(subjectAveragesChartElement);
    if (subjectImgData) {
      const subjectImgProps = pdf.getImageProperties(subjectImgData);
      let subjectImgHeight = (subjectImgProps.height * contentWidth) / subjectImgProps.width;
      if (subjectImgHeight > pageHeight - margin - currentY - 5) { subjectImgHeight = pageHeight - margin - currentY - 5; }
      if (currentY + subjectImgHeight > pageHeight - margin) {
          pdf.addPage(); currentY = margin;
          pdf.setFontSize(16); pdf.setFont(undefined, 'bold'); pdf.text('Average Score by Subject (Continued)', margin, currentY); currentY += 7;
      }
      pdf.addImage(subjectImgData, 'PNG', margin, currentY, contentWidth, subjectImgHeight);
    }

    pdf.save(`ReactiQuiz_Report_${currentUser.name}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating PDF report:", error);
    alert("Failed to generate PDF report. See console for details.");
    return false;
  }
};