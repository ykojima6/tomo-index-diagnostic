export interface DiagnosticAnswer {
  questionId: number;
  value: number; // 1-7
}

export interface QuestionDefinition {
  id: number;
  text: string;
  weight: number;
  type: 'positive' | 'negative';
}

export interface QuestionContribution {
  questionId: number;
  questionText: string;
  rawValue: number;
  weightedValue: number;
  weight: number;
}

export type ScoreLevel = 'very-good' | 'good' | 'neutral' | 'low' | 'needs-improvement';

export interface DiagnosticResult {
  totalScore: number;
  positiveScore: number;
  negativeScore: number;
  questionContributions: QuestionContribution[];
  commentary: string;
  scoreLevel: ScoreLevel;
}

