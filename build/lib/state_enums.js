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
var state_enums_exports = {};
__export(state_enums_exports, {
  MeterStatus: () => MeterStatus,
  StorageForcibleChargeDischarge: () => StorageForcibleChargeDischarge,
  StorageStatus: () => StorageStatus
});
module.exports = __toCommonJS(state_enums_exports);
var StorageStatus = /* @__PURE__ */ ((StorageStatus2) => {
  StorageStatus2[StorageStatus2["OFFLINE"] = 0] = "OFFLINE";
  StorageStatus2[StorageStatus2["STANDBY"] = 1] = "STANDBY";
  StorageStatus2[StorageStatus2["RUNNING"] = 2] = "RUNNING";
  StorageStatus2[StorageStatus2["FAULT"] = 3] = "FAULT";
  StorageStatus2[StorageStatus2["SLEEP_MODE"] = 4] = "SLEEP_MODE";
  return StorageStatus2;
})(StorageStatus || {});
var StorageForcibleChargeDischarge = /* @__PURE__ */ ((StorageForcibleChargeDischarge2) => {
  StorageForcibleChargeDischarge2[StorageForcibleChargeDischarge2["STOP"] = 0] = "STOP";
  StorageForcibleChargeDischarge2[StorageForcibleChargeDischarge2["CHARGE"] = 1] = "CHARGE";
  StorageForcibleChargeDischarge2[StorageForcibleChargeDischarge2["DISCHARGE"] = 2] = "DISCHARGE";
  return StorageForcibleChargeDischarge2;
})(StorageForcibleChargeDischarge || {});
var MeterStatus = /* @__PURE__ */ ((MeterStatus2) => {
  MeterStatus2[MeterStatus2["OFFLINE"] = 0] = "OFFLINE";
  MeterStatus2[MeterStatus2["ONLINE"] = 1] = "ONLINE";
  return MeterStatus2;
})(MeterStatus || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MeterStatus,
  StorageForcibleChargeDischarge,
  StorageStatus
});
//# sourceMappingURL=state_enums.js.map
