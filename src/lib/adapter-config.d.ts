// This file extends the AdapterConfig type from "@types/iobroker"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
    namespace ioBroker {
        interface AdapterConfig {
            address: string;
            port: number;
            modbusUnitId: number;
            updateIntervalHigh: number;
            updateIntervalLow: number;
        }
    }
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
