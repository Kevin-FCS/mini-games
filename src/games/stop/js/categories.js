export async function loadCategories() {
    try {
        const r = await fetch('stop.json');
        const data = await r.json();
        if (data && Array.isArray(data.categories)) return data.categories;
    } catch {}
    return ["Animais","Países","Comidas","Cores"];
}
