import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import type { Request, Response } from 'express';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. Settings > Secrets 패널에서 API 키를 확인해 주세요.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatApiError(err: unknown): { status: number; message: string } {
  const rawMessage = err instanceof Error ? err.message : 'AI 요청 처리 중 오류가 발생했습니다.';
  if (rawMessage.includes('API_KEY_INVALID') || rawMessage.includes('PERMISSION_DENIED') || rawMessage.includes('403')) {
    return {
      status: 403,
      message: 'API 키 권한이 유효하지 않습니다. Settings > Secrets 패널에서 GEMINI_API_KEY를 확인해 주세요.',
    };
  }
  if (rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('429')) {
    return {
      status: 429,
      message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.',
    };
  }
  if (rawMessage.includes('GEMINI_API_KEY')) {
    return { status: 500, message: rawMessage };
  }
  return { status: 500, message: rawMessage };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.post('/api/ai/review-cover-letter', async (req: Request, res: Response) => {
    try {
      const { company, role, prompt, draft, jdNotes, charLimit } = req.body ?? {};
      if (!draft || typeof draft !== 'string' || draft.trim().length < 20) {
        res.status(400).json({ error: '첨삭을 받으려면 자기소개서 본문을 최소 20자 이상 입력해 주세요.' });
        return;
      }

      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          `지원 기업: ${company || '미지정'}`,
          `지원 직무: ${role || '미지정'}`,
          `문항: ${prompt || '자유 양식'}`,
          `목표 글자 수: ${charLimit || 1000}자 내외`,
          jdNotes ? `채용 공고 / 직무 핵심 요구사항:\n${jdNotes}` : '',
          `지원자 작성 초안:\n${draft}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
        config: {
          systemInstruction:
            '당신은 대한민국 반도체(메모리·파운드리·팹리스·소부장) 및 전기전자·전력기기(변압기·전력계통·에너지 공기업) 분야의 현직 채용 평가관이자 엔지니어링 커리어 코치입니다. 지원자의 자기소개서 초안을 분석하여 냉철하면서도 실용적인 피드백을 한국어로 제공합니다. 막연한 칭찬 대신 구체적인 STAR(상황-과제-행동-결과) 근거, 공학적 문제 해결 논리(원인 분석-실험/시뮬레이션-정량 지표), 직무 적합성을 짚어주고, 목표 글자 수에 맞춘 매끄러운 수정 제안문(revisedDraft)을 작성해 주세요.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: '초안에 대한 핵심 총평 (2~3문장)',
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '현재 초안에서 잘 드러난 강점 2~3가지',
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '보완이 필요한 구체적인 개선 포인트 3~4가지',
              },
              revisedDraft: {
                type: Type.STRING,
                description: '원문의 경험과 의도를 살리면서 직무 적합성과 가독성을 높여 다듬은 완성형 예시 문안',
              },
            },
            required: ['summary', 'strengths', 'improvements', 'revisedDraft'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err) {
      const { status, message } = formatApiError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/generate-questions', async (req: Request, res: Response) => {
    try {
      const { role, interviewType, company, jdNotes } = req.body ?? {};
      if (!role || typeof role !== 'string' || !role.trim()) {
        res.status(400).json({ error: '지원 직무를 입력해 주세요.' });
        return;
      }

      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          `지원 직무: ${role.trim()}`,
          `면접 유형: ${interviewType || '직무 · 기술'}`,
          company ? `목표 기업: ${company}` : '',
          jdNotes ? `참고 직무기술서 / 메모:\n${jdNotes}` : '',
          '실제 실무진 및 임원 면접에서 나올 법한 날카롭고 현실적인 면접 질문 5개를 생성해 주세요.',
        ]
          .filter(Boolean)
          .join('\n\n'),
        config: {
          systemInstruction:
            '당신은 실전 채용 면접관입니다. 지원 직무와 면접 유형에 맞춰 변별력 있는 질문 5개를 한국어로 출제하고, 각 질문의 출제 의도와 답변 전략 팁을 간결하게 제시하세요.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING, description: '실제 면접 질문' },
                    category: { type: Type.STRING, description: '질문 영역 (예: 문제 해결, 직무 역량, 협업)' },
                    intent: { type: Type.STRING, description: '면접관의 출제 의도 (1~2문장)' },
                    tip: { type: Type.STRING, description: '좋은 답변을 위한 핵심 구조 팁 (1~2문장)' },
                  },
                  required: ['question', 'category', 'intent', 'tip'],
                },
              },
            },
            required: ['questions'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{"questions":[]}').trim());
      res.json(parsed);
    } catch (err) {
      const { status, message } = formatApiError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/review-answer', async (req: Request, res: Response) => {
    try {
      const { role, interviewType, question, answer } = req.body ?? {};
      if (!question || !answer || typeof answer !== 'string' || answer.trim().length < 15) {
        res.status(400).json({ error: '모의 면접 답변을 최소 15자 이상 작성해 주세요.' });
        return;
      }

      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          `지원 직무: ${role || '일반 직무'}`,
          `면접 유형: ${interviewType || '종합 면접'}`,
          `면접 질문: ${question}`,
          `지원자 답변:\n${answer}`,
        ].join('\n\n'),
        config: {
          systemInstruction:
            '당신은 베테랑 면접 코치입니다. 지원자의 구술/작성 답변을 분석하여 핵심 전달력, STAR 논리 구조 충족 여부, 구체적 보완점, 다듬은 모범 답변 예시, 그리고 이어질 예상 꼬리 질문 2가지를 한국어로 제공하세요.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING, description: '전반적인 답변 평가 요약 (2문장)' },
              starFeedback: { type: Type.STRING, description: 'STAR(상황-과제-행동-결과) 구조 및 구체성 점검' },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '답변에서 긍정적인 요소 2가지',
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '면접장에서 감점을 피하기 위해 보완할 점 2~3가지',
              },
              refinedAnswer: {
                type: Type.STRING,
                description: '실제 말하기 호흡에 맞춰 두괄식으로 재구성한 개선 답변 예시',
              },
              followUpQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '면접관이 이어서 물어볼 법한 압박/심화 꼬리 질문 2개',
              },
            },
            required: ['verdict', 'starFeedback', 'strengths', 'improvements', 'refinedAnswer', 'followUpQuestions'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err) {
      const { status, message } = formatApiError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/review-resume', async (req: Request, res: Response) => {
    try {
      const { role, content } = req.body ?? {};
      if (!content || typeof content !== 'string' || content.trim().length < 20) {
        res.status(400).json({ error: '점검할 이력서 경력/프로젝트 내용을 최소 20자 이상 입력해 주세요.' });
        return;
      }

      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [`목표 직무: ${role || '미지정'}`, `이력서 / 프로젝트 서술 원문:\n${content}`].join('\n\n'),
        config: {
          systemInstruction:
            '당신은 테크/비즈니스 리크루터입니다. 지원자의 이력서 불릿 포인트나 프로젝트 설명을 검토해 추상적인 표현("~를 담당함", "~에 기여함")을 성과와 행동 중심("문제 정의 -> 실행 -> 정량적/정성적 결과") 문장으로 개선해 주세요.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { type: Type.STRING, description: '이력서 서술 전반에 대한 핵심 진단 (2~3문장)' },
              rewrites: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING, description: '원문에서 개선 대상이 되는 문장 또는 항목 요약' },
                    improved: { type: Type.STRING, description: '성과·역할 중심으로 재작성한 문장' },
                    reason: { type: Type.STRING, description: '왜 이렇게 고치면 설득력이 높아지는지 설명' },
                  },
                  required: ['original', 'improved', 'reason'],
                },
              },
              missingKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '해당 직무 이력서에서 보강하면 좋은 핵심 역량/키워드 3~5개',
              },
            },
            required: ['overview', 'rewrites', 'missingKeywords'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err) {
      const { status, message } = formatApiError(err);
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
