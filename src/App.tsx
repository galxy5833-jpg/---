import { useEffect, useState } from 'react';
import { ApplicationModal } from './components/ApplicationModal';
import { ChecklistResumeView } from './components/ChecklistResumeView';
import { CoverLetterStudio } from './components/CoverLetterStudio';
import { DashboardView } from './components/DashboardView';
import { MockInterviewView } from './components/MockInterviewView';
import { TopBar } from './components/TopBar';
import {
  INITIAL_APPLICATIONS,
  INITIAL_CHECKLIST,
  INITIAL_COVER_LETTERS,
  INITIAL_INTERVIEW_NOTES,
  INITIAL_PROFILE,
} from './data/initialData';
import type {
  ApplicationStage,
  ChecklistItem,
  ChecklistPhase,
  CoverLetterDraft,
  JobApplication,
  SavedInterviewNote,
  UserCareerProfile,
  WorkspaceTab,
} from './types/career';
import { getTodayIso, loadFromStorage, saveToStorage } from './utils/storage';

const STORAGE_KEYS = {
  apps: 'careerdesk_v2_semi_apps',
  drafts: 'careerdesk_v2_semi_drafts',
  checklist: 'careerdesk_v2_semi_checklist',
  notes: 'careerdesk_v2_semi_notes',
  profile: 'careerdesk_v2_semi_profile',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [documentsSubTab, setDocumentsSubTab] = useState<'cover-letter' | 'resume'>(
    'cover-letter'
  );
  const [interviewSubTab, setInterviewSubTab] = useState<'interview' | 'checklist'>(
    'interview'
  );

  const [profile, setProfile] = useState<UserCareerProfile>(() =>
    loadFromStorage(STORAGE_KEYS.profile, INITIAL_PROFILE)
  );
  const [applications, setApplications] = useState<JobApplication[]>(() =>
    loadFromStorage(STORAGE_KEYS.apps, INITIAL_APPLICATIONS)
  );
  const [coverLetters, setCoverLetters] = useState<CoverLetterDraft[]>(() =>
    loadFromStorage(STORAGE_KEYS.drafts, INITIAL_COVER_LETTERS)
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.checklist, INITIAL_CHECKLIST)
  );
  const [interviewNotes, setInterviewNotes] = useState<SavedInterviewNote[]>(() =>
    loadFromStorage(STORAGE_KEYS.notes, INITIAL_INTERVIEW_NOTES)
  );

  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(
    () => coverLetters[0]?.id ?? null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  useEffect(() => saveToStorage(STORAGE_KEYS.profile, profile), [profile]);
  useEffect(() => saveToStorage(STORAGE_KEYS.apps, applications), [applications]);
  useEffect(() => saveToStorage(STORAGE_KEYS.drafts, coverLetters), [coverLetters]);
  useEffect(() => saveToStorage(STORAGE_KEYS.checklist, checklist), [checklist]);
  useEffect(() => saveToStorage(STORAGE_KEYS.notes, interviewNotes), [interviewNotes]);

  const handleSaveApplication = (
    data: Omit<JobApplication, 'id' | 'updatedAt'>,
    existingId?: string
  ) => {
    const today = getTodayIso();
    if (existingId) {
      setApplications((prev) =>
        prev.map((item) =>
          item.id === existingId ? { ...item, ...data, updatedAt: today } : item
        )
      );
    } else {
      const next: JobApplication = {
        ...data,
        id: `app-${Date.now()}`,
        updatedAt: today,
      };
      setApplications((prev) => [next, ...prev]);
    }
  };

  const handleDeleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateStage = (id: string, stage: ApplicationStage) => {
    setApplications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stage, updatedAt: getTodayIso() } : item
      )
    );
  };

  const handleCreateDraft = (linkedApp?: JobApplication) => {
    const newDraft: CoverLetterDraft = {
      id: `cl-${Date.now()}`,
      applicationId: linkedApp?.id ?? null,
      companyName: linkedApp?.company ?? '',
      roleTitle: linkedApp?.role ?? profile.targetRole,
      prompt:
        '지원 동기와 해당 직무에 본인이 적합한 이유를 구체적인 설계·실험 경험을 바탕으로 작성해 주세요.',
      content: '',
      charLimit: 1000,
      updatedAt: getTodayIso(),
    };
    setCoverLetters((prev) => [newDraft, ...prev]);
    setSelectedDraftId(newDraft.id);
    setDocumentsSubTab('cover-letter');
    setActiveTab('documents');
  };

  const handleUpdateDraft = (id: string, patch: Partial<CoverLetterDraft>) => {
    setCoverLetters((prev) =>
      prev.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft))
    );
  };

  const handleDeleteDraft = (id: string) => {
    setCoverLetters((prev) => {
      const next = prev.filter((d) => d.id !== id);
      if (selectedDraftId === id) {
        setSelectedDraftId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleAddChecklist = (
    phase: ChecklistPhase,
    title: string,
    detail: string
  ) => {
    const next: ChecklistItem = {
      id: `chk-${Date.now()}`,
      phase,
      title,
      detail,
      completed: false,
      isCustom: true,
    };
    setChecklist((prev) => [...prev, next]);
  };

  const handleDeleteChecklist = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveInterviewNote = (
    note: Omit<SavedInterviewNote, 'id' | 'createdAt'>
  ) => {
    const next: SavedInterviewNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: getTodayIso(),
    };
    setInterviewNotes((prev) => [next, ...prev]);
  };

  const handleDeleteInterviewNote = (id: string) => {
    setInterviewNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleResetDemoData = () => {
    setProfile(INITIAL_PROFILE);
    setApplications(INITIAL_APPLICATIONS);
    setCoverLetters(INITIAL_COVER_LETTERS);
    setChecklist(INITIAL_CHECKLIST);
    setInterviewNotes(INITIAL_INTERVIEW_NOTES);
    setSelectedDraftId(INITIAL_COVER_LETTERS[0]?.id ?? null);
  };

  const checklistPct =
    checklist.length > 0
      ? Math.round((checklist.filter((c) => c.completed).length / checklist.length) * 100)
      : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-zinc-100">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewApplication={() => {
          setEditingApp(null);
          setModalOpen(true);
        }}
      />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-8 py-8 sm:py-10">
        {/* Page 1: Executive Main Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            onUpdateProfile={setProfile}
            onResetDemoData={handleResetDemoData}
            applications={applications}
            checklist={checklist}
            draftCount={coverLetters.length}
            noteCount={interviewNotes.length}
            onSelectApplication={(app) => {
              setEditingApp(app);
              setModalOpen(true);
            }}
            onUpdateStage={handleUpdateStage}
            onOpenNewApplication={() => {
              setEditingApp(null);
              setModalOpen(true);
            }}
            onJumpToDocuments={(subTab) => {
              if (subTab) setDocumentsSubTab(subTab);
              setActiveTab('documents');
            }}
            onJumpToInterviewPrep={(subTab) => {
              if (subTab) setInterviewSubTab(subTab);
              setActiveTab('interview-prep');
            }}
          />
        )}

        {/* Page 2: Cover Letter & Resume Studio */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-800/90">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
                  자소서 · 이력서 AI 스튜디오
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                  지원 기업의 직무 요구사항(JD)을 연동해 자기소개서를 첨삭하고 이력서 경력 문장을 성과 중심으로 다듬습니다.
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-md self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setDocumentsSubTab('cover-letter')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    documentsSubTab === 'cover-letter'
                      ? 'bg-zinc-800 text-zinc-50'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  자기소개서 AI 첨삭
                </button>
                <button
                  type="button"
                  onClick={() => setDocumentsSubTab('resume')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    documentsSubTab === 'resume'
                      ? 'bg-zinc-800 text-zinc-50'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  이력서 문장 점검
                </button>
              </div>
            </div>

            {documentsSubTab === 'cover-letter' ? (
              <CoverLetterStudio
                drafts={coverLetters}
                applications={applications}
                selectedDraftId={selectedDraftId}
                onSelectDraft={setSelectedDraftId}
                onCreateDraft={handleCreateDraft}
                onUpdateDraft={handleUpdateDraft}
                onDeleteDraft={handleDeleteDraft}
                hideHeader
              />
            ) : (
              <ChecklistResumeView
                defaultRole={profile.targetRole}
                checklist={checklist}
                onToggleItem={handleToggleChecklist}
                onAddItem={handleAddChecklist}
                onDeleteItem={handleDeleteChecklist}
                forcedSubView="resume"
                hideHeader
              />
            )}
          </div>
        )}

        {/* Page 3: Mock Interview & Prep Checklist */}
        {activeTab === 'interview-prep' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-800/90">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
                  모의 면접 · 준비 체크리스트
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                  직무 맞춤 예상 질문으로 실전 면접을 연습하고, 서류·필기·면접 4단계 준비 상태를 점검합니다.
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-md self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setInterviewSubTab('interview')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    interviewSubTab === 'interview'
                      ? 'bg-zinc-800 text-zinc-50'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  AI 모의 면접 코치
                </button>
                <button
                  type="button"
                  onClick={() => setInterviewSubTab('checklist')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    interviewSubTab === 'checklist'
                      ? 'bg-zinc-800 text-zinc-50'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  준비 체크리스트 ({checklistPct}%)
                </button>
              </div>
            </div>

            {interviewSubTab === 'interview' ? (
              <MockInterviewView
                defaultRole={profile.targetRole}
                applications={applications}
                notes={interviewNotes}
                onSaveNote={handleSaveInterviewNote}
                onDeleteNote={handleDeleteInterviewNote}
                hideHeader
              />
            ) : (
              <ChecklistResumeView
                defaultRole={profile.targetRole}
                checklist={checklist}
                onToggleItem={handleToggleChecklist}
                onAddItem={handleAddChecklist}
                onDeleteItem={handleDeleteChecklist}
                forcedSubView="checklist"
                hideHeader
              />
            )}
          </div>
        )}
      </main>

      <ApplicationModal
        open={modalOpen}
        initialData={editingApp}
        onClose={() => {
          setModalOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSaveApplication}
        onDelete={handleDeleteApplication}
        onCreateCoverLetter={handleCreateDraft}
      />
    </div>
  );
}
