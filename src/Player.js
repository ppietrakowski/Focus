
export class Player {

    constructor(state) {
        this.state = state
        this.pooledFields = 0
    }

    doesOwnThisField(field) {
        if (typeof field == 'number')
            return !!(field & this.state)

        return !!(field.state & this.state)
    }

    get hasAnyPool() {
        return this.pooledFields > 0
    }
}