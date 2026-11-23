import { Bookmark, Pause, Play, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type {
  GeneratedQuestion,
  InterviewAnswerFeedback,
  InterviewType,
  JobApplication,
  SavedInterviewNote,
} from '../types/career';
import { formatDuration, getTodayIso } from '../utils/storage';

interface MockInterviewViewProps {
  defaultRole: string;
  applications: JobApplication[];
  notes: SavedInterviewNote[];
  onSaveNote: (note: Omit<SavedInterviewNote, 'id' | 'createdAt'>) => void;
  onDeleteNote: (id: string) => void;
  hideHeader?: boolean;
}

const INTERVIEW_TYPES: InterviewType[] = [
  '직무 · 기술',
  '인성 · 컬처핏',
  '경험 · 꼬리질문',
];

const STARTER_QUESTIONS: GeneratedQuestion[] = [
  {
    question:
      'MOSFET에서 채널 길이가 짧아질수록 발생하는 Short Channel Effect의 원인과 이를 억제하기 위한 소자·공정적 해결 방안을 설명해 주세요.',
    category: '반도체 소자 · 공정',
    intent: '반도체 물리 기본기와 최신 미세공정(FinFET/GAA) 전환 배경에 대한 이해도를 검증합니다.',
    tip: 'DIBL, 문턱전압 롤오프 현상을 짚고 High-k/Metal Gate 및 3D 채널 구조의 게이트 제어력을 연결해 답변하세요.',
  },
  {
    question:
      '전력계통 또는 회로 설계 프로젝트 중 예상치 못한 노이즈, 전압 강하, 혹은 공정 편차 문제를 원인 분석하여 해결한 경험이 있나요?',
    category: '엔지니어링 문제 해결',
    intent: '실험/시뮬레이션 데이터를 근거로 가설을 세우고 변수를 통제한 공학적 사고력을 봅니다.',
    tip: '문제 현상 → 원인 가설 → 검증 툴(HSPICE/PSCAD/DOE 등) → 개선 수치 순으로 답하세요.',
  },
  {
    question:
      '반도체/전력 산업의 특성을 고려할 때, 유관 부서(설계·공정·설비 또는 현장)와 협업하며 안전과 품질 기준을 지켰던 경험을 들려주세요.',
    category: '협업 · 직무 적합성',
    intent: '양산 현장과 R&D 간 소통 능력 및 엔지니어로서의 책임감을 확인하려는 질문입니다.',
    tip: '서로 다른 목표(속도 vs 수율/안정성)를 데이터와 프로토콜로 조율한 사례를 들어보세요.',
  },
];

export function MockInterviewView({
  defaultRole,
  applications,
  notes,
  onSaveNote,
  onDeleteNote,
  hideHeader = false,
}: MockInterviewViewProps) {
  const [role, setRole] = useState(defaultRole);
  const [interviewType, setInterviewType] = useState<InterviewType>('직무 · 기술');
  const [linkedAppId, setLinkedAppId] = useState<string>('');
  const [questions, setQuestions] = useState<GeneratedQuestion[]>(STARTER_QUESTIONS);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [customQuestion, setCustomQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [reviewingAnswer, setReviewingAnswer] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [feedback, setFeedback] = useState<InterviewAnswerFeedback | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const activeQuestion =
    customQuestion.trim() || questions[selectedIdx]?.question || '';

  const linkedApp = applications.find((a) => a.id === linkedAppId) ?? null;

  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    setErrorMsg('');
    setFeedback(null);
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: role.trim() || defaultRole,
          interviewType,
          company: linkedApp?.company ?? '',
          jdNotes: linkedApp?.jdNotes ?? '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '면접 질문 생성에 실패했습니다.');
      }
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setSelectedIdx(0);
        setCustomQuestion('');
        setAnswer('');
        setSeconds(0);
        setTimerRunning(false);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '질문 생성 중 오류가 발생했습니다.');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleReviewAnswer = async () => {
    if (!activeQuestion) return;
    setTimerRunning(false);
    setReviewingAnswer(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/review-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: role.trim() || defaultRole,
          interviewType,
          question: activeQuestion,
          answer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '답변 분석 요청에 실패했습니다.');
      }
      setFeedback(data as InterviewAnswerFeedback);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '답변 평가 중 오류가 발생했습니다.');
    } finally {
      setReviewingAnswer(false);
    }
  };

  const handlePracticeFollowUp = (followUp: string) => {
    setCustomQuestion(followUp);
    setAnswer('');
    setFeedback(null);
    setSeconds(0);
    setTimerRunning(false);
  };

  const handleSaveToNotes = () => {
    if (!activeQuestion || !answer.trim()) return;
    onSaveNote({
      role: role.trim() || defaultRole,
      interviewType,
      question: activeQuestion,
      answer: answer.trim(),
      feedback: feedback ?? undefined,
      durationSeconds: seconds,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-50">
            모의 면접 코치
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            직무와 기업 공고에 맞춘 예상 질문을 생성하고, 타이머에 맞춰 답변을 작성해 AI 피드백을 받아보세요.
          </p>
        </div>
      )}

      {/* Setup Bar */}
      <section className="bg-[#111216] border border-zinc-800 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              목표 직무
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="예: 반도체 공정기술, 아날로그 회로설계, 전력기기 R&D"
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              지원 공고 연동 (선택)
            </label>
            <select
              value={linkedAppId}
              onChange={(e) => {
                const id = e.target.value;
                setLinkedAppId(id);
                const app = applications.find((a) => a.id === id);
                if (app) setRole(app.role);
              }}
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">일반 직무 기준</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} · {app.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              면접 유형
            </label>
            <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-md">
              {INTERVIEW_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setInterviewType(type)}
                  className={`flex-1 py-1.5 px-2 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    interviewType === type
                      ? 'bg-zinc-800 text-zinc-50'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-zinc-500">
            {linkedApp
              ? `${linkedApp.company}의 JD 요구사항을 반영해 질문을 출제합니다.`
              : '목표 직무와 면접 유형을 선택한 뒤 맞춤 질문 5개를 생성할 수 있습니다.'}
          </p>
          <button
            type="button"
            disabled={generatingQuestions}
            onClick={handleGenerateQuestions}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 rounded-md transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {generatingQuestions ? '맞춤 질문 생성 중...' : 'AI 맞춤 질문 5개 생성'}
            </span>
          </button>
        </div>
      </section>

      {errorMsg && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-lg text-sm text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Main Practice Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        <aside className="bg-[#111216] border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">
              면접 질문 목록 ({questions.length})
            </span>
            {customQuestion.trim() && (
              <button
                type="button"
                onClick={() => setCustomQuestion('')}
                className="text-xs font-medium text-blue-400 hover:text-blue-300"
              >
                목록으로 복귀
              </button>
            )}
          </div>
          <ul className="divide-y divide-zinc-800/80">
            {questions.map((q, idx) => {
              const isSelected = !customQuestion.trim() && selectedIdx === idx;
              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIdx(idx);
                      setCustomQuestion('');
                      setFeedback(null);
                    }}
                    className={`w-full text-left p-4 transition-colors ${
                      isSelected ? 'bg-blue-500/10' : 'hover:bg-zinc-900/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono tabular-nums text-zinc-500">
                        Q{idx + 1}
                      </span>
                      <span className="text-zinc-400">{q.category}</span>
                    </div>
                    <p
                      className={`mt-1.5 text-sm leading-snug ${
                        isSelected ? 'font-semibold text-blue-300' : 'text-zinc-200'
                      }`}
                    >
                      {q.question}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="space-y-6">
          <div className="bg-[#111216] border border-zinc-800 rounded-lg p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-zinc-800">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-blue-400">
                  {customQuestion.trim()
                    ? '꼬리 질문 연습'
                    : `${questions[selectedIdx]?.category ?? '면접 질문'}`}
                </span>
                <h3 className="text-lg font-semibold text-zinc-100 leading-snug">
                  {activeQuestion}
                </h3>
                {!customQuestion.trim() && questions[selectedIdx] && (
                  <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                    출제 의도: {questions[selectedIdx].intent} · 팁:{' '}
                    {questions[selectedIdx].tip}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 shrink-0">
                <span className="font-mono text-sm font-semibold tabular-nums text-zinc-100 w-12 text-center">
                  {formatDuration(seconds)}
                </span>
                <button
                  type="button"
                  onClick={() => setTimerRunning((r) => !r)}
                  aria-label={timerRunning ? '타이머 일시정지' : '타이머 시작'}
                  className="p-1.5 text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
                >
                  {timerRunning ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setSeconds(0);
                  }}
                  aria-label="타이머 초기화"
                  className="p-1.5 text-zinc-400 hover:bg-zinc-800 rounded transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  나의 모의 답변 작성 (핵심 키워드 또는 구술 스크립트)
                </label>
                <span className="text-xs font-mono tabular-nums text-zinc-500">
                  {answer.length}자
                </span>
              </div>
              <textarea
                rows={7}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="실제 면접장에서 말하듯 결론을 먼저 말하고(두괄식), 상황-과제-행동-결과(STAR) 순으로 답변을 적어보세요."
                className="w-full px-4 py-3 text-sm leading-relaxed bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={!answer.trim()}
                onClick={handleSaveToNotes}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-300 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedNotice ? '노트에 저장되었습니다' : '답변 노트에 저장'}</span>
              </button>

              <button
                type="button"
                disabled={reviewingAnswer}
                onClick={handleReviewAnswer}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 rounded-md transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {reviewingAnswer ? '답변 분석 중...' : 'AI 면접 피드백 받기'}
                </span>
              </button>
            </div>
          </div>

          {reviewingAnswer && (
            <div className="bg-[#111216] border border-zinc-800 rounded-lg p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/4" />
              <div className="h-3 bg-zinc-900 rounded w-full" />
              <div className="h-20 bg-zinc-900 rounded w-full" />
            </div>
          )}

          {feedback && !reviewingAnswer && (
            <div className="bg-[#111216] border border-zinc-800 rounded-lg divide-y divide-zinc-800">
              <div className="p-6 space-y-2">
                <h4 className="text-base font-semibold text-zinc-100">
                  면접 답변 코칭 결과
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed">{feedback.verdict}</p>
                <p className="text-xs text-zinc-400 pt-1 leading-relaxed">
                  <span className="font-semibold text-zinc-200">STAR 구조 점검: </span>
                  {feedback.starFeedback}
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-xs font-semibold text-emerald-400 mb-2">
                    잘 전달된 포인트
                  </h5>
                  <ul className="space-y-1.5 text-sm text-zinc-300 list-disc pl-4">
                    {feedback.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-amber-400 mb-2">
                    보완하면 좋을 포인트
                  </h5>
                  <ul className="space-y-1.5 text-sm text-zinc-300 list-disc pl-4">
                    {feedback.improvements.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 space-y-2.5 bg-zinc-950/60">
                <h5 className="text-xs font-semibold text-zinc-200">
                  두괄식 개선 답변 예시
                </h5>
                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line bg-zinc-950 border border-zinc-800 rounded-md p-4">
                  {feedback.refinedAnswer}
                </p>
              </div>

              <div className="p-6 space-y-3">
                <h5 className="text-xs font-semibold text-zinc-200">
                  예상 꼬리 질문 (클릭하여 바로 연습하기)
                </h5>
                <div className="space-y-2">
                  {feedback.followUpQuestions.map((fq, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePracticeFollowUp(fq)}
                      className="w-full text-left px-4 py-3 text-sm text-zinc-200 bg-zinc-950 hover:bg-blue-500/10 hover:text-blue-300 border border-zinc-800 hover:border-blue-500/40 rounded-md transition-colors"
                    >
                      꼬리질문 {idx + 1}. {fq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Saved Notes History */}
          <section className="bg-[#111216] border border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-zinc-100">
                저장된 면접 답변 노트 ({notes.length})
              </h4>
              <span className="text-xs text-zinc-500">자동 저장</span>
            </div>
            {notes.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                연습한 답변에서 &apos;답변 노트에 저장&apos;을 누르면 이곳에 정리됩니다.
              </div>
            ) : (
              <ul className="divide-y divide-zinc-800/80">
                {notes.map((note) => (
                  <li key={note.id} className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-2">
                          <span>{note.role}</span>
                          <span aria-hidden="true">·</span>
                          <span>{note.interviewType}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {formatDuration(note.durationSeconds)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {note.createdAt || getTodayIso()}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-zinc-100">
                          {note.question}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(note.id)}
                        aria-label="노트 삭제"
                        className="p-1.5 text-zinc-500 hover:text-rose-400 rounded transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                      {note.answer}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
