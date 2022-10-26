import { EventEmitter } from "eventemitter3"
import { FIELD_STATE_EMPTY, FIELD_STATE_PLAYER_RED, FIELD_STATE_PLAYER_GREEN } from "./Field"
import { Player } from "./Player"

/**
 * 
 * @param {Player} player 
 * @returns 
 */
 function getClassNameOfElement(player) {
    return (player.state & FIELD_STATE_PLAYER_RED) ? 
        'reserveRedPawn' 
        : (player.state & FIELD_STATE_PLAYER_GREEN) ?
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
        }
    }

    addToReserve() {
        this.reserveFields[this.lastReserved].className = getClassNameOfElement(this.player)
        this.lastReserved++
        return true
    }

    removeFromReserve() {
        this.lastReserved--
        this.reserveFields[this.lastReserved].className = 'reserveEmptyPawn'
        return true
    }
}