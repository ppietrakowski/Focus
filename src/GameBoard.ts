import { Field } from './Field'
import { IField } from './IField'

import board from './board.json'
import { IPlayer } from './Player'
import { IGameBoard } from './IGameBoard'
import { FieldState } from './IField'


interface BoardState
{
    id: number
    state: number
}

export interface ForEachCallback
{
    (element: IField, x: number, y: number): void
}

function boardToStateMask(boardState: number)
{
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

export class GameBoard implements IGameBoard
{
    static readonly MAX_TOWER_HEIGHT = 5
    static readonly GAME_BOARD_WIDTH = 8
    static readonly GAME_BOARD_HEIGHT = 8

    private _fields: IField[]

    constructor()
    {
        const { elements } = board

        this._fields = []

        const maxSize = GameBoard.GAME_BOARD_HEIGHT * GameBoard.GAME_BOARD_WIDTH

        if (elements.length < maxSize)
            throw new Error(`Board should have at least ${maxSize} element`)

        for (let i = 0; i < maxSize; i++)
        {
            this.addNewFieldFromJson(elements, i)
        }
    }

    each(callback: ForEachCallback)
    {
        for (let i = 0; i < this._fields.length; i++)
        {
            const x = (i % GameBoard.GAME_BOARD_WIDTH)
            const y = Math.floor(i / GameBoard.GAME_BOARD_WIDTH)

            callback(this._fields[i], x, y)
        }
    }

    getFieldAt(x: number, y: number)
    {
        if (this.isOutOfBoundsInXAxis(x) || this.isOutOfBoundsInYAxis(y))
        {
            throw new Error(`point (${x}, ${y}) is out of bounds`)
        }

        return this._fields[x + y * GameBoard.GAME_BOARD_WIDTH] || null
    }

    countPlayersFields(player: IPlayer)
    {
        return this._fields.filter(v => player.doesOwnThisField(v)).length
    }

    private addNewFieldFromJson(json: any, fieldId: number)
    {
        const field = json.find((v: BoardState) => v.id === fieldId) || null

        if (field === null)
        {
            throw new Error(`Missing object at (${(fieldId % GameBoard.GAME_BOARD_WIDTH)}, ${Math.floor(fieldId / GameBoard.GAME_BOARD_WIDTH)}) id=${fieldId}`)
        }

        this._fields[fieldId] = new Field(boardToStateMask(json[fieldId].state), (fieldId % GameBoard.GAME_BOARD_WIDTH), Math.floor(fieldId / GameBoard.GAME_BOARD_WIDTH))
    }

    private isOutOfBoundsInXAxis(x: number)
    {
        return x < 0 || x >= GameBoard.GAME_BOARD_WIDTH
    }

    private isOutOfBoundsInYAxis(y: number)
    {
        return y < 0 || y >= GameBoard.GAME_BOARD_HEIGHT
    }
}