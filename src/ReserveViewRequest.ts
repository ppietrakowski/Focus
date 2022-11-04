import EventEmitter from 'eventemitter3'
import { Focus } from './Game'
import { IFocus } from "./IFocus"
import { Player } from './Player'
import { IReserveView, ReserveView } from './ReserveView'

export class ReserveViewRequest implements IReserveView {
    events: EventEmitter
    readonly owner: Player

    constructor(private readonly reserveView: IReserveView, private readonly game: IFocus) {
       
        this.owner = this.reserveView.owner
        this.events = reserveView.events

        if (reserveView instanceof ReserveView) {
            reserveView.reserveFields.forEach(v => v.addEventListener('click', () => this.broadcastClickMessage()))
        }
    }
    
    getFieldAt(i: number): HTMLDivElement {
        return this.reserveView.getFieldAt(i)
    }

    addToReserve() {
        if (this.canAccess()) {
            return this.reserveView.addToReserve()
        }

        return false
    }

    removeFromReserve() {
        if (this.canAccess()) {
            return this.reserveView.removeFromReserve()
        }

        return false
    }

    broadcastClickMessage() {
        if (this.canAccess()) {
            this.reserveView.events.emit(ReserveView.POOL_CLICKED, this.owner)
        }
    }

    canAccess() {
        return this.game.currentPlayer === this.owner
    }
}