// src/utils/questionsPdfGenerator.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '../theme';
import React from 'react';
import apiClient from '../api/axiosInstance';
import { shuffleArray, parseQuestionOptions } from './quizUtils';
import { format } from 'date-fns';
import MarkdownRenderer from '../components/shared/MarkdownRenderer';

const sanitizeKatexForPdfText = (text) => {
  if (!text) return '';
  return text
    .replace(/\$\$(.*?)\$\$/g, '$1').replace(/\$(.*?)\$/g, '$1')
    .replace(/\\frac{(.*?)}{(.*?)}/g, '($1)/($2)')
    .replace(/\\sqrt{(.*?)}/g, 'sqrt($1)')
    .replace(/\\times/g, 'x').replace(/\\Delta/g, 'Δ')
    .replace(/\\,/g, ' ').replace(/\\ /g, ' ')
    .replace(/\\\\/g, '\\');
};

const PrintableContent = ({ questions, topic, settings }) => (
    <ThemeProvider theme={darkTheme}>
        <div style={{ padding: '20px', backgroundColor: '#fff', color: '#000', width: '210mm' }}>
            <h1 style={{ textAlign: 'center', fontSize: '24px' }}>ReactiQuiz</h1>
            <p style={{ fontSize: '14px' }}><strong>Topic:</strong> {topic.name}</p>
            <p style={{ fontSize: '14px' }}>
                <strong>Difficulty:</strong> {settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1)} | 
                <strong> Questions:</strong> {questions.length} | 
                <strong> Class:</strong> {topic.class || 'N/A'}
            </p>
            <p style={{ fontSize: '10px', color: '#888' }}>Generated on: {format(new Date(), 'MMM d, yyyy HH:mm')}</p>
            <hr />
            {questions.map((q, index) => (
                <div key={q.id} style={{ marginBottom: '15px' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '12px' }}>
                        <MarkdownRenderer text={`Q${index + 1}. ${q.text}`} />
                    </p>
                    <ul style={{ listStyleType: 'none', paddingLeft: '20px', fontSize: '12px' }}>
                        {q.options.map(opt => (
                            // --- START OF FIX: Added vertical margin to each list item ---
                            <li key={opt.id} style={{ marginBottom: '8px' }}> 
                            // --- END OF FIX ---
                                <MarkdownRenderer text={`(${opt.id}) ${opt.text}`} />
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    </ThemeProvider>
);

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
  const questions = await fetchQuestionsForPdf(topic.id, settings.difficulty, settings.numQuestions);
  if (questions.length === 0) {
    alert("No questions found matching the selected criteria.");
    return;
  }

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    await new Promise(resolve => {
        root.render(<PrintableContent questions={questions} topic={topic} settings={settings} />);
        setTimeout(resolve, 500);
    });

    const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
    });

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    if (settings.includeAnswers) {
        doc.addPage();
        doc.setFontSize(16); doc.setFont(undefined, 'bold');
        doc.text("Answer Key", 15, 20);
        const answerKey = questions.map((q, index) => {
            const correctAnswer = q.options.find(opt => opt.id === q.correctOptionId);
            const answerText = correctAnswer ? `(${correctAnswer.id}) ${correctAnswer.text}` : 'Answer not found.';
            return {
                q: `Q${index + 1}`,
                ans: sanitizeKatexForPdfText(answerText),
                exp: settings.includeExplanations ? sanitizeKatexForPdfText(q.explanation) : ''
            };
        });
        autoTable(doc, {
            startY: 28,
            head: [['Question', 'Correct Answer', 'Explanation']],
            body: answerKey.map(item => [item.q, item.ans, item.exp]),
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: settings.fontSize - 2 },
            columnStyles: { 2: { cellWidth: 'auto' } }
        });
    }

    doc.save(`ReactiQuiz_${topic.name.replace(/\s/g, '_')}.pdf`);

  } catch (error) {
    alert(`Failed to generate PDF: ${error.message}`);
    console.error("PDF Generation Error:", error);
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
};