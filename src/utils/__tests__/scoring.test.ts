import { calculateScore, getScoreLevel } from '../../utils/scoring';
import { DiagnosticAnswer } from '../../types';

const makeAnswers = (p1: number, p2: number, p3: number, n4: number, n5: number, n6: number): DiagnosticAnswer[] => [
  { questionId: 1, value: p1 },
  { questionId: 2, value: p2 },
  { questionId: 3, value: p3 },
  { questionId: 4, value: n4 },
  { questionId: 5, value: n5 },
  { questionId: 6, value: n6 },
];

describe('scoring.calculateScore', () => {
  it('returns highest score ~ +99.96 when positives=7, negatives=1', () => {
    const res = calculateScore(makeAnswers(7, 7, 7, 1, 1, 1));
    expect(res.totalScore).toBeCloseTo(99.96, 2);
    expect(res.positiveScore).toBeCloseTo(116.62, 2);
    expect(res.negativeScore).toBeCloseTo(16.66, 2);
  });

  it('returns lowest score ~ -99.96 when positives=1, negatives=7', () => {
    const res = calculateScore(makeAnswers(1, 1, 1, 7, 7, 7));
    expect(res.totalScore).toBeCloseTo(-99.96, 2);
    expect(res.positiveScore).toBeCloseTo(16.66, 2);
    expect(res.negativeScore).toBeCloseTo(116.62, 2);
  });

  it('returns neutral ~ 0 when all = 4', () => {
    const res = calculateScore(makeAnswers(4, 4, 4, 4, 4, 4));
    expect(res.totalScore).toBeCloseTo(0, 2);
  });
});

describe('scoring.getScoreLevel', () => {
  it('maps score to levels per thresholds', () => {
    expect(getScoreLevel(65)).toBe('very-good');
    expect(getScoreLevel(25)).toBe('good');
    expect(getScoreLevel(0)).toBe('neutral');
    expect(getScoreLevel(-30)).toBe('low');
    expect(getScoreLevel(-65)).toBe('needs-improvement');
  });
});

