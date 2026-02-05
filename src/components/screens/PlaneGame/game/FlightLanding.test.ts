import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { GameParams, RouteStep } from "./RouteTypes";
import { RouteGenerator } from "./RouteGenerator";
import { CONSTANTS } from "./constants";
import { COLLECT_HITBOX } from "./hitboxes";

const DT = 1 / 60;

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getImpulse(step: Pick<RouteStep, "type" | "value">): number {
  if (step.type === "TORPEDO") return CONSTANTS.PLANE.BONUS_IMPULSE.V2;
  if (step.type === "MULTIPLIER") return CONSTANTS.PLANE.BONUS_IMPULSE.V2;
  if (step.value <= 1) return CONSTANTS.PLANE.BONUS_IMPULSE.V1;
  if (step.value <= 2) return CONSTANTS.PLANE.BONUS_IMPULSE.V2;
  if (step.value <= 3) return CONSTANTS.PLANE.BONUS_IMPULSE.V5;
  return CONSTANTS.PLANE.BONUS_IMPULSE.V10;
}

function simulateLandingCenterX(steps: RouteStep[], speedMode: GameParams["speedMode"]): number | null {
  const speedMultiplier = speedMode === "FAST" ? 3 : 1;

  const deckY =
    CONSTANTS.HORIZON_Y +
    CONSTANTS.BOAT.Y_OFFSET +
    CONSTANTS.BOAT.DECK_Y_OFFSET_FROM_HORIZON;

  const speedX = CONSTANTS.PLANE.HORIZONTAL_SPEED * speedMultiplier;
  const gravity = CONSTANTS.PLANE.GRAVITY * speedMultiplier * speedMultiplier;
  const drag = CONSTANTS.PLANE.DRAG_Y * speedMultiplier;

  const planeW = CONSTANTS.PLANE.WIDTH;
  const planeH = CONSTANTS.PLANE.HEIGHT;
  const planeHalfW = planeW / 2;
  const planeHalfH = planeH / 2;

  const objW = COLLECT_HITBOX.width;

  let x = 100;
  let y = deckY - planeHalfH;
  let vy = CONSTANTS.PLANE.TAKEOFF_IMPULSE * speedMultiplier;

  const maxRise = CONSTANTS.PLANE.MAX_RISE_SPEED * speedMultiplier;
  const maxFall = CONSTANTS.PLANE.MAX_FALL_SPEED * speedMultiplier;

  let stepIndex = 0;

  let prevBottom = y + planeHalfH;
  const maxFrames = 60 * 60; 

  for (let f = 0; f < maxFrames; f++) {
    x += speedX * DT;

    vy += gravity * DT;
    if (drag > 0) {
      const dragDelta = drag * DT;
      if (vy > 0) vy = Math.max(0, vy - dragDelta);
      else if (vy < 0) vy = Math.min(0, vy + dragDelta);
    }

    if (vy < maxRise) vy = maxRise;
    if (vy > maxFall) vy = maxFall;

    y += vy * DT;

    while (stepIndex < steps.length) {
      const s = steps[stepIndex];
      const triggerX = s.xPosition - (planeHalfW + objW / 2);
      if (x < triggerX) break;
      vy = getImpulse(s);
      stepIndex++;
    }

    const currBottom = y + planeHalfH;
    if (stepIndex >= steps.length && prevBottom <= deckY && currBottom >= deckY && vy > 0) {
      return x;
    }
    prevBottom = currBottom;

    if (stepIndex >= steps.length && y > deckY + 3000) break;
  }

  return null;
}

describe("Flight landing", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeAll(() => {
    logSpy.mockClear();
  });

  afterAll(() => {
    logSpy.mockRestore();
  });

  it("BONUS and ROCKET share the same collect hitbox", () => {
    expect(COLLECT_HITBOX.width).toBe(60);
    expect(COLLECT_HITBOX.height).toBe(160);
  });

  it("Generated WIN routes land near the last boat center (regression)", () => {
    const targets: number[] = [0.3, 0.8, 1.2, 2.5, 4.0, 7.5];
    const seeds = [1, 2, 3, 4, 5, 42, 1337];

    for (const targetModifier of targets) {
      for (const seed of seeds) {
        const rnd = mulberry32(seed);
        const originalRandom = Math.random;
        Math.random = rnd;
        try {
          const params: GameParams = {
            betAmount: 1,
            targetOutcomeType: "WIN",
            targetModifier,
            speedMode: "NORMAL",
          };

          const generator = new RouteGenerator(params);
          const route = generator.generate();

          const landingBoatX = route.boatPositions[route.boatPositions.length - 1];
          const expectedCenterX = landingBoatX + CONSTANTS.BOAT.WIDTH / 2;

          const simLandingX = simulateLandingCenterX(route.steps, params.speedMode);
          expect(simLandingX, `LandingX should be found (seed=${seed}, target=${targetModifier})`).not.toBeNull();

          const dx = Math.abs((simLandingX as number) - expectedCenterX);
          expect(dx, `Landing center drift too large: dx=${dx} (seed=${seed}, target=${targetModifier})`).toBeLessThanOrEqual(80);
        } finally {
          Math.random = originalRandom;
        }
      }
    }
  });

  it("Regression: route from logs should produce a landing point", () => {
    const steps: RouteStep[] = [
      { type: "ADDITIVE", value: 2, xPosition: 650, yPosition: 200, elementType: "BONUS", elementValue: 2 },
      { type: "TORPEDO", value: 0.5, xPosition: 1050, yPosition: 200, elementType: "ROCKET", elementValue: 0 },
      { type: "TORPEDO", value: 0.5, xPosition: 1450, yPosition: 200, elementType: "ROCKET", elementValue: 0 },
      { type: "MULTIPLIER", value: 2, xPosition: 1850, yPosition: 200, elementType: "BONUS", elementValue: "x2" },
      { type: "TORPEDO", value: 0.5, xPosition: 2250, yPosition: 200, elementType: "ROCKET", elementValue: 0 },
      { type: "TORPEDO", value: 0.5, xPosition: 2650, yPosition: 200, elementType: "ROCKET", elementValue: 0 },
      { type: "MULTIPLIER", value: 2, xPosition: 3050, yPosition: 200, elementType: "BONUS", elementValue: "x2" },
      { type: "TORPEDO", value: 0.5, xPosition: 3450, yPosition: 200, elementType: "ROCKET", elementValue: 0 },
    ];

    const landingX = simulateLandingCenterX(steps, "NORMAL");
    expect(landingX).not.toBeNull();
  });

  it("SINK routes have limited step count", () => {
    const seeds = [1, 2, 3, 4, 5, 42, 1337];
    for (const seed of seeds) {
      const rnd = mulberry32(seed);
      const originalRandom = Math.random;
      Math.random = rnd;
      try {
        const params: GameParams = {
          betAmount: 1,
          targetOutcomeType: "SINK",
          targetModifier: 1,
          speedMode: "NORMAL",
        };
        const gen = new RouteGenerator(params);
        const route = gen.generate();
        expect(route.steps.length).toBeGreaterThanOrEqual(2);
        expect(route.steps.length).toBeLessThanOrEqual(30);
      } finally {
        Math.random = originalRandom;
      }
    }
  });

  it("SINK routes keep a gap around predicted landing area (no deck under plane)", () => {
    const seeds = [1, 2, 3, 4, 5, 42, 1337];
    for (const seed of seeds) {
      const rnd = mulberry32(seed);
      const originalRandom = Math.random;
      Math.random = rnd;
      try {
        const params: GameParams = {
          betAmount: 1,
          targetOutcomeType: "SINK",
          targetModifier: 1,
          speedMode: "NORMAL",
        };
        const gen = new RouteGenerator(params);
        const route = gen.generate();

        const predictedX = simulateLandingCenterX(route.steps, params.speedMode);
        expect(predictedX).not.toBeNull();

        const safeDist = CONSTANTS.BOAT.WIDTH / 2 + CONSTANTS.PLANE.WIDTH / 2 + 60;
        for (const boatX of route.boatPositions) {
          const deckCenterX = boatX + CONSTANTS.BOAT.WIDTH / 2;
          expect(
            Math.abs(deckCenterX - (predictedX as number)),
            `Boat too close to sink-gap (seed=${seed})`
          ).toBeGreaterThan(safeDist);
        }
      } finally {
        Math.random = originalRandom;
      }
    }
  });
});

