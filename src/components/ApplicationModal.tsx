import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ApplicationStage, JobApplication } from '../types/career';
import { getTodayIso } from '../utils/storage';

interface ApplicationModalProps {
  open: boolean;
  initialData: JobApplication | null;
  onClose: () => void;
  onSave: (data: Omit<JobApplication, 'id' | 'updatedAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  onCreateCoverLetter?: (app: JobApplication) => void;
}

const STAGES: ApplicationStage[] = [
  '준비 중',
  '서류 제출',
  '과제 · 코테',
  '1차 면접',
  '최종 면접',
  '최종 합격',
  '불합격',
];

const WORK_TYPES: JobApplication['workType'][] = ['정규직', '인턴', '계약직'];

export function ApplicationModal({
  open,
  initialData,
  onClose,
  onSave,
  onDelete,
  onCreateCoverLetter,
}: ApplicationModalProps) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [stage, setStage] = useState<ApplicationStage>('준비 중');
  const [deadline, setDeadline] = useState(getTodayIso());
  const [workType, setWorkType] = useState<JobApplication['workType']>('정규직');
  const [location, setLocation] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jdNotes, setJdNotes] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setCompany(initialData.company);
      setRole(initialData.role);
      setStage(initialData.stage);
      setDeadline(initialData.deadline);
      setWorkType(initialData.workType);
      setLocation(initialData.location);
      setJobUrl(initialData.jobUrl);
      setJdNotes(initialData.jdNotes);
      setNextAction(initialData.nextAction);
    } else {
      setCompany('');
      setRole('');
      setStage('준비 중');
      setDeadline(getTodayIso());
      setWorkType('정규직');
      setLocation('경기 화성 · 이천');
      setJobUrl('');
      setJdNotes('');
      setNextAction('');
    }
    setErrorMsg('');
  }, [open, initialData]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      setErrorMsg('기업명과 지원 직무는 필수 입력 항목입니다.');
      return;
    }
    onSave(
      {
        company: company.trim(),
        role: role.trim(),
        stage,
        deadline,
        workType,
        location: location.trim() || '미정',
        jobUrl: jobUrl.trim(),
        jdNotes: jdNotes.trim(),
        nextAction: nextAction.trim(),
      },
      initialData?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-xs">
      <div
        className="w-full max-w-xl h-full bg-[#111216] border-l border-zinc-800 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <h2 id="app-modal-title" className="text-base font-semibold text-zinc-100">
            {initialData ? '지원 공고 상세 및 수정' : '새 지원서 등록'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="창 닫기"
            className="p-2 text-zinc-400 hover:text-zinc-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="application-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="px-4 py-3 text-sm text-rose-300 bg-rose-950/50 border border-rose-800 rounded-md">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                기업명 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="예: 삼성전자 DS, SK하이닉스, LS일렉트릭"
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                지원 직무 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="예: 반도체 공정기술 / 전력설비 설계"
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                현재 전형 단계
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as ApplicationStage)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STAGES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                마감일 / 일정일
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                고용 형태
              </label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value as JobApplication['workType'])}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {WORK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                근무 지역
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 경기 화성 · 이천 · 청주"
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                공고 URL
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              다음 할 일 (Next Action)
            </label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="예: PT 면접 대비 8대 공정 트러블슈팅 사례 정리"
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              채용 공고 핵심 요구사항 (JD 메모)
            </label>
            <textarea
              rows={5}
              value={jdNotes}
              onChange={(e) => setJdNotes(e.target.value)}
              placeholder="주요 업무, 자격 요건, 우대 사항을 붙여넣으면 AI 자기소개서 첨삭 및 모의 면접 시 자동으로 반영됩니다."
              className="w-full px-3 py-2.5 text-sm leading-relaxed bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {initialData && onCreateCoverLetter && (
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-4">
              <div className="text-xs text-zinc-400">
                이 공고의 JD 메모를 바탕으로 자기소개서를 작성할 수 있습니다.
              </div>
              <button
                type="button"
                onClick={() => {
                  onCreateCoverLetter(initialData);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                자소서 바로 작성
              </button>
            </div>
          )}
        </form>

        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3 shrink-0">
          <div>
            {initialData && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialData.id);
                  onClose();
                }}
                className="px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-950/60 rounded-md transition-colors whitespace-nowrap"
              >
                삭제
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-md transition-colors whitespace-nowrap"
            >
              취소
            </button>
            <button
              type="submit"
              form="application-form"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap"
            >
              {initialData ? '변경사항 저장' : '지원서 등록'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
