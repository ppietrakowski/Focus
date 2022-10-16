
export class Player {

    constructor(state) {
        this.state = state
        this.pooledFields = 0
    }

    doesOwnThisField(field) {
        return !!(field.state & this.state)
    }
}