export class DoubleClickBugHandler {
  private clickObjectTimeTracker: Record<string, number>;

  constructor() {
    this.clickObjectTimeTracker = {};
  }

  isDoubleClickBug(layerId: string) {
    const now = Date.now();
    const lastTime = this.clickObjectTimeTracker[layerId];
    this.clickObjectTimeTracker[layerId] = now;

    if (lastTime) {
      const timeBetweenClicks = now - lastTime;
      console.log(timeBetweenClicks);
      return timeBetweenClicks < 900;
    }
  }
}
