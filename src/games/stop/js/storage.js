const KEY = 'stop_selected_letters';

export function saveLetters(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
}

export function loadLetters() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || null;
    } catch {
        return null;
    }
}
