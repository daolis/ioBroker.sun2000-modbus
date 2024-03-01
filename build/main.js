"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_states = require("./lib/states");
var import_modbus_device = require("./lib/modbus/modbus_device");
var import_scheduler = require("./lib/scheduler");
class Sun2000Modbus extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "sun2000-modbus"
    });
    this.timeout = null;
    this.watchdogInterval = null;
    this.scheduler = new import_scheduler.Scheduler(this);
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    this.states = new import_states.InverterStates(this);
    await this.setStateAsync("info.ip", { val: this.config.address, ack: true });
    await this.setStateAsync("info.port", { val: this.config.port, ack: true });
    await this.setStateAsync("info.unitID", { val: this.config.modbusUnitId, ack: true });
    await this.setStateAsync("info.modbusUpdateIntervalHigh", { val: this.config.updateIntervalHigh, ack: true });
    await this.setStateAsync("info.modbusUpdateIntervalLow", { val: this.config.updateIntervalLow, ack: true });
    this.device = new import_modbus_device.ModbusDevice(this.config.address, this.config.port, this.config.modbusUnitId);
    if (this.device.isConnected()) {
      await this.setStateAsync("info.connection", true, true);
    }
    this.log.info("Update initial states");
    const initialValues = await this.states.updateStates(this, this.device, import_states.UpdateIntervalID.INTIAL);
    this.states.runPostInitialFetchHooks(this, initialValues);
    this.log.info("Create states");
    await this.states.createStates(this);
    const self = this;
    this.scheduler.addInterval("HIGH", this.config.updateIntervalHigh, async () => {
      return this.states.updateStates(self, this.device, import_states.UpdateIntervalID.HIGH);
    });
    this.scheduler.addInterval("LOW", this.config.updateIntervalLow, async () => {
      const countHighResult = await this.states.updateStates(self, this.device, import_states.UpdateIntervalID.HIGH);
      const countLowResult = await this.states.updateStates(self, this.device, import_states.UpdateIntervalID.LOW);
      return Promise.resolve(new Map([...countHighResult, ...countLowResult]));
    });
    this.scheduler.init();
    this.log.info("Start fetching data from inverter");
    await this.runSync();
    await this.runWatchDog();
  }
  async runWatchDog() {
    this.watchdogInterval && this.clearInterval(this.watchdogInterval);
    const self = this;
    this.log.info("Start watchdog");
    const maxInterval = Math.max(this.config.updateIntervalHigh, this.config.updateIntervalLow);
    this.log.info(`Max interval: [${maxInterval}]`);
    this.watchdogInterval = this.setInterval(async () => {
      const timeSinceLastUpdate = (new Date().getTime() - self.lastUpdated) / 1e3;
      this.log.debug(`Watchdog: ${timeSinceLastUpdate}`);
      if (timeSinceLastUpdate > 2 * maxInterval) {
        await this.setStateAsync("info.connection", false, true);
        this.log.info(`Re-trigger sync... timeoutID: ${self.timeout}`);
        this.device.close();
        await this.runSync();
      }
    }, maxInterval * 1e3);
  }
  async runSync() {
    this.timeout && this.clearTimeout(this.timeout);
    const self = this;
    self.lastUpdated = new Date().getTime();
    await this.scheduler.run();
    this.timeout = this.setTimeout(async () => {
      await this.runSync();
    }, 1e3);
  }
  onUnload(callback) {
    try {
      this.setState("info.connection", false, true);
      this.timeout && this.clearTimeout(this.timeout);
      this.watchdogInterval && this.clearInterval(this.watchdogInterval);
      this.device.close();
      callback();
    } catch (e) {
      callback();
    }
  }
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new Sun2000Modbus(options);
} else {
  (() => new Sun2000Modbus())();
}
//# sourceMappingURL=main.js.map
