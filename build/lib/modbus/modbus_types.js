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
var modbus_types_exports = {};
__export(modbus_types_exports, {
  ModbusDatatype: () => ModbusDatatype,
  ModbusPermission: () => ModbusPermission
});
module.exports = __toCommonJS(modbus_types_exports);
var import_int64_buffer = require("int64-buffer");
var ModbusDatatype = /* @__PURE__ */ ((ModbusDatatype2) => {
  ModbusDatatype2[ModbusDatatype2["acc32"] = 0] = "acc32";
  ModbusDatatype2[ModbusDatatype2["acc64"] = 1] = "acc64";
  ModbusDatatype2[ModbusDatatype2["bitfield16"] = 2] = "bitfield16";
  ModbusDatatype2[ModbusDatatype2["bitfield32"] = 3] = "bitfield32";
  ModbusDatatype2[ModbusDatatype2["enum16"] = 4] = "enum16";
  ModbusDatatype2[ModbusDatatype2["int16"] = 5] = "int16";
  ModbusDatatype2[ModbusDatatype2["int32"] = 6] = "int32";
  ModbusDatatype2[ModbusDatatype2["string"] = 7] = "string";
  ModbusDatatype2[ModbusDatatype2["sunssf"] = 8] = "sunssf";
  ModbusDatatype2[ModbusDatatype2["uint16"] = 9] = "uint16";
  ModbusDatatype2[ModbusDatatype2["uint32"] = 10] = "uint32";
  ModbusDatatype2[ModbusDatatype2["uint64"] = 11] = "uint64";
  ModbusDatatype2[ModbusDatatype2["buffer"] = 12] = "buffer";
  return ModbusDatatype2;
})(ModbusDatatype || {});
((ModbusDatatype2) => {
  function words(dtype) {
    switch (dtype) {
      case 0 /* acc32 */:
        return 2;
      case 1 /* acc64 */:
        return 4;
      case 2 /* bitfield16 */:
        return 1;
      case 3 /* bitfield32 */:
        return 2;
      case 4 /* enum16 */:
        return 1;
      case 5 /* int16 */:
        return 1;
      case 6 /* int32 */:
        return 2;
      case 7 /* string */:
        return void 0;
      case 8 /* sunssf */:
        return void 0;
      case 9 /* uint16 */:
        return 1;
      case 10 /* uint32 */:
        return 2;
      case 11 /* uint64 */:
        return 4;
      case 12 /* buffer */:
        return void 0;
    }
  }
  ModbusDatatype2.words = words;
  function fromBuffer(dtype, buffer) {
    switch (dtype) {
      case 5 /* int16 */:
        if (buffer.equals(Buffer.from("8000", "hex"))) {
          return void 0;
        } else {
          return buffer.readInt16BE(0);
        }
      case 6 /* int32 */:
        if (buffer.equals(Buffer.from("8000 0000", "hex"))) {
          return void 0;
        } else {
          return buffer.readInt32BE(0);
        }
      case 7 /* string */:
        return buffer.toString("utf-8").replace(/\0/g, "");
      case 12 /* buffer */:
        console.log(buffer);
        break;
      case 9 /* uint16 */:
        if (buffer.equals(Buffer.from("FFFF", "hex"))) {
          return void 0;
        } else {
          console.log(buffer);
          return buffer.readUInt16BE(0);
        }
      case 10 /* uint32 */:
        if (buffer.equals(Buffer.from("FFFFFFFF", "hex"))) {
          return void 0;
        } else {
          return buffer.readUInt32BE(0);
        }
      case 11 /* uint64 */:
        if (buffer.equals(Buffer.from("FFFFFFFFFFFFFFFF", "hex"))) {
          return void 0;
        } else {
          return new import_int64_buffer.Uint64BE(buffer).toNumber();
        }
      default:
        return void 0;
    }
  }
  ModbusDatatype2.fromBuffer = fromBuffer;
})(ModbusDatatype || (ModbusDatatype = {}));
var ModbusPermission = /* @__PURE__ */ ((ModbusPermission2) => {
  ModbusPermission2[ModbusPermission2["RW"] = 0] = "RW";
  ModbusPermission2[ModbusPermission2["RO"] = 1] = "RO";
  return ModbusPermission2;
})(ModbusPermission || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ModbusDatatype,
  ModbusPermission
});
//# sourceMappingURL=modbus_types.js.map
