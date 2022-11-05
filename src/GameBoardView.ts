import { PLAYER_GREEN, PLAYER_RED } from './Game'
import { IFocus } from "./IFocus"
import { FieldView, IFieldView } from './FieldView'
import { IReserveView, ReserveView } from './ReserveView'
import { IPlayer } from './Player'
import { ReserveViewRequest } from './ReserveViewRequest'
import { IGameBoard } from "./IGameBoard"
import { ForEachFieldInView, IGameBoardView, IPoolClickedListener } from './IGameBoardView'
import { FieldViewRequest } from './FieldViewRequest'
import { DirectionNorth, DirectionWest } from './IField'


export class GameBoardView implements IGameBoardView, IPoolClickedListener
{

    static readonly POOL_CLICKED = 'PoolClicked'

    game: IFocus
    gameBoard: IGameBoard
    board: HTMLDivElement
    greenReserve: IReserveView
    redReserve: IReserveView

    private _poolClickedListeners: IPoolClickedListener[]
    private fields: IFieldView[]

    constructor(game: IFocus)
    {
        this.gameBoard = game.gameBoard

        this.game = game
        this.fields = []

        this.board = document.getElementsByClassName('virtualGameBoard')[0] as HTMLDivElement

        this.greenReserve = new ReserveView(document.getElementsByClassName('reserveGreen')[0] as HTMLDivElement, PLAYER_GREEN)
        this.redReserve = new ReserveView(document.getElementsByClassName('reserveRed')[0] as HTMLDivElement, PLAYER_RED)

        this.greenReserve = new ReserveViewRequest(this.greenReserve, this.game)
        this.redReserve = new ReserveViewRequest(this.redReserve, this.game)

        this.greenReserve.addPoolClickedListener(this)
        this.redReserve.addPoolClickedListener(this)

        this._poolClickedListeners = []
    }

    onPoolClicked(player: IPlayer, reserve: IReserveView): void
    {
        this._poolClickedListeners.forEach(l => l.onPoolClicked(player, reserve))
    }

    addPoolClickedListener(listener: IPoolClickedListener): void
    {
        this._poolClickedListeners.push(listener)
    }

    removePoolClickedListener(listener: IPoolClickedListener): void
    {
        this._poolClickedListeners = this._poolClickedListeners.filter(l => l !== listener)
    }

    getFieldAt(i: number): IFieldView
    {
        return this.fields[i]
    }

    hookGuiMethods()
    {
        this.gameBoard.each(
            element =>
            {
                let e: IFieldView = new FieldView(this.game, element)
                this.board.appendChild(e.domElement)

                if (PLAYER_GREEN.doesOwnThisField(e.field))
                    e = new FieldViewRequest(e, PLAYER_GREEN)
                else
                    e = new FieldViewRequest(e, PLAYER_RED)

                this.fields.push(e)
            }
        )
    }

    each(callback: ForEachFieldInView): void
    {
        for (const child of this.fields)
        {
            callback(child)
        }
    }

    private selectedField: IFieldView

    renderPossibleMoves(selectedField: IFieldView)
    {
        this.selectedField = selectedField
        const maxPossibleMoves = selectedField.field.height

        // north & south
        this.renderInSameLine(maxPossibleMoves, DirectionNorth)

        // east & west
        this.renderInSameLine(maxPossibleMoves, DirectionWest)
    }

    private renderInSameLine(maxPossibleMoves: number, baseDirection: { x: number, y: number })
    {
        for (let i = 1; i <= maxPossibleMoves; i++)
        {
            this.selectNeighboursInRange(baseDirection, i)
        }
    }

    private selectNeighboursInRange(baseDirection: { x: number, y: number }, maxRange: number)
    {
        const { field } = this.selectedField

        const offset = this.game.getOffsetBasedOnDirection(field, baseDirection, maxRange)

        const elements = this.fields.filter(v => v.isInRange(field, offset))

        elements.forEach(v => v.visualizeHovered())
    }

    erasePossibleMoves()
    {
        this.fields.forEach(v => v.visualizeUnhovered())
    }
}