import { Field } from './Field'
import { IField } from './IField'

import { IPlayer } from './Player'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { FieldState } from './IField'
import { IPredicate } from './GameUtils'


interface BoardState {
    id: number
    state: number
}

export interface ForEachCallback {
    (element: IField, x: number, y: number): void
}

function boardToStateMask(boardState: number) {
    if (boardState === 0)
        return FieldState.Unplayable
    else if (boardState === 1)
        return FieldState.Empty

    else if (boardState === 2)
        return FieldState.Red
    else if (boardState === 3)
        return FieldState.Green

    throw new Error('Illegal board state')
}

interface GameBoardJson {
    elements: {id: number, state: number}[]
}

export class GameBoard implements IGameBoard {
    static readonly MAX_TOWER_HEIGHT = 5
    static readonly GAME_BOARD_WIDTH = 8
    static readonly GAME_BOARD_HEIGHT = 8

    private _fields: IField[][]

    constructor() {
        this._fields = []


        for (let x = 0; x < GameBoard.GAME_BOARD_WIDTH; x++) {
            this._fields[x] = []

            for (let y = 0; y < GameBoard.GAME_BOARD_HEIGHT; y++) {
                this._fields[x][y] = new Field(FieldState.Empty, x, y)
            }
        }

        this.redPlayerPawnCount = 0
        this.greenPlayerPawnCount = 0
    }

    filter(predicate: IPredicate<IField>): IField[] {
        const fields: IField[] = []

        for (let x = 0; x < GameBoard.GAME_BOARD_WIDTH; x++) {
            for (let y = 0; y < GameBoard.GAME_BOARD_HEIGHT; y++) {
                if (predicate(this._fields[x][y])) {
                    fields.push(this._fields[x][y])
                }
            }
        }

        return fields
    }

    redPlayerPawnCount: number
    greenPlayerPawnCount: number

    getBoardAfterPlace(x: number, y: number, player: IPlayer): AfterPlaceMove {
        const gameBoard = new GameBoard()

        const f = gameBoard.getFieldAt(x, y) as Field

        gameBoard.greenPlayerPawnCount = this.greenPlayerPawnCount
        gameBoard.redPlayerPawnCount = this.redPlayerPawnCount

        f.overgrownCallback = (field: IField, state: FieldState) => {
            if (state == FieldState.Green && field.state === player.state) {
                gameBoard.greenPlayerPawnCount++
            }

            if (state == FieldState.Red && field.state === player.state) {
                gameBoard.redPlayerPawnCount++
            }
        }

        f.placeAtTop(player.state)

        return { gameBoard, redCount: gameBoard.redPlayerPawnCount, greenCount: gameBoard.greenPlayerPawnCount }
    }

    getBoardAfterMove(fromField: IField, toField: IField, player: IPlayer): IGameBoard {
        const gameBoard = new GameBoard()

        for (let x = 0; x < GameBoard.GAME_BOARD_WIDTH; x++) {
            for (let y = 0; y < GameBoard.GAME_BOARD_HEIGHT; y++) {
                gameBoard._fields[x][y] = new Field(this._fields[x][y].state, x, y)
            }
        }

        const field = gameBoard.getFieldAt(fromField.x, fromField.y) as Field
        const outField = gameBoard.getFieldAt(toField.x, toField.y) as Field

        gameBoard.greenPlayerPawnCount = this.greenPlayerPawnCount
        gameBoard.redPlayerPawnCount = this.redPlayerPawnCount

        outField.overgrownCallback = (field: IField, state: FieldState) => {
            if (state === player.state) {
                if (state == FieldState.Green) {
                    gameBoard.greenPlayerPawnCount++
                }

                if (state == FieldState.Red) {
                    gameBoard.redPlayerPawnCount++
                }
            }
        }


        outField.moveToThisField(field)

        return gameBoard
    }

    static loadFromJSON(json: GameBoardJson): IGameBoard {
        const board = new GameBoard()
        const { elements } = json

        const maxSize = GameBoard.GAME_BOARD_HEIGHT * GameBoard.GAME_BOARD_WIDTH

        if (elements.length < maxSize)
            throw new Error(`Board should have at least ${maxSize} element`)

        for (let i = 0; i < maxSize; i++) {
            board.addNewFieldFromJson(json, i)
        }

        return board
    }

    each(callback: ForEachCallback): void {
        for (let x = 0; x < this._fields.length; x++) {
            for (let y = 0; y < this._fields[x].length; y++) {
                callback(this._fields[x][y], x, y)
            }
        }
    }

    getFieldAt(x: number, y: number): IField {
        if (this.isOutOfBoundsInXAxis(x) || this.isOutOfBoundsInYAxis(y)) {
            throw new Error(`point (${x}, ${y}) is out of bounds`)
        }

        return this._fields[x][y] || null
    }

    countPlayersFields(player: IPlayer): number {
        return this._fields.reduce((accumulated, value) => {
            value.filter(v => player.doesOwnThisField(v)).forEach(() => accumulated++)
            return accumulated
        }, 0)
    }

    length(): number {
        return this._fields.length
    }

    private addNewFieldFromJson({elements}: GameBoardJson, fieldId: number): void {
        const field = elements.find((v: BoardState) => v.id === fieldId) || null

        const x = (fieldId % GameBoard.GAME_BOARD_WIDTH)
        const y = Math.floor(fieldId / GameBoard.GAME_BOARD_WIDTH)

        if (field === null) {
            throw new Error(`Missing object at (${x}, ${y}) id=${fieldId}`)
        }

        this._fields[x][y] = new Field(boardToStateMask(elements[fieldId].state), x, y)
    }

    private isOutOfBoundsInXAxis(x: number): boolean {
        return x < 0 || x >= GameBoard.GAME_BOARD_WIDTH
    }

    private isOutOfBoundsInYAxis(y: number): boolean {
        return y < 0 || y >= GameBoard.GAME_BOARD_HEIGHT
    }
}