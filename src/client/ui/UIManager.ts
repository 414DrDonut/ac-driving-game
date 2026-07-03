import { EventEmitter } from 'events';

export class UIManager extends EventEmitter {
  private startScreen: HTMLElement | null = null;
  private hud: HTMLElement | null = null;
  private gameOverScreen: HTMLElement | null = null;
  private pauseMenu: HTMLElement | null = null;

  public initialize(callback: () => void) {
    this.createUI();
    callback();
  }

  private createUI() {
    // Start screen
    this.startScreen = document.createElement('div');
    this.startScreen.id = 'start-screen';
    this.startScreen.innerHTML = `
      <div class="screen-content">
        <h1>🏎️ Highway Dodging</h1>
        <p>Swerve through traffic and survive as long as you can!</p>
        <input type="text" id="player-name" placeholder="Enter your name" value="Player">
        <button id="start-btn">Start Game</button>
        <div class="instructions">
          <h3>Controls:</h3>
          <p>← → / A D to move | SPACE to boost | P to pause | R to restart</p>
        </div>
      </div>
    `;
    document.body.appendChild(this.startScreen);

    // HUD
    this.hud = document.createElement('div');
    this.hud.id = 'hud';
    this.hud.innerHTML = `
      <div class="hud-content">
        <div class="hud-top">
          <div class="score">Score: <span id="score">0</span></div>
          <div class="multiplier">x<span id="multiplier">1.0</span></div>
          <div class="time">Time: <span id="time">0s</span></div>
        </div>
        <div class="boosts">Boosts: <span id="boosts">3</span></div>
      </div>
    `;
    document.body.appendChild(this.hud);
    this.hud.style.display = 'none';

    // Game over screen
    this.gameOverScreen = document.createElement('div');
    this.gameOverScreen.id = 'game-over';
    this.gameOverScreen.innerHTML = `
      <div class="screen-content">
        <h1>Game Over!</h1>
        <div class="game-over-stats">
          <p>Final Score: <span id="final-score">0</span></p>
          <p>Survival Time: <span id="survival-time">0s</span></p>
        </div>
        <button id="restart-btn">Play Again</button>
      </div>
    `;
    document.body.appendChild(this.gameOverScreen);
    this.gameOverScreen.style.display = 'none';

    // Pause menu
    this.pauseMenu = document.createElement('div');
    this.pauseMenu.id = 'pause-menu';
    this.pauseMenu.innerHTML = `
      <div class="screen-content">
        <h1>Paused</h1>
        <p>Press P to resume</p>
      </div>
    `;
    document.body.appendChild(this.pauseMenu);
    this.pauseMenu.style.display = 'none';

    // Event listeners
    document.getElementById('start-btn')?.addEventListener('click', () => {
      const nameInput = document.getElementById('player-name') as HTMLInputElement;
      this.emit('start-game', nameInput?.value || 'Player');
    });

    document.getElementById('restart-btn')?.addEventListener('click', () => {
      this.emit('restart-game');
      this.hideGameOver();
      this.showHUD();
    });
  }

  public hideStartScreen() {
    if (this.startScreen) this.startScreen.style.display = 'none';
  }

  public showHUD() {
    if (this.hud) this.hud.style.display = 'block';
  }

  public hideHUD() {
    if (this.hud) this.hud.style.display = 'none';
  }

  public showGameOver(score: number, time: number) {
    this.hideHUD();
    if (this.gameOverScreen) {
      document.getElementById('final-score')!.textContent = score.toString();
      document.getElementById('survival-time')!.textContent = time.toFixed(1) + 's';
      this.gameOverScreen.style.display = 'flex';
    }
  }

  public hideGameOver() {
    if (this.gameOverScreen) this.gameOverScreen.style.display = 'none';
  }

  public showPauseMenu() {
    if (this.pauseMenu) this.pauseMenu.style.display = 'flex';
  }

  public hidePauseMenu() {
    if (this.pauseMenu) this.pauseMenu.style.display = 'none';
  }

  public updateScore(score: number) {
    const el = document.getElementById('score');
    if (el) el.textContent = score.toString();
  }

  public updateMultiplier(multiplier: number) {
    const el = document.getElementById('multiplier');
    if (el) el.textContent = multiplier.toFixed(1);
  }

  public updateTime(time: number) {
    const el = document.getElementById('time');
    if (el) el.textContent = time.toFixed(1) + 's';
  }

  public updateBoostCount(count: number) {
    const el = document.getElementById('boosts');
    if (el) el.textContent = count.toString();
  }
}
