import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../../public')));

// Store active games and leaderboard
interface GameSession {
  playerId: string;
  playerName: string;
  score: number;
  multiplier: number;
  gameActive: boolean;
  startTime: number;
}

const gameSessions = new Map<string, GameSession>();
const leaderboard: GameSession[] = [];

// Routes
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'running', 
    activePlayers: gameSessions.size,
    timestamp: new Date() 
  });
});

app.get('/api/leaderboard', (req, res) => {
  const sorted = Array.from(leaderboard)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  res.json({ leaderboard: sorted });
});

// WebSocket connections
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('start-game', (playerName: string) => {
    const session: GameSession = {
      playerId: socket.id,
      playerName: playerName || 'Anonymous',
      score: 0,
      multiplier: 1,
      gameActive: true,
      startTime: Date.now()
    };
    gameSessions.set(socket.id, session);
    socket.emit('game-started', { playerId: socket.id, message: 'Game started!' });
    console.log(`Game started for ${session.playerName}`);
  });

  socket.on('score-update', (data: { score: number; multiplier: number }) => {
    const session = gameSessions.get(socket.id);
    if (session) {
      session.score = data.score;
      session.multiplier = data.multiplier;
    }
  });

  socket.on('game-over', (data: { finalScore: number }) => {
    const session = gameSessions.get(socket.id);
    if (session) {
      session.gameActive = false;
      session.score = data.finalScore;
      
      // Add to leaderboard
      leaderboard.push(session);
      
      // Broadcast new score to all clients
      io.emit('leaderboard-update', {
        playerName: session.playerName,
        score: session.score,
        multiplier: session.multiplier
      });
      
      socket.emit('game-over-confirmed', {
        finalScore: data.finalScore,
        gameTime: (Date.now() - session.startTime) / 1000
      });
      
      console.log(`Game ended for ${session.playerName}: ${data.finalScore} points`);
    }
  });

  socket.on('disconnect', () => {
    gameSessions.delete(socket.id);
    console.log('Player disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🎮 Highway Dodging Game server running on http://localhost:${PORT}`);
});
