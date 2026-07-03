import { EventEmitter } from 'events';

export class InputManager extends EventEmitter {
  private keysPressed: Map<string, boolean> = new Map();

  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keysPressed.set(e.key, true);

      if (e.key === 'p' || e.key === 'P') {
        this.emit('pause');
      }
      if (e.key === 'r' || e.key === 'R') {
        this.emit('restart');
      }
      if (e.key === ' ') {
        this.emit('boost');
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed.set(e.key, false);
    });

    // Handle mobile/touch input
    let touchStartX = 0;
    window.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });

    window.addEventListener('touchmove', (e) => {
      const touchX = e.touches[0].clientX;
      if (touchX < touchStartX - 20) {
        this.keysPressed.set('ArrowLeft', true);
        this.keysPressed.set('ArrowRight', false);
      } else if (touchX > touchStartX + 20) {
        this.keysPressed.set('ArrowLeft', false);
        this.keysPressed.set('ArrowRight', true);
      }
    });

    window.addEventListener('touchend', () => {
      this.keysPressed.set('ArrowLeft', false);
      this.keysPressed.set('ArrowRight', false);
    });
  }

  public isKeyPressed(key: string): boolean {
    return this.keysPressed.get(key) || false;
  }
}
