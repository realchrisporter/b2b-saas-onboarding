/* ==========================================================================
   app.js — onboarding step controller
   --------------------------------------------------------------------------
   State lives in the DOM the component library already styles:
     [hidden]                 which step is visible
     [aria-invalid="true"]    field error state (.c-input invalid style)
     [aria-disabled="true"]   button loading state (.c-button disabled style)
     [aria-busy="true"]       form is saving
   No classes are toggled, so visual state and announced state cannot drift.
   ========================================================================== */

const SAVE_DELAY_MS = 1000;
const LOADING_LABEL = 'Saving…';

const steps = [...document.querySelectorAll('[data-step]')];
const statusRegion = document.querySelector('[data-status]');

const state = {
  current: 0,
  workspaceName: '',
  invites: [],
};

steps.forEach((step) => {
  const form = step.querySelector('form');
  if (!form) return;
  form.addEventListener('submit', handleSubmit);
  form.addEventListener('input', clearErrorOnFix);
});


/* --- Submit flow --------------------------------------------------------- */

async function handleSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');

  // aria-disabled keeps the button focusable, so activation must be blocked here.
  if (button.getAttribute('aria-disabled') === 'true') return;

  const firstInvalid = validate(form);
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  saveStepData(form);
  await withLoading(form, button, () => wait(SAVE_DELAY_MS));
  showStep(state.current + 1);
}

function saveStepData(form) {
  const data = new FormData(form);

  if (data.has('workspaceName')) {
    state.workspaceName = data.get('workspaceName').trim();
  }
  if (data.has('inviteEmail')) {
    state.invites = data.getAll('inviteEmail').map((v) => v.trim()).filter(Boolean);
  }
}

async function withLoading(form, button, task) {
  const label = button.textContent;
  const inputs = [...form.querySelectorAll('.c-input')];

  button.setAttribute('aria-disabled', 'true');
  button.textContent = LOADING_LABEL;
  form.setAttribute('aria-busy', 'true');
  inputs.forEach((input) => { input.readOnly = true; });
  statusRegion.textContent = LOADING_LABEL;

  try {
    await task();
  } finally {
    button.removeAttribute('aria-disabled');
    button.textContent = label;
    form.removeAttribute('aria-busy');
    inputs.forEach((input) => { input.readOnly = false; });
    statusRegion.textContent = '';
  }
}


/* --- Step transitions ---------------------------------------------------- */

function showStep(index) {
  const next = steps[index];
  if (!next) return;

  if (index === steps.length - 1) renderSummary();

  steps[state.current].hidden = true;
  next.hidden = false;
  state.current = index;

  const heading = next.querySelector('h2');
  document.title = `Step ${index + 1} of ${steps.length}: ${heading.textContent}`;
  // Moving focus to the heading announces the new step to screen readers.
  heading.focus();
}

function renderSummary() {
  const nameEl = document.querySelector('[data-workspace-name]');
  const summaryEl = document.querySelector('[data-invite-summary]');
  const count = state.invites.length;

  if (state.workspaceName) nameEl.textContent = state.workspaceName;
  if (count > 0) {
    summaryEl.textContent = `We sent ${count} ${count === 1 ? 'invitation' : 'invitations'}. You can invite more from Settings.`;
  }
}


/* --- Validation ---------------------------------------------------------- */

// Native constraints (required, type="email") are the rules; novalidate only
// suppresses the browser's own bubbles so the library's error pattern is used.
function isValid(input) {
  if (input.required && input.value.trim() === '') return false;
  return input.validity.valid;
}

function validate(form) {
  let firstInvalid = null;

  form.querySelectorAll('.c-input').forEach((input) => {
    const invalid = !isValid(input);
    setFieldError(input, invalid);
    if (invalid && !firstInvalid) firstInvalid = input;
  });

  return firstInvalid;
}

function clearErrorOnFix(event) {
  const input = event.target;
  if (input.getAttribute('aria-invalid') === 'true' && isValid(input)) {
    setFieldError(input, false);
  }
}

// Error id is referenced only while visible, and always after the hint,
// matching the library's aria-describedby order: hint → error.
function setFieldError(input, invalid) {
  const error = document.getElementById(`${input.id}-error`);
  const ids = new Set((input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));

  if (invalid) {
    input.setAttribute('aria-invalid', 'true');
    ids.add(error.id);
  } else {
    input.removeAttribute('aria-invalid');
    ids.delete(error.id);
  }
  error.hidden = !invalid;

  if (ids.size) input.setAttribute('aria-describedby', [...ids].join(' '));
  else input.removeAttribute('aria-describedby');
}


/* --- Utilities ----------------------------------------------------------- */

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
