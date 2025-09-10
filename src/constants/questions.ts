import { QuestionDefinition } from '../types';

export const QUESTIONS: QuestionDefinition[] = [
  {
    id: 1,
    text: '今の仕事を続けているのは仕事そのものが楽しいから',
    weight: 10,
    type: 'positive',
  },
  {
    id: 2,
    text: '今の仕事を続けているのは重要な目的があると思うから',
    weight: 5,
    type: 'positive',
  },
  {
    id: 3,
    text: '今の仕事を続けているのは目標達成に有益だから',
    weight: 1.66,
    type: 'positive',
  },
  {
    id: 4,
    text: '今の仕事を続けているのは辞めたら人を落胆させるから',
    weight: -1.66,
    type: 'negative',
  },
  {
    id: 5,
    text: '今の仕事を続けているのは金銭上の目標を失うから',
    weight: -5,
    type: 'negative',
  },
  {
    id: 6,
    text: '今の仕事を続ける妥当な理由はない',
    weight: -10,
    type: 'negative',
  },
];

