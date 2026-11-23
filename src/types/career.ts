export type WorkspaceTab = 'dashboard' | 'documents' | 'interview-prep';

export type ApplicationStage =
  | '준비 중'
  | '서류 제출'
  | '과제 · 코테'
  | '1차 면접'
  | '최종 면접'
  | '최종 합격'
  | '불합격';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  deadline: string; // YYYY-MM-DD
  workType: '정규직' | '인턴' | '계약직';
  location: string;
  jobUrl: string;
  jdNotes: string;
  nextAction: string;
  updatedAt: string;
}

export interface CoverLetterDraft {
  id: string;
  applicationId: string | null;
  companyName: string;
  roleTitle: string;
  prompt: string;
  content: string;
  charLimit: number;
  updatedAt: string;
}

export interface CoverLetterFeedback {
  summary: string;
  strengths: string[];
  improvements: string[];
  revisedDraft: string;
}

export type InterviewType = '직무 · 기술' | '인성 · 컬처핏' | '경험 · 꼬리질문';

export interface GeneratedQuestion {
  question: string;
  category: string;
  intent: string;
  tip: string;
}

export interface InterviewAnswerFeedback {
  verdict: string;
  starFeedback: string;
  strengths: string[];
  improvements: string[];
  refinedAnswer: string;
  followUpQuestions: string[];
}

export interface SavedInterviewNote {
  id: string;
  role: string;
  interviewType: InterviewType;
  question: string;
  answer: string;
  feedback?: InterviewAnswerFeedback;
  durationSeconds: number;
  createdAt: string;
}

export type ChecklistPhase =
  | '01. 직무·기업 분석'
  | '02. 이력서·포트폴리오'
  | '03. 직무 역량·테스트'
  | '04. 면접 최종 점검';

export interface ChecklistItem {
  id: string;
  phase: ChecklistPhase;
  title: string;
  detail: string;
  completed: boolean;
  isCustom?: boolean;
}

export interface ResumeAuditResult {
  overview: string;
  rewrites: {
    original: string;
    improved: string;
    reason: string;
  }[];
  missingKeywords: string[];
}

export interface UserCareerProfile {
  targetRole: string;
  experienceLevel: string;
}
