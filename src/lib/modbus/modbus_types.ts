import {Uint64BE} from "int64-buffer";


export enum ModbusDatatype {
    acc32,
    acc64,
    bitfield16,
    bitfield32,
    enum16,
    int16,
    int32,
    string,
    sunssf,
    uint16,
    uint32,
    uint64,
    buffer
}
export namespace ModbusDatatype {
    export function words(dtype: ModbusDatatype): number | undefined{
        switch (dtype) {
            case ModbusDatatype.acc32: return 2;
            case ModbusDatatype.acc64: return 4;
            case ModbusDatatype.bitfield16: return 1;
            case ModbusDatatype.bitfield32: return 2;
            case ModbusDatatype.enum16: return 1;
            case ModbusDatatype.int16: return 1;
            case ModbusDatatype.int32: return 2;
            case ModbusDatatype.string: return undefined;
            case ModbusDatatype.sunssf: return undefined;
            case ModbusDatatype.uint16: return 1;
            case ModbusDatatype.uint32: return 2;
            case ModbusDatatype.uint64: return 4;
            case ModbusDatatype.buffer: return undefined;
            
        }
    }

    export function fromBuffer(dtype: ModbusDatatype, buffer: Buffer): number | string | undefined {
        switch (dtype) {
            case ModbusDatatype.int16:
                if (buffer.equals(Buffer.from("8000", "hex"))){
                    return undefined;
                }else{
                    return buffer.readInt16BE(0);
                }
            case ModbusDatatype.int32:
                if(buffer.equals(Buffer.from("8000 0000", "hex"))){
                    return undefined;
                }else{
                    return buffer.readInt32BE(0);
                }
            case ModbusDatatype.string: return buffer.toString("utf-8").replace(/\0/g, '');
            case ModbusDatatype.buffer: console.log(buffer); break
            
            case ModbusDatatype.uint16:
                if(buffer.equals(Buffer.from("FFFF", "hex"))){
                    return undefined;
                }else{
                    console.log(buffer);
                    return buffer.readUInt16BE(0)
                }
            case ModbusDatatype.uint32 || ModbusDatatype.acc32:
                if(buffer.equals(Buffer.from("FFFFFFFF", "hex"))){
                    return undefined;
                }else{
                    return buffer.readUInt32BE(0)
                }
            case ModbusDatatype.uint64 || ModbusDatatype.acc64:
                if(buffer.equals(Buffer.from("FFFFFFFFFFFFFFFF", "hex"))){
                    return undefined;
                }else{
                    return new Uint64BE(buffer).toNumber()
                }
            default: return undefined;
        }
    }
}

export enum ModbusPermission {
    RW,
    RO
}

export interface ModbusDefinition {
    address: number,
    datatype: ModbusDatatype,
    permission: ModbusPermission
}