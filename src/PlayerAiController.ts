import { AiController } from './AiController'
import { FieldView, IFieldView } from './FieldView'
import { IFocus } from "./IFocus"
import { IPlayer, Player } from './Player'
import { IGameBoardView } from './IGameBoardView'
import { GameBoardView } from './GameBoardView'
import { IReserveView } from './ReserveView'


export default class PlayerAiController extends AiController {

    selectedField: IFieldView

    constructor(player: Player, game: IFocus, gameBoard: IGameBoardView) {
        super(player, game, gameBoard)

        this.selectedField = null

        this.gameBoard.each(v => this.makeClickable(v))
        this.gameBoard.events.on(GameBoardView.POOL_CLICKED, this.poolClicked, this)

        this.gameBoard.each(v => v.events.on(FieldView.FieldMouseOver, this.onMouseOverField, this))
        this.gameBoard.each(v => v.events.on(FieldView.FieldMouseLeave, this.onMouseLeaveField, this))
    }

    private poolClicked(player: IPlayer, reserve: IReserveView) {
        if (this.isTurnOfPlayer(player)) {
            if (reserve.removeFromReserve()) {
                this.gameBoardController.switchToPlaceStateAtPlayerTurn(player)
            }
        }
    }

    private isTurnOfPlayer(player: IPlayer) {
        const {currentPlayer} = this.game

        return currentPlayer === player
    }

    private onMouseOverField(player: IPlayer, field: IFieldView) {
        const {currentPlayer} = this.game

        if (this.isTurnOfPlayer(player) && currentPlayer.doesOwnThisField(field.field)) {
            field.visualizeHovered()
        }
    }

    private onMouseLeaveField(player: IPlayer, field: IFieldView) {
        const {currentPlayer} = this.game
        if (this.isTurnOfPlayer(player) && currentPlayer.doesOwnThisField(field.field)) {
            field.visualizeUnhovered()
        }
    }

    private makeClickable(v: IFieldView) {
        v.addClickListener(this.checkSelection, this)
    }

    move(): void {
    }

    stopMoving(): void {
    }

    private checkSelection(clickedField: IFieldView) {
        this.gameBoard.erasePossibleMoves()

        if (!this.selectedField) {
            this.clickedFirstTime(clickedField)
            return
        }

        this.clickedWhenSomethingSelected(clickedField)
    }

    private clickedFirstTime(clickedField: IFieldView) {
        if (!clickedField.field.belongsTo(this.game.currentPlayer)) {
            return
        }

        this.selectNewField(clickedField)
    }

    private selectNewField(clickedField: IFieldView) {
        this.selectedField = clickedField
        this.gameBoard.renderPossibleMoves(this.selectedField)

        this.selectedField.visualizeHovered()
    }

    private clickedWhenSomethingSelected(clickedField: IFieldView) {
        if (this.wasDoubleClicked(clickedField)) {
            this.unselectField()
            return
        }

        const direction = this.selectedField.field.calculateDirectionTowards(clickedField.field)

        if (!direction) {
            console.warn('Tried to move more than is available in this time')
            this.unselectField()
            return
        }

        this.moveTowardsDirection(clickedField, direction)
    }

    private wasDoubleClicked(clickedField: IFieldView) {
        return this.selectedField === clickedField
    }

    private moveTowardsDirection(clickedField: IFieldView, direction: { x: number, y: number }) {
        const moveCount = this.selectedField.field.calculateMoveCountTowards(clickedField.field)

        const isAvailableToMoveThere = this.game.moveToField(this.selectedField.field.x, this.selectedField.field.y, direction, moveCount)

        if (!isAvailableToMoveThere) {
            this.unselectField()
            return
        }

        this.game.nextTurn()
        this.unselectField()
    }

    private unselectField() {
        this.selectedField.visualizeUnhovered()
        this.gameBoard.erasePossibleMoves()
        this.selectedField = null
    }
}