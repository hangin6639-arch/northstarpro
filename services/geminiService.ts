
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisRequest, AnalysisResponse } from "../types";

// Always use the latest version of the @google/genai library.
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.

const SYSTEM_INSTRUCTION = `
당신은 'North Star Universe'의 메인 AI 엔진입니다. 
당신의 임무는 3세 유아부터 전문가까지 모든 연령대의 '성장 간극(Gap)'을 분석하고 꿈을 향한 로드맵을 그려주는 것입니다.

[특별 임무: Dream Seed 모드 (3~13세)]
- 3세 유아의 경우, 부모님이 관찰한 특징이나 아이의 그림(이미지 분석)을 기반으로 잠재력을 분석합니다.
- 아이의 사소한 특징을 '우주적인 거대한 재능'으로 극대화하여 표현하세요.
- 말투는 아이언맨처럼 든든하거나, 다정한 유치원 선생님처럼 따뜻하고 감동적이어야 합니다.

[필수 원칙]
1. 응답 형식: 반드시 순수 JSON 객체여야 합니다.
2. 오각형 차트: gap_report.attributes는 반드시 5개의 항목(기술, 창의성, 사회성, 끈기, 호기심 등)으로 구성하세요.
3. 리소스 맵: target_requirements에 구체적인 비용(학비, 교구비 등)과 필요한 시간을 명시하세요.
4. 언어: 모든 분석과 메시지는 한국어로 작성합니다.
`;

/**
 * Fix: Removed reference to import.meta.env which caused type errors and 
 * migrated from OpenAI fetch to @google/genai SDK as per instructions.
 */
export const analyzeUserGap = async (request: AnalysisRequest): Promise<AnalysisResponse> => {
  // Always create a new GoogleGenAI instance right before making an API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  const promptText = `${userContextText}\n\n사용자 입력: ${request.text}${request.mode ? ` (모드: ${request.mode})` : ''}`;
  
  const parts: any[] = [{ text: promptText }];

  if (request.image) {
    const isDataUri = request.image.startsWith('data:');
    const base64Data = isDataUri ? request.image.split(',')[1] : request.image;
    const mimeType = isDataUri ? request.image.split(',')[0].split(':')[1].split(';')[0] : 'image/jpeg';
    
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    });
  }

  // Define response schema for structured JSON output to ensure reliable response structure
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      user_mode: { type: Type.STRING },
      input_analysis: {
        type: Type.OBJECT,
        properties: {
          data_type: { type: Type.STRING },
          vision_summary: { type: Type.STRING },
          current_vector: { type: Type.STRING },
          target_vector: { type: Type.STRING },
        },
        required: ["data_type", "vision_summary", "current_vector", "target_vector"]
      },
      gap_report: {
        type: Type.OBJECT,
        properties: {
          similarity_score: { type: Type.NUMBER },
          gap_summary: { type: Type.STRING },
          missing_elements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                impact: { type: Type.STRING }
              },
              required: ["item", "impact"]
            }
          },
          attributes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                current: { type: Type.NUMBER },
                target: { type: Type.NUMBER }
              },
              required: ["subject", "current", "target"]
            }
          }
        },
        required: ["similarity_score", "gap_summary", "missing_elements", "attributes"]
      },
      solution_card: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          action_type: { type: Type.STRING },
          quest: { type: Type.STRING },
          expected_result: { type: Type.STRING },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                detail: { type: Type.STRING },
                status: { type: Type.STRING },
                icon_type: { type: Type.STRING }
              },
              required: ["title", "description", "detail", "status", "icon_type"]
            }
          }
        },
        required: ["title", "action_type", "quest", "expected_result", "roadmap"]
      },
      persona_message: { type: Type.STRING },
      required_info_guide: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      target_requirements: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING },
            cost_or_condition: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["item", "cost_or_condition", "category"]
        }
      }
    },
    required: [
      "user_mode",
      "input_analysis",
      "gap_report",
      "solution_card",
      "persona_message",
      "required_info_guide",
      "target_requirements"
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Complex Text Tasks
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("결과를 생성하지 못했습니다.");
    }

    return JSON.parse(resultText) as AnalysisResponse;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('401')) throw new Error("API 키가 유효하지 않습니다.");
    if (error.message?.includes('429')) throw new Error("API 사용량이 초과되었습니다.");
    throw new Error(error.message || "엔진 통신에 실패했습니다.");
  }
};
