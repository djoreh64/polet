export type StepType = "ADDITIVE" | "MULTIPLIER" | "TORPEDO";

export type OutcomeType = "WIN" | "SINK";

export type SpeedMode = "NORMAL" | "FAST";

export interface GameParams {
  betAmount: number;
  targetOutcomeType: OutcomeType;
  targetModifier: number;
  speedMode: SpeedMode;
}

export interface RouteStep {
  type: StepType;
  value: number;
  xPosition: number;
  yPosition: number;
  elementType: "BONUS" | "ROCKET";
  elementValue: number | string;
}

export interface DecoyObject {
  id: string;
  type: "BONUS" | "ROCKET";
  value: number | string;
  xPosition: number;
  yPosition: number;
}

export interface GeneratedRoute {
  steps: RouteStep[];
  decoyObjects: DecoyObject[];
  finalAmount: number;
  outcome: OutcomeType;
  totalDistance: number;
  boatPositions: number[];
}