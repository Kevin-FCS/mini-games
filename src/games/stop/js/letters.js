const STORAGE_KEY = 'stop_selected_letters';
let lettersList = [];
export const baseLetters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","X","Z","W","Y"];

export let availableLetters = baseLetters.slice();



function setAvailableLetters(list) {
    availableLetters = list.slice();
}




export async function renderLetterCheckboxes() {
    const container = document.getElementById('letters_container');

    if (!container) return;
    availableLetters.forEach(letter => {
      const label = document.createElement('label');
      label.className = 'letter-box';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = letter;
      input.checked = true;
      input.className = 'letter-checkbox';
      label.appendChild(input);
      label.appendChild(document.createTextNode(letter));
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

function setAllLetters(checked) {
    const boxes = document.querySelectorAll('.letter-checkbox');
    boxes.forEach(b => { b.checked = !!checked; });
    saveSelectedLetters();
}

export function getSelectedLetters() {
    const selected = Array.from(document.querySelectorAll('.letter-checkbox')).filter(b => b.checked).map(b => b.value);
    if (!selected || selected.length === 0) {
      alert('Por favor seleccione pelo menos uma letra.');
    }
    return selected;
}
