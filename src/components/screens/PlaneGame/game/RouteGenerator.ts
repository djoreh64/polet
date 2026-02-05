import { CONSTANTS } from "./constants";
import type { DecoyObject, GameParams, GeneratedRoute, RouteStep } from "./RouteTypes";
import { COLLECT_HITBOX } from "./hitboxes";

interface StepAction {
  type: "ADDITIVE" | "MULTIPLIER" | "TORPEDO";
  value: number;
  elementValue: number | string;
  elementType: "BONUS" | "ROCKET";
}

const DT = 1 / 60;
export class RouteGenerator {
  private params: GameParams;
  private speedX: number;

  constructor(params: GameParams) {
    this.params = params;
    this.speedX = CONSTANTS.PLANE.HORIZONTAL_SPEED;
  }

  generate(): GeneratedRoute {
    const actions = this.params.targetOutcomeType === "SINK"
      ? this.generateSinkActions()
      : this.generateWinActions();

    const steps = this.placeOnTrajectory(actions);

    const finalAmount = this.params.targetOutcomeType === "WIN"
      ? this.params.betAmount * this.params.targetModifier
      : 0;

    const lastStepX = steps.length > 0 ? steps[steps.length - 1].xPosition : 100;
    const landingCenterX = this.estimateLandingCenterX(steps);
    const fallbackCenterX = lastStepX + 600 + CONSTANTS.BOAT.WIDTH / 2;
    const predictedCenterX = landingCenterX ?? fallbackCenterX;

    const isSink = this.params.targetOutcomeType === "SINK";
    // For Sink: Level ends PAST the crash point (so we see the next boat).
    // For Win: Level ends AT the landing boat.
    const landingBoatX = Math.round(
      (isSink ? (predictedCenterX + 600) : predictedCenterX) - CONSTANTS.BOAT.WIDTH / 2
    );
    const totalDistance = landingBoatX + 200;

    const firstBoatX = 600;
    const minSpacing = 450;
    const maxSpacing = 700;
    const targetSpacing = 560;

    const distance = landingBoatX - firstBoatX;
    let boatCount = Math.max(2, Math.round(distance / targetSpacing) + 1);
    let spacing = distance / (boatCount - 1);

    if (spacing > maxSpacing) {
      boatCount = Math.max(2, Math.ceil(distance / maxSpacing) + 1);
      spacing = distance / (boatCount - 1);
    } else if (spacing < minSpacing && boatCount > 2) {
      boatCount = Math.max(2, Math.floor(distance / minSpacing) + 1);
      spacing = distance / (boatCount - 1);
    }

    let boatPositions: number[] = [];
    for (let i = 0; i < boatCount; i++) {
      boatPositions.push(Math.round(firstBoatX + i * spacing));
    }
    boatPositions[0] = firstBoatX;
    boatPositions[boatPositions.length - 1] = landingBoatX;

    if (isSink) {
      // SINK LOGIC:
      // 1. We want the plane to crash at 'predictedCenterX'.
      // 2. We want a boat AHEAD of that point to show "you almost made it".
      // 3. We want a boat BEHIND that point to show "you passed this one".
      // 4. We do NOT want a boat AT that point.
      
      // Extend the "level" deeper so we can see the next boat
      const extendedEnd = predictedCenterX + 700;
      boatPositions = [];
      const count = Math.ceil((extendedEnd - firstBoatX) / targetSpacing) + 1;
      for(let k=0; k<count; k++) {
          boatPositions.push(Math.round(firstBoatX + k * targetSpacing));
      }
      
      const avoidCenterX = predictedCenterX;
      const safeDist = CONSTANTS.BOAT.WIDTH / 2 + CONSTANTS.PLANE.WIDTH / 2 + 80;
      
      const prevLen = boatPositions.length;
      boatPositions = boatPositions.filter((boatX) => {
        const deckCenterX = boatX + CONSTANTS.BOAT.WIDTH / 2;
        return Math.abs(deckCenterX - avoidCenterX) > safeDist;
      });
      
      if (boatPositions.length === prevLen) {
        // We didn't remove any boat! That means the crash point was naturally between boats?
        // Or we missed the grid. Force remove nearest if it's kinda close?
        // Actually, if we didn't remove any, it might mean we are safe. 
        // But we WANT to remove one if it's "blocking" the fall.
        // Let's ensure we have a gap.
      }
      
      console.log(`[RouteGenerator] Sink Mode. Crash @ ${predictedCenterX}. Boats: ${boatPositions.join(", ")}`);
    } else {
       // WIN LOGIC:
       // Ensure the last boat is exactly where we land.
       boatPositions[boatPositions.length - 1] = landingBoatX;
    }

    const decoyObjects = this.generateDecoys(steps, totalDistance, landingBoatX);

    return {
      steps,
      decoyObjects,
      finalAmount,
      outcome: this.params.targetOutcomeType,
      totalDistance,
      boatPositions,
    };
  }

  private estimateLandingCenterX(steps: RouteStep[]): number | null {
    const deckY = CONSTANTS.HORIZON_Y + CONSTANTS.BOAT.Y_OFFSET + CONSTANTS.BOAT.DECK_Y_OFFSET_FROM_HORIZON;
    const planeHalfH = CONSTANTS.PLANE.HEIGHT / 2;
    const planeHalfW = CONSTANTS.PLANE.WIDTH / 2;
    // Always simulate at NORMAL speed (1x). Fast mode is handled by engine timeScale.
    const speedMultiplier = 1;
    const gravity = CONSTANTS.PLANE.GRAVITY;
    const drag = CONSTANTS.PLANE.DRAG_Y;
    const maxRise = CONSTANTS.PLANE.MAX_RISE_SPEED;
    const maxFall = CONSTANTS.PLANE.MAX_FALL_SPEED;

    let x = 100;
    let y = deckY - planeHalfH;
    let vy = this.clamp(CONSTANTS.PLANE.TAKEOFF_IMPULSE * speedMultiplier, maxRise, maxFall);

    let stepIndex = 0;
    let prevBottom = y + planeHalfH;
    const maxFrames = 20000;

    for (let i = 0; i < maxFrames; i++) {
      x += this.speedX * DT;

      vy += gravity * DT;
      if (drag > 0) {
        const dragDelta = drag * DT;
        if (vy > 0) vy = Math.max(0, vy - dragDelta);
        else if (vy < 0) vy = Math.min(0, vy + dragDelta);
      }

      vy = this.clamp(vy, maxRise, maxFall);
      y += vy * DT;

      while (stepIndex < steps.length) {
        const step = steps[stepIndex];
        const objHalfW = COLLECT_HITBOX.width / 2;
        const triggerX = step.xPosition - (planeHalfW + objHalfW);
        if (x < triggerX) break;
        vy = this.getImpulse(step.type, step.value);
        stepIndex++;
      }

      const currBottom = y + planeHalfH;
      if (stepIndex >= steps.length && prevBottom <= deckY && currBottom >= deckY && vy > 0) {
        return x;
      }
      prevBottom = currBottom;

      if (stepIndex >= steps.length && y > deckY + 2000) break;

    }

    return null;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private generateWinActions(): StepAction[] {
    const { betAmount, targetModifier } = this.params;
    const startValue = betAmount;


    let bestDecomposition: { num: number, denom: number, power: number, adder: number } | null = null;

    for (const adder of [0, 1, 2]) {
      const remainder = targetModifier - adder;
      if (remainder <= 0.1) continue;

      const remainderFloor = Math.floor(remainder * 10) / 10;

      for (let p = 0; p <= 5; p++) {
        const denom = Math.pow(2, p);
        const minNum = Math.ceil(remainderFloor * denom);
        const maxNum = (remainderFloor + 0.1) * denom;

        for (let n = minNum; n < maxNum; n++) {
          const val = n / denom;
          if (Math.floor(val * 10) / 10 === remainderFloor) {
            const cand = { num: n, denom: denom, power: p, adder: adder };

            if (!bestDecomposition) {
              bestDecomposition = cand;
            } else {
              const bestHasSafeEnd = bestDecomposition.adder > 0;
              const currHasSafeEnd = cand.adder > 0;

              if (currHasSafeEnd && !bestHasSafeEnd) {
                bestDecomposition = cand;
              } else if (currHasSafeEnd === bestHasSafeEnd) {
                if (cand.power < bestDecomposition.power) {
                  bestDecomposition = cand;
                }
              }
            }
          }
        }
      }
    }

    if (!bestDecomposition) {
      bestDecomposition = { num: Math.round(targetModifier), denom: 1, power: 0, adder: 0 };
    }

    const { num: targetInt, power: numDivides, adder: finalAdder } = bestDecomposition;

    let actions: StepAction[] = [];
    if (targetInt !== 1) {
      let currentInt = targetInt;
      const intReverseSteps: StepAction[] = [];
      let iter = 0;
      while (currentInt !== 1 && iter < 100) {
        iter++;
        const possible: any[] = [];
        for (const sub of [1, 2, 3, 4]) {
          if (currentInt - sub >= 1) possible.push({ type: "ADDITIVE", value: sub, prev: currentInt - sub });
        }
        for (const div of [2, 3, 4]) {
          if (currentInt % div === 0 && currentInt / div >= 1) possible.push({ type: "MULTIPLIER", value: div, prev: currentInt / div });
        }
        if (possible.length === 0) break;
        // Favor Additive "slow" paths to generate length naturally, decreasing reliance on x2/rocket padding.
        // Sort: Additive first? No, we want variety.
        // Shuffle possibilities or weight them.
        
        // Prioritize: 
        // 1. If we can divide by 4 (x4), it's a "big win" moment. Keep it rare but possible.
        // 2. Additive steps (+1..4) are good filler.
        // 3. Divide by 2 (x2) is boring if consistent.
        
        // Randomize sort order to break "efficiency" bias
        possible.sort(() => Math.random() - 0.5);
        
        let chosen = possible[0];
        // If we have multiple options, try to avoid "x2" spam
        // If chosen is x2, and we have an additive option, take additive 70% of time
        const x2Option = possible.find(p => p.type === "MULTIPLIER" && p.value === 2);
        const addOption = possible.find(p => p.type === "ADDITIVE");
        
        if (x2Option && addOption && Math.random() < 0.7) {
             chosen = addOption; 
        }
        
        intReverseSteps.push({
          type: chosen.type,
          value: chosen.value,
          elementValue: chosen.type === "MULTIPLIER" ? `x${chosen.value}` : chosen.value,
          elementType: "BONUS"
        });
        currentInt = chosen.prev;
      }
      actions = intReverseSteps.reverse();
    }

    for (let i = 0; i < numDivides; i++) {
      actions.push({ type: "TORPEDO", value: 0.5, elementValue: 0, elementType: "ROCKET" });
    }

    if (finalAdder > 0) {
      actions.push({ type: "ADDITIVE", value: finalAdder, elementValue: finalAdder, elementType: "BONUS" });
    }
    // Reduced MIN_STEPS to avoid excessive padding with x2/rocket pairs
    const MIN_STEPS = 12 + Math.floor(Math.random() * 12);
    let torpedoCount = 0;
    for (let i = 0; i < actions.length; i++) {
      if (actions[i].type === "TORPEDO") {
        torpedoCount++;
        if (torpedoCount >= 2) {
          actions.splice(i + 1, 0,
            { type: "MULTIPLIER", value: 2, elementValue: "x2", elementType: "BONUS" },
            { type: "TORPEDO", value: 0.5, elementValue: 0, elementType: "ROCKET" }
          );
          i += 2;
          torpedoCount = 1;
        }
      } else {
        torpedoCount = 0;
      }
    }

    // --- NEW DIVERSE PADDING LOGIC ---
    // Instead of just unshifting *2 /2 at the start, we mix in variations.
    let safetyCounter = 0;
    let injectedPairCount = 0;
    const MAX_INJECTED_PAIRS = 2; // Reduced Cap (was 4) to ensure less x2/Rocket spam

    while (actions.length < MIN_STEPS && safetyCounter < 100) {
      safetyCounter++;
      const r = Math.random();
      
      // Strategy 1: Split existing steps... (rest of logic same as before, context below)

      // Strategy 1: Split existing steps (Make route longer by breaking down atoms)
      // e.g. +4 -> +2, +2.  x4 -> x2, x2.  +2 -> +1, +1.  +3 -> +1, +2.
      let splittableIndices: number[] = [];
      for(let i=0; i<actions.length; i++) {
          const a = actions[i];
          if ((a.type === "ADDITIVE" && a.value >= 2) || (a.type === "MULTIPLIER" && a.value === 4)) {
              splittableIndices.push(i);
          }
      }

      // Favor splitting but allow large numbers to survive occasionally (variety)
      if (splittableIndices.length > 0 && r < 0.8) {
          const idx = splittableIndices[Math.floor(Math.random() * splittableIndices.length)];
          const target = actions[idx];
          
          // Allow x4 to survive 20% of the time (don't split)
          if (target.type === "MULTIPLIER" && target.value === 4 && Math.random() < 0.2) {
              // Skip split, effectively "consuming" a variety chance
              continue;
          }
          
          if (target.type === "MULTIPLIER" && target.value === 4) {
              actions.splice(idx, 1, 
                  { type: "MULTIPLIER", value: 2, elementValue: "x2", elementType: "BONUS" },
                  { type: "MULTIPLIER", value: 2, elementValue: "x2", elementType: "BONUS" }
              );
          } else if (target.type === "ADDITIVE") {
              const maxPart1 = target.value - 1;
              const part1 = 1 + Math.floor(Math.random() * maxPart1);
              const part2 = target.value - part1;
              actions.splice(idx, 1,
                  { type: "ADDITIVE", value: part1, elementValue: part1, elementType: "BONUS" },
                  { type: "ADDITIVE", value: part2, elementValue: part2, elementType: "BONUS" }
              );
          }
          continue; 
      }

      // Strategy 2: Inject Neutral Pair (x2 -> /2)
      // Only do this if we haven't hit the cap
      if (injectedPairCount >= MAX_INJECTED_PAIRS) {
           // If we can't split and can't inject, break loop to avoid infinite spin
           if (splittableIndices.length === 0) break;
           continue; 
      }

      // Strategy 2: Inject Neutral Pair (x2 -> /2) at random position
      // We can insert *2 then /2 anywhere. (x * 2) / 2 == x.
      // Must ensure we don't create 3 rockets in a row.
      let attempts = 0;
      let placed = false;
      while(!placed && attempts < 10) {
          attempts++;
          const insertIdx = Math.floor(Math.random() * (actions.length + 1));
          
          // Check neighbors for rocket safety
          // New seq: ... prev, [MUL, ROCKET], next ...
          // Check if 'prev' was rocket?
          // If insertIdx > 0 and actions[insertIdx-1].type === "TORPEDO", then we are adding MUL, ROCKET.
          // ROCKET will be at insertIdx+1.
          // Check if actions[insertIdx] (which becomes next) is ROCKET.
          
          const prevIsRocket = (insertIdx > 0 && actions[insertIdx-1].type === "TORPEDO");
          const nextIsRocket = (insertIdx < actions.length && actions[insertIdx].type === "TORPEDO");

          if (!prevIsRocket && !nextIsRocket) {
               actions.splice(insertIdx, 0, 
                  { type: "MULTIPLIER", value: 2, elementValue: "x2", elementType: "BONUS" },
                  { type: "TORPEDO", value: 0.5, elementValue: 0, elementType: "ROCKET" }
               );
               placed = true;
               injectedPairCount++;
          }
      }
    }
    // ---------------------------------

    let val = startValue;
    const chain: string[] = [`${val}`];
    for (const a of actions) {
      if (a.type === "ADDITIVE") val += a.value;
      else if (a.type === "MULTIPLIER") val *= a.value;
      else if (a.type === "TORPEDO") val /= 2;
      chain.push(a.type === "TORPEDO" ? "/2" : (a.type === "ADDITIVE" ? `+${a.value}` : `*${a.value}`));
    }
    console.log(`[RouteGenerator] Route ${actions.length} elems [${chain.slice(1).join(", ")}]`);
    return actions;
  }

  private generateSinkActions(): StepAction[] {
    const actions: StepAction[] = [];
    const stepCount = 12 + Math.floor(Math.random() * 19);
    let bonusStreak = 0;
    let torpedoStreak = 0;

    for (let i = 0; i < stepCount; i++) {
      const needTorpedo = bonusStreak >= 3;
      // Cap torpedo streak at 1 (was 2) to prevent deadly clusters
      const needBonus = torpedoStreak >= 1;
      const r = Math.random();

      if (!needBonus && ((needTorpedo && r < 0.85) || r < 0.28)) {
        actions.push({ type: "TORPEDO", value: 0.5, elementValue: 0, elementType: "ROCKET" });
        torpedoStreak += 1;
        bonusStreak = 0;
        continue;
      }

      if (r < 0.55 && bonusStreak < 4) {
        actions.push({ type: "MULTIPLIER", value: 2, elementValue: "x2", elementType: "BONUS" });
      } else {
        const add = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
        actions.push({ type: "ADDITIVE", value: add, elementValue: add, elementType: "BONUS" });
      }

      bonusStreak += 1;
      torpedoStreak = 0;
    }

    return actions;
  }

  private getImpulse(type: string, value: number): number {
    if (type === "TORPEDO") return CONSTANTS.PLANE.BONUS_IMPULSE.ROCKET;
    if (type === "MULTIPLIER") return CONSTANTS.PLANE.BONUS_IMPULSE.X2;
    if (value <= 1) return CONSTANTS.PLANE.BONUS_IMPULSE.V1;
    if (value <= 2) return CONSTANTS.PLANE.BONUS_IMPULSE.V2;
    if (value <= 3) return CONSTANTS.PLANE.BONUS_IMPULSE.V5;
    return CONSTANTS.PLANE.BONUS_IMPULSE.V10;
  }

  private placeOnTrajectory(actions: StepAction[]): RouteStep[] {
    const steps: RouteStep[] = [];
    const X_START = 650;
    const BASE_SPACING = 400;
    const SPACING_JITTER = 50;
    const SPACING_MIN = 300;
    const SPACING_MAX = 700;

    const deckY = CONSTANTS.HORIZON_Y + CONSTANTS.BOAT.Y_OFFSET + CONSTANTS.BOAT.DECK_Y_OFFSET_FROM_HORIZON;
    const planeHalfH = CONSTANTS.PLANE.HEIGHT / 2;
    const planeHalfW = CONSTANTS.PLANE.WIDTH / 2;
    const objHalfW = COLLECT_HITBOX.width / 2;
    // Always simulate at NORMAL speed (1x). Fast mode is handled by engine timeScale.
    const speedMultiplier = 1;
    const gravity = CONSTANTS.PLANE.GRAVITY;
    const drag = CONSTANTS.PLANE.DRAG_Y;
    const maxRise = CONSTANTS.PLANE.MAX_RISE_SPEED;
    const maxFall = CONSTANTS.PLANE.MAX_FALL_SPEED;
    const yMin = Math.floor(
      Math.max(
        CONSTANTS.HORIZON_Y + CONSTANTS.OBJECTS.SPAWN.Y_OFFSET_MIN,
        CONSTANTS.HORIZON_Y - 320,
      ),
    );
    const yMaxBase = Math.max(yMin + 40, Math.floor(deckY - planeHalfH - 40));
    // Reduce yMax to be safely above horizon. Horizon Y is water level (~490).
    const SAFE_HORIZON_Y = CONSTANTS.HORIZON_Y - 180;
    const yMax = Math.min(yMaxBase, SAFE_HORIZON_Y);

    let x = 100;
    let y = deckY - planeHalfH;
    let vy = this.clamp(CONSTANTS.PLANE.TAKEOFF_IMPULSE * speedMultiplier, maxRise, maxFall);
    const maxFrames = 20000;
    let prevStepX = X_START;

    const simulateToX = (startX: number, startY: number, startVy: number, targetTriggerX: number) => {
      let sx = startX;
      let sy = startY;
      let svy = startVy;
      for (let f = 0; f < maxFrames && sx < targetTriggerX; f++) {
        sx += this.speedX * DT;
        svy += gravity * DT;
        if (drag > 0) {
          const dragDelta = drag * DT;
          if (svy > 0) svy = Math.max(0, svy - dragDelta);
          else if (svy < 0) svy = Math.min(0, svy + dragDelta);
        }
        svy = this.clamp(svy, maxRise, maxFall);
        sy += svy * DT;
      }
      return { x: sx, y: sy, vy: svy };
    };

    // Fix: Remove duplicate declaration
    let desiredDir = Math.random() < 0.5 ? -1 : 1;
    let yLow = yMin + 12;
    let yHigh = yMax - 12; // Mutable zone boundaries
    let desiredY = this.clamp(y + (Math.random() * 2 - 1) * 90, yLow, yHigh);
    let lowStreak = 0;
    let highStreak = 0;

    for (let i = 0; i < actions.length; i++) {
      let targetX = X_START;
      if (i > 0) {
        const candidates: number[] = [];
        const prevAction = actions[i - 1];
        const currAction = actions[i];
        const isPrevBonus = prevAction.type === "ADDITIVE" || prevAction.type === "MULTIPLIER";
        const isCurrBonus = currAction.type === "ADDITIVE" || currAction.type === "MULTIPLIER";

        let currentSpacingMin = SPACING_MIN;
        let currentBaseSpacing = BASE_SPACING;

        if (Math.random() < 0.35) desiredDir *= -1;
    const hop = 40 + Math.random() * 180;
        const noise = (Math.random() * 2 - 1) * 40;
        
        // --- ALTITUDE ZONES LOGIC ---
        // Change zone every few steps
        if (i % (3 + Math.floor(Math.random() * 3)) === 0) {
             const zones = ["HIGH", "MID", "MID", "LOW"]; // Bias towards MID
             const zone = zones[Math.floor(Math.random() * zones.length)];
             if (zone === "HIGH") {
                 yLow = yMin + 12;
                 yHigh = yMin + 150;
             } else if (zone === "MID") {
                 yLow = yMin + 150;
                 yHigh = yMax - 150;
             } else { // LOW
                 yLow = yMax - 150;
                 yHigh = yMax - 12;
             }
        }
        // Re-clamp desiredY to new zone
        desiredY = this.clamp(desiredY + desiredDir * hop + noise, yLow, yHigh);

        // --- LOOKAHEAD BIAS ---
        // If the NEXT action (after this one) is a Rocket, we should aim HIGH now.
        if (i < actions.length - 1 && actions[i + 1].type === "TORPEDO") {
            desiredY = yMin; // Aim for absolute top
        }
        // --- ALTITUDE RECOVERY BIAS ---
        // If we are getting too low (> 220), force climb to safety.
        // Deck is ~460. Water ~490. 220 is comfortable mid-high.
        if (y > 220) {
            desiredY = yMin; 
        }
        // ----------------------

        if (isPrevBonus) {
          currentSpacingMin = 90;
          currentBaseSpacing = 180;

          if (isCurrBonus && Math.random() < 0.6) {
            desiredY = this.clamp(desiredY - 180 - Math.random() * 80, yLow, yHigh);
            currentBaseSpacing = 150;
          } else {
            if (Math.random() < 0.65) {
              desiredY = this.clamp(desiredY - 140 - Math.random() * 60, yLow, yHigh);
            }
          }
        }

        desiredY = this.clamp(desiredY + ((yLow + yHigh) / 2 - desiredY) * 0.02, yLow, yHigh); // Minimal centering

        // DYNAMIC SPACING: Randomize base spacing per step
        // Fast/Action steps = close. Relaxed steps = far.
        // Base range: 250 - 550
        const randomSpacing = 250 + Math.random() * 300;
        let desiredSpacing = this.clamp(randomSpacing + (Math.random() * 2 - 1) * 80, currentSpacingMin, SPACING_MAX);

        if (lowStreak >= 2) {
          desiredY = this.clamp(desiredY + 60, yLow, yHigh);
        } else if (highStreak >= 2) {
          desiredY = this.clamp(desiredY - 60, yLow, yHigh);
          desiredSpacing = SPACING_MAX; // Force gap if stuck high
        }

        const spacingAdjust = this.clamp((desiredY - y) * 0.6 + (-vy) * 0.2, -200, 200);
        let attempts = 0;
        while (candidates.length < 30 && attempts < 90) {
          attempts++;
          const spacingRaw = currentBaseSpacing + spacingAdjust + (Math.random() * 2 - 1) * SPACING_JITTER;
          const spacing = this.clamp(Math.round(spacingRaw), currentSpacingMin, SPACING_MAX);
          candidates.push(prevStepX + spacing);
        }

        // --- SAFETY LOGIC FOR ROCKETS ---
        const isRocket = currAction.type === "TORPEDO";
        if (isRocket) {
             // If we are low and facing a rocket (which drops us), force minimum spacing
             // to get to the rocket ASAP before gravity drags us into the water.
             if (y > yHigh - 120) {
                 candidates.length = 0; // Clear other options
                 candidates.push(prevStepX + 90); // FORCE mini-spacing
                 console.log("[RouteGenerator] Safety Override: Force 90px spacing due to low altitude rocket");
             }
        }
        // --------------------------------
        candidates.push(prevStepX + desiredSpacing, prevStepX + currentSpacingMin, prevStepX + SPACING_MAX);
        let bestX = candidates[0];
        let bestScore = Number.POSITIVE_INFINITY;
        let bestInRangeX: number | null = null;
        let bestInRangeScore = Number.POSITIVE_INFINITY;
        for (const candX of candidates) {
          const triggerX = candX - (planeHalfW + objHalfW);
          const sim = simulateToX(x, y, vy, triggerX);
          const candY = sim.y;
          const inRange = candY >= yMin && candY <= yMax;
          const rangePenalty = inRange ? 0 : Math.min(Math.abs(candY - yMin), Math.abs(candY - yMax)) + 200;
          const desiredPenalty = Math.abs(candY - desiredY);
          const spacingPenalty = Math.abs(candX - (prevStepX + desiredSpacing)) * 0.28;
          let score = rangePenalty + desiredPenalty + spacingPenalty;
          // STRICT HORIZON CHECK:
          // If simulation touches water (HORIZON_Y) at any point, reject it completely.
          if (candY > CONSTANTS.HORIZON_Y - 40) {
              score = Number.POSITIVE_INFINITY;
          }

          if (score < bestScore) {
            bestScore = score;
            bestX = candX;
          }
          // Only CONSIDER valid range candidates for "bestInRange"
          if (inRange && score < bestInRangeScore) {
            bestInRangeScore = score;
            bestInRangeX = candX;
          }
        }

        // --- PANIC RECOVERY ---
        // If bestScore is still INFINITY, it means ALL candidates lead to water/crash.
        // We must pick the "least bad" one: the one that keeps us HIGHEST (lowest Y).
        if (bestScore === Number.POSITIVE_INFINITY) {
             let highestY = Number.POSITIVE_INFINITY;
             let bestRecoveryX = candidates[0];
             
             for (const candX of candidates) {
                 const triggerX = candX - (planeHalfW + objHalfW);
                 const sim = simulateToX(x, y, vy, triggerX);
                 if (sim.y < highestY) {
                     highestY = sim.y;
                     bestRecoveryX = candX;
                 }
             }
             console.log(`[RouteGenerator] EMERGENCY: All candidates crashed. Creating recovery path to Y=${highestY.toFixed(2)}`);
             bestX = bestRecoveryX; 
        }

        targetX = bestInRangeX ?? bestX;
      }

      const triggerX = targetX - (planeHalfW + objHalfW);
      const sim = simulateToX(x, y, vy, triggerX);
      x = sim.x;
      y = sim.y;
      vy = sim.vy;

      steps.push({
        type: actions[i].type,
        value: actions[i].value,
        xPosition: targetX,
        yPosition: y,
        elementType: actions[i].elementType,
        elementValue: actions[i].elementValue,
      });
      console.log(`[RouteGenerator] Step${i}: ${actions[i].elementType}(${actions[i].value}) @ x=${targetX.toFixed(2)}, y=${y.toFixed(2)} (vy=${vy.toFixed(2)})`);

      if (y <= yLow + 16) {
        lowStreak += 1;
        highStreak = 0;
      } else if (y >= yHigh - 16) {
        highStreak += 1;
        lowStreak = 0;
      } else {
        lowStreak = 0;
        highStreak = 0;
      }
      prevStepX = targetX;
      vy = this.getImpulse(actions[i].type, actions[i].value);
    }

    return steps;
  }


  validate(route: GeneratedRoute): boolean {
    if (route.steps.length < 1) return false;

    let finalAmount = this.params.betAmount;
    for (const step of route.steps) {
      if (step.type === "ADDITIVE") finalAmount += step.value;
      else if (step.type === "MULTIPLIER") finalAmount *= step.value;
      else if (step.type === "TORPEDO") finalAmount = Math.max(0.01, Math.round(finalAmount / 2));
    }

    if (route.outcome === "WIN") return finalAmount === route.finalAmount;
    return true;
  }
  private generateDecoys(steps: RouteStep[], totalDistance: number, landingBoatX: number): DecoyObject[] {
    const decoys: DecoyObject[] = [];
    const deckY = CONSTANTS.HORIZON_Y + CONSTANTS.BOAT.Y_OFFSET + CONSTANTS.BOAT.DECK_Y_OFFSET_FROM_HORIZON;
    const planeHalfH = CONSTANTS.PLANE.HEIGHT / 2;
    const planeHalfW = CONSTANTS.PLANE.WIDTH / 2;
    const gravity = CONSTANTS.PLANE.GRAVITY;
    const drag = CONSTANTS.PLANE.DRAG_Y;
    const maxRise = CONSTANTS.PLANE.MAX_RISE_SPEED;
    const maxFall = CONSTANTS.PLANE.MAX_FALL_SPEED;

    const yMin = 30;
    const yMax = Math.floor(deckY - planeHalfH - 50);

    let x = 100;
    let y = deckY - planeHalfH;
    let vy = this.clamp(CONSTANTS.PLANE.TAKEOFF_IMPULSE, maxRise, maxFall);

    let stepIndex = 0;
    let nextDecoyX = x + 100;
    const maxFrames = 20000;
    const SAFETY_MARGIN = 140; // Increased cushion

    for (let i = 0; i < maxFrames; i++) {
      x += this.speedX * DT;
      if (x > totalDistance + 800) break;

      if (x > landingBoatX) {
        y = deckY - planeHalfH;
        vy = 0;
      } else {
        vy += gravity * DT;
        if (drag > 0) {
          const dragDelta = drag * DT;
          if (vy > 0) vy = Math.max(0, vy - dragDelta);
          else if (vy < 0) vy = Math.min(0, vy + dragDelta);
        }
        vy = this.clamp(vy, maxRise, maxFall);
        y += vy * DT;
      }

      while (stepIndex < steps.length) {
        const step = steps[stepIndex];
        const objHalfW = COLLECT_HITBOX.width / 2;
        const triggerX = step.xPosition - (planeHalfW + objHalfW);
        if (x < triggerX) break;
        vy = this.getImpulse(step.type, step.value);
        stepIndex++;
      }

      if (x >= nextDecoyX) {
        // Try to fill this column with decoys
        const attemptsInColumn = 3;

        for (let k = 0; k < attemptsInColumn; k++) {
            const safeZones: { min: number, max: number }[] = [];
            // Recalculate safe zones relative to plane's current Y (approximate)
            if (y - SAFETY_MARGIN > yMin) safeZones.push({ min: yMin, max: y - SAFETY_MARGIN });
            if (y + SAFETY_MARGIN < yMax) safeZones.push({ min: y + SAFETY_MARGIN, max: yMax });

            if (safeZones.length > 0) {
                const zone = safeZones[Math.floor(Math.random() * safeZones.length)];
                // Try 5 random positions
                for (let t = 0; t < 5; t++) {
                     const candY = zone.min + Math.random() * (zone.max - zone.min);
                     let invalid = false;
                     
                     // 1. Check vs Route Steps
                     for (const step of steps) {
                         if (Math.abs(step.xPosition - x) < 180 && Math.abs(step.yPosition - candY) < 130) {
                             invalid = true;
                             break;
                         }
                     }
                     if (invalid) continue;

                     // 2. Check vs Existing Decoys
                     for (const d of decoys) {
                         // Simple euclidean or box check
                         const dx = d.xPosition - x;
                         const dy = d.yPosition - candY;
                         if (Math.sqrt(dx*dx + dy*dy) < 140) {
                             invalid = true;
                             break;
                         }
                     }
                     if (invalid) continue;

                     // Valid! Add it.
                     const isRocket = Math.random() < 0.15;
                     let val: number | string = "0";
                     let type: "BONUS" | "ROCKET" = "ROCKET";
                     if (!isRocket) {
                        type = "BONUS";
                        if (Math.random() < 0.6) {
                            const mults = ["x2", "x3", "x4", "x2"];
                            val = mults[Math.floor(Math.random() * mults.length)];
                        } else {
                            val = Math.floor(Math.random() * 3) + 2;
                        }
                     }
                     decoys.push({
                        id: `decoy-${decoys.length}`,
                        xPosition: Math.round(x + (Math.random()*40-20)), // Jitter X slightly
                        yPosition: Math.round(candY),
                        type: type,
                        value: val,
                     });
                     break; // One per attempt loop
                }
            }
        }
        nextDecoyX = x + 120 + Math.random() * 80;
      }
    }
    return decoys;
  }
}