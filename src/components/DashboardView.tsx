import {
  ArrowRight,
  ArrowUpDown,
  ExternalLink,
  Plus,
  RotateCcw,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  ApplicationStage,
  ChecklistItem,
  ChecklistPhase,
  JobApplication,
  UserCareerProfile,
} from '../types/career';
import { formatDday, formatKoreanDate, getDaysRemaining } from '../utils/storage';

interface DashboardViewProps {
  profile: UserCareerProfile;
  onUpdateProfile: (next: UserCareerProfile) => void;
  onResetDemoData: () => void;
  applications: JobApplication[];
  checklist: ChecklistItem[];
  draftCount: number;
  noteCount: number;
  onSelectApplication: (app: JobApplication) => void;
  onUpdateStage: (id: string, stage: ApplicationStage) => void;
  onOpenNewApplication: () => void;
  onJumpToDocuments: (subTab?: 'cover-letter' | 'resume') => void;
  onJumpToInterviewPrep: (subTab?: 'interview' | 'checklist') => void;
}

type FilterGroup = 'all' | 'preparing' | 'submitted' | 'interview' | 'result';

const FILTER_TABS: { id: FilterGroup; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'preparing', label: '준비 중' },
  { id: 'submitted', label: '서류 · 과제' },
  { id: 'interview', label: '면접 진행' },
  { id: 'result', label: '최종 결과' },
];

const STAGES: ApplicationStage[] = [
  '준비 중',
  '서류 제출',
  '과제 · 코테',
  '1차 면접',
  '최종 면접',
  '최종 합격',
  '불합격',
];

const PHASES: ChecklistPhase[] = [
  '01. 직무·기업 분석',
  '02. 이력서·포트폴리오',
  '03. 직무 역량·테스트',
  '04. 면접 최종 점검',
];

function getStageTextStyle(stage: ApplicationStage): string {
  switch (stage) {
    case '최종 합격':
      return 'text-emerald-700 font-semibold';
    case '1차 면접':
    case '최종 면접':
      return 'text-blue-700 font-semibold';
    case '과제 · 코테':
    case '서류 제출':
      return 'text-amber-700 font-medium';
    case '불합격':
      return 'text-slate-400 font-medium';
    default:
      return 'text-slate-700 font-medium';
  }
}

export function DashboardView({
  profile,
  onUpdateProfile,
  onResetDemoData,
  applications,
  checklist,
  draftCount,
  noteCount,
  onSelectApplication,
  onUpdateStage,
  onOpenNewApplication,
  onJumpToDocuments,
  onJumpToInterviewPrep,
}: DashboardViewProps) {
  const [filterGroup, setFilterGroup] = useState<FilterGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [roleInput, setRoleInput] = useState(profile.targetRole);
  const [levelInput, setLevelInput] = useState(profile.experienceLevel);
  const [confirmReset, setConfirmReset] = useState(false);

  const stats = useMemo(() => {
    const total = applications.length;
    const preparing = applications.filter((a) => a.stage === '준비 중').length;
    const submitted = applications.filter(
      (a) => a.stage === '서류 제출' || a.stage === '과제 · 코테'
    ).length;
    const interview = applications.filter(
      (a) => a.stage === '1차 면접' || a.stage === '최종 면접'
    ).length;
    const passed = applications.filter((a) => a.stage === '최종 합격').length;
    const inProgress = applications.filter(
      (a) => a.stage !== '최종 합격' && a.stage !== '불합격'
    ).length;

    const upcomingApps = applications
      .filter((a) => {
        if (a.stage === '최종 합격' || a.stage === '불합격') return false;
        const d = getDaysRemaining(a.deadline);
        return d !== null && d >= 0;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const urgentCount = upcomingApps.filter((a) => {
      const d = getDaysRemaining(a.deadline);
      return d !== null && d <= 7;
    }).length;

    const completedChecks = checklist.filter((c) => c.completed).length;
    const checklistPct =
      checklist.length > 0 ? Math.round((completedChecks / checklist.length) * 100) : 0;

    return {
      total,
      preparing,
      submitted,
      interview,
      passed,
      inProgress,
      urgentCount,
      nearestApp: upcomingApps[0] ?? null,
      upcomingTop3: upcomingApps.slice(0, 3),
      completedChecks,
      checklistPct,
    };
  }, [applications, checklist]);

  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications
      .filter((app) => {
        if (filterGroup === 'preparing' && app.stage !== '준비 중') return false;
        if (
          filterGroup === 'submitted' &&
          app.stage !== '서류 제출' &&
          app.stage !== '과제 · 코테'
        ) {
          return false;
        }
        if (
          filterGroup === 'interview' &&
          app.stage !== '1차 면접' &&
          app.stage !== '최종 면접'
        ) {
          return false;
        }
        if (
          filterGroup === 'result' &&
          app.stage !== '최종 합격' &&
          app.stage !== '불합격'
        ) {
          return false;
        }
        if (!q) return true;
        return (
          app.company.toLowerCase().includes(q) ||
          app.role.toLowerCase().includes(q) ||
          app.nextAction.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const cmp = a.deadline.localeCompare(b.deadline);
        return sortAsc ? cmp : -cmp;
      });
  }, [applications, filterGroup, searchQuery, sortAsc]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      targetRole: roleInput.trim() || '반도체 공정기술 · 회로설계 엔지니어',
      experienceLevel: levelInput.trim() || '신입 · 학사 / 석사',
    });
    setEditingProfile(false);
  };

  const pipelineBase = Math.max(1, stats.total);

  return (
    <div className="space-y-8">
      {/* Executive Header Band */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/90">
        <div className="space-y-2.5 max-w-2xl">
          {editingProfile ? (
            <form
              onSubmit={handleSaveProfile}
              className="flex flex-wrap items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-md p-2.5"
            >
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                placeholder="목표 직무"
                className="px-2.5 py-1 text-xs bg-white border border-slate-300 text-slate-900 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <input
                type="text"
                value={levelInput}
                onChange={(e) => setLevelInput(e.target.value)}
                placeholder="경력 구분"
                className="px-2.5 py-1 text-xs bg-white border border-slate-300 text-slate-900 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
              >
                저장
              </button>
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800"
              >
                취소
              </button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="text-blue-700 font-semibold">목표 포지션</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-900 font-medium">{profile.targetRole}</span>
              <span aria-hidden="true">·</span>
              <span>{profile.experienceLevel}</span>
              <button
                type="button"
                onClick={() => {
                  setRoleInput(profile.targetRole);
                  setLevelInput(profile.experienceLevel);
                  setEditingProfile(true);
                }}
                className="ml-1 text-slate-400 hover:text-slate-800 underline underline-offset-2"
              >
                수정
              </button>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            반도체 · 전기 취업 준비 현황
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            주요 반도체·전력 기업별 전형 단계와 마감 일정, 직무 준비 달성도를 한 화면에서 점검합니다.
          </p>
        </div>

        {/* Direct Launch Actions & Reset */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onJumpToDocuments('cover-letter')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200 hover:border-slate-300 hover:bg-white rounded-md transition-colors whitespace-nowrap"
          >
            <span>자소서 AI 첨삭</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            type="button"
            onClick={() => onJumpToInterviewPrep('interview')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200 hover:border-slate-300 hover:bg-white rounded-md transition-colors whitespace-nowrap"
          >
            <span>모의 면접 시작</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {confirmReset ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs">
              <span className="text-slate-500">초기화?</span>
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setConfirmReset(false);
                }}
                className="text-rose-600 font-medium hover:underline"
              >
                확인
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              title="기본 샘플 데이터로 복원"
              className="p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-md"
              aria-label="기본 데이터 복원"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* 4-Column High-Contrast Metric Strip */}
      <section
        aria-label="핵심 취업 준비 지표"
        className="bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] rounded-lg grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200"
      >
        <div className="p-5 sm:p-6">
          <p className="text-xs font-medium text-slate-500">전체 지원 기업</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">
            {stats.total}건
          </p>
          <p className="mt-1.5 text-xs text-slate-400">
            반도체 · 전력기기 목표 공고
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-xs font-medium text-slate-500">진행 중 전형</p>
          <p className="mt-2 text-3xl font-bold text-blue-600 tabular-nums">
            {stats.inProgress}건
          </p>
          <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
            면접 {stats.interview}건 · 서류/과제 {stats.submitted}건
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-xs font-medium text-slate-500">7일 이내 임박 일정</p>
          <p
            className={`mt-2 text-3xl font-bold tabular-nums ${
              stats.urgentCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {stats.urgentCount}건
          </p>
          <p className="mt-1.5 text-xs text-slate-500 truncate">
            {stats.nearestApp
              ? `최단: ${stats.nearestApp.company} (${formatDday(stats.nearestApp.deadline)})`
              : '예정된 마감 없음'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onJumpToInterviewPrep('checklist')}
          className="p-5 sm:p-6 text-left hover:bg-slate-50/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
        >
          <p className="text-xs font-medium text-slate-500">직무 준비 달성률</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600 tabular-nums">
            {stats.checklistPct}%
          </p>
          <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
            {stats.completedChecks} / {checklist.length} 체크리스트 완료
          </p>
        </button>
      </section>

      {/* At-a-Glance Visual Grid: Pipeline + Deadlines (Left) & Phase Readiness (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Pipeline Breakdown & Upcoming Top 3 */}
        <div className="lg:col-span-7 bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] rounded-lg p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                전형 단계별 파이프라인 분포
              </h2>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                총 {stats.total}개 공고
              </span>
            </div>

            {/* Stacked Visual Pipeline Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-sm overflow-hidden flex gap-0.5">
              {stats.preparing > 0 && (
                <div
                  className="h-full bg-slate-400 transition-all duration-300"
                  style={{ width: `${(stats.preparing / pipelineBase) * 100}%` }}
                  title={`준비 중 ${stats.preparing}건`}
                />
              )}
              {stats.submitted > 0 && (
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${(stats.submitted / pipelineBase) * 100}%` }}
                  title={`서류 · 과제 ${stats.submitted}건`}
                />
              )}
              {stats.interview > 0 && (
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(stats.interview / pipelineBase) * 100}%` }}
                  title={`면접 진행 ${stats.interview}건`}
                />
              )}
              {stats.passed > 0 && (
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${(stats.passed / pipelineBase) * 100}%` }}
                  title={`최종 합격 ${stats.passed}건`}
                />
              )}
            </div>

            {/* Clean Typographic Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
              <div className="flex items-center justify-between border border-slate-200 rounded px-3 py-2 bg-slate-50/70">
                <span className="text-slate-600 font-medium">준비 중</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {stats.preparing}
                </span>
              </div>
              <div className="flex items-center justify-between border border-slate-200 rounded px-3 py-2 bg-slate-50/70">
                <span className="text-amber-700 font-medium">서류 · 과제</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {stats.submitted}
                </span>
              </div>
              <div className="flex items-center justify-between border border-slate-200 rounded px-3 py-2 bg-slate-50/70">
                <span className="text-blue-700 font-medium">면접 진행</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {stats.interview}
                </span>
              </div>
              <div className="flex items-center justify-between border border-slate-200 rounded px-3 py-2 bg-slate-50/70">
                <span className="text-emerald-700 font-medium">최종 합격</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {stats.passed}
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Top 3 Timeline */}
          <div className="pt-5 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                다가오는 주요 전형 · 마감 일정
              </h3>
              <span className="text-xs text-slate-400">클릭하여 상세 수정</span>
            </div>

            {stats.upcomingTop3.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">
                예정된 마감 또는 전형 일정이 없습니다.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {stats.upcomingTop3.map((app) => {
                  const days = getDaysRemaining(app.deadline);
                  const urgent = days !== null && days <= 3;
                  return (
                    <li key={app.id}>
                      <button
                        type="button"
                        onClick={() => onSelectApplication(app)}
                        className="w-full py-2.5 flex items-center justify-between gap-4 text-left hover:bg-slate-50 px-2 -mx-2 rounded transition-colors"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <span
                            className={`font-mono text-xs tabular-nums w-12 shrink-0 ${
                              urgent
                                ? 'text-rose-600 font-semibold'
                                : 'text-amber-700 font-medium'
                            }`}
                          >
                            {formatDday(app.deadline)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {app.company}{' '}
                              <span className="text-slate-500 font-normal">
                                · {app.stage}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {app.nextAction || app.role}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono tabular-nums text-slate-400 shrink-0">
                          {formatKoreanDate(app.deadline)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right: 4-Phase Readiness Breakdown */}
        <div className="lg:col-span-5 bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] rounded-lg p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                단계별 취업 준비 진행도
              </h2>
              <button
                type="button"
                onClick={() => onJumpToInterviewPrep('checklist')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
              >
                체크리스트 관리 →
              </button>
            </div>

            <div className="space-y-4 pt-1">
              {PHASES.map((phase) => {
                const items = checklist.filter((c) => c.phase === phase);
                const done = items.filter((i) => i.completed).length;
                const pct =
                  items.length > 0 ? Math.round((done / items.length) * 100) : 0;

                return (
                  <div key={phase} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">{phase}</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {done}/{items.length} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-sm overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          pct === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connected Studio Quick Summary */}
          <div className="pt-5 border-t border-slate-200 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onJumpToDocuments('cover-letter')}
              className="p-3.5 text-left bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-white rounded-md transition-colors"
            >
              <p className="text-xs text-slate-500">작성 중 자기소개서</p>
              <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                {draftCount}개 문항
              </p>
            </button>
            <button
              type="button"
              onClick={() => onJumpToInterviewPrep('interview')}
              className="p-3.5 text-left bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-white rounded-md transition-colors"
            >
              <p className="text-xs text-slate-500">모의 면접 답변 노트</p>
              <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                {noteCount}건 저장
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Full-Width Application Pipeline Table */}
      <section className="bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)] rounded-lg overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md overflow-x-auto">
            {FILTER_TABS.map((tab) => {
              const active = filterGroup === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterGroup(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="기업명, 직무, 할 일 검색"
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <button
              type="button"
              onClick={() => setSortAsc((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortAsc ? '마감 임박순' : '마감 여유순'}</span>
            </button>
          </div>
        </div>

        {/* High-Density Data Grid */}
        {filteredApps.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <p className="text-sm font-medium text-slate-900">
              조건에 맞는 지원 공고가 없습니다.
            </p>
            <p className="text-xs text-slate-500">
              필터를 변경하거나 새로운 반도체·전기 기업 지원서를 등록해 보세요.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenNewApplication}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>첫 지원서 등록하기</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <th className="py-3 px-4 whitespace-nowrap">기업 · 근무 조건</th>
                  <th className="py-3 px-4 whitespace-nowrap">지원 직무</th>
                  <th className="py-3 px-4 whitespace-nowrap">전형 단계</th>
                  <th className="py-3 px-4 whitespace-nowrap">다음 할 일</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">마감 / 일정일</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">D-Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredApps.map((app) => {
                  const daysLeft = getDaysRemaining(app.deadline);
                  const isClosed = app.stage === '최종 합격' || app.stage === '불합격';
                  const isUrgent =
                    !isClosed && daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

                  return (
                    <tr
                      key={app.id}
                      onClick={() => onSelectApplication(app)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {app.company}
                          </span>
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`${app.company} 채용 공고 열기`}
                              className="text-slate-400 hover:text-blue-600 p-0.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <span>{app.workType}</span>
                          <span aria-hidden="true">·</span>
                          <span>{app.location}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-middle text-slate-700 font-medium">
                        {app.role}
                      </td>

                      <td
                        className="py-3.5 px-4 align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          aria-label={`${app.company} 전형 단계 변경`}
                          value={app.stage}
                          onChange={(e) =>
                            onUpdateStage(app.id, e.target.value as ApplicationStage)
                          }
                          className={`text-xs bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1.5 py-1 -ml-1.5 focus:outline-none cursor-pointer ${getStageTextStyle(
                            app.stage
                          )}`}
                        >
                          {STAGES.map((st) => (
                            <option
                              key={st}
                              value={st}
                              className="bg-white text-slate-900 font-normal"
                            >
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4 align-middle text-xs text-slate-600 max-w-xs truncate">
                        {app.nextAction || '상세 메모 입력하기'}
                      </td>

                      <td className="py-3.5 px-4 align-middle text-right font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {formatKoreanDate(app.deadline)}
                      </td>

                      <td
                        className={`py-3.5 px-4 align-middle text-right font-mono text-xs tabular-nums whitespace-nowrap ${
                          isUrgent
                            ? 'text-rose-600 font-semibold'
                            : isClosed
                            ? 'text-slate-400'
                            : 'text-slate-700 font-medium'
                        }`}
                      >
                        {formatDday(app.deadline)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
