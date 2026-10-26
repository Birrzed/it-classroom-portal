import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { action, query, topic } = await request.json();

    if (action === 'explain') {
      const explanations = {
        data: 'Data refers to raw, unorganized facts, numbers, or symbols (e.g., 25, "John"). Information is data that has been processed so that it becomes meaningful (e.g., "John scored 25 points").',
        ict: 'ICT stands for Information and Communication Technology. It encompasses hardware, software, networks, and media used to process, transmit, and store digital information.',
        input: 'Input devices allow users to enter data into a computer. Common examples include keyboards, mice, scanners, and microphones.',
      };

      const lowerQ = (query || '').toLowerCase();
      let answer = `In Grade 7 IT (${topic}): Data is raw facts, while Information is processed data with context. Computers follow the IPOS cycle: Input, Processing, Output, and Storage.`;

      if (lowerQ.includes('data') || lowerQ.includes('information')) {
        answer = explanations.data;
      } else if (lowerQ.includes('ict') || lowerQ.includes('it')) {
        answer = explanations.ict;
      } else if (lowerQ.includes('input') || lowerQ.includes('mouse') || lowerQ.includes('keyboard')) {
        answer = explanations.input;
      }

      return NextResponse.json({ success: true, answer });
    }

    // Generate Practice AI Quiz Questions
    const generatedQuestions = [
      {
        question: `Based on ${topic || 'Unit 1'}, which component processes raw data into meaningful information?`,
        options: ['CPU (Central Processing Unit)', 'Keyboard', 'Monitor', 'Hard Drive'],
        correct_answer: 'CPU (Central Processing Unit)'
      },
      {
        question: 'What does the acronym ICT stand for?',
        options: [
          'Information and Communication Technology',
          'Internal Computer Tool',
          'Integrated Communication Technique',
          'Internet Connection Terminal'
        ],
        correct_answer: 'Information and Communication Technology'
      },
      {
        question: 'Which of the following is classified as a secondary storage device?',
        options: ['Hard Disk Drive (HDD)', 'RAM', 'Microprocessor', 'Webcam'],
        correct_answer: 'Hard Disk Drive (HDD)'
      }
    ];

    return NextResponse.json({ success: true, questions: generatedQuestions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}