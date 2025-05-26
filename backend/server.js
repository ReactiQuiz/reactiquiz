const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const app = express();
const port = process.env.SERVER_PORT || 3001;
const projectRoot = path.resolve(__dirname, '../');
const RESULTS_FILE_PATH = process.env.JSON_RESULTS_FILE
  ? path.resolve(projectRoot, process.env.JSON_RESULTS_FILE.startsWith('./') ? process.env.JSON_RESULTS_FILE.substring(2) : process.env.JSON_RESULTS_FILE)
  : path.join(__dirname, 'results.json');


console.log(`[INIT] Backend starting...`);
console.log(`[INIT] Resolved RESULTS_FILE_PATH: ${RESULTS_FILE_PATH}`);

app.use(cors());
app.use(express.json({ limit: '5mb' })); // Increase limit if quiz data is large

async function ensureResultsFileExists() {
  try {
    await fs.access(RESULTS_FILE_PATH);
    console.log(`[JSON_DB] Results file found at ${RESULTS_FILE_PATH}.`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`[JSON_DB] Results file not found. Creating ${RESULTS_FILE_PATH} with an empty array.`);
      try {
        await fs.writeFile(RESULTS_FILE_PATH, JSON.stringify([]), 'utf8');
        console.log(`[JSON_DB] Successfully created ${RESULTS_FILE_PATH}.`);
        return true;
      } catch (writeError) {
        console.error(`[JSON_DB] CRITICAL ERROR: Could not create results file ${RESULTS_FILE_PATH}:`, writeError);
        return false;
      }
    } else {
      console.error(`[JSON_DB] CRITICAL ERROR: Error accessing results file ${RESULTS_FILE_PATH}:`, error);
      return false;
    }
  }
}

async function readResults() {
  if (!await ensureResultsFileExists()) {
    throw new Error("Results file is not accessible or couldn't be created.");
  }
  try {
    const data = await fs.readFile(RESULTS_FILE_PATH, 'utf8');
    if (data.trim() === '') {
      console.log("[JSON_DB] Results file is empty, returning empty array.");
      return [];
    } 
    return JSON.parse(data);
  } catch (error) {
    console.error('[JSON_DB] Error reading or parsing results file:', error);
    throw new Error(`Could not read or parse results file: ${error.message}`);
  }
}

async function writeResults(resultsData) {
  if (!await ensureResultsFileExists()) {
    throw new Error("Results file is not accessible or couldn't be created for writing.");
  }
  try {
    await fs.writeFile(RESULTS_FILE_PATH, JSON.stringify(resultsData, null, 2), 'utf8');
    console.log(`[JSON_DB] Successfully wrote ${resultsData.length} records to ${RESULTS_FILE_PATH}.`);
  } catch (error) {
    console.error('[JSON_DB] Error writing results file:', error);
    throw error;
  }
}

app.post('/api/results', async (req, res) => {
  console.log('[SERVER] POST /api/results - Request body received.');
  const newResultData = req.body;

  if (!newResultData.subject || !newResultData.topicId || newResultData.score == null ||
    newResultData.totalQuestions == null || newResultData.percentage == null || !newResultData.timestamp ||
    !newResultData.questionsAttempted || !Array.isArray(newResultData.questionsAttempted) ||
    !newResultData.userAnswersSnapshot || typeof newResultData.userAnswersSnapshot !== 'object'
  ) {
    console.error('[SERVER] POST /api/results - Bad Request: Missing required fields, including detailed quiz data.');
    return res.status(400).json({ message: 'Missing required fields for saving result, including questions attempted and user answers.' });
  }
  if (newResultData.questionsAttempted.length === 0) {
    console.error('[SERVER] POST /api/results - Bad Request: questionsAttempted array is empty.');
    return res.status(400).json({ message: 'questionsAttempted array cannot be empty.' });
  }

  try {
    const currentResults = await readResults();
    const resultToSave = {
      id: currentResults.length > 0 ? Math.max(0, ...currentResults.map(r => r.id || 0)) + 1 : 1,
      subject: newResultData.subject,
      topicId: newResultData.topicId,
      score: newResultData.score,
      totalQuestions: newResultData.totalQuestions,
      percentage: newResultData.percentage,
      timestamp: newResultData.timestamp,
      difficulty: newResultData.difficulty,
      numQuestionsConfigured: newResultData.numQuestionsConfigured,
      class: newResultData.class, // Save class
      timeTaken: newResultData.timeTaken, // Save timeTaken
      questionsAttempted: newResultData.questionsAttempted,
      userAnswersSnapshot: newResultData.userAnswersSnapshot
    };

    currentResults.push(resultToSave);
    await writeResults(currentResults);

    console.log(`[SERVER] POST /api/results - Success: Result added with ID ${resultToSave.id}. Total results: ${currentResults.length}`);
    res.status(201).json({ message: 'Result saved successfully!', id: resultToSave.id });
  } catch (error) {
    console.error('[SERVER] POST /api/results - Error during save process:', error);
    res.status(500).json({ message: `Failed to save result: ${error.message}` });
  }
});

app.get('/api/results', async (req, res) => {
  console.log('[SERVER] GET /api/results - Request received.');
  try {
    const results = await readResults();
    const sortedResults = results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    console.log(`[SERVER] GET /api/results - Success: Fetched ${sortedResults.length} historical results.`);
    res.json(sortedResults);
  } catch (error) {
    console.error('[SERVER] GET /api/results - Error during fetch process:', error);
    res.status(500).json({ message: `Failed to fetch results: ${error.message}` });
  }
});

app.delete('/api/results/:id', async (req, res) => {
  const resultIdToDelete = parseInt(req.params.id, 10);
  console.log(`[SERVER] DELETE /api/results/${resultIdToDelete} - Request received.`);

  if (isNaN(resultIdToDelete)) {
    console.error('[SERVER] DELETE /api/results - Bad Request: Invalid ID format.');
    return res.status(400).json({ message: 'Invalid result ID format.' });
  }

  try {
    let currentResults = await readResults();
    const resultIndex = currentResults.findIndex(r => r.id === resultIdToDelete);

    if (resultIndex === -1) {
      console.warn(`[SERVER] DELETE /api/results - Not Found: Result with ID ${resultIdToDelete} not found.`);
      return res.status(404).json({ message: 'Result not found.' });
    }

    currentResults.splice(resultIndex, 1);
    await writeResults(currentResults);

    console.log(`[SERVER] DELETE /api/results - Success: Result with ID ${resultIdToDelete} deleted. Remaining results: ${currentResults.length}`);
    res.status(200).json({ message: 'Result deleted successfully.' });
  } catch (error) {
    console.error(`[SERVER] DELETE /api/results - Error during delete process for ID ${resultIdToDelete}:`, error);
    res.status(500).json({ message: `Failed to delete result: ${error.message}` });
  }
});

ensureResultsFileExists().then(() => {
  app.listen(port, () => {
    console.log(`[SERVER] Backend server (JSON file) running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error("[SERVER] Failed to initialize and start server:", err);
  process.exit(1);
});