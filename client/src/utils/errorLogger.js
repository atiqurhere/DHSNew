/**
 * Global Error Logger
 * Captures all errors and displays them visually on the page
 */

class ErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 10;
    this.createErrorPanel();
    this.setupErrorHandlers();
  }

  createErrorPanel() {
    // Create floating error panel
    const panel = document.createElement('div');
    panel.id = 'error-logger-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      max-width: 400px;
      max-height: 400px;
      overflow-y: auto;
      background: #fee;
      border: 2px solid #c00;
      border-radius: 8px;
      padding: 15px;
      z-index: 99999;
      font-family: monospace;
      font-size: 12px;
      display: none;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    `;

    const title = document.createElement('div');
    title.innerHTML = '<strong style="color: #c00;">🚨 Error Log</strong>';
    title.style.marginBottom = '10px';
    panel.appendChild(title);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.cssText = `
      background: #c00;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 10px;
    `;
    clearBtn.onclick = () => this.clearErrors();
    panel.appendChild(clearBtn);

    this.errorList = document.createElement('div');
    panel.appendChild(this.errorList);

    document.body.appendChild(panel);
    this.panel = panel;
  }

  setupErrorHandlers() {
    // Catch all unhandled errors
    window.addEventListener('error', (event) => {
      this.logError('Global Error', event.error || event.message);
    });

    // Catch all unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise', event.reason);
    });

    // Override console.error to capture those too
    const originalError = console.error;
    console.error = (...args) => {
      originalError.apply(console, args);
      this.logError('Console Error', args.join(' '));
    };
  }

  logError(type, error) {
    const timestamp = new Date().toLocaleTimeString();
    const errorObj = {
      type,
      message: error?.message || String(error),
      stack: error?.stack || '',
      timestamp
    };

    this.errors.push(errorObj);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    this.displayErrors();
  }

  displayErrors() {
    if (this.errors.length === 0) {
      this.panel.style.display = 'none';
      return;
    }

    this.panel.style.display = 'block';
    this.errorList.innerHTML = '';

    this.errors.forEach((err, index) => {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        background: white;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 4px;
        border-left: 3px solid #c00;
      `;

      errorDiv.innerHTML = `
        <div style="color: #c00; font-weight: bold;">${err.type}</div>
        <div style="color: #666; font-size: 10px;">${err.timestamp}</div>
        <div style="margin-top: 5px; color: #333;">${err.message}</div>
        ${err.stack ? `<details style="margin-top: 5px;">
          <summary style="cursor: pointer; color: #666;">Stack Trace</summary>
          <pre style="font-size: 10px; overflow-x: auto; margin-top: 5px;">${err.stack}</pre>
        </details>` : ''}
      `;

      this.errorList.appendChild(errorDiv);
    });
  }

  clearErrors() {
    this.errors = [];
    this.displayErrors();
  }
}

// Initialize error logger
if (typeof window !== 'undefined') {
  window.errorLogger = new ErrorLogger();
  console.log('🔍 Error Logger initialized - errors will be displayed on page');
}

export default ErrorLogger;
