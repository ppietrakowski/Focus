import { EventEmitter } from "eventemitter3"
import { FIELD_STATE_EMPTY, FIELD_STATE_PLAYER_A, FIELD_STATE_PLAYER_B } from "./Field"
import { Player } from "./Player"

/**
 * 
 * @param {Player} player 
 * @returns 
 */
 function getClassNameOfElement(player) {
    return (player.state & FIELD_STATE_PLAYER_A) ? 
        'reserveRedPawn' 
        : (player.state & FIELD_STATE_PLAYER_B) ?
        'reserveGreenPawn' : 'reserveEmptyPawn'
}

export class ReserveView {

    static POOL_CLICKED = 'poolClicked'
    /**
     * 
     * @param {HTMLDivElement} reserveBar 
     * @param {Player} player
     */
    constructor(reserveBar, player) {
        this.reserveBar = reserveBar
        this.player = player
        this.events = new EventEmitter()
        this.lastReserved = 0

        const reserveElements = reserveBar.getElementsByClassName('reserveEmptyPawn')
        
        /**
         * @type {HTMLDivElement[]}
         */
        this.reserveFields = []

        for (let element of reserveElements) {
            this.reserveFields.push(element)
            element.addEventListener('click', () => this.events.emit(ReserveView.POOL_CLICKED, this.player))
        }
    }

    addToReserve() {
        this.reserveFields[this.lastReserved].className = getClassNameOfElement(this.player)
        this.lastReserved++
    }

    removeFromReserve() {
        this.lastReserved--
        this.reserveFields[this.lastReserved].className = 'reserveEmptyPawn'
    }
}