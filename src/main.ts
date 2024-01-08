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
    private timeout: any = null;
    private watchdogInterval: any = null;
    private states!: InverterStates;
    private scheduler: Scheduler;
    private lastUpdated!: number;

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'sun2000-modbus',
        });
        this.scheduler = new Scheduler(this);
        this.on('ready', this.onReady.bind(this));
        //this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        // Initialize your adapter here

        this.states = new InverterStates(this, {intervals: [this.config.updateIntervalHigh, this.config.updateIntervalHigh, this.config.updateIntervalHigh]});

        //.return;

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

        if (this.device.isConnected()) {
            await this.setStateAsync('info.connection', true, true);
        }

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;

        this.scheduler.addInterval('HIGH', this.config.updateIntervalHigh, async () => {
            return this.states.updateStates(self, this.device, UpdateIntervalID.HIGH);
        });
        this.scheduler.addInterval('LOW', this.config.updateIntervalLow, async () => {
            const countHigh = await this.states.updateStates(self, this.device, UpdateIntervalID.HIGH);
            const countLow = await this.states.updateStates(self, this.device, UpdateIntervalID.LOW);
            return Promise.resolve(countHigh + countLow)
        });

        this.scheduler.init();

        this.log.info('Start fetching data from inverter');
        await this.runSync();
        await this.runWatchDog();

    }

    private async runWatchDog(): Promise<void> {
        this.watchdogInterval && this.clearInterval(this.watchdogInterval);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        this.log.info('Start watchdog');
        const maxInterval = Math.max(this.config.updateIntervalHigh, this.config.updateIntervalLow)
        this.log.info(`Max interval: [${maxInterval}]`);
        this.watchdogInterval = this.setInterval(async () => {
            const timeSinceLastUpdate = (new Date().getTime() - self.lastUpdated) / 1000;
            this.log.debug(`Watchdog: ${timeSinceLastUpdate}`)
            if (timeSinceLastUpdate > 2 * maxInterval) {
                this.log.info(`Re-trigger sync... timeoutID: ${self.timeout}`)
                await this.runSync();
            }
        }, maxInterval * 1000);
    }

    private async runSync(): Promise<void> {
        this.timeout && this.clearTimeout(this.timeout);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        self.lastUpdated = new Date().getTime();
        await this.scheduler.run();
        this.timeout = this.setTimeout(async () => {
            await this.runSync();
        }, 1000);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            this.setState('info.connection', false, true);
            this.timeout && this.clearTimeout(this.timeout);
            this.watchdogInterval && this.clearInterval(this.watchdogInterval);
            this.device.close();
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed state changes.
     * Not used yet. But will be used in future to set certain states.
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
