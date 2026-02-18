import OpenAI from "openai";
import { AnalysisRequest, AnalysisResponse } from "../types";

/**
 * North Star Universe AI Service
 * Engine: GPT-4o (OpenAI)
 * API Key Access: import.meta.env.VITE_OPENAI_API_KEY
 */

const SYSTEM_INSTRUCTION = `
당신은 'North Star Universe'의 메인 AI 엔진입니다. 
당신의 임무는 3세 유아부터 전문가까지 모든 연령대의 '성장 간극(Gap)'을 분석하고 꿈을 향한 로드맵을 그려주는 것입니다.

[특별 임무: Dream Seed 모드 (3~13세)]
- 3세 유아의 경우, 부모님이 관찰한 특징이나 아이의 그림(이미지 분석)을 기반으로 잠재력을 분석합니다.
- 아이의 사소한 특징을 '우주적인 거대한 재능'으로 극대화하여 표현하세요.
- 말투는 아이언맨처럼 든든하거나, 다정한 유치원 선생님처럼 따뜻하고 감동적이어야 합니다.

[필수 원칙]
1. 응답 형식: 반드시 순수한 JSON 객체로만 응답하세요. (마크다운 코드블럭 사용 금지)
2. user_mode 필드는 반드시 'Dream Seed', 'Career Builder', 'Pro Navigator' 중 하나여야 합니다.
3. gap_report.attributes는 반드시 5개의 항목(기술, 창의성, 사회성, 끈기, 호기심 등)으로 구성하세요.
4. 리소스 맵: target_requirements에 구체적인 비용(학비, 교구비 등)과 필요한 시간을 명시하세요.
5. 언어: 모든 분석과 메시지는 한국어로 작성합니다.
`;

export const analyzeUserGap = async (request: AnalysisRequest): Promise<AnalysisResponse> => {
  
  // 1. API 키 확인 (Vite 환경 변수)
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error("API Key Missing. Env:", import.meta.env);
    throw new Error("API 키가 설정되지 않았습니다. Netlify 환경 변수(VITE_OPENAI_API_KEY)를 확인하세요.");
  }

  // 2. OpenAI 클라이언트 초기화
  // dangerouslyAllowBrowser: true는 클라이언트 사이드 실행을 위해 필수입니다.
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true 
  });

  // 3. 사용자 컨텍스트 구성
  let userContextText = "";
  if (request.surveyContext) {
    userContextText = `
[사용자 프로필]
이름: ${request.surveyContext.name}
그룹: ${request.surveyContext.ageGroup}
분야: ${request.surveyContext.field}
자원: 예산(${request.surveyContext.budgetLevel}), 시간(${request.surveyContext.availableTime})
최종 목표: ${request.surveyContext.ultimateGoal}
`;
  }

  const promptText = `${userContextText}\n\n사용자 분석 요청: ${request.text}${request.mode ? ` (모드: ${request.mode})` : ""}`;

  // 4. 메시지 구성 (이미지 포함 여부 확인)
  const messages: any[] = [
    { role: "system", content: SYSTEM_INSTRUCTION },
  ];

  if (request.image) {
    // 이미지 처리 (GPT-4 Vision 호환 포맷)
    let imageUrl = request.image;
    
    // base64 문자열에 헤더가 없는 경우 추가
    if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
       imageUrl = `data:image/jpeg;base64,${request.image}`;
    }

    messages.push({
      role: "user",
      content: [
        { type: "text", text: promptText },
        {
          type: "image_url",
          image_url: { url: imageUrl }
        }
      ]
    });
  } else {
    // 텍스트만 있는 경우
    messages.push({ role: "user", content: promptText });
  }

  try {
    // 5. GPT 모델 호출
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // 최신 모델 사용
      messages: messages,
      response_format: { type: "json_object" }, // JSON 강제 모드
      temperature: 0.7,
    });

    const resultText = response.choices[0].message.content;

    if (!resultText) {
      throw new Error("AI 엔진으로부터 응답을 받지 못했습니다.");
    }

    // JSON 파싱 및 반환
    return JSON.parse(resultText) as AnalysisResponse;

  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    
    if (error.status === 401) throw new Error("API 키가 유효하지 않습니다. (401 Error)");
    if (error.status === 429) throw new Error("API 사용량이 초과되었습니다. (429 Error)");
    
    throw new Error(error.message || "분석 엔진 통신 중 오류가 발생했습니다.");
  }
};
