function syncColorThemeFromStorage() {
  const themeSwitcherEl = document.querySelector('#theme-switcher');

  const currentTheme = window.localStorage.getItem('color-theme') ?? 'light';

  if (currentTheme === 'dark') {
    themeSwitcherEl.checked = true;
  } else if (currentTheme !== 'light') {
    themeSwitcherEl.indeterminate = true;
  }
}

function syncColorThemeToStorage() {
  const themeSwitcherEl = document.querySelector('#theme-switcher');

  const currentTheme = themeSwitcherEl.indeterminate 
    ? 'other' 
    : themeSwitcherEl.checked 
      ? 'dark' 
      : 'light';

  window.localStorage.setItem('color-theme', currentTheme);
}

function initializeColorThemeListeners() {
  const themeSwitcherEl = document.querySelector('#theme-switcher');

  themeSwitcherEl.addEventListener('change', syncColorThemeToStorage);
}

window.addEventListener('DOMContentLoaded', () => {
  syncColorThemeFromStorage();
  initializeColorThemeListeners();
}, { once: true });