
export enum UserMode {
  DREAM_SEED = 'Dream Seed',
  CAREER_BUILDER = 'Career Builder',
  PRO_NAVIGATOR = 'Pro Navigator'
}

export interface SurveyData {
  name: string;
  ageGroup: string;
  field: string;
  budgetLevel: string; // low, mid, high
  availableTime: string; // low, mid, high
  ultimateGoal: string;
}

export interface Attribute {
  subject: string;
  current: number; // 0-100
  target: number;  // 0-100
}

export interface InputAnalysis {
  data_type: string;
  vision_summary: string;
  current_vector: string;
  target_vector: string;
}

export interface MissingElement {
  item: string;
  impact: string; // 왜 이 요소가 중요한지에 대한 설명
}

export interface GapReport {
  similarity_score: number;
  gap_summary: string;
  missing_elements: MissingElement[];
  attributes: Attribute[]; // 항상 5개 요소를 반환하여 오각형 유지
}

export interface RoadmapStep {
  title: string;
  description: string;
  detail: string;
  status: 'completed' | 'current' | 'upcoming';
  icon_type: string;
}

export interface TargetRequirement {
  item: string;
  cost_or_condition: string;
  category: string;
}

export interface SolutionCard {
  title: string;
  action_type: string;
  quest: string;
  expected_result: string;
  roadmap: RoadmapStep[];
}

export interface AnalysisResponse {
  user_mode: UserMode;
  input_analysis: InputAnalysis;
  gap_report: GapReport;
  solution_card: SolutionCard;
  persona_message: string;
  required_info_guide: string[];
  target_requirements: TargetRequirement[]; 
}

export interface SavedReport extends AnalysisResponse {
  id: string;
  timestamp: string;
}

export interface AnalysisRequest {
  text: string;
  image?: string; // base64
  mode?: UserMode;
  surveyContext?: SurveyData;
}
