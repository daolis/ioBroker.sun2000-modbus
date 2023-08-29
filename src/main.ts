/*
 * Created with @iobroker/create-adapter v2.5.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';

// Load your modules here, e.g.:
import {InverterStates, UpdateIntervalID} from './lib/states';
import {ModbusDevice} from './lib/modbus/modbus_device';
import {Scheduler} from './lib/scheduler';

class Sun2000Modbus extends utils.Adapter {

    private device!: ModbusDevice;
    private updateInterval: any = null;
    private states!: InverterStates;
    private scheduler: Scheduler;

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'sun2000-modbus',
        });
        this.scheduler = new Scheduler(this);
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        // Initialize your adapter here

        this.states = new InverterStates({intervals: [this.config.updateIntervalHigh, this.config.updateIntervalHigh, this.config.updateIntervalHigh]});

        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:
        await this.setStateAsync('info.ip', {val: this.config.address, ack: true});
        await this.setStateAsync('info.port', {val: this.config.port, ack: true});
        await this.setStateAsync('info.unitID', {val: this.config.modbusUnitId, ack: true});
        await this.setStateAsync('info.modbusUpdateIntervalHigh', {val: this.config.updateIntervalHigh, ack: true});
        await this.setStateAsync('info.modbusUpdateIntervalLow', {val: this.config.updateIntervalLow, ack: true});

        this.device = new ModbusDevice(this.config.address, this.config.port, this.config.modbusUnitId);

        this.log.info('Create states');
        await this.states.createStates(this);
        this.log.info('Update initial states');
        await this.states.updateStates(this, this.device); // no recurring update

        await this.setStateAsync('info.connection', true, true);

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;

        this.scheduler.addInterval('HIGH', this.config.updateIntervalHigh, async () => {
            return this.states.updateStates(self, this.device, UpdateIntervalID.HIGH);
        });
        this.scheduler.addInterval('LOW', this.config.updateIntervalLow, async () => {
            return this.states.updateStates(self, this.device, UpdateIntervalID.LOW);
        });

        this.scheduler.init();

        this.log.info('Start syncing data from inverter');
        await this.scheduler.run();
    }

    // private sleep(ms: number) {
    //     return new Promise(resolve => setTimeout(resolve, ms))
    // }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            this.setState('info.connection', false, true);
            this.updateInterval && clearInterval(this.updateInterval);
            this.device.close();
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed state changes
     */
    private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Sun2000Modbus(options);
} else {
    // otherwise start the instance directly
    (() => new Sun2000Modbus())();
}
