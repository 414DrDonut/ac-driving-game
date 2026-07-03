import * as THREE from 'three';
import { GameEngine } from './engine/GameEngine';
import { InputManager } from './input/InputManager';
import { NetworkManager } from './network/NetworkManager';
import { UIManager } from './ui/UIManager';

// Initialize the game
const gameEngine = new GameEngine();
const inputManager = new InputManager();
const networkManager = new NetworkManager();
const uiManager = new UIManager();

// Game state
interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  score: number;
  multiplier: number;
  boostsRemaining: number;
  survivalTime: number;
}

const gameState: GameState = {
  isRunning: false,
  isPaused: false,
  score: 0,
  multiplier: 1,
  boostsRemaining: 3,
  survivalTime: 0
};

// Start game
function startGame(playerName: string) {
  gameState.isRunning = true;
  gameState.score = 0;
  gameState.multiplier = 1;
  gameState.boostsRemaining = 3;
  gameState.survivalTime = 0;
  
  gameEngine.reset();
  networkManager.startGame(playerName);
  uiManager.hideStartScreen();
  uiManager.showHUD();
}

// End game
function endGame() {
  gameState.isRunning = false;
  networkManager.endGame(gameState.score);
  uiManager.showGameOver(gameState.score, gameState.survivalTime);
}

// Pause game
function togglePause() {
  gameState.isPaused = !gameState.isPaused;
  if (gameState.isPaused) {
    uiManager.showPauseMenu();
  } else {
    uiManager.hidePauseMenu();
  }
}

// Update score when dodging cars
function dodgeSuccessful() {
  const pointsGained = Math.floor(10 * gameState.multiplier);
  gameState.score += pointsGained;
  gameState.multiplier += 0.1;
  networkManager.updateScore(gameState.score, gameState.multiplier);
  uiManager.updateScore(gameState.score);
  uiManager.updateMultiplier(gameState.multiplier);
}

// Reset multiplier on collision
function collision() {
  gameState.multiplier = 1;
  endGame();
}

// Use boost
function useBoost() {
  if (gameState.boostsRemaining > 0 && gameState.isRunning) {
    gameState.boostsRemaining--;
    gameEngine.activateBoost();
    uiManager.updateBoostCount(gameState.boostsRemaining);
  }
}

// Game loop
let lastTime = 0;
function gameLoop(currentTime: number) {
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (gameState.isRunning && !gameState.isPaused) {
    gameState.survivalTime += deltaTime;
    
    // Update engine
    gameEngine.update(deltaTime, {
      moveLeft: inputManager.isKeyPressed('ArrowLeft') || inputManager.isKeyPressed('a'),
      moveRight: inputManager.isKeyPressed('ArrowRight') || inputManager.isKeyPressed('d'),
      boost: inputManager.isKeyPressed(' ')
    });

    // Check for collisions
    if (gameEngine.checkCollisions()) {
      collision();
    }

    // Check for successful dodges
    const dodged = gameEngine.getAndClearDodgedCars();
    dodged.forEach(() => dodgeSuccessful());

    // Update UI
    uiManager.updateTime(gameState.survivalTime);
    
    // Increase difficulty
    gameEngine.increaseDifficulty(gameState.survivalTime);
  }

  requestAnimationFrame(gameLoop);
}

// Event listeners
inputManager.on('pause', () => {
  if (gameState.isRunning) togglePause();
});

inputManager.on('restart', () => {
  if (!gameState.isRunning) {
    startGame('Player');
  }
});

inputManager.on('boost', () => {
  useBoost();
});

uiManager.on('start-game', (playerName: string) => {
  startGame(playerName);
});

uiManager.on('restart-game', () => {
  startGame('Player');
});

// Initialize UI
uiManager.initialize(() => {
  // Show start screen
});

// Start game loop
requestAnimationFrame(gameLoop);

console.log('🎮 Highway Dodging Game initialized');
