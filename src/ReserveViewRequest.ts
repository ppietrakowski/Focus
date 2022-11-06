import { IFocus } from './IFocus'
import { IPoolClickedListener } from './IGameBoardView'
import { IPlayer, Player } from './Player'
import { IReserveView, ReserveView } from './ReserveView'

export class ReserveViewRequest implements IReserveView
{
    readonly owner: IPlayer

    constructor(private readonly reserveView: IReserveView, private readonly game: IFocus)
    {

        this.owner = this.reserveView.owner

        if (reserveView instanceof ReserveView)
        {
            reserveView.reserveFields.forEach(v => v.addEventListener('click', () => this.broadcastClickMessage()))
        }
    }

    addPoolClickedListener(listener: IPoolClickedListener): void
    {
        this.reserveView.addPoolClickedListener(listener)
    }

    emitPoolClicked(player: IPlayer, reserve: IReserveView): void
    {
    }

    getFieldAt(i: number): HTMLDivElement
    {
        return this.reserveView.getFieldAt(i)
    }

    addToReserve()
    {
        if (this.canAccess())
        {
            return this.reserveView.addToReserve()
        }

        return false
    }

    removeFromReserve()
    {
        if (this.canAccess())
        {
            return this.reserveView.removeFromReserve()
        }

        return false
    }

    broadcastClickMessage()
    {
        if (this.canAccess())
        {
            this.reserveView.emitPoolClicked(this.owner, this)
        }
    }

    canAccess()
    {
        return this.game.currentPlayer === this.owner
    }
}