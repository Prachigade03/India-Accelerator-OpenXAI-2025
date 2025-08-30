"use client";

import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
    >
      {copied ? "✅ Copied" : "📋 Copy"}
    </button>
  );
}

export default function HomePage() {
  const [jsonInput, setJsonInput] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"short" | "long">("short");
  const [dark, setDark] = useState(false);
  const [history, setHistory] = useState<
    { json: string; explanation: string }[]
  >([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  function saveHistory(json: string, explanation: string) {
    const newItem = { json, explanation };
    const updated = [newItem, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  }

  async function handleExplain() {
    setLoading(true);
    setExplanation("");
    setError("");

    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ json: jsonInput, mode }),
    });

    const data = await res.json();
    if (data.suggestion) {
      setError(data.suggestion);
    }
    setExplanation(data.explanation);
    if (data.explanation) saveHistory(jsonInput, data.explanation);

    setLoading(false);
  }

  function toggleTheme() {
    setDark(!dark);
    if (!dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 animate-gradient bg-[length:400%_400%] dark:from-gray-900 dark:via-gray-800 dark:to-black">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 px-3 py-2 bg-gray-800 text-white rounded shadow hover:opacity-80 transition"
      >
        {dark ? "🌞 Light" : "🌙 Dark"}
      </button>

      {/* Glassmorphism Card */}
      <div className="w-full max-w-4xl p-8 rounded-2xl shadow-xl bg-white/30 dark:bg-gray-900/70 backdrop-blur-lg border border-white/20">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          🧾 API Explainer
        </h1>

        {/* Input */}
        <textarea
          className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
          placeholder="Paste JSON response here..."
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />

        {/* Mode toggle buttons */}
        <div className="flex gap-6 justify-center my-6">
          <button
            className={`px-6 py-2 rounded-xl shadow-md transition ${
              mode === "short"
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setMode("short")}
          >
            Short
          </button>
          <button
            className={`px-6 py-2 rounded-xl shadow-md transition ${
              mode === "long"
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setMode("long")}
          >
            Detailed
          </button>
        </div>

        {/* Explain Button */}
        <button
          onClick={handleExplain}
          disabled={loading}
          className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-xl shadow-lg hover:opacity-90 transition"
        >
          {loading ? "Explaining..." : "✨ Explain JSON"}
        </button>

        {/* Error */}
        {error && (
          <p className="mt-4 text-red-600 dark:text-red-400 font-semibold">
            {error}
          </p>
        )}

        {/* Explanation Output */}
        {explanation && (
          <div className="mt-6 p-4 border rounded-xl bg-gray-50/70 dark:bg-gray-800/80 shadow-md backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Explanation</h2>
              <CopyButton text={explanation} />
            </div>
            <p>{explanation}</p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-3">🕒 History</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-xl bg-gray-100/70 dark:bg-gray-700/70 backdrop-blur-sm shadow"
                >
                  <SyntaxHighlighter
                    language="json"
                    style={atomDark}
                    customStyle={{ borderRadius: "8px" }}
                  >
                    {item.json}
                  </SyntaxHighlighter>
                  <p className="mt-2">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
