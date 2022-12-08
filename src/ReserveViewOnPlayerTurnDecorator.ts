import EventEmitter from 'eventemitter3'
import { EventAddedToPool, IFocus } from './IFocus'
import { IPoolClickedListener } from './IGameBoardView'
import { IPlayer } from './Player'
import { ReserveView } from './ReserveView'
import { IReserveView } from './IReserveView'

export class ReserveViewOnPlayerTurnDecorator implements IReserveView {
    readonly owner: IPlayer
    readonly events: EventEmitter

    constructor(private readonly reserveView: IReserveView, private readonly game: IFocus) {
        this.events = reserveView.events
        this.owner = this.reserveView.owner

        if (reserveView instanceof ReserveView) {
            reserveView.reserveFields.forEach(v => v.addEventListener('click', () => this.broadcastClickMessage()))
        }

        this.game.events.on(EventAddedToPool, this.addToReserve, this)
    }

    addPoolClickedListener<T>(listener: IPoolClickedListener, context: T): void {
        this.reserveView.addPoolClickedListener(listener, context)
    }

    emitPoolClicked(player: IPlayer, reserve: IReserveView): void {
        this.reserveView.emitPoolClicked(player, reserve)
    }

    getFieldAt(i: number): HTMLDivElement {
        return this.reserveView.getFieldAt(i)
    }

    addToReserve(toWhichPlayer: IPlayer): void {
        if (toWhichPlayer === this.owner) {
            if (this.reserveView instanceof ReserveView)
                this.reserveView.emptyAllFields()
            this.reserveView.addToReserve(toWhichPlayer)
        }
    }

    removeFromReserve(): boolean {
        if (this.reserveView instanceof ReserveView)
            this.reserveView.emptyAllFields()

        return this.reserveView.removeFromReserve()
    }

    private broadcastClickMessage(): void {
        if (this.canAccess()) {
            this.reserveView.emitPoolClicked(this.owner, this)
        }
    }

    private canAccess(): boolean {
        return this.game.currentPlayingColor === this.owner
    }
}