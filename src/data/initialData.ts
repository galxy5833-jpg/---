import type {
  ChecklistItem,
  CoverLetterDraft,
  JobApplication,
  SavedInterviewNote,
  UserCareerProfile,
} from '../types/career';
import { addDaysIso } from '../utils/storage';

export const INITIAL_PROFILE: UserCareerProfile = {
  targetRole: '반도체 공정기술 · 회로설계 엔지니어',
  experienceLevel: '신입 · 학사 / 석사',
};

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    company: '삼성전자 (DS부문)',
    role: '반도체 공정기술 엔지니어 (파운드리/메모리)',
    stage: '1차 면접',
    deadline: addDaysIso(3),
    workType: '정규직',
    location: '경기 화성 · 평택',
    jobUrl: 'https://www.samsungcareers.com',
    jdNotes:
      '포토·식각·증착·CMP 등 반도체 단위 공정 최적화 및 수율 개선. 공정 산포 분석(SPC/DOE) 및 불량 원인 규명(FA) 역량, 유관 부서(설계·양산기술) 협업 능력 중시.',
    nextAction: 'PT 면접 대비 8대 공정 트러블슈팅 사례 정리',
    updatedAt: addDaysIso(-1),
  },
  {
    id: 'app-2',
    company: 'SK하이닉스',
    role: 'DRAM 회로설계 · 검증 엔지니어',
    stage: '준비 중',
    deadline: addDaysIso(5),
    workType: '정규직',
    location: '경기 이천 · 분당',
    jobUrl: 'https://careers.skhynix.com',
    jdNotes:
      'HBM 및 차세대 DRAM 코어/주변회로 설계, HSPICE·Cadence 기반 아날로그 시뮬레이션 또는 Verilog/SystemVerilog RTL 검증 경험 우대.',
    nextAction: '지원동기 및 직무 역량 문항 최종 퇴고 후 제출',
    updatedAt: addDaysIso(0),
  },
  {
    id: 'app-3',
    company: 'DB하이텍',
    role: '아날로그 · 전력반도체(PMIC) 소자/설계',
    stage: '서류 제출',
    deadline: addDaysIso(10),
    workType: '정규직',
    location: '경기 부천 · 충북 음성',
    jobUrl: 'https://recruit.dbhitek.com',
    jdNotes:
      'BCDMOS 공정 기반 전력관리반도체(PMIC) 소자 특성 평가 및 TCAD 시뮬레이션, 항복전압(BV)·온저항(Ron) 트레이드오프 개선 경험.',
    nextAction: '서류 결과 발표 대기 및 소자물리 핵심 개념 복습',
    updatedAt: addDaysIso(-2),
  },
  {
    id: 'app-4',
    company: 'LS일렉트릭 (LS ELECTRIC)',
    role: '초고압 전력기기 · 변전시스템 R&D',
    stage: '과제 · 코테',
    deadline: addDaysIso(2),
    workType: '정규직',
    location: '경기 안양 · 충북 청주',
    jobUrl: 'https://www.ls-electric.com',
    jdNotes:
      '초고압 차단기·변압기 전계/열해석 및 절연 설계, 전력계통 보호협조(PSCAD/ETAP) 해석. 전기기사 자격증 및 전기기기 제어 역량 우대.',
    nextAction: '직무 역량 검사(인적성) 및 전공 필기 대비',
    updatedAt: addDaysIso(-1),
  },
  {
    id: 'app-5',
    company: 'HD현대일렉트릭',
    role: '변압기 · 배전반 전기설계 엔지니어',
    stage: '준비 중',
    deadline: addDaysIso(8),
    workType: '정규직',
    location: '경기 성남 · 울산',
    jobUrl: 'https://recruit.hd.com',
    jdNotes:
      '글로벌 데이터센터·신재생 발전용 전력변압기 사양 설계, 절연 거리 및 단락 강도 검토, 고객사 기술 사양서(Spec) 대응.',
    nextAction: '직무 포트폴리오 1페이지 요약본 첨부 준비',
    updatedAt: addDaysIso(0),
  },
  {
    id: 'app-6',
    company: '한국전력공사 (KEPCO)',
    role: '송변전 · 배전 전기직 (대졸 수준)',
    stage: '최종 합격',
    deadline: addDaysIso(-12),
    workType: '정규직',
    location: '전남 나주 · 전국 사업소',
    jobUrl: 'https://recruit.kepco.co.kr',
    jdNotes:
      '전력계통 운영 및 송배전 설비 진단, 한국전기설비규정(KEC) 준수, 신재생에너지 계통연계 안정화 업무.',
    nextAction: '임용 서류 제출 및 배치 희망 권역 확인',
    updatedAt: addDaysIso(-4),
  },
];

export const INITIAL_COVER_LETTERS: CoverLetterDraft[] = [
  {
    id: 'cl-1',
    applicationId: 'app-2',
    companyName: 'SK하이닉스',
    roleTitle: 'DRAM 회로설계 · 검증 엔지니어',
    prompt:
      '지원 직무에 관심을 갖게 된 계기와 본인이 가진 직무 역량을 구체적인 설계·실험 경험을 바탕으로 서술해 주세요.',
    content:
      'AI 가속기 수요 확대로 HBM과 고대역폭 메모리의 중요성이 커지면서, 한정된 전력 예산 안에서 신호 무결성과 동작 속도를 극대화하는 메모리 회로설계에 깊은 흥미를 느꼈습니다. 학부 집적회로 설계 프로젝트에서 180nm 공정 기반 저전압 LDO 레귤레이터를 설계하며, 부하 전류 급변 시 출력 전압이 120mV 이상 흔들리는 오버슈트 문제를 겪었습니다. 저는 HSPICE로 위상 여유(Phase Margin)를 분석해 밀러 보상 커패시터와 영점 저항 값을 재설계하고, 8코너(Corner) 공정·온도 변동을 반영한 시뮬레이션을 반복했습니다. 그 결과 오버슈트를 42mV 이하로 줄이고 정적 소비전류를 18% 절감할 수 있었습니다. 이러한 코너 분석과 근본 원인 해결 경험을 바탕으로 SK하이닉스의 차세대 DRAM 설계 안정성을 높이는 엔지니어로 기여하겠습니다.',
    charLimit: 1000,
    updatedAt: addDaysIso(0),
  },
  {
    id: 'cl-2',
    applicationId: 'app-1',
    companyName: '삼성전자 (DS부문)',
    roleTitle: '반도체 공정기술 엔지니어',
    prompt:
      '팀 프로젝트 또는 연구 과정에서 예상치 못한 문제(불량·편차 등)를 데이터 기반으로 분석해 해결했던 경험을 작성해 주세요.',
    content:
      '학부 반도체 공정 실습 과정에서 스핀 코팅 후 포토레지스트(PR) 두께가 웨이퍼 가장자리에서 비정상적으로 두꺼워지는 에지 비드(Edge Bead) 편차로 인해 후속 노광 패턴이 뭉개지는 문제가 발생했습니다. 조원들 사이에서는 노광 시간만 늘리자는 의견이 많았으나, 저는 먼저 단계별 변수를 분리해 회전 속도(RPM), 디스펜스 양, 소프트 베이크 온도를 기준으로 3요인 실험계획법(DOE)을 제안했습니다. 9개 조건의 두께 데이터를 측정해 비교한 결과, 초기 저속 회전 구간의 가속도 설정이 가장 큰 원인임을 확인했고 2단 램프 업(Ramp-up) 프로파일을 적용해 웨이퍼 내 두께 균일도(Uniformity)를 94.5%까지 끌어올렸습니다. 이 경험을 통해 공정 트러블슈팅에서 감이 아닌 변수 통제와 정량적 데이터의 중요성을 체감했습니다.',
    charLimit: 1000,
    updatedAt: addDaysIso(-1),
  },
];

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: 'chk-1',
    phase: '01. 직무·기업 분석',
    title: '메모리 · 파운드리 · 전력기기 핵심 산업 동향 3가지 정리',
    detail: 'HBM4 패키징, GAA 2nm 수율 이슈, 북미 AI 데이터센터 변압기·전력망 증설 이슈 스크랩',
    completed: true,
  },
  {
    id: 'chk-2',
    phase: '01. 직무·기업 분석',
    title: '지원 기업 주력 제품·공정 라인업 및 최근 실적 확인',
    detail: '삼성전자 DS, SK하이닉스, DB하이텍, LS일렉트릭, HD현대일렉트릭 사업보고서 핵심 요약',
    completed: true,
  },
  {
    id: 'chk-3',
    phase: '01. 직무·기업 분석',
    title: '공정기술 / 설비기술 / 회로설계 / 전력 직무별 역할 구분 정리',
    detail: '직무기술서(JD) 기준으로 본인의 연구·실습 경험이 가장 잘 맞는 포지션 매칭',
    completed: false,
  },
  {
    id: 'chk-4',
    phase: '02. 이력서·포트폴리오',
    title: '사용 가능 엔지니어링 툴(EDA·해석·분석) 숙련도 명시',
    detail: 'Cadence Virtuoso, HSPICE, Verilog, TCAD, MATLAB/Simulink, PSCAD, JMP 등 정리',
    completed: true,
  },
  {
    id: 'chk-5',
    phase: '02. 이력서·포트폴리오',
    title: '졸업작품·캡스톤·공정실습 결과를 정량 지표로 재작성',
    detail: '수율(%), 두께 균일도, 전력 변환 효율, 슬랙 마진, 오차율 등 구체적 수치 반영',
    completed: false,
  },
  {
    id: 'chk-6',
    phase: '02. 이력서·포트폴리오',
    title: '전공 자격증 및 어학 성적 유효기간·증빙 스캔본 점검',
    detail: '전기기사, 반도체설계산업기사, OPIc/토익스피킹 성적표 및 성적증명서 PDF 준비',
    completed: true,
  },
  {
    id: 'chk-7',
    phase: '03. 직무 역량·테스트',
    title: '반도체 8대 공정 및 소자물리 핵심 개념 노트 완독',
    detail: '산화·포토·식각·증착·CMP 원리, MOSFET 동작, Short Channel Effect, FinFET/GAA 비교',
    completed: true,
  },
  {
    id: 'chk-8',
    phase: '03. 직무 역량·테스트',
    title: '전기기사 · 회로이론 · 전력공학 전공 필기 핵심 문제 복습',
    detail: '대칭좌표법, 퍼센트 임피던스, 변압기 손실/효율, 3상 전력 및 역률 개선 계산 연습',
    completed: false,
  },
  {
    id: 'chk-9',
    phase: '03. 직무 역량·테스트',
    title: 'GSAT / SKCT / 공기업 NCS 실전 모의고사 시간 배분 연습',
    detail: '수리·추리 영역 오답 유형 분류 및 마킹 시간 포함 실전 타이머 훈련',
    completed: false,
  },
  {
    id: 'chk-10',
    phase: '04. 면접 최종 점검',
    title: '직무 PT 면접 대비 문제 해결 발표 프레임워크(원인-가설-검증) 연습',
    detail: '공정 불량 발생 또는 계통 고장 시나리오를 5분 내외로 구조화해 설명하는 연습',
    completed: false,
  },
  {
    id: 'chk-11',
    phase: '04. 면접 최종 점검',
    title: '1분 자기소개 및 클린룸/현장 근무·지방 사업소 적응 의지 답변 정리',
    detail: '실제 교대·현장 협업이나 화성/이천/청주/울산 근무에 대한 진정성 있는 답변 준비',
    completed: false,
  },
  {
    id: 'chk-12',
    phase: '04. 면접 최종 점검',
    title: '면접관에게 할 직무 역질문 3가지 및 졸업논문/과제 질의응답 점검',
    detail: '최근 팀이 주력하는 차세대 공정/전력 설비 과제와 신입 엔지니어 온보딩 질문 준비',
    completed: false,
  },
];

export const INITIAL_INTERVIEW_NOTES: SavedInterviewNote[] = [
  {
    id: 'note-1',
    role: '반도체 공정기술 엔지니어',
    interviewType: '직무 · 기술',
    question:
      'MOSFET 스케일링이 진행되면서 발생하는 Short Channel Effect(단채널 효과)의 대표적인 현상과 이를 완화하기 위한 공정/소자적 해결 방안을 설명해 주세요.',
    answer:
      '채널 길이가 짧아지면 드레인 전압이 소스 측 에너지 장벽을 낮추는 DIBL 현상과 문턱전압 롤오프(Vt Roll-off), 누설전류 증가가 발생합니다. 이를 해결하기 위해 게이트 산화막을 고유전율(High-k) 물질로 대체해 정전용량을 높이고, 채널 도핑을 조절하거나 평면 구조에서 3면/4면으로 채널을 감싸 게이트 제어력을 극대화하는 FinFET 및 GAA(Nanosheet) 구조로 발전해 왔습니다.',
    durationSeconds: 52,
    createdAt: addDaysIso(-2),
  },
];
