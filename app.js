// Basic sanity check so we know JS is running:
console.log("app.js loaded");

// Wait until DOM is parsed (defer handles order, but be explicit)
document.addEventListener("DOMContentLoaded", function () {
  // Ensure Chessboard global exists
  if (typeof window.Chessboard !== "function") {
    console.error("Chessboard library not loaded.");
    // Visual fallback so you know it's this issue:
    const b = document.getElementById("board");
    if (b) b.textContent = "Could not load Chessboard library.";
    return;
  }

  // Create the board
  const board = Chessboard("board", { position: "start" });

  // Keep it responsive
  window.addEventListener("resize", () => board.resize());
});
