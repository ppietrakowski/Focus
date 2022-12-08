import { PLAYER_GREEN, PLAYER_RED } from './Game'
import { EventMovedField, EventVictory, IFocus, Move } from './IFocus'
import { FieldView, IFieldView } from './FieldView'
import { ReserveView } from './ReserveView'
import { IReserveView, EventPoolClicked } from './IReserveView'
import { IPlayer } from './Player'
import { ReserveViewOnPlayerTurnDecorator } from './ReserveViewOnPlayerTurnDecorator'
import { IGameBoard } from './IGameBoard'
import { ForEachFieldInView, IGameBoardView, IPoolClickedListener } from './IGameBoardView'
import { FieldViewDecorator } from './FieldViewDecorator'
import EventEmitter from 'eventemitter3'
import { getLegalMovesFromField } from './LegalMovesFactory'

export class GameBoardView implements IGameBoardView {

    static readonly POOL_CLICKED = 'PoolClicked'

    game: IFocus
    gameBoard: IGameBoard
    greenReserve: IReserveView
    redReserve: IReserveView
    events: EventEmitter

    private board: IFieldView[]
    private selectedField: IFieldView | null

    constructor(game: IFocus) {
        this.events = new EventEmitter()
        this.gameBoard = game.gameBoard

        this.game = game
        this.board = []

        const board = document.getElementsByClassName('virtualGameBoard')[0] as HTMLDivElement

        this.greenReserve = new ReserveView(game, document.getElementsByClassName('reserveGreen')[0] as HTMLDivElement, PLAYER_GREEN)
        this.redReserve = new ReserveView(game, document.getElementsByClassName('reserveRed')[0] as HTMLDivElement, PLAYER_RED)

        this.greenReserve = new ReserveViewOnPlayerTurnDecorator(this.greenReserve, this.game)
        this.redReserve = new ReserveViewOnPlayerTurnDecorator(this.redReserve, this.game)

        this.greenReserve.addPoolClickedListener(this.onPoolClicked, this)
        this.redReserve.addPoolClickedListener(this.onPoolClicked, this)

        this.game.events.on(EventMovedField, () => this.erasePossibleMoves())
        this.gameBoard.each(
            element => {
                let e: IFieldView = new FieldView(this.game, element)
                board.appendChild(e.domElement)

                if (PLAYER_GREEN.doesOwnThisField(e.field))
                    e = new FieldViewDecorator(e, PLAYER_GREEN)
                else
                    e = new FieldViewDecorator(e, PLAYER_RED)
                this.board[element.posX + 8 * element.posY] = e
            }
        )
        this.game.events.on(EventVictory, () => this.erasePossibleMoves())
        this.selectedField = null
    }

    private onPoolClicked(player: IPlayer, reserve: IReserveView): void {
        this.events.emit(EventPoolClicked, player, reserve)
    }

    addPoolClickedListener<T>(listener: IPoolClickedListener, context?: T): void {
        this.events.on(EventPoolClicked, listener, context)
    }

    removePoolClickedListener<T>(listener: IPoolClickedListener, context?: T): void {
        this.events.off(EventPoolClicked, listener, context)
    }

    getFieldAt(i: number): IFieldView {
        return this.board[i]
    }

    each(callback: ForEachFieldInView): void {
        for (const child of this.board) {
            callback(child)
        }
    }

    renderPossibleMoves(selectedField: IFieldView): void {
        this.selectedField = selectedField

        const movesFromThisField = getLegalMovesFromField(this.gameBoard, selectedField.field.posX, selectedField.field.posY)
            .filter(this.isMoveFromThisField, this)

        
        for (let i = 0; i < movesFromThisField.length; i++) {
            if (this.selectedField === null) {
                return
            }

            const { field } = this.selectedField
            const offset = this.game.getOffsetBasedOnDirection(field, movesFromThisField[i].direction, movesFromThisField[i].moveCount)

            const neighbours = this.board.filter(v => v.isInRange(field, offset))

            neighbours.forEach(v => v.visualizeHovered())
        }
    }

    private isMoveFromThisField(move: Move): boolean {
        return move.x === this.selectedField.field.posX && move.y === this.selectedField.field.posY
    }

    get isSomethingSelected(): boolean {
        return !!this.selectedField
    }

    erasePossibleMoves(): void {
        this.board.forEach(v => v.visualizeUnhovered())
        this.selectedField = null
    }
}