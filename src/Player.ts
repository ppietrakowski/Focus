import { FieldState } from './IField'
import { IField } from './IField'


export interface IPlayer
{
    get state(): FieldState

    pooledPawns: number

    doesOwnThisField(field: number | IField): boolean
    possessField(field: IField): void
    get hasAnyPool(): boolean
}

export class Player implements IPlayer
{

    pooledPawns: number
    private _state: FieldState

    constructor(state: number)
    {
        this._state = state
        this.pooledPawns = 0
    }

    get state(): FieldState
    {
        return this._state
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

    get hasAnyPool()
    {
        return this.pooledPawns > 0
    }
}