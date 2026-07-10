import { chooseRandom } from './utils.js';
import { availableLetters } from './letters.js';

let lastCategory = null;

export function pickRound(categories) {
    const letter = chooseRandom(availableLetters);

    let category;
    do {
        category = chooseRandom(categories);
    } while (category === lastCategory);

    lastCategory = category;

    return { letter, category };
}
