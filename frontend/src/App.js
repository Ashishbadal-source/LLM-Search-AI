import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "true") {
    setDarkMode(true);
  }

  fetch("https://llm-backend-vvou.onrender.com/api/history")
    .then((res) => res.json())
    .then((data) => setHistory(data))
    .catch((err) => console.error("Failed to load history:", err));
}, []); 

useEffect(() => {
  const root = document.documentElement;
  if (darkMode) {
    root.classList.add("dark");
    localStorage.setItem("darkMode", "true");
  } else {
    root.classList.remove("dark");
    localStorage.setItem("darkMode", "false");
  }
}, [darkMode]); 


  // Main function
  const handleSearch = async () => {
    if (!query) return;

    setLoading(true);

    try {
      const res = await fetch("https://llm-backend-vvou.onrender.com/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setResponse(data.response);

      
      setHistory((prev) => [
        { question: query, answer: data.response },
        ...prev,
      ]);
    } catch (error) {
      setResponse("Something went wrong: " + error.message);
    }

    setLoading(false);
    setQuery("");
  };



  return (
  <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-purple-200 flex flex-col items-center justify-center p-6">

    <div className="absolute top-6 right-6">
  <button onClick={() => setDarkMode(!darkMode)}
    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-full shadow hover:scale-105 transition"
  > {darkMode ? '☀ Light' : '🌙 Dark' } 
  </button>
</div>



    <div className="text-center mb-10 fade-in">
        <h1 className="text-4xl font-extrabold text-indigo-800 mb-6 drop-shadow-lg fade-in">Smart LLM Search</h1>
        <p className="text-gray-500 mt-2 text-lg">Type your query to get the Solution.</p>
    </div>


    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl fade-in">
      <input
        type="text"
        className="flex-grow p-3 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        placeholder="Type your question..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />

      <button
        onClick={handleSearch}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow transition"
      >
        Search
      </button>
    </div>

    {loading && (
      <div className="mt-5 text-indigo-700 font-semibold flex items-center space-x-2 animate-pulse">
        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span>Thinking...</span>
      </div>
    )}

    {response && (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mt-6 w-full fade-in border border-indigo-100">
      <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-2">LLM Response:</h2>
      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{response}</p>
</div>

    )}
    

    <footer className="mt-12 text-sm text-gray-400 dark:text-gray-500 fade-in">
  © {new Date().getFullYear()} 
  </footer>




    {history.length > 0 && (
  <div className="mt-10 w-full max-w-2xl fade-in space-y-4">
    <h3 className="text-lg font-semibold text-gray-700 mb-2">🕓 Previous Conversations(History):</h3>
    {history.map((item, idx) => (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
      <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">
      Q: <span className="font-medium text-gray-800 dark:text-gray-200">{item.question}</span>
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
      A: <span className="text-gray-700 dark:text-gray-100">{item.answer}</span>
      </p>
      </div>
))}
  </div>
)}


  </div>
);

}

export default App;
