# Plan - ECG Measurement Input and Automated Checklist Highlighting

Add an input form for numeric ECG measurements (QTc, PR, QRS) and lead-specific findings that automatically updates the Syncope ECG High-Risk Checklist.

## User Review Required

> [!IMPORTANT]
> The automation will suggest selections based on clinical thresholds (e.g., QTc >= 480ms), but the user will still have final control to confirm or override these selections.

## Proposed Changes

### Logic & Types
- Update `syncope-checklist-types.ts` to include `ECGMeasurements` interface.
- Add automation logic in `syncope-checklist.ts` to map measurements to checklist item IDs.

### UI Components
- Create `ECGMeasurementForm.tsx` with inputs for:
    - QTc (ms)
    - PR interval (ms)
    - QRS duration (ms)
    - Checkboxes for lead findings (V1-V3 ST elevation/T-wave inversion).
- Update `SyncopeECGChecklist.tsx` to:
    - Include the `ECGMeasurementForm`.
    - Use a `useEffect` or similar mechanism to auto-toggle checklist items based on measurement thresholds.

## Technical Details
- **Thresholds**:
    - `long_qtc`: QTc >= 480 (Suggest), QTc >= 500 (Urgent Override).
    - `short_qtc`: QTc <= 330 (Suggest).
    - `first_degree_av_block`: PR > 200 (Suggest).
    - `av_block_high_grade`: PR > 300 (Suggest as modifier) or specific rhythm choice.
    - `wpw_preexcitation`: PR < 120 + QRS > 110 (Suggest).
    - `brugada_type_1`: V1-V2 Coved ST-elevation (Suggest).
- **State Management**: The measurement form will lift state up to `SyncopeECGChecklist` which will then synchronize the checklist selections.
