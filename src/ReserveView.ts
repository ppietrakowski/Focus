import EventEmitter from 'eventemitter3'
import { FieldState } from './IField'
import { IPoolClickedListener } from './IGameBoardView'
import { EventPoolClicked, IReserveView } from './IReserveView'
import { IPlayer } from './Player'

const CLASSES_OF_ELEMENTS: string[] = []

CLASSES_OF_ELEMENTS[FieldState.Red] = 'reserveRedPawn'
CLASSES_OF_ELEMENTS[FieldState.Green] = 'reserveGreenPawn'

CLASSES_OF_ELEMENTS[FieldState.Empty] = 'reserveGreenPawn'
CLASSES_OF_ELEMENTS[FieldState.Unplayable] = 'reserveGreenPawn'

function getClassNameOfElement(player: IPlayer)
{
    return CLASSES_OF_ELEMENTS[player.state]
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

        this.reserveFields[this._howManyReserveHas].className = CLASSES_OF_ELEMENTS[FieldState.Empty]
        this._howManyReserveHas--
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
        return this.reserveFields[this._howManyReserveHas] && this.owner.hasAnyPool
    }
}