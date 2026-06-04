// ─── Production Console Disable ───────────────────────────────────────────────
// Prevents attackers from reading debug output or using console as an attack surface
const disableConsoleInProduction = () => {
  if (process.env.NODE_ENV === 'production') {
    const noop = () => {};
    ['log', 'debug', 'info', 'warn', 'table', 'dir', 'dirxml', 'group',
      'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'profile', 'profileEnd',
      'count', 'trace'].forEach((method) => {
      window.console[method] = noop;
    });
    // Keep console.error so critical runtime errors still surface
  }
};

// ─── DevTools Detection ────────────────────────────────────────────────────────
// When DevTools is opened, clear any sensitive data still in localStorage
// Note: This is a deterrent, not a hard security boundary. The real protection
// is httpOnly cookies — JS can never read those even from DevTools.
const startDevToolsDetection = () => {
  let devToolsOpen = false;

  const clearSensitiveStorage = () => {
    // Clear only token-related keys — keep cart/prefs
    ['token', 'adminToken', 'refreshToken', 'adminRefreshToken',
     'tokenExpiry', 'adminTokenExpiry', 'currentOTP', 'otpValue'].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  };

  // Method 1: Size-based detection (most reliable, works cross-browser)
  const threshold = 160;
  const detectViaSize = () => {
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    const opened = widthDiff || heightDiff;
    if (opened && !devToolsOpen) {
      devToolsOpen = true;
      clearSensitiveStorage();
    } else if (!opened) {
      devToolsOpen = false;
    }
  };

  // Method 2: console.log trick — a getter fires when DevTools formats an object
  const devToolsObj = Object.defineProperty({}, '_', {
    get() {
      clearSensitiveStorage();
      return 'DevTools detected';
    }
  });

  // Run detection every 2 seconds
  setInterval(detectViaSize, 2000);

  // Trigger on any console access (fires when DevTools formats the object)
  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      // eslint-disable-next-line no-console
      console.log('%c', devToolsObj);
    }, 3000);
  }
};

// ─── Disable right-click and common keyboard shortcuts ────────────────────────
// Basic deterrent against casual inspection. Determined users can still bypass.
const disableInspectShortcuts = () => {
  if (process.env.NODE_ENV !== 'production') return;

  document.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (view source)
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
    }
  });
};

// ─── Initialise all client-side security ─────────────────────────────────────
export const initClientSecurity = () => {
  disableConsoleInProduction();
  startDevToolsDetection();
  disableInspectShortcuts();
};
