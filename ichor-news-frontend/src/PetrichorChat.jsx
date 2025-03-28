import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function PetrichorChat({ isDarkMode }) {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Do you want to take a bias quiz to curate a for you page?' }
  ]);
  const [input, setInput] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatEndRef = useRef(null);

  const quizQuestions = [
    "Should the government provide universal healthcare?",
    "Is climate change a top priority?",
    "Should taxes be increased for the wealthy?",
    "Do you support stricter immigration policies?",
    "Should education be free at all levels?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setInput('');

    if (!quizStarted && !quizCompleted) {
      if (['no', 'nah'].includes(userInput.toLowerCase())) {
        setMessages(prev => [...prev, { role: 'bot', content: "Okay! Feel free to ask me anything else." }]);
        setQuizCompleted(true);
      } else {
        setQuizStarted(true);
        setMessages(prev => [...prev, { role: 'bot', content: quizQuestions[0] }]);
      }
      return;
    }

    if (quizStarted) {
      const updatedAnswers = [...quizAnswers, userInput];
      setQuizAnswers(updatedAnswers);

      const nextIndex = questionIndex + 1;
      if (nextIndex < quizQuestions.length) {
        setQuestionIndex(nextIndex);
        setMessages(prev => [...prev, { role: 'bot', content: quizQuestions[nextIndex] }]);
      } else {
        try {
          const result = await axios.post('https://ichornews.onrender.com/api/quiz', {
            answers: updatedAnswers,
            user_id: crypto.randomUUID()
          });
          setMessages(prev => [...prev, { role: 'bot', content: `Thanks! Your political leaning is: ${result.data.bias}` }]);
        } catch (err) {
          setMessages(prev => [...prev, { role: 'bot', content: 'Error evaluating bias. Try again later.' }]);
        }
        setQuizStarted(false);
        setQuizCompleted(true);
        setQuestionIndex(0);
        setQuizAnswers([]);
      }
      return;
    }

    if (quizCompleted) {
      try {
        const response = await axios.post('https://ichornews.onrender.com/api/petrichor/chat', {
          prompt: userInput
        });
        setMessages(prev => [...prev, { role: 'bot', content: response.data.response }]);
      } catch (err) {
        setMessages(prev => [...prev, { role: 'bot', content: 'Oops! Something went wrong.' }]);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className={`rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} w-full`}>
      <div className="flex justify-between items-center px-4 py-2 border-b dark:border-gray-700">
        <h2 className="font-semibold text-lg">💬</h2>
        <button
          className="text-sm text-blue-500 hover:underline"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {isMinimized ? '🗖 Open' : '🗕 Minimize'}
        </button>
      </div>

      {!isMinimized && (
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg max-w-[75%] text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="flex border-t dark:border-gray-700">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 px-3 py-2 text-sm rounded-bl-lg focus:outline-none ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
              }`}
              placeholder="Type your message..."
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-br-lg"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
