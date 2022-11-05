import EventEmitter from 'eventemitter3'
import { FieldState } from './FieldState'
import { IPoolClickedListener } from './IGameBoardView'
import { IPlayer, Player } from './Player'


function getClassNameOfElement(player: IPlayer)
{
    return (player.state & FieldState.FIELD_STATE_PLAYER_RED) ?
        'reserveRedPawn'
        : (player.state & FieldState.FIELD_STATE_PLAYER_GREEN) ?
            'reserveGreenPawn' : 'reserveEmptyPawn'
}

export interface IReserveView
{
    addToReserve(): void
    removeFromReserve(): boolean
    getFieldAt(i: number): HTMLDivElement
    addPoolClickedListener(listener: IPoolClickedListener): void
    emitPoolClicked(player: IPlayer, reserve: IReserveView): void

    readonly owner: IPlayer
}

export class ReserveView implements IReserveView
{

    static POOL_CLICKED = 'poolClicked'

    reserveFields: HTMLDivElement[]
    private lastReserved: number
    private _poolClickedListeners: IPoolClickedListener[]

    constructor(private readonly reserveBar: HTMLDivElement, readonly owner: IPlayer)
    {
        const reserveElements = reserveBar.getElementsByClassName('reserveEmptyPawn')

        this.reserveFields = []

        for (let i = 0; i < reserveElements.length; i++)
        {
            this.reserveFields.push(reserveElements[i] as HTMLDivElement)
        }

        this.lastReserved = 0
        this._poolClickedListeners = []
    }

    emitPoolClicked(player: IPlayer, reserve: IReserveView): void
    {
        this._poolClickedListeners.forEach(l => l.onPoolClicked(player, reserve))
    }

    addPoolClickedListener(listener: IPoolClickedListener): void
    {
        this._poolClickedListeners.push(listener)
    }

    getFieldAt(i: number): HTMLDivElement
    {
        return this.reserveFields[i]
    }

    addToReserve()
    {
        if (!this.isSomethingInPool())
        {
            return false
        }

        this.reserveFields[this.lastReserved].className = getClassNameOfElement(this.owner)
        this.lastReserved++
        return true
    }

    removeFromReserve()
    {
        if (!this.isSomethingInPool())
        {
            return this.triedToUseEmptyPool()
        }

        this.reserveFields[this.lastReserved].className = 'reserveEmptyPawn'
        this.lastReserved--
        return true
    }

    triedToUseEmptyPool()
    {
        this.lastReserved = Math.max(this.lastReserved, 0)

        console.warn('Trying to click unexisting item in reserve')
        return false
    }

    isSomethingInPool()
    {
        console.log(!!this.reserveFields[this.lastReserved])
        return this.reserveFields[this.lastReserved] && this.owner.hasAnyPool
    }
}