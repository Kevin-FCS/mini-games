import { baseLetters, setAvailableLetters } from './letters.js';
import { saveLetters, loadLetters } from './storage.js';
import { pickRound } from './game.js';

export function setupUI() {
    const container = document.getElementById('letters_container');

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

        input.addEventListener('change', updateLetters);
    });

    const saved = loadLetters();
    if (saved) {
        document.querySelectorAll('.letter-checkbox').forEach(cb => {
            cb.checked = saved.includes(cb.value);
        });
        setAvailableLetters(saved);
    }
}

function updateLetters() {
    const checked = Array.from(document.querySelectorAll('.letter-checkbox'))
        .filter(b => b.checked)
        .map(b => b.value);

    saveLetters(checked);
    setAvailableLetters(checked);
}

export function runGame(categories, rounds, seconds) {
    const gameLabel = document.getElementById('game_label');
    const resultsDiv = document.getElementById('results');

    let lettersList = [];
    let categoriesList = [];

    for (let i = 0; i < rounds; i++) {
        setTimeout(() => {
            const { letter, category } = pickRound(categories);
            lettersList.push(letter);
            categoriesList.push(category);

            gameLabel.innerHTML = `Ronda ${i+1}\n\nLetra: ${letter}\nCategoria: ${category}`;
        }, i * seconds * 1000);
    }

    setTimeout(() => {
        gameLabel.textContent = 'Fim do jogo!';
        showResults(lettersList, categoriesList);
    }, rounds * seconds * 1000);
}

function showResults(letters, categories) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    letters.forEach((letter, i) => {
        const card = document.createElement('div');
        card.className = 'round-card';
        card.innerHTML = `<strong>Ronda ${i+1}</strong><br>Letra: ${letter}<br>Categoria: ${categories[i]}`;
        resultsDiv.appendChild(card);
    });

    // add play again button
    const again = document.createElement('div');
    again.style.marginTop = '16px';
    const againBtn = document.createElement('button');
    againBtn.textContent = 'Jogar novamente';
    againBtn.addEventListener('click', () => resetToSetup(resultsDiv, gameLabel, gameDiv));
    again.appendChild(againBtn);
    resultsDiv.appendChild(again);

}

/**
 * resetToSetup
 * Return to the setup view while preserving the user's persisted letter
 * selection. This keeps the UX smooth when they want to play multiple
 * games with the same preferences.
 */
function resetToSetup(resultsDiv, gameLabel, gameDiv) {
resultsDiv.innerHTML = '';
gameLabel.textContent = '';
gameDiv.style.display = 'none';
document.getElementById('setup').style.display = 'block';
}
