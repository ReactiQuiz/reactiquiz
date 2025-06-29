// src/utils/questionsPdfGenerator.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- Import the autoTable function
import apiClient from '../api/axiosInstance';
import { shuffleArray, parseQuestionOptions } from './quizUtils';
import { format } from 'date-fns';

/**
 * Fetches questions based on topic and difficulty.
 */
async function fetchQuestionsForPdf(topicId, difficulty, numQuestions) {
  try {
    const response = await apiClient.get(`/api/questions?topicId=${topicId}`);
    let allQuestions = parseQuestionOptions(response.data);

    if (difficulty !== 'mixed') {
      let minScore = 0, maxScore = Infinity;
      if (difficulty === 'easy') { minScore = 10; maxScore = 13; }
      else if (difficulty === 'medium') { minScore = 14; maxScore = 17; }
      else if (difficulty === 'hard') { minScore = 18; maxScore = 20; }
      const filtered = allQuestions.filter(q => q.difficulty >= minScore && q.difficulty <= maxScore);
      if (filtered.length > 0) allQuestions = filtered;
    }
    return shuffleArray(allQuestions).slice(0, numQuestions);
  } catch (error) {
    console.error("Failed to fetch questions for PDF:", error);
    throw new Error("Could not fetch questions. Please check your connection and try again.");
  }
}

/**
 * Generates and downloads a PDF of quiz questions.
 */
export const generateQuestionsPdf = async (topic, settings) => {
  try {
    const questions = await fetchQuestionsForPdf(topic.id, settings.difficulty, settings.numQuestions);
    if (questions.length === 0) {
      alert("No questions found matching the selected criteria.");
      return;
    }

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - 2 * margin;
    let y = margin;
    let answerKey = [];

    // --- PDF Header ---
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text("ReactiQuiz", pageWidth / 2, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(`Topic: ${topic.name}`, margin, y);
    y += 7;

    const detailsText = `Difficulty: ${settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1)} | Questions: ${questions.length} | Class: ${topic.class || 'N/A'}`;
    doc.text(detailsText, margin, y);
    y += 7;

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Generated on: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, margin, y);
    y += 10;
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // --- Questions Section ---
    questions.forEach((q, index) => {
      const questionTextLines = doc.splitTextToSize(`Q${index + 1}. ${q.text}`, contentWidth);
      const optionsHeight = (q.options.length * 7) + 5;
      const questionBlockHeight = (questionTextLines.length * settings.fontSize * 0.35) + optionsHeight;

      if (y + questionBlockHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      doc.setFontSize(settings.fontSize);
      doc.setTextColor(0);
      doc.setFont(undefined, 'bold');
      doc.text(questionTextLines, margin, y);
      y += (questionTextLines.length * settings.fontSize * 0.35) + 2;

      doc.setFont(undefined, 'normal');
      q.options.forEach(opt => {
        doc.text(`   (${opt.id}) ${opt.text}`, margin + 5, y);
        y += 7;
      });

      const correctAnswer = q.options.find(opt => opt.id === q.correctOptionId);
      if (settings.includeAnswers && !settings.answersAtEnd) {
        doc.setFontSize(settings.fontSize - 2);
        doc.setTextColor(0, 100, 0);
        doc.text(`Answer: (${correctAnswer.id}) ${correctAnswer.text}`, margin + 5, y);
        y += 5;
        if (settings.includeExplanations && q.explanation) {
            doc.setTextColor(100);
            const explanationLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, contentWidth - 5);
            doc.text(explanationLines, margin + 5, y);
            y += (explanationLines.length * (settings.fontSize - 2) * 0.35) + 3;
        }
      }
      if (correctAnswer) {
        answerKey.push({ q: `Q${index + 1}`, ans: `(${correctAnswer.id}) ${correctAnswer.text}` });
      } else {
        answerKey.push({ q: `Q${index + 1}`, ans: `Answer not found.` });
      }
      y += 5;
    });

    // --- Answer Key Section (if at end) ---
    if (settings.includeAnswers && settings.answersAtEnd) {
        if (y + 20 > pageHeight - margin) { doc.addPage(); y = margin; }
        else { y += 10; }
        
        doc.setFontSize(16); doc.setFont(undefined, 'bold'); doc.setTextColor(0);
        doc.text("Answer Key", margin, y);
        
        // --- FIX IS HERE ---
        // Apply the autoTable plugin to the jsPDF instance
        autoTable(doc, {
            startY: y + 8,
            head: [['Question', 'Correct Answer']],
            body: answerKey.map(item => [item.q, item.ans]),
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: settings.fontSize - 2 }
        });
    }

    doc.save(`ReactiQuiz_${topic.name.replace(/\s/g, '_')}.pdf`);
  } catch (error) {
    alert(error.message);
  }
};