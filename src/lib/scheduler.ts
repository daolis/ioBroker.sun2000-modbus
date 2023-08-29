import {AdapterInstance} from '@iobroker/adapter-core';

interface Interval {
    name: string;
    timeout: number;
    callback: (...args: any) => Promise<number>
}

export class Scheduler {

    private intervals: Interval[] = [];
    private counter: number = 0;
    private adapter: AdapterInstance;
    private intervalLcm!: number;

    constructor(adapter: AdapterInstance) {
        this.adapter = adapter;
    }

    public addInterval<TArgs extends any[]>(name: string, timeout: number, callback: (...args: TArgs) => Promise<number>): void {
        this.intervals.push({name: name, timeout: timeout, callback: callback});
    }

    public init(): void {
        const allIntervals = this.intervals.map(value => value.timeout);
        this.intervalLcm = this.lcm(allIntervals);
        this.adapter.log.info(`Scheduler intervals lcm ${this.intervalLcm}`);
    }

    public async run(): Promise<void> {
        this.adapter.log.silly('Run scheduler...');
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        this.adapter.log.silly(`Scheduler: counter ${this.counter}`)
        for (const idx in this.intervals) {
            if (this.counter % this.intervals[idx].timeout == 0) {
                // execute interval
                this.adapter.log.silly(`Scheduler: run ${this.intervals[idx].name}`);
                const start = new Date().getTime();

                const updatedCount = await this.intervals[idx].callback();

                const elapsed = new Date().getTime() - start;
                this.adapter.log.info(`Updated ${updatedCount} registers in ${elapsed / 1000} sec, [${this.intervals[idx].name}]`);
            }
        }
        this.counter++;
        if (this.counter == this.intervalLcm) {
            this.adapter.log.debug('Scheduler: Resetting counter');
            this.counter = 0;
        }
        this.adapter.log.silly(`Scheduler: run callback finished: counter [${this.counter}]`);
    }

    private lcm(values: number[]): number {
        const gcd = (x: number, y: number): number => (!y ? x : gcd(y, x % y));
        const _lcm = (x: number, y: number): number => (x * y) / gcd(x, y);
        return [...values].reduce((a, b) => _lcm(a, b));
    }
}
