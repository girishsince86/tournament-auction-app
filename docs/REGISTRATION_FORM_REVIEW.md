# Registration Form – UI/UX & Code Review

## Current state

- **Main form:** Single long page (`registration-form-single.tsx`) with collapsible sections: Category → Personal → Player Profile → Jersey → Payment, then Submit.
- **Flow:** Rules acknowledgment → sections with expand/collapse, completion chips, auto-expand next incomplete section.
- **Data:** `RegistrationFormData` in `types/registration.ts`; submit via `use-registration-submit` to `POST /api/tournaments/register`.
- **Profile image:** DB column `profile_image_url` exists on `tournament_registrations`; form did not collect it. This review adds optional profile photo with mobile-friendly upload.

---

## UI/UX suggestions

### 1. **Mobile-first**
- **Sticky CTA:** On small screens, consider a sticky “Next section” or “Submit” so users don’t have to scroll to the bottom.
- **Section progress:** Show a compact step indicator (e.g. “Step 2 of 5”) at the top on mobile.
- **Touch targets:** Buttons and checkboxes are already MUI; ensure section headers and “Load my 2025 details” have min ~44px tap area.
- **Keyboard:** On desktop, avoid trapping focus in dialogs; ensure Tab order is logical.

### 2. **Clarity and feedback**
- **Required vs optional:** Mark optional fields (e.g. “Email (optional)”) and consider “Optional” in the label for profile photo.
- **Inline validation:** You already validate on change; keep errors near the field and consider clearing them on focus for better UX.
- **Submit state:** Disable submit and show “Submitting…” (you do); optionally add a short “Thank you, processing…” message before redirect.
- **Save draft:** For long forms, consider “Save and continue later” (e.g. store in `localStorage` by email/phone) so users don’t lose data on refresh.

### 3. **Profile photo (implemented below)**
- Optional field in **Personal Details** (or its own small “Profile photo” block).
- **Mobile:** `accept="image/*"` and optionally `capture="environment"` (camera) so phones can take a photo directly.
- **Compression:** Compress before upload to reduce size and time on slow networks.
- **Preview:** Show thumbnail after selection; allow “Remove” and re-upload.
- **Placement:** Either at top of Personal Details (so they can take/upload photo first) or after name/contact.

### 4. **Performance**
- **Image in hero:** `/images/community-sports.jpg` – ensure it’s optimized (e.g. next/image with priority already used).
- **Lazy load:** Collapsed section content could be lazy-rendered if needed; current approach is fine unless sections grow a lot.
- **Reduce re-renders:** `registration-form-single.tsx` is large; consider splitting section content into smaller components that receive only the props they need.

### 5. **Accessibility**
- **Labels:** Ensure every input has a visible label (you do); keep “View Size Chart” and “Load my 2025 details” as buttons with clear labels.
- **Errors:** Associate `helperText` / `aria-describedby` with inputs so screen readers announce errors.
- **Rules dialog:** Keep “Accept Rules” and “Close” as explicit buttons; avoid closing only on overlay click without a visible “Close”.

---

## Code structure suggestions

### 1. **Single source of truth**
- **Two form implementations:** `registration-form.tsx` (simpler, with its own `RegistrationFormData` shape) vs `registration-form-single.tsx` (full flow). The app uses `RegistrationFormSingle` only. Consider removing or clearly deprecating `registration-form.tsx` and the unused stepper flow (`registration-form.tsx` + steps) to avoid confusion.
- **Constants:** Options like `SKILL_LEVELS`, `LAST_PLAYED_OPTIONS`, `PLAYING_POSITIONS`, `TSHIRT_SIZES`, `REGISTRATION_CATEGORIES` live in `registration-form-single.tsx`. Moving them to `features/tournaments/constants/registration-options.ts` (or under `types/registration.ts`) would allow reuse (e.g. in admin or review step) and shrink the big file.

### 2. **Split the large file**
- **registration-form-single.tsx** is ~1300 lines. Suggestions:
  - Extract **section components:** e.g. `CategorySection`, `PersonalDetailsSection`, `ProfileSection`, `JerseySection`, `PaymentSection`, each taking `formData`, `errors`, `onChange`, `onSelectChange`, `expanded`, `onExpand`, `isComplete`.
  - Keep in the same file: form state, validation, submit, and composition of sections; or move state into a custom hook `useRegistrationFormSingle()` that returns `formData`, `errors`, `handlers`, `isSubmitting`, etc.
  - Extract **dialogs:** Rules dialog and Size chart dialog into `RegistrationRulesDialog` and `SizeChartDialog` in the same folder.

### 3. **Validation**
- Centralize validation in one place (e.g. `validateRegistrationForm(data)` in `features/tournaments/utils/validation.ts`) and reuse for submit and for section completion. Right now `validateField` is inside the component; moving it out (and passing `formData` where needed for cross-field rules) would simplify testing and reuse.

### 4. **API**
- **Register route:** Currently does `insert([data])` with whatever is in the body. Allowing extra keys (e.g. `profile_image_url`) is fine; consider sanitizing or allow-listing fields before insert so future frontend changes don’t accidentally write unwanted columns.
- **Profile image:** Add a public `POST /api/tournaments/register/upload-image` that accepts a file, uploads to storage, returns `{ imageUrl }`. No auth required; optional rate limit by IP in the future.

### 5. **Types**
- Keep `RegistrationFormData` and `TournamentRegistration` in sync with DB columns. Add optional `profile_image_url?: string` to the form type so the UI and submit payload are typed.

---

## Summary

| Area | Suggestion |
|------|------------|
| **Mobile** | Sticky CTA / step indicator; ensure large touch targets. |
| **Profile photo** | Optional upload in Personal (or dedicated block); mobile camera + compression + preview (implemented). |
| **Code** | Remove or deprecate unused `registration-form.tsx`; extract section components and constants from `registration-form-single.tsx`; centralize validation. |
| **API** | Public upload endpoint for registration profile image; optional allow-list on register payload. |
| **A11y** | Keep labels and error association; clear dialog actions. |

Implementing the **profile image** flow next: type + public upload API + Personal section UI (mobile-friendly, optional).
