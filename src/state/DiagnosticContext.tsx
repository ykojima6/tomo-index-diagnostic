import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { DiagnosticAnswer, DiagnosticResult } from '../types';
import { QUESTIONS } from '../constants/questions';
import { calculateScore } from '../utils/scoring';
import { saveResponseToServer } from '../utils/api';

type State = {
  answers: DiagnosticAnswer[];
  result?: DiagnosticResult;
  saveError?: string;
};

type Action =
  | { type: 'setAnswer'; questionId: number; value: number }
  | { type: 'compute' }
  | { type: 'reset' }
  | { type: 'loadAnswers'; answers: DiagnosticAnswer[] }
  | { type: 'setSaveError'; error: string | undefined };

const initialAnswers: DiagnosticAnswer[] = QUESTIONS.map((q) => ({ questionId: q.id, value: 0 }));

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
      // Save to server only - no local storage fallback
      saveResponseToServer(state.answers, result)
        .then((res) => {
          console.log('Response saved to server with ID:', res.id);
        })
        .catch((error) => {
          console.error('Failed to save to server:', error);
          // Note: We don't save locally on error to maintain data consistency
        });

      return { ...state, result, saveError: undefined };
    }
    case 'setSaveError': {
      return { ...state, saveError: action.error };
    }
    case 'loadAnswers': {
      const normalized = QUESTIONS.map((q) => {
        const found = action.answers.find((a) => a.questionId === q.id);
        return { questionId: q.id, value: found ? found.value : 0 };
      });
      return { answers: normalized };
    }
    case 'reset':
      return { answers: QUESTIONS.map((q) => ({ questionId: q.id, value: 0 })), saveError: undefined };
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
  const answeredCount = state.answers.filter((a) => a.value > 0).length;
  const allAnswered = answeredCount === state.answers.length;

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

