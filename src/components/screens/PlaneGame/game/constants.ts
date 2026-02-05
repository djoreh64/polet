export const CONSTANTS = {
  WIDTH: 500,
  HEIGHT: 844,
  HORIZON_Y: Math.round(844 * 0.58),
  WORLD_WIDTH: 10000000,
  SAFE_ZONE_DISTANCE: 750,
  INITIAL_MULTIPLIER: 1,

  SCORE: {
    MAX_MULTIPLIER: Infinity,
  },

  PLANE: {
    WIDTH: 88,
    HEIGHT: 88,
    GRAVITY: 290,
    DRAG_Y: 20,
    MAX_FALL_SPEED: 660,
    MAX_RISE_SPEED: -520,
    HORIZONTAL_SPEED: 480,
    MAX_HORIZONTAL_SPEED: 720,
    TAKEOFF_IMPULSE: -350,
    BONUS_IMPULSE: {
      V1: -200,
      V2: -240,
      V5: -280,
      V10: -320,
      X2: -250,
      ROCKET: 0, // Zero impulse = Free fall (Gravity only)
    },
    DROP_STRENGTH: 0,
    ROTATION_SMOOTHING: 0.1,
  },

  BOAT: {
    DECK_Y_OFFSET_FROM_HORIZON: 24,
    Y_OFFSET: -50,
    WIDTH: 188,
    HEIGHT: 188,
    LANDING_TOLERANCE_Y: 26,
  },

  OBJECTS: {
    SPAWN_INTERVAL: 200,
    BONUS_STRENGTHS: [1, 2, 3, 4, "x2", "x3", "x4"],
    BONUS_WEIGHTS: {
      "1": 35,
      "2": 25,
      "3": 15,
      "4": 10,
      x2: 8,
      x3: 5,
      x4: 2,
    },
    TYPES: {
      BONUS: "BONUS",
      ROCKET: "ROCKET",
    },
    SPAWN: {
      AHEAD_MIN: 120,
      AHEAD_MAX: 420,
      SPACING_X: 90,
      SPACING_JITTER_X: 40,
      Y_OFFSET_MIN: -320,
      Y_OFFSET_MAX: -80,
    },
  },

  ASSETS: {
    SKY: "sky",
    PLANE: "plane",
    ROCKET: "rocket",
    BOAT: "boat",
  },
};