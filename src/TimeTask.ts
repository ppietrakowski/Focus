
export interface OnTaskExpired {
    (): void
}

export interface ITimeTask {
    get hasExpired(): boolean
    update(dt: number): void
    readonly onExpired: OnTaskExpired
    getContext<T>(): T
}

export class TimeTask<T> implements ITimeTask {


    private current = 0

    constructor(readonly time: number, readonly onExpired: OnTaskExpired, readonly onExpiredContext: T) {

    }

    getContext<R>(): R {
        return this.onExpiredContext as unknown as R
    }

    get hasExpired(): boolean {
        return this.current >= this.time
    }

    update(dt: number): void {
        this.current += dt
    }
}