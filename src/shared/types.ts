export interface Vector2 {
  x: number;
  y: number;
}

export interface PlayerCar {
  position: Vector2;
  velocity: Vector2;
  lane: number;
  speed: number;
  health: number;
  boosts: number;
  isBoosting: boolean;
}

export interface TrafficCar {
  id: string;
  position: Vector2;
  velocity: Vector2;
  lane: number;
  speed: number;
  width: number;
  height: number;
}

export interface GameState {
  player: PlayerCar;
  traffic: TrafficCar[];
  score: number;
  multiplier: number;
  dodgeStreak: number;
  time: number;
  gameActive: boolean;
  difficulty: number;
  framerate: number;
}

export interface GameConfig {
  maxSpeed: number;
  acceleration: number;
  lanes: number;
  laneWidth: number;
  trafficSpawnRate: number;
  trafficMaxSpeed: number;
  difficultyScaling: number;
  boostMultiplier: number;
}
