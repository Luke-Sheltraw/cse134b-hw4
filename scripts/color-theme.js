const FULL_ALPHABET = 'abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const HEXCODE_ALPHABET = 'abcdef0123456789';

function loadTheme(argThemeName) {
  const themeWrapperEl = document.querySelector('#custom-theme-wrapper');
  const themeSwitcherToggleEl = document.querySelector('#theme-switcher');
  const activeThemeSelectEl = document.querySelector('#active-theme');

  const themeName = argThemeName === 'system' ? getSystemTheme() : argThemeName;

  activeThemeSelectEl.value = argThemeName;

  if (themeName === 'dark' || themeName === 'light') {
    if (themeName === 'dark') {
      themeSwitcherToggleEl.checked = true;
    } else if (themeName === 'light') {
      themeSwitcherToggleEl.checked = false;
    }

    themeWrapperEl.classList.add('hidden');
    themeSwitcherToggleEl.indeterminate = false;

    ['layout-bg-color', 'layout-accent-color', 'layout-text-color', 'font-family'].forEach(
      (attr) => {
        document.documentElement.style.removeProperty(`--${attr}`);
      }
    );
  } else {
    themeWrapperEl.classList.remove('hidden');
    themeSwitcherToggleEl.indeterminate = true;
    const themeObj = JSON.parse(window.localStorage.getItem('user-themes'))?.[themeName];

    if (!themeObj) return console.warn('Problem loading user theme');

    const activeThemeLabelEl = document.querySelector(`option[value="${themeName}"]`);
    const themeNameEl = document.querySelector('#custom-theme-name');
    const bgColorEl = document.querySelector('#layout-bg-color');
    const accentColorEl = document.querySelector('#layout-accent-color');
    const textColorEl = document.querySelector('#layout-text-color');
    const fontFamilyEl = document.querySelector('#font-family');

    activeThemeLabelEl.innerText = themeObj['custom-theme-name'];
    themeNameEl.value = themeObj['custom-theme-name'];
    bgColorEl.value = themeObj['layout-bg-color'];
    accentColorEl.value = themeObj['layout-accent-color'];
    textColorEl.value = themeObj['layout-text-color'];
    fontFamilyEl.value = themeObj['font-family'];

    ['layout-bg-color', 'layout-accent-color', 'layout-text-color', 'font-family'].forEach(
      (attr) => {
        document.documentElement.style.setProperty(`--${attr}`, themeObj[attr]);
      }
    );
  }
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function syncThemeOnToggle(e) {
  const newTheme = e.target.checked ? 'dark' : 'light';

  syncThemeToStorage(newTheme);
  loadTheme(newTheme);
}

function syncThemeToStorage(themeName) {
  if (themeName === 'system') return window.localStorage.removeItem('current-theme');

  window.localStorage.setItem('current-theme', themeName);
}

function syncThemeFromStorage() {
  const currentThemeID = window.localStorage.getItem('current-theme') ?? 'system';

  const currentUserThemes = JSON.parse(window.localStorage.getItem('user-themes')) ?? {};
  const createNewOptionEl = document.querySelector('#user-defined-themes option:last-of-type');

  Object.entries(currentUserThemes).forEach(([themeID, themeObj]) => {
    const themeOptionEl = document.createElement('option');
    themeOptionEl.value = themeID;
    themeOptionEl.innerText = themeObj['custom-theme-name'];
    createNewOptionEl.insertAdjacentElement('beforebegin', themeOptionEl);
  });

  loadTheme(currentThemeID);
}

function generateNewID() {
  return Array.from({ length: 10 })
    .map(() => FULL_ALPHABET[Math.floor(Math.random() * FULL_ALPHABET.length)])
    .join('');
}

function generateUniqueID(currentIDList) {
  let currentID;
  do {
    currentID = generateNewID();
  } while (currentIDList.includes(currentID));
  return currentID;
}

function generateHexCode() {
  return `#${Array.from({ length: 6 })
    .map(() => HEXCODE_ALPHABET[Math.floor(Math.random() * HEXCODE_ALPHABET.length)])
    .join('')}`;
}

function generateNewThemeObj() {
  return {
    'layout-bg-color': generateHexCode(),
    'layout-text-color': generateHexCode(),
    'layout-accent-color': generateHexCode(),
    'font-family': 'Roboto',
  };
}

function createNewTheme() {
  const createNewOptionEl = document.querySelector('#user-defined-themes option:last-of-type');

  const currentUserThemes = JSON.parse(window.localStorage.getItem('user-themes')) ?? {};
  const themeID = generateUniqueID(Object.keys(currentUserThemes));

  const newTheme = {
    ...generateNewThemeObj(),
    'custom-theme-name': 'Untitled theme',
  };

  const newThemeOptionEl = document.createElement('option');
  newThemeOptionEl.value = themeID;
  newThemeOptionEl.innerText = newTheme['custom-theme-name'];
  createNewOptionEl.insertAdjacentElement('beforebegin', newThemeOptionEl);

  currentUserThemes[themeID] = newTheme;
  window.localStorage.setItem('user-themes', JSON.stringify(currentUserThemes));
  syncThemeToStorage(themeID);
  loadTheme(themeID);
}

function deleteCurrentCustomTheme() {
  const userThemes = JSON.parse(window.localStorage.getItem('user-themes')) ?? {};
  const currentThemeID = document.querySelector('#active-theme').value;
  const currentThemeOptionEl = document.querySelector(`option[value="${currentThemeID}"]`);

  currentThemeOptionEl.remove();
  delete userThemes[currentThemeID];

  window.localStorage.setItem('user-themes', JSON.stringify(userThemes));

  syncThemeToStorage('system');
  loadTheme('system');
}

function syncCustomThemeFromDropdown() {
  const currentThemeID = document.querySelector('#active-theme').value;

  if (currentThemeID === 'create-new') {
    createNewTheme();
  } else {
    syncThemeToStorage(currentThemeID);
    loadTheme(currentThemeID);
  }
}

function updateCustomThemeOnChange(e) {
  const currentThemeID = document.querySelector('#active-theme').value;
  const currentUserThemes = JSON.parse(window.localStorage.getItem('user-themes'));

  currentUserThemes[currentThemeID][e.target.name] = e.target.value;
  window.localStorage.setItem('user-themes', JSON.stringify(currentUserThemes));
  loadTheme(currentThemeID);
}

function closeThemeSettingsMenuOnClickOutside(e) {
  const settingsWrapperEl = document.querySelector('#settings-wrapper');
  if (settingsWrapperEl.contains(e.target)) return;

  const settingsMenuEl = document.querySelector('dialog#settings-menu');

  settingsMenuEl.removeAttribute('open');
}

function toggleThemeSettingsMenu() {
  document.querySelector('dialog#settings-menu').toggleAttribute('open');
}

function initializeColorThemeListeners() {
  const themeSwitcherToggleEl = document.querySelector('#theme-switcher');
  const themeSettingsBtnEl = document.querySelector('#settings-button');
  const themeSwitcherDropdownEl = document.querySelector('#active-theme');
  const themeInputsWrapperEl = document.querySelector('#custom-theme-wrapper');
  const discardCustomThemeButtonEl = document.querySelector('#theme-discard-button');

  themeSwitcherToggleEl.addEventListener('change', syncThemeOnToggle);
  themeSettingsBtnEl.addEventListener('click', toggleThemeSettingsMenu);
  document.addEventListener('click', closeThemeSettingsMenuOnClickOutside);
  themeSwitcherDropdownEl.addEventListener('change', syncCustomThemeFromDropdown);
  themeInputsWrapperEl.addEventListener('input', updateCustomThemeOnChange);
  discardCustomThemeButtonEl.addEventListener('click', deleteCurrentCustomTheme);
}

window.addEventListener(
  'DOMContentLoaded',
  () => {
    syncThemeFromStorage();
    initializeColorThemeListeners();
  },
  { once: true }
);
