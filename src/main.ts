/*
 * Created with @iobroker/create-adapter v2.5.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';

// Load your modules here, e.g.:
import {InverterStates} from "./lib/states";
import {ModbusDevice} from "./lib/modbus/modbus_device";
// import * as fs from "fs";

class Sun2000Modbus extends utils.Adapter {

    private device!: ModbusDevice
    private updateInterval: any = null;
    private states: InverterStates = new InverterStates()

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'sun2000-modbus',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        // Initialize your adapter here

        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:
        await this.setStateAsync("info.ip", {val: this.config.address, ack: true});
        await this.setStateAsync("info.port", {val: this.config.port, ack: true});
        await this.setStateAsync("info.unitID", {val: this.config.modbusUnitId, ack: true});
        await this.setStateAsync("info.modbusUpdateInterval", {val: this.config.updateInterval, ack: true});

        this.log.info('config address: ' + this.config.address);
        this.log.info('config port: ' + this.config.port);
        this.log.info('config unitID: ' + this.config.modbusUnitId);
        this.log.info('config updateInterval: ' + this.config.updateInterval);

        this.device = new ModbusDevice(this.config.address, this.config.port, this.config.modbusUnitId);

        await this.states.createStates(this);
        await this.states.updateInitialStates(this, this.device);

        let self = this;
        this.updateInterval = setInterval(async () => {
            await this.states.updateChangingStates(self, this.device)
        }, this.config.updateInterval * 1000);


    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            this.setState("info.connection", false, true);
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
