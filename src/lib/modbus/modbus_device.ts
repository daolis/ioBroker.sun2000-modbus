import {ModbusDatatype} from './modbus_types';
import {ModbusConnection} from './modbus_util';

interface Device {
    readModbusHR(register: number, datatype: ModbusDatatype): Promise<any>;

    readModbusIR(register: number, datatype: ModbusDatatype): Promise<any>;

    getIpAddress(): string;
}

export class ModbusDevice implements Device {
    private connection: ModbusConnection;
    private ipAddress: string;
    private unitId: number;

    constructor(ipAddress: string, modbusPort: number = 502, unitId: number = 1 ) {
        this.unitId = unitId;
        this.connection = new ModbusConnection(ipAddress, modbusPort, this.unitId);
        this.ipAddress = ipAddress;
    }

    getIpAddress(): string {
        return this.ipAddress;
    }

    async readRawData(register: number, length: number): Promise<Buffer> {
        return this.connection.readRawData(register, length)
    }

    async readModbusHR(register: number, datatype: ModbusDatatype, length?: number): Promise<any> {
        return this.connection.readModbusHR(register, datatype, length);
    }

    async readModbusIR(register: number, datatype: ModbusDatatype, length?: number): Promise<any> {
        return this.connection.readModbusIR(register, datatype, length);
    }

    close(): void{
        this.connection.close();
    }

    isConnected(): boolean {
        return this.connection.isOpen()
    }
}
