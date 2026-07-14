/*
  stop.js
  --------
  Implements the Stop (letras aleatórias) game UI logic.

  Responsibilities:
  - Render letter selection checkboxes so the user can exclude letters before starting
  - Load categories from `stop.json` (with a sensible fallback)
  - Persist the user's selected letters in `localStorage`
  - Run a 3-second countdown, then schedule round updates at the configured interval
  - Avoid repeating the same category on consecutive rounds
  - Show results (letter + category per round) and allow replay
  - Manage category selection via categories.js module

  Implementation notes / rationale:
  - Uses `DOMContentLoaded` to render and wire the checkbox UI so the script can be placed
    at the end of the HTML without relying on `defer`.
  - Round scheduling uses `setTimeout` for simplicity (one-shot timers); this keeps the
    UI responsive and is easy to reason about when showing per-round content.
  - `localStorage` operations are wrapped in try/catch because some browsers or privacy
    modes disallow storage; failure should not break the game.
  - `availableLetters` keeps the current pool of letters; this is computed from the
    checkboxes when starting a new game so users can change selections between games.
  - Category selection is delegated to categories.js module to keep stop.js focused.
*/

import { loadCategories, renderCategoryCheckboxes, getSelectedCategories } from './js/categories.js';
import { renderLetterCheckboxes, getSelectedLetters } from './js/letters.js';
import { startRounds } from './js/game.js';

(function gameLogic() {
  const roundsInput = document.getElementById('rounds');
  const secondsInput = document.getElementById('seconds');
  const startBtn = document.getElementById('start');
  const countdownDiv = document.getElementById('countdown');
  const gameDiv = document.getElementById('game');
  const resultsDiv = document.getElementById('results');
  let lettersList = [];
  let categoriesList = [];

  renderLetterCheckboxes();
  renderCategoryCheckboxes();

  startBtn.addEventListener('click', startGame);

  /**
   * startGame
   * Validate inputs, compute `availableLetters` from the checkboxes, clear
   * previous state and run a short countdown before starting the rounds.
   * Why: separating selection gathering from the scheduling keeps the
   * game-start path deterministic and easy to test.
   */
  function startGame() {
    const rounds = parseInt(roundsInput.value, 10);
    const seconds = parseInt(secondsInput.value, 10);
    if (!Number.isInteger(rounds) || rounds < 1 || !Number.isInteger(seconds) || seconds < 1) {
      alert('Por favor introduza valores válidos para rondas e segundos.');
      return;
    }

    const selectedLetters = getSelectedLetters();
    const selectedCategories = getSelectedCategories();
    lettersList = [];
    categoriesList = [];

    resultsDiv.innerHTML = '';

    // hide setup, show game
    document.getElementById('setup').style.display = 'none';
    gameDiv.style.display = 'block';

    // 3-second countdown
    let count = 3;
    countdownDiv.textContent = `A começar jogo em ${count}`;
    const cInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        countdownDiv.textContent = `A começar jogo em ${count}`;
      } else {
        clearInterval(cInterval);
        countdownDiv.textContent = '';
        startRounds(rounds, seconds, selectedLetters, selectedCategories, lettersList, categoriesList);
      }
    }, 1000);

  }


})();
