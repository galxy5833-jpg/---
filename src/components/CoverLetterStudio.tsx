import { Check, Copy, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type {
  CoverLetterDraft,
  CoverLetterFeedback,
  JobApplication,
} from '../types/career';
import { getTodayIso } from '../utils/storage';

interface CoverLetterStudioProps {
  drafts: CoverLetterDraft[];
  applications: JobApplication[];
  selectedDraftId: string | null;
  onSelectDraft: (id: string) => void;
  onCreateDraft: (linkedApp?: JobApplication) => void;
  onUpdateDraft: (id: string, patch: Partial<CoverLetterDraft>) => void;
  onDeleteDraft: (id: string) => void;
  hideHeader?: boolean;
}

const CHAR_LIMIT_OPTIONS = [500, 700, 1000, 1500, 2000];

export function CoverLetterStudio({
  drafts,
  applications,
  selectedDraftId,
  onSelectDraft,
  onCreateDraft,
  onUpdateDraft,
  onDeleteDraft,
  hideHeader = false,
}: CoverLetterStudioProps) {
  const activeDraft = useMemo(
    () => drafts.find((d) => d.id === selectedDraftId) ?? drafts[0] ?? null,
    [drafts, selectedDraftId]
  );

  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState('');
  const [feedback, setFeedback] = useState<CoverLetterFeedback | null>(null);
  const [copiedId, setCopiedId] = useState<'draft' | 'revised' | null>(null);

  useEffect(() => {
    setFeedback(null);
    setAiError('');
  }, [activeDraft?.id]);

  const linkedApp = useMemo(
    () => applications.find((a) => a.id === activeDraft?.applicationId) ?? null,
    [applications, activeDraft?.applicationId]
  );

  const charCountWithSpace = activeDraft?.content.length ?? 0;
  const charCountWithoutSpace = activeDraft
    ? activeDraft.content.replace(/\s/g, '').length
    : 0;
  const limitPct = activeDraft
    ? Math.min(100, Math.round((charCountWithSpace / activeDraft.charLimit) * 100))
    : 0;
  const isOverLimit = activeDraft ? charCountWithSpace > activeDraft.charLimit : false;

  const handleLinkApplication = (appId: string) => {
    if (!activeDraft) return;
    if (!appId) {
      onUpdateDraft(activeDraft.id, { applicationId: null });
      return;
    }
    const found = applications.find((a) => a.id === appId);
    if (found) {
      onUpdateDraft(activeDraft.id, {
        applicationId: found.id,
        companyName: found.company,
        roleTitle: found.role,
      });
    }
  };

  const handleRequestFeedback = async () => {
    if (!activeDraft) return;
    setLoadingAi(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/review-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: activeDraft.companyName,
          role: activeDraft.roleTitle,
          prompt: activeDraft.prompt,
          draft: activeDraft.content,
          jdNotes: linkedApp?.jdNotes ?? '',
          charLimit: activeDraft.charLimit,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '자기소개서 첨삭 요청에 실패했습니다.');
      }
      setFeedback(data as CoverLetterFeedback);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : '요청 중 오류가 발생했습니다.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCopy = async (text: string, target: 'draft' | 'revised') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(target);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            자기소개서 스튜디오
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            글자 수 제한을 실시간으로 맞추며 작성하고, 지원 기업의 직무 요구사항(JD)을 반영한 AI 첨삭을 받아보세요.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Left Draft Selector List */}
        <aside className="bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              작성 중인 문항 ({drafts.length})
            </span>
            <button
              type="button"
              onClick={() => onCreateDraft()}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 문항</span>
            </button>
          </div>

          {drafts.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <p className="text-xs text-slate-500">작성된 자기소개서가 없습니다.</p>
              <button
                type="button"
                onClick={() => onCreateDraft()}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                첫 문항 작성하기
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 max-h-[540px] overflow-y-auto">
              {drafts.map((draft) => {
                const isSelected = draft.id === activeDraft?.id;
                return (
                  <li key={draft.id}>
                    <button
                      type="button"
                      onClick={() => onSelectDraft(draft.id)}
                      className={`w-full text-left p-4 transition-colors ${
                        isSelected ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isSelected ? 'text-blue-700' : 'text-slate-900'
                          }`}
                        >
                          {draft.companyName || '공통 자기소개서'}
                        </span>
                        <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                          {draft.content.length}/{draft.charLimit}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                        {draft.prompt || '문항 제목을 입력하세요'}
                      </p>
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        {draft.roleTitle || '직무 미지정'} · {draft.updatedAt}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Right Main Editor & AI Coaching Area */}
        {activeDraft ? (
          <div className="space-y-6">
            <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] rounded-lg p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    지원 공고 연동 (JD 자동 반영)
                  </label>
                  <select
                    value={activeDraft.applicationId ?? ''}
                    onChange={(e) => handleLinkApplication(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">직접 입력 (연동 안 함)</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.company} - {app.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    목표 기업명
                  </label>
                  <input
                    type="text"
                    value={activeDraft.companyName}
                    onChange={(e) =>
                      onUpdateDraft(activeDraft.id, {
                        companyName: e.target.value,
                        updatedAt: getTodayIso(),
                      })
                    }
                    placeholder="예: 삼성전자 DS, SK하이닉스"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    지원 직무
                  </label>
                  <input
                    type="text"
                    value={activeDraft.roleTitle}
                    onChange={(e) =>
                      onUpdateDraft(activeDraft.id, {
                        roleTitle: e.target.value,
                        updatedAt: getTodayIso(),
                      })
                    }
                    placeholder="예: 반도체 공정기술 · 회로설계"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    자기소개서 문항
                  </label>
                  <input
                    type="text"
                    value={activeDraft.prompt}
                    onChange={(e) =>
                      onUpdateDraft(activeDraft.id, {
                        prompt: e.target.value,
                        updatedAt: getTodayIso(),
                      })
                    }
                    placeholder="예: 지원 동기와 직무 역량을 구체적인 경험을 바탕으로 작성해 주세요."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    목표 글자 수
                  </label>
                  <select
                    value={activeDraft.charLimit}
                    onChange={(e) =>
                      onUpdateDraft(activeDraft.id, {
                        charLimit: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-200 text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {CHAR_LIMIT_OPTIONS.map((num) => (
                      <option key={num} value={num}>
                        {num}자
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {linkedApp?.jdNotes && (
                <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">연동된 JD 요약: </span>
                  {linkedApp.jdNotes}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-600">본문 작성</label>
                  <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                    <span className={isOverLimit ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                      공백 포함 {charCountWithSpace} / {activeDraft.charLimit}자
                    </span>
                    <span className="text-slate-300" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-slate-500">공백 제외 {charCountWithoutSpace}자</span>
                  </div>
                </div>
                <textarea
                  rows={10}
                  value={activeDraft.content}
                  onChange={(e) =>
                    onUpdateDraft(activeDraft.id, {
                      content: e.target.value,
                      updatedAt: getTodayIso(),
                    })
                  }
                  placeholder="경험의 배경(Situation), 문제/과제(Task), 본인의 구체적 행동(Action), 정량·정성적 결과(Result) 순으로 작성해 보세요."
                  className="w-full px-4 py-3 text-sm leading-relaxed bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${
                      isOverLimit ? 'bg-rose-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${limitPct}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(activeDraft.content, 'draft')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
                  >
                    {copiedId === 'draft' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>본문 복사</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteDraft(activeDraft.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>문항 삭제</span>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={loadingAi}
                  onClick={handleRequestFeedback}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loadingAi ? 'AI가 문항을 분석하는 중...' : 'AI 자소서 첨삭 받기'}</span>
                </button>
              </div>
            </div>

            {aiError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                {aiError}
              </div>
            )}

            {loadingAi && (
              <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-lg p-6 space-y-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
                <div className="h-24 bg-slate-100 rounded w-full" />
              </div>
            )}

            {feedback && !loadingAi && (
              <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] rounded-lg divide-y divide-slate-200">
                <div className="p-6 space-y-2">
                  <h3 className="text-base font-semibold text-slate-900">
                    AI 채용 평가관 첨삭 결과
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{feedback.summary}</p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-700 mb-2.5">
                      잘 드러난 강점
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-700 list-disc pl-4">
                      {feedback.strengths.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-amber-700 mb-2.5">
                      보완이 필요한 부분
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-700 list-disc pl-4">
                      {feedback.improvements.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 space-y-3 bg-slate-50/60">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        개선 제안 초안
                      </h4>
                      <p className="text-xs text-slate-500 font-mono tabular-nums">
                        공백 포함 {feedback.revisedDraft.length}자
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(feedback.revisedDraft, 'revised')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
                      >
                        {copiedId === 'revised' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>제안문 복사</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateDraft(activeDraft.id, {
                            content: feedback.revisedDraft,
                            updatedAt: getTodayIso(),
                          })
                        }
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap"
                      >
                        내 본문에 적용하기
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white border border-slate-200 rounded-md p-4">
                    {feedback.revisedDraft}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
