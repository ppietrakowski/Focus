import EventEmitter from 'eventemitter3'
import { IFocus } from './IFocus'
import { IPoolClickedListener } from './IGameBoardView'
import { EventPoolDecreased, EventPoolIncreased, IPlayer } from './Player'
import { ReserveView } from './ReserveView'
import { IReserveView } from './IReserveView'

export class ReserveViewOnPlayerTurnDecorator implements IReserveView
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

        this.owner.events.on(EventPoolIncreased, this.addToReserve, this)
        this.owner.events.on(EventPoolDecreased, this.removeFromReserve, this)
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
        if (this._reserveView instanceof ReserveView)
            this._reserveView.emptyAllFields()

        if (this.canAccess())
        {
            return this._reserveView.addToReserve()
        }

        return false
    }

    removeFromReserve()
    {
        console.log('removed from reserve')
        console.log(this.owner.pooledPawns)
        if (this._reserveView instanceof ReserveView)
            this._reserveView.emptyAllFields()


        //if (this.canAccess())
        //{
        return this._reserveView.removeFromReserve()
        //}

        return false
    }

    private broadcastClickMessage()
    {
        if (this.canAccess())
        {
            this._reserveView.emitPoolClicked(this.owner, this)
        }
    }

    private canAccess()
    {
        return this._game.currentPlayer === this.owner
    }
}