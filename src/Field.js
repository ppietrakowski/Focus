export const FIELD_STATE_UNPLAYABLE = 2 << 0
export const FIELD_STATE_EMPTY = 2 << 1
export const FIELD_STATE_PLAYER_A = 2 << 2
export const FIELD_STATE_PLAYER_B = 2 << 3

export const DIRECTION_SOUTH = { x: 0, y: 1 }
export const DIRECTION_NORTH = { x: 0, y: -1 }
export const DIRECTION_EAST = { x: 1, y: 0 }
export const DIRECTION_WEST = { x: -1, y: 0 }

export const MAX_TOWER_HEIGHT = 5

export class Field {

    static clearField(field) {
        field.state = FIELD_STATE_EMPTY
        field.underThisField = []
    }

    constructor(state, x, y) {
        this.state = state
        this.underThisField = []
        this.x = x
        this.y = y
    }

    /**
     * 
     * @param {Field} cameFrom 
     * @param {number} moveCount 
     * @returns 
     */
    makeAsNextField(cameFrom, moveCount) {
        if (!cameFrom.isPlayable)
            return

        // one move is just a changing of state
        const itemCountFromOldList = moveCount - 1
        const oldState = cameFrom.state

        const temp = cameFrom.shiftNFirstElements(itemCountFromOldList)
        
        if (!this.isEmpty)
            this.underThisField = this.getNewUnderElements(temp)
        else
            this.underThisField = temp

        this.state = oldState
    }

    getNewUnderElements(shiftedElements) {
        return shiftedElements.concat([{state: this.state}], this.underThisField)
    }

    get height() {
        return this.underThisField.length + 1
    }

    get isOvergrown() {
        return this.height >= MAX_TOWER_HEIGHT
    }

    shiftNFirstElements(n) {
        let firstElements = []
        
        while (n-- > 0)
            this.shiftElement(firstElements)

        if (this.underThisField.length === 0)
            Field.clearField(this)
        else if (this.isOnlyTopAvailable())
            this.makeOnlyUnderFieldAsCurrentField()

        return firstElements
    }

    isOnlyTopAvailable() {
        return this.underThisField.length === 1
    }

    makeOnlyUnderFieldAsCurrentField() {
        const element = this.underThisField.shift()

        this.state = element.state
    }

    shiftElement(firstElements) {
        const element = this.underThisField.shift() || null

        if (element)
            firstElements.push(element)
    }

    get isEmpty() {
        return !!(this.state & FIELD_STATE_EMPTY)
    }

    get top() {
        return this.underThisField[0] || null
    }

    popOneField() {
        this.height--

        return this.underThisField.pop()
    }

    belongsTo(player) {
        return !!(this.state & player.state)
    }

    get isPlayable() {
        return !(this.state & FIELD_STATE_UNPLAYABLE)
    }
}