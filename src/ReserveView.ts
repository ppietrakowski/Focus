import EventEmitter from 'eventemitter3'
import { Field } from './Field'
import { FieldState } from './IField'
import { IPoolClickedListener } from './IGameBoardView'
import { EventPoolClicked, IReserveView } from './IReserveView'
import { IPlayer, Player } from './Player'


function getClassNameOfElement(player: IPlayer | FieldState)
{
    let state = player
    if (player instanceof Player)
        state = player.state
    
    if (state === FieldState.Red)
        return 'reserveRedPawn'
    else if (state === FieldState.Green)
        return 'reserveGreenPawn'
    
    return 'reserveEmptyPawn'
}

export class ReserveView implements IReserveView
{

    static readonly POOL_CLICKED = 'poolClicked'

    readonly events: EventEmitter
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

    emptyAllFields()
    {
        this.reserveFields.forEach(v => v.className = getClassNameOfElement(FieldState.Empty))
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
        this.emptyAllFields()
        if (this._howManyReserveHas >= this.reserveFields.length)
        {
            return false
        }

        this._howManyReserveHas = this.owner.pooledPawns

        for (let i = 0; i < this._howManyReserveHas; i++)
        {
            this.reserveFields[i].className = getClassNameOfElement(this.owner)
        }

        return true
    }

    removeFromReserve()
    {
        this.emptyAllFields()
        if (!this.isSomethingInPool())
        {
            return this.triedToUseEmptyPool()
        }

        this._howManyReserveHas = this.owner.pooledPawns

        if (this._howManyReserveHas > this.reserveFields.length)
        {
            console.warn('What reserve has oversize in REMOVE function ?')
            this._howManyReserveHas = this.reserveFields.length
        }

        const ownerClassName = getClassNameOfElement(this.owner)

        for (let i = 0; i < this._howManyReserveHas; i++)
        {
            this.reserveFields[i].className = ownerClassName
        }

        return true
    }

    private triedToUseEmptyPool()
    {
        this._howManyReserveHas = Math.max(this._howManyReserveHas, 0)

        console.warn('Trying to click unexisting item in reserve')
        return false
    }

    private isSomethingInPool()
    {
        return this.owner.hasAnyPool
    }
}