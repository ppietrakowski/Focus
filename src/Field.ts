import { IPlayer } from './Player'
import { IField, FieldState, Direction, getDirectionFromOffset } from './IField'
import EventEmitter from 'eventemitter3'

export const MaxTowerHeight = 5

export const FIELD_EVENTS = new EventEmitter()

export interface IOvergrown {
    (field: IField, popedState: FieldState): void
}

export class Field implements IField {
    private state: FieldState
    private underThisField: FieldState[]
    private x: number
    private y: number

    public overgrownCallback: IOvergrown

    constructor(state: FieldState, x: number, y: number) {
        this.state = state
        this.underThisField = []
        this.x = x
        this.y = y
    }

    moveToThisField(fromWhichField: IField, additionalDistance?: number): boolean {
        if (!fromWhichField.isPlayable || !(fromWhichField instanceof Field)) {
            return false
        }

        additionalDistance = additionalDistance || this.getDistanceToField(fromWhichField)

        const oldState = fromWhichField.fieldState

        // one move is just a changing of state
        this.underThisField = this.getNewUnderElements(fromWhichField, additionalDistance - 1)
        this.state = oldState

        this.reduceOverGrown()

        return true
    }

    reduceOverGrown(): void {
        while (this.isOvergrown) {
            const fieldState = this.underThisField.pop()
            if (this.overgrownCallback)
                this.overgrownCallback(this, fieldState)
        }
    }

    private getNewUnderElements(fromWhichField: Field, distance: number): FieldState[] {
        const underElements = fromWhichField.shiftElements(distance)

        if (this.isEmpty) {
            return underElements
        }

        return underElements.concat([this.fieldState]).concat(this.underThisField)
    }

    private shiftElements(n: number): FieldState[] {
        const firstElements: FieldState[] = []

        while (n > 0) {
            const element = this.underThisField.shift() || null

            if (element) {
                firstElements.push(element)
            }
            
            n--
        }

        // update the this.state to next element under
        this.state = this.underThisField.shift() || FieldState.Empty
        return firstElements
    }

    placeAtTop(state: FieldState): void {
        this.underThisField = [this.state].concat(this.underThisField)
        this.state = state

        this.reduceOverGrown()
    }

    getDistanceToField(anotherField: IField): number {
        const v = { x: anotherField.posX - this.posX, y: anotherField.posY - this.posY }

        if (Math.abs(v.x) > 0) {
            return Math.abs(v.x)
        }

        return Math.abs(v.y)
    }

    getDirectionToField(anotherField: IField): Direction {
        const v = { x: anotherField.posX - this.posX, y: anotherField.posY - this.posY }

        if (!this.canJumpInDirection(v)) {
            return { x: 0, y: 0 }
        }

        return getDirectionFromOffset(v.x, v.y)
    }

    private canJumpInDirection(direction: Direction): boolean {
        return Math.abs(direction.x) <= this.height && Math.abs(direction.y) <= this.height
    }

    possessByPlayer(player: IPlayer): void {
        this.state = player.state
    }

    get fieldState(): FieldState {
        return this.state
    }

    get posX(): number {
        return this.x
    }

    get posY(): number {
        return this.y
    }

    get height(): number {
        return this.underThisField.length + 1
    }
    get towerStructure(): FieldState[] {
        return [this.fieldState].concat(this.underThisField)
    }

    get isOvergrown(): boolean {
        return this.height > MaxTowerHeight
    }

    get isEmpty(): boolean {
        return !!(this.state & FieldState.Empty)
    }

    get isPlayable() {
        return !(this.state & FieldState.Unplayable)
    }
}