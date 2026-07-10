export const baseLetters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","X","Z","W","Y"];

export let availableLetters = baseLetters.slice();

export function setAvailableLetters(list) {
    availableLetters = list.slice();
}
