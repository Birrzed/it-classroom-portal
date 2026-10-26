'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  FileText,
  ChevronRight,
  Key,
  Book,
  Cpu,
  Clock,
  Send,
  MessageCircle,
  Download,
  Presentation,
  Bot,
  Sparkles,
  Loader2,
  CheckCircle2,
  Pin,
  ArrowUp,
  Globe,
  ExternalLink,
  Play,
  BookOpen,
  FileDown,
} from 'lucide-react';

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const getYouTubeEmbedUrl = (rawUrl) => {
  if (!rawUrl) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = rawUrl.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}`;
  }
  return null;
};

export default function StudentPortal() {
  const [grade, setGrade] = useState(7);
  const [activeUnitId, setActiveUnitId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [units, setUnits] = useState([]);

  // AI Assistant State
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Discussion Comments
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Assessment Engine State
  const [activeAssessmentMode, setActiveAssessmentMode] = useState('none');
  const [fullNameWithFather, setFullNameWithFather] = useState('');
  const [studentSex, setStudentSex] = useState('M');
  const [studentSection, setStudentSection] = useState('A');
  const [enteredExamCode, setEnteredExamCode] = useState('');
  const [isExamUnlocked, setIsExamUnlocked] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  const [hasExamNotification, setHasExamNotification] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 250);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedUnits = localStorage.getItem('ict_classroom_units');
    if (savedUnits) {
      try {
        const parsed = JSON.parse(savedUnits);
        setUnits(parsed);
        const firstUnitForGrade = parsed.find((u) => u.grade === grade);
        if (firstUnitForGrade) setActiveUnitId(firstUnitForGrade.id);
      } catch (e) {
        console.error('Failed to parse units', e);
      }
    } else {
      const defaultUnits = [
        {
          id: 1,
          grade: 7,
          chapter: 1,
          week: 1,
          title: 'Introduction to ICT',
          teacherInstructions: 'Read chapter 1 carefully before taking the chapter knowledge test.',
          notesHtml: '<h2>ICT Overview</h2><p style="color:#f8fafc;">ICT stands for <strong>Information and Communication Technology</strong>.</p>',
          videoUrls: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
          referenceWebLink: ['https://en.wikipedia.org/wiki/Information_and_communications_technology'],
          dailyQuiz: [
            { id: 'q1', question: 'Which component is known as the brain of the computer?', options: ['Monitor', 'CPU', 'Keyboard', 'Hard Disk'], correctAnswer: 'B' },
          ],
          majorExam: [
            { id: 'me1', question: 'Major Exam Question: Define the complete IPOS cycle.', options: ['Input-Processing-Output-Storage', 'Input-Power-Output-System'], correctAnswer: 'A' },
          ],
          majorExamCode: 'EXAM7',
          examDurationMinutes: 30,
        },
        {
          id: 2,
          grade: 8,
          chapter: 1,
          week: 1,
          title: 'Basics of Computer & Hardware Concepts',
          teacherInstructions: 'Grade 8 students must review physical computer components.',
          notesHtml: '<h2>Computer Hardware</h2><p style="color:#f8fafc;">Hardware refers to the physical components of a computer system.</p>',
          videoUrls: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
          referenceWebLink: ['https://en.wikipedia.org/wiki/Computer_hardware'],
          dailyQuiz: [
            { id: 'q2', question: 'Which of the following is an input device?', options: ['Printer', 'Mouse', 'Monitor', 'Speaker'], correctAnswer: 'B' },
          ],
          majorExam: [
            { id: 'me2', question: 'Explain the function of RAM in primary memory.', options: ['Volatile storage', 'Permanent storage'], correctAnswer: 'A' },
          ],
          majorExamCode: 'EXAM8',
          examDurationMinutes: 30,
        },
      ];
      setUnits(defaultUnits);
      setActiveUnitId(1);
    }
  }, []);

  const filteredUnits = useMemo(() => {
    return units.filter(
      (u) =>
        u.grade === grade &&
        (u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.notesHtml && u.notesHtml.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [units, grade, searchQuery]);

  const activeUnit = useMemo(() => {
    return units.find((u) => u.id === activeUnitId && u.grade === grade) || filteredUnits[0] || null;
  }, [units, activeUnitId, grade, filteredUnits]);

  const currentGradeTextbookUrl = useMemo(() => {
    const gradeUnits = units.filter((u) => u.grade === grade);
    const unitWithTextbook = gradeUnits.find((u) => u.textbookPdfData && u.textbookPdfData.url);
    return unitWithTextbook ? unitWithTextbook.textbookPdfData.url : null;
  }, [units, grade]);

  const handleGradeSwitch = (targetGrade) => {
    setGrade(targetGrade);
    const targetGradeUnits = units.filter((u) => u.grade === targetGrade);
    if (targetGradeUnits.length > 0) {
      setActiveUnitId(targetGradeUnits[0].id);
    } else {
      setActiveUnitId(null);
    }
    setActiveAssessmentMode('none');
  };

  useEffect(() => {
    if (!activeUnit) return;

    let sourceQuestions = [];
    if (activeAssessmentMode === 'quiz' && activeUnit.dailyQuiz) {
      sourceQuestions = activeUnit.dailyQuiz;
    } else if (activeAssessmentMode === 'exam' && activeUnit.majorExam) {
      sourceQuestions = activeUnit.majorExam;
    }

    if (sourceQuestions.length > 0) {
      const randomized = shuffleArray(sourceQuestions).map((q) => {
        const indexedOptions = q.options.map((opt, idx) => ({
          originalLetter: ['A', 'B', 'C', 'D'][idx],
          text: opt,
        }));
        return { ...q, shuffledOptions: shuffleArray(indexedOptions) };
      });
      setShuffledQuestions(randomized);
    }
  }, [activeUnit, activeAssessmentMode, isExamUnlocked]);

  useEffect(() => {
    if (!activeUnit) return;
    const savedComments = localStorage.getItem(`comments_unit_${activeUnit.id}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      setComments([]);
    }
  }, [activeUnit]);

  useEffect(() => {
    if (activeAssessmentMode !== 'exam' || !isExamUnlocked || hasAlreadySubmitted) return;

    const totalSeconds = (activeUnit?.examDurationMinutes || 30) * 60;
    setTimeLeftSeconds(totalSeconds);

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAssessmentMode, isExamUnlocked, activeUnit, hasAlreadySubmitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !fullNameWithFather.trim()) {
      alert('Please enter your Full Name (with Father Name) in the registration form below before posting.');
      return;
    }

    const commentObj = {
      id: Date.now(),
      author: fullNameWithFather.trim(),
      section: `${grade}${studentSection}`,
      text: newCommentText.trim(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replies: [],
    };

    const updated = [commentObj, ...comments];
    setComments(updated);
    localStorage.setItem(`comments_unit_${activeUnit.id}`, JSON.stringify(updated));
    setNewCommentText('');
  };

  const handleAskAiTutor = (e) => {
    e.preventDefault();
    if (!aiCustomPrompt.trim() || !activeUnit) return;

    setIsAiLoading(true);
    const userQ = aiCustomPrompt.trim();
    setAiCustomPrompt('');

    setTimeout(() => {
      setAiChatHistory((prev) => [
        {
          question: userQ,
          answer: `Grade ${grade} ICT (${activeUnit.title}): "${userQ}" relates directly to our core unit objectives. Review the notes or consult your teacher for full guidance.`,
        },
        ...prev,
      ]);
      setIsAiLoading(false);
    }, 600);
  };

  const handleUnlockMajorExam = () => {
    if (enteredExamCode.trim() === (activeUnit?.majorExamCode || 'EXAM7')) {
      setIsExamUnlocked(true);
    } else {
      alert('❌ Invalid Major Exam PIN Code.');
    }
  };

  const handleSubmitAssessment = () => {
    if (!fullNameWithFather.trim()) {
      alert("Please enter your Full Name (including Father's Name).");
      return;
    }
    setHasAlreadySubmitted(true);
    alert('🎉 Assessment submitted successfully!');
  };

  const scrollToNotesSection = () => {
    const el = document.getElementById('lesson-notes-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-cyan-500 selection:text-slate-950">
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-indigo-500/20 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-cyan-500 p-2 rounded-xl">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-white">ICT STUDENT PORTAL</h1>
              <p className="text-[10px] text-cyan-400 font-mono">Grades 7 & 8 Google Classroom Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setActiveAssessmentMode('exam');
                setIsExamUnlocked(false);
                setHasExamNotification(false);
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
              className="relative bg-amber-600/20 border border-amber-500/50 text-amber-300 hover:bg-amber-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Major Exam</span>
              {hasExamNotification && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>

            {currentGradeTextbookUrl ? (
              <a
                href={currentGradeTextbookUrl}
                download={`Grade_${grade}_Textbook.pdf`}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md"
              >
                <Book className="w-3.5 h-3.5" />
                <span>Grade {grade} Textbook</span>
              </a>
            ) : (
              <button
                onClick={() => alert(`Please upload the Grade ${grade} Official Textbook PDF under Teacher Management Hub first.`)}
                className="bg-slate-800 text-slate-400 font-bold px-3.5 py-1.5 rounded-xl text-xs border border-slate-700 flex items-center gap-1.5"
              >
                <Book className="w-3.5 h-3.5 text-slate-500" />
                <span>Grade {grade} Textbook</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* STICKY LEFT SIDEBAR (GRADE SWITCHER & CHAPTER TOPICS) */}
        <div className="hidden lg:block sticky top-20 z-30 space-y-4">
          <div className="bg-slate-900/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button onClick={() => handleGradeSwitch(7)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${grade === 7 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Grade 7</button>
              <button onClick={() => handleGradeSwitch(8)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${grade === 8 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Grade 8</button>
            </div>

            <input type="text" placeholder="Search chapter topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:outline-none" />

            <div className="space-y-1.5">
              {filteredUnits.length > 0 ? (
                filteredUnits.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { setActiveUnitId(u.id); setActiveAssessmentMode('none'); }}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all flex justify-between items-center ${activeUnit?.id === u.id ? 'bg-gradient-to-r from-indigo-900/80 to-cyan-900/50 border-l-4 border-cyan-400 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <div className="truncate">
                      <span className="text-[10px] text-cyan-400 block font-mono font-bold">Chapter {u.chapter || 1} • Week {u.week}</span>
                      <span className="truncate block">{u.title}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">No lessons published for Grade {grade} yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN SCROLLING CONTENT AREA */}
        <div className="lg:col-span-3 space-y-6">
          {activeUnit ? (
            <>
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
                <span className="text-xs font-bold text-cyan-400 uppercase font-mono tracking-wide flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Grade {activeUnit.grade} • Chapter {activeUnit.chapter || 1} • Week {activeUnit.week}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-1">{activeUnit.title}</h2>
              </div>

              {/* POSTED TEACHER INSTRUCTIONS */}
              {activeUnit.teacherInstructions && (
                <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-2xl space-y-1 shadow-lg">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                    <Pin className="w-3.5 h-3.5 text-amber-400" /> Teacher Instructions
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{activeUnit.teacherInstructions}</p>
                </div>
              )}

              {/* PHYSICAL DOCUMENT DOWNLOADS INCLUDING PDF NOTES */}
              {(activeUnit.notesPdfData?.url || activeUnit.refBookData?.url || activeUnit.textbookPdfData?.url || activeUnit.pptData?.url) && (
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <Book className="w-4 h-4 text-cyan-400" /> Lesson Downloads (Grade {activeUnit.grade})
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {activeUnit.notesPdfData?.url && (
                      <a href={activeUnit.notesPdfData.url} download={activeUnit.notesPdfData.name || 'Lesson_Notes.pdf'} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition shadow">
                        <FileDown className="w-3.5 h-3.5" /> Download Notes (PDF)
                      </a>
                    )}
                    {activeUnit.refBookData?.url && (
                      <a href={activeUnit.refBookData.url} download={activeUnit.refBookData.name} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition shadow">
                        <Download className="w-3.5 h-3.5" /> {activeUnit.refBookData.name || 'Reference Book (PDF)'}
                      </a>
                    )}
                    {activeUnit.textbookPdfData?.url && (
                      <a href={activeUnit.textbookPdfData.url} download={activeUnit.textbookPdfData.name} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition shadow">
                        <Download className="w-3.5 h-3.5" /> {activeUnit.textbookPdfData.name || 'Official Textbook (PDF)'}
                      </a>
                    )}
                    {activeUnit.pptData?.url && (
                      <a href={activeUnit.pptData.url} download={activeUnit.pptData.name} className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition shadow">
                        <Presentation className="w-3.5 h-3.5" /> {activeUnit.pptData.name || 'PowerPoint Presentation'}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* FORMATTED LESSON TEXT NOTES SECTION */}
              <div id="lesson-notes-section" className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl scroll-mt-24">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-3">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" /> Lesson Text Notes
                  </h3>

                  <div className="flex gap-2">
                    {activeUnit.notesPdfData?.url && (
                      <a
                        href={activeUnit.notesPdfData.url}
                        download={activeUnit.notesPdfData.name || 'Lesson_Notes.pdf'}
                        className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow transition"
                      >
                        <FileDown className="w-3.5 h-3.5" /> Notes PDF
                      </a>
                    )}
                    {activeUnit.pptData?.url && (
                      <a
                        href={activeUnit.pptData.url}
                        download={activeUnit.pptData.name}
                        className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Notes PPT
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setActiveAssessmentMode('quiz');
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                      }}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Test Chapter Knowledge
                    </button>
                  </div>
                </div>

                <div className="prose prose-invert text-sm text-slate-100 leading-relaxed max-w-none [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:marker:text-cyan-400" dangerouslySetInnerHTML={{ __html: activeUnit.notesHtml || '<p style="color:#f8fafc;">No notes provided.</p>' }} />
              </div>

              {/* EMBEDDED YOUTUBE VIDEOS & REFERENCE LINKS WITH SANITIZED EMBED PARSER */}
              {((activeUnit.videoUrls && activeUnit.videoUrls.length > 0) || (activeUnit.referenceWebLink && activeUnit.referenceWebLink.length > 0)) && (
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Globe className="w-4 h-4 text-cyan-400" /> Embedded Video Lessons & Reference Links (Grade {activeUnit.grade})
                  </h3>

                  {activeUnit.videoUrls && activeUnit.videoUrls.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeUnit.videoUrls.map((url, idx) => {
                        const embedUrl = getYouTubeEmbedUrl(url);
                        return embedUrl ? (
                          <div key={idx} className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-md">
                            <iframe
                              src={embedUrl}
                              title={`Video ${idx + 1}`}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        ) : (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 transition"
                          >
                            <div className="p-2.5 bg-red-600/20 text-red-400 rounded-lg">
                              <Play className="w-5 h-5 fill-current" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-white truncate">Watch Lesson Video {idx + 1}</p>
                              <p className="text-[10px] text-slate-400 truncate">{url}</p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {activeUnit.referenceWebLink && activeUnit.referenceWebLink.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-slate-400">Reference Web Resources:</span>
                      <div className="flex flex-wrap gap-2">
                        {activeUnit.referenceWebLink.map((link, idx) => (
                          <a key={idx} href={link} target="_blank" rel="noreferrer" className="bg-slate-950 hover:bg-slate-800 text-cyan-400 text-xs px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5 transition">
                            <ExternalLink className="w-3.5 h-3.5" /> {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI TOPIC TUTOR */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Bot className="w-4 h-4 text-cyan-400" /> AI Topic Tutor (Ask Questions About Topic)
                </h3>

                <form onSubmit={handleAskAiTutor} className="flex gap-2">
                  <input
                    type="text"
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder={`Ask AI anything about "${activeUnit.title}"...`}
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:outline-none"
                  />
                  <button type="submit" disabled={isAiLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow">
                    {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Ask AI</span>
                  </button>
                </form>

                {aiChatHistory.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {aiChatHistory.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                        <p className="font-bold text-cyan-400">Q: {item.question}</p>
                        <p className="text-slate-300">🤖 {item.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DISCUSSION COMMENTS */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                  <MessageCircle className="w-4 h-4 text-cyan-400" /> Lesson Discussion & Student Q&A
                </h3>
                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input type="text" value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Post a comment or reply to instructions..." className="flex-1 px-3 py-2 text-xs border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:outline-none" />
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Post</button>
                </form>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {comments.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between text-slate-400"><span className="font-bold text-cyan-400">{c.author} ({c.section})</span><span className="text-[10px]">{c.date}</span></div>
                      <p className="text-slate-200">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ASSESSMENT ENGINE */}
              {activeAssessmentMode !== 'none' && (
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-cyan-400" />
                      {activeAssessmentMode === 'quiz' ? 'Chapter Knowledge Quiz (No Code Needed)' : 'Protected Major Exam'}
                    </h3>
                    {activeAssessmentMode === 'exam' && isExamUnlocked && (
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-700/60 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {formatTime(timeLeftSeconds)}
                      </span>
                    )}
                  </div>

                  {activeAssessmentMode === 'exam' && !isExamUnlocked ? (
                    <div className="p-6 bg-slate-950 rounded-xl text-center space-y-3 border border-slate-800">
                      <Key className="w-8 h-8 text-amber-400 mx-auto" />
                      <p className="text-xs text-slate-400">Enter Major Exam Security PIN Code</p>
                      <div className="flex max-w-xs mx-auto gap-2">
                        <input type="password" value={enteredExamCode} onChange={(e) => setEnteredExamCode(e.target.value)} placeholder="Enter Exam PIN" className="flex-1 px-3 py-2 border border-slate-800 bg-slate-900 rounded-lg text-center font-mono text-cyan-400 font-bold" />
                        <button onClick={handleUnlockMajorExam} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-xs transition">Unlock Exam</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Full Name (including Father Name)</label>
                          <input type="text" value={fullNameWithFather} onChange={(e) => setFullNameWithFather(e.target.value)} placeholder="e.g. Abebe Bikila Kebede" className="w-full p-2 text-xs bg-slate-900 rounded border border-slate-800 text-slate-200" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Sex</label>
                          <select value={studentSex} onChange={(e) => setStudentSex(e.target.value)} className="w-full p-2 text-xs bg-slate-900 rounded border border-slate-800 text-slate-200">
                            <option value="M">Male (M)</option>
                            <option value="F">Female (F)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Grade & Section</label>
                          <select value={studentSection} onChange={(e) => setStudentSection(e.target.value)} className="w-full p-2 text-xs bg-slate-900 rounded border border-slate-800 text-cyan-400 font-bold">
                            {grade === 7 ? (
                              <>
                                <option value="A">Section 7A</option>
                                <option value="B">Section 7B</option>
                                <option value="C">Section 7C</option>
                              </>
                            ) : (
                              <>
                                <option value="A">Section 8A</option>
                                <option value="B">Section 8B</option>
                                <option value="C">Section 8C</option>
                                <option value="D">Section 8D</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>

                      {shuffledQuestions.map((q, qIdx) => (
                        <div key={q.id} className="p-4 border border-slate-800 rounded-xl space-y-2 bg-slate-950">
                          <p className="font-bold text-xs">{qIdx + 1}. {q.question}</p>
                          {q.shuffledOptions.map((optObj, oIdx) => (
                            <button key={oIdx} onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optObj.originalLetter })} className={`w-full text-left p-2.5 rounded text-xs border transition ${selectedAnswers[q.id] === optObj.originalLetter ? 'bg-indigo-900 border-cyan-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}`}>
                              <strong>{['A','B','C','D'][oIdx]}.</strong> {optObj.text}
                            </button>
                          ))}
                        </div>
                      ))}

                      {!hasAlreadySubmitted && (
                        <button onClick={handleSubmitAssessment} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs transition shadow-lg">Submit Assessment</button>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/80 rounded-2xl border border-slate-800">No lessons published for Grade {grade} yet. Add a lesson in the Teacher Portal!</div>
          )}
        </div>
      </div>

      {/* FLOATING ACTION TOOLBAR */}
      {showScrollTop && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
          <button
            onClick={scrollToNotesSection}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2.5 rounded-full shadow-2xl text-xs font-bold transition-all flex items-center gap-1.5 border border-cyan-400"
            title="Jump back up to Lesson Notes"
          >
            <FileText className="w-4 h-4" /> Notes
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-2xl transition-all border border-indigo-400 flex items-center justify-center"
            title="Scroll to top of page"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}