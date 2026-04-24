/**
 * Singleton Pyodide loader with configurable packages.
 * Multiple code editor blocks on the same page share one Pyodide instance.
 */

let pyodidePromise = null;

export function loadPyodide(config = {}) {
  if (!pyodidePromise) {
    const version = config.pyodideVersion || "0.27.6";
    pyodidePromise = new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.loadPyodide) {
        initPyodide(config, resolve, reject);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://cdn.jsdelivr.net/pyodide/v${version}/full/pyodide.js`;
      script.onload = () => initPyodide(config, resolve, reject);
      script.onerror = () => {
        pyodidePromise = null; // allow retry on failure
        reject(new Error("Failed to load Pyodide script"));
      };
      document.head.appendChild(script);
    });
  }
  return pyodidePromise;
}

async function initPyodide(config, resolve, reject) {
  try {
    const pyodide = await window.loadPyodide();
    await pyodide.loadPackage("micropip");

    const packages = config.preinstallPackages || [];
    if (packages.length > 0) {
      const installs = packages
        .map((p) => `await micropip.install('${p}')`)
        .join("\n");
      await pyodide.runPythonAsync(`import micropip\n${installs}`);
    }

    resolve(pyodide);
  } catch (error) {
    pyodidePromise = null; // allow retry on failure
    reject(error);
  }
}

export default loadPyodide;
