// Simple test script to demonstrate the API functionality
const axios = require("axios");

const BASE_URL = "http://localhost:3000";

async function testAPI() {
  try {
    console.log("🧪 Testing Watermelon Merge Game Backend API\n");

    // Test 1: Health check
    console.log("1. Testing health check...");
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log("✅ Health check:", healthResponse.data);
    console.log();

    // Test 2: Get items configuration
    console.log("2. Getting items configuration...");
    const itemsResponse = await axios.get(`${BASE_URL}/api/items`);
    console.log(
      "✅ Items:",
      itemsResponse.data.items.slice(0, 3),
      "... (showing first 3)"
    );
    console.log();

    // Test 3: Create new game
    console.log("3. Creating new game...");
    const newGameResponse = await axios.post(`${BASE_URL}/api/game/new`);
    const gameId = newGameResponse.data.gameId;
    console.log("✅ New game created with ID:", gameId);
    console.log("   Initial score:", newGameResponse.data.gameState.score);
    console.log("   Next item:", newGameResponse.data.gameState.nextItem);
    console.log();

    // Test 4: Drop some items
    console.log("4. Dropping items...");

    // Drop item in column 5
    const drop1 = await axios.post(`${BASE_URL}/api/game/${gameId}/drop`, {
      column: 5,
      itemId: 0,
    });
    console.log("✅ Dropped item 0 in column 5");
    console.log("   Position:", drop1.data.position);
    console.log("   Points earned:", drop1.data.pointsEarned);
    console.log("   New score:", drop1.data.newScore);
    console.log();

    // Drop another item in the same column
    const drop2 = await axios.post(`${BASE_URL}/api/game/${gameId}/drop`, {
      column: 5,
      itemId: 0,
    });
    console.log("✅ Dropped another item 0 in column 5");
    console.log("   Position:", drop2.data.position);
    console.log(
      "   Merges occurred:",
      drop2.data.merges.length > 0 ? "Yes" : "No"
    );
    if (drop2.data.merges.length > 0) {
      console.log("   Merge details:", drop2.data.merges[0]);
    }
    console.log("   Points earned:", drop2.data.pointsEarned);
    console.log("   New score:", drop2.data.newScore);
    console.log();

    // Test 5: Get current game state
    console.log("5. Getting current game state...");
    const gameStateResponse = await axios.get(`${BASE_URL}/api/game/${gameId}`);
    console.log("✅ Current game state:");
    console.log("   Score:", gameStateResponse.data.gameState.score);
    console.log("   Game over:", gameStateResponse.data.gameState.gameOver);
    console.log("   Next item:", gameStateResponse.data.gameState.nextItem);

    // Show board state (non-null positions only)
    const board = gameStateResponse.data.gameState.board;
    console.log("   Board state (showing non-empty positions):");
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] !== null) {
          console.log(`     Row ${row}, Col ${col}: Item ${board[row][col]}`);
        }
      }
    }
    console.log();

    // Test 6: Try to drop more items for potential merges
    console.log("6. Testing more drops and merges...");
    for (let i = 0; i < 3; i++) {
      const dropResult = await axios.post(
        `${BASE_URL}/api/game/${gameId}/drop`,
        {
          column: Math.floor(Math.random() * 10), // Random column
          itemId: Math.floor(Math.random() * 3), // Random item 0-2
        }
      );
      console.log(
        `   Drop ${i + 1}: Column ${
          dropResult.data.position?.column || "N/A"
        }, Merges: ${dropResult.data.merges?.length || 0}, Score: ${
          dropResult.data.newScore
        }`
      );
    }
    console.log();

    // Test 7: Delete game session
    console.log("7. Cleaning up - deleting game session...");
    await axios.delete(`${BASE_URL}/api/game/${gameId}`);
    console.log("✅ Game session deleted");
    console.log();

    // Test 8: Try to access deleted game (should fail)
    console.log("8. Testing access to deleted game (should fail)...");
    try {
      await axios.get(`${BASE_URL}/api/game/${gameId}`);
      console.log("❌ Unexpected: Game still accessible");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("✅ Correctly returned 404 for deleted game");
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    console.log("\n🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("   Response status:", error.response.status);
      console.error("   Response data:", error.response.data);
    }
  }
}

// Check if axios is available, if not provide installation instructions
async function checkDependencies() {
  try {
    require("axios");
    return true;
  } catch (error) {
    console.log("❌ axios is required to run this test script.");
    console.log("   Please install it with: npm install axios");
    console.log(
      "   Or run: node -e \"console.log('Please install axios first')\""
    );
    return false;
  }
}

// Main execution
async function main() {
  const hasAxios = await checkDependencies();
  if (hasAxios) {
    console.log(
      "🚀 Make sure the server is running on port 3000 before running this test!"
    );
    console.log("   Start server with: npm start\n");

    // Wait a moment for user to read the message
    setTimeout(testAPI, 2000);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testAPI };
