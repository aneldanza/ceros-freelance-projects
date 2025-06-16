export class DoubleClickBugHandler {
  private clickObjectTimeTracker: Record<string, number>;

  constructor() {
    this.clickObjectTimeTracker = {};
  }

  isDoubleClickBug(layerId: string) {
    const now = Date.now();
    const lastTime = this.clickObjectTimeTracker[layerId];

    if (lastTime) {
      return now - lastTime < 200;
    } else {
      this.clickObjectTimeTracker[layerId] = now;
    }
  }
}
