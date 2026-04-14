/**
 * Subject mapping by class and curriculum (Backend)
 */

const CLASS_LEVELS = ["8", "9", "10", "11", "12"];
const CURRICULA = ["CBSE", "ICSE", "State"];

const subjectsByClassAndCurriculum = {
  "8": {
    CBSE: ["Hindi", "English", "Mathematics", "Science", "Social Science", "Skill"],
    ICSE: ["English", "Hindi", "Mathematics", "Science", "Social Studies", "Computer Applications"],
    State: ["Hindi", "English", "Mathematics", "Science", "Social Science", "Skill"],
  },
  "9": {
    CBSE: ["Hindi", "English", "Mathematics", "Science", "Social Science", "Skill"],
    ICSE: ["English", "Hindi", "Mathematics", "Science", "Social Studies", "Computer Applications"],
    State: ["Hindi", "English", "Mathematics", "Science", "Social Science", "Skill"],
  },
  "10": {
    CBSE: ["English", "Hindi", "Mathematics", "Science", "Social Science"],
    ICSE: ["English", "Hindi", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
    State: ["English", "Hindi", "Mathematics", "Science", "Social Science"],
  },
  "11": {
    CBSE: ["English", "Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "History", "Geography", "Economics", "Political Science"],
    ICSE: ["English", "Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "History"],
    State: ["English", "Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"],
  },
  "12": {
    CBSE: ["English", "Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "History", "Geography", "Economics", "Political Science"],
    ICSE: ["English", "Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "History"],
    State: ["English", "Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"],
  },
};

/**
 * Get subjects based on class level and curriculum
 */
function getSubjects(classLevel, curriculum) {
  return subjectsByClassAndCurriculum[classLevel]?.[curriculum] || [];
}

module.exports = {
  CLASS_LEVELS,
  CURRICULA,
  getSubjects,
};
