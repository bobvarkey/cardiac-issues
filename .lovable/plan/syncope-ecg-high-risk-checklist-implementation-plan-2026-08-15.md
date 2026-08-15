# Syncope ECG High-Risk Checklist Implementation Plan

The user wants to implement a comprehensive clinical decision-support checklist for ECG abnormalities associated with syncope, based on a provided JSON schema. This will be a new component that complements the existing `ECGRuleEngine` and `SyncopeAlgorithm`.

## User Interface

- Create a new component `SyncopeECGChecklist` in `src/components/SyncopeECGChecklist.tsx`.
- The UI will follow the provided JSON structure:
  - Header with title, version, and purpose.
  - Interactive list of items (Wellens, WPW, AV Blocks, Brugada, etc.) with criteria and scores.
  - Live scoring engine based on the `additive_nonvalidated` type.
  - Interpretation section that updates based on the current score.
  - Global urgent overrides section.
- Use a clean, clinical aesthetic with Lucide icons (AlertTriangle, Activity, ShieldCheck, etc.).
- Add the checklist to the `SyncopeAlgorithm` view or as a separate section in the main layout.

## Data Logic

- Implement the scoring logic in `src/lib/syncope-checklist.ts`.
- The logic will handle:
  - Additive scoring (0-25).
  - Urgent overrides (individual items and global triggers).
  - Mapping scores to labels and actions.
  - Criteria validation (simple checkboxes).

## Integration

- Add a new route/section for this checklist.
- Link it from the existing Syncope and ECG tools.
- Ensure it's responsive (mobile/tablet/desktop).

## Technical Details

- **State Management**: Use React `useState` for checked items and calculated results.
- **Styling**: Tailwind CSS with shadcn/ui components (`Card`, `Checkbox`, `Badge`, `Alert`).
- **Icons**: `lucide-react`.
- **Types**: Define TypeScript interfaces for the checklist schema.

```typescript
export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  criteria: string[];
  score: number;
  urgentOverride?: boolean;
  urgentOverrideCondition?: string;
  urgentOverrideConditions?: string[];
  clinicalCorrelates?: string[];
  modifierCriteria?: string[];
  action: string;
}

export interface ChecklistResult {
  score: number;
  isUrgent: boolean;
  label: string;
  action: string;
  triggeredOverrides: string[];
}
```
