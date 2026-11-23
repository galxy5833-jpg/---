import { Check, Copy, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  ChecklistItem,
  ChecklistPhase,
  ResumeAuditResult,
} from '../types/career';

interface ChecklistResumeViewProps {
  defaultRole: string;
  checklist: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (phase: ChecklistPhase, title: string, detail: string) => void;
  onDeleteItem: (id: string) => void;
  forcedSubView?: 'checklist' | 'resume';
  hideHeader?: boolean;
}

const PHASES: ChecklistPhase[] = [
  '01. 직무·기업 분석',
  '02. 이력서·포트폴리오',
  '03. 직무 역량·테스트',
  '04. 면접 최종 점검',
];

export function ChecklistResumeView({
  defaultRole,
  checklist,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  forcedSubView,
  hideHeader = false,
}: ChecklistResumeViewProps) {
  const [internalSubView, setInternalSubView] = useState<'checklist' | 'resume'>('checklist');
  const subView = forcedSubView ?? internalSubView;

  const [newPhase, setNewPhase] = useState<ChecklistPhase>('01. 직무·기업 분석');
  const [newTitle, setNewTitle] = useState('');
  const [newDetail, setNewDetail] = useState('');

  const [resumeRole, setResumeRole] = useState(defaultRole);
  const [resumeText, setResumeText] = useState(
    '- Cadence Virtuoso와 HSPICE를 활용해 180nm 공정 기반 저전력 LDO 레귤레이터 설계를 담당함\n- 캡스톤 프로젝트에서 태양광 인버터 계통연계 회로 시뮬레이션에 기여함\n- 팀원들과 반도체 공정 실습 데이터를 정리하며 보고서 작성에 참여함'
  );
  const [auditing, setAuditing] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [auditResult, setAuditResult] = useState<ResumeAuditResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const completion = useMemo(() => {
    const done = checklist.filter((c) => c.completed).length;
    const total = checklist.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }, [checklist]);

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddItem(newPhase, newTitle.trim(), newDetail.trim());
    setNewTitle('');
    setNewDetail('');
  };

  const handleAuditResume = async () => {
    setAuditing(true);
    setAuditError('');
    try {
      const res = await fetch('/api/ai/review-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: resumeRole.trim() || defaultRole,
          content: resumeText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '이력서 점검 요청에 실패했습니다.');
      }
      setAuditResult(data as ResumeAuditResult);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : '점검 중 오류가 발생했습니다.');
    } finally {
      setAuditing(false);
    }
  };

  const handleCopyImproved = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-50">
              체크리스트 · 이력서 점검
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              서류부터 최종 면접까지 단계별 준비 상태를 확인하고, 이력서 경력 문장을 성과 중심으로 다듬어 보세요.
            </p>
          </div>

          {!forcedSubView && (
            <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-md self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setInternalSubView('checklist')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  subView === 'checklist'
                    ? 'bg-zinc-800 text-zinc-50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                단계별 체크리스트 ({completion.pct}%)
              </button>
              <button
                type="button"
                onClick={() => setInternalSubView('resume')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  subView === 'resume'
                    ? 'bg-zinc-800 text-zinc-50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                AI 이력서 문장 점검
              </button>
            </div>
          )}
        </div>
      )}

      {subView === 'checklist' ? (
        <div className="space-y-6">
          <div className="bg-[#111216] border border-zinc-800 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-100">전체 취업 준비 진행률</span>
              <span className="font-mono tabular-nums text-blue-400 font-semibold">
                {completion.done} / {completion.total} 완료 ({completion.pct}%)
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-200"
                style={{ width: `${completion.pct}%` }}
              />
            </div>
          </div>

          <form
            onSubmit={handleAddChecklist}
            className="bg-[#111216] border border-zinc-800 rounded-lg p-5 grid grid-cols-1 md:grid-cols-[200px_1fr_1fr_auto] gap-3 items-end"
          >
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                준비 단계
              </label>
              <select
                value={newPhase}
                onChange={(e) => setNewPhase(e.target.value as ChecklistPhase)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PHASES.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                할 일 제목
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="예: 전기기사 자격증 스캔본 및 경력기술서 최신화"
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                세부 메모 (선택)
              </label>
              <input
                type="text"
                value={newDetail}
                onChange={(e) => setNewDetail(e.target.value)}
                placeholder="예: 캡스톤 프로젝트 효율·수율 개선 수치 반영"
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>항목 추가</span>
            </button>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PHASES.map((phase) => {
              const items = checklist.filter((c) => c.phase === phase);
              const phaseDone = items.filter((i) => i.completed).length;

              return (
                <section
                  key={phase}
                  className="bg-[#111216] border border-zinc-800 rounded-lg overflow-hidden"
                >
                  <div className="px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-100">{phase}</h3>
                    <span className="text-xs font-mono tabular-nums text-zinc-400">
                      {phaseDone}/{items.length}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <div className="p-6 text-xs text-zinc-500">
                      등록된 체크리스트 항목이 없습니다.
                    </div>
                  ) : (
                    <ul className="divide-y divide-zinc-800/80">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="p-4 flex items-start justify-between gap-3 hover:bg-zinc-900/50 transition-colors"
                        >
                          <label className="flex items-start gap-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => onToggleItem(item.id)}
                              className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="space-y-0.5">
                              <span
                                className={`block text-sm font-medium ${
                                  item.completed
                                    ? 'line-through text-zinc-500'
                                    : 'text-zinc-100'
                                }`}
                              >
                                {item.title}
                              </span>
                              {item.detail && (
                                <span className="block text-xs text-zinc-400 leading-relaxed">
                                  {item.detail}
                                </span>
                              )}
                            </div>
                          </label>
                          {item.isCustom && (
                            <button
                              type="button"
                              onClick={() => onDeleteItem(item.id)}
                              aria-label="항목 삭제"
                              className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#111216] border border-zinc-800 rounded-lg p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  지원 목표 직무
                </label>
                <input
                  type="text"
                  value={resumeRole}
                  onChange={(e) => setResumeRole(e.target.value)}
                  placeholder="예: 반도체 공정기술 · 전력설비 엔지니어"
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <p className="text-xs text-zinc-400 pb-2">
                  단순 업무 나열(&quot;~를 담당함&quot;)을 문제 해결과 정량 성과 중심의 이력서 문장으로 전환해 드립니다.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                이력서 경력 · 프로젝트 설명 붙여넣기
              </label>
              <textarea
                rows={7}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="점검받고 싶은 프로젝트 설명이나 경력 불릿 포인트를 입력하세요."
                className="w-full px-4 py-3 text-sm leading-relaxed bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={auditing}
                onClick={handleAuditResume}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 rounded-md transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {auditing ? '이력서 문장 분석 중...' : 'AI 이력서 문장 개선 받기'}
                </span>
              </button>
            </div>
          </div>

          {auditError && (
            <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-lg text-sm text-rose-300">
              {auditError}
            </div>
          )}

          {auditing && (
            <div className="bg-[#111216] border border-zinc-800 rounded-lg p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/3" />
              <div className="h-3 bg-zinc-900 rounded w-full" />
              <div className="h-24 bg-zinc-900 rounded w-full" />
            </div>
          )}

          {auditResult && !auditing && (
            <div className="bg-[#111216] border border-zinc-800 rounded-lg divide-y divide-zinc-800">
              <div className="p-6 space-y-2">
                <h3 className="text-base font-semibold text-zinc-100">
                  이력서 서술 진단 결과
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {auditResult.overview}
                </p>
                {auditResult.missingKeywords.length > 0 && (
                  <p className="text-xs text-zinc-400 pt-2">
                    <span className="font-semibold text-zinc-200">
                      추가 권장 역량 키워드:{' '}
                    </span>
                    {auditResult.missingKeywords.join(' · ')}
                  </p>
                )}
              </div>

              <div className="divide-y divide-zinc-800">
                {auditResult.rewrites.map((item, idx) => (
                  <div key={idx} className="p-6 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-zinc-500 mb-1">원문</p>
                        <p className="text-sm text-zinc-400 leading-relaxed bg-zinc-950 border border-zinc-800 rounded-md p-3">
                          {item.original}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-blue-400">
                            성과 중심 개선안
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopyImproved(item.improved, idx)}
                            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-100"
                          >
                            {copiedIdx === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>복사됨</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>복사</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-zinc-100 font-medium leading-relaxed bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                          {item.improved}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-200">개선 포인트: </span>
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
