define([], function () {
  class Utils {
    constructor() {
      this.clickTime = 0;
    }

    /**
     * Detects if a click is a potential double click based on a time threshold.
     * @returns {boolean} True if it's a double click, false otherwise.
     */
    isDoubleClickBug() {
      const now = Date.now();
      const isDoubleClick = now - this.clickTime < 200;
      this.clickTime = now;
      return isDoubleClick;
    }

    /**
     * Converts a string to a "Yes" or "No" value based on its content.
     * @param {string} str - The string to evaluate.
     * @returns {string} "Yes" or "No".
     */
    getPolarizedValue(str) {
      return str.toLowerCase().includes("no") ? "No" : "Yes";
    }

    /**
     * Capitalizes the first letter of a string and makes the rest lowercase.
     * @param {string} str - The string to capitalize.
     * @returns {string} The capitalized string.
     */
    capitalize(str) {
      if (!str) return "";
      return str[0].toUpperCase() + str.slice(1).toLowerCase();
    }
  }

  return Utils;
});
