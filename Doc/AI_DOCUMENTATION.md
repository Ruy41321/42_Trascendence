# 🤖 AI System Documentation

## Overview

The AI system (`AIService.js`) controls an NPC paddle that simulates human-like behavior. It's designed to be beatable but challenging, using reaction delays, prediction errors, and "human mistakes" to create realistic gameplay.

---

## How the AI Works

### Decision Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AI UPDATE CYCLE                          │
│                  (every 50ms interval)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │ Check Behavior States   │
              │ (hesitating, distracted,│
              │  wrong direction, etc.) │
              └───────────┬─────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │ Detect Ball Direction   │
              │ Change → Set Reaction   │
              │ Delay + New Error       │
              └───────────┬─────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │ Predict Ball Position   │
              │ (with error margin)     │
              └───────────┬─────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │ Move Paddle Toward      │
              │ Predicted Position      │
              └─────────────────────────┘
```

### Ball Prediction

The AI predicts where the ball will intersect the paddle's X position:

1. Calculates time for ball to reach paddle: `timeToReach = (paddleX - ballX) / ballVx`
2. Projects ball Y position: `predictedY = ballY + ballVy * timeToReach`
3. Simulates wall bounces to account for reflections
4. Adds random prediction error to simulate inaccuracy

---

## Configuration Parameters

All parameters are in `AIService.AI_CONFIG`:

### Reaction Timing

| Parameter | Default | Description |
|-----------|---------|-------------|
| `REACTION_DELAY_MIN` | 100ms | Minimum time before AI reacts to ball direction change |
| `REACTION_DELAY_MAX` | 300ms | Maximum reaction delay |
| `UPDATE_INTERVAL` | 50ms | How often AI makes decisions |

**Effect:** Higher values = slower AI, easier to beat

### Prediction Accuracy

| Parameter | Default | Description |
|-----------|---------|-------------|
| `PREDICTION_ERROR_MIN` | 20px | Minimum aiming error |
| `PREDICTION_ERROR_MAX` | 80px | Maximum aiming error |
| `DEADZONE` | 15px | AI stops moving when this close to target |

**Effect:** Higher error = AI misses more, easier to beat

### Human-like Behaviors

| Parameter | Default | Description |
|-----------|---------|-------------|
| `HESITATION_CHANCE` | 8% | Chance to freeze briefly |
| `HESITATION_DURATION` | 300ms | How long AI freezes |
| `WRONG_DIRECTION_CHANCE` | 3% | Chance to move wrong way |
| `WRONG_DIRECTION_DURATION` | 200ms | Duration of wrong movement |
| `LATE_REACTION_CHANCE` | 10% | Chance to react late |
| `LATE_REACTION_EXTRA_DELAY` | 400ms | Extra delay when reacting late |
| `OVERCOMMIT_CHANCE` | 5% | Chance to overshoot target |
| `OVERCOMMIT_DURATION` | 250ms | Duration of overshooting |
| `DISTRACTION_CHANCE` | 2% | Chance to return to center randomly |
| `DISTRACTION_DURATION` | 500ms | How long distraction lasts |

**Effect:** Higher chances = more mistakes, easier to beat

### Movement Speed

| Parameter | Default | Description |
|-----------|---------|-------------|
| `SPEED_FACTOR_MIN` | 0.7 | Minimum speed (70% of max) |
| `SPEED_FACTOR_MAX` | 1.0 | Maximum speed (100% of max) |

**Effect:** Lower values = slower paddle movement

---

## Difficulty Presets

### Easy Mode
```javascript
AI_CONFIG = {
  REACTION_DELAY_MIN: 200,
  REACTION_DELAY_MAX: 500,
  PREDICTION_ERROR_MIN: 50,
  PREDICTION_ERROR_MAX: 150,
  HESITATION_CHANCE: 0.15,
  WRONG_DIRECTION_CHANCE: 0.08,
  SPEED_FACTOR_MIN: 0.5,
  SPEED_FACTOR_MAX: 0.8,
}
```

### Medium Mode (Default)
```javascript
AI_CONFIG = {
  REACTION_DELAY_MIN: 100,
  REACTION_DELAY_MAX: 300,
  PREDICTION_ERROR_MIN: 20,
  PREDICTION_ERROR_MAX: 80,
  HESITATION_CHANCE: 0.08,
  WRONG_DIRECTION_CHANCE: 0.03,
  SPEED_FACTOR_MIN: 0.7,
  SPEED_FACTOR_MAX: 1.0,
}
```

### Hard Mode
```javascript
AI_CONFIG = {
  REACTION_DELAY_MIN: 30,
  REACTION_DELAY_MAX: 100,
  PREDICTION_ERROR_MIN: 5,
  PREDICTION_ERROR_MAX: 25,
  HESITATION_CHANCE: 0.02,
  WRONG_DIRECTION_CHANCE: 0.01,
  SPEED_FACTOR_MIN: 0.9,
  SPEED_FACTOR_MAX: 1.0,
}
```

---

## How to Adjust Difficulty

Edit `backend/src/services/AIService.js` and modify the `AI_CONFIG` object:

### Make AI Easier
- ↑ Increase `REACTION_DELAY_*` values
- ↑ Increase `PREDICTION_ERROR_*` values
- ↑ Increase `*_CHANCE` values (more mistakes)
- ↓ Decrease `SPEED_FACTOR_*` values

### Make AI Harder
- ↓ Decrease `REACTION_DELAY_*` values
- ↓ Decrease `PREDICTION_ERROR_*` values
- ↓ Decrease `*_CHANCE` values (fewer mistakes)
- ↑ Increase `SPEED_FACTOR_*` values

---

## AI State Machine

The AI can be in different behavioral states:

```
┌─────────────────────────────────────────────────────────┐
│                    NORMAL STATE                         │
│            (tracking ball, moving to target)            │
└──────┬──────────┬──────────┬──────────┬────────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
  │HESITATE │ │ WRONG   │ │OVERCOMIT│ │DISTRACT │
  │(freeze) │ │DIRECTION│ │(overshoot)│ │(center)│
  └─────────┘ └─────────┘ └─────────┘ └─────────┘
       │          │          │          │
       └──────────┴──────────┴──────────┘
                       │
                       ▼
              (returns to NORMAL after duration)
```

Each state has a timer. When triggered, the AI stays in that state for the configured duration before returning to normal behavior.

---

## File Location

```
backend/src/services/AIService.js
```
