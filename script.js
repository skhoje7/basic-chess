// Basic puzzle trainer using chess.js + chessboard-element
let game = new Chess();
let boardEl = null;
let puzzles = [];
let currentIndex = 0;

// Load puzzles
async function loadPuzzles() {
  const res = await fetch('puzzles.json');
  puzzles = await res.json();
  currentIndex = 0;
  loadPuzzle(currentIndex);
}

// Setup board + UI
function setupBoard(initialFen) {
  boardEl = document.getElementById('board');
  boardEl.setAttribute('position', initialFen);
  boardEl.addEventListener('drag-start', onDragStart);
  boardEl.addEventListener('drop', onDrop);
  boardEl.addEventListener('snap-end', onSnapEnd);
}

function onDragStart(e) {
  // Block dragging the wrong color
  const p = puzzles[currentIndex];
  const piece = e.detail.piece;
  const isWhite = piece[0] === 'w';
  if ((p.sideToMove === 'w' && !isWhite) || (p.sideToMove === 'b' && isWhite)) {
    e.preventDefault();
    return;
  }
  // Block if game over
  if (game.game_over()) e.preventDefault();
}

function onDrop(e) {
  const {source, target} = e.detail;

  // Try move
  const move = game.move({from: source, to: target, promotion: 'q'});
  if (move == null) {
    // illegal
    return e.preventDefault();
  }

  // Check against solution
  checkMove(move);
}

function onSnapEnd() {
  boardEl.setAttribute('position', game.fen());
}

function setStatus(text) {
  document.getElementById('status').textContent = text;
}

function setSolutionText() {
  const sol = puzzles[currentIndex].bestLineSAN.join(' → ');
  document.getElementById('solutionText').textContent = sol;
}

function loadPuzzle(i) {
  const p = puzzles[i];
  game = new Chess(p.fen);
  setupBoard(p.fen);
  setStatus(`${p.title} | Puzzle ${i+1}/${puzzles.length} | ${p.sideToMove === 'w' ? 'White' : 'Black'} to move`);
  setSolutionText();
}

function resetPuzzle() {
  loadPuzzle(currentIndex);
}

function nextPuzzle() {
  currentIndex = (currentIndex + 1) % puzzles.length;
  loadPuzzle(currentIndex);
}

function prevPuzzle() {
  currentIndex = (currentIndex - 1 + puzzles.length) % puzzles.length;
  loadPuzzle(currentIndex);
}

function showHint() {
  alert(puzzles[currentIndex].hint || 'Try checks, captures, threats!');
}

function sanEquals(a, b) {
  // Basic normalize: remove trailing +/# and x
  const clean = s => s.replace(/[+#]/g,'').replace('x','');
  return clean(a) === clean(b);
}

let stepIndex = 0;

function checkMove(userMove) {
  const p = puzzles[currentIndex];
  const solution = p.bestLineSAN;

  // If starting a new puzzle or after reset:
  if (stepIndex >= solution.length) stepIndex = 0;

  // Expected move at this step (by player to move)
  const expected = solution[stepIndex];

  if (!sanEquals(userMove.san, expected)) {
    // Wrong move → undo and notify
    game.undo();
    setTimeout(() => {
      boardEl.setAttribute('position', game.fen());
      alert('❌ Not the best move. Try again or use a hint!');
    }, 80);
    return;
  }

  // Correct move by the user
  stepIndex++;

  // If there’s a reply in the line, let the engine “play” it (we’ll just push the next SAN)
  if (stepIndex < solution.length) {
    // Next move in line belongs to the opponent
    const replySan = solution[stepIndex];
    const reply = game.move(replySan);
    if (reply) {
      stepIndex++;
      boardEl.setAttribute('position', game.fen());
    }
  }

  if (stepIndex >= solution.length) {
    setStatus('✅ Puzzle solved! Great job.');
    alert('🎉 Correct!');
    stepIndex = 0;
  } else {
    setStatus(`Good! Keep going… (${stepIndex}/${solution.length})`);
  }
}

// Hook up buttons
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('nextBtn').addEventListener('click', nextPuzzle);
  document.getElementById('prevBtn').addEventListener('click', prevPuzzle);
  document.getElementById('resetBtn').addEventListener('click', resetPuzzle);
  document.getElementById('hintBtn').addEventListener('click', showHint);
  loadPuzzles();
});
