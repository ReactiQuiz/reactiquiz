/**
 * tests/unit/frontend_subject_colors.test.js
 * 
 * Unit tests for subject and topic color inheritance from database:
 * - web/src/contexts/SubjectColorsContext.tsx
 * - web/src/components/topics/TopicCard.tsx
 * - web/src/components/topics/SubjectOverviewCard.tsx
 */

const { assert, createSuite } = require('../test_helper');

const suite = createSuite('Subject & Topic Database Color Inheritance');

// Color mapping logic mirroring SubjectColorsContext
function processSubjectColorMap(subjects) {
  const map = {};
  const defaultDark = '#60A5FA';
  const defaultLight = '#2563EB';

  (subjects || []).forEach(subject => {
    const dark = subject.accentColorDark || subject.accentColorLight || defaultDark;
    const light = subject.accentColorLight || subject.accentColorDark || defaultLight;
    const entry = { dark, light };

    if (subject.subjectKey) {
      map[subject.subjectKey] = entry;
      map[subject.subjectKey.toLowerCase()] = entry;
    }
    if (subject.id) {
      map[subject.id] = entry;
      map[subject.id.toLowerCase()] = entry;
    }
    if (subject.name) {
      map[subject.name] = entry;
      map[subject.name.toLowerCase()] = entry;
    }
  });

  return map;
}

function resolveColor(identifier, colorMap, themeMode = 'light') {
  const defaultDark = '#60A5FA';
  const defaultLight = '#2563EB';
  const defaultColor = themeMode === 'dark' ? defaultDark : defaultLight;
  if (!identifier) return defaultColor;

  const trimmed = String(identifier).trim();
  const subjectColors = colorMap[trimmed] || colorMap[trimmed.toLowerCase()];
  if (subjectColors) {
    const modeColor = themeMode === 'dark' ? subjectColors.dark : subjectColors.light;
    return modeColor || subjectColors.dark || subjectColors.light || defaultColor;
  }
  return defaultColor;
}

suite.test('processSubjectColorMap: accurately indexes subjects by subjectKey, id, and name', () => {
  const dbSubjects = [
    {
      id: 'sub_phys_1',
      subjectKey: 'physics',
      name: 'Physics',
      accentColorDark: '#38BDF8',
      accentColorLight: '#0284C7'
    },
    {
      id: 'sub_chem_2',
      subjectKey: 'chemistry',
      name: 'Chemistry',
      accentColorDark: '#34D399',
      accentColorLight: '#059669'
    }
  ];

  const map = processSubjectColorMap(dbSubjects);

  // Accessible by subjectKey
  assert.strictEqual(map['physics'].dark, '#38BDF8');
  assert.strictEqual(map['physics'].light, '#0284C7');

  // Accessible by id
  assert.strictEqual(map['sub_phys_1'].dark, '#38BDF8');

  // Accessible by name (and case-insensitively)
  assert.strictEqual(map['Chemistry'].light, '#059669');
  assert.strictEqual(map['chemistry'].light, '#059669');
});

suite.test('resolveColor: returns database dark color in dark theme mode', () => {
  const map = {
    'biology': { dark: '#4ADE80', light: '#16A34A' }
  };

  const darkColor = resolveColor('biology', map, 'dark');
  assert.strictEqual(darkColor, '#4ADE80');
});

suite.test('resolveColor: returns database light color in light theme mode', () => {
  const map = {
    'biology': { dark: '#4ADE80', light: '#16A34A' }
  };

  const lightColor = resolveColor('biology', map, 'light');
  assert.strictEqual(lightColor, '#16A34A');
});

suite.test('resolveColor: resolves topic subject_id to inherit parent subject color', () => {
  const map = {
    'sub_math_1': { dark: '#A78BFA', light: '#7C3AED' },
    'mathematics': { dark: '#A78BFA', light: '#7C3AED' }
  };

  const topic = {
    id: 'top_algebra_1',
    name: 'Algebra',
    subject_id: 'sub_math_1'
  };

  const topicColorLight = resolveColor(topic.subject_id, map, 'light');
  assert.strictEqual(topicColorLight, '#7C3AED');

  const topicColorDark = resolveColor(topic.subject_id, map, 'dark');
  assert.strictEqual(topicColorDark, '#A78BFA');
});

suite.test('resolveColor: provides fallback base color when subject is not found', () => {
  const map = {};
  const fallback = resolveColor('nonexistent_subject', map, 'light');
  assert.strictEqual(fallback, '#2563EB');
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
