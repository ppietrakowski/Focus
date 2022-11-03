import EventEmitter from 'eventemitter3'
import { FIELD_STATE_EMPTY, FIELD_STATE_PLAYER_RED, FIELD_STATE_PLAYER_GREEN } from './Field'
import { FieldView } from './FieldView'
import { Player } from './Player'


function getClassNameOfElement(player: Player) {
    return (player.state & FIELD_STATE_PLAYER_RED) ? 
        'reserveRedPawn' 
        : (player.state & FIELD_STATE_PLAYER_GREEN) ?
            'reserveGreenPawn' : 'reserveEmptyPawn'
}

export interface IReserveView {
    addToReserve(): void
    removeFromReserve(): void
    getFieldAt(i: number): HTMLDivElement

    readonly owner: Player
    events: EventEmitter
}

export class ReserveView implements IReserveView {

    static POOL_CLICKED = 'poolClicked'

    events: EventEmitter
    
    reserveFields: HTMLDivElement[]
    private lastReserved: number
    
    /**
     * 
     * @param {HTMLDivElement} reserveBar 
     * @param {Player} player
     */
    constructor(private readonly reserveBar: HTMLDivElement, readonly owner: Player) {
        this.reserveBar = reserveBar
        this.events = new EventEmitter()

        const reserveElements = reserveBar.getElementsByClassName('reserveEmptyPawn') 


        /**
         * @type {HTMLDivElement[]}
         */
        this.reserveFields = []

        for (let i = 0; i < reserveBar.length; i++) {
            this.reserveFields.push(reserveElements[i] as HTMLDivElement)
        }

        this.lastReserved = 0
    }

    getFieldAt(i: number): HTMLDivElement {
        return this.reserveFields[i]
    }

    addToReserve() {
        if (!this.isSomethingInPool()) {
            return false
        }

        this.reserveFields[this.lastReserved].className = getClassNameOfElement(this.owner)
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
        return this.reserveFields[this.lastReserved] && this.owner.hasAnyPool
    }
}