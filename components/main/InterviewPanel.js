"use client";
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '@/app/api';
import MessageRenderer from './MessageRenderer';

// ── Icons ──────────────────────────────────────────────────────────────────────
const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" style={{ width: 20, height: 20 }}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
    <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" style={{ width: 13, height: 13 }}>
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const CATEGORY_LABELS = {
  architecture: '🏗️ Architecture',
  scaling: '📈 Scaling',
  security: '🔒 Security',
  debugging: '🐛 Debugging',
  tradeoffs: '⚖️ Trade-offs',
  dependencies: '📦 Dependencies',
};

const Spinner = ({ size = 16 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    border: '2px solid var(--border)', borderTopColor: 'var(--accent)',
    animation: 'spin 0.7s linear infinite',
  }} />
);

// ── Empty state (no project uploaded yet) ───────────────────────────────────────
const NoProjectState = () => (
  <div style={{
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 14, padding: 40, textAlign: 'center',
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
    }}>
      <MicIcon />
    </div>
    <div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
        Upload a project first
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.5 }}>
        Interview Prep generates questions from your actual code. Go to Project Analyzer and upload a ZIP or folder, then come back here.
      </p>
    </div>
  </div>
);

// ── Start screen (project loaded, interview not started) ───────────────────────
const StartScreen = ({ projectName, onStart, starting }) => (
  <div style={{
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 16, padding: 40, textAlign: 'center',
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
    }}>
      <MicIcon />
    </div>
    <div>
      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
        Mock interview for &ldquo;{projectName}&rdquo;
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 380, lineHeight: 1.6 }}>
        A senior-engineer-style interviewer will ask questions about architecture, scaling, security, debugging, trade-offs, and dependencies — grounded in your actual code, not generic trivia. You&apos;ll get feedback after each answer and a full readiness report at the end.
      </p>
    </div>
    <button
      onClick={onStart}
      disabled={starting}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
        background: 'var(--accent)', color: 'white', border: 'none',
        cursor: starting ? 'not-allowed' : 'pointer', opacity: starting ? 0.7 : 1,
      }}
    >
      {starting ? <Spinner size={14} /> : <MicIcon />}
      {starting ? 'Preparing your interview…' : 'Start Mock Interview'}
    </button>
  </div>
);

// ── Final report screen ─────────────────────────────────────────────────────────
const ReportScreen = ({ report, onRestart, restarting }) => (
  <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 16,
    }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
        Interview Debrief
      </h2>
      <button
        onClick={onRestart}
        disabled={restarting}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
          background: 'var(--bg-secondary)', color: 'var(--text-primary)',
          border: '1px solid var(--border)', cursor: restarting ? 'not-allowed' : 'pointer',
        }}
      >
        {restarting ? <Spinner size={11} /> : <RefreshIcon />} Retry
      </button>
    </div>
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 18,
    }}>
      <MessageRenderer content={report} />
    </div>
  </div>
);

// ── Main panel ───────────────────────────────────────────────────────────────────
const InterviewPanel = () => {
  const [hasProject, setHasProject] = useState(null); // null = loading
  const [projectName, setProjectName] = useState('');
  const [session, setSession] = useState(null); // { status, progress, currentQuestion, transcript, report }
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const scrollRef = useRef(null);

  // On mount: check if a project is loaded, and if an interview session already exists.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [projectRes, interviewRes] = await Promise.all([
          api.get('/project/session'),
          api.get('/interview/session'),
        ]);
        if (!mounted) return;
        setHasProject(!!projectRes.data?.hasProject);
        setProjectName(projectRes.data?.projectName || 'your project');
        if (interviewRes.data?.hasInterview) {
          setSession(interviewRes.data);
        }
      } catch {
        if (mounted) setHasProject(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [session?.transcript?.length]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const { data } = await api.post('/interview/start');
      setSession(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not start the interview.');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    const submittedAnswer = answer;
    setAnswer('');
    try {
      const { data } = await api.post('/interview/answer', { answer: submittedAnswer });
      setSession((prev) => ({
        ...prev,
        status: data.status,
        progress: data.progress,
        currentQuestion: data.nextQuestion,
        transcript: [
          ...(prev?.transcript || []),
          {
            question: prev.currentQuestion.question,
            category: prev.currentQuestion.category,
            answer: submittedAnswer,
            feedback: data.feedback,
            teach: data.teach,
            followUp: data.followUp,
          },
        ],
      }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not submit your answer.');
      setAnswer(submittedAnswer); // restore so the user doesn't lose what they typed
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetReport = async () => {
    setGeneratingReport(true);
    try {
      const { data } = await api.post('/interview/finish');
      setSession((prev) => ({ ...prev, status: 'completed', report: data.report }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not generate the report.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleRestart = async () => {
    setRestarting(true);
    try {
      await api.delete('/interview/session');
      setSession(null);
    } catch {
      toast.error('Could not reset the interview.');
    } finally {
      setRestarting(false);
    }
  };

  if (loading || hasProject === null) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={24} />
      </div>
    );
  }

  if (!hasProject) return <NoProjectState />;

  if (!session) {
    return <StartScreen projectName={projectName} onStart={handleStart} starting={starting} />;
  }

  if (session.status === 'completed' && session.report) {
    return <ReportScreen report={session.report} onRestart={handleRestart} restarting={restarting} />;
  }

  const readyForReport = session.status === 'ready_for_report';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Progress bar */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Question {Math.min(session.progress.current + 1, session.progress.total)} of {session.progress.total}
          </span>
          <button onClick={handleRestart} disabled={restarting} style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 11,
            color: 'var(--text-muted)', background: 'none', border: 'none',
            cursor: restarting ? 'not-allowed' : 'pointer',
          }}>
            {restarting ? <Spinner size={10} /> : <RefreshIcon />} Restart
          </button>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2, background: 'var(--accent)',
            width: `${(session.progress.current / session.progress.total) * 100}%`,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {session.transcript.map((turn, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>
              {CATEGORY_LABELS[turn.category] || turn.category}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {turn.question}
            </div>
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)',
            }}>
              {turn.answer}
            </div>
            {turn.feedback && (
              <div style={{
                background: 'var(--accent-dim)', borderRadius: 10, padding: '10px 14px',
                fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6,
              }}>
                <strong style={{ fontSize: 11, opacity: 0.8 }}>FEEDBACK</strong>
                <p style={{ margin: '4px 0 0' }}>{turn.feedback}</p>
                {turn.teach && (
                  <p style={{ margin: '8px 0 0', fontSize: 12, opacity: 0.85 }}>
                    💡 {turn.teach}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {session.currentQuestion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>
              {CATEGORY_LABELS[session.currentQuestion.category] || session.currentQuestion.category}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {session.currentQuestion.question}
            </div>
          </div>
        )}

        {readyForReport && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              That was the last question. Ready for your debrief?
            </p>
            <button
              onClick={handleGetReport}
              disabled={generatingReport}
              style={{
                padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'var(--accent)', color: 'white', border: 'none',
                cursor: generatingReport ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              {generatingReport && <Spinner size={13} />}
              {generatingReport ? 'Generating report…' : 'Get My Report'}
            </button>
          </div>
        )}
      </div>

      {/* Answer input */}
      {!readyForReport && session.currentQuestion && (
        <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitAnswer();
                }
              }}
              placeholder="Answer like you would in a real interview…"
              disabled={submitting}
              rows={3}
              maxLength={4000}
              style={{
                flex: 1, resize: 'none', borderRadius: 10, padding: '10px 14px',
                fontSize: 13, background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={submitting || !answer.trim()}
              style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: 'var(--accent)', color: 'white', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: (submitting || !answer.trim()) ? 'not-allowed' : 'pointer',
                opacity: (submitting || !answer.trim()) ? 0.6 : 1,
              }}
            >
              {submitting ? <Spinner size={14} /> : <SendIcon />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewPanel;
