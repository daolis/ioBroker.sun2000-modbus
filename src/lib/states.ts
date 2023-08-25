import {ModbusDatatype} from "./modbus/modbus_types";
import {MeterStatus, StorageForcibleChargeDischarge, StorageStatus} from "./state_enums";
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

interface Channel {
    id: string;
    name: string
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
                state: {id: "info.ratedPower", name: "Rated power", type: 'number', unit: "W", role: 'state'},
                register: {reg: 30073, type: ModbusDatatype.int32, length: 2}
            }

        ];
        this.changingFields = [
            // inverter
            {
                state: {id: "activePower", name: "", type: 'number', unit: "W", role: 'value.power', desc: 'Power currently used'},
                register: {reg: 32080, type: ModbusDatatype.int32, length: 2}
            },
            {
                state: {id: "inputPower", name: "", type: 'number', unit: "W", role: 'value.power', desc: 'Power from PV'},
                register: {reg: 32064, type: ModbusDatatype.int32, length: 2}
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
                state: {id: "storage.chargeDischargePower", name: "Charge/Discharge power (>0 charging, <0 discharging)", type: 'number', unit: "W", role: 'value.power'},
                register: {reg: 37765, type: ModbusDatatype.int32, length: 2}
            },
            {
                state: {id: "storage.forcibleChargeDischarge", name: "Forcible Charge/Discharge", type: 'string', role: 'value'},
                register: {reg: 47100, type: ModbusDatatype.uint16, length: 1},
                mapper: value => Promise.resolve(StorageForcibleChargeDischarge[value])
            },

            // grid
            {
                state: {id: "grid.meterStatus", name: "Meter status", type: 'string', role: 'value.status'},
                register: {reg: 37100, type: ModbusDatatype.uint16, length: 1},
                mapper: value => Promise.resolve(MeterStatus[value])
            },
            {
                state: {id: "grid.activePower", name: "Active power", type: 'number', role: 'value.power'},
                register: {reg: 37113, type: ModbusDatatype.int32, length: 2},
                mapper: value => Promise.resolve(MeterStatus[value])
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
