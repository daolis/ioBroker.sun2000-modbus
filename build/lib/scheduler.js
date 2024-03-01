"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var scheduler_exports = {};
__export(scheduler_exports, {
  Scheduler: () => Scheduler
});
module.exports = __toCommonJS(scheduler_exports);
class Scheduler {
  constructor(adapter) {
    this.intervals = [];
    this.counter = 0;
    this.adapter = adapter;
  }
  addInterval(name, timeout, callback) {
    this.intervals.push({ name, timeout, callback });
  }
  init() {
    const allIntervals = this.intervals.map((value) => value.timeout);
    this.intervalLcm = this.lcm(allIntervals);
    this.adapter.log.info(`Scheduler intervals lcm ${this.intervalLcm}`);
  }
  async run() {
    this.adapter.log.silly("Run scheduler...");
    this.adapter.log.silly(`Scheduler: counter ${this.counter}`);
    for (const idx in this.intervals) {
      if (this.counter % this.intervals[idx].timeout == 0) {
        this.adapter.log.silly(`Scheduler: run ${this.intervals[idx].name}`);
        const start = new Date().getTime();
        const updatedCount = await this.intervals[idx].callback();
        const elapsed = new Date().getTime() - start;
        this.adapter.log.info(`Updated ${updatedCount.size} registers in ${elapsed / 1e3} sec, [${this.intervals[idx].name}]`);
      }
    }
    this.counter++;
    if (this.counter == this.intervalLcm) {
      this.adapter.log.debug("Scheduler: Resetting counter");
      this.counter = 0;
    }
    this.adapter.log.silly(`Scheduler: run callback finished: counter [${this.counter}]`);
  }
  lcm(values) {
    const gcd = (x, y) => !y ? x : gcd(y, x % y);
    const _lcm = (x, y) => x * y / gcd(x, y);
    return [...values].reduce((a, b) => _lcm(a, b));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Scheduler
});
//# sourceMappingURL=scheduler.js.map
