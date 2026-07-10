import { loadCategories } from './categories.js';
import { setupUI, runGame } from './ui.js';

setupUI();

document.getElementById('start').addEventListener('click', async () => {
    const rounds = parseInt(document.getElementById('rounds').value, 10);
    const seconds = parseInt(document.getElementById('seconds').value, 10);

    const categories = await loadCategories();

    document.getElementById('setup').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    runGame(categories, rounds, seconds);
});
