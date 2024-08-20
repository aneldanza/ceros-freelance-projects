define([], function () {
  class Utils {
    constructor() {
      this.clickTime = 0;
    }

    isDoubleClickBug() {
      if (Date.now() - this.clickTime < 200) {
        this.clickTime = Date.now();
        return true;
      } else {
        this.clickTime = Date.now();
        return false;
      }
    }

    getPolarizedValue(str) {
      if (str.includes("no")) {
        return "No";
      } else {
        return "Yes";
      }
    }

    capitalize(str) {
      return str[0].toUpperCase() + str.slice(1).toLowerCase();
    }
  }

  return Utils;
});
