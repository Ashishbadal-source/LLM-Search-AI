import React, { useState } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('http://localhost:5000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setResponse(data.response || 'No response from backend.');
    } catch (error) {
      setResponse('Something went wrong: ' + error.message);
    }

    setLoading(false);
  };

  // return (
  //   <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
  //     <h1 className="text-3xl font-bold mb-6 text-blue-700">Smart LLM Search</h1>

  //     <div className="flex gap-2 mb-4 w-full max-w-xl">
  //       <input
  //         type="text"
  //         className="flex-grow p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none"
  //         placeholder="Ask anything..."
  //         value={query}
  //         onChange={(e) => setQuery(e.target.value)}
  //       />
  //       <button
  //         onClick={handleSearch}
  //         className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
  //       >
  //         Search
  //       </button>
  //     </div>

  //     {loading && <p className="text-gray-500 animate-pulse">Thinking...</p>}

  //     {response && (
  //       <div className="bg-white rounded-lg shadow-md p-6 max-w-xl w-full mt-4">
  //         <h2 className="font-semibold text-lg mb-2">LLM Response:</h2>
  //         <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
  //       </div>
  //     )}
  //   </div>
  // );


  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-200 flex flex-col items-center justify-center p-6">
    <h1 className="text-4xl font-extrabold text-indigo-800 mb-6 drop-shadow-lg fade-in">Smart LLM Search</h1>

    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl fade-in">
      <input
        type="text"
        className="flex-grow p-3 rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder="Type your question..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        onClick={handleSearch}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition"
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
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mt-6 w-full fade-in border border-indigo-100">
        <h2 className="text-xl font-semibold text-indigo-600 mb-2">LLM Response:</h2>
        <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
      </div>
    )}
  </div>
);

}

export default App;
