// Local dev entry point — Vercel invokes api/index.js as a serverless function
// (no app.listen), so this wrapper boots the same Express app on a real port.
try { require('dotenv').config(); } catch (e) {}
const app = require('./index');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[dev] API server listening on http://localhost:${PORT}`);
});
