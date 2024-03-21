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
  ChargeFromGrid: () => ChargeFromGrid,
  ForcibleChargeDischarge: () => ForcibleChargeDischarge,
  InverterStatus: () => InverterStatus,
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
  MeterStatus2[MeterStatus2["NORMAL"] = 1] = "NORMAL";
  return MeterStatus2;
})(MeterStatus || {});
var InverterStatus = /* @__PURE__ */ ((InverterStatus2) => {
  InverterStatus2[InverterStatus2["Standby_initializing"] = 0] = "Standby_initializing";
  InverterStatus2[InverterStatus2["Standby_Detecting_Insulation_Resistance"] = 1] = "Standby_Detecting_Insulation_Resistance";
  InverterStatus2[InverterStatus2["Standby_Detecting_Irradiation"] = 2] = "Standby_Detecting_Irradiation";
  InverterStatus2[InverterStatus2["Standby_Drid_Detecting"] = 3] = "Standby_Drid_Detecting";
  InverterStatus2[InverterStatus2["Starting"] = 256] = "Starting";
  InverterStatus2[InverterStatus2["On_Grid"] = 512] = "On_Grid";
  InverterStatus2[InverterStatus2["Grid_Connection_PowerLimited"] = 513] = "Grid_Connection_PowerLimited";
  InverterStatus2[InverterStatus2["Grid_Connection_SelfDerating"] = 514] = "Grid_Connection_SelfDerating";
  InverterStatus2[InverterStatus2["OffGrid_Running"] = 515] = "OffGrid_Running";
  InverterStatus2[InverterStatus2["Shutdown_Fault"] = 768] = "Shutdown_Fault";
  InverterStatus2[InverterStatus2["Shutdown_Command"] = 769] = "Shutdown_Command";
  InverterStatus2[InverterStatus2["Shutdown_OVGR"] = 770] = "Shutdown_OVGR";
  InverterStatus2[InverterStatus2["Shutdown_CommunicationDisconnected"] = 771] = "Shutdown_CommunicationDisconnected";
  InverterStatus2[InverterStatus2["Shutdown_PowerLimited"] = 772] = "Shutdown_PowerLimited";
  InverterStatus2[InverterStatus2["Shutdown_ManualStartupRequired"] = 773] = "Shutdown_ManualStartupRequired";
  InverterStatus2[InverterStatus2["Shutdown_DC_SwitchesDdisconnected"] = 774] = "Shutdown_DC_SwitchesDdisconnected";
  InverterStatus2[InverterStatus2["Shutdown_RapidCutoff"] = 775] = "Shutdown_RapidCutoff";
  InverterStatus2[InverterStatus2["Shutdown_InputUnderPower"] = 776] = "Shutdown_InputUnderPower";
  InverterStatus2[InverterStatus2["GridScheduling_cosPHIPCurve"] = 1025] = "GridScheduling_cosPHIPCurve";
  InverterStatus2[InverterStatus2["GridScheduling_QUCurve"] = 1026] = "GridScheduling_QUCurve";
  InverterStatus2[InverterStatus2["GridScheduling_PFUCurve"] = 1027] = "GridScheduling_PFUCurve";
  InverterStatus2[InverterStatus2["GridScheduling_DryContact"] = 1028] = "GridScheduling_DryContact";
  InverterStatus2[InverterStatus2["GridScheduling_QPCurve"] = 1029] = "GridScheduling_QPCurve";
  InverterStatus2[InverterStatus2["SpotCheckReady"] = 1280] = "SpotCheckReady";
  InverterStatus2[InverterStatus2["SpotChecking"] = 1281] = "SpotChecking";
  InverterStatus2[InverterStatus2["Inspecting"] = 1536] = "Inspecting";
  InverterStatus2[InverterStatus2["AFCISelfCheck"] = 1792] = "AFCISelfCheck";
  InverterStatus2[InverterStatus2["IVScanning"] = 2048] = "IVScanning";
  InverterStatus2[InverterStatus2["DCInputDetection"] = 2304] = "DCInputDetection";
  InverterStatus2[InverterStatus2["Running_OffGridCharging"] = 2560] = "Running_OffGridCharging";
  return InverterStatus2;
})(InverterStatus || {});
var ChargeFromGrid = /* @__PURE__ */ ((ChargeFromGrid2) => {
  ChargeFromGrid2[ChargeFromGrid2["Disabled"] = 0] = "Disabled";
  ChargeFromGrid2[ChargeFromGrid2["Enabled"] = 1] = "Enabled";
  return ChargeFromGrid2;
})(ChargeFromGrid || {});
var ForcibleChargeDischarge = /* @__PURE__ */ ((ForcibleChargeDischarge2) => {
  ForcibleChargeDischarge2[ForcibleChargeDischarge2["Stop"] = 0] = "Stop";
  ForcibleChargeDischarge2[ForcibleChargeDischarge2["Charge"] = 1] = "Charge";
  ForcibleChargeDischarge2[ForcibleChargeDischarge2["Discharge"] = 2] = "Discharge";
  return ForcibleChargeDischarge2;
})(ForcibleChargeDischarge || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChargeFromGrid,
  ForcibleChargeDischarge,
  InverterStatus,
  MeterStatus,
  StorageForcibleChargeDischarge,
  StorageStatus
});
//# sourceMappingURL=state_enums.js.map
