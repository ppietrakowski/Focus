import EventEmitter from 'eventemitter3'
import { Field } from './Field'
import { FieldState } from './IField'
import { IField } from './IField'


export interface IPlayer {
    readonly events: EventEmitter
    get state(): FieldState

    get isGreen(): boolean
    get isRed(): boolean
    
    doesOwnThisField(field: number | IField): boolean
    possessField(field: IField): void
}

export const EventPoolDecreased = 'PoolDecreased'
export const EventPoolIncreased = 'PoolIncreased'

export class Player implements IPlayer {
    private color: FieldState
    readonly events: EventEmitter
    private red: boolean
    private green: boolean

    constructor(state: number) {
        this.color = state
        this.events = new EventEmitter()
        this.red = !!(state & FieldState.Red)
        this.green = !!(state & FieldState.Green)
    }
    get isGreen(): boolean {
        return this.green
    }
    get isRed(): boolean {
        return this.red
    }

    get state(): FieldState {
        return this.color
    }

    doesOwnThisField(field: number | IField): boolean {
        if (typeof field == 'number') {
            return !!(field & this.state)
        }

        return !!(field.fieldState & this.state)
    }

    possessField(field: IField): void {
        field.possessByPlayer(this)
    }
}