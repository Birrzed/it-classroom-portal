'use client';

import React, { useState, useEffect } from 'react';
import { Key, Save, ArrowLeft, Plus, Trash2, Award, FileText } from 'lucide-react';
import Link from 'next/link';

export default function TeacherPortal() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'exam'

  // Lesson Post Form State
  const [grade, setGrade] = useState('7');
  const [chapter, setChapter] = useState('Chapter 1');
  const [week, setWeek] = useState('Week 1');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [content, setContent] = useState('');

  // Major Exam Questions Builder State
  const [examQuestions, setExamQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctOpt, setCorrectOpt] = useState(0);

  useEffect(() => {
    const savedExam = localStorage.getItem('ict_major_exam');
    if (savedExam) {
      try {
        setExamQuestions(JSON.parse(savedExam));
      } catch (e) {
        setExamQuestions([]);
      }
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect PIN! Use: 1234');
    }
  };

  const handlePublishPost = () => {
    if (!title || !content) {
      alert('Please fill in both the Lesson Title and Lesson Notes Content.');
      return;
    }

    const newPost = {
      id: 'post-' + Date.now(),
      grade,
      chapter,
      week,
      title,
      instructions,
      content,
      quiz: []
    };

    const existing = localStorage.getItem('ict_portal_posts');
    let posts = existing ? JSON.parse(existing) : [];
    posts.unshift(newPost);
    localStorage.setItem('ict_portal_posts', JSON.stringify(posts));

    alert(`Successfully published "${title}" to Grade ${grade}!`);
    setTitle('');
    setInstructions('');
    setContent('');
  };

  const handleAddExamQuestion = () => {
    if (!newQuestion || !opt0 || !opt1 || !opt2 || !opt3) {
      alert('Please enter the question and all 4 options.');
      return;
    }

    const qObj = {
      id: Date.now(),
      question: newQuestion,
      options: [opt0, opt1, opt2, opt3],
      correct: parseInt(correctOpt)
    };

    const updated = [...examQuestions, qObj];
    setExamQuestions(updated);
    localStorage.setItem('ict_major_exam', JSON.stringify(updated));

    setNewQuestion('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setCorrectOpt(0);
    alert('Exam question added successfully!');
  };

  const handleDeleteExamQuestion = (id) => {
    const updated = examQuestions.filter(q => q.id !== id);
    setExamQuestions(updated);
    localStorage.setItem('ict_major_exam', JSON.stringify(updated));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
            <Key className="w-5 h-5" />
            <span>Teacher Studio PIN Login</span>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              placeholder="Enter PIN (Default: 1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 font-bold py-2 rounded-xl text-xs transition-all shadow-lg text-white"
            >
              Unlock Teacher Studio
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-cyan-400">Teacher Studio</h1>
          <p className="text-xs text-slate-400">Manage lesson notes and student major exams</p>
        </div>
        <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <ArrowLeft className="w-4 h-4" /> View Live Student Site
        </Link>
      </div>

      {/* Tab Selector */}
      <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab('notes')}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'notes' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Publish Lesson Notes
        </button>
        <button
          onClick={() => setActiveTab('exam')}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'exam' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" /> Build Major Exam Questions
        </button>
      </div>

      {/* Tab 1: Publish Lesson Notes */}
      {activeTab === 'notes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Target Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Chapter</label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Week</label>
              <input
                type="text"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Lesson Title</label>
            <input
              type="text"
              placeholder="e.g. Introduction to ICT"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Teacher Instructions</label>
            <textarea
              placeholder="Read instructions carefully..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white h-16"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Lesson Notes Content (HTML Supported)</label>
            <textarea
              placeholder="Paste MS Word notes or HTML text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white h-48 font-mono"
            />
          </div>

          <button
            onClick={handlePublishPost}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Publish Post to Grade {grade}
          </button>
        </div>
      )}

      {/* Tab 2: Major Exam Builder */}
      {activeTab === 'exam' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New Major Exam Question
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Question Text</label>
              <input
                type="text"
                placeholder="e.g. What is the brain of the computer?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Option A</label>
                <input
                  type="text"
                  value={opt0}
                  onChange={(e) => setOpt0(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Option B</label>
                <input
                  type="text"
                  value={opt1}
                  onChange={(e) => setOpt1(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Option C</label>
                <input
                  type="text"
                  value={opt2}
                  onChange={(e) => setOpt2(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Option D</label>
                <input
                  type="text"
                  value={opt3}
                  onChange={(e) => setOpt3(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Correct Answer</label>
              <select
                value={correctOpt}
                onChange={(e) => setCorrectOpt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
              >
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
                <option value="3">Option D</option>
              </select>
            </div>

            <button
              onClick={handleAddExamQuestion}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Question to Exam
            </button>
          </div>

          {/* List of Existing Questions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Current Major Exam Questions ({examQuestions.length})</h3>
            {examQuestions.map((q, idx) => (
              <div key={q.id || idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{idx + 1}. {q.question}</p>
                  <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
                    Correct Option: Option {['A', 'B', 'C', 'D'][q.correct]} ({q.options[q.correct]})
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteExamQuestion(q.id)}
                  className="text-rose-400 hover:text-rose-300 p-1 bg-rose-950/30 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}