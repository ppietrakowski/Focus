import { EventEmitter } from "eventemitter3";
import { Field, FIELD_STATE_EMPTY } from "./Field";

export class GameBoard {
    static MAX_TOWER_HEIGHT = 5

    static GAME_BOARD_WIDTH = 8
    static GAME_BOARD_HEIGHT = 8

    constructor() {
        this.events = new EventEmitter()
        this.grid = [new Field(FIELD_STATE_EMPTY)]

        const maxSize = GameBoard.GAME_BOARD_HEIGHT * GameBoard.GAME_BOARD_WIDTH

        for (let i = 1; i < maxSize; i++) {
            this.grid[i] = new Field(FIELD_STATE_EMPTY)
        }
    }

    getFieldAt(x, y) {
        return this.grid[x + y * GameBoard.GAME_BOARD_WIDTH]
    }

    setFieldAt(x, y, state) {
        const field = this.getFieldAt(x, y)

        field.state = state
        field.height = 1
    }
}