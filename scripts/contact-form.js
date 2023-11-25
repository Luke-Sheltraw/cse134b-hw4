const REGEX_PATTERN_BY_NAME = {
  'sender_name': /^[A-Za-z'-\s]*$/,
  'sender_address': /^[A-Za-z0-9_\.@]*$/,
  'sender_comments': /^[-A-Za-z0-9\s\.,!?'";:\–\—()$%&]*$/,
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

  if (inputFieldEl.value.match(inputFieldRegex)) { /* valid input */
    lastValidInputByName[inputFieldName] = inputFieldEl.value;
    inputFieldEl.classList.remove('invalid-accent');
    if (!errorOutputEl.classList.contains('no-opacity')) {
      errorOutputEl.classList.add('no-opacity');
      errorOutputEl.addEventListener('transitionend', () => {
        errorOutputEl.classList.add('no-visibility');
      }, { once: true });
    }
  } else { /* invalid input */
    form_errors.push({
      error_type: 'invalid characters',
      input_field: inputFieldName,
      last_input: inputFieldEl.value,
      timestamp: new Date().toISOString(),
    });
    inputFieldEl.value = lastValidInputByName[inputFieldName] ?? '';
    inputFieldEl.classList.add('invalid-accent');
    errorOutputEl.classList.remove('no-visibility');
    errorOutputEl.classList.remove('no-opacity');
  }

  if (inputFieldWrapperEl.classList.contains('count-characters'))
    updateCharacterCountForFormField(inputFieldWrapperEl);
}

function initializeCharacterCounts() {
  const characterCountFormFieldEls = document.querySelectorAll('.count-characters');

  characterCountFormFieldEls.forEach((characterCountFormFieldEl) => {
    const inputFieldEl = characterCountFormFieldEl.querySelector('input, textarea');
    const infoMsgEl = characterCountFormFieldEl.querySelector('.hw4__contactOutput__info');

    infoMsgEl.innerText = `0 / ${ inputFieldEl.maxLength >= 0 ? inputFieldEl.maxLength : '1000' }`;
  });
}

function updateCharacterCountForFormField(formFieldEl) {
  const inputFieldEl = formFieldEl.querySelector('input, textarea');
  const infoMsgEl = formFieldEl.querySelector('.hw4__contactOutput__info');

  infoMsgEl.innerText = `${ inputFieldEl.value.length } / ${ inputFieldEl.maxLength >= 0 ? inputFieldEl.maxLength : '1250' }`;
}

function attachValidationErrorsOnSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  formData.append('form_errors', JSON.stringify(form_errors));

  fetch('https://httpbin.org/post', {
    method: 'POST',
    body: formData,
  }).then(console.log);
}

function initializeFieldValidation() {
  const inputFieldWrapperEls = document.querySelectorAll('form-field');
  const formEl = document.querySelector('#contact_wrapper');

  inputFieldWrapperEls.forEach((inputFieldWrapperEl) => {
    inputFieldWrapperEl.addEventListener('change', validateInputFieldOnChange);
    inputFieldWrapperEl.addEventListener('input', maskInputFieldOnEvent);
    inputFieldWrapperEl.addEventListener('focusout', maskInputFieldOnEvent);
  });

  formEl.addEventListener('submit', attachValidationErrorsOnSubmit);
}

document.addEventListener('DOMContentLoaded', () => {
  initializeCharacterCounts();
  initializeFieldValidation();
}, { once: true });