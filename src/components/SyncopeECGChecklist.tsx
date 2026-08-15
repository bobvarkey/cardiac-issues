import { useState, useMemo } from "react";
import { 
  ClipboardCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  ChevronDown, 
  ChevronUp,
  Info,
  Printer,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  SYNCOPE_ECG_CHECKLIST_DATA, 
  calculateChecklistResult 
} from "@/lib/syncope-checklist";
import { buildChecklistReportHtml } from "@/lib/syncope-checklist-report";

export function SyncopeECGChecklist() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [globalTriggers, setGlobalTriggers] = useState<string[]>([]);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [showChecklist, setShowChecklist] = useState(true);

  const result = useMemo(() => 
    calculateChecklistResult(selectedIds, globalTriggers), 
    [selectedIds, globalTriggers]
  );

  const toggleItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleGlobalTrigger = (trigger: string) => {
    setGlobalTriggers(prev => 
      prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]
    );
  };

  const toggleItemDetails = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const reset = () => {
    setSelectedIds([]);
    setGlobalTriggers([]);
  };

  const exportReport = () => {
    const html = buildChecklistReportHtml(selectedIds, globalTriggers, result);
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  };


  return (
    <Card className="border-border/40 shadow-lg">
      <Collapsible open={showChecklist} onOpenChange={setShowChecklist}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-bold">{SYNCOPE_ECG_CHECKLIST_DATA.toolName}</div>
                    <div className="text-xs font-normal text-muted-foreground mt-0.5">
                      v{SYNCOPE_ECG_CHECKLIST_DATA.version} • Clinical Decision Support
                    </div>
                  </div>
                </span>
                {showChecklist ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
              <div className="flex gap-2 items-start">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{SYNCOPE_ECG_CHECKLIST_DATA.purpose}</p>
              </div>
            </div>

            {/* Global Urgent Triggers */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-destructive">
                <ShieldAlert className="w-4 h-4" />
                GLOBAL URGENT OVERRIDES
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SYNCOPE_ECG_CHECKLIST_DATA.globalUrgentOverride.triggers.map((trigger, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-start gap-2 p-2 rounded-md border transition-colors cursor-pointer ${
                      globalTriggers.includes(trigger) 
                        ? 'bg-destructive/10 border-destructive/40' 
                        : 'bg-muted/20 border-border/50 hover:bg-muted/40'
                    }`}
                    onClick={() => toggleGlobalTrigger(trigger)}
                  >
                    <Checkbox 
                      checked={globalTriggers.includes(trigger)}
                      className="mt-1"
                    />
                    <span className="text-xs font-medium">{trigger}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                ECG HIGH-RISK FINDINGS
              </h3>
              
              <div className="space-y-2">
                {SYNCOPE_ECG_CHECKLIST_DATA.items.map((item) => (
                  <div 
                    key={item.id}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      selectedIds.includes(item.id) 
                        ? 'border-primary/40 bg-primary/5' 
                        : 'border-border/50 bg-background hover:border-border'
                    }`}
                  >
                    <div className="p-3 flex items-start gap-3">
                      <Checkbox 
                        id={item.id}
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <label 
                            htmlFor={item.id}
                            className="text-sm font-bold cursor-pointer hover:text-primary transition-colors"
                          >
                            {item.label}
                          </label>
                          <div className="flex items-center gap-2">
                            {item.urgentOverride && (
                              <Badge variant="destructive" className="text-[10px] h-5">URGENT</Badge>
                            )}
                            <Badge variant="secondary" className="text-[10px] h-5">+{item.score} pts</Badge>
                            <button 
                              onClick={() => toggleItemDetails(item.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {openItems[item.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {item.category.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    {openItems[item.id] && (
                      <div className="px-3 pb-3 pt-1 border-t border-border/30 bg-muted/10 space-y-2">
                        <div>
                          <div className="text-[10px] font-bold text-muted-foreground mb-1">CRITERIA:</div>
                          <ul className="text-[11px] space-y-1 text-foreground/80">
                            {item.criteria.map((c, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-primary">•</span>
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {(item.urgentOverrideConditions || item.urgentOverrideCondition) && (
                          <div className="bg-destructive/5 p-2 rounded border border-destructive/20">
                            <div className="text-[10px] font-bold text-destructive mb-1 uppercase tracking-tight">Urgent Conditions:</div>
                            <div className="text-[10px] text-destructive/90">
                              {item.urgentOverrideCondition || item.urgentOverrideConditions?.join(', ')}
                            </div>
                          </div>
                        )}

                        <div className="bg-primary/5 p-2 rounded border border-primary/20">
                          <div className="text-[10px] font-bold text-primary mb-1 uppercase tracking-tight">Clinical Action:</div>
                          <div className="text-[11px] leading-relaxed text-foreground/90">{item.action}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Results Section */}
            <div className="pt-6 border-t border-border/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold">ASSESSMENT RESULT</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={exportReport}
                    className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-md border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Export / Print
                  </button>
                  <button 
                    onClick={reset}
                    className="text-[10px] font-medium text-muted-foreground hover:text-destructive underline decoration-dotted"
                  >
                    Clear Checklist
                  </button>
                </div>

              </div>

              <div className={`p-5 rounded-xl border-2 transition-all ${
                result.isUrgent 
                  ? 'bg-destructive/10 border-destructive/50 shadow-destructive/5' 
                  : result.score >= 3 
                    ? 'bg-orange-500/10 border-orange-500/50 shadow-orange-500/5' 
                    : result.score > 0
                      ? 'bg-yellow-500/10 border-yellow-500/50 shadow-yellow-500/5'
                      : 'bg-muted/30 border-border/50'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex flex-col items-center justify-center p-4 bg-background rounded-full border-4 border-current aspect-square min-w-[100px] h-[100px]">
                    <span className="text-3xl font-black">{result.score}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">POINTS</span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {result.isUrgent ? (
                        <ShieldAlert className="w-5 h-5 text-destructive" />
                      ) : result.score >= 3 ? (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      )}
                      <h4 className="text-lg font-black tracking-tight uppercase">
                        {result.isUrgent ? "URGENT CLINICAL ACTION REQUIRED" : result.label}
                      </h4>
                    </div>
                    
                    {result.isUrgent && (
                      <div className="flex flex-wrap gap-1.5 my-2">
                        {result.triggeredOverrides.map((t, idx) => (
                          <Badge key={idx} variant="destructive" className="text-[9px] uppercase font-bold py-0 h-4">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Alert className={`border-none p-0 bg-transparent ${result.isUrgent ? 'text-destructive-foreground' : ''}`}>
                      <AlertDescription className="text-sm font-medium leading-relaxed">
                        {result.isUrgent 
                          ? "IMMEDIATE monitored cardiac assessment and cardiology review required. Do not discharge until acute life-threatening causes are excluded." 
                          : result.action}
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
