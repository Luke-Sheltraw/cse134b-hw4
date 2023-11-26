function syncColorThemeFromStorage() {
  const themeSwitcherEl = document.querySelector('#theme-switcher');

  const currentTheme = window.localStorage.getItem('color-theme') ?? (
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' 
      : 'light'
  );

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

function toggleThemeSettingsMenu() {
  const themeSettingsMenuEl = document.querySelector('dialog#settings-menu');

  if (themeSettingsMenuEl.hasAttribute('open')) {
    themeSettingsMenuEl.removeAttribute('open');
  } else {
    themeSettingsMenuEl.setAttribute('open', '');
  }
}

function initializeColorThemeListeners() {
  const themeSwitcherEl = document.querySelector('#theme-switcher');
  const themeSettingsBtnEl = document.querySelector('#settings-button');

  themeSwitcherEl.addEventListener('change', syncColorThemeToStorage);
  themeSettingsBtnEl.addEventListener('click', toggleThemeSettingsMenu);
}

window.addEventListener('DOMContentLoaded', () => {
  syncColorThemeFromStorage();
  initializeColorThemeListeners();
}, { once: true });