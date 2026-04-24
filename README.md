# editorjs-code-editor

A feature-rich code editor block for [Editor.js](https://editorjs.io) with **in-browser Python execution** powered by [Pyodide](https://pyodide.org) WebAssembly.

No server required — Python runs entirely in the browser.

**[Live Demo](https://amirtds.github.io/editorjs-code-editor/demo/)**

## Features

- **Run Python in the browser** — powered by Pyodide WebAssembly, no backend needed
- **12 language modes** — Python, JavaScript, HTML, CSS, JSON, SQL, YAML, Bash, XML, CSV, TSV, TOML
- **Syntax highlighting** — via CodeMirror 6 with the GitHub theme
- **4 visual styles** — Default, Bordered, Terminal, Minimal
- **Console output panel** — with error highlighting, execution timing, and clear button
- **Inline controls** — language picker pills, editable toggle, run button toggle
- **Style picker** — visual cards with live preview
- **Dark mode** — auto-detects via `data-theme`, `.dark` class, or `prefers-color-scheme`
- **Customizable CSS** — override CSS custom properties to match your theme
- **Zero toast dependency** — optional `onNotify` callback instead of forcing a notification library

## Installation

```bash
npm install editorjs-code-editor
```

You also need the peer dependencies:

```bash
npm install react react-dom @uiw/react-codemirror @uiw/codemirror-theme-github @codemirror/lang-python @codemirror/lang-javascript @codemirror/lang-html @codemirror/lang-css
```

Don't forget to import the CSS:

```js
import 'editorjs-code-editor/src/styles.css';
```

## Quick Start

```js
import EditorJS from '@editorjs/editorjs';
import CodeEditor from 'editorjs-code-editor';
import 'editorjs-code-editor/src/styles.css';

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    codeEditor: {
      class: CodeEditor,
    },
  },
});
```

## Python Execution

The plugin loads [Pyodide](https://pyodide.org) (Python compiled to WebAssembly) on demand when a Python code block is added. Key details:

- **Lazy loading** — Pyodide (~20MB) is only loaded when the user adds a Python block, not on page load
- **Singleton** — multiple code blocks on the same page share one Pyodide instance
- **Package support** — pre-install any pip package available in Pyodide via config
- **Stdout/stderr capture** — print output and errors are captured and displayed in the console panel
- **Execution timing** — shows how long the code took to run

### Pre-installing Python packages

```js
codeEditor: {
  class: CodeEditor,
  config: {
    preinstallPackages: ['numpy', 'pandas'],
  },
}
```

> **Note:** Only packages available in Pyodide's package index can be pre-installed. See [pyodide.org/en/stable/usage/packages-in-pyodide.html](https://pyodide.org/en/stable/usage/packages-in-pyodide.html) for the full list.

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pyodideVersion` | `string` | `"0.27.6"` | Pyodide CDN version to load |
| `preinstallPackages` | `string[]` | `[]` | Python packages to pre-install via micropip |
| `darkMode` | `boolean \| () => boolean` | auto-detect | Force dark/light mode, or provide a function |
| `onNotify` | `function` | no-op | Callback for notifications: `({ type, message }) => void` |

### Example with all options

```js
codeEditor: {
  class: CodeEditor,
  config: {
    pyodideVersion: '0.27.6',
    preinstallPackages: ['numpy'],
    darkMode: undefined, // auto-detect
    onNotify: ({ type, message }) => {
      // Wire up to your preferred toast library
      if (type === 'error') console.error(message);
      if (type === 'success') console.log(message);
    },
  },
}
```

## Styling

The plugin ships self-contained CSS with no external dependencies (no Tailwind, no DaisyUI). All classes are prefixed with `cej-` to avoid conflicts.

### CSS Custom Properties

Override these on `.cej-code-editor` or a parent element to match your theme:

```css
.cej-code-editor {
  --cej-bg: #ffffff;
  --cej-bg-muted: #f3f4f6;
  --cej-text: #1f2937;
  --cej-text-muted: #6b7280;
  --cej-border: #e5e7eb;
  --cej-primary: #22c55e;
  --cej-primary-text: #ffffff;
  --cej-error: #ef4444;
  --cej-terminal-bg: #1e1e1e;
  --cej-terminal-text: #cccccc;
  --cej-radius: 8px;
}
```

### Dark Mode

Dark mode is auto-detected via (in priority order):

1. `data-theme="dark"` on `<html>`
2. `.dark` class on `<html>` (Tailwind convention)
3. `prefers-color-scheme: dark` media query

You can override this with the `darkMode` config option.

## Data Format

The block saves the following JSON structure:

```json
{
  "type": "codeEditor",
  "data": {
    "editable": true,
    "language": "python",
    "code": "print('Hello, World!')",
    "showExecutionControls": false,
    "codeStyle": "default"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `editable` | `boolean` | Whether users can edit the code |
| `language` | `string` | One of the 12 supported languages |
| `code` | `string` | The source code content |
| `showExecutionControls` | `boolean` | Whether to show the Run button (Python only) |
| `codeStyle` | `string` | Visual style: `default`, `bordered`, `terminal`, or `minimal` |

## License

MIT - [Cubite](https://cubite.io)
