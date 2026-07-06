import type { DrugDetails } from "./antiarrhythmic-details";

/**
 * Common companion medications to check against an antiarrhythmic's
 * interaction list. Each entry has keywords we substring-match
 * (case-insensitive) against interaction strings.
 */
export type CompanionMed = {
  name: string;
  category: string;
  keywords: string[];
};

export const COMPANION_MEDS: CompanionMed[] = [
  { name: "Digoxin", category: "Cardiac", keywords: ["digoxin"] },
  { name: "Warfarin", category: "Anticoagulant", keywords: ["warfarin", "inr"] },
  { name: "Amiodarone", category: "Antiarrhythmic", keywords: ["amiodarone"] },
  { name: "Verapamil", category: "Non-DHP CCB", keywords: ["verapamil", "non-dhp", "ccb"] },
  { name: "Diltiazem", category: "Non-DHP CCB", keywords: ["diltiazem", "non-dhp", "ccb"] },
  { name: "IV β-blocker", category: "β-blocker", keywords: ["β-blocker", "b-blocker", "beta-blocker", "β-blockers"] },
  { name: "Simvastatin", category: "Statin", keywords: ["simvastatin", "statin"] },
  { name: "Clarithromycin", category: "Macrolide", keywords: ["clarithromycin", "macrolide", "qt-prolonging"] },
  { name: "Erythromycin", category: "Macrolide", keywords: ["macrolide", "qt-prolonging"] },
  { name: "Ketoconazole", category: "Azole", keywords: ["ketoconazole", "azole", "cyp3a4"] },
  { name: "Fluconazole", category: "Azole", keywords: ["azole", "qt-prolonging"] },
  { name: "Ciprofloxacin", category: "Fluoroquinolone", keywords: ["ciprofloxacin", "cyp1a2", "qt-prolonging"] },
  { name: "Fluoxetine", category: "SSRI", keywords: ["fluoxetine", "cyp2d6"] },
  { name: "Paroxetine", category: "SSRI", keywords: ["paroxetine", "cyp2d6"] },
  { name: "Methadone", category: "Opioid", keywords: ["methadone", "qt-prolonging"] },
  { name: "Hydrochlorothiazide", category: "Diuretic", keywords: ["hydrochlorothiazide", "hctz", "diuretic"] },
  { name: "Furosemide", category: "Loop diuretic", keywords: ["diuretic", "hypokalemi"] },
  { name: "Cimetidine", category: "H2 blocker", keywords: ["cimetidine"] },
  { name: "Trimethoprim", category: "Antibiotic", keywords: ["trimethoprim"] },
  { name: "Phenytoin", category: "Anticonvulsant", keywords: ["phenytoin"] },
  { name: "Rifampin", category: "Antibiotic", keywords: ["rifampin"] },
  { name: "Insulin", category: "Antihyperglycemic", keywords: ["insulin", "hypoglycemi"] },
  { name: "Clonidine", category: "Antihypertensive", keywords: ["clonidine"] },
  { name: "NSAIDs", category: "Analgesic", keywords: ["nsaid"] },
  { name: "Cyclosporine", category: "Immunosuppressant", keywords: ["cyclosporine"] },
  { name: "Tacrolimus", category: "Immunosuppressant", keywords: ["tacrolimus"] },
  { name: "TCAs", category: "Antidepressant", keywords: ["tca"] },
  { name: "Morphine", category: "Opioid", keywords: ["morphine"] },
];

export type InteractionHit = {
  companion: CompanionMed;
  matches: string[];
};

export function findInteractions(
  details: DrugDetails,
  selected: string[],
): InteractionHit[] {
  const hits: InteractionHit[] = [];
  const lowered = details.interactions.map((i) => i.toLowerCase());
  for (const name of selected) {
    const companion = COMPANION_MEDS.find((c) => c.name === name);
    if (!companion) continue;
    const matches: string[] = [];
    lowered.forEach((line, idx) => {
      if (companion.keywords.some((kw) => line.includes(kw.toLowerCase()))) {
        matches.push(details.interactions[idx]);
      }
    });
    if (matches.length) hits.push({ companion, matches });
  }
  return hits;
}
