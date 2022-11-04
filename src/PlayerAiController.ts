import { AiController } from './AiController'
import { FieldView, IFieldView } from './FieldView'
import { IFocus } from "./IFocus"
import { Player } from './Player'
import { IGameBoardView } from './IGameBoardView'


export default class PlayerAiController extends AiController {

    selectedField: IFieldView

    constructor(player: Player, game: IFocus, gameBoard: IGameBoardView) {
        super(player, game, gameBoard)

        this.selectedField = null

        this.gameBoard.each(v => this.makeClickable(v))
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