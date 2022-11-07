import EventEmitter from 'eventemitter3'
import { FieldState } from './IField'
import { IField } from './IField'


export interface IPlayer
{
    readonly events: EventEmitter
    get state(): FieldState
    get hasAnyPool(): boolean
    get pooledPawns(): number

    doesOwnThisField(field: number | IField): boolean
    possessField(field: IField): void
}

export const EventPoolDecreased = 'PoolDecreased'
export const EventPoolIncreased = 'PoolIncreased'

export class Player implements IPlayer
{
    private _pooledPawns: number
    private _state: FieldState
    readonly events: EventEmitter

    constructor(state: number)
    {
        this._state = state
        this._pooledPawns = 0
        this.events = new EventEmitter()
    }

    get state(): FieldState
    {
        return this._state
    }

    get hasAnyPool()
    {
        return this._pooledPawns > 0
    }

    get pooledPawns(): number
    {
        return this._pooledPawns
    }

    increasePool()
    {
        this._pooledPawns++
        this.events.emit(EventPoolIncreased)
    }

    decreasePool()
    {
        this._pooledPawns--
        this.events.emit(EventPoolDecreased)
    }

    doesOwnThisField(field: number | IField)
    {
        if (typeof field == 'number')
        {
            return !!(field & this.state)
        }

        return !!(field.state & this.state)
    }

    possessField(field: IField): void
    {
        field.possessByPlayer(this)
    }
}