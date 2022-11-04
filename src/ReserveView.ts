import EventEmitter from 'eventemitter3'
import { FieldState } from './FieldState'
import { Player } from './Player'


function getClassNameOfElement(player: Player) {
    return (player.state & FieldState.FIELD_STATE_PLAYER_RED) ? 
        'reserveRedPawn' 
        : (player.state & FieldState.FIELD_STATE_PLAYER_GREEN) ?
            'reserveGreenPawn' : 'reserveEmptyPawn'
}

export interface IReserveView {
    addToReserve(): void
    removeFromReserve(): boolean
    getFieldAt(i: number): HTMLDivElement

    readonly owner: Player
    events: EventEmitter
}

export class ReserveView implements IReserveView {

    static POOL_CLICKED = 'poolClicked'

    events: EventEmitter
    
    reserveFields: HTMLDivElement[]
    private lastReserved: number
    
    constructor(private readonly reserveBar: HTMLDivElement, readonly owner: Player) {
        this.events = new EventEmitter()

        const reserveElements = reserveBar.getElementsByClassName('reserveEmptyPawn') 

        this.reserveFields = []

        for (let i = 0; i < reserveElements.length; i++) {
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