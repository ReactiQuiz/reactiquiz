// src/utils/questionsPdfGenerator.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import apiClient from '../api/axiosInstance';
import { shuffleArray, parseQuestionOptions } from './quizUtils';
import { format } from 'date-fns';

// --- START OF FIX: KaTeX Sanitizer Function ---
/**
 * A helper function to convert common KaTeX/LaTeX syntax into plain text for PDF rendering.
 * @param {string} text - The input string which may contain KaTeX.
 * @returns {string} The sanitized, plain-text string.
 */
const sanitizeKatexForPdf = (text) => {
  if (!text) return '';
  return text
    // Remove block math delimiters ($$)
    .replace(/\$\$(.*?)\$\$/g, '$1')
    // Remove inline math delimiters ($)
    .replace(/\$(.*?)\$/g, '$1')
    // Convert fractions like \frac{a}{b} to a/b
    .replace(/\\frac{(.*?)}{(.*?)}/g, '($1)/($2)')
    // Convert square roots like \sqrt{x} to sqrt(x)
    .replace(/\\sqrt{(.*?)}/g, 'sqrt($1)')
    // Remove LaTeX spacing commands like '\,' or '\ '
    .replace(/\\,/g, ' ')
    .replace(/\\ /g, ' ')
    // Replace escaped backslashes for JSON (\\) with a single one for display
    .replace(/\\\\/g, '\\');
};
// --- END OF FIX ---

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

    // --- PDF Header (Unchanged) ---
    doc.setFontSize(20); doc.setFont(undefined, 'bold');
    doc.text("ReactiQuiz", pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(14); doc.setFont(undefined, 'normal');
    doc.text(`Topic: ${topic.name}`, margin, y);
    y += 7;
    doc.text(`Difficulty: ${settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1)} | Questions: ${questions.length}`, margin, y);
    y += 7;
    doc.setFontSize(10); doc.setTextColor(150);
    doc.text(`Generated on: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, margin, y);
    y += 10;
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // --- Questions Section ---
    questions.forEach((q, index) => {
      // --- START OF FIX: Sanitize all text before rendering ---
      const questionText = sanitizeKatexForPdf(`Q${index + 1}. ${q.text}`);
      const questionTextLines = doc.splitTextToSize(questionText, contentWidth);
      
      const optionsHeight = q.options.reduce((total, opt) => {
          const sanitizedOpt = sanitizeKatexForPdf(`   (${opt.id}) ${opt.text}`);
          return total + (doc.splitTextToSize(sanitizedOpt, contentWidth - 5).length * 7);
      }, 5);

      const questionBlockHeight = (questionTextLines.length * settings.fontSize * 0.35) + optionsHeight;

      if (y + questionBlockHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      doc.setFontSize(settings.fontSize); doc.setTextColor(0); doc.setFont(undefined, 'bold');
      doc.text(questionTextLines, margin, y);
      y += (questionTextLines.length * settings.fontSize * 0.35) + 2;

      doc.setFont(undefined, 'normal');
      q.options.forEach(opt => {
        const optionText = sanitizeKatexForPdf(`   (${opt.id}) ${opt.text}`);
        const optionLines = doc.splitTextToSize(optionText, contentWidth - 5);
        doc.text(optionLines, margin + 5, y);
        y += (optionLines.length * 7);
      });

      const correctAnswer = q.options.find(opt => opt.id === q.correctOptionId);
      if (settings.includeAnswers && !settings.answersAtEnd) {
        doc.setFontSize(settings.fontSize - 2); doc.setTextColor(0, 100, 0);
        const answerText = sanitizeKatexForPdf(`Answer: (${correctAnswer.id}) ${correctAnswer.text}`);
        doc.text(answerText, margin + 5, y);
        y += 5;
        if (settings.includeExplanations && q.explanation) {
            doc.setTextColor(100);
            const explanationText = sanitizeKatexForPdf(`Explanation: ${q.explanation}`);
            const explanationLines = doc.splitTextToSize(explanationText, contentWidth - 5);
            doc.text(explanationLines, margin + 5, y);
            y += (explanationLines.length * (settings.fontSize - 2) * 0.35) + 3;
        }
      }
      
      if (correctAnswer) {
        const answerTextForKey = sanitizeKatexForPdf(`(${correctAnswer.id}) ${correctAnswer.text}`);
        answerKey.push({ q: `Q${index + 1}`, ans: answerTextForKey });
      } else {
        answerKey.push({ q: `Q${index + 1}`, ans: `Answer not found.` });
      }
      // --- END OF FIX ---
      y += 5;
    });

    // --- Answer Key Section (Unchanged logic, but uses sanitized data) ---
    if (settings.includeAnswers && settings.answersAtEnd) {
        if (y + 20 > pageHeight - margin) { doc.addPage(); y = margin; }
        else { y += 10; }
        
        doc.setFontSize(16); doc.setFont(undefined, 'bold'); doc.setTextColor(0);
        doc.text("Answer Key", margin, y);
        
        autoTable(doc, {
            startY: y + 8,
            head: [['Question', 'Correct Answer']],
            body: answerKey.map(item => [item.q, item.ans]), // 'ans' is already sanitized
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