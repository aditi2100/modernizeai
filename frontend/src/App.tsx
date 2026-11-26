import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, BarChart3, Bot, Boxes, Check,
  CheckCircle2, ChevronDown, ChevronRight, CircleDot, Clock3, Code2, Download,
  FileCode2, FileText, GitBranch, GitPullRequest, LayoutDashboard, LockKeyhole,
  Menu, Play, RefreshCw, Shield, Sparkles, TerminalSquare, X,
} from "lucide-react";
import {
  analyzeSample, currentProductSource, initialState, localTimestamp, proposal,
  sampleFiles, type DemoState, type Finding,
} from "./workflow";

const iconMap: Record<string, typeof LayoutDashboard> = {
  Overview: LayoutDashboard, Repository: GitBranch, Analysis: BarChart3,
  Architecture: Boxes, Modernization: Code2, Testing: CheckCircle2, Security: Shield, Reports: FileText,
};
const navItems = Object.keys(iconMap);
const storedKey = "modernizeai-demo-v1";
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

function readStored(): DemoState {
  try {
    const raw = localStorage.getItem(storedKey);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch {
    return initialState;
  }
}

function App() {
  const [state, setState] = useState<DemoState>(readStored);
  const [page, setPage] = useState("Overview");
  const [file, setFile] = useState("InventoryApp.java");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const findings = useMemo(() => analyzeSample(), []);

  useEffect(() => {
    localStorage.setItem(storedKey, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!apiUrl) return;
    let active = true;
    fetch(`${apiUrl}/api/projects/legacy-inventory`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`API responded ${response.status}`);
        return response.json();
      })
      .then((project) => {
        if (active) {
          setState({
            analyzed: project.analyzed,
            approved: project.approved,
            applied: project.applied,
            events: project.events.map((event: { action: string; created_at: string }) => ({
              label: event.action,
              time: new Date(event.created_at).toLocaleString(),
            })),
          });
        }
      })
      .catch(() => {
        if (active) setNotice("Local API unavailable; browser demo state remains active.");
      });
    return () => { active = false; };
  }, []);

  function record(label: string) {
    setState((current) => ({ ...current, events: [{ label, time: localTimestamp() }, ...current.events] }));
  }

  async function runAnalysis() {
    setState((current) => ({ ...current, analyzed: true }));
    record("Deterministic source analysis completed");
    if (apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/api/projects/legacy-inventory/analyze`, { method: "POST" });
        if (!response.ok) throw new Error(`API responded ${response.status}`);
        setNotice("Analysis saved to the local API.");
      } catch {
        setNotice("Browser demo analysis completed. The configured API could not be reached.");
      }
    } else {
      setNotice("Sample analysis complete — findings are deterministic demo results.");
    }
    window.setTimeout(() => setNotice(""), 5000);
    setPage("Analysis");
  }

  async function approve() {
    if (apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/api/projects/legacy-inventory/approve`, { method: "POST" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.detail ?? `API responded ${response.status}`);
        setState({
          analyzed: payload.analyzed,
          approved: payload.approved,
          applied: payload.applied,
          events: payload.events.map((event: { action: string; created_at: string }) => ({
            label: event.action,
            time: new Date(event.created_at).toLocaleString(),
          })),
        });
        setNotice("Approval recorded by the local API.");
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "The local API could not record approval.");
      }
      window.setTimeout(() => setNotice(""), 5000);
      return;
    }
    setState((current) => ({ ...current, approved: true }));
    record("Human approved the scoped refactoring proposal");
    setNotice("Approved. You can now apply the change to this browser-local demo workspace.");
    window.setTimeout(() => setNotice(""), 4500);
  }

  async function applyPatch() {
    if (!state.approved) return;
    if (apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/api/projects/legacy-inventory/apply`, { method: "POST" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.detail ?? `API responded ${response.status}`);
        setState({
          analyzed: payload.analyzed,
          approved: payload.approved,
          applied: payload.applied,
          events: payload.events.map((event: { action: string; created_at: string }) => ({
            label: event.action,
            time: new Date(event.created_at).toLocaleString(),
          })),
        });
        setNotice("Patch applied to the persistent, allowlisted API demo workspace.");
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "The local API could not apply the patch.");
      }
      window.setTimeout(() => setNotice(""), 5000);
      return;
    }
    setState((current) => ({ ...current, applied: true }));
    record("Approved Product.java change applied to demo workspace");
    setNotice("Patch applied in this browser only. The checked-in sample files were not changed.");
    window.setTimeout(() => setNotice(""), 5000);
  }

  async function reset() {
    if (apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/api/projects/legacy-inventory/reset`, { method: "POST" });
        if (!response.ok) throw new Error(`API responded ${response.status}`);
      } catch {
        setNotice("Could not reset the local API workspace; browser state was left unchanged.");
        window.setTimeout(() => setNotice(""), 5000);
        return;
      }
    }
    localStorage.removeItem(storedKey);
    setState(initialState);
    setNotice("Browser-local workflow state reset.");
    window.setTimeout(() => setNotice(""), 3500);
  }

  function exportReport() {
    const report = [
      "# ModernizeAI — Demo Assessment",
      "",
      `Generated: ${new Date().toISOString()}`,
      "",
      "> Deterministic portfolio demo. This is not an AI-generated or security-scanner report.",
      "",
      "## Repository",
      "- Sample: LegacyInventory",
      "- Runtime analysis: source heuristics bundled with ModernizeAI",
      `- Findings: ${state.analyzed ? findings.length : "Not run"}`,
      `- Human approval: ${state.approved ? "Approved" : "Pending"}`,
      `- Patch applied to browser workspace: ${state.applied ? "Yes" : "No"}`,
      "",
      "## Findings",
      ...(state.analyzed ? findings.map((item) => `- **${item.severity.toUpperCase()}** ${item.title} — \`${item.file}:${item.line}\`; ${item.evidence}`) : ["Analysis has not been run."]),
      "",
      "## Limitations",
      "No AI model, external repository, Semgrep, Trivy, or deployed environment was used.",
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([report], { type: "text/markdown" }));
    link.download = "modernizeai-demo-assessment.md";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={19} /></div>
          <div><strong>modernize<span>ai</span></strong><small>ENGINEERING WORKBENCH</small></div>
          <button className="icon-btn mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={18}/></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="project-switch"><div className="repo-avatar">LI</div><span><b>LegacyInventory</b><small>Demo project</small></span><ChevronDown size={15}/></button>
        <div className="workspace-label nav-label">PLATFORM</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map((item) => {
            const NavIcon = iconMap[item];
            return <button key={item} className={`nav-item ${page === item ? "active" : ""}`} onClick={() => {setPage(item); setMenuOpen(false);}}>
              <NavIcon size={17} strokeWidth={1.8}/><span>{item}</span>
              {item === "Security" && <span className="nav-beta">DEMO</span>}
            </button>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-card"><div className="demo-icon"><Bot size={16}/></div><div><b>Deterministic demo</b><small>No AI credentials required</small></div><span className="online-dot"/></div>
          <button className="user-button"><div className="user-avatar">AD</div><span><b>Demo workspace</b><small>Local browser session</small></span><ChevronDown size={14}/></button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="top-left">
            <button className="icon-btn menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={19}/></button>
            <div className="breadcrumbs"><span>Projects</span><ChevronRight size={14}/><b>LegacyInventory</b></div>
          </div>
          <div className="top-actions">
            <div className="api-status"><span className={`status-dot ${apiUrl ? "status-optional" : ""}`}/>{apiUrl ? "API optional" : "Browser demo"}</div>
            <button className="icon-btn" onClick={reset} title="Reset demo state" aria-label="Reset demo state"><RefreshCw size={17}/></button>
            <div className="top-avatar">AD</div>
          </div>
        </header>

        <div className="page-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot"/> MODERNIZATION PROJECT <span className="badge-demo">DEMO</span></div>
              <h1>{page === "Overview" ? "Project overview" : page}</h1>
              <p>{page === "Overview" ? "Evidence-backed modernization, one verified change at a time." : pageDescription(page)}</p>
            </div>
            <div className="heading-actions">
              <button className="button secondary" onClick={exportReport}><Download size={15}/> Export report</button>
              <button className="button primary" onClick={runAnalysis}><Play size={15} fill="currentColor"/> Run analysis</button>
            </div>
          </div>
          {notice && <div className="notice" role="status"><CheckCircle2 size={16}/>{notice}<button className="icon-btn" onClick={() => setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}

          {page === "Overview" && <Overview state={state} findings={findings} runAnalysis={runAnalysis} setPage={setPage} />}
          {page === "Repository" && <Repository file={file} setFile={setFile} state={state} />}
          {page === "Analysis" && <Analysis findings={findings} state={state} runAnalysis={runAnalysis} />}
          {page === "Architecture" && <Architecture />}
          {page === "Modernization" && <Modernization state={state} approve={approve} applyPatch={applyPatch} />}
          {page === "Testing" && <Testing state={state} />}
          {page === "Security" && <Security />}
          {page === "Reports" && <Reports state={state} findings={findings} exportReport={exportReport} />}

          <footer className="footer"><span>ModernizeAI <span className="footer-sep">/</span> Evidence over guesses</span><span>Sample project · {state.events.length} workflow event{state.events.length === 1 ? "" : "s"}</span></footer>
        </div>
      </main>
      {menuOpen && <button className="mobile-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation"/>}
    </div>
  );
}

function pageDescription(page: string) {
  const descriptions: Record<string, string> = {
    Repository: "Browse the bundled Java source and its project notes.",
    Analysis: "Deterministic findings include file-level evidence and their detection method.",
    Architecture: "Compare the sample's current structure with a practical incremental target.",
    Modernization: "Review, approve, and apply a narrowly scoped change to your demo workspace.",
    Testing: "Inspect reproducible baseline and proposal verification results.",
    Security: "See what this demo does—and does not—scan.",
    Reports: "Export a measured assessment with explicit demo limitations.",
  };
  return descriptions[page] ?? "Modernize the sample application with evidence and human control.";
}

function Overview({ state, findings, runAnalysis, setPage }: {state: DemoState; findings: Finding[]; runAnalysis: () => void; setPage: (p: string) => void}) {
  const completed = [state.analyzed, state.approved, state.applied].filter(Boolean).length;
  const steps = [
    { title: "Analyze repository", detail: "Inspect bundled source and collect findings", done: state.analyzed, action: runAnalysis },
    { title: "Review proposed change", detail: "Inspect the bounded Product.java refactoring", done: state.approved, action: () => setPage("Modernization") },
    { title: "Verify and apply", detail: "Approval-gated browser-local patch history", done: state.applied, action: () => setPage("Modernization") },
  ];
  return <>
    <div className="metric-grid">
      <Metric icon={GitBranch} label="Repositories" value="1" note="Bundled sample" tone="blue"/>
      <Metric icon={AlertTriangle} label="Debt findings" value={state.analyzed ? String(findings.length) : "—"} note={state.analyzed ? "Evidence attached" : "Run analysis"} tone="amber"/>
      <Metric icon={GitPullRequest} label="Change status" value={state.applied ? "Applied" : state.approved ? "Approved" : "Pending"} note="One scoped proposal" tone="violet"/>
      <Metric icon={Shield} label="Critical security" value="—" note="Scanner unavailable" tone="green"/>
    </div>
    <div className="overview-grid">
      <section className="panel workflow-panel">
        <div className="panel-head"><div><h2>Modernization workflow</h2><p>Controlled, incremental, and reviewable</p></div><span className="progress-label">{completed} / 3 steps</span></div>
        <div className="progress-track"><span style={{width: `${(completed / 3) * 100}%`}}/></div>
        <div className="step-list">
          {steps.map((step, index) => <div className="workflow-step" key={step.title}>
            <div className={`step-number ${step.done ? "step-done" : ""}`}>{step.done ? <Check size={15}/> : `0${index + 1}`}</div>
            <div className="step-copy"><b>{step.title}</b><span>{step.detail}</span></div>
            <button className={`step-action ${step.done ? "done-action" : ""}`} onClick={step.action}>{step.done ? "Review" : index === 0 ? "Start" : "Open"}<ArrowRight size={14}/></button>
          </div>)}
        </div>
        <div className="workflow-note"><LockKeyhole size={15}/><span>Patch application is blocked until a person approves the proposal.</span></div>
      </section>
      <section className="panel repo-panel">
        <div className="panel-head"><div><h2>Imported repository</h2><p>Sample source · local demo</p></div><button className="icon-btn" onClick={() => setPage("Repository")} aria-label="Open repository"><ArrowRight size={17}/></button></div>
        <div className="repo-info"><div className="repo-big-icon"><Code2 size={21}/></div><div><b>LegacyInventory</b><span>Java · console application</span></div><span className="branch-chip"><GitBranch size={13}/>main</span></div>
        <div className="repo-stats"><div><span>Source files</span><b>2</b></div><div><span>Sample tests</span><b>1 smoke check</b></div><div><span>Import mode</span><b>Bundled fixture</b></div></div>
        <button className="text-button" onClick={() => setPage("Repository")}>Browse source <ArrowRight size={14}/></button>
      </section>
    </div>
    <div className="lower-grid">
      <section className="panel finding-panel">
        <div className="panel-head"><div><h2>Technical debt</h2><p>{state.analyzed ? "From deterministic source analysis" : "Analysis has not been run"}</p></div><button className="text-button" onClick={() => setPage("Analysis")}>View all <ArrowRight size={14}/></button></div>
        {state.analyzed ? findings.slice(0, 3).map((finding) => <FindingRow key={finding.id} finding={finding}/>) :
          <EmptyState icon={BarChart3} title="No analysis results yet" text="Run the bundled source analysis to populate findings." action={<button className="button secondary small" onClick={runAnalysis}><Play size={13}/> Analyze sample</button>}/>}
      </section>
      <section className="panel activity-panel">
        <div className="panel-head"><div><h2>Recent activity</h2><p>Local workflow audit trail</p></div><Activity size={17} className="muted-icon"/></div>
        {state.events.length ? state.events.slice(0, 4).map((event, i) => <div className="activity-row" key={`${event.time}-${i}`}><span className="activity-dot"><Check size={11}/></span><div><b>{event.label}</b><small>{event.time}</small></div></div>) : <EmptyState icon={Clock3} title="Nothing recorded yet" text="Workflow events appear here as you progress."/>}
      </section>
    </div>
  </>;
}

function Metric({icon: Icon, label, value, note, tone}: {icon: typeof Activity; label: string; value: string; note: string; tone: string}) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={17}/></div><div className="metric-content"><span>{label}</span><b>{value}</b><small>{note}</small></div><ArrowDownRight className="metric-corner" size={14}/></div>;
}

function FindingRow({finding}: {finding: Finding}) {
  return <div className="finding-row"><span className={`severity-dot ${finding.severity}`}/><div className="finding-main"><b>{finding.title}</b><span><FileCode2 size={12}/>{finding.file}:{finding.line} <span className="dot-sep">·</span> {finding.category}</span></div><span className={`severity-tag ${finding.severity}`}>{finding.severity}</span></div>;
}

function Repository({file, setFile, state}: {file: string; setFile: (f: string) => void; state: DemoState}) {
  const source = file === "Product.java" && state.applied ? currentProductSource(true) : sampleFiles[file];
  return <div className="repo-explorer panel">
    <div className="explorer-side"><div className="explorer-title"><span>FILES</span><ChevronDown size={14}/></div>
      <div className="tree-root"><ChevronDown size={14}/><span>legacy-inventory</span></div>
      <div className="tree-folder"><ChevronDown size={14}/><span>src/main/java</span></div>
      {["InventoryApp.java", "Product.java"].map((item) => <button key={item} className={`tree-file ${file === item ? "tree-selected" : ""}`} onClick={() => setFile(item)}><FileCode2 size={14}/>{item}</button>)}
      <button className={`tree-file ${file === "README.md" ? "tree-selected" : ""}`} onClick={() => setFile("README.md")}><FileText size={14}/>README.md</button>
      {state.applied && <div className="tree-applied"><CheckCircle2 size={13}/>Browser-local version applied</div>}
      <div className="source-note"><LockKeyhole size={13}/>Bundled sample only. No repository import or execution.</div>
    </div>
    <div className="source-pane"><div className="source-header"><div><FileCode2 size={15}/><span>{file}</span><span className="source-lang">{file.endsWith(".java") ? "Java" : "Markdown"}</span></div><span className="source-meta">{source.split("\n").length} lines</span></div>
      <pre className="code-view" aria-label={`${file} source`}>{source.split("\n").map((line, i) => <div className="code-line" key={i}><span className="line-number">{i + 1}</span><code>{line || " "}</code></div>)}</pre>
    </div>
  </div>;
}

function Analysis({findings, state, runAnalysis}: {findings: Finding[]; state: DemoState; runAnalysis: () => void}) {
  return <><div className="analysis-banner"><div className="banner-icon"><BarChart3 size={19}/></div><div><b>{state.analyzed ? `${findings.length} evidence-backed findings` : "Analysis not yet run"}</b><span>Deterministic patterns and structural heuristics; no model-generated conclusions.</span></div><button className="button secondary small" onClick={runAnalysis}><RefreshCw size={14}/> Run again</button></div>
    <section className="panel analysis-list"><div className="panel-head"><div><h2>Findings</h2><p>Every result includes a source path, line, and method.</p></div><span className="counter-chip">{state.analyzed ? findings.length : 0} findings</span></div>
      {state.analyzed ? findings.map((item) => <article className="finding-card" key={item.id}><div className="finding-card-top"><div className={`severity-tag ${item.severity}`}>{item.severity}</div><span className="category-chip">{item.category}</span><span className="method-chip">{item.method}</span></div><h3>{item.title}</h3><div className="evidence-location"><FileCode2 size={13}/>{item.file}:{item.line}</div><div className="evidence-box"><span>OBSERVED EVIDENCE</span><code>{item.evidence}</code></div><div className="recommendation"><Sparkles size={14}/><span><b>Suggested next step</b>{item.recommendation}</span></div></article>) :
      <EmptyState icon={BarChart3} title="Waiting for analysis" text="Run the deterministic scanner against the bundled Java sample." action={<button className="button primary small" onClick={runAnalysis}><Play size={13}/> Run analysis</button>}/>}
    </section>
  </>;
}

function Architecture() {
  return <><div className="arch-compare">
    <ArchColumn title="Current · LegacyInventory" sub="Observed from the bundled sample" nodes={[
      {title:"InventoryApp", type:"entry + app logic", color:"amber"},
      {title:"Product", type:"mutable domain object", color:"blue"},
      {title:"In-memory sample data", type:"no repository boundary", color:"gray"},
    ]} legacy/>
    <div className="arch-arrow"><ArrowRight size={20}/><span>incremental<br/>strangler path</span></div>
    <ArchColumn title="Target · ModernInventory" sub="Reference architecture, not generated output" nodes={[
      {title:"REST Controller", type:"HTTP boundary", color:"violet"},
      {title:"Inventory Service", type:"business rules", color:"blue"},
      {title:"Product Repository", type:"data access port", color:"green"},
      {title:"PostgreSQL", type:"persistent storage", color:"gray"},
    ]}/>
  </div><section className="panel roadmap"><div className="panel-head"><div><h2>Incremental roadmap</h2><p>Keep business behavior measurable at each step</p></div><span className="badge-demo">REFERENCE</span></div>
    {["Capture characterization tests for search, stock, and valuation", "Introduce a service boundary while keeping the console entry point", "Move persistence behind a repository and add database migrations", "Expose validated REST endpoints and containerize after tests pass"].map((item, i) => <div className="roadmap-row" key={item}><span className={`roadmap-index ${i === 0 ? "roadmap-next" : ""}`}>{String(i + 1).padStart(2, "0")}</span><span>{item}</span><span className={i === 0 ? "next-label" : "later-label"}>{i === 0 ? "NEXT" : "PLANNED"}</span></div>)}
  </section></>;
}

function ArchColumn({title, sub, nodes, legacy}: {title: string; sub: string; nodes: {title: string; type: string; color: string}[]; legacy?: boolean}) {
  return <section className="panel arch-column"><div className="arch-title"><div><h2>{title}</h2><p>{sub}</p></div>{legacy ? <span className="arch-label">AS-IS</span> : <span className="arch-label target-label">TO-BE</span>}</div><div className="arch-nodes">{nodes.map((node, i) => <div className="arch-node-wrap" key={node.title}><div className="arch-node"><span className={`node-mark ${node.color}`}><Boxes size={16}/></span><div><b>{node.title}</b><small>{node.type}</small></div></div>{i < nodes.length - 1 && <div className="node-connector"><span/></div>}</div>)}</div></section>;
}

function Modernization({state, approve, applyPatch}: {state: DemoState; approve: () => void; applyPatch: () => void}) {
  return <><div className="proposal-header panel"><div className="proposal-icon"><Code2 size={20}/></div><div className="proposal-title"><div className="proposal-kicker">PROPOSED REFACTORING <span className={`proposal-status ${state.applied ? "status-applied" : state.approved ? "status-approved" : ""}`}>{state.applied ? "APPLIED" : state.approved ? "APPROVED" : "AWAITING REVIEW"}</span></div><h2>{proposal.title}</h2><p>{proposal.summary}</p></div></div>
    <div className="proposal-meta-grid"><Meta label="Files changed" value="1 · Product.java"/><Meta label="Change type" value="Add pure domain query"/><Meta label="Requirement" value="Expose low-stock classification"/><Meta label="Verification" value="Source contract checks"/></div>
    <section className="panel diff-panel"><div className="panel-head"><div><h2>Proposed diff</h2><p>Only the in-memory demo workspace can be changed.</p></div><span className="diff-count"><span>+4</span><span>−1</span></span></div>
      <div className="diff-file-head"><FileCode2 size={14}/><b>Product.java</b><span>@@ Product accessors @@</span></div>
      <div className="diff-code"><div className="diff-line context"><span> </span><code>public int getQuantity() {"{ return quantity; }"}</code></div><div className="diff-line removed"><span>−</span><code>public int getReorderPoint() {"{ return reorderPoint; }"}</code></div><div className="diff-line added"><span>+</span><code>public boolean isLowStock() {"{"}</code></div><div className="diff-line added"><span>+</span><code>    return quantity &lt;= reorderPoint;</code></div><div className="diff-line added"><span>+</span><code>{"}"}</code></div><div className="diff-line added"><span>+</span><code>public int getReorderPoint() {"{ return reorderPoint; }"}</code></div></div>
      <div className="verification-box"><div className="verify-head"><CheckCircle2 size={16}/><b>Deterministic proposal checks</b><span>4 / 4 passed</span></div>{proposal.checks.map((check) => <div className="verify-row" key={check}><Check size={13}/>{check}</div>)}<p>These are source-contract checks, not a Java compiler or test-run result.</p></div>
      <div className="approval-footer"><div><LockKeyhole size={15}/><span>{state.approved ? "Human approval recorded." : "A human must approve this patch before application."}</span></div><div>{!state.approved && !state.applied && <button className="button secondary" onClick={approve}><Check size={15}/> Approve change</button>}{state.approved && !state.applied && <button className="button primary" onClick={applyPatch}><Play size={14} fill="currentColor"/> Apply to demo</button>}{state.applied && <span className="applied-chip"><CheckCircle2 size={15}/>Applied in browser workspace</span>}</div></div>
    </section>
    <p className="inline-warning"><AlertTriangle size={14}/>No code is pushed to GitHub. Reset demo clears this local patch history.</p>
  </>;
}
function Meta({label, value}: {label: string; value: string}) {return <div className="meta-card"><span>{label}</span><b>{value}</b></div>}

function Testing({state}: {state: DemoState}) {
  const tests = [
    {name:"LegacyInventory deterministic seed smoke check", suite:"Baseline · bundled Java", result:"Passed", detail:"2 seeded products; expected quantity observed"},
    {name:"Proposal scope and pure-query contract", suite:"Modernization · source checks", result:"Passed", detail:"One file; boundary includes reorder point"},
    {name:"Java compilation and JUnit suite", suite:"Not executed in browser demo", result:"Unavailable", detail:"Run the included JDK command locally"},
  ];
  return <><div className="metric-grid testing-metrics"><Metric icon={CheckCircle2} label="Recorded checks" value="2 / 2" note="Deterministic assertions" tone="green"/><Metric icon={TerminalSquare} label="Compilation" value="Not run" note="Requires local JDK" tone="amber"/><Metric icon={BarChart3} label="Coverage" value="—" note="No coverage instrumentation" tone="blue"/><Metric icon={Activity} label="Regression status" value={state.applied ? "Source check" : "Baseline"} note="No generated test suite" tone="violet"/></div>
    <section className="panel test-panel"><div className="panel-head"><div><h2>Verification history</h2><p>Results are not represented as full test coverage.</p></div><span className="counter-chip">3 checks</span></div>{tests.map((test) => <div className="test-row" key={test.name}><span className={`test-result ${test.result === "Passed" ? "test-pass" : "test-unavailable"}`}>{test.result === "Passed" ? <CheckCircle2 size={15}/> : <CircleDot size={15}/>}</span><div className="test-copy"><b>{test.name}</b><span>{test.suite}</span><small>{test.detail}</small></div><span className="test-status">{test.result}</span></div>)}</section>
  </>;
}

function Security() {
  return <><div className="security-callout"><div><Shield size={20}/></div><span><b>External security scanners are not configured</b><small>Nothing here should be interpreted as a Semgrep, Trivy, or secret-scan result.</small></span></div>
    <div className="security-grid"><SecurityCard icon={Shield} title="Static application security" status="Not configured" detail="Semgrep is not installed or invoked by this demo."/><SecurityCard icon={Boxes} title="Dependency vulnerabilities" status="Not configured" detail="No dependency advisory database was queried."/><SecurityCard icon={LockKeyhole} title="Secret detection" status="Not configured" detail="No repository scanner or uploaded repository is connected."/><SecurityCard icon={Activity} title="Container image scan" status="Not configured" detail="No image was built or scanned."/></div>
    <section className="panel security-boundary"><div className="panel-head"><div><h2>Safe-by-scope boundary</h2><p>What this demo intentionally avoids</p></div></div><div className="boundary-list"><div><CheckCircle2 size={15}/>Only checks source files bundled in this application</div><div><CheckCircle2 size={15}/>Does not accept archive uploads or run imported commands</div><div><CheckCircle2 size={15}/>Does not request GitHub, cloud, or model credentials</div></div></section>
  </>;
}
function SecurityCard({icon: Icon, title, status, detail}: {icon: typeof Shield; title: string; status: string; detail: string}) {return <div className="security-card"><div className="security-card-icon"><Icon size={16}/></div><div><span>{title}</span><b>{status}</b><small>{detail}</small></div><span className="unavailable-pill">N/A</span></div>}

function Reports({state, findings, exportReport}: {state: DemoState; findings: Finding[]; exportReport: () => void}) {
  return <section className="panel report-panel"><div className="report-icon"><FileText size={22}/></div><div className="report-copy"><span className="report-kicker">PORTFOLIO DEMONSTRATION</span><h2>Modernization assessment</h2><p>Exports current demo workflow state and deterministic source findings. No unmeasured business impact or model-generated recommendations are included.</p><div className="report-facts"><span><b>{state.analyzed ? findings.length : 0}</b> measured findings</span><span><b>{state.applied ? "Applied" : "Not applied"}</b> demo patch</span><span><b>{state.approved ? "Approved" : "Pending"}</b> human gate</span></div><button className="button primary" onClick={exportReport}><Download size={15}/> Download Markdown assessment</button></div></section>;
}
function EmptyState({icon: Icon, title, text, action}: {icon: typeof BarChart3; title: string; text: string; action?: React.ReactNode}) {return <div className="empty-state"><div><Icon size={18}/></div><b>{title}</b><span>{text}</span>{action}</div>}

export default App;
