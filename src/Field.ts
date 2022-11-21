import { IPlayer } from './Player'
import { IField, FieldState, Direction, getDirectionFromOffset } from './IField'
import EventEmitter from 'eventemitter3'

export const MaxTowerHeight = 5

export const FIELD_EVENTS = new EventEmitter()

export interface IOvergrown {
    (field: IField, popedState: FieldState): void
}

export class Field implements IField {
    private _state: FieldState
    private _underThisField: FieldState[]
    private _x: number
    private _y: number

    public overgrownCallback: IOvergrown

    constructor(state: FieldState, x: number, y: number) {
        this._state = state
        this._underThisField = []
        this._x = x
        this._y = y
    }

    moveToThisField(fromWhichField: IField, additionalDistance?: number) {
        if (!fromWhichField.isPlayable || !(fromWhichField instanceof Field)) {
            return false
        }

        additionalDistance = additionalDistance || this.getDistanceToField(fromWhichField)

        const oldState = fromWhichField.state

        // one move is just a changing of state
        this._underThisField = this.getNewUnderElements(fromWhichField, additionalDistance - 1)
        console.log(this._underThisField)
        this._state = oldState

        this.reduceOverGrown()

        return true
    }

    reduceOverGrown() {
        while (this.isOvergrown) {
            const fieldState = this._underThisField.pop()
            if (this.overgrownCallback)
                this.overgrownCallback(this, fieldState)
        }
    }

    private getNewUnderElements(fromWhichField: Field, distance: number) {
        const underElements = fromWhichField.shiftElements(distance)

        if (this.isEmpty) {
            return underElements
        }

        console.log(underElements)
        return underElements.concat([this.state]).concat(this._underThisField)
    }

    private shiftElements(n: number) {
        const firstElements: FieldState[] = []

        while (n-- > 0) {
            const element = this._underThisField.shift() || null

            console.log(element)
            if (element) {
                firstElements.push(element)
            }
        }

        // update the this.state to next element under
        this._state = this._underThisField.shift() || FieldState.Empty
        return firstElements
    }

    placeAtTop(state: FieldState): void {
        this._underThisField = [this._state].concat(this._underThisField)
        this._state = state

        this.reduceOverGrown()
    }

    getDistanceToField(anotherField: IField) {
        const v = { x: anotherField.x - this.x, y: anotherField.y - this.y }

        if (Math.abs(v.x) > 0) {
            return Math.abs(v.x)
        }

        return Math.abs(v.y)
    }

    getDirectionToField(anotherField: IField): Direction {
        const v = { x: anotherField.x - this.x, y: anotherField.y - this.y }

        if (!this.canJump(v)) {
            return { x: 0, y: 0 }
        }

        return getDirectionFromOffset(v.x, v.y)
    }

    private canJump(v: Direction) {
        return Math.abs(v.x) <= this.height && Math.abs(v.y) <= this.height
    }

    possessByPlayer(player: IPlayer): void {
        this._state = player.state
    }

    get state(): FieldState {
        return this._state
    }

    get x(): number {
        return this._x
    }

    get y(): number {
        return this._y
    }

    get height() {
        return this._underThisField.length + 1
    }

    get isOvergrown() {
        return this.height > MaxTowerHeight
    }

    get isEmpty() {
        return !!(this._state & FieldState.Empty)
    }

    get isPlayable() {
        return !(this._state & FieldState.Unplayable)
    }
}