import { FieldState } from './IField'
import { IField } from './IField'


export interface IPlayer
{
    get state(): FieldState
    get hasAnyPool(): boolean
    get pooledPawns(): number

    doesOwnThisField(field: number | IField): boolean
    possessField(field: IField): void
}

export class Player implements IPlayer
{
    private _pooledPawns: number
    private _state: FieldState

    constructor(state: number)
    {
        this._state = state
        this._pooledPawns = 0
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
    }

    decreasePool()
    {
        this._pooledPawns--
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