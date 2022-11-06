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

    reserveFields: HTMLDivElement[]
    private lastReserved: number
    private _poolClickedListeners: IPoolClickedListener[]

    constructor(private readonly reserveBar: HTMLDivElement, readonly owner: IPlayer)
    {
        this.events = new EventEmitter()
        const reserveElements = reserveBar.getElementsByClassName('reserveEmptyPawn')

        this.reserveFields = []

        for (let i = 0; i < reserveElements.length; i++)
        {
            this.reserveFields.push(reserveElements[i] as HTMLDivElement)
        }

        this.lastReserved = 0
        this._poolClickedListeners = []
    }
    events: EventEmitter

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
        return this.reserveFields[this.lastReserved] && this.owner.hasAnyPool
    }
}