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
  }

  return Utils;
});
