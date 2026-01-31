
export type Category = 'Love' | 'Career' | 'Money' | 'General Guidance';

export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface TarotCard {
  id: string;
  name: string;
  keyword: string;
  image: string;
}

export interface SpreadPosition {
  title: string;
  description: string;
}

export interface Spread {
  id: string;
  name: string;
  description: string;
  positions: SpreadPosition[];
}

export interface CardPull {
  position: SpreadPosition;
  card: TarotCard;
}

export interface Interpretation {
  summary: string;
  details: { positionTitle: string; insight: string }[];
  finalGuidance: string;
}

export enum AppStep {
  LANDING,
  QUESTION,
  ANALYZING_SPREAD,
  SELECTION,
  AUTH,
  LOADING_INTERPRETATION,
  RESULT
}
