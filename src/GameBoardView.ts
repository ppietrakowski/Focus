import { PLAYER_GREEN, PLAYER_RED } from './Game'
import { IFocus } from "./IFocus"
import { FieldView, IFieldView } from './FieldView'
import { IReserveView, ReserveView } from './ReserveView'
import { IPlayer } from './Player'
import { ReserveViewRequest } from './ReserveViewRequest'
import { IGameBoard } from "./IGameBoard"
import EventEmitter from 'eventemitter3'
import { ForEachFieldInView, IGameBoardView } from './IGameBoardView'
import { DIRECTION_NORTH, DIRECTION_WEST } from './IField'
import { FieldViewRequest } from './FieldViewRequest'


export class GameBoardView implements IGameBoardView {

    static readonly POOL_CLICKED = 'PoolClicked'

    game: IFocus
    gameBoard: IGameBoard
    board: HTMLDivElement
    greenReserve: IReserveView
    redReserve: IReserveView
    events: EventEmitter

    private fields: IFieldView[]

    constructor(game: IFocus) {
        this.gameBoard = game.gameBoard

        this.game = game
        this.fields = []
        this.events = new EventEmitter()

        this.board = document.getElementsByClassName('virtualGameBoard')[0] as HTMLDivElement

        this.greenReserve = new ReserveView(document.getElementsByClassName('reserveGreen')[0] as HTMLDivElement, PLAYER_GREEN)
        this.redReserve = new ReserveView(document.getElementsByClassName('reserveRed')[0] as HTMLDivElement, PLAYER_RED)
        
        PLAYER_GREEN.pooledPawns++
        this.greenReserve.addToReserve()

        this.greenReserve = new ReserveViewRequest(this.greenReserve, this.game)
        this.redReserve = new ReserveViewRequest(this.redReserve, this.game)
        
        this.greenReserve.events.on(ReserveView.POOL_CLICKED, () => this.emitPoolClicked(PLAYER_GREEN, this.greenReserve))
        this.redReserve.events.on(ReserveView.POOL_CLICKED, () => this.emitPoolClicked(PLAYER_RED, this.redReserve))

    }

    private emitPoolClicked(player: IPlayer, reserve: IReserveView) {
        this.events.emit(GameBoardView.POOL_CLICKED, player, reserve)
    }

    getFieldAt(i: number): IFieldView {
        return this.fields[i]
    }

    hookGuiMethods() {
        this.gameBoard.each(
            element => {
                let e: IFieldView = new FieldView(this.game, element)
                this.board.appendChild(e.domElement)

                if (element.belongsTo(PLAYER_GREEN))
                    e = new FieldViewRequest(e, PLAYER_GREEN)
                else
                    e = new FieldViewRequest(e, PLAYER_RED)

                this.fields.push(e)
            }
        )
    }

    each(callback: ForEachFieldInView): void {
        for (const child of this.fields) {
            callback(child)
        }
    }

    private selectedField: IFieldView

    renderPossibleMoves(selectedField: IFieldView) {
        this.selectedField = selectedField
        const maxPossibleMoves = selectedField.field.height

        // north & south
        this.renderInSameLine(maxPossibleMoves, DIRECTION_NORTH)

        // east & west
        this.renderInSameLine(maxPossibleMoves, DIRECTION_WEST)
    }

    private renderInSameLine(maxPossibleMoves: number, baseDirection: {x: number, y: number}) {
        for (let i = 1; i <= maxPossibleMoves; i++) {
            this.selectNeighboursInRange(baseDirection, i)
        }
    }

    private selectNeighboursInRange(baseDirection: {x: number, y: number}, maxRange: number) {
        const {field} = this.selectedField
        
        const offset = this.game.getOffsetBasedOnDirection(field, baseDirection, maxRange)

        const elements = this.fields.filter(v => v.isInRange(field, offset))

        elements.forEach(v => v.visualizeHovered())
    }

    erasePossibleMoves() {
        this.fields.forEach(v => v.visualizeUnhovered())
    }
}