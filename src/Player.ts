import EventEmitter from 'eventemitter3'
import { FieldState } from './IField'
import { IField } from './IField'


export interface IPlayer {
    readonly events: EventEmitter
    get state(): FieldState

    doesOwnThisField(field: number | IField): boolean
    possessField(field: IField): void
}

export const EventPoolDecreased = 'PoolDecreased'
export const EventPoolIncreased = 'PoolIncreased'

export class Player implements IPlayer {
    private color: FieldState
    readonly events: EventEmitter

    constructor(state: number) {
        this.color = state
        this.events = new EventEmitter()
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