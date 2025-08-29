// src/pages/StrategyPage.jsx
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import TopNavBar from "@/components/TopNavBar";

export default function StrategyPage() {
  const [files, setFiles] = useState([]);        // list of strategy filenames
  const [selected, setSelected] = useState(null); // currently selected strategy
  const [content, setContent] = useState("");     // markdown content

  // Load list of strategies from a JSON manifest
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("/strategy/manifest.json");
        if (!response.ok) throw new Error("No manifest.json found");
        const list = await response.json();
        setFiles(list);

        // Set your preferred default file here
        const defaultFile = "2.3.md";
        if (list.includes(defaultFile)) {
          setSelected(defaultFile);
        } else if (list.length > 0) {
          setSelected(list[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFiles();
  }, []);

  // Load selected strategy’s markdown
  useEffect(() => {
    if (!selected) return;
    const fetchMarkdown = async () => {
      try {
        const response = await fetch(`/strategy/${selected}`);
        if (!response.ok) throw new Error("Markdown file not found");
        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error(err);
        setContent("⚠️ Error loading strategy.");
      }
    };
    fetchMarkdown();
  }, [selected]);

  return (
    <>
      <TopNavBar />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div id="content" className="bg-white grid grid-cols-4 gap-6 p-6 rounded-xl shadow">
          {/* Sidebar with strategy links */}
          <div className="col-span-1 border-r pr-4">
            <h2 className="text-xl font-bold mb-4">Strategies</h2>
            <ul className="space-y-2">
              {files.map((file, idx) => (
                <li key={file}>
                  <button
                    className={`w-full text-left p-2 rounded ${
                      selected === file ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelected(file)}
                  >
                    {file.replace(".md", "")}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Main content area */}
          <div className="col-span-3 text-left markdown-cont max-w-none">
            {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p>Loading...</p>}
          </div>
        </div>
      </div>
    </>
  );
}