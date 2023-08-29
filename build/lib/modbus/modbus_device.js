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
var modbus_device_exports = {};
__export(modbus_device_exports, {
  ModbusDevice: () => ModbusDevice
});
module.exports = __toCommonJS(modbus_device_exports);
var import_modbus_util = require("./modbus_util");
class ModbusDevice {
  constructor(ipAddress, modbusPort = 502, unitId = 1) {
    this.unitId = unitId;
    this.connection = new import_modbus_util.ModbusConnection(ipAddress, modbusPort, this.unitId);
    this.ipAddress = ipAddress;
  }
  getIpAddress() {
    return this.ipAddress;
  }
  async readModbusHR(register, datatype, length) {
    return this.connection.readModbusHR(register, datatype, length);
  }
  async readModbusIR(register, datatype, length) {
    return this.connection.readModbusIR(register, datatype, length);
  }
  close() {
    this.connection.close();
  }
  isConnected() {
    return this.connection.isOpen();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ModbusDevice
});
//# sourceMappingURL=modbus_device.js.map
