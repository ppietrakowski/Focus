import { EventEmitter } from "eventemitter3"

export const FIELD_STATE_UNPLAYABLE = 1
export const FIELD_STATE_EMPTY = 2
export const FIELD_STATE_PLAYER_A = 4
export const FIELD_STATE_PLAYER_B = 8

export const DIRECTION_SOUTH = { x: 0, y: 1 }
export const DIRECTION_NORTH = { x: 0, y: -1 }
export const DIRECTION_EAST = { x: 1, y: 0 }
export const DIRECTION_WEST = { x: -1, y: 0 }

export const FIELD_EVENTS = new EventEmitter()

const MAX_TOWER_HEIGHT = 5

function clearField(field) {
    field.state = FIELD_STATE_EMPTY
    field.height = 0
    field.top = null
}

export class Field {

    constructor(state, height = 0) {
        this.state = state
        this.height = height
        this.top = null
    }

    makeAsNextField(oldField) {
        if (oldField.state & FIELD_STATE_UNPLAYABLE)
            return

        this.height = oldField.height + 1
        this.top = {state: oldField.state, top: oldField.top}
        
        clearField(oldField)
    }

    isOvergrown() {
        return this.height === MAX_TOWER_HEIGHT
    }

    get topOutmost() {
        const it = this.top

        while (it && it.top) {
            it = it.top
        }

        return it
    }

    doesOwnThisField(player) {
        return !!(this.state & player.state)
    }
}