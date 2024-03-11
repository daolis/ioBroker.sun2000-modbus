# States

The states defined in variable dataFields in [states.ts L81](../src/lib/states.ts#L81) will be fetched.

There are 3 defined intervals:

* `INITIAL`: ONly fetched at startup\
  e.g. to get data which does not change from inverter (SerialNR, Model, ...)
  (It will fetch the registers containing the number of PVString or MPPTrackers too, this values will be used to dynamically add states to fetch the 'real' number of `MPPT[n]Power` or `PV[n]Voltage` and `PV[n]Current`)
* `HIGH`: Fetch values with a short interval (default 5sec)
* `LOW`: Fetch with a longer interval (default 30sec)

## Do not create or update state for field

If the `state.type` property is not set, the status the value is read from the inverter, but no state will be created nor updated.

This is used for e.g. getting the alarm registers. The alarms are split up to 3 uint16 bitfields. These 3 registers has no defined state type.
Instead, the values from these registers are evaluated in a `post fetch update hook`.
(combine 3 values to one - (16 * 3 digit binary string), and a json list of active alarms)

## Hooks

### Post initial fetch hooks

These hooks are executed after fetching the INITIAL registers.

e.g. used for dynamically adding MPPTracker and PVString states.

### Post update hook (Field level)

These hook is executed after a single value was updated.\
e.g. to set calculation only states, like calculating `storage.chargePower` and `storage.dischargePower` from `storage.chargeDischargePower`.

### Post fetch update hook (Interval level)

These hooks are executed after all registers for ab interval are fetched.

e.g. Prepare alarms & alarmsJSON from 3 alarm values.
