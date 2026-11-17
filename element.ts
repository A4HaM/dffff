export type ElementCategory =
  | 'nonmetal'
  | 'noble-gas'
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'metalloid'
  | 'halogen'
  | 'transition-metal'
  | 'post-transition'
  | 'lanthanide'
  | 'actinide';

export type MatterState = 'Gas' | 'Liquid' | 'Solid';

export type MetallicType = 'metal' | 'metalloid' | 'nonmetal';

export interface ChemicalElement {
  number: number;
  symbol: string;
  name: string;
  atomicMass: string;
  category: ElementCategory;
  group: number;
  period: number;
  gridRow: number;
  gridCol: number;
  state: MatterState;
  electronConfig: string;
  hint: string;
}

export type CardDirection =
  | 'symbol-to-name'
  | 'name-to-symbol'
  | 'number-to-name'
  | 'name-to-number'
  | 'symbol-to-number'
  | 'number-to-symbol';
export type QuizSubject = 'symbol' | 'name' | 'number';
export type QuizMode = 'flip' | 'type' | 'choice';

export interface FlashcardItem {
  element: ChemicalElement;
  direction: CardDirection;
}

export interface QuizAttempt {
  element: ChemicalElement;
  direction: CardDirection;
  correct: boolean;
  userAnswer?: string;
}
