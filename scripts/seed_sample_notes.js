// scripts/seed_sample_notes.js
/**
 * Seeder script for rich sample chapter notes
 * Seeds 3 comprehensive notes for Physics, Chemistry, and Biology
 * with LaTeX math, Mermaid diagrams, tables, and callouts.
 */

const fs = require('fs');
const path = require('path');

const possiblePaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../api/.env'),
  path.resolve(__dirname, '../web/.env')
];

for (const envPath of possiblePaths) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
          const key = trimmed.substring(0, idx).trim();
          let val = trimmed.substring(idx + 1).trim();
          val = val.replace(/^["']|["']$/g, '').trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  }
}

const { turso } = require('../api/_utils/tursoClient');

const SAMPLE_NOTES = [
  {
    id: 'note-laws-of-motion-9th',
    topicId: 'laws-of-motion-9th',
    title: 'Laws of Motion & Kinematics',
    summary: 'Distance vs Displacement, Velocity & Acceleration, Newton’s Three Laws of Motion, and Equations of Uniformly Accelerated Motion.',
    readTimeMinutes: 6,
    content: `# Laws of Motion & Kinematics

Motion is a change in position of an object over time relative to a chosen reference point (origin).

## Distance vs Displacement

- **Distance ($s$):** Total path length covered by an object. It is a scalar quantity (always $\\ge 0$).
- **Displacement ($\\vec{s}$):** Shortest straight-line vector from initial position to final position.

\`\`\`mermaid
graph LR
    Origin((Start A)) -->|Path Length = 15m| Curve[Curved Route]
    Curve --> Destination((End B))
    Origin ==>|Displacement Vector = 10m East| Destination
\`\`\`

---

## The Three Equations of Uniformly Accelerated Motion

For motion along a straight line with constant acceleration $a$:

1. **Velocity-Time Relation:**
$$v = u + at$$

2. **Position-Time Relation:**
$$s = ut + \\frac{1}{2}at^2$$

3. **Position-Velocity Relation:**
$$v^2 = u^2 + 2as$$

Where:
- $u =$ Initial velocity ($\\text{m/s}$)
- $v =$ Final velocity ($\\text{m/s}$)
- $a =$ Uniform acceleration ($\\text{m/s}^2$)
- $t =$ Time elapsed ($\\text{s}$)
- $s =$ Distance/Displacement covered ($\\text{m}$)

---

## Newton's Laws of Motion

\`\`\`mermaid
graph TD
    Newton[Newton's Laws of Motion]
    Newton --> L1[1st Law: Law of Inertia]
    Newton --> L2[2nd Law: F = ma]
    Newton --> L3[3rd Law: Action & Reaction]
    L1 --> D1[Object maintains state unless external unbalanced force acts]
    L2 --> D2[Rate of change of momentum is proportional to applied force]
    L3 --> D3[Every action has an equal and opposite reaction]
\`\`\`

> [!IMPORTANT]
> The area enclosed under a Velocity-Time graph between time $t_1$ and $t_2$ directly represents the total displacement traveled during that interval.

> [!TIP]
> **Momentum Conservation:** In an isolated system with no external forces, total linear momentum before collision equals total momentum after collision:
> $$m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2$$
`
  },
  {
    id: 'note-acids-bases-and-salts-9th',
    topicId: 'acids-bases-and-salts-9th',
    title: 'Acids, Bases & Salts: Reactions and pH Scale',
    summary: 'Arrhenius & Brønsted definitions, neutralization reactions, pH logarithmic scale, and common indicator colors.',
    readTimeMinutes: 5,
    content: `# Acids, Bases and Salts

Acids and bases are fundamental classes of chemical compounds with opposing reactive properties that neutralize each other to produce salts and water.

## Chemical Definitions

1. **Acids:** Substances that produce hydrogen ions ($H^+$ or $H_3O^+$ hydronium ions) in aqueous solution.
   $$\\text{HCl}_{(aq)} \\rightarrow H^+_{(aq)} + \\text{Cl}^-_{(aq)}$$

2. **Bases / Alkalis:** Substances that produce hydroxide ions ($OH^-$) in aqueous solution.
   $$\\text{NaOH}_{(aq)} \\rightarrow \\text{Na}^+_{(aq)} + \\text{OH}^-_{(aq)}$$

\`\`\`mermaid
graph LR
    Acid[Acid: H⁺ Donor] + Base[Base: OH⁻ Donor] --> Salt[Ionic Salt] + Water[H₂O Water]
    style Acid fill:#EF4444,color:#fff
    style Base fill:#3B82F6,color:#fff
    style Salt fill:#10B981,color:#fff
\`\`\`

---

## The pH Scale

The pH scale measures hydrogen ion concentration on a logarithmic scale:

$$\\text{pH} = -\\log_{10}[H^+]$$

\`\`\`mermaid
graph LR
    P0[pH 0-2: Strong Acid] --> P5[pH 3-6: Weak Acid]
    P5 --> P7[pH 7: Neutral Pure Water]
    P7 --> P9[pH 8-11: Weak Base]
    P9 --> P14[pH 12-14: Strong Alkali]
\`\`\`

---

## Common Indicators & Color Transitions

| Indicator | Color in Acid ($pH < 7$) | Color at Neutral ($pH = 7$) | Color in Base ($pH > 7$) |
| :--- | :--- | :--- | :--- |
| **Litmus** | Red | Purple | Blue |
| **Phenolphthalein** | Colorless | Colorless | Vivid Pink |
| **Methyl Orange** | Red | Orange | Yellow |
| **Universal Indicator** | Red / Orange | Green | Blue / Violet |

> [!NOTE]
> When a metal reacts with an acid, hydrogen gas is evolved with effervescence:
> $$\\text{Zn} + 2\\text{HCl} \\rightarrow \\text{ZnCl}_2 + H_2 \\uparrow$$

> [!TIP]
> **Antacid Relief:** Excess stomach acid ($\\text{HCl}$) is neutralized by mild bases like Magnesium Hydroxide (Milk of Magnesia, $\\text{Mg(OH)}_2$) or Sodium Bicarbonate ($\\text{NaHCO}_3$).
`
  },
  {
    id: 'note-life-processes-in-living-organisms-9th',
    topicId: 'life-processes-in-living-organisms-9th',
    title: 'Life Processes in Living Organisms: Transportation & Excretion',
    summary: 'Xylem & Phloem vascular transport in plants, human circulatory system, and nephron excretory mechanisms.',
    readTimeMinutes: 6,
    content: `# Life Processes: Transportation & Excretion

Living organisms require continuous physiological mechanisms to transport nutrients, respiratory gases, water, and metabolic waste products.

## Transportation in Plants: Xylem vs Phloem

\`\`\`mermaid
graph TD
    Transport[Vascular Transport in Plants]
    Transport --> Xylem[Xylem Tissue: Water & Minerals]
    Transport --> Phloem[Phloem Tissue: Food / Sucrose]
    Xylem --> X1[Unidirectional: Roots to Leaves]
    Xylem --> X2[Driven by Transpiration Pull & Root Pressure]
    Phloem --> P1[Bidirectional: Leaves to Storage Organs]
    Phloem --> P2[Translocation using ATP energy]
\`\`\`

---

## Human Excretory System: The Nephron

The structural and functional unit of the kidney is the **Nephron**.

\`\`\`mermaid
graph LR
    Blood[Renal Artery Blood] --> Glomerulus[Glomerulus: Ultrafiltration]
    Glomerulus --> Bowmans[Bowman's Capsule]
    Bowmans --> Tubule[Renal Tubule: Selective Reabsorption]
    Tubule --> Collect[Collecting Duct: Urine to Bladder]
\`\`\`

### Steps of Urine Formation

1. **Ultrafiltration:** High hydrostatic pressure forces water, urea, glucose, and amino acids across the glomerulus into Bowman's capsule.
2. **Selective Reabsorption:** Essential nutrients, glucose, amino acids, and major water volume are reabsorbed back into peritubular capillaries.
3. **Tubular Secretion:** Excess $K^+$ ions, $H^+$ ions, and ammonia are secreted into the filtrate to maintain ionic and pH balance.

---

## Summary Comparison of Plant and Animal Excretion

| Feature | Plants | Animals (Humans) |
| :--- | :--- | :--- |
| **Excretory Organs** | No specialized organ (Stomata, fallen leaves, vacuoles) | Specialized kidneys, ureters, bladder, urethra |
| **Primary Waste** | Oxygen ($O_2$), Carbon Dioxide ($CO_2$), Resins, Gums | Urea, Uric acid, Creatinine, excess salts |
| **Energy Consumption** | Largely passive / storage in dead cells | Active metabolic filtration requiring significant ATP |

> [!IMPORTANT]
> **Transpiration Pull:** Evaporation of water molecules from leaf stomata generates a negative suction pressure (suction pull) that draws water columns up to heights exceeding 100 meters in tall trees.
`
  }
];

async function seed() {
  console.log('Seeding sample notes to Turso DB...');
  const tx = await turso.transaction('write');
  try {
    for (const n of SAMPLE_NOTES) {
      await tx.execute({
        sql: `INSERT OR REPLACE INTO topic_notes (id, topicId, title, content, summary, readTimeMinutes, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`,
        args: [n.id, n.topicId, n.title, n.content, n.summary, n.readTimeMinutes]
      });
      console.log(`Seeded note: ${n.title} (${n.topicId})`);
    }
    await tx.commit();
    console.log('All sample notes seeded successfully!');
  } catch (err) {
    if (tx) await tx.rollback();
    console.error('Error seeding notes:', err);
    process.exit(1);
  }
}

seed();
