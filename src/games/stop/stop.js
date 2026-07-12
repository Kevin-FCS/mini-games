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

(function () {
  const baseLetters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","X","Z","W","Y"];
  let categories = [];
  const STORAGE_KEY = 'stop_selected_letters';
  const roundsInput = document.getElementById('rounds');
  const secondsInput = document.getElementById('seconds');
  const startBtn = document.getElementById('start');
  const countdownDiv = document.getElementById('countdown');
  const gameDiv = document.getElementById('game');
  const gameLabel = document.getElementById('game_label');
  const resultsDiv = document.getElementById('results');

  let lettersList = [];
  let categoriesList = [];
  let lastCategory = null;
  let availableLetters = baseLetters.slice();

  /**
   * chooseRandom
   * Returns a random element from `arr`.
   * Simple helper to avoid repeating Math.random logic in several places.
   * @param {Array} arr - array to pick from
   * @returns {*} a random element from arr
   */
  function chooseRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // Load categories from stop.json (fallback to defaults) and render checkboxes
  loadCategories().then(loaded => {
    categories = loaded;
  }).catch(() => {
    categories = ["Animais","Países","Comidas","Cores"];
  });

  // Render letter and category checkboxes
  document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('letters_container');
    if (!container) return;
    baseLetters.forEach(l => {
      const label = document.createElement('label');
      label.className = 'letter-box';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = l;
      input.checked = true;
      input.className = 'letter-checkbox';
      label.appendChild(input);
      label.appendChild(document.createTextNode(l));
      container.appendChild(label);
      // save on change: persist the user's selection immediately so it survives reloads
      input.addEventListener('change', () => saveSelectedLetters());
    });

    const selectAllBtn = document.getElementById('select_all_letters');
    const clearBtn = document.getElementById('clear_letters');
    if (selectAllBtn) selectAllBtn.addEventListener('click', () => setAllLetters(true));
    if (clearBtn) clearBtn.addEventListener('click', () => setAllLetters(false));

    // apply saved selection (if present)
    const saved = loadSavedLetters();
    if (saved && Array.isArray(saved) && saved.length > 0) {
      // set checkboxes according to saved list
      document.querySelectorAll('.letter-checkbox').forEach(cb => { cb.checked = saved.includes(cb.value); });
    }

    // render category checkboxes from categories.js module
    await renderCategoryCheckboxes();
  });

  function setAllLetters(checked) {
    const boxes = document.querySelectorAll('.letter-checkbox');
    boxes.forEach(b => { b.checked = !!checked; });
    saveSelectedLetters();
  }

  function saveSelectedLetters() {
    try {
      const checked = Array.from(document.querySelectorAll('.letter-checkbox')).filter(b => b.checked).map(b => b.value);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch (e) {
      // silently ignore localStorage errors (e.g., privacy mode)
    }
  }

  function loadSavedLetters() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // ignore
    }
    return null;
  }

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

    // determine available letters based on checkboxes
    const checked = Array.from(document.querySelectorAll('.letter-checkbox')).filter(b => b.checked).map(b => b.value);
    if (!checked || checked.length === 0) {
      alert('Por favor seleccione pelo menos uma letra.');
      return;
    }
    availableLetters = checked.slice();

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
        startRounds(rounds, seconds);
      }
    }, 1000);
  }

  /**
   * startRounds
   * Schedule each round with a one-shot `setTimeout`. This design avoids
   * maintaining an explicit interval counter and simplifies cancellation or
   * rescheduling (if needed in the future).
   * @param {number} rounds - number of rounds to run
   * @param {number} seconds - seconds per round
   */
  function startRounds(rounds, seconds) {
    // schedule each round
    for (let i = 1; i <= rounds; i++) {
      setTimeout(() => showRound(i), (i - 1) * seconds * 1000);
    }
    // schedule game over
    setTimeout(() => gameOver(rounds), rounds * seconds * 1000);
  }

  /**
   * showRound
   * Pick a random letter and a non-repeating category and display them.
   * The picked values are appended to `lettersList`/`categoriesList` for later
   * result display.
   * Uses getSelectedCategories() to get the user's category selection.
   * @param {number} round - 1-based round index
   */
  function showRound(round) {
    const letter = chooseRandom(availableLetters);

    // choose a category from the user's selected categories
    const selectedCategories = getSelectedCategories();
    const categoriesToUse = selectedCategories.length ? selectedCategories : categories.length ? categories : ["Animais","Países","Comidas","Cores"];
    let category;
    do {
      category = chooseRandom(categoriesToUse);
    } while (category === lastCategory);
    lastCategory = category;

    lettersList.push(letter);
    categoriesList.push(category);
    gameLabel.innerHTML = `Ronda ${round}\n\nLetra: ${letter}\nCategoria: ${category}`;
  }

  /**
   * gameOver
   * End-of-game handler: show a button that lets players view the collected
   * per-round selections. Kept intentionally simple to allow players to
   * manually count points among themselves.
   */
  function gameOver(rounds) {
    gameLabel.textContent = 'Fim do jogo!';
    const btn = document.createElement('button');
    btn.textContent = 'Contar pontos';
    btn.addEventListener('click', () => displayResults(rounds));
    gameDiv.appendChild(btn);
  }

  /**
   * displayResults
   * Show the per-round cards using the previously stored picks. We remove
   * the "Contar pontos" button first (if present) to avoid duplicate UI.
   * @param {number} rounds - number of rounds played
   */
  function displayResults(rounds) {
    // remove any Contar pontos button
    const btn = Array.from(gameDiv.getElementsByTagName('button')).find(b => b.textContent === 'Contar pontos');
    if (btn) btn.remove();
    gameLabel.textContent = 'A contar pontos...';

    // show cards with per-round info
    resultsDiv.innerHTML = '';
    for (let i = 0; i < rounds; i++) {
      const card = document.createElement('div');
      card.className = 'round-card';
      const r = i + 1;
      card.innerHTML = `<strong>Ronda ${r}</strong><br>Letra: ${lettersList[i] || '-'}<br>Categoria: ${categoriesList[i] || '-'} `;
      resultsDiv.appendChild(card);
    }

    // add play again button
    const again = document.createElement('div');
    again.style.marginTop = '16px';
    const againBtn = document.createElement('button');
    againBtn.textContent = 'Jogar novamente';
    againBtn.addEventListener('click', resetToSetup);
    again.appendChild(againBtn);
    resultsDiv.appendChild(again);
  }

  /**
   * resetToSetup
   * Return to the setup view while preserving the user's persisted letter
   * selection. This keeps the UX smooth when they want to play multiple
   * games with the same preferences.
   */
  function resetToSetup() {
    resultsDiv.innerHTML = '';
    gameLabel.textContent = '';
    gameDiv.style.display = 'none';
    document.getElementById('setup').style.display = 'block';
  }

})();
