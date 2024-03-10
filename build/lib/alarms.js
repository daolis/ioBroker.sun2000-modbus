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
var alarms_exports = {};
__export(alarms_exports, {
  alarmLevel: () => alarmLevel,
  inverterAlarms1: () => inverterAlarms1,
  inverterAlarms2: () => inverterAlarms2,
  inverterAlarms3: () => inverterAlarms3
});
module.exports = __toCommonJS(alarms_exports);
var alarmLevel = /* @__PURE__ */ ((alarmLevel2) => {
  alarmLevel2[alarmLevel2["Major"] = 0] = "Major";
  alarmLevel2[alarmLevel2["Minor"] = 1] = "Minor";
  alarmLevel2[alarmLevel2["Warning"] = 2] = "Warning";
  return alarmLevel2;
})(alarmLevel || {});
const inverterAlarms1 = (/* @__PURE__ */ new Map()).set("0", { name: "High String Input Voltage", id: 2001, level: 0 /* Major */ }).set("1", { name: "DC Arc Fault", id: 2002, level: 0 /* Major */ }).set("2", { name: "String Reverse Connection", id: 2011, level: 0 /* Major */ }).set("3", { name: "String Current Backfeed", id: 2012, level: 2 /* Warning */ }).set("4", { name: "Abnormal String Power", id: 2913, level: 2 /* Warning */ }).set("5", { name: "AFCI Self-Check Fail", id: 2021, level: 0 /* Major */ }).set("6", { name: "Phase Wire Short-Circuited to PE", id: 2031, level: 0 /* Major */ }).set("7", { name: "Grid Loss", id: 2032, level: 0 /* Major */ }).set("8", { name: "Grid Undervoltage", id: 2033, level: 0 /* Major */ }).set("9", { name: "Grid Overvoltage", id: 2034, level: 0 /* Major */ }).set("10", { name: "Grid Volt. Imbalance", id: 2035, level: 0 /* Major */ }).set("11", { name: "Grid Overfrequency", id: 2036, level: 0 /* Major */ }).set("12", { name: "Grid Underfrequency", id: 2037, level: 0 /* Major */ }).set("13", { name: "Unstable Grid Frequency", id: 2038, level: 0 /* Major */ }).set("14", { name: "Output Overcurrent", id: 2039, level: 0 /* Major */ }).set("15", { name: "Output DC Component Overhigh", id: 2040, level: 0 /* Major */ });
const inverterAlarms2 = (/* @__PURE__ */ new Map()).set("0", { name: "Abnormal Residual Current", id: 2051, level: 0 /* Major */ }).set("1", { name: "Abnormal Grounding", id: 2061, level: 0 /* Major */ }).set("2", { name: "Low Insulation Resistance", id: 2062, level: 0 /* Major */ }).set("3", { name: "Overtemperature", id: 2063, level: 1 /* Minor */ }).set("4", { name: "Device Fault", id: 2064, level: 0 /* Major */ }).set("5", { name: "Upgrade Failed or Version Mismatch", id: 2065, level: 1 /* Minor */ }).set("6", { name: "License Expired", id: 2066, level: 2 /* Warning */ }).set("7", { name: "Faulty Monitoring Unit", id: 61440, level: 1 /* Minor */ }).set("8", { name: "Faulty Power Collector", id: 2067, level: 0 /* Major */ }).set("9", { name: "Battery abnormal", id: 2068, level: 1 /* Minor */ }).set("10", { name: "Active Islanding", id: 2070, level: 0 /* Major */ }).set("11", { name: "Passive Islanding", id: 2071, level: 0 /* Major */ }).set("12", { name: "Transient AC Overvoltage", id: 2072, level: 0 /* Major */ }).set("13", { name: "Peripheral port short circuit", id: 2075, level: 2 /* Warning */ }).set("14", { name: "Churn output overload", id: 2077, level: 0 /* Major */ }).set("15", { name: "Abnormal PV module configuration", id: 2080, level: 0 /* Major */ });
const inverterAlarms3 = (/* @__PURE__ */ new Map()).set("0", { name: "", id: 20, level: 0 /* Major */ }).set("1", { name: "", id: 20, level: 0 /* Major */ }).set("2", { name: "", id: 20, level: 0 /* Major */ }).set("3", { name: "", id: 20, level: 0 /* Major */ }).set("4", { name: "", id: 20, level: 0 /* Major */ }).set("5", { name: "", id: 20, level: 0 /* Major */ }).set("6", { name: "", id: 20, level: 0 /* Major */ }).set("7", { name: "", id: 20, level: 0 /* Major */ }).set("8", { name: "", id: 20, level: 0 /* Major */ }).set("9", { name: "", id: 20, level: 0 /* Major */ }).set("10", { name: "", id: 20, level: 0 /* Major */ }).set("11", { name: "", id: 20, level: 0 /* Major */ }).set("12", { name: "", id: 20, level: 0 /* Major */ }).set("13", { name: "", id: 20, level: 0 /* Major */ }).set("14", { name: "", id: 20, level: 0 /* Major */ }).set("15", { name: "", id: 20, level: 0 /* Major */ });
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  alarmLevel,
  inverterAlarms1,
  inverterAlarms2,
  inverterAlarms3
});
//# sourceMappingURL=alarms.js.map
