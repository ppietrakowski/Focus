import EventEmitter from 'eventemitter3'
import { IFocus } from './IFocus'
import { IPoolClickedListener } from './IGameBoardView'
import { IPlayer } from './Player'
import { IReserveView, ReserveView } from './ReserveView'

export class ReserveViewRequest implements IReserveView
{
    readonly owner: IPlayer
    readonly events: EventEmitter

    constructor(private readonly _reserveView: IReserveView, private readonly _game: IFocus)
    {
        this.events = _reserveView.events
        this.owner = this._reserveView.owner

        if (_reserveView instanceof ReserveView)
        {
            _reserveView.reserveFields.forEach(v => v.addEventListener('click', () => this.broadcastClickMessage()))
        }
    }

    addPoolClickedListener(listener: IPoolClickedListener, context: any): void
    {
        this._reserveView.addPoolClickedListener(listener, context)
    }

    emitPoolClicked(player: IPlayer, reserve: IReserveView): void
    {
        if (this.canAccess())
        {
            this._reserveView.emitPoolClicked(player, reserve)
        }
    }

    getFieldAt(i: number): HTMLDivElement
    {
        return this._reserveView.getFieldAt(i)
    }

    addToReserve()
    {
        if (this.canAccess())
        {
            return this._reserveView.addToReserve()
        }

        return false
    }

    removeFromReserve()
    {
        if (this.canAccess())
        {
            return this._reserveView.removeFromReserve()
        }

        return false
    }

    broadcastClickMessage()
    {
        if (this.canAccess())
        {
            this._reserveView.emitPoolClicked(this.owner, this)
        }
    }

    canAccess()
    {
        return this._game.currentPlayer === this.owner
    }
}