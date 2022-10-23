import { EventEmitter } from "eventemitter3";
import { Field, FIELD_STATE_EMPTY, FIELD_STATE_PLAYER_A, FIELD_STATE_PLAYER_B, FIELD_STATE_UNPLAYABLE } from './Field'

import board from "./board.json"

/**
 * @callback ForEachCallback
 * @param {Field} element
 * @param {number} x
 * @param {number} y
 */

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
        this.fields = [new Field(boardToStateMask(board.find(v => v.id === 0).state), 0, 0)]

        const maxSize = GameBoard.GAME_BOARD_HEIGHT * GameBoard.GAME_BOARD_WIDTH

        if (board.length < maxSize)
            throw new Error(`Board should have at least ${maxSize} element`)

        for (let i = 1; i < maxSize; i++) {
            this.addNewFieldFromJson(board, i);
        }
    }

    addNewFieldFromJson(json, fieldId) {
        const field = json.find(v => v.id === fieldId) || null;

        if (field === null)
            throw new Error(`Missing object at (${(fieldId % GameBoard.GAME_BOARD_WIDTH)}, ${Math.floor(fieldId / GameBoard.GAME_BOARD_WIDTH)}) id=${fieldId}`);

        this.fields[fieldId] = new Field(boardToStateMask(json[fieldId].state), (fieldId % GameBoard.GAME_BOARD_WIDTH), Math.floor(fieldId / GameBoard.GAME_BOARD_WIDTH));
    }

    /**
     * 
     * @param {ForEachCallback} callback 
     */
    each(callback) {
        for (let field of this.fields) {
            callback(field, field.x, field.y)
        }
    }

    getFieldAt(x, y) {
        if (this.isOutOfBoundsInXAxis(x) || this.isOutOfBoundsInYAxis(y))
            throw new Error(`point (${x}, ${y}) is out of bounds`)

        return this.fields[x + y * GameBoard.GAME_BOARD_WIDTH] || null
    }

    isOutOfBoundsInXAxis(x) {
        return x < 0 || x >= GameBoard.GAME_BOARD_WIDTH
    }

    isOutOfBoundsInYAxis(y) {
        return y < 0 || y >= GameBoard.GAME_BOARD_HEIGHT
    }
    
    countPlayersFields(player) {
        return this.fields.filter(v => v.belongsTo(player)).length
    }
}