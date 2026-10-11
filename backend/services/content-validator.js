/**
 * LearnQuest Content Validator & Quality Gate
 * Enforces:
 * - Mathematical equivalence rejection (e.g. 14/11 vs 126/99, 4/10 vs 2/5)
 * - Control character rejection (e.g. \u000c / form-feed, \u0008 / backspace)
 * - Corrupted LaTeX prefix rejection (e.g. rac, imes, ext, qrt)
 * - Subject-specific formatting (LaTeX strictly restricted to Maths/Science)
 * - Question-type congruence (no math fractions in language/social studies)
 * - Unshuffled correctAnswer matching options
 * - Minimum question counts for published levels
 */

function isMathOrScienceSubject(subject = "") {
  const s = String(subject).toLowerCase();
  return (
    s.includes("math") ||
    s.includes("sci") ||
    s.includes("phys") ||
    s.includes("chem") ||
    s.includes("bio")
  );
}

/**
 * Evaluates numeric value from string (supporting standard floats, LaTeX \frac{a}{b}, and plain fractions a/b)
 */
function evaluateNumericOrFraction(val) {
  if (typeof val !== "string") return null;
  const cleaned = val.replace(/[$\s]/g, "").trim();

  // LaTeX fraction: \frac{a}{b}
  const latexFracMatch = cleaned.match(/^\\?frac\{(-?\d+)\}\{([1-9]\d*)\}$/);
  if (latexFracMatch) {
    const num = parseFloat(latexFracMatch[1]);
    const den = parseFloat(latexFracMatch[2]);
    if (den !== 0) return num / den;
  }

  // Plain text fraction: a/b
  const plainFracMatch = cleaned.match(/^(-?\d+)\s*\/\s*([1-9]\d*)$/);
  if (plainFracMatch) {
    const num = parseFloat(plainFracMatch[1]);
    const den = parseFloat(plainFracMatch[2]);
    if (den !== 0) return num / den;
  }

  // Pure integer or decimal number
  const numMatch = cleaned.match(/^(-?\d+(\.\d+)?)$/);
  if (numMatch) {
    return parseFloat(numMatch[1]);
  }

  return null;
}

/**
 * Validates a single question against strict quality gate
 */
function validateQuestion(q, options = {}) {
  const errors = [];
  const subject = options.subject || "";
  const isMathSci = isMathOrScienceSubject(subject);

  if (!q.id || typeof q.id !== "string") {
    errors.push("Missing or invalid question id");
  }

  if (!q.prompt || typeof q.prompt !== "string" || q.prompt.trim().length < 5) {
    errors.push(`Question ${q.id || "unknown"}: Prompt too short or missing`);
  }

  // 1. Check for unescaped control characters in JSON representation
  const serialized = JSON.stringify(q);
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(serialized)) {
    errors.push(`Question ${q.id}: Contains illegal control characters (e.g. form-feed \\u000c or backspace)`);
  }

  // 2. Check for corrupted LaTeX tokens (e.g. "rac", "imes", "ext", "qrt" from eaten backslashes)
  if (/\brac\d+|\bimes\b|\bqrt\b|\bext\{/.test(serialized)) {
    errors.push(`Question ${q.id}: Contains corrupted LaTeX tokens (e.g. rac/imes/qrt)`);
  }

  // 3. Subject-specific LaTeX check: LaTeX is ONLY allowed in Maths and Science
  if (!isMathSci) {
    if (/\$[^$]+\$|\\frac|\\sqrt|\\times|\\div/.test(serialized)) {
      errors.push(`Question ${q.id}: Inappropriate LaTeX markup in non-math/science subject (${subject})`);
    }
  }

  // 4. Question-type options check
  if (!Array.isArray(q.options) || q.options.length < 2) {
    errors.push(`Question ${q.id}: Must have at least 2 options (recommended 4)`);
  } else {
    // 4a. Check for mathematical fractions in language/humanities options
    if (!isMathSci && (subject.includes("eng") || subject.includes("hin") || subject.includes("soc"))) {
      const hasFractions = q.options.some((opt) => /rac\d+|\\frac|\d+\/\d+/.test(String(opt)));
      if (hasFractions) {
        errors.push(`Question ${q.id}: Mathematical fractions found in options for language/humanities subject`);
      }
    }

    // 4b. Literal duplicate options check
    const seenLiterals = new Set();
    for (const opt of q.options) {
      const trimmed = String(opt).trim().toLowerCase();
      if (seenLiterals.has(trimmed)) {
        errors.push(`Question ${q.id}: Duplicate option literal '${opt}'`);
      }
      seenLiterals.add(trimmed);
    }

    // 4c. Mathematical value equivalence check (e.g. 14/11 vs 126/99, 4/10 vs 2/5, 29/50 vs 58/100)
    if (isMathSci) {
      const evaluatedValues = new Map();
      for (const opt of q.options) {
        const numericVal = evaluateNumericOrFraction(opt);
        if (numericVal !== null) {
          const key = Math.round(numericVal * 1e8) / 1e8;
          if (evaluatedValues.has(key)) {
            errors.push(
              `Question ${q.id}: Options '${evaluatedValues.get(key)}' and '${opt}' have identical mathematical value (${numericVal})`
            );
          } else {
            evaluatedValues.set(key, opt);
          }
        }
      }
    }

    // 4d. Confirm correctAnswer exists in options
    const correctStr = String(q.correctAnswer).trim();
    const hasMatch = q.options.some((o) => String(o).trim() === correctStr);
    if (!hasMatch) {
      errors.push(`Question ${q.id}: correctAnswer '${q.correctAnswer}' is not present in options`);
    }
  }

  if (!q.explanation || typeof q.explanation !== "string" || q.explanation.trim().length < 10) {
    errors.push(`Question ${q.id}: Explanation is missing or too brief`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a level's publish readiness
 */
function validateLevel(level, options = {}) {
  const minQuestions = options.minQuestions ?? 8;
  const subject = options.subject || "";
  const errors = [];

  if (!level.id) errors.push("Missing level id");
  if (!level.title) errors.push("Missing level title");

  const questions = Array.isArray(level.questions) ? level.questions : [];

  if (level.status === "published") {
    if (questions.length < minQuestions) {
      errors.push(
        `Level ${level.id} (${level.title}) has ${questions.length} questions; requires at least ${minQuestions} to be published`
      );
    }
  }

  questions.forEach((q) => {
    const qRes = validateQuestion(q, { subject });
    if (!qRes.valid) {
      errors.push(...qRes.errors);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    questionCount: questions.length,
  };
}

module.exports = {
  isMathOrScienceSubject,
  evaluateNumericOrFraction,
  validateQuestion,
  validateLevel,
};
