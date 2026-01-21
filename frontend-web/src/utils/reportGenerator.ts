// src/utils/reportGenerator.ts
/**
 * Report Generator Utilities
 * 
 * This file provides functionality for generating PDF reports from dashboard data.
 * It includes functions for capturing Chart.js charts and DOM elements as images,
 * applying light-mode styling for PDF compatibility, and generating comprehensive
 * performance reports with tables, charts, and statistics.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Chart } from 'chart.js';
import { User, DashboardStats, Subject } from '../types';

/**
 * jsPDF Module Extension
 * 
 * Extends jsPDF type definitions to include lastAutoTable property
 * that is added by jspdf-autotable plugin.
 */
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number; // Final Y position after last table render
    };
  }
}

/**
 * A helper function that temporarily restyles a Chart.js chart for a high-contrast, light-mode PDF,
 * captures it using html2canvas, and then restores its original styles.
 * @param {HTMLElement} element - The DOM element that wraps the chart canvas.
 * @returns {Promise<string|null>} A promise that resolves to a base64 image data URL or null.
 */
const captureChartWithLightModeStyles = async (element: HTMLElement | null): Promise<string | null> => {
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
  const paperElement = element.querySelector('.MuiPaper-root') as HTMLElement;
  const originalPaperBg = paperElement ? paperElement.style.backgroundColor : '';

  // --- START OF FIX 1: Store original dataset colors ---
  const originalDatasetColors: Array<{
    backgroundColor: any;
    borderColor: any;
    pointBackgroundColor?: any;
    pointBorderColor?: any;
  }> = [];
  chartInstance.data.datasets.forEach(dataset => {
    originalDatasetColors.push({
      backgroundColor: dataset.backgroundColor,
      borderColor: dataset.borderColor,
      pointBackgroundColor: (dataset as any).pointBackgroundColor,
      pointBorderColor: (dataset as any).pointBorderColor,
    });
  });
  // --- END OF FIX 1 ---

  try {
    const blackColor = '#000000';
    const lightModeGridColor = '#d1d1d1';

    // Apply high-contrast styles to the chart instance
    if (chartInstance.options.plugins?.legend) (chartInstance.options.plugins.legend as any).labels.color = blackColor;
    if (chartInstance.options.plugins?.title) (chartInstance.options.plugins.title as any).color = blackColor;
    if (chartInstance.options.scales?.x) {
      (chartInstance.options.scales.x as any).title.color = blackColor;
      (chartInstance.options.scales.x as any).ticks.color = blackColor;
      (chartInstance.options.scales.x as any).grid.color = lightModeGridColor;
    }
    if (chartInstance.options.scales?.y) {
      (chartInstance.options.scales.y as any).title.color = blackColor;
      (chartInstance.options.scales.y as any).ticks.color = blackColor;
      (chartInstance.options.scales.y as any).grid.color = lightModeGridColor;
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
  } catch (error: any) {
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
      const colorData = originalDatasetColors[index];
      if (colorData) {
        dataset.backgroundColor = colorData.backgroundColor;
        dataset.borderColor = colorData.borderColor;
        (dataset as any).pointBackgroundColor = colorData.pointBackgroundColor;
        (dataset as any).pointBorderColor = colorData.pointBorderColor;
      }
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
const captureElementAsImage = async (element: HTMLElement | null): Promise<string | null> => {
  if (!element) return null;

  const paperElement = element.querySelector('.MuiPaper-root') as HTMLElement;
  const originalPaperBg = paperElement ? paperElement.style.backgroundColor : '';
  const textElements = element.querySelectorAll('.MuiTypography-root, .MuiListItemText-primary, .MuiListItemText-secondary');
  const originalTextColors: Array<{ element: HTMLElement; color: string }> = [];

  // --- START OF FIX 2: Find title and store its original size ---
  const titleElement = element.querySelector('.MuiTypography-h6') as HTMLElement;
  let originalTitleSize = '';
  if (titleElement) {
    originalTitleSize = titleElement.style.fontSize;
  }
  // --- END OF FIX 2 ---

  try {
    if (paperElement) paperElement.style.backgroundColor = 'transparent';
    textElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      originalTextColors.push({ element: htmlEl, color: htmlEl.style.color });
      htmlEl.style.color = '#000000';
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
  } catch (error: any) {
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


/**
 * Generate Dashboard PDF Report Parameters Interface
 * 
 * Defines all required parameters for generating a dashboard PDF report.
 */
interface GenerateDashboardPdfReportParams {
  currentUser: User; // User data for report header
  processedStats: DashboardStats; // Processed dashboard statistics
  activityChartRef: HTMLDivElement | null; // Reference to activity chart element
  rollingAverageChartRef: HTMLDivElement | null; // Reference to rolling average chart
  difficultyBreakdownChartRef: HTMLDivElement | null; // Reference to difficulty breakdown chart
  topicPerformanceRef: HTMLDivElement | null; // Reference to topic performance element
  allSubjects: Subject[]; // All available subjects for reference
  timeFrequencyLabel: string; // Label for time filter (e.g., "Last 30 Days")
  selectedSubject: string; // Currently selected subject filter
}

/**
 * Generate Dashboard PDF Report
 * 
 * Generates a comprehensive PDF report from dashboard analytics data.
 * Includes header, overall KPIs, difficulty breakdown charts, subject performance
 * tables, rolling average charts, activity charts, and topic performance data.
 * 
 * Process:
 * 1. Validates user and stats data
 * 2. Creates PDF document (A4 portrait)
 * 3. Adds header with user info and timestamp
 * 4. Adds overall performance summary table
 * 5. Captures and adds charts as images (with light-mode styling)
 * 6. Adds subject performance tables
 * 7. Adds topic performance (if single subject selected)
 * 8. Saves PDF file with timestamped filename
 * 
 * @param {GenerateDashboardPdfReportParams} params - Report generation parameters
 * @returns {Promise<boolean>} True if report generated successfully, false otherwise
 */
export const generateDashboardPdfReport = async ({
  currentUser,
  processedStats,
  activityChartRef,
  rollingAverageChartRef,
  difficultyBreakdownChartRef,
  topicPerformanceRef,
  allSubjects,
  timeFrequencyLabel,
  selectedSubject
}: GenerateDashboardPdfReportParams): Promise<boolean> => {
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
    pdf.setFontSize(22); pdf.setFont('helvetica', 'bold');
    pdf.text('ReactiQuiz Performance Report', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
    pdf.setFontSize(14); pdf.setFont('helvetica', 'normal');
    pdf.text(`User: ${currentUser.name || 'N/A'}`, margin, currentY); currentY += 7;
    pdf.text(`Report Generated: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, margin, currentY); currentY += 7;
    pdf.text(`Time Period: ${timeFrequencyLabel}`, margin, currentY); currentY += 10;
    
    pdf.setFontSize(16); pdf.setFont('helvetica', 'bold');
    pdf.text('Overall Performance Summary', margin, currentY); currentY += 8;
    
    // Using jspdf-autotable for a clean table layout
    autoTable(pdf, {
        startY: currentY,
        head: [['Metric', 'Value']],
        body: [
            ['Total Quizzes Solved', processedStats.totalQuizzes],
            ['Overall Average Score', `${(Number(processedStats.overallAverageScore) || 0).toFixed(1)}%`],
            ['Total Questions Answered', processedStats.overallQuestionStats.total],
            ['Total Correct Answers', processedStats.overallQuestionStats.correct],
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
    });
    currentY = pdf.lastAutoTable.finalY + 10;

    // --- Section 2: Difficulty Breakdown (if applicable) ---
    if (selectedSubject === 'all' && difficultyBreakdownChartRef) {
        if (currentY + 70 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); currentY = margin; }
        const chartImg = await captureChartWithLightModeStyles(difficultyBreakdownChartRef);
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
        pdf.setFontSize(16); pdf.setFont('helvetica', 'bold');
        pdf.text('Performance by Subject', margin, currentY); currentY += 8;
        
        const subjectBody = Object.entries(processedStats.subjectBreakdowns || {}).map(([key, data]: any) => [
            data.name,
            data.count,
            `${(Number(data.average) || 0).toFixed(1)}%`,
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
    if (rollingAverageChartRef) {
        if (currentY + 70 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); currentY = margin; }
        const chartImg = await captureChartWithLightModeStyles(rollingAverageChartRef);
        if (chartImg) {
            const imgProps = pdf.getImageProperties(chartImg);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
            pdf.addImage(chartImg, 'PNG', margin, currentY, contentWidth, imgHeight);
            currentY += imgHeight + 10;
        }
    }

    // --- Section 5: Activity Chart ---
    if (activityChartRef) {
        if (currentY + 70 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); currentY = margin; }
        const chartImg = await captureChartWithLightModeStyles(activityChartRef);
        if (chartImg) {
            const imgProps = pdf.getImageProperties(chartImg);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
            pdf.addImage(chartImg, 'PNG', margin, currentY, contentWidth, imgHeight);
            currentY += imgHeight + 10;
        }
    }

    // --- Section 6: Topic Performance (if viewing a single subject) ---
    if (selectedSubject !== 'all' && topicPerformanceRef) {
        if (currentY + 50 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); currentY = margin; }
        const topicImg = await captureElementAsImage(topicPerformanceRef);
        if (topicImg) {
            const imgProps = pdf.getImageProperties(topicImg);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
            pdf.addImage(topicImg, 'PNG', margin, currentY, contentWidth, imgHeight);
            currentY += imgHeight + 10;
        }
    }

    pdf.save(`ReactiQuiz_Report_${currentUser.name}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    return true;
  } catch (error: any) {
    console.error("Error generating PDF report:", error);
    alert("Failed to generate PDF report. See console for details.");
    return false;
  }
};