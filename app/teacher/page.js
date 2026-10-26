'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Lock,
  Edit3,
  BarChart2,
  FileSpreadsheet,
  Cpu,
  Key,
  Video,
  FileText,
  Link as LinkIcon,
  Trash2,
  List,
  Save,
  MessageCircle,
  Send,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ListOrdered,
  List as ListIcon,
  Sparkles,
  Upload,
  CheckCircle,
  Palette,
  Award,
  HelpCircle,
  ArrowUp,
  Globe,
  Pin,
  BookOpen,
  Type,
  Highlighter,
  Eraser,
  FileDown,
} from 'lucide-react';

export default function TeacherDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [teacherPasscode, setTeacherPasscode] = useState('1234');
  const [newPasscode, setNewPasscode] = useState('');

  const [teacherTab, setTeacherTab] = useState('editor');
  const [selectedReportType, setSelectedReportType] = useState('single_quiz');

  // Published Units
  const [publishedUnits, setPublishedUnits] = useState([]);

  // Discussion Comments
  const [allComments, setAllComments] = useState([]);
  const [selectedUnitForReplies, setSelectedUnitForReplies] = useState(null);
  const [teacherReplyText, setTeacherReplyText] = useState({});

  // Unit Editor State
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [gradeLevel, setGradeLevel] = useState(7);
  const [chapterNum, setChapterNum] = useState(1);
  const [weekNum, setWeekNum] = useState(1);
  const [unitTitle, setUnitTitle] = useState('');
  const [teacherInstructions, setTeacherInstructions] = useState('');

  // Physical File States
  const [notesPdfData, setNotesPdfData] = useState({ name: '', url: '' });
  const [refBookData, setRefBookData] = useState({ name: '', url: '' });
  const [textbookPdfData, setTextbookPdfData] = useState({ name: '', url: '' });
  const [pptData, setPptData] = useState({ name: '', url: '' });

  // Web & Video Link Inputs
  const [videoUrlsInput, setVideoUrlsInput] = useState('');
  const [referenceWebLink, setReferenceWebLink] = useState('');

  // Notes Canvas HTML & Formatting State
  const [notesHtml, setNotesHtml] = useState('<p style="color:#f8fafc;">Write or paste lesson notes here...</p>');
  const [selectedFontSize, setSelectedFontSize] = useState('16pt');
  const [selectedFontFamily, setSelectedFontFamily] = useState('Calibri');
  const [textColor, setTextColor] = useState('#f8fafc');
  const [bgColor, setBgColor] = useState('transparent');
  const editorRef = useRef(null);

  // Daily Quiz & Major Exam Question Text
  const [dailyQuizText, setDailyQuizText] = useState(
    `1. Which component is known as the brain of the computer?\nA. Monitor\nB. CPU\nC. Keyboard\nD. Hard Disk\nAnswer: B`
  );

  const [majorExamText, setMajorExamText] = useState(
    `1. Major Exam Question: Define the complete IPOS cycle in detail.\nA. Input-Processing-Output-Storage\nB. Input-Power-Output-System\nC. Internal-Process-Open-Source\nD. None of the above\nAnswer: A`
  );

  const [majorExamCode, setMajorExamCode] = useState('EXAM7');
  const [examDuration, setExamDuration] = useState(30);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedPin = localStorage.getItem('teacher_passcode');
    if (savedPin) setTeacherPasscode(savedPin);

    const savedUnits = localStorage.getItem('ict_classroom_units');
    if (savedUnits) {
      try {
        const parsed = JSON.parse(savedUnits);
        setPublishedUnits(parsed);
        if (parsed.length > 0) setSelectedUnitForReplies(parsed[0].id);
      } catch (e) {
        console.error('Failed to load saved units', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedUnitForReplies) return;
    const savedComments = localStorage.getItem(`comments_unit_${selectedUnitForReplies}`);
    if (savedComments) {
      setAllComments(JSON.parse(savedComments));
    } else {
      setAllComments([]);
    }
  }, [selectedUnitForReplies]);

  const handleFileUpload = (e, setFileState) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFileState({ name: file.name, url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === teacherPasscode) {
      setIsAuthenticated(true);
    } else {
      alert('❌ Incorrect Administrative PIN.');
    }
  };

  const handleChangePasscode = (e) => {
    e.preventDefault();
    if (!newPasscode.trim()) return;
    localStorage.setItem('teacher_passcode', newPasscode.trim());
    setTeacherPasscode(newPasscode.trim());
    setNewPasscode('');
    alert('✅ Teacher PIN updated successfully!');
  };

  const executeFormatCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) setNotesHtml(editorRef.current.innerHTML);
  };

  const applyCustomFontFamily = (fontName) => {
    setSelectedFontFamily(fontName);
    document.execCommand('fontName', false, fontName);
    if (editorRef.current) setNotesHtml(editorRef.current.innerHTML);
  };

  const applyCustomFontSize = (ptSize) => {
    setSelectedFontSize(ptSize);
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    
    // Create span wrapper to enforce exact pt sizing on selected text/numbers
    const span = document.createElement('span');
    span.style.fontSize = ptSize;
    try {
      range.surroundContents(span);
    } catch (e) {
      document.execCommand('fontSize', false, '4');
    }
    if (editorRef.current) setNotesHtml(editorRef.current.innerHTML);
  };

  const applyTextColor = (colorVal) => {
    setTextColor(colorVal);
    document.execCommand('foreColor', false, colorVal);
    if (editorRef.current) setNotesHtml(editorRef.current.innerHTML);
  };

  const applyHighlightColor = (colorVal) => {
    setBgColor(colorVal);
    document.execCommand('hiliteColor', false, colorVal);
    if (editorRef.current) setNotesHtml(editorRef.current.innerHTML);
  };

  const forceWhiteFormatting = () => {
    if (!editorRef.current) return;
    const allElements = editorRef.current.querySelectorAll('*');
    allElements.forEach((el) => {
      el.style.color = '#f8fafc';
      if (el.style.backgroundColor && el.style.backgroundColor !== 'transparent') {
        el.style.backgroundColor = 'transparent';
      }
    });
    setNotesHtml(editorRef.current.innerHTML);
  };

  // FULL MS WORD PASTE PRESERVATION: PRESERVES ALIGNMENTS, SPACING, MARGINS, BULLETS & NUMBERS
  const handlePasteInEditor = (e) => {
    e.preventDefault();
    const pastedHtml = e.clipboardData.getData('text/html');
    const pastedText = e.clipboardData.getData('text/plain');

    if (pastedHtml) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pastedHtml;

      // Clean up Word meta tags and comment objects without removing visual layout
      const unwanted = tempDiv.querySelectorAll('comment, xml, meta, link');
      unwanted.forEach((node) => node.remove());

      // Traverse nodes to enforce readable white color while retaining text-align, line-height, and margins
      const allElements = tempDiv.querySelectorAll('*');
      allElements.forEach((el) => {
        // Enforce readable white text color
        el.style.color = '#f8fafc';

        // Retain center alignment and explicit margin spacing from Word
        if (el.getAttribute('align')) {
          el.style.textAlign = el.getAttribute('align');
        }

        // Clean dark or conflicting inline background fills
        if (el.style.backgroundColor && el.style.backgroundColor !== 'transparent') {
          el.style.backgroundColor = 'transparent';
        }
      });

      document.execCommand('insertHTML', false, `<div style="color:#f8fafc;">${tempDiv.innerHTML}</div>`);
    } else if (pastedText) {
      // Preserve original line gaps and spacing for plain text pastes
      const formattedLines = pastedText
        .split('\n')
        .map((line) => {
          if (!line.trim()) return '<p style="color:#f8fafc; min-height: 1.2em;"></p>';
          return `<p style="color:#f8fafc; margin-bottom: 6px; line-height: 1.5;">${line}</p>`;
        })
        .join('');
      document.execCommand('insertHTML', false, `<div>${formattedLines}</div>`);
    }

    if (editorRef.current) {
      setNotesHtml(editorRef.current.innerHTML);
    }
  };

  const parsePastedQuestions = (text) => {
    const blocks = text.split(/\n\s*\n/);
    const parsedList = [];

    blocks.forEach((block, idx) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      let questionText = lines[0].replace(/^\d+[\.\)]\s*/, '');
      let options = [];
      let correctAnswer = 'A';

      lines.slice(1).forEach((line) => {
        if (/^Answer:/i.test(line)) {
          correctAnswer = line.replace(/^Answer:\s*/i, '').trim().toUpperCase();
        } else if (/^[A-D][\.\)]/i.test(line)) {
          options.push(line.replace(/^[A-D][\.\)]\s*/i, ''));
        }
      });

      if (options.length === 0) options = ['Option A', 'Option B', 'Option C', 'Option D'];

      parsedList.push({
        id: `q_${idx}_${Date.now()}`,
        question: questionText,
        options,
        correctAnswer: correctAnswer.length === 1 ? correctAnswer : 'A',
      });
    });

    return parsedList;
  };

  const handleStartEdit = (unit) => {
    setEditingUnitId(unit.id);
    setGradeLevel(unit.grade);
    setChapterNum(unit.chapter || 1);
    setWeekNum(unit.week);
    setUnitTitle(unit.title);
    setTeacherInstructions(unit.teacherInstructions || '');
    setNotesPdfData(unit.notesPdfData || { name: '', url: '' });
    setRefBookData(unit.refBookData || { name: '', url: '' });
    setTextbookPdfData(unit.textbookPdfData || { name: '', url: '' });
    setPptData(unit.pptData || { name: '', url: '' });
    setVideoUrlsInput(unit.videoUrls ? unit.videoUrls.join(', ') : '');
    setReferenceWebLink(unit.referenceWebLink ? unit.referenceWebLink.join(', ') : '');
    setNotesHtml(unit.notesHtml || '');

    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = unit.notesHtml || '';
    }, 50);

    setDailyQuizText(unit.dailyQuizText || '');
    setMajorExamText(unit.majorExamText || '');
    setMajorExamCode(unit.majorExamCode || 'EXAM7');
    setExamDuration(unit.examDurationMinutes || 30);
    setTeacherTab('editor');
  };

  const handleDeleteUnit = (id) => {
    if (confirm('Are you sure you want to permanently delete this unit?')) {
      const updated = publishedUnits.filter((u) => u.id !== id);
      setPublishedUnits(updated);
      localStorage.setItem('ict_classroom_units', JSON.stringify(updated));
      alert('🗑️ Unit deleted successfully!');
    }
  };

  const handleSaveUnit = () => {
    if (!unitTitle.trim()) {
      alert('Please provide a Unit Title.');
      return;
    }

    const formattedVideoUrls = videoUrlsInput
      .split(',')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const formattedWebLinks = referenceWebLink
      .split(',')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const parsedDailyQuiz = parsePastedQuestions(dailyQuizText);
    const parsedMajorExam = parsePastedQuestions(majorExamText);

    const unitData = {
      id: editingUnitId ? editingUnitId : Date.now(),
      grade: parseInt(gradeLevel),
      chapter: parseInt(chapterNum),
      week: parseInt(weekNum),
      title: unitTitle,
      teacherInstructions,
      notesPdfData,
      refBookData,
      textbookPdfData,
      pptData,
      videoUrls: formattedVideoUrls,
      referenceWebLink: formattedWebLinks,
      notesHtml: editorRef.current ? editorRef.current.innerHTML : notesHtml,
      dailyQuizText,
      dailyQuiz: parsedDailyQuiz,
      majorExamText,
      majorExam: parsedMajorExam,
      majorExamCode,
      examDurationMinutes: parseInt(examDuration),
    };

    let updatedList = [];
    if (editingUnitId) {
      updatedList = publishedUnits.map((u) => (u.id === editingUnitId ? unitData : u));
    } else {
      updatedList = [unitData, ...publishedUnits];
    }

    setPublishedUnits(updatedList);
    localStorage.setItem('ict_classroom_units', JSON.stringify(updatedList));

    setEditingUnitId(null);
    setUnitTitle('');
    setTeacherInstructions('');
    setNotesHtml('<p style="color:#f8fafc;"></p>');
    if (editorRef.current) editorRef.current.innerHTML = '';
    setNotesPdfData({ name: '', url: '' });
    setRefBookData({ name: '', url: '' });
    setTextbookPdfData({ name: '', url: '' });
    setPptData({ name: '', url: '' });
    setVideoUrlsInput('');
    setReferenceWebLink('');
    alert(editingUnitId ? '✅ Unit updated successfully!' : '🎉 Unit published successfully!');
  };

  const handleTeacherReply = (commentId) => {
    const replyMsg = teacherReplyText[commentId];
    if (!replyMsg || !replyMsg.trim()) return;

    const updated = allComments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [
            ...(c.replies || []),
            { author: 'Teacher', text: replyMsg.trim(), date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          ],
        };
      }
      return c;
    });

    setAllComments(updated);
    localStorage.setItem(`comments_unit_${selectedUnitForReplies}`, JSON.stringify(updated));
    setTeacherReplyText((prev) => ({ ...prev, [commentId]: '' }));
  };

  const exportSectionToExcel = (targetSection) => {
    const sampleScores = [
      { id: 1, type: 'quiz', name: 'Abebe Bikila (Father: Bikila)', sex: 'M', grade: 7, section: '7A', unit: 'Chapter 1: Intro to ICT', score: '5 / 5', percentage: 100, date: new Date().toLocaleDateString() },
      { id: 2, type: 'exam', name: 'Saba Hailu (Father: Hailu)', sex: 'F', grade: 7, section: '7A', unit: 'Chapter 1: Intro to ICT', score: '10 / 10', percentage: 100, date: new Date().toLocaleDateString() },
    ];

    let filteredRecords = sampleScores.filter((s) => s.section === targetSection);

    if (selectedReportType === 'single_quiz') {
      filteredRecords = filteredRecords.filter((s) => s.type === 'quiz');
    } else if (selectedReportType === 'major_exam') {
      filteredRecords = filteredRecords.filter((s) => s.type === 'exam');
    }

    if (filteredRecords.length === 0) {
      alert(`No score records found for Section ${targetSection}.`);
      return;
    }

    filteredRecords.sort((a, b) => a.name.localeCompare(b.name));

    const exportData = filteredRecords.map((r, idx) => ({
      'No': idx + 1,
      'Full Name (with Father Name)': r.name,
      'Sex': r.sex,
      'Grade & Section': r.section,
      'Assessment Category': r.type === 'quiz' ? 'Chapter Quiz' : 'Major Exam',
      'Chapter / Unit Title': r.unit,
      'Score': r.score,
      'Percentage (%)': `${r.percentage}%`,
      'Submission Date': r.date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Section_${targetSection}`);

    XLSX.writeFile(workbook, `Assessment_Report_Section_${targetSection}_${selectedReportType.toUpperCase()}.xlsx`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl max-w-md w-full space-y-4 shadow-2xl text-center">
          <div className="bg-indigo-600/20 p-3 rounded-2xl w-fit mx-auto border border-indigo-500/30">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Teacher Verification Hub</h2>
          <p className="text-xs text-slate-400">Enter your administrative PIN passcode to access teacher controls.</p>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN (Default: 1234)"
              className="w-full px-4 py-3 border border-slate-800 bg-slate-950 rounded-xl text-center font-mono font-bold text-cyan-400 text-lg focus:outline-none"
            />
            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition">
              Unlock Hub
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-indigo-500/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-cyan-500 p-2 rounded-xl">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-white tracking-wide">TEACHER MANAGEMENT HUB</h1>
              <p className="text-[10px] text-cyan-400 font-mono">Microsoft Word Editor & Document Portal</p>
            </div>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1.5 rounded-xl border border-slate-700 font-bold flex items-center gap-1"
          >
            <ArrowUp className="w-3.5 h-3.5" /> Top
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 p-4 rounded-2xl border border-slate-800 gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white">ICT Content Studio</h2>
            <p className="text-xs text-slate-400">Word paste preservation (Center align, spaces, fonts, bolds, numbers), PDF uploader & grade management.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button onClick={() => { setEditingUnitId(null); setTeacherTab('editor'); }} className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${teacherTab === 'editor' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Edit3 className="w-4 h-4" /> {editingUnitId ? 'Edit Unit' : 'New Lesson & Quiz'}
            </button>
            <button onClick={() => setTeacherTab('majorexam')} className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${teacherTab === 'majorexam' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Award className="w-4 h-4" /> Major Exam Builder
            </button>
            <button onClick={() => setTeacherTab('manage')} className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${teacherTab === 'manage' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <List className="w-4 h-4" /> Units ({publishedUnits.length})
            </button>
            <button onClick={() => setTeacherTab('replies')} className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${teacherTab === 'replies' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <MessageCircle className="w-4 h-4" /> Student Replies
            </button>
            <button onClick={() => setTeacherTab('analytics')} className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${teacherTab === 'analytics' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <BarChart2 className="w-4 h-4" /> Reports
            </button>
            <button onClick={() => setTeacherTab('passcode')} className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${teacherTab === 'passcode' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Key className="w-4 h-4" /> Security PIN
            </button>
          </div>
        </div>

        {teacherTab === 'editor' ? (
          <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <h3 className="font-bold text-white border-b border-slate-800 pb-2 text-sm">
              {editingUnitId ? '📝 Edit Existing Lesson & Chapter Quiz' : '➕ Create New Lesson Post & Chapter Quiz'}
            </h3>

            {/* GRADE, CHAPTER, WEEK, TITLE INPUTS */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Target Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full border border-slate-800 p-2.5 rounded-xl text-xs bg-slate-950 text-cyan-400 font-bold">
                  <option value={7}>Grade 7</option>
                  <option value={8}>Grade 8</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-cyan-400 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Chapter / Unit No.
                </label>
                <input type="number" value={chapterNum} onChange={(e) => setChapterNum(e.target.value)} min={1} className="w-full border border-slate-800 p-2.5 rounded-xl text-xs bg-slate-950 text-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Week Number</label>
                <input type="number" value={weekNum} onChange={(e) => setWeekNum(e.target.value)} min={1} className="w-full border border-slate-800 p-2.5 rounded-xl text-xs bg-slate-950 text-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Chapter Title</label>
                <input type="text" value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} placeholder="e.g. Basics of Computer" className="w-full border border-slate-800 p-2.5 rounded-xl text-xs bg-slate-950 text-slate-200" />
              </div>
            </div>

            {/* TEACHER INSTRUCTIONS POST AREA */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-cyan-400 uppercase font-mono flex items-center gap-1.5">
                <Pin className="w-4 h-4 text-cyan-400" /> Post Teacher Instructions (Displayed above lesson notes)
              </label>
              <textarea
                rows={3}
                value={teacherInstructions}
                onChange={(e) => setTeacherInstructions(e.target.value)}
                placeholder="Write specific guidelines or reading instructions for students..."
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
              />
            </div>

            {/* MS WORD STYLE RICH TEXT TOOLBAR & NOTES EDITOR CANVAS */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-cyan-400">Lesson Text Notes Canvas (Full Microsoft Word Alignment & Spacing Supported)</label>
              <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-950 border border-slate-800 border-b-0 rounded-t-xl sticky top-14 z-20">
                
                {/* Font Family Selector */}
                <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-xs">
                  <select
                    value={selectedFontFamily}
                    onChange={(e) => applyCustomFontFamily(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-semibold"
                  >
                    <option value="Calibri" className="bg-slate-900">Calibri</option>
                    <option value="Arial" className="bg-slate-900">Arial</option>
                    <option value="Times New Roman" className="bg-slate-900">Times New Roman</option>
                    <option value="Georgia" className="bg-slate-900">Georgia</option>
                    <option value="Courier New" className="bg-slate-900">Courier New</option>
                    <option value="Verdana" className="bg-slate-900">Verdana</option>
                  </select>
                </div>

                {/* Font Size Selector (Sizes apply to all text and numbers) */}
                <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-xs">
                  <Type className="w-3.5 h-3.5 text-cyan-400" />
                  <select
                    value={selectedFontSize}
                    onChange={(e) => applyCustomFontSize(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="10pt" className="bg-slate-900">10 pt</option>
                    <option value="12pt" className="bg-slate-900">12 pt</option>
                    <option value="14pt" className="bg-slate-900">14 pt</option>
                    <option value="16pt" className="bg-slate-900">16 pt</option>
                    <option value="18pt" className="bg-slate-900">18 pt</option>
                    <option value="20pt" className="bg-slate-900">20 pt</option>
                    <option value="24pt" className="bg-slate-900">24 pt</option>
                    <option value="32pt" className="bg-slate-900">32 pt</option>
                  </select>
                </div>

                <div className="h-4 w-px bg-slate-800 mx-1"></div>

                <button type="button" onClick={() => executeFormatCommand('bold')} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded text-xs font-bold border border-slate-800" title="Bold (Ctrl+B)"><Bold className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => executeFormatCommand('italic')} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded text-xs font-bold border border-slate-800" title="Italic (Ctrl+I)"><Italic className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => executeFormatCommand('underline')} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded text-xs font-bold border border-slate-800" title="Underline (Ctrl+U)"><Underline className="w-3.5 h-3.5" /></button>

                <div className="h-4 w-px bg-slate-800 mx-1"></div>

                {/* Text Color */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800" title="Font Color">
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => applyTextColor(e.target.value)}
                    className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                  />
                </div>

                {/* Highlight Color */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800" title="Text Highlight Color">
                  <Highlighter className="w-3.5 h-3.5 text-amber-400" />
                  <input
                    type="color"
                    value={bgColor === 'transparent' ? '#f59e0b' : bgColor}
                    onChange={(e) => applyHighlightColor(e.target.value)}
                    className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                  />
                </div>

                <div className="h-4 w-px bg-slate-800 mx-1"></div>

                {/* Alignments (Left, Center, Right, Justify) */}
                <button type="button" onClick={() => executeFormatCommand('justifyLeft')} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded text-xs border border-slate-800" title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => executeFormatCommand('justifyCenter')} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded text-xs border border-slate-800" title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => executeFormatCommand('justifyRight')} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded text-xs border border-slate-800" title="Align Right"><AlignRight className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => executeFormatCommand('justifyFull')} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded text-xs border border-slate-800" title="Justify"><AlignJustify className="w-3.5 h-3.5" /></button>

                <div className="h-4 w-px bg-slate-800 mx-1"></div>

                {/* Lists */}
                <button type="button" onClick={() => executeFormatCommand('insertUnorderedList')} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded text-xs font-bold border border-slate-800" title="Bullet List"><ListIcon className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => executeFormatCommand('insertOrderedList')} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded text-xs font-bold border border-slate-800" title="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></button>

                <div className="h-4 w-px bg-slate-800 mx-1"></div>

                {/* Force White Formatting Button */}
                <button type="button" onClick={forceWhiteFormatting} className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold shadow flex items-center gap-1">
                  <Eraser className="w-3.5 h-3.5" /> Force White Text
                </button>
              </div>

              <div
                ref={editorRef}
                contentEditable
                onPaste={handlePasteInEditor}
                onInput={() => setNotesHtml(editorRef.current?.innerHTML)}
                className="w-full min-h-[460px] p-6 bg-slate-950 border border-slate-800 rounded-b-xl text-slate-100 text-sm focus:outline-none leading-relaxed overflow-y-auto [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:marker:text-cyan-400"
                style={{ color: '#f8fafc', fontFamily: selectedFontFamily }}
              />
            </div>

            {/* DAILY CHAPTER QUIZ PASTE BOX */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-cyan-400 uppercase font-mono flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" /> Daily Chapter Knowledge Quiz (No PIN Code required for students)
              </span>
              <textarea
                rows={8}
                value={dailyQuizText}
                onChange={(e) => setDailyQuizText(e.target.value)}
                placeholder="Paste daily quiz questions here..."
                className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>

            {/* PHYSICAL FILE UPLOADER */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-cyan-400 uppercase font-mono block flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-cyan-400" /> Upload Grade {gradeLevel} Documents from Computer
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-cyan-400">1. Lesson Notes File (PDF)</label>
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setNotesPdfData)} className="block w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-600 file:text-white cursor-pointer" />
                  {notesPdfData.name && <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono"><CheckCircle className="w-3 h-3" /> {notesPdfData.name}</p>}
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-300">2. Reference Book (PDF)</label>
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setRefBookData)} className="block w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer" />
                  {refBookData.name && <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono"><CheckCircle className="w-3 h-3" /> {refBookData.name}</p>}
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-300">3. Official Textbook (PDF)</label>
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setTextbookPdfData)} className="block w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer" />
                  {textbookPdfData.name && <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono"><CheckCircle className="w-3 h-3" /> {textbookPdfData.name}</p>}
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-300">4. PowerPoint (.ppt/.pptx)</label>
                  <input type="file" accept=".ppt,.pptx,.pdf" onChange={(e) => handleFileUpload(e, setPptData)} className="block w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white cursor-pointer" />
                  {pptData.name && <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono"><CheckCircle className="w-3 h-3" /> {pptData.name}</p>}
                </div>
              </div>
            </div>

            {/* WEB & YOUTUBE LINK UPLOADER */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-cyan-400 uppercase font-mono block flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" /> Share YouTube Videos & Reference Web Links (Grade {gradeLevel})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-cyan-400" /> YouTube Video Embed Links (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={videoUrlsInput}
                    onChange={(e) => setVideoUrlsInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=123, https://youtu.be/456"
                    className="w-full border border-slate-800 p-2.5 rounded-xl text-xs bg-slate-900 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-cyan-400" /> Reference Web Links (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={referenceWebLink}
                    onChange={(e) => setReferenceWebLink(e.target.value)}
                    placeholder="https://wikipedia.org, https://geeksforgeeks.org"
                    className="w-full border border-slate-800 p-2.5 rounded-xl text-xs bg-slate-900 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button onClick={handleSaveUnit} className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-90 text-white py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg">
              <Save className="w-4 h-4" /> {editingUnitId ? 'Save Edits to Grade ' + gradeLevel + ' Lesson' : 'Publish Post to Grade ' + gradeLevel}
            </button>
          </div>
        ) : teacherTab === 'majorexam' ? (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Award className="w-5 h-5 text-amber-400" /> Major Exam Creator & Passcode Protection Setup
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-amber-400 mb-1">Assign Major Exam Security PIN Code</label>
                <input
                  type="text"
                  value={majorExamCode}
                  onChange={(e) => setMajorExamCode(e.target.value)}
                  placeholder="e.g. EXAM7"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-cyan-400 font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-400 mb-1">Exam Duration (Minutes)</label>
                <input
                  type="number"
                  value={examDuration}
                  onChange={(e) => setExamDuration(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Bulk Paste Major Exam Questions (Auto-Shuffled for Students)
              </span>
              <textarea
                rows={12}
                value={majorExamText}
                onChange={(e) => setMajorExamText(e.target.value)}
                placeholder="Paste major exam questions here..."
                className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>

            <button onClick={handleSaveUnit} className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg">
              <Save className="w-4 h-4" /> Save Major Exam Configuration
            </button>
          </div>
        ) : teacherTab === 'manage' ? (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base">Manage Published Units</h3>
            {publishedUnits.map((u) => (
              <div key={u.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold">Grade {u.grade} • Chapter {u.chapter || 1} • Week {u.week}</span>
                  <h4 className="font-bold text-sm text-white">{u.title}</h4>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleStartEdit(u)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => handleDeleteUnit(u.id)} className="bg-red-600/20 text-red-300 border border-red-500/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : teacherTab === 'replies' ? (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2"><MessageCircle className="w-5 h-5 text-cyan-400" /> Student Discussion Replies</h3>
              <select value={selectedUnitForReplies || ''} onChange={(e) => setSelectedUnitForReplies(e.target.value)} className="border border-slate-800 p-2 rounded-xl text-xs bg-slate-950 text-cyan-400 font-bold">
                {publishedUnits.map((u) => (<option key={u.id} value={u.id}>Grade {u.grade} - Ch.{u.chapter || 1} Wk.{u.week}: {u.title}</option>))}
              </select>
            </div>
            <div className="space-y-4 pt-2">
              {allComments.map((c) => (
                <div key={c.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-mono"><span className="font-bold text-cyan-400">{c.author} ({c.section})</span><span className="text-slate-500">{c.date}</span></div>
                  <p className="text-sm text-slate-200">{c.text}</p>
                  <div className="flex gap-2 pt-2">
                    <input type="text" value={teacherReplyText[c.id] || ''} onChange={(e) => setTeacherReplyText({ ...teacherReplyText, [c.id]: e.target.value })} placeholder="Reply to student..." className="flex-1 px-3 py-1.5 text-xs border border-slate-800 rounded-lg bg-slate-900 text-slate-200 focus:outline-none" />
                    <button onClick={() => handleTeacherReply(c.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Reply</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : teacherTab === 'passcode' ? (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl max-w-md mx-auto space-y-4">
            <h3 className="font-bold text-white text-base">Security PIN Passcode</h3>
            <form onSubmit={handleChangePasscode} className="space-y-3">
              <input type="password" value={newPasscode} onChange={(e) => setNewPasscode(e.target.value)} placeholder="Enter new PIN" className="w-full px-4 py-2.5 border border-slate-800 bg-slate-950 rounded-xl font-mono text-center text-cyan-400 font-bold" />
              <button type="submit" className="w-full bg-amber-600 text-white py-2.5 rounded-xl font-bold text-xs">Update Security PIN</button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-lg">📊 Alphabetized Excel Assessment Reports</h3>
                <p className="text-xs text-slate-400">Download rosters sorted alphabetically by Student Name.</p>
              </div>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                <button onClick={() => setSelectedReportType('single_quiz')} className={`px-3 py-1.5 rounded-lg ${selectedReportType === 'single_quiz' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                  Single Quiz
                </button>
                <button onClick={() => setSelectedReportType('major_exam')} className={`px-3 py-1.5 rounded-lg ${selectedReportType === 'major_exam' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>
                  Major Exam
                </button>
                <button onClick={() => setSelectedReportType('semester_all')} className={`px-3 py-1.5 rounded-lg ${selectedReportType === 'semester_all' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>
                  Semester Aggregate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {['7A', '7B', '7C', '8A', '8B', '8C', '8D'].map((sec) => (
                <button key={sec} onClick={() => exportSectionToExcel(sec)} className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl text-left font-bold text-emerald-400 text-sm flex items-center justify-between hover:border-emerald-500 transition">
                  <span>Section {sec}</span>
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-indigo-600 text-white p-3.5 rounded-full shadow-2xl hover:bg-indigo-500 transition-all z-50 border border-indigo-400"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}