import {ModbusDatatype} from './modbus/modbus_types';
import {InverterStatus, MeterStatus, StorageStatus} from './state_enums';
import {AdapterInstance} from '@iobroker/adapter-core';
import {ModbusDevice} from './modbus/modbus_device';

type MapperFn = (value: any) => Promise<any>
type PostUpdateHookFn = (adapter: AdapterInstance, value: any) => Promise<Map<string, StateToUpdate>>
type PostFetchUpdateHookFn = (adapter: AdapterInstance, toUpdate: Map<string, StateToUpdate>) => Map<string, StateToUpdate>

interface DataField {
    interval?: UpdateIntervalID;
    state: State;
    register: ModbusRegister;
    mapper?: MapperFn;
    postUpdateHook?: PostUpdateHookFn;
}

interface StateToUpdate {
    id: string;
    value: any;
    postUpdateHook?: PostUpdateHookFn;
}

interface State {
    id: string;
    name: string;
    type: ioBroker.CommonType;
    role: string;
    unit?: string;
    desc?: string;
}

interface ModbusRegister {
    reg: number;
    type: ModbusDatatype;
    length: number;
    gain?: number;
}

export enum UpdateIntervalID {
    HIGH,
    LOW
}

interface UpdateIntervals {
    intervals: number[];
}

interface PostFetchUpdateHook {
    interval: UpdateIntervalID;
    hookFn: PostFetchUpdateHookFn;
}

export class InverterStates {

    private updateIntervals: UpdateIntervals
    private readonly dataFields: DataField[];
    private readonly postFetchUpdateHooks: PostFetchUpdateHook[];
    // private changingFields: DataField[];

    constructor(updateIntervals: UpdateIntervals) {
        this.updateIntervals = updateIntervals;
        this.dataFields = [
            // initial fields (no interval set) - no repetitive update
            {
                state: {id: 'info.model', name: 'Model', type: 'string', role: 'info.name'},
                register: {reg: 30000, type: ModbusDatatype.string, length: 15}
            },
            {
                state: {id: 'info.modelID', name: 'Model ID', type: 'number', role: 'info.hardware'},
                register: {reg: 30070, type: ModbusDatatype.uint16, length: 1}
            },
            {
                state: {id: 'info.serialNumber', name: 'Serial number', type: 'string', role: 'info.serial'},
                register: {reg: 30015, type: ModbusDatatype.string, length: 10}
            },
            {
                state: {id: 'info.ratedPower', name: 'Rated power', type: 'number', unit: 'W', role: 'value.power'},
                register: {reg: 30073, type: ModbusDatatype.int32, length: 2}
            },
            {
                state: {id: 'info.numberMPPTrackers', name: 'Number of MPP trackers', type: 'number', unit: '', role: 'value'},
                register: {reg: 30072, type: ModbusDatatype.uint16, length: 1, gain: 1}
            },

            // ####################################################################################################################################
            // inverter
            {
                interval: UpdateIntervalID.HIGH,
                state: {id: 'activePower', name: 'Active power', type: 'number', unit: 'W', role: 'value.power.active', desc: 'Power currently used'},
                register: {reg: 32080, type: ModbusDatatype.int32, length: 2}
            },
            {
                interval: UpdateIntervalID.HIGH,
                state: {id: 'inputPower', name: 'Input power', type: 'number', unit: 'W', role: 'value.power.produced', desc: 'Power from PV'},
                register: {reg: 32064, type: ModbusDatatype.int32, length: 2}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'peakActivePowerCurrenDay', name: 'Peak active power of current day', type: 'number', unit: 'W', role: 'value.power'},
                register: {reg: 32078, type: ModbusDatatype.int32, length: 2}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'efficiency', name: 'Efficiency', type: 'number', unit: '%', role: 'value'},
                register: {reg: 32086, type: ModbusDatatype.uint16, length: 1, gain: 100}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'internalTemperature', name: 'Internal temperature', type: 'number', unit: '°C', role: 'value.temperature'},
                register: {reg: 32087, type: ModbusDatatype.int16, length: 1, gain: 10}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'deviceStatus', name: 'Device status', type: 'string', unit: '', role: 'info.status'},
                register: {reg: 32089, type: ModbusDatatype.uint16, length: 1},
                mapper: value => Promise.resolve(InverterStatus[value])
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'accumulatedEnergyYield', name: 'Accumulated energy yield', type: 'number', unit: 'kWh', role: 'value.energy.produced'},
                register: {reg: 32106, type: ModbusDatatype.uint32, length: 2, gain: 100},
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'dailyEnergyYield', name: 'Daily energy yield', type: 'number', unit: 'kWh', role: 'value.energy'},
                register: {reg: 32114, type: ModbusDatatype.uint32, length: 2, gain: 100}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'generatedenergytoday', name: 'Daily generated Energy', type: 'number', unit: 'kWh', role: 'value.energy.produced'},
                register: {reg: 32114, type: ModbusDatatype.uint32, length: 2, gain: 100},
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'generatedenergymonth', name: 'Monthly generated Energy', type: 'number', unit: 'kWh', role: 'value.energy.produced'},
                register: {reg: 32116, type: ModbusDatatype.uint32, length: 2, gain: 100},
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'generatedenergyyear', name: 'Yearly generated Energy', type: 'number', unit: 'kWh', role: 'value.energy.produced'},
                register: {reg: 32118, type: ModbusDatatype.uint32, length: 2, gain: 100},
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'PV1Voltage', name: 'PV1 voltage', type: 'number', unit: 'V', role: 'value.voltage'},
                register: {reg: 32016, type: ModbusDatatype.int16, length: 1, gain: 10}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'PV1Current', name: 'PV1 current', type: 'number', unit: 'A', role: 'value.current'},
                register: {reg: 32017, type: ModbusDatatype.int16, length: 1, gain: 100}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'PV2Voltage', name: 'PV2 voltage', type: 'number', unit: 'V', role: 'value.voltage'},
                register: {reg: 32018, type: ModbusDatatype.int16, length: 1, gain: 10}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'PV2Current', name: 'PV2 current', type: 'number', unit: 'A', role: 'value.current'},
                register: {reg: 32019, type: ModbusDatatype.int16, length: 1, gain: 100}
            },
            // ####################################################################################################################################
            // MPPT
           {
                interval: UpdateIntervalID.LOW,
                state: {id: 'mppt1power', name: 'MPPT 1 Power', type: 'number', unit: 'kWh', role: 'value.energy.produced', desc: 'Total input power of MPPT1'},
                register: {reg: 32324, type: ModbusDatatype.int32, length: 2}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'mppt2power', name: 'MPPT 2 Power', type: 'number', unit: 'kWh', role: 'value.energy.produced', desc: 'Total input power of MPPT2'},
                register: {reg: 32326, type: ModbusDatatype.int32, length: 2}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'mppt3power', name: 'MPPT 3 Power', type: 'number', unit: 'kWh', role: 'value.energy.produced', desc: 'Total input power of MPPT3'},
                register: {reg: 32328, type: ModbusDatatype.int32, length: 2}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'mppt4power', name: 'MPPT 4 Power', type: 'number', unit: 'kWh', role: 'value.energy.produced', desc: 'Total input power of MPPT4'},
                register: {reg: 32330, type: ModbusDatatype.int32, length: 2}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'mppt5power', name: 'MPPT 5 Power', type: 'number', unit: 'kWh', role: 'value.energy.produced', desc: 'Total input power of MPPT5'},
                register: {reg: 32332, type: ModbusDatatype.int32, length: 2}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'mppt6power', name: 'MPPT 6 Power', type: 'number', unit: 'kWh', role: 'value.energy.produced', desc: 'Total input power of MPPT6'},
                register: {reg: 32334, type: ModbusDatatype.int32, length: 2}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'mppt7power', name: 'MPPT 7 Power', type: 'number', unit: 'kWh', role: 'value.energy.produced', desc: 'Total input power of MPPT7'},
                register: {reg: 32336, type: ModbusDatatype.int32, length: 2}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'mppt8power', name: 'MPPT 8 Power', type: 'number', unit: 'kWh', role: 'value.energy.produced', desc: 'Total input power of MPPT8'},
                register: {reg: 32338, type: ModbusDatatype.int32, length: 2}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'mppt9power', name: 'MPPT 9 Power', type: 'number', unit: 'kWh', role: 'value.energy.produced', desc: 'Total input power of MPPT9'},
                register: {reg: 32340, type: ModbusDatatype.int32, length: 2}
            },
            // ####################################################################################################################################
            // storage
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'storage.runningState', name: 'Running state', type: 'string', role: 'info.status'},
                register: {reg: 37762, type: ModbusDatatype.uint16, length: 1},
                mapper: value => Promise.resolve(StorageStatus[value])
            },
            {
                interval: UpdateIntervalID.HIGH,
                state: {id: 'storage.stateOfCapacity', name: 'State of capacity', type: 'number', unit: '%', role: 'value.battery', desc: 'SOC'},
                register: {reg: 37760, type: ModbusDatatype.uint16, length: 1, gain: 10}
            },
            {
                interval: UpdateIntervalID.HIGH,
                state: {id: 'storage.chargeDischargePower', name: 'Charge/Discharge power', desc: '(>0 charging, <0 discharging)', type: 'number', unit: 'W', role: 'value.power'},
                register: {reg: 37765, type: ModbusDatatype.int32, length: 2},
                postUpdateHook: async (adapter, value): Promise<Map<string, StateToUpdate>> => {
                    return Promise.resolve(new Map<string, StateToUpdate>([
                        ['storage.chargePower', {id: 'storage.chargePower', value: Math.max(0, value)}],
                        ['storage.dischargePower', {id: 'storage.dischargePower', value: Math.abs(Math.min(0, value))}]
                    ]));
                }
            },
            {
                interval: UpdateIntervalID.LOW,
                state: { id: 'storage.CurrentDayChargeCapacity', name: 'CurrentDayChargeCapacity', type: 'number', unit: 'kWh', role: 'value.energy', desc: 'TBD' },
                register: { reg: 37015, type: ModbusDatatype.uint32, length: 2, gain: 100 }
            },
            {
                interval: UpdateIntervalID.LOW,
                state: { id: 'storage.CurrentDayDischargeCapacity', name: 'CurrentDayDischargeCapacity', type: 'number', unit: 'kWh', role: 'value.energy', desc: 'TBD' },
                register: { reg: 37786, type: ModbusDatatype.uint32, length: 2, gain: 100 }
            },
                        {
                interval: UpdateIntervalID.LOW,
                state: { id: 'storage.TotalCharge', name: 'StorageTotalCharge', type: 'number', unit: 'kWh', role: 'value.energy', desc: 'TBD' },
                register: { reg: 37080, type: ModbusDatatype.uint32, length: 2, gain: 100 }
            },
            {
                interval: UpdateIntervalID.LOW,
                state: { id: 'storage.TotalDischarge', name: 'StorageTotalDischarge', type: 'number', unit: 'kWh', role: 'value.energy', desc: 'TBD' },
                register: { reg: 37782, type: ModbusDatatype.uint32, length: 2, gain: 100 }
            },

            // ####################################################################################################################################
            // grid (meter)
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'grid.meterStatus', name: 'Meter status', type: 'string', role: 'info.status'},
                register: {reg: 37100, type: ModbusDatatype.uint16, length: 1},
                mapper: value => Promise.resolve(MeterStatus[value])
            },
            {
                interval: UpdateIntervalID.HIGH,
                state: {id: 'grid.activePower', name: 'Active power', type: 'number', role: 'value.power.active', unit: 'W', desc: '(>0 feed-in to the power grid, <0: supply from the power grid)'},
                register: {reg: 37113, type: ModbusDatatype.int32, length: 2},
                postUpdateHook: async (adapter, value): Promise<Map<string, StateToUpdate>> => {
                    return Promise.resolve(new Map<string, StateToUpdate>([
                        ['grid.feedIn', {id: 'grid.feedIn', value: Math.max(0, value)}],
                        ['grid.supplyFrom', {id: 'grid.supplyFrom', value: Math.abs(Math.min(0, value))}]
                    ]));
                }
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'grid.reactivePower', name: 'Reactive power', type: 'number', role: 'value.power.reactive', unit: 'W'},
                register: {reg: 37115, type: ModbusDatatype.int32, length: 2},
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'grid.powerFactor', name: 'Power factor', type: 'number', role: 'value', unit: ''},
                register: {reg: 37117, type: ModbusDatatype.int16, length: 1, gain: 1000},
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'grid.gridFrequency', name: 'Grid frequency', type: 'number', role: 'value.frequency', unit: 'Hz'},
                register: {reg: 37118, type: ModbusDatatype.int16, length: 1, gain: 100},
            },

            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'grid.phase1Voltage', name: 'Phase 1 voltage', type: 'number', role: 'value.voltage', unit: 'V', desc: 'also L1, or R voltage'},
                register: {reg: 37101, type: ModbusDatatype.int32, length: 2, gain: 10},
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'grid.phase2Voltage', name: 'Phase 2 voltage', type: 'number', role: 'value.voltage', unit: 'V', desc: 'also L2, or S voltage'},
                register: {reg: 37103, type: ModbusDatatype.int32, length: 2, gain: 10},
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'grid.phase3Voltage', name: 'Phase 3 voltage', type: 'number', role: 'value.voltage', unit: 'V', desc: 'also L3, or T voltage'},
                register: {reg: 37105, type: ModbusDatatype.int32, length: 2, gain: 10},
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'grid.phase1Current', name: 'Phase 1 current', type: 'number', role: 'value.current', unit: 'A'},
                register: {reg: 37107, type: ModbusDatatype.int32, length: 2, gain: 100},
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'grid.phase2Current', name: 'Phase 2 current', type: 'number', role: 'value.current', unit: 'A'},
                register: {reg: 37109, type: ModbusDatatype.int32, length: 2, gain: 100},
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'grid.phase3Current', name: 'Phase 3 current', type: 'number', role: 'value.current', unit: 'A'},
                register: {reg: 37111, type: ModbusDatatype.int32, length: 2, gain: 100},
            },

            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'grid.positiveActivePower', name: 'Positive active power', type: 'number', role: 'value.power.active', unit: 'kWh', desc: 'Electricity fed by the inverter to the power grid.'},
                register: {reg: 37119, type: ModbusDatatype.int32, length: 2, gain: 100},
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'grid.reverseActivePower', name: 'Reverse active power', type: 'number', role: 'value.power.active', unit: 'kWh', desc: 'Power supplied from the power grid.'},
                register: {reg: 37121, type: ModbusDatatype.int32, length: 2, gain: 100},
            },
        ];
        this.postFetchUpdateHooks = [
            {
                interval: UpdateIntervalID.HIGH,
                hookFn: (adapter: AdapterInstance, toUpdate: Map<string, StateToUpdate>) => {
                    const powerGridActive = toUpdate.get('grid.activePower');
                    const powerActiveInverter = toUpdate.get('activePower');
                    const totalPowerUse = powerActiveInverter?.value - powerGridActive?.value;
                    adapter.log.silly(`PostFetchHook: calculate totalPowerUse ${powerGridActive?.value}, ${powerActiveInverter?.value}, ${totalPowerUse}`);
                    const result = new Map();
                    if (totalPowerUse) {
                        result.set('totalPowerUse', {id: 'totalPowerUse', value: totalPowerUse})
                    }
                    return result;
                }
            }
        ];
    }

    public async createStates(adapter: AdapterInstance): Promise<void> {
        for (const field of this.dataFields) {
            const state = field.state
            adapter.extendObject(state.id, {
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


    public async updateStates(adapter: AdapterInstance, device: ModbusDevice, interval?: UpdateIntervalID): Promise<number> {
        let toUpdate = new Map<string, StateToUpdate>;
        for (const field of this.dataFields) {
            if (field.interval != interval) {
                continue;
            }
            try {
                let value = await device.readModbusHR(field.register.reg, field.register.type, field.register.length);

                if (field.register.gain) {
                    value /= field.register.gain;
                }
                if (field.mapper) {
                    value = await field.mapper(value);
                }
                toUpdate.set(field.state.id, {id: field.state.id, value: value})
                if (field.postUpdateHook) {
                    const hookUpdates = await field.postUpdateHook(adapter, value);
                    for (const entry of hookUpdates.entries()) {
                        toUpdate.set(entry[0], entry[1]);
                    }
                }
            } catch (e) {
                adapter.log.warn(`Error while reading from ${device.getIpAddress()}: [${field.register.reg}|${field.register.length}] '' with : ${e}`);
                break;
            }
        }

        toUpdate = this.runPostFetchHooks(adapter, toUpdate, interval);

        return this.updateAdapterStates(adapter, toUpdate);
    }

    public runPostFetchHooks(adapter: AdapterInstance, toUpdate: Map<string, StateToUpdate>, interval: UpdateIntervalID | undefined): Map<string, StateToUpdate> {
        for (const postFetchHook of this.postFetchUpdateHooks) {
            if (postFetchHook.interval == interval) {
                const hookUpdates = postFetchHook.hookFn(adapter, toUpdate);
                for (const entry of hookUpdates.entries()) {
                    toUpdate.set(entry[0], entry[1]);
                }
            }
        }
        return toUpdate;
    }

    public async updateAdapterStates(adapter: AdapterInstance, toUpdate: Map<string, StateToUpdate>): Promise<number> {
        for(const updateEntry of toUpdate.values()) {
            if (updateEntry.value !== null) {
                await adapter.setStateAsync(updateEntry.id, {val: updateEntry.value, ack: true});
                if (updateEntry.postUpdateHook) {
                    await updateEntry.postUpdateHook(adapter, updateEntry.value);
                }
                adapter.log.silly(`Fetched value ${updateEntry.id}, val=[${updateEntry.value}]`);
            }
        }
        return Promise.resolve(toUpdate.size);
    }
}
