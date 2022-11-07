import { PLAYER_GREEN, PLAYER_RED } from './Game'
import { EventAddedToPool, IFocus } from './IFocus'
import { FieldView, IFieldView } from './FieldView'
import { ReserveView } from './ReserveView'
import { IReserveView, EventPoolClicked } from './IReserveView'
import { IPlayer } from './Player'
import { ReserveViewOnPlayerTurnDecorator } from './ReserveViewOnPlayerTurnDecorator'
import { IGameBoard } from './IGameBoard'
import { ForEachFieldInView, IGameBoardView, IPoolClickedListener } from './IGameBoardView'
import { FieldViewDecorator } from './FieldViewDecorator'
import { Direction, DirectionNorth, DirectionWest } from './IField'
import EventEmitter from 'eventemitter3'


export class GameBoardView implements IGameBoardView
{

    static readonly POOL_CLICKED = 'PoolClicked'

    game: IFocus
    gameBoard: IGameBoard
    board: HTMLDivElement
    greenReserve: IReserveView
    redReserve: IReserveView
    events: EventEmitter

    private _fields: IFieldView[]
    private _selectedField: IFieldView

    constructor(game: IFocus)
    {
        this.events = new EventEmitter()
        this.gameBoard = game.gameBoard

        this.game = game
        this._fields = []

        this.board = document.getElementsByClassName('virtualGameBoard')[0] as HTMLDivElement

        this.greenReserve = new ReserveView(document.getElementsByClassName('reserveGreen')[0] as HTMLDivElement, PLAYER_GREEN)
        this.redReserve = new ReserveView(document.getElementsByClassName('reserveRed')[0] as HTMLDivElement, PLAYER_RED)

        this.greenReserve.addToReserve()
        this.greenReserve = new ReserveViewOnPlayerTurnDecorator(this.greenReserve, this.game)
        this.redReserve = new ReserveViewOnPlayerTurnDecorator(this.redReserve, this.game)

        this.greenReserve.addPoolClickedListener(this.onPoolClicked, this)
        this.redReserve.addPoolClickedListener(this.onPoolClicked, this)

        this.game.events.on(EventAddedToPool, this.addedToPool, this)

        this.gameBoard.each(
            element =>
            {
                let e: IFieldView = new FieldView(this.game, element)
                this.board.appendChild(e.domElement)

                if (PLAYER_GREEN.doesOwnThisField(e.field))
                    e = new FieldViewDecorator(e, PLAYER_GREEN)
                else
                    e = new FieldViewDecorator(e, PLAYER_RED)
                this._fields.push(e)
            }
        )
    }

    private addedToPool()
    {
        this.greenReserve.addToReserve()
        this.redReserve.addToReserve()
    }


    private onPoolClicked(player: IPlayer, reserve: IReserveView): void
    {
        this.events.emit(EventPoolClicked, player, reserve)
    }

    addPoolClickedListener(listener: IPoolClickedListener, context?: any): void
    {
        this.events.on(EventPoolClicked, listener, context)
    }

    removePoolClickedListener(listener: IPoolClickedListener, context?: any): void
    {
        this.events.off(EventPoolClicked, listener, context)
    }

    getFieldAt(i: number): IFieldView
    {
        return this._fields[i]
    }

    each(callback: ForEachFieldInView): void
    {
        for (const child of this._fields)
        {
            callback(child)
        }
    }

    renderPossibleMoves(selectedField: IFieldView)
    {
        this._selectedField = selectedField
        const maxPossibleMoves = selectedField.field.height

        // north & south
        this.renderInSameLine(maxPossibleMoves, DirectionNorth)

        // east & west
        this.renderInSameLine(maxPossibleMoves, DirectionWest)

        selectedField.visualizeHovered()
    }

    private renderInSameLine(maxPossibleMoves: number, baseDirection: Direction)
    {
        for (let i = 1; i <= maxPossibleMoves; i++)
        {
            this.selectNeighboursInRange(baseDirection, i)
        }
    }

    get isSomethingSelected()
    {
        return !!this._selectedField
    }

    private selectNeighboursInRange(baseDirection: Direction, maxRange: number)
    {
        const { field } = this._selectedField
        const offset = this.game.getOffsetBasedOnDirection(field, baseDirection, maxRange)

        const neighbours = this._fields.filter(v => v.isInRange(field, offset))

        neighbours.forEach(v => v.visualizeHovered())
    }

    erasePossibleMoves()
    {
        this._fields.forEach(v => v.visualizeUnhovered())
        this._selectedField = null
    }
}