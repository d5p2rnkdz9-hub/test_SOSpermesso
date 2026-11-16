---
status: testing
phase: 02-decision-tree-engine
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md
started: 2026-02-16T16:00:00Z
updated: 2026-02-16T16:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Welcome Page Display
expected: |
  Visit the welcome page (/it). You should see a name input field, a skip/skip-name option, an explainer paragraph about what the tool does, and a legal disclaimer at the bottom.
awaiting: user response

## Tests

### 1. Welcome Page Display
expected: Visit the welcome page (/it). You should see a name input field, a skip/skip-name option, an explainer paragraph about what the tool does, and a legal disclaimer at the bottom.
result: [pending]

### 2. Start Session with Name
expected: Enter a name in the input field and tap the start button. You should be navigated to /it/tree and see the first question displayed with answer options.
result: [pending]

### 3. Skip Name and Start
expected: Instead of entering a name, use the skip option on the welcome page. You should still navigate to /it/tree and see the first question -- no crash or redirect back to welcome.
result: [pending]

### 4. First Question Category Grouping
expected: The main situation question ("Qual e' la tua situazione?") should show its 9 answer options grouped under 4 category headings (personal situation, family/relationships, protection/safety, other). The headings should be non-interactive text labels above each group.
result: [pending]

### 5. Answer Selection and Slide Transition
expected: Tap an answer card. The card should briefly show a selected state (black background with yellow text), then the screen should slide to the next question with a smooth animation.
result: [pending]

### 6. Back Navigation with Answer Preserved
expected: After answering at least 2 questions, tap the back arrow in the header. You should return to the previous question and your previous answer should still appear highlighted/selected.
result: [pending]

### 7. Change Mind After Going Back
expected: Go back to a previous question and select a different answer than before. The tree should continue down the new path. Any answers you gave on the old path should be discarded (if you go back again to this point and forward on the new path, old path answers won't appear).
result: [pending]

### 8. Session Persistence
expected: Navigate several questions deep into the tree. Close the browser tab completely. Reopen the app and go to /it/tree. You should resume from exactly where you left off with all previous answers intact.
result: [pending]

### 9. Navigate to an Outcome
expected: Follow any complete path through the tree to the end. When you reach a terminal node (outcome), you should see a result page with a title, description, and any relevant requirements or next steps -- not another question.
result: [pending]

### 10. Back Button Hidden at Start
expected: When you are on the very first question of the tree (no history), the back arrow in the header should not be visible. It should only appear after you answer the first question and advance.
result: [pending]

## Summary

total: 10
passed: 0
issues: 0
pending: 10
skipped: 0

## Gaps

[none yet]
