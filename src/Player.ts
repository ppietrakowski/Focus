import { Field } from './Field'

export class Player {

    pooledPawns: number
    state: number

    constructor(state: number) {
        this.state = state
        this.pooledPawns = 0
    }

    doesOwnThisField(field: number | Field) {
        if (typeof field == 'number') {
            return !!(field & this.state)
        }
        
        return !!(field.state & this.state)
    }

    get hasAnyPool() {
        return this.pooledPawns > 0
    }
}