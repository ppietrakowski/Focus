import { EventEmitter } from "eventemitter3";
import { Field, FIELD_STATE_EMPTY } from "./Field";

export class GameBoard {
    static MAX_TOWER_HEIGHT = 5

    static GAME_BOARD_WIDTH = 8
    static GAME_BOARD_HEIGHT = 8

    constructor() {
        this.events = new EventEmitter()
        this.grid = [new Field(FIELD_STATE_EMPTY, 0, 0)]

        const maxSize = GameBoard.GAME_BOARD_HEIGHT * GameBoard.GAME_BOARD_WIDTH

        for (let i = 1; i < maxSize; i++) {
            this.grid[i] = new Field(FIELD_STATE_EMPTY, i % 8, Math.floor(i / GameBoard.GAME_BOARD_WIDTH))
        }
    }

    getFieldAt(x, y) {
        if (this.isOutOfBoundsInXAxis(x) || this.isOutOfBoundsInYAxis(y))
            throw new Error(`point (${x}, ${y}) is out of bounds`)

        return this.grid[x + y * GameBoard.GAME_BOARD_WIDTH] || null
    }

    isOutOfBoundsInXAxis(x) {
        return x < 0 || x >= GameBoard.GAME_BOARD_WIDTH
    }

    isOutOfBoundsInYAxis(y) {
        return y < 0 || y >= GameBoard.GAME_BOARD_HEIGHT
    }

    setFieldAt(x, y, state) {
        const field = this.getFieldAt(x, y)

        field.state = state
    }

    countPlayersFields(player) {
        return this.grid.reduce((accumulated, current) => {
            if (current.belongsTo(player))
                accumulated++
            
            return accumulated
        }, 0)
    }
}