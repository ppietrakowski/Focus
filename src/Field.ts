import { FieldState } from './FieldState'
import { Direction, DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_SOUTH, DIRECTION_WEST, IField, UnderFieldState } from './IField'
import { IPlayer } from './Player'



export const MAX_TOWER_HEIGHT = 5

export class Field implements IField {

    private static clearField(field: Field) {
        field.state = FieldState.FIELD_STATE_EMPTY
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

    makeAsNextField(cameFrom: IField, moveCount: number) {
        if (!cameFrom.isPlayable || !(cameFrom instanceof Field)) {
            return
        }

        const oldState = cameFrom.state
        
        // one move is just a changing of state
        const temp = cameFrom.shiftNFirstElements(moveCount - 1)

        this.underThisField = this.getNewUnderElements(temp)
        this.state = oldState
    }

    get height() {
        return this.underThisField.length + 1
    }

    get isOvergrown() {
        return this.height >= MAX_TOWER_HEIGHT
    }    

    get isEmpty() {
        return !!(this.state & FieldState.FIELD_STATE_EMPTY)
    }

    get isPlayable() {
        return !(this.state & FieldState.FIELD_STATE_UNPLAYABLE)
    }

    belongsTo(player: IPlayer) {
        return player.doesOwnThisField(this.state)
    }

    calculateDirectionTowards(anotherField: IField): Direction {
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

    calculateMoveCountTowards(anotherField: IField) {
        const v = { x: anotherField.x - this.x, y: anotherField.y - this.y }

        if (Math.abs(v.x) > 0) {
            return Math.abs(v.x)
        }

        return Math.abs(v.y)
    }

    private shiftNFirstElements(n: number) {
        const firstElements : UnderFieldState[] = []

        while (n-- > 0) {
            this.shiftElement(firstElements)
        }

        if (this.underThisField.length === 0) {
            Field.clearField(this)
            return firstElements
        }

        // update the this field's state to next element under
        this.state = this.underThisField.shift().state

        return firstElements
    }

    private shiftElement(firstElements: UnderFieldState[]) {
        const element = this.underThisField.shift() || null

        if (element !== null) {
            firstElements.push(element)
        }
    }

    private getNewUnderElements(shiftedElements: UnderFieldState[]) {
        if (this.isEmpty) {
            return shiftedElements
        }

        return shiftedElements.concat([{ state: this.state }], this.underThisField)
    }

    private canJump(v: {x: number, y: number}) {
        return Math.abs(v.x) <= this.height && Math.abs(v.y) <= this.height
    }
}