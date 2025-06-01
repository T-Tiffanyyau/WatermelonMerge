const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for game sessions
const gameSessions = new Map();

// Game configuration - customizable items (you can change these to any theme)
const GAME_ITEMS = [
  { id: 0, name: "item1", size: 1, points: 1 },
  { id: 1, name: "item2", size: 2, points: 3 },
  { id: 2, name: "item3", size: 3, points: 6 },
  { id: 3, name: "item4", size: 4, points: 10 },
  { id: 4, name: "item5", size: 5, points: 15 },
  { id: 5, name: "item6", size: 6, points: 21 },
  { id: 6, name: "item7", size: 7, points: 28 },
  { id: 7, name: "item8", size: 8, points: 36 },
  { id: 8, name: "item9", size: 9, points: 45 },
  { id: 9, name: "item10", size: 10, points: 55 },
  { id: 10, name: "watermelon", size: 11, points: 100 },
];

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 15;

// Game class to handle game logic
class MergeGame {
  constructor() {
    this.board = Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null));
    this.score = 0;
    this.gameOver = false;
    this.nextItem = this.getRandomStartItem();
  }

  getRandomStartItem() {
    // Only return first 5 items for dropping (items 0-4)
    return Math.floor(Math.random() * 5);
  }

  dropItem(column, itemId) {
    if (this.gameOver || column < 0 || column >= BOARD_WIDTH) {
      return { success: false, message: "Invalid move" };
    }

    // Find the lowest available position in the column
    let row = BOARD_HEIGHT - 1;
    while (row >= 0 && this.board[row][column] !== null) {
      row--;
    }

    if (row < 0) {
      // Column is full, check if game over
      this.checkGameOver();
      return { success: false, message: "Column is full" };
    }

    // Place the item
    this.board[row][column] = itemId;

    // Check for merges
    const mergeResult = this.checkAndProcessMerges(row, column);

    // Generate next item
    this.nextItem = this.getRandomStartItem();

    // Check game over condition
    this.checkGameOver();

    return {
      success: true,
      position: { row, column },
      merges: mergeResult.merges,
      pointsEarned: mergeResult.points,
      newScore: this.score,
      nextItem: this.nextItem,
      gameOver: this.gameOver,
    };
  }

  checkAndProcessMerges(startRow, startCol) {
    let totalPoints = 0;
    let merges = [];
    let hasChanges = true;

    while (hasChanges) {
      hasChanges = false;

      // Check all positions for possible merges
      for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
          if (this.board[row][col] === null) continue;

          const currentItem = this.board[row][col];
          const mergePositions = this.findMergeGroup(row, col, currentItem);

          if (mergePositions.length >= 2) {
            // Perform merge
            const newItemId = Math.min(currentItem + 1, GAME_ITEMS.length - 1);
            const points = GAME_ITEMS[newItemId].points * mergePositions.length;

            // Clear old positions
            mergePositions.forEach((pos) => {
              this.board[pos.row][pos.col] = null;
            });

            // Place new item at the center position
            const centerPos = mergePositions[0];
            this.board[centerPos.row][centerPos.col] = newItemId;

            totalPoints += points;
            this.score += points;

            merges.push({
              positions: mergePositions,
              fromItem: currentItem,
              toItem: newItemId,
              points: points,
            });

            hasChanges = true;
            break;
          }
        }
        if (hasChanges) break;
      }

      // Apply gravity after merges
      if (hasChanges) {
        this.applyGravity();
      }
    }

    return { merges, points: totalPoints };
  }

  findMergeGroup(row, col, itemId) {
    const visited = new Set();
    const group = [];
    const stack = [{ row, col }];

    while (stack.length > 0) {
      const { row: r, col: c } = stack.pop();
      const key = `${r},${c}`;

      if (visited.has(key)) continue;
      if (r < 0 || r >= BOARD_HEIGHT || c < 0 || c >= BOARD_WIDTH) continue;
      if (this.board[r][c] !== itemId) continue;

      visited.add(key);
      group.push({ row: r, col: c });

      // Check adjacent cells (4-directional)
      stack.push({ row: r - 1, col: c });
      stack.push({ row: r + 1, col: c });
      stack.push({ row: r, col: c - 1 });
      stack.push({ row: r, col: c + 1 });
    }

    return group;
  }

  applyGravity() {
    for (let col = 0; col < BOARD_WIDTH; col++) {
      // Collect all non-null items in this column
      const items = [];
      for (let row = 0; row < BOARD_HEIGHT; row++) {
        if (this.board[row][col] !== null) {
          items.push(this.board[row][col]);
          this.board[row][col] = null;
        }
      }

      // Place items at the bottom
      for (let i = 0; i < items.length; i++) {
        this.board[BOARD_HEIGHT - 1 - i][col] = items[items.length - 1 - i];
      }
    }
  }

  checkGameOver() {
    // Game over if top row has any items
    for (let col = 0; col < BOARD_WIDTH; col++) {
      if (this.board[0][col] !== null) {
        this.gameOver = true;
        return;
      }
    }
  }

  getGameState() {
    return {
      board: this.board,
      score: this.score,
      gameOver: this.gameOver,
      nextItem: this.nextItem,
    };
  }
}

// API Routes

// Create new game session
app.post("/api/game/new", (req, res) => {
  const gameId = uuidv4();
  const game = new MergeGame();
  gameSessions.set(gameId, game);

  res.json({
    gameId,
    gameState: game.getGameState(),
    items: GAME_ITEMS,
  });
});

// Get game state
app.get("/api/game/:gameId", (req, res) => {
  const { gameId } = req.params;
  const game = gameSessions.get(gameId);

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  res.json({
    gameState: game.getGameState(),
    items: GAME_ITEMS,
  });
});

// Drop item
app.post("/api/game/:gameId/drop", (req, res) => {
  const { gameId } = req.params;
  const { column, itemId } = req.body;
  const game = gameSessions.get(gameId);

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  if (typeof column !== "number" || typeof itemId !== "number") {
    return res.status(400).json({ error: "Invalid input" });
  }

  const result = game.dropItem(column, itemId);

  res.json({
    ...result,
    gameState: game.getGameState(),
  });
});

// Get game items configuration
app.get("/api/items", (req, res) => {
  res.json({ items: GAME_ITEMS });
});

// Delete game session
app.delete("/api/game/:gameId", (req, res) => {
  const { gameId } = req.params;
  const deleted = gameSessions.delete(gameId);

  if (!deleted) {
    return res.status(404).json({ error: "Game not found" });
  }

  res.json({ message: "Game session deleted" });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    activeSessions: gameSessions.size,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Merge game backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
