# ReactiQuiz Content Creation & Data Schema Guide

This document provides the complete structural, functional, and technical specifications required to create or recreate **Subjects**, **Topics**, **Questions**, and **Chapter Notes** for ReactiQuiz. Use this guide when generating curriculum content with an AI agent or preparing bulk import JSON files for the Admin Panel.

---

## 1. Entity Hierarchy & Relationship Overview

ReactiQuiz content follows a relational hierarchy where subjects encompass topics, which in turn contain multiple-choice questions and comprehensive chapter study notes:

```
[Subject] (e.g. subjectKey: "chemistry")
   └── [Topic] (e.g. id: "acids-bases-and-salts-9th", subject_id: "chemistry")
         ├── [TopicNote] (1-to-1 relation, topicId: "acids-bases-and-salts-9th")
         └── [Question] (1-to-N relation, topicId: "acids-bases-and-salts-9th")
```

1. **Subjects** (Top level): High-level academic disciplines (e.g., `physics`, `chemistry`, `biology`, `mathematics`, `gk`, `general`).
2. **Topics** (Mid level): Chapter or module units belonging to a Subject and targeted at a specific academic class (e.g., `acids-bases-and-salts-9th`). Linked via `subject_id`.
3. **Chapter Notes** (Topic level, 1-to-1): Ready-made 1–2 page study guides formatted in Markdown with LaTeX math, Mermaid diagrams, comparison tables, and callouts. Linked via `topicId`.
4. **Questions** (Leaf level, 1-to-N): Multiple-choice questions belonging to a Topic. Linked via `topicId`.

---

## 2. Structural Specifications & JSON Schemas

### 2.1 Subjects Schema

A **Subject** defines a broad category under which topics are grouped.

#### JSON Field Specifications

| Field Name | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | **Yes** | Display title of the subject. | `"Chemistry"` |
| `subjectKey` | String | **Yes** | Unique slug/ID for the subject (kebab-case, alphanumeric). Serves as primary key `id`. | `"chemistry"` |
| `description` | String | No | Short overview of what the subject covers. | `"Study of matter, elements, and reactions."` |
| `displayOrder` | Integer | **Yes** | Positive integer determining sorting order on home/subject pages. | `2` |
| `iconName` | String | No | Icon identifier used in UI components. Default: `"DefaultIcon"`. | `"ChemistryIcon"` |
| `accentColorDark` | String | No | Hex / RGBA color code for dark mode theme accents. | `"rgba(0, 184, 212, 1)"` |
| `accentColorLight` | String | No | Hex / RGBA color code for light mode theme accents. | `"rgba(0, 184, 212, 0.15)"` |

#### Subject JSON Template
```json
[
  {
    "name": "Chemistry",
    "subjectKey": "chemistry",
    "description": "Study of matter, chemical properties, elements, and reactions.",
    "displayOrder": 2,
    "iconName": "ChemistryIcon",
    "accentColorDark": "rgba(0, 184, 212, 1)",
    "accentColorLight": "rgba(0, 184, 212, 0.15)"
  }
]
```

---

### 2.2 Topics Schema

A **Topic** represents a specific chapter or unit for a given target class and subject.

#### JSON Field Specifications

| Field Name | Type | Required | Description | Allowed / Valid Values |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | **Yes** | Unique topic identifier slug (kebab-case). | e.g. `"acids-bases-and-salts-9th"` |
| `name` | String | **Yes** | Human-readable title of the topic. | e.g. `"Acids, Bases and Salts"` |
| `description` | String | No | Short summary of chapter contents. | e.g. `"Properties of acidic and basic solutions."` |
| `class` | String | **Yes** | Target grade level for student filtering. | `"Class 6th"`, `"Class 7th"`, `"Class 8th"`, `"Class 9th"`, `"Class 10th"` |
| `genre` | String | **Yes** | Educational board or category. | `"State Board"`, `"NCERT"`, `"Homi Bhabha"`, `"Curriculum"`, `"General Knowledge"` |
| `subject_id` | String | **Yes** | Foreign key matching a Subject's `subjectKey` or `id`. | `"physics"`, `"chemistry"`, `"biology"`, `"mathematics"`, `"gk"`, `"general"` |

#### Topic JSON Template
```json
[
  {
    "id": "acids-bases-and-salts-9th",
    "name": "Acids, Bases and Salts",
    "description": "Properties of acidic and basic solutions, pH scale, and salt formation.",
    "class": "Class 9th",
    "genre": "State Board",
    "subject_id": "chemistry"
  }
]
```

---

### 2.3 Questions Schema

A **Question** is an individual multiple-choice item containing 4 options, a designated correct answer ID, and an optional explanation.

#### JSON Field Specifications

| Field Name | Type | Required | Description | Valid / Constraint Values |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | **Yes** | Unique question identifier. | e.g. `"q-abs-001"` |
| `topicId` | String | **Yes** | Foreign key matching the parent Topic's `id`. | e.g. `"acids-bases-and-salts-9th"` |
| `text` | String | **Yes** | Question prompt text (supports standard text or Markdown). | e.g. `"What is the pH of a neutral aqueous solution at 25°C?"` |
| `options` | Array | **Yes** | Array of **exactly 4** option objects. Each object must have `id` and `text`. | `[{"id": "a", "text": "..."}, {"id": "b", ...}, {"id": "c", ...}, {"id": "d", ...}]` |
| `correctOptionId` | String | **Yes** | Must match the `id` of the correct option in `options`. | `"a"`, `"b"`, `"c"`, or `"d"` |
| `explanation` | String | No | Detailed explanation/solution shown on results review. | e.g. `"A neutral solution has [H+] = [OH-] = 10^-7 M, corresponding to a pH of 7."` |

> **Note on Difficulty**: Difficulty levels (`easy`, `medium`, `hard`, `mixed`) have been permanently removed from ReactiQuiz. Do **NOT** include a `difficulty` attribute in question or topic payloads.

#### Question JSON Template
```json
[
  {
    "id": "q-abs-001",
    "topicId": "acids-bases-and-salts-9th",
    "text": "What color does blue litmus paper turn when dipped in an acidic solution?",
    "options": [
      { "id": "a", "text": "Red" },
      { "id": "b", "text": "Green" },
      { "id": "c", "text": "Yellow" },
      { "id": "d", "text": "Remains Blue" }
    ],
    "correctOptionId": "a",
    "explanation": "Acidic solutions turn blue litmus paper red due to high hydrogen ion concentration."
  }
]
```

---

### 2.4 Chapter Notes Schema (New)

A **Topic Note** provides high-yield, ready-made 1–2 page conceptual revision notes for a specific topic. To preserve cloud storage and ensure instantaneous client-side rendering, notes are stored directly in the database as `.md` Markdown text rather than uploaded PDF files.

#### Database Table Definition (`topic_notes`)
```sql
CREATE TABLE IF NOT EXISTS topic_notes (
    id TEXT PRIMARY KEY,
    topicId TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    readTimeMinutes INTEGER DEFAULT 5,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topicId) REFERENCES quiz_topics(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_topic_notes_topicId ON topic_notes(topicId);
```

#### JSON Field Specifications

| Field Name | Type | Required | Description | Valid / Example Values |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | **Yes** | Unique note identifier. | `"note-acids-bases-and-salts-9th"` |
| `topicId` | String | **Yes** | Foreign key matching parent Topic's `id` (**unique 1-to-1 relationship**). | `"acids-bases-and-salts-9th"` |
| `title` | String | **Yes** | Clean title of the study note document. | `"Acids, Bases & Salts: Reactions and pH Scale"` |
| `content` | String | **Yes** | Full Markdown text supporting math, diagrams, tables, and callouts. | Detailed `.md` content string (see formatting guide below). |
| `summary` | String | No | 1–2 sentence executive overview of the chapter. | `"Arrhenius definitions, neutralization reactions, and pH scale."` |
| `readTimeMinutes` | Integer | No | Estimated reading time in minutes (default: `5`). | `5`, `6`, `8` |

#### Markdown Capabilities & Syntax Supported
ReactiQuiz parses Markdown on the frontend using `react-markdown`, `remark-math`, `rehype-katex`, `rehype-raw`, and `mermaid`:

1. **LaTeX Mathematical Formulas**:
   - Inline Math: `$E = mc^2$`
   - Block / Display Math:
     ```latex
     $$\vec{F} = G \frac{m_1 m_2}{r^2} \hat{r}$$
     ```
2. **Mermaid Flowcharts, Mindmaps & Diagrams**:
   - Fenced code block with language identifier `mermaid`:
     ````markdown
     ```mermaid
     graph LR
         Acid[Acid: H⁺ Donor] + Base[Base: OH⁻ Donor] --> Salt[Ionic Salt] + Water[H₂O]
         style Acid fill:#EF4444,color:#fff
         style Base fill:#3B82F6,color:#fff
     ```
     ````
3. **GitHub-Style Callout Alert Boxes**:
   - `> [!NOTE]` — Informational notes & context
   - `> [!TIP]` — Practical memory tricks & shortcuts
   - `> [!IMPORTANT]` — Essential formulas & exam focus points
   - `> [!WARNING]` — Common student misconceptions & boundary conditions
4. **Structured Comparison Tables**:
   - Standard GFM tables with column alignments (`:---`, `:---:`, `---:`).
5. **Auto-Generated Sticky Table of Contents**:
   - All `#`, `##`, and `###` headers are automatically slugified and indexed into a floating interactive TOC with scrollspy tracking.

#### Chapter Note JSON Template
```json
[
  {
    "id": "note-acids-bases-and-salts-9th",
    "topicId": "acids-bases-and-salts-9th",
    "title": "Acids, Bases & Salts: Reactions and pH Scale",
    "summary": "Arrhenius definitions, neutralization reactions, pH logarithmic scale, and common indicator colors.",
    "readTimeMinutes": 5,
    "content": "# Acids, Bases and Salts\n\nAcids and bases are fundamental classes of chemical compounds that neutralize each other.\n\n## Chemical Definitions\n\n1. **Acids:** Produce hydrogen ions ($H^+$ or $H_3O^+$) in aqueous solution:\n   $$\\text{HCl}_{(aq)} \\rightarrow H^+_{(aq)} + \\text{Cl}^-_{(aq)}$$\n2. **Bases:** Produce hydroxide ions ($OH^-$) in aqueous solution:\n   $$\\text{NaOH}_{(aq)} \\rightarrow \\text{Na}^+_{(aq)} + \\text{OH}^-_{(aq)}$$\n\n```mermaid\ngraph LR\n    Acid[Acid: H⁺ Donor] + Base[Base: OH⁻ Donor] --> Salt[Ionic Salt] + Water[H₂O Water]\n```\n\n## The pH Scale\n\n$$\\text{pH} = -\\log_{10}[H^+]$$\n\n> [!NOTE]\n> A neutral solution at 25°C has a pH of exactly 7.0.\n\n## Indicator Color Transitions\n\n| Indicator | In Acid ($pH < 7$) | Neutral ($pH = 7$) | In Base ($pH > 7$) |\n| :--- | :--- | :--- | :--- |\n| **Litmus** | Red | Purple | Blue |\n| **Phenolphthalein** | Colorless | Colorless | Vivid Pink |\n| **Methyl Orange** | Red | Orange | Yellow |\n"
  }
]
```

---

## 3. Bulk Import & Admin API Endpoints

Content can be created and managed via the **Admin Command Center** (`/admin/content`) or via REST endpoints:

### 3.1 Import Subjects
- **Endpoint**: `POST /api/admin/subjects/batch-import`
- **Payload**: JSON Array of Subject objects.
- **Behavior**: Uses `INSERT ... ON CONFLICT(subjectKey) DO UPDATE`.

### 3.2 Import Topics
- **Endpoint**: `POST /api/admin/topics/batch-import`
- **Payload**: JSON Array of Topic objects.
- **Behavior**: Uses `INSERT ... ON CONFLICT(id) DO UPDATE`.

### 3.3 Import Questions
- **Endpoint**: `POST /api/admin/questions/batch-import`
- **Payload**: JSON Array of Question objects.
- **Behavior**: Uses `INSERT OR REPLACE` with batch chunks.

### 3.4 Manage Chapter Notes
- **Bulk Import Endpoint**: `POST /api/admin/notes/batch-import`
- **Create / Update Endpoints**: `POST /api/admin/notes`, `PUT /api/admin/notes/:id`
- **Delete Endpoint**: `DELETE /api/admin/notes/:id`
- **Public Student Endpoints**:
  - `GET /api/notes/topic/:topicId` (returns note document with joined topic and subject accent color metadata)
  - `GET /api/notes/:id`

---

## 4. Prompt Template for AI Generation

When asking an AI model to generate a complete chapter bundle (Topic, Questions, and Chapter Notes), use the following prompt:

```text
Generate a complete JSON curriculum bundle for ReactiQuiz according to the following strict specification:

1. TOPIC OBJECT:
- id: kebab-case string (e.g., "gravitation-9th")
- name: string title (e.g., "Gravitation")
- description: short 1-sentence overview
- class: one of ["Class 6th", "Class 7th", "Class 8th", "Class 9th", "Class 10th"]
- genre: "State Board" or "NCERT"
- subject_id: one of ["physics", "chemistry", "biology", "mathematics", "gk", "general"]

2. CHAPTER NOTE OBJECT:
- id: "note-" + topic id (e.g., "note-gravitation-9th")
- topicId: must match topic id exactly
- title: clear title of the study guide
- summary: short 1-2 sentence chapter summary
- readTimeMinutes: integer between 4 and 8
- content: rich Markdown text including:
  * Proper H1, H2, and H3 headings
  * Key formulas in LaTeX block ($$...$$) and inline ($...$) syntax
  * At least one Mermaid diagram block (```mermaid ... ```)
  * At least one comparison / summary table
  * At least two GitHub alert callouts (> [!IMPORTANT], > [!TIP], or > [!NOTE])

3. QUESTIONS ARRAY (generate 10 multiple choice questions):
- id: unique string (e.g., "q-grav-001", "q-grav-002", ...)
- topicId: must match topic id exactly
- text: clear question prompt
- options: array of exactly 4 objects with keys "id" ("a", "b", "c", "d") and "text"
- correctOptionId: string matching one of ["a", "b", "c", "d"]
- explanation: detailed step-by-step solution text

Return valid JSON with three top-level keys: "topic" (object), "note" (object), and "questions" (array). Do not include any difficulty attributes.
```

---

## 5. Summary Checklist for Content Creators

- [x] Every **Topic** has a valid `subject_id` matching an existing Subject (`physics`, `chemistry`, `biology`, `mathematics`, `gk`, `general`).
- [x] Every **Topic** has a `class` specified as `"Class Xth"` (from Class 6th to Class 10th).
- [x] Every **Chapter Note** has a unique `topicId` matching an existing Topic `id` (1-to-1 relationship).
- [x] Every **Chapter Note** uses valid LaTeX syntax (`$...$` and `$$...$$`) and closed Mermaid code blocks.
- [x] Every **Question** has a `topicId` matching a valid Topic `id`.
- [x] Every **Question** has exactly 4 options with option IDs `a`, `b`, `c`, `d`.
- [x] `correctOptionId` matches one of `a`, `b`, `c`, `d`.
- [x] `difficulty` field is omitted across all payloads.
