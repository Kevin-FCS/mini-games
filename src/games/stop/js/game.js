import { chooseRandom } from './utils.js';

/// Global variables to store per-round selections
const gameLabel = document.getElementById('game_label');
const gameDiv = document.getElementById('game');
const resultsDiv = document.getElementById('results');
let lastCategory = null;

/**
 * startRounds
 * Schedule each round with a one-shot `setTimeout`. This design avoids
 * maintaining an explicit interval counter and simplifies cancellation or
 * rescheduling (if needed in the future).
 * @param {number} rounds - number of rounds to run
 * @param {number} seconds - seconds per round
 */
export function startRounds(rounds, seconds, selectedLetters, selectedCategories, lettersList, categoriesList) {
    // schedule each round
    for (let i = 1; i <= rounds; i++) {
        setTimeout(() => showRound(i, selectedLetters, selectedCategories, lettersList, categoriesList), (i - 1) * seconds * 1000);
    }
    // schedule game over
    setTimeout(() => gameOver(rounds, lettersList, categoriesList), rounds * seconds * 1000);
}

/**
 * showRound
 * Pick a random letter and a non-repeating category and display them.
 * The picked values are appended to `lettersList`/`categoriesList` for later
 * result display.
 * Uses getSelectedCategories() to get the user's category selection.
 * @param {number} round - 1-based round index
 * @param {Array} selectedLetters - array of selected letters
 */
function showRound(round, selectedLetters, selectedCategories, lettersList, categoriesList) {
    const letter = chooseRandom(selectedLetters);

    // choose a category from the user's selected categories
    
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
function gameOver(rounds, lettersList, categoriesList) {
    gameLabel.textContent = 'Fim do jogo!';
    const btn = document.createElement('button');
    btn.textContent = 'Contar pontos';
    btn.addEventListener('click', () => displayResults(rounds, lettersList, categoriesList));
    gameDiv.appendChild(btn);
}

/**
 * displayResults
 * Show the per-round cards using the previously stored picks. We remove
 * the "Contar pontos" button first (if present) to avoid duplicate UI.
 * @param {number} rounds - number of rounds played
 */
function displayResults(rounds, lettersList, categoriesList) {
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