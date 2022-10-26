import { ReserveView } from "./ReserveView"

export class ReserveViewRequest {

    constructor(reserveView, game) {
        /**
         * @type {ReserveView}
         */
        this.reserveView = reserveView
        this.owner = this.reserveView.player
        this.game = game
        this.events = reserveView.events

        this.reserveView.reserveFields.forEach(v => v.addEventListener('click', () => this.broadcastClickMessage()))
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