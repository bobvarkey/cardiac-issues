import { SYNCOPE_ECG_CHECKLIST_DATA } from "./syncope-checklist";
import type { ChecklistResult } from "./syncope-checklist-types";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function buildChecklistReportHtml(
  selectedIds: string[],
  globalTriggers: string[],
  result: ChecklistResult,
): string {
  const items = SYNCOPE_ECG_CHECKLIST_DATA.items.filter((i) => selectedIds.includes(i.id));
  const generated = new Date().toLocaleString();

  const rows = items.length
    ? items
        .map(
          (item) => `
        <tr>
          <td>
            <div class="item-label">${escapeHtml(item.label)}</div>
            <div class="item-cat">${escapeHtml(item.category.replace(/_/g, " "))}</div>
            <div class="item-action">${escapeHtml(item.action)}</div>
          </td>
          <td class="num">${item.score}</td>
          <td class="num">${item.urgentOverride ? "YES" : "—"}</td>
        </tr>`,
        )
        .join("")
    : `<tr><td colspan="3" class="empty">No high-risk ECG findings selected.</td></tr>`;

  const overrides = globalTriggers.length
    ? `<ul class="triggers">${globalTriggers.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
    : `<p class="muted">No global urgent override triggers selected.</p>`;

  const route = result.isUrgent
    ? "URGENT MONITORED CARDIAC ASSESSMENT"
    : result.score >= 3
      ? "Monitored evaluation with urgent cardiology / EP review"
      : result.score > 0
        ? "Targeted outpatient cardiac evaluation"
        : "Continue standard syncope assessment";

  const action = result.isUrgent
    ? "IMMEDIATE monitored cardiac assessment and cardiology review required. Do not discharge until acute life-threatening causes are excluded."
    : result.action;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Syncope ECG High-Risk Checklist — Report</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #111; margin: 0; padding: 24px; }
  h1 { font-size: 20px; margin: 0 0 2px; }
  .sub { font-size: 11px; color: #666; margin-bottom: 18px; }
  .banner { border: 2px solid ${result.isUrgent ? "#b91c1c" : "#0f766e"}; background: ${result.isUrgent ? "#fef2f2" : "#f0fdfa"}; border-radius: 10px; padding: 14px 16px; margin-bottom: 18px; }
  .banner .score { font-size: 30px; font-weight: 800; line-height: 1; }
  .banner .label { font-size: 14px; font-weight: 700; text-transform: uppercase; margin-top: 6px; }
  .banner .route { font-size: 12px; margin-top: 6px; font-weight: 600; }
  .banner .action { font-size: 12px; margin-top: 6px; color: #333; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .06em; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin: 20px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border-bottom: 1px solid #e5e5e5; padding: 8px 6px; text-align: left; vertical-align: top; }
  th { font-size: 10px; text-transform: uppercase; color: #666; }
  td.num, th.num { text-align: center; width: 70px; }
  .item-label { font-weight: 700; }
  .item-cat { font-size: 10px; text-transform: uppercase; color: #777; margin: 2px 0 4px; }
  .item-action { font-size: 11px; color: #444; }
  .triggers { margin: 0; padding-left: 18px; font-size: 12px; }
  .triggers li { margin-bottom: 3px; }
  .muted { font-size: 12px; color: #777; }
  .empty { color: #777; font-style: italic; }
  footer { margin-top: 24px; font-size: 10px; color: #777; border-top: 1px solid #ddd; padding-top: 8px; }
  @media print { body { padding: 0; } .noprint { display: none; } }
</style>
</head>
<body>
  <h1>${escapeHtml(SYNCOPE_ECG_CHECKLIST_DATA.toolName)}</h1>
  <div class="sub">v${escapeHtml(SYNCOPE_ECG_CHECKLIST_DATA.version)} · Generated ${escapeHtml(generated)}</div>

  <div class="banner">
    <div class="score">${result.score} <span style="font-size:12px;font-weight:600;">/ ${SYNCOPE_ECG_CHECKLIST_DATA.scoring.range.maximum} points</span></div>
    <div class="label">${escapeHtml(result.isUrgent ? "Urgent clinical action required" : result.label)}</div>
    <div class="route">Recommended route: ${escapeHtml(route)}</div>
    <div class="action">${escapeHtml(action)}</div>
  </div>

  <h2>Triggered ECG findings (${items.length})</h2>
  <table>
    <thead><tr><th>Finding</th><th class="num">Points</th><th class="num">Urgent</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <h2>Global urgent overrides</h2>
  ${overrides}

  <footer>
    Additive, non-validated checklist for clinical decision support only. A normal ECG does not exclude serious disease.
    Always correlate with history, examination, medications, electrolytes, and family history.
  </footer>
</body>
</html>`;
}
