import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { DiagnosticAnswer, DiagnosticResult } from '../types';
import { QUESTIONS } from '../constants/questions';
import { calculateScore } from '../utils/scoring';
import { saveResponse } from '../utils/database';

type State = {
  answers: DiagnosticAnswer[];
  result?: DiagnosticResult;
};

type Action =
  | { type: 'setAnswer'; questionId: number; value: number }
  | { type: 'compute' }
  | { type: 'reset' }
  | { type: 'loadAnswers'; answers: DiagnosticAnswer[] };

const initialAnswers: DiagnosticAnswer[] = QUESTIONS.map((q) => ({ questionId: q.id, value: 4 }));

const initialState: State = {
  answers: initialAnswers,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setAnswer': {
      const answers = state.answers.map((a) =>
        a.questionId === action.questionId ? { ...a, value: action.value } : a
      );
      return { ...state, answers };
    }
    case 'compute': {
      const result = calculateScore(state.answers);
      // 結果をローカルストレージに保存
      try {
        saveResponse(state.answers, result);
      } catch (error) {
        console.error('Failed to save response:', error);
      }
      return { ...state, result };
    }
    case 'loadAnswers': {
      const normalized = QUESTIONS.map((q) => {
        const found = action.answers.find((a) => a.questionId === q.id);
        return { questionId: q.id, value: found ? found.value : 4 };
      });
      return { answers: normalized };
    }
    case 'reset':
      return { answers: QUESTIONS.map((q) => ({ questionId: q.id, value: 4 })) };
    default:
      return state;
  }
}

type Ctx = {
  state: State;
  setAnswer: (questionId: number, value: number) => void;
  compute: () => void;
  reset: () => void;
  loadAnswers: (answers: DiagnosticAnswer[]) => void;
  allAnswered: boolean;
  answeredCount: number;
};

const DiagnosticContext = createContext<Ctx | null>(null);

export const DiagnosticProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const answeredCount = state.answers.length; // すべて回答済みとして扱う
  const allAnswered = true; // 常に全て回答済み

  const value = useMemo<Ctx>(
    () => ({
      state,
      setAnswer: (questionId, value) => dispatch({ type: 'setAnswer', questionId, value }),
      compute: () => dispatch({ type: 'compute' }),
      reset: () => dispatch({ type: 'reset' }),
      loadAnswers: (answers) => dispatch({ type: 'loadAnswers', answers }),
      allAnswered,
      answeredCount,
    }),
    [state, allAnswered, answeredCount]
  );

  return <DiagnosticContext.Provider value={value}>{children}</DiagnosticContext.Provider>;
};

export const useDiagnostic = () => {
  const ctx = useContext(DiagnosticContext);
  if (!ctx) throw new Error('useDiagnostic must be used within DiagnosticProvider');
  return ctx;
};

