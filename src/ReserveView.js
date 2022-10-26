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

        const reserveElements = reserveBar.getElementsByClassName('reserveEmptyPawn')
        
        /**
         * @type {HTMLDivElement[]}
         */
        this.reserveFields = []

        for (let element of reserveElements) {
            this.reserveFields.push(element)
        }

        this.lastReserved = 0
    }

    addToReserve() {
        if (!this.isSomethingInPool()) {
            return false
        }

        this.reserveFields[this.lastReserved].className = getClassNameOfElement(this.player)
        this.lastReserved++ 
        return true
    }

    removeFromReserve() {
        this.lastReserved--
        if (!this.isSomethingInPool()) {
            return this.triedToUseEmptyPool()
        }

        this.reserveFields[this.lastReserved].className = 'reserveEmptyPawn'
        return true
    }

    triedToUseEmptyPool() {
        this.lastReserved = Math.max(this.lastReserved, 0)

        console.warn('Trying to click unexisting item in reserve')
        return false
    }

    isSomethingInPool() {
        return this.reserveFields[this.lastReserved] && this.player.hasAnyPool
    }
}