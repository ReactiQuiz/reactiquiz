// Local development server launcher
const app = require('./index');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`ReactiQuiz API listening on http://localhost:${PORT}`);
});


