import { useState } from "react";

export default function QuizLevel({
  subject,
  chapterNumber,
  levelNumber,
}: {
  subject: string;
  chapterNumber: number;
  levelNumber: number;
}) {
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  async function submitQuiz(finalScore: number) {
    setScore(finalScore);

    if (finalScore < 80) return;

    await fetch("http://localhost:5000/api/progress/complete-level", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token") || "",
      },
      body: JSON.stringify({
        subject,
        chapterNumber,
        levelNumber,
        score: finalScore,
      }),
    });

    setCompleted(true);
  }

  return (
    <div className="cartoon-card">
      {!completed ? (
        <button
          className="cartoon-button"
          onClick={() => submitQuiz(85)} // example score
        >
          Finish Level
        </button>
      ) : (
        <p className="font-bold text-success">Level Completed 🎉</p>
      )}
    </div>
  );
}