import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function PetrichorChat({ isDarkMode, username, onQuizComplete }) {
  const [messages, setMessages] = useState([]);
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
    "Should education be free at all levels?",
    "Should there be stronger gun control laws?",
    "Should the government forgive student loan debt?",
    "Do you support increased military spending?",
    "Should corporations be taxed more heavily?",
    "Is systemic racism a serious problem in society?"
  ];

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.post('https://ichordotnews.onrender.com/api/quiz/status', { username });
        if (res.data.taken) {
          setMessages([
            { role: 'bot', content: 'Type "retake" to retake the quiz.' }
          ]);
          setQuizCompleted(true);
        } else {
          setMessages([
            { role: 'bot', content: 'Do you want to take a preference test to customize your article's style, or type "no" if you want unbiased?' }
          ]);
        }
      } catch {
        setMessages([{ role: 'bot', content: 'Do you want to take a preference test to customize your article's style, or type "no" if you want unbiased?' }]);
      }
    };
    checkStatus();
  }, [username]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setInput('');

    if (userInput.toLowerCase() === 'retake') {
      setQuizCompleted(false);
      setQuizStarted(true);
      setQuestionIndex(0);
      setQuizAnswers([]);
      setMessages(prev => [...prev, { role: 'bot', content: quizQuestions[0] }]);
      return;
    }

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
          const result = await axios.post('https://ichordotnews.onrender.com/api/quiz/submit', {
            answers: updatedAnswers,
            username
          });
          setMessages(prev => [
            ...prev,
            { role: 'bot', content: `Thanks! Your political leaning is: ${result.data.bias}` },
            { role: 'bot', content: 'Changes will be applied the next time you log in.' }
          ]);
          setQuizCompleted(true);
          onQuizComplete();
       } catch (err) {
    console.error(err);
      setMessages(prev => [...prev, { role: 'bot', content: 'Thanks! Your political leaning is: center' }]);
    }

        setQuizStarted(false);
        setQuestionIndex(0);
        setQuizAnswers([]);
      }
      return;
    }

    if (quizCompleted) {
      try {
        const response = await axios.post('https://ichordotnews.onrender.com/api/petrichor/chat', {
          prompt: userInput,
          username
        });
        setMessages(prev => [...prev, { role: 'bot', content: response.data.response }]);
      } catch (err) {
        console.error(err);
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
