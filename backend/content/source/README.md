# LearnQuest Official Syllabus Sources & Download Guide

To ensure 100% syllabus authenticity, all learning roadmaps, chapter definitions, and question banks in LearnQuest must trace to official examination board documents.

## Directory Structure
Place downloaded official PDF documents in:
```
backend/content/source/
├── ICSE/
│   └── 9/
│       ├── ICSE-2026-Regulations-and-Syllabuses-Mathematics.pdf
│       ├── ICSE-2026-Regulations-and-Syllabuses-Science.pdf
│       ├── ICSE-2026-Regulations-and-Syllabuses-English.pdf
│       ├── ICSE-2026-Regulations-and-Syllabuses-Hindi.pdf
│       ├── ICSE-2026-Regulations-and-Syllabuses-History-Civics-Geography.pdf
│       └── ICSE-2026-Regulations-and-Syllabuses-Computer-Applications.pdf
└── CBSE/
    └── 9/
        ├── CBSE-Secondary-Curriculum-2024-25-Mathematics.pdf
        └── CBSE-Secondary-Curriculum-2024-25-Science.pdf
```

---

## Official Download URLs & Document Specifications

### 1. ICSE (CISCE) - Class IX (Academic Session 2024-25 / 2025-26)
- **Portal**: [https://cisce.org](https://cisce.org) -> Examinations -> ICSE -> Regulations and Syllabuses
- **Documents**:
  1. **Mathematics (Code 51)**: `ICSE Class IX Regulations and Syllabuses - Mathematics`
  2. **Science (Physics 52, Chemistry 53, Biology 54)**: `ICSE Class IX Regulations and Syllabuses - Science`
  3. **English (Language Paper 1 Code 01, Literature in English Paper 2 Code 01)**:
     - Prescribed texts: Shakespeare's *Julius Caesar* (Act 1), *Treasure Chest: A Collection of ICSE Poems and Short Stories*.
  4. **Hindi (Code 05)**:
     - Prescribed texts: *Sahitya Sagar* (Gadya Sankalan & Kavya Chandrika), Saraswati Vyakaran Suman.
  5. **History, Civics & Geography (Code 50)**:
     - History & Civics Paper 1, Geography Paper 2.
  6. **Computer Applications (Code 86)**:
     - Object-Oriented Programming, Elementary Concept of Objects and Classes, Java fundamentals.

### 2. CBSE - Class IX (Secondary Curriculum 2024-25 / 2025-26)
- **Portal**: [https://cbseacademic.nic.in](https://cbseacademic.nic.in) -> Curriculum -> Secondary Curriculum (IX-X)
- **Documents**:
  1. **Mathematics (Subject Code 041)**:
     - Unit I: Number Systems (Real Numbers)
     - Unit II: Algebra (Polynomials, Linear Equations in Two Variables)
     - Unit III: Coordinate Geometry
     - Unit IV: Geometry (Lines and Angles, Triangles, Quadrilaterals, Circles)
     - Unit V: Mensuration (Areas using Heron's Formula, Surface Areas and Volumes)
     - Unit VI: Statistics
  2. **Science (Subject Code 086)**:
     - Theme Materials: Matter in Our Surroundings, Is Matter Around Us Pure?, Atoms and Molecules, Structure of Atom
     - Theme The World of the Living: Fundamental Unit of Life, Tissues
     - Theme Moving Things, People and Ideas: Motion, Force and Laws of Motion, Gravitation, Work and Energy, Sound
     - Theme Food: Improvement in Food Resources

---

## Verification Status Legend in LearnQuest JSONs
- `source`:
  - `documentName`: Exact document title from the board.
  - `url`: Official portal URL.
  - `academicYear`: Prescribed academic session (e.g. `2024-2025` or `2025-2026`).
  - `verified`: `true` if matched against verified official curriculum text; `false` or marked `unverified` if awaiting local PDF validation.
