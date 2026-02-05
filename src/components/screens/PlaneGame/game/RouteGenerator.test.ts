import { describe, it, expect } from "vitest";

const CONSTANTS = {
  HORIZON_Y: Math.round(844 * 0.58),
  PLANE: {
    HEIGHT: 88,
    GRAVITY: 290,
    MAX_FALL_SPEED: 660,
    MAX_RISE_SPEED: -520,
    HORIZONTAL_SPEED: 480,
    TAKEOFF_IMPULSE: -350,
    BONUS_IMPULSE: { V1: -120, V2: -130, V5: -150, V10: -180, X2: -140 },
  },
  BOAT: { Y_OFFSET: -50, DECK_Y_OFFSET_FROM_HORIZON: 24 },
};

const DT = 1 / 60;
const FRAMES_BETWEEN = 22;
const HITBOX = 55;
const MIN_STEPS = 3;
const TORPEDO_INTERVAL = 3;

interface RouteStep {
  type: "ADDITIVE" | "MULTIPLIER" | "TORPEDO";
  value: number;
  xPosition: number;
  yPosition: number;
}

interface Action {
  type: "ADDITIVE" | "MULTIPLIER" | "TORPEDO";
  value: number;
}

function getImpulse(type: string, value: number): number {
  if (type === "TORPEDO") return 40;
  if (type === "MULTIPLIER") return CONSTANTS.PLANE.BONUS_IMPULSE.X2;
  if (value <= 1) return CONSTANTS.PLANE.BONUS_IMPULSE.V1;
  if (value <= 2) return CONSTANTS.PLANE.BONUS_IMPULSE.V2;
  if (value <= 5) return CONSTANTS.PLANE.BONUS_IMPULSE.V5;
  return CONSTANTS.PLANE.BONUS_IMPULSE.V10;
}

function generateActions(start: number, target: number): Action[] {
  const rawBonuses: number[] = [];
  let sum = 0;
  while (sum < target - start) {
    const remaining = target - start - sum;
    let add: number;
    if (remaining >= 10 && Math.random() < 0.25) add = 10;
    else if (remaining >= 5 && Math.random() < 0.35) add = 5;
    else if (remaining >= 2 && Math.random() < 0.5) add = 2;
    else add = Math.min(remaining, 1);
    rawBonuses.push(add);
    sum += add;
  }

  const actions: Action[] = [];
  let current = start;
  let bonusesSinceTorpedo = 0;

  for (let i = 0; i < rawBonuses.length; i++) {
    const bonus = rawBonuses[i];

    if (current <= target / 4 && Math.random() < 0.12) {
      const mults = [2, 3, 5].filter(m => current * m <= target * 1.5);
      if (mults.length > 0) {
        const mult = mults[Math.floor(Math.random() * mults.length)];
        actions.push({ type: "MULTIPLIER", value: mult });
        current *= mult;
        bonusesSinceTorpedo++;
        if (bonusesSinceTorpedo >= TORPEDO_INTERVAL && i < rawBonuses.length - 1) {
          actions.push({ type: "TORPEDO", value: 0.5 });
          current = Math.max(1, Math.round(current / 2));
          bonusesSinceTorpedo = 0;
        }
        continue;
      }
    }

    actions.push({ type: "ADDITIVE", value: bonus });
    current += bonus;
    bonusesSinceTorpedo++;

    if (bonusesSinceTorpedo >= TORPEDO_INTERVAL && i < rawBonuses.length - 1) {
      actions.push({ type: "TORPEDO", value: 0.5 });
      current = Math.max(1, Math.round(current / 2));
      bonusesSinceTorpedo = 0;
    }
  }

  while (current > target && current >= 2) {
    actions.push({ type: "TORPEDO", value: 0.5 });
    current = Math.max(1, Math.round(current / 2));
  }

  while (current < target) {
    const diff = target - current;
    if (diff >= 10) { actions.push({ type: "ADDITIVE", value: 10 }); current += 10; }
    else if (diff >= 5) { actions.push({ type: "ADDITIVE", value: 5 }); current += 5; }
    else if (diff >= 2) { actions.push({ type: "ADDITIVE", value: 2 }); current += 2; }
    else { actions.push({ type: "ADDITIVE", value: 1 }); current += 1; }
  }

  while (actions.length < MIN_STEPS) {
    actions.unshift({ type: "ADDITIVE", value: 2 });
    current += 2;
    actions.push({ type: "TORPEDO", value: 0.5 });
    current = Math.max(1, Math.round(current / 2));
    while (current < target) {
      actions.push({ type: "ADDITIVE", value: 1 });
      current += 1;
    }
  }

  return actions;
}

function placeOnTrajectory(actions: Action[]): RouteStep[] {
  const steps: RouteStep[] = [];
  const deckY = CONSTANTS.HORIZON_Y + CONSTANTS.BOAT.Y_OFFSET + CONSTANTS.BOAT.DECK_Y_OFFSET_FROM_HORIZON;
  let x = 100, y = deckY - CONSTANTS.PLANE.HEIGHT / 2, vy = CONSTANTS.PLANE.TAKEOFF_IMPULSE;

  for (const action of actions) {
    for (let f = 0; f < FRAMES_BETWEEN; f++) {
      vy += CONSTANTS.PLANE.GRAVITY * DT;
      vy = Math.max(CONSTANTS.PLANE.MAX_RISE_SPEED, Math.min(CONSTANTS.PLANE.MAX_FALL_SPEED, vy));
      y += vy * DT;
      x += CONSTANTS.PLANE.HORIZONTAL_SPEED * DT;
    }
    steps.push({ type: action.type, value: action.value, xPosition: Math.round(x), yPosition: Math.round(y) });
    vy = getImpulse(action.type, action.value);
  }
  return steps;
}

function simulateFlight(steps: RouteStep[]): { collected: boolean[]; mult: number } {
  const deckY = CONSTANTS.HORIZON_Y + CONSTANTS.BOAT.Y_OFFSET + CONSTANTS.BOAT.DECK_Y_OFFSET_FROM_HORIZON;
  let x = 100, y = deckY - CONSTANTS.PLANE.HEIGHT / 2, vy = CONSTANTS.PLANE.TAKEOFF_IMPULSE, mult = 1;
  const collected: boolean[] = new Array(steps.length).fill(false);
  const maxX = steps.length > 0 ? steps[steps.length - 1].xPosition + 300 : 3000;

  while (x < maxX && y < CONSTANTS.HORIZON_Y + 100) {
    vy += CONSTANTS.PLANE.GRAVITY * DT;
    vy = Math.max(CONSTANTS.PLANE.MAX_RISE_SPEED, Math.min(CONSTANTS.PLANE.MAX_FALL_SPEED, vy));
    y += vy * DT;
    x += CONSTANTS.PLANE.HORIZONTAL_SPEED * DT;

    for (let i = 0; i < steps.length; i++) {
      if (collected[i]) continue;
      const step = steps[i];
      if (Math.abs(x - step.xPosition) < HITBOX && Math.abs(y - step.yPosition) < HITBOX) {
        collected[i] = true;
        if (step.type === "ADDITIVE") mult += step.value;
        else if (step.type === "MULTIPLIER") mult *= step.value;
        else mult = Math.max(1, Math.round(mult / 2));
        vy = getImpulse(step.type, step.value);
      }
    }
  }

  return { collected, mult };
}

function runTest(target: number): { ok: boolean; stepCount: number; torpedoCount: number } {
  const actions = generateActions(1, target);

  let check = 1;
  for (const a of actions) {
    if (a.type === "ADDITIVE") check += a.value;
    else if (a.type === "MULTIPLIER") check *= a.value;
    else check = Math.max(1, Math.round(check / 2));
  }
  if (check !== target) return { ok: false, stepCount: actions.length, torpedoCount: 0 };

  const steps = placeOnTrajectory(actions);
  const result = simulateFlight(steps);
  const missed = result.collected.filter(c => !c).length;
  const ok = missed === 0 && result.mult === target;
  const torpedoCount = actions.filter(a => a.type === "TORPEDO").length;

  return { ok, stepCount: steps.length, torpedoCount };
}

describe("Route Math", () => {
  for (const target of [2, 3, 5, 10, 16, 25, 50, 100, 150, 200, 265, 300, 500, 1000]) {
    it(`target=${target}`, () => {
      for (let run = 0; run < 3; run++) {
        const r = runTest(target);
        expect(r.ok).toBe(true);
      }
    });
  }
});

describe("Step Limits", () => {
  for (const target of [2, 5, 10, 25, 50, 100, 265]) {
    it(`target=${target} >= 3 steps`, () => {
      for (let run = 0; run < 3; run++) {
        const r = runTest(target);
        expect(r.stepCount).toBeGreaterThanOrEqual(3);
      }
    });
  }
});

describe("Torpedo Presence", () => {
  for (const target of [50, 100, 265, 500]) {
    it(`target=${target} has torpedoes`, () => {
      const r = runTest(target);
      expect(r.torpedoCount).toBeGreaterThan(0);
    });
  }
});

function calculateBoatPositions(steps: RouteStep[]): number[] {
  const lastStepX = steps.length > 0 ? steps[steps.length - 1].xPosition : 100;
  const landingBoatX = lastStepX + 500;

  const firstBoatX = 500;
  const minSpacing = 450;
  const maxSpacing = 700;

  const distance = landingBoatX - firstBoatX;
  let boatCount = Math.max(2, Math.floor(distance / maxSpacing) + 1);
  let spacing = distance / (boatCount - 1);

  if (spacing < minSpacing && boatCount > 2) {
    boatCount = Math.max(2, Math.floor(distance / minSpacing) + 1);
    spacing = distance / (boatCount - 1);
  }

  const positions: number[] = [];
  for (let i = 0; i < boatCount; i++) {
    positions.push(Math.round(firstBoatX + i * spacing));
  }
  return positions;
}

describe("Boat Spacing", () => {
  for (const target of [10, 50, 100, 265, 500]) {
    it(`target=${target} has equal spacing between boats`, () => {
      const actions = generateActions(1, target);
      const steps = placeOnTrajectory(actions);
      const boats = calculateBoatPositions(steps);


      expect(boats.length, "Should have >= 2 boats").toBeGreaterThanOrEqual(2);
      expect(boats[0], "First boat at 500").toBe(500);

      const lastStepX = steps[steps.length - 1].xPosition;
      const expectedLastBoat = lastStepX + 500;
      expect(boats[boats.length - 1], `Last boat at landing (${expectedLastBoat})`).toBe(expectedLastBoat);

      if (boats.length >= 3) {
        const spacings = [];
        for (let i = 1; i < boats.length; i++) {
          spacings.push(boats[i] - boats[i - 1]);
        }
        const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
        for (const sp of spacings) {
          expect(Math.abs(sp - avgSpacing), `Spacing variance should be minimal`).toBeLessThan(5);
        }
      }
    });
  }
});

interface DecoyObject {
  type: "BONUS" | "ROCKET";
  value: number | string;
  xPosition: number;
  yPosition: number;
}

function generateDecoyObjects(trajectory: Array<{ x: number, y: number }>, startX: number, endX: number): DecoyObject[] {
  const decoys: DecoyObject[] = [];
  const minSafeDistanceFromTrajectory = 100;

  const CONSTANTS_HORIZON_Y = Math.round(844 * 0.58);
  const Y_MIN = 150;
  const Y_MAX = CONSTANTS_HORIZON_Y - 50;

  const gridSpacingX = 220;
  const gridSpacingY = 100;

  const gridCols = Math.floor((endX - startX) / gridSpacingX);
  const gridRows = Math.floor((Y_MAX - Y_MIN) / gridSpacingY);

  for (let col = 0; col < gridCols; col++) {
    for (let row = 0; row < gridRows; row++) {
      const baseX = startX + col * gridSpacingX;
      const baseY = Y_MIN + row * gridSpacingY;

      const x = baseX + (Math.random() - 0.5) * gridSpacingX * 0.7;
      const y = baseY + (Math.random() - 0.5) * gridSpacingY * 0.7;

      let tooCloseToTrajectory = false;
      for (const p of trajectory) {
        if (Math.abs(x - p.x) < minSafeDistanceFromTrajectory && Math.abs(y - p.y) < minSafeDistanceFromTrajectory) {
          tooCloseToTrajectory = true;
          break;
        }
      }
      if (tooCloseToTrajectory) continue;

      decoys.push({ type: Math.random() < 0.4 ? "ROCKET" : "BONUS", value: 0, xPosition: Math.round(x), yPosition: Math.round(y) });
    }
  }
  decoys.sort((a, b) => a.xPosition - b.xPosition);
  return decoys;
}

describe("Step Limits", () => {
  for (const target of [2, 5, 10, 25, 50, 100, 265]) {
    it(`target=${target} >= 3 steps`, () => {
      for (let run = 0; run < 3; run++) {
        const r = runTest(target);
        expect(r.stepCount).toBeGreaterThanOrEqual(3);
      }
    });
  }
});

function computeTrajectory(steps: RouteStep[]): Array<{ x: number, y: number }> {
  const points: Array<{ x: number, y: number }> = [];
  const deckY = CONSTANTS.HORIZON_Y + CONSTANTS.BOAT.Y_OFFSET + CONSTANTS.BOAT.DECK_Y_OFFSET_FROM_HORIZON;
  let x = 100, y = deckY - CONSTANTS.PLANE.HEIGHT / 2, vy = CONSTANTS.PLANE.TAKEOFF_IMPULSE;

  for (const step of steps) {
    for (let f = 0; f < FRAMES_BETWEEN; f++) {
      vy += CONSTANTS.PLANE.GRAVITY * DT;
      vy = Math.max(CONSTANTS.PLANE.MAX_RISE_SPEED, Math.min(CONSTANTS.PLANE.MAX_FALL_SPEED, vy));
      y += vy * DT;
      if (y < 100) y = 100;
      x += CONSTANTS.PLANE.HORIZONTAL_SPEED * DT;
      points.push({ x, y });
    }
    vy = getImpulse(step.type, step.value);
  }

  for (let f = 0; f < 120; f++) {
    vy += CONSTANTS.PLANE.GRAVITY * DT;
    vy = Math.max(CONSTANTS.PLANE.MAX_RISE_SPEED, Math.min(CONSTANTS.PLANE.MAX_FALL_SPEED, vy));
    y += vy * DT;
    x += CONSTANTS.PLANE.HORIZONTAL_SPEED * DT;
    points.push({ x, y });
  }
  return points;
}

describe("Decoy No-Collision", () => {
  for (const target of [50, 100, 265]) {
    it(`target=${target} decoys don't collide with plane`, () => {
      const actions = generateActions(1, target);
      const steps = placeOnTrajectory(actions);
      const trajectory = computeTrajectory(steps);

      const lastStepX = steps[steps.length - 1].xPosition;
      const decoys = generateDecoyObjects(trajectory, 500, lastStepX + 500);

      expect(decoys.length, "Should generate decoys").toBeGreaterThanOrEqual(5);

      let collisions = 0;
      for (const decoy of decoys) {
        for (const p of trajectory) {
          if (Math.abs(p.x - decoy.xPosition) < HITBOX && Math.abs(p.y - decoy.yPosition) < HITBOX) {
            collisions++;
            break;
          }
        }
      }

      expect(collisions, "No decoys should collide with plane trajectory").toBe(0);
    });
  }
});
