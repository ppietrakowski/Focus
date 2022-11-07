import EventEmitter from 'eventemitter3'
import { FieldState } from './IField'
import { IPoolClickedListener } from './IGameBoardView'
import { IPlayer, Player } from './Player'


function getClassNameOfElement(player: IPlayer)
{
    return (player.state & FieldState.Red) ?
        'reserveRedPawn'
        : (player.state & FieldState.Green) ?
            'reserveGreenPawn' : 'reserveEmptyPawn'
}

export interface IReserveView
{
    addToReserve(): void
    removeFromReserve(): boolean
    getFieldAt(i: number): HTMLDivElement
    addPoolClickedListener(listener: IPoolClickedListener, context: any): void
    emitPoolClicked(player: IPlayer, reserve: IReserveView): void

    events: EventEmitter
    readonly owner: IPlayer
}

export const EventPoolClicked = 'PoolClicked'

export class ReserveView implements IReserveView
{

    static POOL_CLICKED = 'poolClicked'
    
    events: EventEmitter
    reserveFields: HTMLDivElement[]
    
    private _howManyReserveHas: number

    constructor(private readonly _reserveBar: HTMLDivElement, readonly owner: IPlayer)
    {
        this.events = new EventEmitter()
        const reserveElements = _reserveBar.getElementsByClassName('reserveEmptyPawn')

        this.reserveFields = []

        for (let i = 0; i < reserveElements.length; i++)
        {
            this.reserveFields.push(reserveElements[i] as HTMLDivElement)
        }

        this._howManyReserveHas = 0
    }

    emitPoolClicked(player: IPlayer, reserve: IReserveView): void
    {
        this.events.emit(EventPoolClicked, player, reserve)
    }

    addPoolClickedListener(listener: IPoolClickedListener, context: any): void
    {
        this.events.on(EventPoolClicked, listener, context)
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

        this.reserveFields[this._howManyReserveHas].className = getClassNameOfElement(this.owner)
        this._howManyReserveHas++
        return true
    }

    removeFromReserve()
    {
        if (!this.isSomethingInPool())
        {
            return this.triedToUseEmptyPool()
        }

        this.reserveFields[this._howManyReserveHas].className = 'reserveEmptyPawn'
        this._howManyReserveHas--
        return true
    }

    triedToUseEmptyPool()
    {
        this._howManyReserveHas = Math.max(this._howManyReserveHas, 0)

        console.warn('Trying to click unexisting item in reserve')
        return false
    }

    isSomethingInPool()
    {
        return this.reserveFields[this._howManyReserveHas] && this.owner.hasAnyPool
    }
}