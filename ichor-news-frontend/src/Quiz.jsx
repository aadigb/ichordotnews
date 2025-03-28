import React, { useState } from 'react';

const questions = [
  {
    text: "Government should regulate the economy more than it does now.",
    axis: "economic",
    agreeValue: -1,
    disagreeValue: 1,
  },
  {
    text: "Personal freedoms are more important than national security.",
    axis: "social",
    agreeValue: 1,
    disagreeValue: -1,
  },
  {
    text: "Strong leadership is more important than democracy.",
    axis: "authoritarian",
    agreeValue: 1,
    disagreeValue: -1,
  },
  {
    text: "The market should be free from government intervention.",
    axis: "economic",
    agreeValue: 1,
    disagreeValue: -1,
  },
  {
    text: "Traditions should be preserved, even if they limit freedom.",
    axis: "social",
    agreeValue: -1,
    disagreeValue: 1,
  },
];

const Quiz = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({ economic: 0, social: 0, authoritarian: 0 });

  const handleAnswer = (agree) => {
    const q = questions[current];
    const value = agree ? q.agreeValue : q.disagreeValue;

    setScores((prev) => ({
      ...prev,
      [q.axis]: prev[q.axis] + value,
    }));

    if (current + 1 === questions.length) {
      // Determine overall bias from axes
      const bias = determineBias(scores);
      onComplete(bias);
    } else {
      setCurrent(current + 1);
    }
  };

  const determineBias = ({ economic, social, authoritarian }) => {
    if (economic <= -2 && social >= 1) return 'left';
    if (economic >= 2 && social <= -1) return 'right';
    return 'center';
  };

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Political Bias Quiz</h2>
      <p className="mb-6">{questions[current].text}</p>
      <div className="flex justify-between gap-4">
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => handleAnswer(true)}
        >
          Agree
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => handleAnswer(false)}
        >
          Disagree
        </button>
      </div>
    </div>
  );
};

export default Quiz;
