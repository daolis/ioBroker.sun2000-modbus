import {ModbusDatatype} from "./modbus/modbus_types";
import {InverterStatus, MeterStatus, StorageForcibleChargeDischarge, StorageStatus} from "./state_enums";
import {AdapterInstance} from "@iobroker/adapter-core";
import {ModbusDevice} from "./modbus/modbus_device";

type MapperFn = (value: any) => Promise<string>

interface DataField {
    state: State;
    register: ModbusRegister;
    mapper?: MapperFn
}

interface StateToUpdate {
    id: string,
    value: any
}

interface State {
    id: string;
    name: string
    type: ioBroker.CommonType;
    role: string
    unit?: string;
    desc?: string;
}

interface ModbusRegister {
    reg: number;
    type: ModbusDatatype;
    length: number;
    gain?: number;
}

export class InverterStates {

    private initialFields: DataField[];
    private changingFields: DataField[];

    constructor() {
        this.initialFields = [
            {
                state: {id: "info.model", name: "Model", type: 'string', role: 'state'},
                register: {reg: 30000, type: ModbusDatatype.string, length: 15}
            },
            {
                state: {id: "info.modelID", name: "Model ID", type: 'number', role: 'state'},
                register: {reg: 30070, type: ModbusDatatype.uint16, length: 1}
            },
            {
                state: {id: "info.serialNumber", name: "Serial number", type: 'string', role: 'state'},
                register: {reg: 30015, type: ModbusDatatype.string, length: 10}
            },
            {
                state: {id: "info.ratedPower", name: "Rated power", type: 'number', unit: "kW", role: 'state'},
                register: {reg: 30073, type: ModbusDatatype.int32, length: 2, gain: 1000}
            }

        ];
        this.changingFields = [
            // inverter
            {
                state: {id: "activePower", name: "Active power", type: 'number', unit: "kW", role: 'value.power', desc: 'Power currently used'},
                register: {reg: 32080, type: ModbusDatatype.int32, length: 2, gain: 1000}
            },
            {
                state: {id: "inputPower", name: "Input power", type: 'number', unit: "kW", role: 'value.power', desc: 'Power from PV'},
                register: {reg: 32064, type: ModbusDatatype.int32, length: 2, gain: 1000}
            },
            {
                state: {id: "peakActivePowerCurrenDay", name: "Peak active power of current day", type: 'number', unit: "kW", role: 'value.power.max'},
                register: {reg: 32078, type: ModbusDatatype.int32, length: 2, gain: 1000}
            },
            {
                state: {id: "efficiency", name: "Efficiency", type: 'number', unit: "%", role: 'value.efficiency'},
                register: {reg: 32086, type: ModbusDatatype.uint16, length: 1, gain: 100}
            },
            {
                state: {id: "internalTemperature", name: "Internal temperature", type: 'number', unit: "°C", role: 'value.temp'},
                register: {reg: 32087, type: ModbusDatatype.int16, length: 1, gain: 10}
            },
            {
                state: {id: "deviceStaus", name: "Device status", type: 'string', unit: "", role: 'value.status'},
                register: {reg: 32089, type: ModbusDatatype.uint16, length: 1},
                mapper: value => Promise.resolve(InverterStatus[value])
            },
            {
                state: {id: "accumulatedEnergyYield", name: "Accumulated energy yield", type: 'number', unit: "kWh", role: 'value'},
                register: {reg: 32106, type: ModbusDatatype.uint32, length: 2, gain: 100}
            },
            {
                state: {id: "dailyEnergyYield", name: "Daily energy yield", type: 'number', unit: "kWh", role: 'value'},
                register: {reg: 32114, type: ModbusDatatype.uint32, length: 2, gain: 100}
            },

            // storage
            {
                state: {id: "storage.runningState", name: "Running state", type: 'string', role: 'value'},
                register: {reg: 37762, type: ModbusDatatype.uint16, length: 1},
                mapper: value => Promise.resolve(StorageStatus[value])
            },
            {
                state: {id: "storage.stateOfCapacity", name: "State of capacity", type: 'number', unit: "%", role: 'value.capacity'},
                register: {reg: 37760, type: ModbusDatatype.uint16, length: 1, gain: 10}
            },
            {
                state: {id: "storage.chargeDischargePower", name: "Charge/Discharge power", desc: "(>0 charging, <0 discharging)", type: 'number', unit: "W", role: 'value.power'},
                register: {reg: 37765, type: ModbusDatatype.int32, length: 2}
            },
            {
                state: {id: "storage.forcibleChargeDischarge", name: "Forcible Charge/Discharge", type: 'string', role: 'value'},
                register: {reg: 47100, type: ModbusDatatype.uint16, length: 1},
                mapper: value => Promise.resolve(StorageForcibleChargeDischarge[value])
            },

            // grid (meter)
            {
                state: {id: "grid.meterStatus", name: "Meter status", type: 'string', role: 'value.status'},
                register: {reg: 37100, type: ModbusDatatype.uint16, length: 1},
                mapper: value => Promise.resolve(MeterStatus[value])
            },
            {
                state: {id: "grid.activePower", name: "Active power", type: 'number', role: 'value.power', unit: "W", desc: "(>0 feed-in to the power grid, <0: supply from the power grid)"},
                register: {reg: 37113, type: ModbusDatatype.int32, length: 2},
            },
            {
                state: {id: "grid.reactivePower", name: "Reactive power", type: 'number', role: 'value.power', unit: "W"},
                register: {reg: 37115, type: ModbusDatatype.int32, length: 2},
            },
            {
                state: {id: "grid.powerFactor", name: "Power factor", type: 'number', role: 'value.power.factor', unit: "", desc: "(>0 feed-in to the power grid, <0: supply from the power grid)"},
                register: {reg: 37117, type: ModbusDatatype.int16, length: 1, gain: 1000},
            },
            {
                state: {id: "grid.gridFrequency", name: "Grid frequency", type: 'number', role: 'value.frequency', unit: "Hz"},
                register: {reg: 37118, type: ModbusDatatype.int16, length: 1, gain: 100},
            }
        ];
    }

    public async createStates(adapter: AdapterInstance): Promise<void> {
        const all = this.initialFields.concat(this.changingFields)
        for (const field of all) {
            const state = field.state
            await adapter.setObjectNotExistsAsync(state.id, {
                type: 'state',
                common: {
                    name: state.name,
                    type: state.type,
                    role: state.role,
                    unit: state.unit,
                    desc: state.desc,
                    read: true,
                    write: false
                },
                native: {},
            });
        }
    }

    public async updateInitialStates(adapter: AdapterInstance, device: ModbusDevice): Promise<void> {
        let toUpdate: StateToUpdate[] = [];
        for (const field of this.initialFields) {
            try {
                let value = await device.readModbusHR(field.register.reg, field.register.type, field.register.length);

                if (field.register.gain) {
                    value /= field.register.gain;
                }
                if (field.mapper) {
                    value = await field.mapper(value);
                }
                toUpdate.push({id: field.state.id, value: value});
            } catch {
                // do nothing - for now
            }
        }
        for (const stateToUpdate of toUpdate) {
            if (stateToUpdate.value) {
                await adapter.setStateAsync(stateToUpdate.id, {val: stateToUpdate.value, ack: true});
            }
        }
    }

    public async updateChangingStates(adapter: AdapterInstance, device: ModbusDevice): Promise<void> {
        let toUpdate: StateToUpdate[] = [];
        for (const field of this.changingFields) {
            try {
                let value = await device.readModbusHR(field.register.reg, field.register.type, field.register.length);

                if (field.register.gain) {
                    value /= field.register.gain;
                }
                if (field.mapper) {
                    value = await field.mapper(value);
                }
                toUpdate.push({id: field.state.id, value: value});
            } catch {
                // do nothing - for now
            }
        }
        for (const stateToUpdate of toUpdate) {
            if (stateToUpdate.value) {
                await adapter.setStateAsync(stateToUpdate.id, {val: stateToUpdate.value, ack: true});
            }
        }
    }
}