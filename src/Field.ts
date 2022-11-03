import { Player } from "./Player"

export const FIELD_STATE_UNPLAYABLE = 2 << 0
export const FIELD_STATE_EMPTY = 2 << 1
export const FIELD_STATE_PLAYER_RED = 2 << 2
export const FIELD_STATE_PLAYER_GREEN = 2 << 3

export const DIRECTION_SOUTH = { x: 0, y: 1 }
export const DIRECTION_NORTH = { x: 0, y: -1 }
export const DIRECTION_EAST = { x: 1, y: 0 }
export const DIRECTION_WEST = { x: -1, y: 0 }

export const MAX_TOWER_HEIGHT = 5

export interface UnderFieldState {
    state: number
}

export class Field {

    static clearField(field: Field) {
        field.state = FIELD_STATE_EMPTY
        field.underThisField = []
    }

    state: number
    underThisField: UnderFieldState[]
    x: number
    y: number

    constructor(state: number, x: number, y: number) {
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
    makeAsNextField(cameFrom: Field, moveCount: number) {
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

    getNewUnderElements(shiftedElements: UnderFieldState[]) {
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

    shiftNFirstElements(n: number) {
        let firstElements : UnderFieldState[] = []

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

    shiftElement(firstElements: UnderFieldState[]) {
        const element = this.underThisField.shift() || null

        if (element !== null) {
            firstElements.push(element)
        }
    }

    get isEmpty() {
        return !!(this.state & FIELD_STATE_EMPTY)
    }

    popOneField() {
        return this.underThisField.pop()
    }

    belongsTo(player: Player) {
        return !!(this.state & player.state)
    }

    get isPlayable() {
        return !(this.state & FIELD_STATE_UNPLAYABLE)
    }

    calculateDirectionTowards(anotherField: Field) {
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

    canJump(v: {x: number, y: number}) {
        return Math.abs(v.x) <= this.height && Math.abs(v.y) <= this.height
    }

    calculateMoveCountTowards(anotherField: Field) {
        const v = { x: anotherField.x - this.x, y: anotherField.y - this.y }

        if (Math.abs(v.x) > 0) {
            return Math.abs(v.x)
        }

        return Math.abs(v.y)
    }
}