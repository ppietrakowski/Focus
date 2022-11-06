import { PLAYER_GREEN, PLAYER_RED } from './Game'
import { EventAddedToPool, IFocus } from './IFocus'
import { FieldView, IFieldView } from './FieldView'
import { EventPoolClicked, IReserveView, ReserveView } from './ReserveView'
import { IPlayer } from './Player'
import { ReserveViewRequest } from './ReserveViewRequest'
import { IGameBoard } from './IGameBoard'
import { ForEachFieldInView, IGameBoardView, IPoolClickedListener } from './IGameBoardView'
import { FieldViewRequest } from './FieldViewRequest'
import { DirectionNorth, DirectionWest } from './IField'
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
    
    private fields: IFieldView[]
    private selectedField: IFieldView

    constructor(game: IFocus)
    {
        this.events = new EventEmitter()
        this.gameBoard = game.gameBoard

        this.game = game
        this.fields = []

        this.board = document.getElementsByClassName('virtualGameBoard')[0] as HTMLDivElement

        this.greenReserve = new ReserveView(document.getElementsByClassName('reserveGreen')[0] as HTMLDivElement, PLAYER_GREEN)
        this.redReserve = new ReserveView(document.getElementsByClassName('reserveRed')[0] as HTMLDivElement, PLAYER_RED)

        this.greenReserve.addToReserve()
        this.greenReserve = new ReserveViewRequest(this.greenReserve, this.game)
        this.redReserve = new ReserveViewRequest(this.redReserve, this.game)

        this.greenReserve.addPoolClickedListener(this.onPoolClicked, this)
        this.redReserve.addPoolClickedListener(this.onPoolClicked, this)

        this.game.events.on(EventAddedToPool, this.addedToPool, this)
    }

    private addedToPool(player: IPlayer)
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


    renderPossibleMoves(selectedField: IFieldView)
    {
        this.selectedField = selectedField
        const maxPossibleMoves = selectedField.field.height

        // north & south
        this.renderInSameLine(maxPossibleMoves, DirectionNorth)

        // east & west
        this.renderInSameLine(maxPossibleMoves, DirectionWest)

        selectedField.visualizeHovered()
    }

    private renderInSameLine(maxPossibleMoves: number, baseDirection: { x: number, y: number })
    {
        for (let i = 1; i <= maxPossibleMoves; i++)
        {
            this.selectNeighboursInRange(baseDirection, i)
        }
    }

    get isSomethingSelected()
    {
        return !!this.selectedField
    }

    private selectNeighboursInRange(baseDirection: { x: number, y: number }, maxRange: number)
    {
        const { field } = this.selectedField
        const offset = this.game.getOffsetBasedOnDirection(field, baseDirection, maxRange)

        const neighbours = this.fields.filter(v => v.isInRange(field, offset))

        neighbours.forEach(v => v.visualizeHovered())
    }

    unselectField(): void
    {
        this.selectedField = null
    }

    erasePossibleMoves()
    {
        this.fields.forEach(v => v.visualizeUnhovered())
        this.selectedField = null
    }
}