/**
 * tests/run_all_tests.js
 * 
 * Master Test Suite Runner for ReactiQuiz
 * Executes all unit and integration test suites, aggregating results and timing.
 */

const suites = [
  require('./unit/api_auth_middleware.test.js'),
  require('./unit/api_utils.test.js'),
  require('./unit/quiz_assembler.test.js'),
  require('./unit/supabase_turso_clients.test.js'),
  require('./unit/routes_subjects_topics.test.js'),
  require('./unit/routes_questions.test.js'),
  require('./unit/routes_users_auth.test.js'),
  require('./unit/routes_quiz_sessions.test.js'),
  require('./unit/routes_results.test.js'),
  require('./unit/routes_friends_challenges.test.js'),
  require('./unit/routes_admin.test.js'),
  require('./unit/routes_notes.test.js'),
  require('./unit/routes_homibhabha_pdf.test.js'),
  require('./unit/routes_contact.test.js'),
  require('./unit/frontend_quiz_utils.test.js'),
  require('./unit/frontend_format_time.test.js'),
  require('./unit/frontend_device_id.test.js'),
  require('./unit/frontend_icon_component.test.js'),
  require('./unit/frontend_theme_tokens.test.js'),
  require('./unit/frontend_analytics_logic.test.js'),
  require('./unit/frontend_subject_colors.test.js'),
  require('./unit/admin_bulk_import_logic.test.js'),
  require('./unit/frontend_notes_parser.test.js'),
];

async function runAllSuites() {
  console.log('\n========================================================');
  console.log('       REACTIQUIZ COMPLETE AUTOMATED TEST SUITE        ');
  console.log('========================================================\n');

  let totalPassed = 0;
  let totalFailed = 0;
  let totalTests = 0;
  const suiteResults = [];

  const overallStartTime = Date.now();

  for (const suite of suites) {
    if (suite && typeof suite.run === 'function') {
      const res = await suite.run();
      totalPassed += res.passed;
      totalFailed += res.failed;
      totalTests += res.total;
      suiteResults.push({
        name: suite.suiteName,
        passed: res.passed,
        failed: res.failed,
        total: res.total,
        elapsed: res.elapsed
      });
    }
  }

  const overallElapsed = Date.now() - overallStartTime;

  console.log('========================================================');
  console.log('                   ALL SUITES SUMMARY                   ');
  console.log('========================================================');
  console.log('| Suite Name                               | Passed | Failed | Time   |');
  console.log('|------------------------------------------|--------|--------|--------|');

  for (const r of suiteResults) {
    const paddedName = r.name.padEnd(40, ' ');
    const paddedPassed = String(r.passed).padStart(6, ' ');
    const paddedFailed = String(r.failed).padStart(6, ' ');
    const paddedTime = `${r.elapsed}ms`.padStart(6, ' ');
    console.log(`| ${paddedName} | ${paddedPassed} | ${paddedFailed} | ${paddedTime} |`);
  }

  console.log('========================================================');
  console.log(` TOTAL: ${totalPassed}/${totalTests} passed (${totalFailed} failed) in ${overallElapsed}ms`);
  console.log('========================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

if (require.main === module || !module.parent || process.env.RUN_TESTS === '1') {
  runAllSuites();
}

module.exports = { runAllSuites };
