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
var states_exports = {};
__export(states_exports, {
  InverterStates: () => InverterStates
});
module.exports = __toCommonJS(states_exports);
var import_modbus_types = require("./modbus/modbus_types");
var import_state_enums = require("./state_enums");
class InverterStates {
  constructor() {
    this.initialFields = [
      {
        state: { id: "info.model", name: "Model", type: "string", role: "state" },
        register: { reg: 3e4, type: import_modbus_types.ModbusDatatype.string, length: 15 }
      },
      {
        state: { id: "info.modelID", name: "Model ID", type: "number", role: "state" },
        register: { reg: 30070, type: import_modbus_types.ModbusDatatype.uint16, length: 1 }
      },
      {
        state: { id: "info.serialNumber", name: "Serial number", type: "string", role: "state" },
        register: { reg: 30015, type: import_modbus_types.ModbusDatatype.string, length: 10 }
      },
      {
        state: { id: "info.ratedPower", name: "Rated power", type: "number", unit: "W", role: "state" },
        register: { reg: 30073, type: import_modbus_types.ModbusDatatype.int32, length: 2 }
      }
    ];
    this.changingFields = [
      {
        state: { id: "activePower", name: "", type: "number", unit: "W", role: "value.power", desc: "Power currently used" },
        register: { reg: 32080, type: import_modbus_types.ModbusDatatype.int32, length: 2 }
      },
      {
        state: { id: "inputPower", name: "", type: "number", unit: "W", role: "value.power", desc: "Power from PV" },
        register: { reg: 32064, type: import_modbus_types.ModbusDatatype.int32, length: 2 }
      },
      {
        state: { id: "storage.runningState", name: "Running state", type: "string", role: "value" },
        register: { reg: 37762, type: import_modbus_types.ModbusDatatype.uint16, length: 1 },
        mapper: (value) => Promise.resolve(import_state_enums.StorageStatus[value])
      },
      {
        state: { id: "storage.stateOfCapacity", name: "State of capacity", type: "number", unit: "%", role: "value.capacity" },
        register: { reg: 37760, type: import_modbus_types.ModbusDatatype.uint16, length: 1, gain: 10 }
      },
      {
        state: { id: "storage.chargeDischargePower", name: "Charge/Discharge power (>0 charging, <0 discharging)", type: "number", unit: "W", role: "value.power" },
        register: { reg: 37765, type: import_modbus_types.ModbusDatatype.int32, length: 2 }
      },
      {
        state: { id: "storage.forcibleChargeDischarge", name: "Forcible Charge/Discharge", type: "string", role: "value" },
        register: { reg: 47100, type: import_modbus_types.ModbusDatatype.uint16, length: 1 },
        mapper: (value) => Promise.resolve(import_state_enums.StorageForcibleChargeDischarge[value])
      },
      {
        state: { id: "grid.meterStatus", name: "Meter status", type: "string", role: "value.status" },
        register: { reg: 37100, type: import_modbus_types.ModbusDatatype.uint16, length: 1 },
        mapper: (value) => Promise.resolve(import_state_enums.MeterStatus[value])
      },
      {
        state: { id: "grid.activePower", name: "Active power", type: "number", role: "value.power" },
        register: { reg: 37113, type: import_modbus_types.ModbusDatatype.int32, length: 2 },
        mapper: (value) => Promise.resolve(import_state_enums.MeterStatus[value])
      }
    ];
  }
  async createStates(adapter) {
    const all = this.initialFields.concat(this.changingFields);
    for (const field of all) {
      const state = field.state;
      await adapter.setObjectNotExistsAsync(state.id, {
        type: "state",
        common: {
          name: state.name,
          type: state.type,
          role: state.role,
          unit: state.unit,
          read: true,
          write: false
        },
        native: {}
      });
    }
  }
  async updateInitialStates(adapter, device) {
    let toUpdate = [];
    for (const field of this.initialFields) {
      try {
        let value = await device.readModbusHR(field.register.reg, field.register.type, field.register.length);
        if (field.register.gain) {
          value /= field.register.gain;
        }
        if (field.mapper) {
          value = await field.mapper(value);
        }
        toUpdate.push({ id: field.state.id, value });
      } catch {
      }
    }
    for (const stateToUpdate of toUpdate) {
      if (stateToUpdate.value) {
        await adapter.setStateAsync(stateToUpdate.id, { val: stateToUpdate.value, ack: true });
      }
    }
  }
  async updateChangingStates(adapter, device) {
    let toUpdate = [];
    for (const field of this.changingFields) {
      try {
        let value = await device.readModbusHR(field.register.reg, field.register.type, field.register.length);
        if (field.register.gain) {
          value /= field.register.gain;
        }
        if (field.mapper) {
          value = await field.mapper(value);
        }
        toUpdate.push({ id: field.state.id, value });
      } catch {
      }
    }
    for (const stateToUpdate of toUpdate) {
      if (stateToUpdate.value) {
        await adapter.setStateAsync(stateToUpdate.id, { val: stateToUpdate.value, ack: true });
      }
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InverterStates
});
//# sourceMappingURL=states.js.map
