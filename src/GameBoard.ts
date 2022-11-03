import EventEmitter from 'eventemitter3'
import { IField, Field, FIELD_STATE_EMPTY, FIELD_STATE_PLAYER_RED, FIELD_STATE_PLAYER_GREEN, FIELD_STATE_UNPLAYABLE } from './Field'

import board from './board.json'
import { IPlayer, Player } from './Player'


interface BoardState {
    id: number
    state: number
}

interface ForEachCallback {
    (element: IField, x: number, y: number): void
}

function boardToStateMask(boardState: number) {
    if (boardState === 0)
        return FIELD_STATE_UNPLAYABLE

    else if (boardState === 1)
        return FIELD_STATE_EMPTY

    else if (boardState === 2)
        return FIELD_STATE_PLAYER_RED
    else if (boardState === 3)
        return FIELD_STATE_PLAYER_GREEN

    throw new Error('Illegal board state')
}

export interface IGameBoard {
    events: EventEmitter
    each(callback: ForEachCallback): void
    getFieldAt(x: number, y: number): IField
    countPlayersFields(player: IPlayer): number
}


export class GameBoard implements IGameBoard {
    static readonly MAX_TOWER_HEIGHT = 5
    static readonly GAME_BOARD_WIDTH = 8
    static readonly GAME_BOARD_HEIGHT = 8

    private fields: IField[]

    events: EventEmitter

    constructor() {
        this.events = new EventEmitter()
        const elements = board.elements

        this.fields = []

        const maxSize = GameBoard.GAME_BOARD_HEIGHT * GameBoard.GAME_BOARD_WIDTH

        if (elements.length < maxSize)
            throw new Error(`Board should have at least ${maxSize} element`)

        for (let i = 0; i < maxSize; i++) {
            this.addNewFieldFromJson(elements, i)
        }
    }

    each(callback: ForEachCallback) {
        for (const field of this.fields) {
            callback(field, field.x, field.y)
        }
    }

    getFieldAt(x: number, y: number) {
        if (this.isOutOfBoundsInXAxis(x) || this.isOutOfBoundsInYAxis(y)) {
            throw new Error(`point (${x}, ${y}) is out of bounds`)
        }

        return this.fields[x + y * GameBoard.GAME_BOARD_WIDTH] || null
    }

    countPlayersFields(player: IPlayer) {
        return this.fields.filter(v => v.belongsTo(player)).length
    }

    private addNewFieldFromJson(json: any, fieldId: number) {
        const field = json.find((v: BoardState)  => v.id === fieldId) || null

        if (field === null) {
            throw new Error(`Missing object at (${(fieldId % GameBoard.GAME_BOARD_WIDTH)}, ${Math.floor(fieldId / GameBoard.GAME_BOARD_WIDTH)}) id=${fieldId}`)
        }

        this.fields[fieldId] = new Field(boardToStateMask(json[fieldId].state), (fieldId % GameBoard.GAME_BOARD_WIDTH), Math.floor(fieldId / GameBoard.GAME_BOARD_WIDTH))
    }

    private isOutOfBoundsInXAxis(x: number) {
        return x < 0 || x >= GameBoard.GAME_BOARD_WIDTH
    }

    private isOutOfBoundsInYAxis(y: number) {
        return y < 0 || y >= GameBoard.GAME_BOARD_HEIGHT
    }

    
}