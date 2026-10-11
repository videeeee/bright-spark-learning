/**
 * LearnQuest XP and Grading Rules Configuration
 * Single source of truth for all XP awards
 */

const XP_RULES = {
  // Pass threshold
  PASS_THRESHOLD: 70,

  // Stars calculation based on accuracy score
  calculateStars(score) {
    if (score >= 95) return 3;
    if (score >= 80) return 2;
    if (score >= 70) return 1;
    return 0;
  },

  // Calculate XP awarded for a level attempt
  calculateLevelXp({ score, isFirstCompletion, previousBestStars = 0 }) {
    if (score < XP_RULES.PASS_THRESHOLD) {
      return 0;
    }

    const stars = XP_RULES.calculateStars(score);

    if (isFirstCompletion) {
      const base = 40;
      const starBonus = stars === 3 ? 20 : stars === 2 ? 10 : 5;
      return base + starBonus;
    }

    // Replay / revision attempt
    if (stars > previousBestStars) {
      // Improved stars bonus
      return (stars - previousBestStars) * 10;
    }

    // Practice replay: minimal revision XP
    return 5;
  },

  // XP for generating a note
  NOTE_CREATION_XP: 15,

  // XP for listening session (Web Speech API)
  LISTEN_SESSION_XP: 10,
};

module.exports = XP_RULES;
