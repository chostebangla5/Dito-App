export const haptics = {
  // Light tap — for most UI interactions (tabs, toggles)
  light: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  },
  
  // Medium — send message, button press
  medium: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
  },
  
  // Success — profile created, message delivered
  success: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([15, 50, 15]);
    }
  },
  
  // Heartbeat — when opening a chat (emotional moment)
  heartbeat: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([60, 80, 40]);
    }
  },
  
  // Error — invalid input
  error: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }
  },
};
