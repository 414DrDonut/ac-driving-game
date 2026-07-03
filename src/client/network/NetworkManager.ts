import { io, Socket } from 'socket.io-client';

export class NetworkManager {
  private socket: Socket | null = null;
  private playerId: string = '';

  constructor() {
    this.connect();
  }

  private connect() {
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
    this.socket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      this.playerId = this.socket?.id || '';
      console.log('Connected to server:', this.playerId);
    });

    this.socket.on('leaderboard-update', (data) => {
      console.log('Leaderboard updated:', data);
    });

    this.socket.on('game-over-confirmed', (data) => {
      console.log('Game over confirmed:', data);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  public startGame(playerName: string) {
    if (this.socket) {
      this.socket.emit('start-game', playerName);
    }
  }

  public updateScore(score: number, multiplier: number) {
    if (this.socket) {
      this.socket.emit('score-update', { score, multiplier });
    }
  }

  public endGame(finalScore: number) {
    if (this.socket) {
      this.socket.emit('game-over', { finalScore });
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
