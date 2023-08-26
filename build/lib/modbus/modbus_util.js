"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var modbus_util_exports = {};
__export(modbus_util_exports, {
  ModbusConnection: () => ModbusConnection
});
module.exports = __toCommonJS(modbus_util_exports);
var import_modbus_serial = __toESM(require("modbus-serial"));
var import_buffer = require("buffer");
var import_modbus_types = require("./modbus_types");
var import_loglevel = __toESM(require("loglevel"));
import_loglevel.default.setLevel(import_loglevel.default.levels.WARN);
class ModbusConnection {
  constructor(ipAddress, port, clientId) {
    this.ipAddress = ipAddress;
    this.port = port;
    this.clientId = clientId;
    this.client = new import_modbus_serial.default();
  }
  async open() {
    if (!this.client.isOpen) {
      await this.expoBackoffConnect(2e3, 2e4);
    }
  }
  isOpen() {
    return this.client.isOpen;
  }
  close() {
    this.client.close(() => {
    });
  }
  async readModbusHR(register, dtype, length) {
    let words = import_modbus_types.ModbusDatatype.words(dtype);
    if (length != void 0) {
      words = length;
    }
    if (words == void 0) {
      throw new Error("A dtype with undefined length cant be used without passing a custom length!");
    }
    if (!this.isOpen()) {
      await this.open();
    }
    import_loglevel.default.info("Length: " + words);
    let answer = await this.client.readHoldingRegisters(register, words);
    import_loglevel.default.debug(`Answer: ${answer}`);
    return import_modbus_types.ModbusDatatype.fromBuffer(dtype, answer.buffer);
  }
  async readModbusIR(register, dtype, length) {
    let words = import_modbus_types.ModbusDatatype.words(dtype);
    if (length != void 0) {
      words = length;
    }
    if (words == void 0) {
      throw new Error("A dtype with undefined length cant be used without passing a custom length!");
    }
    if (!this.isOpen()) {
      await this.open();
    }
    import_loglevel.default.info("Length: " + words);
    let answer = await this.client.readInputRegisters(register, words);
    import_loglevel.default.debug(answer);
    return import_modbus_types.ModbusDatatype.fromBuffer(dtype, answer.buffer);
  }
  async expoBackoffConnect(delay, maxDelay) {
    try {
      this.close();
      this.client = new import_modbus_serial.default();
      this.client.setID(this.clientId);
      await this.client.connectTcpRTUBuffered(this.ipAddress, { port: this.port });
      await this.asyncTimeout(delay);
      import_loglevel.default.info("Connected to " + this.ipAddress);
    } catch (e) {
      import_loglevel.default.warn("Couldnt connect to " + this.ipAddress + ":" + this.port);
      let nextDelay = delay * 2;
      if (nextDelay > maxDelay) {
        nextDelay = maxDelay;
      }
      await this.asyncTimeout(nextDelay);
      await this.expoBackoffConnect(nextDelay, maxDelay);
    }
  }
  asyncTimeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ModbusConnection
});
//# sourceMappingURL=modbus_util.js.map
