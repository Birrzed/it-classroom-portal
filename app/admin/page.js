'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function TeacherDashboard() {
  const [grade, setGrade] = useState(7);
  const [weekNumber, setWeekNumber] = useState(1);
  const [chapterTitle, setChapterTitle] = useState('');
  
  // Existing Chapters for Editing
  const [existingChapters, setExistingChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');

  // Optional Fields
  const [noteTitle, setNoteTitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [materialType, setMaterialType] = useState('textbook');
  const [dueDate, setDueDate] = useState('');
  const [quizPdfFile, setQuizPdfFile] = useState(null);

  // Bulk Quiz Parser
  const [quizTitle, setQuizTitle] = useState('');
  const [bulkQuizText, setBulkQuizText] = useState('');
  const [status, setStatus] = useState('');

  // Load chapters when grade changes
  useEffect(() => {
    fetchChapters();
  }, [grade]);

  const fetchChapters = async () => {
    const { data } = await supabase.from('chapters').select('*').eq('grade', parseInt(grade));
    if (data) setExistingChapters(data);
  };

  const handleSelectChapterToEdit = async (chapId) => {
    setSelectedChapterId(chapId);
    if (!chapId) {
      setChapterTitle('');
      setNoteTitle('');
      setInstruction('');
      setVideoUrl('');
      return;
    }

    const chap = existingChapters.find(c => c.id === chapId);
    if (chap) {
      setWeekNumber(chap.week_number);
      setChapterTitle(chap.title);

      // Fetch associated note
      const { data: notes } = await supabase.from('notes').select('*').eq('chapter_id', chapId);
      if (notes && notes.length > 0) {
        setNoteTitle(notes[0].title || '');
        setInstruction(notes[0].content_text || '');
      }

      // Fetch video reference
      const { data: vids } = await supabase.from('reference_materials').select('*').eq('chapter_id', chapId).eq('type', 'video_link');
      if (vids && vids.length > 0) {
        setVideoUrl(vids[0].url || '');
      }
    }
  };

  const parseBulkQuestions = (text) => {
    if (!text.trim()) return [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const parsed = [];
    let currentQ = null;

    lines.forEach(line => {
      const isQuestion = /^(Q\d+[:.]|\d+[:.)])\s*/i.test(line);
      const isOption = /^[A-D][:.)]\s*/i.test(line);
      const isAnswer = /^(Correct Answer|Answer)[:=]\s*/i.test(line);

      if (isQuestion) {
        if (currentQ) parsed.push(currentQ);
        currentQ = { question: line.replace(/^(Q\d+[:.]|\d+[:.)])\s*/i, ''), options: [], correct_answer: '' };
      } else if (isOption && currentQ) {
        currentQ.options.push(line.replace(/^[A-D][:.)]\s*/i, ''));
      } else if (isAnswer && currentQ) {
        currentQ.correct_answer = line.replace(/^(Correct Answer|Answer)[:=]\s*/i, '').trim();
      } else if (currentQ && currentQ.options.length === 0) {
        currentQ.question += ' ' + line;
      }
    });

    if (currentQ) parsed.push(currentQ);
    return parsed;
  };

  const handlePublishOrUpdate = async (e) => {
    e.preventDefault();
    setStatus('Saving content...');

    try {
      const finalTitle = chapterTitle.trim() || `Week ${weekNumber} Content`;
      let chapterId = selectedChapterId;

      if (chapterId) {
        // Update existing chapter
        await supabase.from('chapters').update({ title: finalTitle, week_number: parseInt(weekNumber) }).eq('id', chapterId);
      } else {
        // Check or Create chapter
        const { data: existing } = await supabase.from('chapters').select('id').eq('grade', parseInt(grade)).eq('week_number', parseInt(weekNumber));
        if (existing && existing.length > 0) {
          chapterId = existing[0].id;
          await supabase.from('chapters').update({ title: finalTitle }).eq('id', chapterId);
        } else {
          const { data: newChap, error: cErr } = await supabase.from('chapters').insert([{ grade: parseInt(grade), title: finalTitle, week_number: parseInt(weekNumber) }]).select().single();
          if (cErr) throw cErr;
          chapterId = newChap.id;
        }
      }

      // Notes
      if (instruction.trim() || noteTitle.trim()) {
        await supabase.from('notes').delete().eq('chapter_id', chapterId);
        await supabase.from('notes').insert([{ chapter_id: chapterId, title: noteTitle.trim() || 'Class Notes', content_text: instruction.trim() }]);
      }

      // Video
      if (videoUrl.trim()) {
        await supabase.from('reference_materials').delete().eq('chapter_id', chapterId).eq('type', 'video_link');
        await supabase.from('reference_materials').insert([{ chapter_id: chapterId, title: 'Reference Video', type: 'video_link', url: videoUrl.trim() }]);
      }

      // PDF Material
      if (pdfFile) {
        const fileName = `${Date.now()}_${pdfFile.name}`;
        await supabase.storage.from('materials').upload(fileName, pdfFile);
        const { data: urlData } = supabase.storage.from('materials').getPublicUrl(fileName);
        await supabase.from('reference_materials').insert([{ chapter_id: chapterId, title: pdfFile.name, type: materialType, url: urlData.publicUrl }]);
      }

      // Quiz PDF
      if (quizPdfFile) {
        const qFileName = `quiz_${Date.now()}_${quizPdfFile.name}`;
        await supabase.storage.from('materials').upload(qFileName, quizPdfFile);
        const { data: qUrlData } = supabase.storage.from('materials').getPublicUrl(qFileName);
        await supabase.from('reference_materials').insert([{ chapter_id: chapterId, title: `[PDF Quiz] ${quizPdfFile.name}`, type: 'pdf_quiz', url: qUrlData.publicUrl }]);
      }

      // Quiz Parsing
      if (bulkQuizText.trim()) {
        const parsed = parseBulkQuestions(bulkQuizText);
        if (parsed.length > 0) {
          const { data: quiz } = await supabase.from('quizzes').insert([{ chapter_id: chapterId, title: quizTitle.trim() || 'Classroom Quiz', created_by: 'teacher' }]).select().single();
          if (quiz) {
            const qRows = parsed.map(q => ({ quiz_id: quiz.id, question: q.question, options: q.options, correct_answer: q.correct_answer || q.options[0] || '' }));
            await supabase.from('quiz_questions').insert(qRows);
          }
        }
      }

      setStatus('Success! Post saved/updated successfully.');
      fetchChapters();
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Teacher Classroom Dashboard</h1>
      {status && <div className="p-4 mb-6 bg-blue-100 text-blue-800 rounded font-semibold">{status}</div>}

      <form onSubmit={handlePublishOrUpdate} className="space-y-6">
        {/* Edit Selector */}
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded shadow-sm">
          <h2 className="text-lg font-bold text-yellow-800 mb-2">Edit Existing Post or Create New</h2>
          <select value={selectedChapterId} onChange={(e) => handleSelectChapterToEdit(e.target.value)} className="w-full border p-2 rounded bg-white">
            <option value="">-- Create New Post --</option>
            {existingChapters.map(c => (
              <option key={c.id} value={c.id}>Edit: Week {c.week_number} - {c.title}</option>
            ))}
          </select>
        </div>

        {/* Section 1 */}
        <div className="p-6 bg-white border rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-4">1. Target Grade & Topic <span className="text-gray-400 text-sm">(Optional)</span></h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Grade Level</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full border p-2 rounded mt-1">
                <option value={7}>Grade 7</option>
                <option value={8}>Grade 8</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Week Number</label>
              <input type="number" value={weekNumber} onChange={(e) => setWeekNumber(e.target.value)} className="w-full border p-2 rounded mt-1" />
            </div>
          </div>
          <label className="text-sm font-medium">Chapter Topic Title (Optional)</label>
          <input type="text" placeholder="Unit Topic Title" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} className="w-full border p-2 rounded mt-1" />
        </div>

        {/* Section 2 */}
        <div className="p-6 bg-white border rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-4">2. Classroom Announcement & Instructions <span className="text-gray-400 text-sm">(Optional)</span></h2>
          <input type="text" placeholder="Note Title (Optional)" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="w-full border p-2 rounded mb-4" />
          <textarea placeholder="Write instructions or student overview..." value={instruction} onChange={(e) => setInstruction(e.target.value)} rows={4} className="w-full border p-2 rounded mb-4" />
          <label className="text-sm font-medium">Video Reference Link (Optional)</label>
          <input type="url" placeholder="https://youtube.com/..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full border p-2 rounded mt-1" />
        </div>

        {/* Section 3 */}
        <div className="p-6 bg-white border rounded shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">3. Upload Materials & PDF Quiz <span className="text-gray-400 text-sm">(Optional)</span></h2>
          <div className="grid grid-cols-2 gap-4">
            <select value={materialType} onChange={(e) => setMaterialType(e.target.value)} className="border p-2 rounded">
              <option value="textbook">Textbook PDF</option>
              <option value="pdf_notes">Supplementary PDF Notes</option>
            </select>
            <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} className="border p-1 rounded" />
          </div>
        </div>

        {/* Section 4 */}
        <div className="p-6 bg-white border rounded shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">4. Direct Text Paste Quiz Parser <span className="text-gray-400 text-sm">(Optional)</span></h2>
          <input type="text" placeholder="Quiz Title" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} className="w-full border p-2 rounded" />
          <textarea
            value={bulkQuizText}
            onChange={(e) => setBulkQuizText(e.target.value)}
            placeholder={`1. Question Text\nA. Option 1\nB. Option 2\nAnswer: Option 1`}
            rows={6}
            className="w-full border p-3 rounded font-mono text-sm bg-gray-50"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
          {selectedChapterId ? 'Update Existing Post' : 'Post Announcement & Upload Content'}
        </button>
      </form>
    </div>
  );
}