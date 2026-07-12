const CATEGORIES_STORAGE_KEY = 'stop_selected_categories';
let loadedCategories = [];

/**
 * loadCategories
 * Fetches categories from stop.json with fallback to defaults
 * @returns {Promise<Array>} array of category names
 */
export async function loadCategories() {
    try {
        const r = await fetch('stop.json');
        const data = await r.json();
        if (data && Array.isArray(data.categories)) {
            loadedCategories = data.categories;
            return data.categories;
        }
    } catch {}
    loadedCategories = ["Animais","Países","Comidas","Cores"];
    return loadedCategories;
}

/**
 * renderCategoryCheckboxes
 * Renders category checkboxes into #categories_container
 * Call this after loadCategories has completed
 */
export async function renderCategoryCheckboxes() {
    const categories = loadedCategories.length ? loadedCategories : await loadCategories();
    const container = document.getElementById('categories_container');
    if (!container) return;

    container.innerHTML = '';
    categories.forEach(category => {
        const label = document.createElement('label');
        label.className = 'category-box';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = category;
        input.checked = true;
        input.className = 'category-checkbox';
        label.appendChild(input);
        label.appendChild(document.createTextNode(category));
        container.appendChild(label);
        // save on change
        input.addEventListener('change', () => saveSelectedCategories());
    });

    // apply saved selection if present
    const saved = loadSavedCategories();
    if (saved && Array.isArray(saved) && saved.length > 0) {
        document.querySelectorAll('.category-checkbox').forEach(cb => {
            cb.checked = saved.includes(cb.value);
        });
    }

    // wire up control buttons
    const selectAllBtn = document.getElementById('select_all_categories');
    const clearBtn = document.getElementById('clear_categories');
    if (selectAllBtn) selectAllBtn.addEventListener('click', () => setAllCategories(true));
    if (clearBtn) clearBtn.addEventListener('click', () => setAllCategories(false));
}

/**
 * setAllCategories
 * Check or uncheck all category checkboxes
 * @param {boolean} checked - whether to check or uncheck
 */
function setAllCategories(checked) {
    const boxes = document.querySelectorAll('.category-checkbox');
    boxes.forEach(b => { b.checked = !!checked; });
    saveSelectedCategories();
}

/**
 * saveSelectedCategories
 * Persist selected categories to localStorage
 */
function saveSelectedCategories() {
    try {
        const checked = Array.from(document.querySelectorAll('.category-checkbox'))
            .filter(b => b.checked)
            .map(b => b.value);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(checked));
    } catch (e) {
        // silently ignore localStorage errors (e.g., privacy mode)
    }
}

/**
 * loadSavedCategories
 * Retrieve selected categories from localStorage
 * @returns {Array|null} array of saved category names or null
 */
function loadSavedCategories() {
    try {
        const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
    } catch (e) {
        // ignore
    }
    return null;
}

/**
 * getSelectedCategories
 * Get the currently selected categories from checkboxes
 * @returns {Array} array of selected category names
 */
export function getSelectedCategories() {
    const checked = Array.from(document.querySelectorAll('.category-checkbox'))
        .filter(b => b.checked)
        .map(b => b.value);
    return checked.length ? checked : loadedCategories;
}

