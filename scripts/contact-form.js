const REGEX_PATTERN_BY_NAME = {
  sender_name: /^[A-Za-z'\s\-]*$/,
  sender_address: /^[\w\.@\-]*$/,
  sender_comments: /^[\w\s\.,!?'";:\(\)\$%\&\-]*$/,
};

const DESCRIPTOR_BY_NAME = {
  sender_name: 'a name',
  sender_address: 'an email address',
  sender_comments: 'a comment',
};

const form_errors = [];
const lastValidInputByName = {};

function convertValidityStateToListOfInvalids(validityState) {
  const invalidChecks = [];
  for (const key in validityState) {
    if (key === 'customError' || key === 'valid') continue;
    if (validityState[key]) invalidChecks.push(key);
  }
  return invalidChecks.join(', ');
}

function displayErrorMessage(inputFieldWrapperEl, messageText) {
  const inputFieldEl = inputFieldWrapperEl.querySelector('input, textarea');
  const errorOutputEl = inputFieldWrapperEl.querySelector('.hw4__contactOutput__error');

  errorOutputEl.innerText = messageText ?? 'Please enter a valid input';

  inputFieldEl.classList.add('invalid-accent');
  errorOutputEl.classList.remove('no-visibility');
  errorOutputEl.classList.remove('no-opacity');
}

function clearErrorMessage(inputFieldWrapperEl) {
  const inputFieldEl = inputFieldWrapperEl.querySelector('input, textarea');
  const errorOutputEl = inputFieldWrapperEl.querySelector('.hw4__contactOutput__error');

  inputFieldEl.classList.remove('invalid-accent');
  if (!errorOutputEl.classList.contains('no-opacity')) {
    errorOutputEl.classList.add('no-opacity');
    errorOutputEl.addEventListener(
      'transitionend',
      () => {
        errorOutputEl.classList.add('no-visibility');
      },
      { once: true }
    );
  }
}

function validateInputFieldOnEvent(e) {
  validateInputField(e.currentTarget);
}

function validateInputField(inputFieldWrapperEl) {
  const inputFieldEl = inputFieldWrapperEl.querySelector('input, textarea');
  const targetDescriptor = DESCRIPTOR_BY_NAME[inputFieldEl.name] ?? 'a valid input';

  inputFieldEl.setCustomValidity('');

  if (inputFieldEl.checkValidity()) {
    clearErrorMessage(inputFieldWrapperEl);
    return true;
  }

  let errorMessageText = `Please enter ${targetDescriptor}`;

  if (inputFieldEl.validity.tooLong) {
    errorMessageText = `That's a lot of writing! Usually ${targetDescriptor} isn't that long`;
  } else if (inputFieldEl.validity.tooShort) {
    errorMessageText = `I think ${targetDescriptor} is a bit longer than that`;
  } else if (
    inputFieldEl.validity.typeMismatch ||
    inputFieldEl.validity.patternMismatch ||
    inputFieldEl.validity.badInput
  ) {
    errorMessageText = `That doesn't look like ${targetDescriptor} to me...`;
  } else if (inputFieldEl.validity.valueMissing) {
    errorMessageText = `Um, I sort of need ${targetDescriptor} from you`;
  }

  displayErrorMessage(inputFieldWrapperEl, errorMessageText);

  form_errors.push({
    error_type: convertValidityStateToListOfInvalids(inputFieldEl.validity),
    input_field: inputFieldEl.name,
    last_input: inputFieldEl.value,
    timestamp: new Date().toISOString(),
  });

  return false;
}

function maskInputFieldOnEvent(e) {
  const inputFieldEl = e.target;
  const inputFieldWrapperEl = e.currentTarget;

  const inputFieldName = inputFieldEl.name;
  const inputFieldRegex = REGEX_PATTERN_BY_NAME[inputFieldName];

  if (inputFieldEl.value.match(inputFieldRegex)) {
    /* valid input */
    lastValidInputByName[inputFieldName] = inputFieldEl.value;
    clearErrorMessage(inputFieldWrapperEl);
  } else {
    /* invalid input */
    inputFieldEl.value = lastValidInputByName[inputFieldName] ?? '';
    displayErrorMessage(inputFieldWrapperEl, 'Please enter valid characters only');

    form_errors.push({
      error_type: 'invalid characters',
      input_field: inputFieldName,
      last_input: inputFieldEl.value,
      timestamp: new Date().toISOString(),
    });
  }

  if (inputFieldWrapperEl.classList.contains('count-characters'))
    updateCharacterCountForFormField(inputFieldWrapperEl);
}

function initializeCharacterCounts() {
  const characterCountFormFieldEls = document.querySelectorAll('.count-characters');

  characterCountFormFieldEls.forEach((characterCountFormFieldEl) => {
    const inputFieldEl = characterCountFormFieldEl.querySelector('input, textarea');
    const infoMsgEl = characterCountFormFieldEl.querySelector('.hw4__contactOutput__info');

    infoMsgEl.innerText = `0 / ${inputFieldEl.maxLength >= 0 ? inputFieldEl.maxLength : '1000'}`;
  });
}

function updateCharacterCountForFormField(formFieldEl) {
  const inputFieldEl = formFieldEl.querySelector('input, textarea');
  const infoMsgEl = formFieldEl.querySelector('.hw4__contactOutput__info');

  infoMsgEl.innerText = `${inputFieldEl.value.length} / ${
    inputFieldEl.maxLength >= 0 ? inputFieldEl.maxLength : '1250'
  }`;
}

function checkFormSubmissionOnAttemptedSubmit(e) {
  e.preventDefault();

  const inputFieldWrapperEls = e.target.querySelectorAll('form-field');

  if (
    [...inputFieldWrapperEls]
      .map((inputFieldWrapperEl) => validateInputField(inputFieldWrapperEl))
      .every((t) => t)
  ) {
    attachValidationErrorsOnSubmit(e);
  }
}

async function attachValidationErrorsOnSubmit(e) {
  const submitButtonEl = e.target.querySelector('button');
  submitButtonEl.disabled = true;

  const formData = new FormData(e.target);
  formData.append('form_errors', JSON.stringify(form_errors));

  await fetch('https://httpbin.org/post', {
    method: 'POST',
    body: formData,
  });

  const displayNameEl = document.querySelector('#display-name');
  const nameInputEl = document.querySelector('#sender_name');
  displayNameEl.innerText = nameInputEl.value;
  e.target.classList.add('filled-out');
}

function initializeFieldValidation() {
  const inputFieldWrapperEls = document.querySelectorAll('form-field');

  inputFieldWrapperEls.forEach((inputFieldWrapperEl) => {
    inputFieldWrapperEl.addEventListener('change', validateInputFieldOnEvent);
    inputFieldWrapperEl.addEventListener('input', maskInputFieldOnEvent);
  });
}

function initializeFormValidation() {
  const formEl = document.querySelector('#contact-wrapper');
  formEl.noValidate = true; // JS is running; disable default behavior

  formEl.addEventListener('submit', checkFormSubmissionOnAttemptedSubmit);
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    initializeCharacterCounts();
    initializeFieldValidation();
    initializeFormValidation();
  },
  { once: true }
);
