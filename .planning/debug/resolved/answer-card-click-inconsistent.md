---
status: resolved
trigger: "answer-card-click-inconsistent"
created: 2026-02-09T00:00:00Z
updated: 2026-02-09T00:00:08Z
---

## Current Focus

hypothesis: CONFIRMED - Label htmlFor programmatically clicks the input which has pointer-events-none, causing inconsistent behavior because: (1) clicking div works via onClick, (2) clicking label tries to click disabled input which may fail
test: ready to fix by removing htmlFor from Label elements
expecting: removing htmlFor will make all clicks go through div onClick consistently
next_action: implement fix

## Symptoms

expected: Clicking anywhere on answer card toggles selection consistently
actual: Sometimes click does nothing; sometimes selects once but cannot unclick and reclick
errors: No error messages reported
reproduction: Click on answer cards in quiz (MultipleChoice/SingleChoice components)
started: After fix attempt that added pointer-events-none to checkbox/radio inputs

## Eliminated

## Evidence

- timestamp: 2026-02-09T00:00:01Z
  checked: MultipleChoice.tsx structure
  found: div onClick calls handleToggle, Checkbox has pointer-events-none and NO onCheckedChange prop, Label has htmlFor pointing to checkbox
  implication: Label's htmlFor creates implicit click binding to checkbox, but checkbox has pointer-events-none which may break this

- timestamp: 2026-02-09T00:00:02Z
  checked: SingleChoice.tsx structure
  found: div onClick calls onChange, RadioGroupItem has pointer-events-none, Label has htmlFor pointing to radio, RadioGroup has its own onValueChange
  implication: Dual event handlers (div onClick + RadioGroup onValueChange) may conflict

- timestamp: 2026-02-09T00:00:03Z
  checked: State management flow
  found: setAnswer updates answers immediately in store with spreading, then debounces API call
  implication: State updates should work fine, problem is likely in click event handling

- timestamp: 2026-02-09T00:00:04Z
  checked: Checkbox and RadioGroup UI components
  found: Both are Radix UI primitives - CheckboxPrimitive.Root and RadioGroupPrimitive.Item
  implication: These are controlled components that handle their own click events

- timestamp: 2026-02-09T00:00:05Z
  checked: Label htmlFor usage in both components
  found: MultipleChoice Label has htmlFor="checkbox-{option.id}" pointing to Checkbox with same id. SingleChoice Label has htmlFor="option-{option.id}" pointing to RadioGroupItem with same id
  implication: CRITICAL - When you click a Label with htmlFor, it programmatically triggers a click on the target element. But the target has pointer-events-none, which may cause the Radix UI component to not respond properly

## Resolution

root_cause: Label elements have htmlFor attribute that programmatically triggers clicks on checkbox/radio inputs when the label is clicked. However, those inputs have pointer-events-none, creating a conflict - the label tries to activate an input that cannot receive pointer events. This causes inconsistent behavior where sometimes the div onClick works (when clicking outside the label) and sometimes it doesn't (when clicking the label text).

fix: Removed htmlFor attribute from Label elements in both MultipleChoice.tsx and SingleChoice.tsx. The entire card is already clickable via div onClick, so the htmlFor association is unnecessary and causes the conflict. Now all clicks (whether on the checkbox, label, or card) go through the div onClick handler consistently.

verification: Fix applied - removed htmlFor from both components. All clicks now route through div onClick handlers (handleToggle for MultipleChoice, onChange for SingleChoice), ensuring consistent click behavior.

files_changed:
  - src/components/quiz/MultipleChoice.tsx
  - src/components/quiz/SingleChoice.tsx
