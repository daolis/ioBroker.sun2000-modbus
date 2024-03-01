import {ModbusDatatype} from './modbus/modbus_types';
import {InverterStatus, MeterStatus, StorageStatus} from './state_enums';
import {AdapterInstance} from '@iobroker/adapter-core';
import {ModbusDevice} from './modbus/modbus_device';

type MapperFn = (value: any) => Promise<any>
type PostUpdateHookFn = (adapter: AdapterInstance, value: any) => Promise<Map<string, StateToUpdate>>

const MAX_GAP: number = 30;
const MAX_BLOCKLENGTH: number = 110;

interface DataField {
    interval?: UpdateIntervalID;
    state: State;
    register: ModbusRegister;
    mapper?: MapperFn;
    postUpdateHook?: PostUpdateHookFn;
}

export interface StateToUpdate {
    id: string;
    value: any;
    postUpdateHook?: PostUpdateHookFn;
}

interface State {
    id: string;
    name: string;
    type?: ioBroker.CommonType;
    role?: string;
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
    INTIAL,
    HIGH,
    LOW
}

type PostFetchUpdateHookFn = (adapter: AdapterInstance, toUpdate: Map<string, StateToUpdate>) => Map<string, StateToUpdate>;

interface PostFetchUpdateHook {
    interval: UpdateIntervalID;
    hookFn: PostFetchUpdateHookFn;
}

type PostInitialFetchHookFn = (adapter: AdapterInstance, initialValues: Map<string, StateToUpdate>) => DataField[];

interface PostInitialFetchHook {
    hookFn: PostInitialFetchHookFn
}

export interface FetchBlock {
    Start: number;
    End: number;
    Fields: DataField[];
}

export class InverterStates {

    // private updateIntervals: UpdateIntervals
    private readonly dataFields: DataField[];
    private readonly postFetchUpdateHooks: PostFetchUpdateHook[];
    private readonly postInitialFetchHooks: PostInitialFetchHook[];
    private adapter: AdapterInstance;

    private readonly fetchBlocks: Map<number, FetchBlock[]> = new Map<number, FetchBlock[]>();

    constructor(adapter: AdapterInstance) {
        this.adapter = adapter;
        this.dataFields = [
            // initial fields (no interval set) - no repetitive update
            {
                interval: UpdateIntervalID.INTIAL,
                state: {id: 'info.model', name: 'Model', type: 'string', role: 'info.name'},
                register: {reg: 30000, type: ModbusDatatype.string, length: 15}
            },
            {
                interval: UpdateIntervalID.INTIAL,
                state: {id: 'info.modelID', name: 'Model ID', type: 'number', role: 'info.hardware'},
                register: {reg: 30070, type: ModbusDatatype.uint16, length: 1}
            },
            {
                interval: UpdateIntervalID.INTIAL,
                state: {id: 'info.serialNumber', name: 'Serial number', type: 'string', role: 'info.serial'},
                register: {reg: 30015, type: ModbusDatatype.string, length: 10}
            },
            {
                interval: UpdateIntervalID.INTIAL,
                state: {id: 'info.ratedPower', name: 'Rated power', type: 'number', unit: 'W', role: 'value.power'},
                register: {reg: 30073, type: ModbusDatatype.int32, length: 2}
            },
            {
                interval: UpdateIntervalID.INTIAL,
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
                register: {reg: 32106, type: ModbusDatatype.uint32, length: 2, gain: 100}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'dailyEnergyYield', name: 'Daily energy yield', type: 'number', unit: 'kWh', role: 'value.energy'},
                register: {reg: 32114, type: ModbusDatatype.uint32, length: 2, gain: 100}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'monthlyEnergyYield', name: 'Monthly energy yield', type: 'number', unit: 'kWh', role: 'value.energy'},
                register: {reg: 32116, type: ModbusDatatype.uint32, length: 2, gain: 100}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'yearlyEnergyYield', name: 'Yearly energy yield', type: 'number', unit: 'kWh', role: 'value.energy'},
                register: {reg: 32118, type: ModbusDatatype.uint32, length: 2, gain: 100}
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
            {
                interval: UpdateIntervalID.HIGH,
                state: {id: 'alarm1', name: 'Alarm1'}, // Just read register and store the value in updated map to process at the end
                register: {reg: 32008, type: ModbusDatatype.uint16, length: 1},
            },
            {
                interval: UpdateIntervalID.HIGH,
                state: {id: 'alarm2', name: 'Alarm2'}, // Just read register and store the value in updated map to process at the end
                register: {reg: 32009, type: ModbusDatatype.uint16, length: 1},
            },
            {
                interval: UpdateIntervalID.HIGH,
                state: {id: 'alarm3', name: 'Alarm3'}, // Just read register and store the value in updated map to process at the end
                register: {reg: 32010, type: ModbusDatatype.uint16, length: 1},
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
                state: {id: 'storage.stateOfCharge', name: 'State of charge', type: 'number', unit: '%', role: 'value.battery', desc: 'SOC'},
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
                state: {id: 'storage.currentDayChargeCapacity', name: 'CurrentDayChargeCapacity', type: 'number', unit: 'kWh', role: 'value.energy', desc: 'TBD'},
                register: {reg: 37015, type: ModbusDatatype.uint32, length: 2, gain: 100}
            },
            {
                interval: UpdateIntervalID.LOW,
                state: {id: 'storage.currentDayDischargeCapacity', name: 'CurrentDayDischargeCapacity', type: 'number', unit: 'kWh', role: 'value.energy', desc: 'TBD'},
                register: {reg: 37786, type: ModbusDatatype.uint32, length: 2, gain: 100}
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
                state: {
                    id: 'grid.positiveActivePower',
                    name: 'Positive active power',
                    type: 'number',
                    role: 'value.power.active',
                    unit: 'kWh',
                    desc: 'Electricity fed by the inverter to the power grid.'
                },
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
            },
            {
                interval: UpdateIntervalID.HIGH,
                hookFn: (adapter: AdapterInstance, toUpdate: Map<string, StateToUpdate>) => {
                    const alarm1 = toUpdate.get('alarm1');
                    const alarm2 = toUpdate.get('alarm2');
                    const alarm3 = toUpdate.get('alarm3');
                    const result = new Map();
                    if (alarm1 && alarm2 && alarm3) {
                        const alarms = (alarm1.value >>> 0).toString(2) + (alarm2.value >>> 0).toString(2) + (alarm3.value >>> 0).toString(2);
                        if (alarms) {
                            result.set('alarms', {id: 'alarms', value: alarms})
                        }
                    }
                    return result;
                }
            }
        ];

        this.postInitialFetchHooks = [
            {
                hookFn: (adapter: AdapterInstance, initialValues: Map<string, StateToUpdate>) => {
                    const newFields: DataField[] = [];
                    const numberMPPTrackersObject = initialValues.get('info.numberMPPTrackers');
                    if (numberMPPTrackersObject) {
                        adapter.log.info(`Running MPPT post init hook with ${numberMPPTrackersObject.value} MPPTrackers`)
                        for (let i = 0; i < numberMPPTrackersObject.value; i++) {
                            const stateId: string = `mppt${i + 1}power`;
                            const registerValue: number = 32324 + 2 * i; // startRegister + registerLength * indexOfTracker
                            newFields.push({
                                interval: UpdateIntervalID.HIGH,
                                state: {
                                    id: stateId,
                                    name: `MPPT ${i + 1} Power`,
                                    type: 'number',
                                    unit: 'kWh',
                                    role: 'value.energy.produced',
                                    desc: `Total input power of MPPT${i + 1}`
                                },
                                register: {reg: registerValue, type: ModbusDatatype.int32, length: 2}
                            },);
                            adapter.log.info(`Dynamically added state '${stateId}', register [${registerValue}]`);
                        }
                    }
                    return newFields;
                }
            }
        ]

        const initalBlocks = this.blockFields(UpdateIntervalID.INTIAL);
        this.fetchBlocks.set(UpdateIntervalID.INTIAL, initalBlocks);
        adapter.log.info(`Calculated ${initalBlocks.length} fetch blocks for INITIAL registers`);
        for (const block of initalBlocks) {
            adapter.log.debug(`  [${block.Start}-${block.End}]`)
        }
    }

    private calculateBlocks(adapter: AdapterInstance) {
        const highBlocks = this.blockFields(UpdateIntervalID.HIGH);
        this.fetchBlocks.set(UpdateIntervalID.HIGH, highBlocks);
        adapter.log.info(`Calculated ${highBlocks.length} fetch blocks for HIGH interval registers`);
        for (const block of highBlocks) {
            adapter.log.debug(`  [${block.Start}-${block.End}]`)
        }

        const lowBlocks = this.blockFields(UpdateIntervalID.LOW);
        this.fetchBlocks.set(UpdateIntervalID.LOW, lowBlocks);
        adapter.log.info(`Calculated ${lowBlocks.length} fetch blocks for LOW interval registers`);
        for (const block of lowBlocks) {
            adapter.log.debug(`  [${block.Start}-${block.End}]`)
        }
    }

    private blockFields(interval: number): FetchBlock[] {
        this.dataFields.sort((a, b) => a.register.reg - b.register.reg);

        const blocks: FetchBlock[] = [];
        let currentBlock: FetchBlock = {Start: -1, End: -1, Fields: []};
        for (const field of this.dataFields) {
            if (field.interval !== interval) {
                continue;
            }
            const startAddr = field.register.reg;
            const endAddr = field.register.reg + field.register.length;
            if (currentBlock.Start == -1) {
                // new block
                currentBlock.Start = startAddr;
                currentBlock.End = endAddr;
                currentBlock.Fields = [field];
            } else if (startAddr <= currentBlock.End + MAX_GAP) {
                // extend current block
                currentBlock.End = endAddr
                currentBlock.Fields.push(field);
            } else {
                // add current block and start a new one
                blocks.push(currentBlock);
                currentBlock = {Start: startAddr, End: endAddr, Fields: [field]};
            }
        }
        // add last block
        if (currentBlock.Start !== -1) {
            blocks.push(currentBlock);
        }
        return this.combineBlocks(blocks, MAX_GAP + 5, 1)
    }

    private combineBlocks(blocks: FetchBlock[], gapSize: number, count: number): FetchBlock[] {
        count++;
        if (count > 20) {
            return blocks;
        }
        const combinedBlocks: FetchBlock[] = [];
        let maxBlockLen = 0;
        let i: number;
        for (i = 0; i < blocks.length - 1; i++) {
            if (blocks[i + 1].Start - blocks[i].End <= gapSize) {
                // combine blocks...
                const blockToAdd: FetchBlock = {Start: blocks[i].Start, End: blocks[i + 1].End, Fields: blocks[i].Fields.concat(blocks[i + 1].Fields)};
                const blockLen = blockToAdd.End - blockToAdd.Start;
                if (blockLen > maxBlockLen) {
                    maxBlockLen = blockLen;
                }
                if (blockLen <= maxBlockLen) {
                    combinedBlocks.push(blockToAdd);
                    i++; // skip next block
                    continue;
                }
            }
            const blockLen = blocks[i].End - blocks[i].Start;
            if (blockLen > maxBlockLen) {
                maxBlockLen = blockLen;
            }
            combinedBlocks.push(blocks[i]);
        }
        if (blocks.length - 1 == i) {
            // add last block, if not combined
            combinedBlocks.push(blocks[blocks.length - 1]);
        }
        if (maxBlockLen > MAX_BLOCKLENGTH || combinedBlocks.length == 1) {
            if (maxBlockLen > MAX_BLOCKLENGTH) {
                return blocks;
            } else {
                return combinedBlocks
            }
        }
        return this.combineBlocks(blocks, gapSize + 5, count);
    }

    public async createStates(adapter: AdapterInstance): Promise<void> {
        for (const field of this.dataFields) {
            const state = field.state;
            if (!state.type) {
                continue;
            }
            const description = `${state.desc} (Register: ${field.register.reg})`
            adapter.extendObject(state.id, {
                type: 'state',
                common: {
                    name: state.name,
                    type: state.type,
                    role: state.role,
                    unit: state.unit,
                    desc: description,
                    read: true,
                    write: false
                },
                native: {},
            });
        }
    }


    public async updateStates(adapter: AdapterInstance, device: ModbusDevice, interval: UpdateIntervalID): Promise<Map<string, StateToUpdate>> {
        let toUpdate = new Map<string, StateToUpdate>;
        const fetchBlock = this.fetchBlocks.get(interval);
        if (!fetchBlock) {
            throw new Error(`Unsupported interval ${interval}`);
        }

        this.adapter.log.debug(`Fetch data for ${fetchBlock.length} blocks`);

        for (const block of fetchBlock) {

            this.adapter.log.debug(`Fetch data for block [${block.Start}-${block.End}] containing ${block.Fields.length} registers`);

            try {
                const startAddress = block.Start;
                const blockLength = block.End - block.Start;
                const buffer = await device.readRawData(startAddress, blockLength);

                // adapter.log.info(`Buffer: ${buffer.toString()}`);
                for (const field of block.Fields) {
                    // get correct value from buffer (be aware of the *2 ->  fetching words, not bytes)
                    const startOffset = (field.register.reg - block.Start) * 2
                    const valueBuffer = buffer.subarray(startOffset, startOffset + (field.register.length * 2));
                    // adapter.log.debug(`GetFromBuffer: buffer-length: [${buffer.byteLength}],  offset [${startOffset}], length: [${field.register.length}]`);
                    let value: any = ModbusDatatype.fromBuffer(field.register.type, valueBuffer);
                    // adapter.log.debug(`GetFromBuffer: value for register [${field.register.reg},${field.register.length}] (${field.state.name}): ${value}`);

                    if (value === undefined) {
                        this.adapter.log.error(`Value for register '${field.register.reg}' is undefined!`);
                        continue;
                    }

                    if (field.register.gain) {
                        value /= field.register.gain;
                    }
                    if (field.mapper) {
                        value = await field.mapper(value);
                    }
                    toUpdate.set(field.state.id, {id: field.state.id, value: value});
                    if (field.postUpdateHook) {
                        const hookUpdates = await field.postUpdateHook(adapter, value);
                        for (const entry of hookUpdates.entries()) {
                            toUpdate.set(entry[0], entry[1]);
                        }
                    }
                }
            } catch (e) {
                adapter.log.warn(`Error while reading block from ${device.getIpAddress()}: [${block.Start}-${block.End}] '' with : ${e}`);
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

    public runPostInitialFetchHooks(adapter: AdapterInstance, updatedValues: Map<string, StateToUpdate>): void {
        for (const postInitialFetchHook of this.postInitialFetchHooks) {
            const additionalStates = postInitialFetchHook.hookFn(adapter, updatedValues)
            this.dataFields.concat(additionalStates)
            this.adapter.log.info(`Dynamically added ${additionalStates.length} states`);
        }
        this.calculateBlocks(adapter)
    }

    public async updateAdapterStates(adapter: AdapterInstance, toUpdate: Map<string, StateToUpdate>): Promise<Map<string, StateToUpdate>> {
        for (const updateEntry of toUpdate.values()) {
            if (updateEntry.value !== null) {
                await adapter.setStateAsync(updateEntry.id, {val: updateEntry.value, ack: true});
                if (updateEntry.postUpdateHook) {
                    await updateEntry.postUpdateHook(adapter, updateEntry.value);
                }
                adapter.log.silly(`Fetched value ${updateEntry.id}, val=[${updateEntry.value}]`);
            }
        }
        return Promise.resolve(toUpdate);
    }
}
