# B2B SaaS Onboarding Flow

A functional, 3-step interactive onboarding funnel built to demonstrate zero-dependency state management and component reusability. 

This project utilizes the foundational CSS architecture from the `structural-component-library`.

## The Objective
Reduce user drop-off during the critical software initialization phase by providing a frictionless, linear setup flow with clear validation states.

## Technical Architecture
* **State Management:** Vanilla JavaScript (`app.js`) handles view transitions and simulated API loading states without relying on heavy frontend frameworks like React or Vue.
* **Component Reuse:** Relies entirely on pre-defined CSS tokens and classes (`.c-card`, `.c-input`, `.c-button`). Zero custom layout CSS was written for this specific flow.
* **Accessibility:** All form inputs maintain strict WCAG compliance via semantic `<label>` routing and `aria-describedby` attributes.

No handoff gap. The design system directly powers the production logic.
