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

    moveToThisField(fromWhichField: IField, additionalDistance?: number): boolean {
        if (!fromWhichField.isPlayable || !(fromWhichField instanceof Field)) {
            return false
        }

        additionalDistance = additionalDistance || this.getDistanceToField(fromWhichField)

        const oldState = fromWhichField.state

        // one move is just a changing of state
        this._underThisField = this.getNewUnderElements(fromWhichField, additionalDistance - 1)
        this._state = oldState

        this.reduceOverGrown()

        return true
    }

    reduceOverGrown(): void {
        while (this.isOvergrown) {
            const fieldState = this._underThisField.pop()
            if (this.overgrownCallback)
                this.overgrownCallback(this, fieldState)
        }
    }

    private getNewUnderElements(fromWhichField: Field, distance: number): FieldState[] {
        const underElements = fromWhichField.shiftElements(distance)

        if (this.isEmpty) {
            return underElements
        }

        return underElements.concat([this.state]).concat(this._underThisField)
    }

    private shiftElements(n: number): FieldState[] {
        const firstElements: FieldState[] = []

        while (n-- > 0) {
            const element = this._underThisField.shift() || null

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

    getDistanceToField(anotherField: IField): number {
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

    private canJump(v: Direction): boolean {
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

    get height(): number {
        return this._underThisField.length + 1
    }
    get towerStructure(): FieldState[] {
        return [this.state].concat(this._underThisField)
    }

    get isOvergrown(): boolean {
        return this.height > MaxTowerHeight
    }

    get isEmpty(): boolean {
        return !!(this._state & FieldState.Empty)
    }

    get isPlayable() {
        return !(this._state & FieldState.Unplayable)
    }
}