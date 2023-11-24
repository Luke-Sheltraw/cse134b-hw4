const REGEX_PATTERN_BY_NAME = {
  'sender_name': /^[A-Za-z'-\s]*$/,
  'sender_address': /^[A-Za-z0-9_\.@]*$/,
  'sender_comments': /^[A-Za-z0-9\s\.,!?'";()]*$/,
};

const form_errors = [];
const lastValidInputByName = {};

function validateInputFieldOnChange(e) {
  const inputFieldEl = e.target;
  const inputFieldWrapperEl = inputFieldEl.parentNode;

  if (!inputFieldEl.checkValidity()) {
    inputFieldEl.setCustomValidity(''); // TODO: finish this
  }
}

function maskInputFieldOnEvent(e) {
  const inputFieldEl = e.target;
  const inputFieldWrapperEl = inputFieldEl.parentNode;
  const errorOutputEl = inputFieldWrapperEl.querySelector('.hw4__contactOutput__error');
  
  const inputFieldName = inputFieldEl.name;
  const inputFieldRegex = REGEX_PATTERN_BY_NAME[inputFieldName];

  if (inputFieldEl.value.match(inputFieldRegex)) {
    lastValidInputByName[inputFieldName] = inputFieldEl.value;
    inputFieldEl.classList.remove('invalid-accent');
    if (errorOutputEl.classList.contains('no-opacity')) return;
    errorOutputEl.classList.add('no-opacity');
    errorOutputEl.addEventListener('transitionend', () => {
      errorOutputEl.classList.add('no-visibility');
    }, { once: true });
  } else {
    inputFieldEl.value = lastValidInputByName[inputFieldName] ?? '';
    inputFieldEl.classList.add('invalid-accent');
    errorOutputEl.classList.remove('no-visibility');
    errorOutputEl.classList.remove('no-opacity');
  }
}

function initializeFieldValidation() {
  const inputFieldWrapperEls = document.querySelectorAll('form-field');

  inputFieldWrapperEls.forEach((inputFieldWrapperEl) => {
    inputFieldWrapperEl.addEventListener('change', validateInputFieldOnChange);
    inputFieldWrapperEl.addEventListener('input', maskInputFieldOnEvent);
    inputFieldWrapperEl.addEventListener('focusout', maskInputFieldOnEvent);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initializeFieldValidation();
}, { once: true });
