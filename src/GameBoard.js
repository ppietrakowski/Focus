import { EventEmitter } from "eventemitter3";
import { Field, FIELD_STATE_EMPTY, FIELD_STATE_PLAYER_A, FIELD_STATE_PLAYER_B, FIELD_STATE_UNPLAYABLE } from './Field'

import board from "./assets/board.json"

function boardToStateMask(boardState) {

    if (boardState === 0)
        return FIELD_STATE_UNPLAYABLE
    
    else if (boardState === 1)
        return FIELD_STATE_EMPTY

    else if (boardState === 2)
        return FIELD_STATE_PLAYER_A
    else if (boardState === 3)
        return FIELD_STATE_PLAYER_B

    throw new Error('Illegal board state')
}

export class GameBoard {
    static MAX_TOWER_HEIGHT = 5

    static GAME_BOARD_WIDTH = 8
    static GAME_BOARD_HEIGHT = 8

    constructor() {
        this.events = new EventEmitter()
        this._grid = [new Field(boardToStateMask(board.find(v => v.id === 0).state), 0, 0)]

        const maxSize = GameBoard.GAME_BOARD_HEIGHT * GameBoard.GAME_BOARD_WIDTH

        /*
        if (board.length < 64)
            throw new Error('Board should have at least 64 element')
            */
        
        for (let i = 1; i < board.length; i++) {
            const field = board.find(v => v.id === i) || null

            if (field === null)
                throw new Error(`Missing object at (${(i % GameBoard.GAME_BOARD_WIDTH)}, ${Math.floor(i / GameBoard.GAME_BOARD_WIDTH)}) id=${i}`)

            this._grid[i] = new Field(boardToStateMask(board[i].state), (i % GameBoard.GAME_BOARD_WIDTH), Math.floor(i / GameBoard.GAME_BOARD_WIDTH))
        }

        console.log(this._grid)
    }



    getFieldAt(x, y) {
        if (this.isOutOfBoundsInXAxis(x) || this.isOutOfBoundsInYAxis(y))
            throw new Error(`point (${x}, ${y}) is out of bounds`)

        return this._grid[x + y * GameBoard.GAME_BOARD_WIDTH] || null
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
        return this._grid.filter(v => v.belongsTo(player)).length
    }
}