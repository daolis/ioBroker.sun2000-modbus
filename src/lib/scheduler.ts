import {Mutex} from "async-mutex";
import {AdapterInstance} from "@iobroker/adapter-core";
interface Interval {
    name: string;
    timeout: number;
    callback: (...args: any) => Promise<void>
}

export class Scheduler {

    private intervals: Interval[] = [];
    private counter: number = 0;
    private mutex: Mutex = new Mutex();
    private adapter: AdapterInstance;
    private intervalLcm!: number;

    constructor(adapter: AdapterInstance) {
        this.adapter = adapter;
    }

    public addInterval<TArgs extends any[]>(name: string, timeout: number, callback: (...args: TArgs) => Promise<void> ): void {
        this.intervals.push({name:name, timeout: timeout, callback: callback});
    }

    public init() {
        const allIntervals = this.intervals.map(value => value.timeout);
        this.intervalLcm = this.lcm(allIntervals);
        this.adapter.log.info(`Scheduler intervals lcm ${this.intervalLcm}`);
    }

    public async run() {
        const self = this;
        this.adapter.log.silly("Run scheduler...");
        if (self.mutex.isLocked()) {
            this.adapter.log.silly("Scheduler: Skip run. LOCKED");
            // Skip this run if it's currently locked
            return;
        }
        await self.mutex.runExclusive(async () => {
            this.adapter.log.silly(`Scheduler: counter ${this.counter}, locked=${self.mutex.isLocked()}`)
            for (const idx in this.intervals) {
                if (this.counter % this.intervals[idx].timeout == 0) {
                    // execute interval
                    this.adapter.log.silly(`Scheduler: run ${this.intervals[idx].name}`);
                    this.adapter.log.debug(`Interval action started [${this.intervals[idx].name}]`);
                    let start = new Date().getTime();

                    await this.intervals[idx].callback();

                    const elapsed = new Date().getTime() - start;
                    this.adapter.log.info(`Interval action finished in ${elapsed / 1000} sec, [${this.intervals[idx].name}]`);
                }
            }
            this.counter++;
            if (this.counter == this.intervalLcm) {
                this.counter = 0;
            }
            this.adapter.log.silly("Scheduler: run callback finished");
        });
    }

    private lcm(values: number[]) {
        const gcd = (x:number, y:number):number => (!y ? x : gcd(y, x % y));
        const _lcm = (x:number, y:number):number => (x * y) / gcd(x, y);
        return [...values].reduce((a, b) => _lcm(a, b));
    }
}
