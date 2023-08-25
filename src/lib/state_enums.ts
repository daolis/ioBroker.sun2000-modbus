export enum StorageStatus {
    OFFLINE,
    STANDBY,
    RUNNING,
    FAULT,
    SLEEP_MODE
}

export enum StorageForcibleChargeDischarge {
    STOP,
    CHARGE,
    DISCHARGE
}

export enum MeterStatus {
    OFFLINE,
    ONLINE
}

export enum InverterStatus {
    Standby_initializing = 0x000,
    Standby_Detecting_Insulation_Resistance = 0x0001,
    Standby_Detecting_Irradiation = 0x0002,
    Standby_Drid_Detecting = 0x0003,
    Starting = 0x0100,
    On_Grid = 0x0200,
    Grid_Connection_PowerLimited = 0x0201,
    Grid_Connection_SelfDerating = 0x0202,
    OffGrid_Running = 0x0203,
    Shutdown_Fault = 0x0300,
    Shutdown_Command = 0x0301,
    Shutdown_OVGR = 0x0302,
    Shutdown_CommunicationDisconnected = 0x0303,
    Shutdown_PowerLimited = 0x0304,
    Shutdown_ManualStartupRequired = 0x0305,
    Shutdown_DC_SwitchesDdisconnected = 0x0306,
    Shutdown_RapidCutoff = 0x0307,
    Shutdown_InputUnderPower = 0x0308,
    GridScheduling_cosPHIPCurve = 0x0401,
    GridScheduling_QUCurve = 0x0402,
    GridScheduling_PFUCurve = 0x0403,
    GridScheduling_DryContact = 0x0404,
    GridScheduling_QPCurve = 0x0405,
    SpotCheckReady = 0x0500,
    SpotChecking = 0x0501,
    Inspecting = 0x0600,
    AFCISelfCheck = 0x0700,
    IVScanning = 0x0800,
    DCInputDetection = 0x0900,
    Running_OffGridCharging = 0x0A00
}
