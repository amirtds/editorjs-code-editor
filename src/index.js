import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { loadPyodide as loadPyodideSingleton } from "./pyodide-loader.js";

/* ── Constants ────────────────────────────────────────────── */

const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "xml", label: "XML" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "csv", label: "CSV" },
  { value: "tsv", label: "TSV" },
  { value: "yaml", label: "YAML" },
  { value: "toml", label: "TOML" },
  { value: "bash", label: "Bash" },
];

const CODE_STYLES = [
  { id: "default", label: "Default", description: "Standard code block" },
  { id: "bordered", label: "Bordered", description: "Rounded with shadow" },
  { id: "terminal", label: "Terminal", description: "Dark terminal look" },
  { id: "minimal", label: "Minimal", description: "Clean, no extras" },
];

const DEFAULT_CODES = {
  python: "print('Hello, World!')",
  javascript: "console.log('Hello, World!');",
  html: "<h1>Hello, World!</h1>",
  css: "body {\n  background-color: #f0f0f0;\n}",
  xml: "<xml>\n  <hello>World</hello>\n</xml>",
  json: '{\n  "hello": "World"\n}',
  sql: "SELECT * FROM users;",
  csv: "name,age\nJohn,25\nJane,30",
  tsv: "name\tage\nJohn\t25\nJane\t30",
  yaml: "name: John\nage: 25\n",
  toml: 'name = "John"\nage = 25\n',
  bash: "echo 'Hello, World!'",
};

/* ── Dark mode detection ──────────────────────────────────── */

function detectDarkMode(configValue) {
  if (configValue !== undefined) {
    return typeof configValue === "function" ? configValue() : configValue;
  }
  const el = document.documentElement;
  if (el.dataset.theme === "dark" || el.classList.contains("dark")) return true;
  if (el.dataset.theme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/* ── SVG Icons ────────────────────────────────────────────── */

const BracesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="cej-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="cej-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="cej-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const TerminalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="cej-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="cej-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="cej-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);

/* ── Style thumbnails ─────────────────────────────────────── */

function StyleThumbnail({ id }) {
  const lines = (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ height: 2, width: "75%", background: "currentColor", opacity: 0.2, borderRadius: 1 }} />
      <div style={{ height: 2, width: "50%", background: "currentColor", opacity: 0.15, borderRadius: 1 }} />
      <div style={{ height: 2, width: "66%", background: "currentColor", opacity: 0.2, borderRadius: 1 }} />
    </div>
  );

  if (id === "terminal") {
    return (
      <div style={{ width: "100%", height: "100%", borderRadius: 4, background: "#1e1e1e", color: "#ccc", padding: 6, display: "flex", flexDirection: "column", gap: 2, justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#28c840" }} />
        </div>
        {lines}
      </div>
    );
  }

  const border = id === "bordered" ? "2px solid var(--cej-primary)" : id === "default" ? "1px solid var(--cej-border)" : "none";
  const radius = id === "bordered" ? 8 : id === "default" ? 4 : 2;

  return (
    <div style={{ width: "100%", height: "100%", borderRadius: radius, border, padding: 6, display: "flex", flexDirection: "column", justifyContent: "center", opacity: id === "minimal" ? 0.5 : 1 }}>
      {lines}
    </div>
  );
}

/* ── Style preview ────────────────────────────────────────── */

function StylePreview({ styleId, code, language }) {
  const previewLines = (code || "").split("\n").slice(0, 4);
  const displayCode = previewLines.join("\n") + (previewLines.length < (code || "").split("\n").length ? "\n..." : "");

  const wrapperClass = `cej-code-wrap-${styleId}`;

  return (
    <div className={wrapperClass}>
      {styleId === "terminal" && (
        <div className="cej-terminal-bar">
          <span className="cej-terminal-dot red" />
          <span className="cej-terminal-dot yellow" />
          <span className="cej-terminal-dot green" />
          <span className="cej-terminal-lang">{language}</span>
        </div>
      )}
      <div className="cej-preview-code" style={{
        background: styleId === "terminal" ? "var(--cej-terminal-bg)" : "var(--cej-bg-muted)",
        color: styleId === "terminal" ? "var(--cej-terminal-text)" : "var(--cej-text-muted)",
      }}>
        {displayCode || "// code preview"}
      </div>
    </div>
  );
}

/* ── Plugin class ──────────────────────────────────────────── */

class CodeEditor {
  static get toolbox() {
    return {
      title: "Code Editor",
      icon: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1'/><path d='M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1'/></svg>",
    };
  }

  constructor({ data, config }) {
    const defaults = {
      editable: true,
      language: "python",
      code: "print('Hello, World!')",
      showExecutionControls: false,
      codeStyle: "default",
    };
    this.data = { ...defaults, ...data };
    this.config = {
      onNotify: config?.onNotify || (() => {}),
      pyodideVersion: config?.pyodideVersion || "0.27.6",
      preinstallPackages: config?.preinstallPackages || [],
      darkMode: config?.darkMode,
      ...config,
    };
  }

  render() {
    const wrapper = document.createElement("div");
    const root = createRoot(wrapper);

    const CodeEditorComponent = ({ initialData, pluginConfig, pluginData }) => {
      const [activeTab, setActiveTab] = useState("editor");
      const [editable, setEditable] = useState(initialData.editable ?? true);
      const [language, setLanguage] = useState(initialData.language || "python");
      const [code, setCode] = useState(initialData.code || DEFAULT_CODES.python);
      const [output, setOutput] = useState("");
      const [isExecuting, setIsExecuting] = useState(false);
      const [hasError, setHasError] = useState(false);
      const [executionTime, setExecutionTime] = useState(null);
      const [pyodide, setPyodide] = useState(null);
      const [isDarkMode, setIsDarkMode] = useState(false);
      const [showExecutionControls, setShowExecutionControls] = useState(initialData.showExecutionControls ?? false);
      const [codeStyle, setCodeStyle] = useState(initialData.codeStyle || "default");

      const notify = pluginConfig.onNotify;
      const update = (field, value) => { pluginData[field] = value; };

      // Load Pyodide
      useEffect(() => {
        if (language !== "python" || pyodide) return;
        loadPyodideSingleton({
          pyodideVersion: pluginConfig.pyodideVersion,
          preinstallPackages: pluginConfig.preinstallPackages,
        })
          .then(setPyodide)
          .catch((err) => {
            console.error("Failed to load Pyodide:", err);
            notify({ type: "error", message: "Failed to load Python runtime" });
          });
      }, [language]);

      // Dark mode detection
      useEffect(() => {
        const detect = () => setIsDarkMode(detectDarkMode(pluginConfig.darkMode));
        detect();
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => detect();
        mq.addEventListener("change", handler);
        const observer = new MutationObserver(handler);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
        return () => { mq.removeEventListener("change", handler); observer.disconnect(); };
      }, []);

      const getLanguageExtension = () => {
        switch (language) {
          case "python": return [python()];
          case "javascript": return [javascript()];
          case "html": return [html()];
          case "css": return [css()];
          case "xml": return [html()];
          default: return [];
        }
      };

      const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        update("language", newLang);
        if (!code || code === (DEFAULT_CODES[language] || "")) {
          const newCode = DEFAULT_CODES[newLang] || "";
          setCode(newCode);
          update("code", newCode);
        }
        if (newLang !== "python" && showExecutionControls) {
          setShowExecutionControls(false);
          update("showExecutionControls", false);
        }
      };

      const handleRunCode = async () => {
        if (language !== "python") return;
        if (!pyodide) {
          notify({ type: "error", message: "Python runtime is not ready yet" });
          return;
        }

        setIsExecuting(true);
        setOutput("");
        setHasError(false);
        setExecutionTime(null);
        const startTime = performance.now();

        try {
          pyodide.setStderr({ batched: (o) => setOutput((p) => p + o + "\n") });
          pyodide.setStdout({ batched: (o) => setOutput((p) => p + o + "\n") });

          const result = await pyodide.runPythonAsync(code);
          if (result !== undefined) setOutput((p) => p + String(result) + "\n");

          setExecutionTime(((performance.now() - startTime) / 1000).toFixed(2));
          notify({ type: "success", message: "Code executed successfully" });
        } catch (error) {
          setOutput((p) => p + `${error.message}\n`);
          setHasError(true);
          setExecutionTime(((performance.now() - startTime) / 1000).toFixed(2));
          notify({ type: "error", message: "Error executing code" });
        } finally {
          setIsExecuting(false);
        }
      };

      const getEditorHeight = () => {
        const lines = (code || "").split("\n").length;
        return `${Math.max(80, Math.min(500, lines * 20 + 32))}px`;
      };

      const codeWrapClass = `cej-code-wrap-${codeStyle}`;

      return (
        <div className="cej-code-editor" data-dark={isDarkMode ? "true" : "false"}
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onPaste={(e) => e.stopPropagation()}>

          <div className="cej-block-label">
            <BracesIcon />
            Code Editor
          </div>

          {/* Tabs */}
          <div className="cej-tabs">
            <div className="cej-tabs-header">
              <button className={`cej-tab ${activeTab === "editor" ? "active" : ""}`} onClick={() => setActiveTab("editor")} type="button">Editor</button>
              <button className={`cej-tab ${activeTab === "style" ? "active" : ""}`} onClick={() => setActiveTab("style")} type="button">Style</button>
            </div>

            {/* Editor tab */}
            <div className={`cej-tab-content ${activeTab === "editor" ? "active" : ""}`}>
              {/* Language pills */}
              <div className="cej-pills">
                {LANGUAGES.map((lang) => (
                  <button key={lang.value} type="button"
                    className={`cej-pill ${language === lang.value ? "active" : ""}`}
                    onClick={() => handleLanguageChange(lang.value)}>
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Toggles */}
              <div className="cej-toggle-row">
                <label className="cej-toggle-label" title="When enabled, users can modify the code">
                  <span>Editable</span>
                  <input type="checkbox" className="cej-toggle" checked={editable}
                    onChange={(e) => { setEditable(e.target.checked); update("editable", e.target.checked); }} />
                </label>
                {language === "python" && (
                  <label className="cej-toggle-label" title="Show a Run button to execute Python code in the browser">
                    <span>Run button</span>
                    <input type="checkbox" className="cej-toggle" checked={showExecutionControls}
                      onChange={(e) => { setShowExecutionControls(e.target.checked); update("showExecutionControls", e.target.checked); }} />
                  </label>
                )}
              </div>

              {/* Code editor */}
              <div className={codeWrapClass}>
                {codeStyle === "terminal" && (
                  <div className="cej-terminal-bar">
                    <span className="cej-terminal-dot red" />
                    <span className="cej-terminal-dot yellow" />
                    <span className="cej-terminal-dot green" />
                    <span className="cej-terminal-lang">{language}</span>
                  </div>
                )}
                <CodeMirror
                  value={code}
                  height={getEditorHeight()}
                  extensions={getLanguageExtension()}
                  onChange={(value) => { setCode(value); update("code", value); }}
                  editable={editable}
                  theme={codeStyle === "terminal" ? githubDark : (isDarkMode ? githubDark : githubLight)}
                  basicSetup={{
                    lineNumbers: true, highlightActiveLineGutter: true, highlightSpecialChars: true,
                    foldGutter: true, drawSelection: true, dropCursor: true,
                    allowMultipleSelections: true, indentOnInput: true, bracketMatching: true,
                    closeBrackets: true, autocompletion: true, rectangularSelection: true,
                    crosshairCursor: true, highlightActiveLine: true, highlightSelectionMatches: true,
                    closeBracketsKeymap: true, defaultKeymap: true, searchKeymap: true,
                    historyKeymap: true, foldKeymap: true, completionKeymap: true, lintKeymap: true,
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Console panel */}
              {language === "python" && showExecutionControls && (
                <div className="cej-console">
                  <div className="cej-console-toolbar">
                    <TerminalIcon />
                    <span className="cej-console-label">Console</span>
                    <span className="cej-spacer" />
                    {executionTime && <span className="cej-console-time">{executionTime}s</span>}
                    {output && (
                      <button className="cej-btn cej-btn-ghost" type="button"
                        onClick={() => { setOutput(""); setHasError(false); setExecutionTime(null); }}
                        disabled={isExecuting}>
                        <XIcon /> Clear
                      </button>
                    )}
                    <button className={`cej-btn ${isExecuting ? "" : "cej-btn-primary"}`} type="button"
                      onClick={handleRunCode} disabled={isExecuting}>
                      {isExecuting ? (<><span className="cej-spinner" /> Running...</>) : (<><PlayIcon /> Run</>)}
                    </button>
                  </div>
                  <div className={`cej-console-output ${hasError ? "has-error" : ""}`}>
                    {output ? (
                      <>
                        {hasError && (
                          <div className="cej-error-label"><AlertIcon /> Error</div>
                        )}
                        {output}
                      </>
                    ) : (
                      <div className="cej-console-placeholder">Click Run to execute code...</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Style tab */}
            <div className={`cej-tab-content ${activeTab === "style" ? "active" : ""}`}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--cej-text-muted)", marginBottom: 16 }}>Choose a code style</div>
              <div className="cej-style-grid">
                {CODE_STYLES.map((style) => (
                  <button key={style.id} type="button"
                    className={`cej-style-card ${codeStyle === style.id ? "active" : ""}`}
                    onClick={() => { setCodeStyle(style.id); update("codeStyle", style.id); }}>
                    <div className="cej-style-thumb">
                      <StyleThumbnail id={style.id} />
                    </div>
                    <div className="cej-style-name">{style.label}</div>
                    <div className="cej-style-desc">{style.description}</div>
                    {codeStyle === style.id && <div className="cej-style-check"><CheckIcon /></div>}
                  </button>
                ))}
              </div>
              <div className="cej-preview-label">Preview</div>
              <StylePreview styleId={codeStyle} code={code} language={language} />
            </div>
          </div>
        </div>
      );
    };

    root.render(
      <CodeEditorComponent
        initialData={this.data}
        pluginConfig={this.config}
        pluginData={this.data}
      />
    );
    return wrapper;
  }

  save() {
    return {
      editable: this.data.editable,
      language: this.data.language,
      code: this.data.code,
      showExecutionControls: this.data.showExecutionControls,
      codeStyle: this.data.codeStyle,
    };
  }
}

export default CodeEditor;
