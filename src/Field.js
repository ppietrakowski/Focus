export const FIELD_STATE_UNPLAYABLE = 2 << 0
export const FIELD_STATE_EMPTY = 2 << 1
export const FIELD_STATE_PLAYER_RED = 2 << 2
export const FIELD_STATE_PLAYER_GREEN = 2 << 3

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
        if (!cameFrom.isPlayable) {
            return
        }

        // one move is just a changing of state
        const itemCountFromOldList = moveCount - 1
        const oldState = cameFrom.state

        const temp = cameFrom.shiftNFirstElements(itemCountFromOldList)

        this.underThisField = this.getNewUnderElements(temp)
        this.state = oldState
    }

    getNewUnderElements(shiftedElements) {
        if (this.isEmpty) {
            return shiftedElements
        }
        
        return shiftedElements.concat([{ state: this.state }], this.underThisField)
    }

    get height() {
        return this.underThisField.length + 1
    }

    get isOvergrown() {
        return this.height >= MAX_TOWER_HEIGHT
    }

    shiftNFirstElements(n) {
        let firstElements = []

        while (n-- > 0) {
            this.shiftElement(firstElements)
        }

        if (this.underThisField.length === 0) {
            Field.clearField(this)
            return firstElements
        }

        // update the this.state to next element under
        this.state = this.underThisField.shift().state

        return firstElements
    }

    makeOnlyUnderFieldAsCurrentField() {
        const element = this.underThisField.shift()

        this.state = element.state
    }

    shiftElement(firstElements) {
        const element = this.underThisField.shift() || null

        if (element !== null) {
            firstElements.push(element)
        }
    }

    get isEmpty() {
        return !!(this.state & FIELD_STATE_EMPTY)
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

    calculateDirectionTowards(anotherField) {
        const v = { x: anotherField.x - this.x, y: anotherField.y - this.y }

        if (!this.canJump(v)) {
            return null
        }

        if (v.x > 0) {
            return DIRECTION_EAST
        } else if (v.x < 0) {
            return DIRECTION_WEST
        } else if (v.y > 0) {
            return DIRECTION_SOUTH
        }

        return DIRECTION_NORTH
    }

    canJump(v) {
        return Math.abs(v.x) <= this.height && Math.abs(v.y) <= this.height
    }

    calculateMoveCountTowards(anotherField) {
        const v = { x: anotherField.x - this.x, y: anotherField.y - this.y }

        if (Math.abs(v.x) > 0) {
            return Math.abs(v.x)
        }

        return Math.abs(v.y)
    }
}