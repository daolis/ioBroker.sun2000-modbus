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
        // this.on('objectChange', this.onObjectChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        // Initialize your adapter here
        this.config.updateInterval = 5;

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

        // let model = await this.device.getModel();
        // this.log.info(`inverter model: ${model}`);
        // let modelId = await this.device.getModellID();
        // let serialNr = await this.device.getSerialNumber();
        // await this.setStateAsync("info.model", {val: model, ack: true});
        // await this.setStateAsync("info.modelID", {val: modelId, ack: true});
        // await this.setStateAsync("info.serialNumber", {val: serialNr, ack: true});

        let self = this;
        this.updateInterval = setInterval(async () => {
            await this.states.updateChangingStates(self, this.device)
        }, this.config.updateInterval * 1000);

        /*
        For every state in the system there has to be also an object of type state
        Here a simple template for a boolean variable named "testVariable"
        Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
        */
        // await this.setObjectNotExistsAsync('testVariable', {
        //     type: 'state',
        //     common: {
        //         name: 'testVariable',
        //         type: 'boolean',
        //         role: 'indicator',
        //         read: true,
        //         write: true,
        //     },
        //     native: {},
        // });

        // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
        // this.subscribeStates('testVariable');
        // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
        // this.subscribeStates('lights.*');
        // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
        // this.subscribeStates('*');

        /*
            setState examples
            you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
        */
        // the variable testVariable is set to true as command (ack=false)
        // await this.setStateAsync('testVariable', true);

        // same thing, but the value is flagged "ack"
        // ack should be always set to true if the value is received from or acknowledged from the target system
        // await this.setStateAsync('testVariable', { val: true, ack: true });

        // same thing, but the state is deleted after 30s (getState will return null afterwards)
        // await this.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });

        // examples for the checkPassword/checkGroup functions
        // let result = await this.checkPasswordAsync('admin', 'iobroker');
        // this.log.info('check user admin pw iobroker: ' + result);

        // result = await this.checkGroupAsync('admin', 'admin');
        // this.log.info('check group user admin group admin: ' + result);
    }

    // private async updateData() {
    //     await this.setStateAsync("info.connection", { val: this.device.isConnected(), ack: true})
    //
    //     let ratedPower = await this.device.getRatedPower();
    //     let activePower = await this.device.getActivePower();
    //     let inputPower = await this.device.getInputPower();
    //     let storageStateOfCapacity = await this.device.getStorageStateOfCapacity();
    //     let storageRunningState = await this.device.getStorageRunningStatus();
    //     let storageChargeDischargePower = await this.device.getStorageChargeDischargePower();
    //     let storageForcibleChargeDischarge = await this.device.getStorageForcibleChargeDischarge();
    //
    //     await this.setStateAsync("ratedPower", {val: ratedPower, ack: true});
    //     await this.setStateAsync("activePower", {val: activePower, ack: true});
    //     await this.setStateAsync("inputPower", {val: inputPower, ack: true});
    //     await this.setStateAsync("storage.runningState", {val: storageRunningState, ack: true});
    //     await this.setStateAsync("storage.stateOfCapacity", {val: storageStateOfCapacity, ack: true});
    //     await this.setStateAsync("storage.storageChargeDischargePower", {val: storageChargeDischargePower, ack: true});
    //     await this.setStateAsync("storage.storageForcibleChargeDischarge", {val: storageForcibleChargeDischarge, ack: true});
    //
    //     await this.setStateAsync("info.lastUpdate", {val: Date.now(), ack: true});
    // }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);
            this.setState("info.connection", false, true);
            this.updateInterval && clearInterval(this.updateInterval);
            this.device.close();
            callback();
        } catch (e) {
            callback();
        }
    }

    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  */
    // private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
    //     if (obj) {
    //         // The object was changed
    //         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    //     } else {
    //         // The object was deleted
    //         this.log.info(`object ${id} deleted`);
    //     }
    // }

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

    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
    //  */
    // private onMessage(obj: ioBroker.Message): void {
    //     if (typeof obj === 'object' && obj.message) {
    //         if (obj.command === 'send') {
    //             // e.g. send email or pushover or whatever
    //             this.log.info('send command');

    //             // Send response in callback if required
    //             if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
    //         }
    //     }

    // }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Sun2000Modbus(options);
} else {
    // otherwise start the instance directly
    (() => new Sun2000Modbus())();
}
