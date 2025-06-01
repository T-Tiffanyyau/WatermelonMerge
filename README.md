# Watermelon Merge Game Backend

A Node.js backend for a merge puzzle game similar to Suika Game, but with customizable items instead of fruits.

## Features

- **Game Session Management**: Create and manage multiple game sessions
- **Merge Logic**: Automatic detection and processing of item merges
- **Physics Simulation**: Gravity system for realistic item dropping
- **Scoring System**: Points awarded based on merges and item types
- **Customizable Items**: Easy to change item themes (currently generic items, but can be customized to any theme)
- **RESTful API**: Clean API endpoints for frontend integration

## Game Mechanics

- **Board**: 10x15 grid where items are dropped
- **Dropping**: Items fall to the lowest available position in a column
- **Merging**: When 2 or more identical adjacent items touch, they merge into the next tier item
- **Scoring**: Points are awarded based on the merged item type and number of items merged
- **Game Over**: Game ends when items reach the top row

## Item Progression

The game includes 11 item tiers (0-10):
- Items 0-4: Can be randomly dropped by players
- Items 5-10: Only obtainable through merging
- Item 10 ("watermelon"): The ultimate goal item

## API Endpoints

### Create New Game
```
POST /api/game/new
```
Returns a new game session with unique ID and initial game state.

### Get Game State
```
GET /api/game/:gameId
```
Returns current game state for the specified game session.

### Drop Item
```
POST /api/game/:gameId/drop
Body: { "column": number, "itemId": number }
```
Drops an item in the specified column and returns the result including any merges.

### Get Items Configuration
```
GET /api/items
```
Returns the list of all available items with their properties.

### Delete Game Session
```
DELETE /api/game/:gameId
```
Removes a game session from memory.

### Health Check
```
GET /api/health
```
Returns server status and number of active sessions.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

The server will run on port 3000 by default (or PORT environment variable).

## Customization

To change the item theme, modify the `GAME_ITEMS` array in `server.js`:

```javascript
const GAME_ITEMS = [
  { id: 0, name: "your_item_1", size: 1, points: 1 },
  { id: 1, name: "your_item_2", size: 2, points: 3 },
  // ... add your custom items
];
```

You can also adjust:
- `BOARD_WIDTH` and `BOARD_HEIGHT` for different board sizes
- Point values for each item tier
- Number of starting items available for dropping

## Example Usage

1. Create a new game:
```bash
curl -X POST http://localhost:3000/api/game/new
```

2. Drop an item:
```bash
curl -X POST http://localhost:3000/api/game/YOUR_GAME_ID/drop \
  -H "Content-Type: application/json" \
  -d '{"column": 5, "itemId": 2}'
```

3. Check game state:
```bash
curl http://localhost:3000/api/game/YOUR_GAME_ID
```

## Response Format

### Game State Response
```json
{
  "gameState": {
    "board": [[null, null, ...], ...],
    "score": 0,
    "gameOver": false,
    "nextItem": 1
  },
  "items": [...]
}
```

### Drop Item Response
```json
{
  "success": true,
  "position": {"row": 14, "column": 5},
  "merges": [...],
  "pointsEarned": 10,
  "newScore": 25,
  "nextItem": 3,
  "gameOver": false,
  "gameState": {...}
}
```

## Architecture

- **Express.js**: Web framework for API endpoints
- **In-memory storage**: Game sessions stored in Map for simplicity
- **UUID**: Unique game session identifiers
- **CORS enabled**: Ready for frontend integration
- **Modular design**: Easy to extend with additional features

## Future Enhancements

- Database persistence for game sessions
- Player authentication and profiles
- Leaderboards and high scores
- Real-time multiplayer support
- Power-ups and special items
- Different game modes
