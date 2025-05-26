// backend/server.js
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


console.log(`[INIT] Backend API server starting on port ${port}...`);
console.log(`[INIT] Resolved RESULTS_FILE_PATH: ${RESULTS_FILE_PATH}`);

app.use(cors());
app.use(express.json({ limit: '5mb' })); // Reduced limit as we are saving less data per result

// --- Helper Functions (ensureResultsFileExists, readResults, writeResults - no changes from previous correct version) ---
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
    console.error("[JSON_DB] readResults: ensureResultsFileExists returned false.");
    return [];
  }
  try {
    const data = await fs.readFile(RESULTS_FILE_PATH, 'utf8');
    if (data.trim() === '') {
      console.log("[JSON_DB] Results file is empty, returning empty array.");
      return [];
    }
    const parsedData = JSON.parse(data);
    if (!Array.isArray(parsedData)) {
      console.error('[JSON_DB] Parsed results file is not an array. File content:', data, 'Returning empty array.');
      return [];
    }
    return parsedData;
  } catch (error) {
    console.error('[JSON_DB] Error reading or parsing results file:', error, 'Returning empty array.');
    return [];
  }
}

async function writeResults(resultsData) {
  if (!await ensureResultsFileExists()) {
    console.error("[JSON_DB] writeResults: Cannot write, results file not accessible and couldn't be created.");
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
// --- End Helper Functions ---


app.post('/api/results', async (req, res) => {
  console.log('[API /api/results POST] Request received. Body keys:', Object.keys(req.body));
  const newResultData = req.body;

  // Validate required fields
  const requiredFields = [
    'subject', 'topicId', 'score', 'totalQuestions', 'percentage', 
    'timestamp', 'questionsActuallyAttemptedIds', 'userAnswersSnapshot' // Changed from questionsAttempted
  ];
  const missingFields = requiredFields.filter(field => newResultData[field] == null);

  if (missingFields.length > 0) {
    const message = `Bad Request: Missing required fields: ${missingFields.join(', ')}.`;
    console.error(`[API /api/results POST] ${message}`);
    return res.status(400).json({ message });
  }

  if (!Array.isArray(newResultData.questionsActuallyAttemptedIds) || newResultData.questionsActuallyAttemptedIds.length === 0) {
    const message = 'Bad Request: questionsActuallyAttemptedIds array cannot be empty or must be an array.';
    console.error(`[API /api/results POST] ${message}`);
    return res.status(400).json({ message });
  }
   if (typeof newResultData.userAnswersSnapshot !== 'object' || newResultData.userAnswersSnapshot === null) {
    const message = 'Bad Request: userAnswersSnapshot must be an object.';
    console.error(`[API /api/results POST] ${message}`);
    return res.status(400).json({ message });
  }

  try {
    const currentResults = await readResults();
    if (!Array.isArray(currentResults)) {
        console.error('[API /api/results POST] readResults did not return an array. Aborting save.');
        return res.status(500).json({ message: 'Internal server error: Failed to read existing results correctly.' });
    }

    const resultToSave = {
      id: currentResults.length > 0 ? Math.max(0, ...currentResults.map(r => r.id || 0)) + 1 : 1,
      subject: newResultData.subject,
      topicId: newResultData.topicId,
      score: newResultData.score,
      totalQuestions: newResultData.totalQuestions, // This is the number of questions in the quiz instance
      percentage: newResultData.percentage,
      timestamp: newResultData.timestamp,
      difficulty: newResultData.difficulty, // Optional
      numQuestionsConfigured: newResultData.numQuestionsConfigured, // Optional, how many user requested
      class: newResultData.class, // Optional
      timeTaken: newResultData.timeTaken, // Optional
      // Store only IDs of questions that were part of this specific quiz instance
      questionsActuallyAttemptedIds: newResultData.questionsActuallyAttemptedIds,
      // userAnswersSnapshot will contain answers only for these IDs
      userAnswersSnapshot: newResultData.userAnswersSnapshot
    };

    currentResults.push(resultToSave);
    await writeResults(currentResults);

    console.log(`[API /api/results POST] Success: Result added with ID ${resultToSave.id}. Total results: ${currentResults.length}`);
    res.status(201).json({ message: 'Result saved successfully!', id: resultToSave.id });
  } catch (error) {
    console.error('[API /api/results POST] Error during save process:', error);
    res.status(500).json({ message: `Failed to save result: ${error.message || 'Unknown server error'}` });
  }
});

app.get('/api/results', async (req, res) => {
  console.log('[API /api/results GET] Request received.');
  try {
    const results = await readResults();
    if (!Array.isArray(results)) {
        console.error('[API /api/results GET] readResults did not return an array. Sending empty array.');
        return res.json([]);
    }
    const sortedResults = results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    console.log(`[API /api/results GET] Success: Fetched ${sortedResults.length} results.`);
    res.json(sortedResults);
  } catch (error) {
    console.error('[API /api/results GET] Error during fetch process:', error);
    res.status(500).json({ message: `Failed to fetch results: ${error.message || 'Unknown server error'}` });
  }
});

app.delete('/api/results/:id', async (req, res) => {
  const resultIdToDelete = parseInt(req.params.id, 10);
  console.log(`[API /api/results DELETE] Request received for ID: ${resultIdToDelete}.`);

  if (isNaN(resultIdToDelete)) {
    const message = 'Bad Request: Invalid result ID format.';
    console.error(`[API /api/results DELETE] ${message}`);
    return res.status(400).json({ message });
  }

  try {
    let currentResults = await readResults();
     if (!Array.isArray(currentResults)) {
        console.error('[API /api/results DELETE] readResults did not return an array. Aborting delete.');
        return res.status(500).json({ message: 'Internal server error: Failed to read existing results correctly.' });
    }
    const resultIndex = currentResults.findIndex(r => r.id === resultIdToDelete);

    if (resultIndex === -1) {
      const message = `Result with ID ${resultIdToDelete} not found.`;
      console.warn(`[API /api/results DELETE] ${message}`);
      return res.status(404).json({ message });
    }

    currentResults.splice(resultIndex, 1);
    await writeResults(currentResults);

    console.log(`[API /api/results DELETE] Success: Result ID ${resultIdToDelete} deleted. Remaining: ${currentResults.length}`);
    res.status(200).json({ message: 'Result deleted successfully.' });
  } catch (error) {
    console.error(`[API /api/results DELETE] Error for ID ${resultIdToDelete}:`, error);
    res.status(500).json({ message: `Failed to delete result: ${error.message || 'Unknown server error'}` });
  }
});


ensureResultsFileExists().then(() => {
  app.listen(port, () => {
    console.log(`[SERVER] Backend API server running on http://localhost:${port}`);
    console.log(`[SERVER] Ensure your frontend (React Dev Server) is running, likely on http://localhost:3000`);
  });
}).catch(err => {
  console.error("[SERVER] Failed to initialize and start backend API server:", err);
  process.exit(1);
});