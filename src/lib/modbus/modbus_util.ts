import ModbusRTU from "modbus-serial"
import "buffer";
import {ModbusDatatype} from "./modbus_types";
import log from "loglevel";

log.setLevel(log.levels.WARN);

export class ModbusConnection {
    private client: ModbusRTU;
    private readonly ipAddress: string;
    private readonly port: number;
    private readonly clientId: number;

    constructor(ipAddress: string, port: number, clientId: number) {
        this.ipAddress = ipAddress;
        this.port = port;
        this.clientId = clientId;
        this.client = new ModbusRTU();
    }

    async open() {
        // @ts-ignore
        if (!this.client.isOpen) {
            await this.expoBackoffConnect(2000, 20000);
        }
    }

    isOpen(): boolean {
        // @ts-ignore
        return this.client.isOpen;
    }

    close() {
        // @ts-ignore
        this.client.close(()=>{});
    }

    /**
     * read Holding Register (HR) from Modbus device
     * @param register decimal Modbus Register to read
     * @param dtype Datatype like signed or unsigned integer
     * @param length Number of occupied Modbus registers
     * @returns converted value from Register
     */
    async readModbusHR(register: number, dtype: ModbusDatatype, length?: number): Promise<any> {
        let words = ModbusDatatype.words(dtype);
        if (length != undefined) {
            words = length;
        }
        if (words == undefined) {
            throw new Error("A dtype with undefined length cant be used without passing a custom length!")
        }
        if (!this.isOpen()) {
            await this.open();
        }
        try {
            log.info("Length: " + words);
            let answer = await this.client.readHoldingRegisters(register, words);
            log.debug(`Answer: ${answer}`);
            return ModbusDatatype.fromBuffer(dtype, answer.buffer);
        } catch (e) {
            log.warn("Error while communicating with " + this.ipAddress + ": " + e);
        }
    }

    /**
     * read Input Register (IR) from Modbus device
     * @param register decimal Modbus Register to read
     * @param dtype Datatype like signed or unsigned integer
     * @param length Number of occupied Modbus registers
     * @returns readeble value from Register
     */
    async readModbusIR(register: number, dtype: ModbusDatatype, length?: number): Promise<any> {
        let words = ModbusDatatype.words(dtype);
        if (length != undefined) {
            words = length;
        }
        if (words == undefined) {
            throw new Error("A dtype with undefined length cant be used without passing a custom length!")
        }
        if (!this.isOpen()) {
            await this.open();
        }
        try {
            log.info("Length: " + words);
            let answer = await this.client.readInputRegisters(register, words);
            log.debug(answer);
            return ModbusDatatype.fromBuffer(dtype, answer.buffer);
        } catch (e) {
            log.warn("Error while communicating with " + this.ipAddress + ": " + e);
        }
    }

    private async expoBackoffConnect(delay: number, maxDelay: number): Promise<any> {
        try {
            this.close();
            this.client = new ModbusRTU();
            this.client.setID(this.clientId);
            await this.client.connectTcpRTUBuffered(this.ipAddress, {port: this.port});
            await this.asyncTimeout(delay);
            log.info("Connected to " + this.ipAddress);
        } catch (e) {
            log.warn("Couldnt connect to " + this.ipAddress + ":" + this.port);
            let nextDelay = delay * 2;
            if (nextDelay > maxDelay) {
                nextDelay = maxDelay;
            }
            await this.asyncTimeout(nextDelay);
            await this.expoBackoffConnect(nextDelay, maxDelay)
        }
    }

    private asyncTimeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
