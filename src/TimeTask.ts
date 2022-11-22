
export interface OnTaskExpired {
    (): void
}

export class TimeTask {


    private current = 0

    constructor(readonly time: number, readonly onExpired: OnTaskExpired, readonly onExpiredContext: any) {

    }

    get hasExpired() {
        return this.current >= this.time
    }
}