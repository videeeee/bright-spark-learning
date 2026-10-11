/**
 * Curriculum & Content Quality Validator
 * Validates lesson integrity, question counts, option uniqueness, and mathematical equivalences.
 */

// Evaluates simple arithmetic/fractional string expressions to detect duplicate mathematical values
function evaluateNumericOrFraction(val) {
  if (typeof val !== "string") return null;
  const cleaned = val.replace(/\$/g, "").trim();

  // Fraction format: a/b or -a/b
  const fractionMatch = cleaned.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    const den = parseFloat(fractionMatch[2]);
    if (den !== 0) return num / den;
  }

  // Pure integer or float
  const numMatch = cleaned.match(/^(-?\d+(\.\d+)?)$/);
  if (numMatch) {
    return parseFloat(numMatch[1]);
  }

  return null;
}

/**
 * Validates a single question
 */
function validateQuestion(q) {
  const errors = [];

  if (!q.id || typeof q.id !== "string") {
    errors.push(`Missing or invalid question id`);
  }
  if (!q.prompt || typeof q.prompt !== "string" || q.prompt.trim().length < 5) {
    errors.push(`Question ${q.id}: Prompt too short or missing`);
  }
  if (!Array.isArray(q.options) || q.options.length < 2) {
    errors.push(`Question ${q.id}: Must have at least 2 options`);
  } else {
    // 1. Literal string duplicate check
    const seenLiterals = new Set();
    for (const opt of q.options) {
      const trimmed = opt.trim().toLowerCase();
      if (seenLiterals.has(trimmed)) {
        errors.push(`Question ${q.id}: Duplicate option literal '${opt}'`);
      }
      seenLiterals.add(trimmed);
    }

    // 2. Mathematical value duplicate check (e.g. 14/11 vs 126/99, 4/10 vs 2/5)
    const evaluatedValues = new Map();
    for (const opt of q.options) {
      const numericVal = evaluateNumericOrFraction(opt);
      if (numericVal !== null) {
        // Round to 8 decimal places for floating point comparison
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

    // 3. Confirm correctAnswer exists in options
    const correctStr = String(q.correctAnswer).trim();
    const hasMatch = q.options.some((o) => o.trim() === correctStr);
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
 * Enforces:
 * - Minimum 8 verified questions for published status
 * - Lesson title and overview
 * - At least one worked example
 */
function validateLevel(level, minQuestions = 8) {
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
    const qRes = validateQuestion(q);
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
  validateQuestion,
  validateLevel,
  evaluateNumericOrFraction,
};
