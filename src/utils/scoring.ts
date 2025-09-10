import { DiagnosticAnswer, DiagnosticResult, QuestionContribution, ScoreLevel } from '../types';
import { QUESTIONS } from '../constants/questions';

const round2 = (n: number) => Math.round(n * 100) / 100;

export const getScoreLevel = (score: number): ScoreLevel => {
  if (score >= 60) return 'very-good';
  if (score >= 20) return 'good';
  if (score > -20) return 'neutral';
  if (score > -60) return 'low';
  return 'needs-improvement';
};

export const getCommentary = (score: number): string => {
  if (score >= 60) return '非常に良好：高い内発的動機づけと明確な目的意識が見られます。';
  if (score >= 20) return '良好：ポジティブ要因が優勢です。この調子を維持しましょう。';
  if (score > -20) return '中立：現状維持です。改善の余地があるかもしれません。';
  if (score > -60) return '低め：ネガティブ要因が目立ちます。改善策の検討が必要です。';
  return '要改善：動機づけの再構築が必要です。サポートや環境調整を検討してください。';
};

export const calculateScore = (answers: DiagnosticAnswer[]): DiagnosticResult => {
  const contributions: QuestionContribution[] = answers.map((answer) => {
    const question = QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) {
      throw new Error(`Invalid questionId: ${answer.questionId}`);
    }
    const weightedValue = answer.value * question.weight;
    return {
      questionId: answer.questionId,
      questionText: question.text,
      rawValue: answer.value,
      weightedValue,
      weight: question.weight,
    };
  });

  const totalScoreRaw = contributions.reduce((sum, c) => sum + c.weightedValue, 0);
  const positiveScore = contributions
    .filter((c) => c.weight > 0)
    .reduce((sum, c) => sum + c.weightedValue, 0);
  const negativeScore = Math.abs(
    contributions.filter((c) => c.weight < 0).reduce((sum, c) => sum + c.weightedValue, 0)
  );

  const totalScore = round2(totalScoreRaw);

  return {
    totalScore,
    positiveScore: round2(positiveScore),
    negativeScore: round2(negativeScore),
    questionContributions: contributions.map((c) => ({ ...c, weightedValue: round2(c.weightedValue) })),
    commentary: getCommentary(totalScore),
    scoreLevel: getScoreLevel(totalScore),
  };
};

