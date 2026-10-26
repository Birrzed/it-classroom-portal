'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Award, FileText, CheckCircle, Search, ChevronRight, Key, HelpCircle } from 'lucide-react';

const DEFAULT_GRADE_7_POSTS = [
  {
    id: 'g7-u1',
    grade: '7',
    chapter: 'Chapter 1',
    week: 'Week 1',
    title: 'Introduction to Information and Communication Technology',
    instructions: 'Read Chapter 1 carefully before taking the chapter knowledge test.',
    content: `<div style="text-align: center;">
      <h1 style="font-size: 24pt; font-weight: bold; color: #ffffff; margin-bottom: 8px;">UNIT-ONE</h1>
      <h2 style="font-size: 20pt; font-weight: bold; color: #38bdf8; margin-bottom: 20px;">Introduction to Information and Communication Technology</h2>
    </div>
    <h3 style="font-size: 14pt; font-weight: bold; color: #ffffff; margin-top: 16px;">1.1 Information and Communication Technology (ICT)</h3>
    <ul style="color: #e2e8f0; line-height: 1.8; margin-top: 10px; padding-left: 20px;">
      <li>The term <b>ICT</b> refers to all communication technologies, including the Internet, mobile phones, TV, Computers, tablets, and Cameras.</li>
      <li>It refers to integrating audio-visual and telephone networks to enable users to access, retrieve, store, transmit, and manipulate information digitally.</li>
      <li><b>IT</b> (Information Technology) refers to the industry using computers, software, and networking to manage data.</li>
      <li>Creating, maintaining, and using software and hardware are core components of IT and ICT systems.</li>
    </ul>`,
    videoUrl: '',
    pdfUrl: '',
    quiz: [
      {
        question: 'What does ICT stand for?',
        options: ['Information and Communication Technology', 'Internal Computing Tool', 'Internet Connection Terminal', 'Integrated Communication Transfer'],
        correct: 0
      },
      {
        question: 'Which of the following is an ICT device?',
        options: ['Mobile Phone', 'Computer', 'Television', 'All of the above'],
        correct: 3
      }
    ]
  }
];

const DEFAULT_MAJOR_EXAM = [
  {
    id: 1,
    question: 'What is the primary function of an operating system?',
    options: ['Manage computer hardware and software', 'Browse the Internet', 'Design graphics', 'Type documents'],
    correct: 0
  },
  {
    id: 2,
    question: 'Which component is considered the "brain" of the computer?',
    options: ['Hard Drive', 'RAM', 'Central Processing Unit (CPU)', 'Power Supply'],
    correct: 2
  }
];

export default function StudentPortal() {
  const [activeGrade, setActiveGrade] = useState('7');
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chapter Quiz State
  const [showChapterQuiz, setShowChapterQuiz] = useState(false);
  const [chapterAnswers, setChapterAnswers] = useState({});
  const [chapterScore, setChapterScore] = useState(null);

  // Major Exam Modal State
  const [showMajorExam, setShowMajorExam] = useState(false);
  const [majorExamQuestions, setMajorExamQuestions] = useState([]);
  const [examAnswers, setExamAnswers] = useState({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(null);

  useEffect(() => {
    // Load Posts
    const savedPosts = localStorage.getItem('ict_portal_posts');
    if (savedPosts) {
      try {
        const parsed = JSON.parse(savedPosts);
        if (parsed && parsed.length > 0) {
          setPosts(parsed);
          setSelectedPost(parsed.find(p => p.grade === '7') || parsed[0]);
        } else {
          setPosts(DEFAULT_GRADE_7_POSTS);
          setSelectedPost(DEFAULT_GRADE_7_POSTS[0]);
        }
      } catch (e) {
        setPosts(DEFAULT_GRADE_7_POSTS);
        setSelectedPost(DEFAULT_GRADE_7_POSTS[0]);
      }
    } else {
      setPosts(DEFAULT_GRADE_7_POSTS);
      setSelectedPost(DEFAULT_GRADE_7_POSTS[0]);
    }

    // Load Major Exam Questions
    const savedExam = localStorage.getItem('ict_major_exam');
    if (savedExam) {
      try {
        const parsedExam = JSON.parse(savedExam);
        setMajorExamQuestions(parsedExam.length > 0 ? parsedExam : DEFAULT_MAJOR_EXAM);
      } catch (e) {
        setMajorExamQuestions(DEFAULT_MAJOR_EXAM);
      }
    } else {
      setMajorExamQuestions(DEFAULT_MAJOR_EXAM);
    }
  }, []);

  useEffect(() => {
    const filtered = posts.filter(p => p.grade === activeGrade);
    setSelectedPost(filtered.length > 0 ? filtered[0] : null);
  }, [activeGrade, posts]);

  const currentPosts = posts.filter(
    p => p.grade === activeGrade && p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChapterQuizSubmit = () => {
    if (!selectedPost || !selectedPost.quiz) return;
    let score = 0;
    selectedPost.quiz.forEach((q, idx) => {
      if (chapterAnswers[idx] === q.correct) score += 1;
    });
    setChapterScore(score);
  };

  const handleMajorExamSubmit = () => {
    let score = 0;
    majorExamQuestions.forEach((q, idx) => {
      if (examAnswers[idx] === q.correct) score += 1;
    });
    setExamScore(score);
    setExamSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/40 rounded-xl flex items-center justify-center text-cyan-400 font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-base tracking-wide bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ICT STUDENT PORTAL
            </h1>
            <p className="text-[10px] text-slate-400">Grades 7 & 8 Learning Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Major Exam Button */}
          <button
            onClick={() => { setShowMajorExam(true); setExamSubmitted(false); setExamAnswers({}); }}
            className="bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500 hover:text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Major Exam</span>
          </button>

          {/* Grade 7 Textbook Link */}
          <a
            href="/textbooks/grade7-ict.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-cyan-600/20 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Grade 7 Textbook</span>
          </a>

          {/* Teacher Portal Link */}
          <a
            href="/teacher"
            className="bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <Key className="w-4 h-4 text-indigo-400" />
            <span>Teacher Hub</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveGrade('7')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                activeGrade === '7' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grade 7
            </button>
            <button
              onClick={() => setActiveGrade('8')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                activeGrade === '8' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grade 8
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2">
            {currentPosts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl p-4">
                No units published for Grade {activeGrade} yet.
              </div>
            ) : (
              currentPosts.map(post => (
                <button
                  key={post.id}
                  onClick={() => { setSelectedPost(post); setShowChapterQuiz(false); setChapterScore(null); }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    selectedPost?.id === post.id
                      ? 'bg-slate-900 border-cyan-500/50 text-cyan-300 shadow-md'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 block uppercase tracking-wider">
                      {post.chapter} • {post.week}
                    </span>
                    <span className="text-xs font-semibold line-clamp-1 text-slate-200">{post.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Content View */}
        <main className="md:col-span-3 space-y-6">
          {selectedPost ? (
            <>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">
                  Grade {selectedPost.grade} • {selectedPost.chapter} • {selectedPost.week}
                </span>
                <h2 className="text-2xl font-black text-white mt-1">{selectedPost.title}</h2>
                {selectedPost.instructions && (
                  <div className="mt-4 p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-200 text-xs">
                    <span className="font-bold block text-amber-400 mb-0.5">Teacher Instructions:</span>
                    {selectedPost.instructions}
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white">Lesson Text Notes</h3>
                  </div>
                  {selectedPost.quiz && selectedPost.quiz.length > 0 && (
                    <button
                      onClick={() => setShowChapterQuiz(!showChapterQuiz)}
                      className="bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{showChapterQuiz ? 'Hide Quiz' : 'Test Knowledge'}</span>
                    </button>
                  )}
                </div>

                <div
                  className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />
              </div>

              {showChapterQuiz && selectedPost.quiz && (
                <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-bold text-emerald-400">Chapter Knowledge Quiz</h3>
                  {selectedPost.quiz.map((q, idx) => (
                    <div key={idx} className="space-y-2 border-b border-slate-800 pb-4">
                      <p className="text-sm font-semibold text-white">{idx + 1}. {q.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => setChapterAnswers({ ...chapterAnswers, [idx]: oIdx })}
                            className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                              chapterAnswers[idx] === oIdx
                                ? 'bg-cyan-600/30 border-cyan-500 text-white font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleChapterQuizSubmit}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all"
                    >
                      Submit Quiz
                    </button>
                    {chapterScore !== null && (
                      <span className="text-sm font-bold text-emerald-400">
                        Score: {chapterScore} / {selectedPost.quiz.length}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
              Select a chapter topic from the left sidebar.
            </div>
          )}
        </main>
      </div>

      {/* Major Exam Modal */}
      {showMajorExam && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Official Major Exam</h2>
              </div>
              <button
                onClick={() => setShowMajorExam(false)}
                className="text-slate-400 hover:text-white font-bold text-sm bg-slate-800 px-3 py-1 rounded-xl"
              >
                Close
              </button>
            </div>

            {!examSubmitted ? (
              <div className="space-y-6">
                {majorExamQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-sm font-bold text-white">{idx + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => setExamAnswers({ ...examAnswers, [idx]: oIdx })}
                          className={`p-3 rounded-xl border text-xs text-left transition-all ${
                            examAnswers[idx] === oIdx
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleMajorExamSubmit}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-sm transition-all shadow-lg"
                >
                  Submit Major Exam
                </button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="text-4xl font-black text-amber-400">
                  {examScore} / {majorExamQuestions.length}
                </div>
                <p className="text-sm text-slate-300">
                  {examScore === majorExamQuestions.length
                    ? 'Outstanding! Perfect score on your Major Exam!'
                    : 'Exam completed. Review your notes and try again to improve your score!'}
                </p>
                <button
                  onClick={() => setShowMajorExam(false)}
                  className="bg-cyan-600 text-white font-bold px-6 py-2 rounded-xl text-xs"
                >
                  Return to Lessons
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}