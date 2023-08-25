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
class Sun2000Modbus extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "sun2000-modbus"
    });
    this.updateInterval = null;
    this.states = new import_states.InverterStates();
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    await this.setStateAsync("info.ip", { val: this.config.address, ack: true });
    await this.setStateAsync("info.port", { val: this.config.port, ack: true });
    await this.setStateAsync("info.unitID", { val: this.config.modbusUnitId, ack: true });
    await this.setStateAsync("info.modbusUpdateInterval", { val: this.config.updateInterval, ack: true });
    this.log.info("config address: " + this.config.address);
    this.log.info("config port: " + this.config.port);
    this.log.info("config unitID: " + this.config.modbusUnitId);
    this.log.info("config updateInterval: " + this.config.updateInterval);
    this.device = new import_modbus_device.ModbusDevice(this.config.address, this.config.port, this.config.modbusUnitId);
    await this.states.createStates(this);
    await this.states.updateInitialStates(this, this.device);
    await this.setStateAsync("info.connection", true, true);
    let self = this;
    this.updateInterval = setInterval(async () => {
      await this.states.updateChangingStates(self, this.device);
    }, this.config.updateInterval * 1e3);
  }
  onUnload(callback) {
    try {
      this.setState("info.connection", false, true);
      this.updateInterval && clearInterval(this.updateInterval);
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
