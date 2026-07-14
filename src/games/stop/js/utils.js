/**
 * chooseRandom
 * Returns a random element from `arr`.
 * Simple helper to avoid repeating Math.random logic in several places.
 * @param {Array} arr - array to pick from
 * @returns {*} a random element from arr
 */
export function chooseRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}