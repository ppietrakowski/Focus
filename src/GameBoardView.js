import { Focus } from "./Game";
import { FieldView } from './FieldView'
import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_SOUTH, DIRECTION_WEST } from "./Field";


export class GameBoardView {

    /**
     * 
     * @param {Focus} game 
     */
    constructor(game) {
        this.gameBoard = game.gameBoard
        this.game = game

        this.fields = []
        this.board = document.getElementsByClassName('gameBoard')[0]

        this.selectedField = null
        //
        this.game.events.on(Focus.ENEMY_HAS_POOL, this.switchToFailedPlayerTurn, this)
    }

    switchToFailedPlayerTurn(failedPlayer) {
        this.game.currentPlayer = failedPlayer
        this.fields.forEach(v => this.enterIntoPlaceState(v, failedPlayer))
    }

    /**
     * 
     * @param {FieldView} field 
     */
    enterIntoPlaceState(field, playerWhoPlace) {
        field.events.off(FieldView.FIELD_CLICK)
        field.isSelected = false

        field.events.on(FieldView.FIELD_CLICK, () => this.onPlaceFieldClicked(field, playerWhoPlace))
    }

    onPlaceFieldClicked(field, playerWhoPlace) {
        if (playerWhoPlace.pooledFields <= 0) {
            console.warn(`Tried to place item without any pool`)
            this.resetToPlayState(playerWhoPlace)
            return
        }

        if (!field.field.isPlayable) {
            this.resetToPlayState(playerWhoPlace)
            return
        }

        playerWhoPlace.pooledFields--
        this.game.placeField(field.field.x, field.field.y, playerWhoPlace)

        this.resetToPlayState(playerWhoPlace)
    }

    resetToPlayState(newNextPlayer) {
        this.fields.forEach(v => v.events.off(FieldView.FIELD_CLICK))
        this.fields.forEach(v => v.events.on(FieldView.FIELD_CLICK, () => this.checkSelection(v)))

        this.reRenderBoard()

        this.game.currentPlayer = newNextPlayer
    }

    hookGuiMethods() {
        this.gameBoard.each(
            element => {
                const e = new FieldView(this.game, element)
                this.board.appendChild(e.domElement)
                e.events.on(FieldView.FIELD_CLICK, () => this.checkSelection(e))

                this.fields.push(e)
            }
        )
    }

    checkSelection(clickedField) {
        this.erasePossibleMoves()

        if (!this.selectedField) {
            this.clickedFirstTime(clickedField)
        } else {
            this.wasClickedWhenSomethingSelected(clickedField)
        }
    }

    clickedFirstTime(clickedField) {
        if (!clickedField.field.belongsTo(this.game.currentPlayer))
            return

        this.selectNewField(clickedField)
    }

    wasClickedWhenSomethingSelected(clickedField) {
        if (this.selectedField === clickedField) {
            this.unSelectField()
            return
        }

        let moveCount = this.calculateMoveCount(clickedField)
        let direction = this.calculateDirection(clickedField)

        if (!direction) {
            console.warn('Tried to move more than is available in this time')
            this.unSelectField()
            return
        }

        this.move(direction, moveCount)
    }

    renderPossibleMoves() {
        const selectedField = this.selectedField.field
        const maxPossibleMoves = selectedField.height

        // north & south
        this.renderInSameLine(selectedField, maxPossibleMoves, DIRECTION_NORTH)

        // east & west
        this.renderInSameLine(selectedField, maxPossibleMoves, DIRECTION_WEST)
    }

    erasePossibleMoves() {
        this.fields.forEach(v => v.domElement.className = v.getUnhoveredClassName())
    }

    reRenderBoard() {
        this.erasePossibleMoves()
    }

    renderInSameLine(selectedField, maxPossibleMoves, baseDirection) {
        for (let i = 1; i <= maxPossibleMoves; i++) {
            const offset = this.game.getOffsetBasedOnDirection(selectedField, baseDirection, i)

            const elements = this.fields.filter(v => v.isInRange(selectedField, offset))

            elements.forEach(v => v.domElement.className = v.getHoveredClassName())
        }
    }

    calculateMoveCount(clickedField) {
        const v = { x: clickedField.field.x - this.selectedField.field.x, y: clickedField.field.y - this.selectedField.field.y }

        if (Math.abs(v.x) > 0)
            return Math.abs(v.x)

        return Math.abs(v.y)
    }

    calculateDirection(clickedField) {
        const v = { x: clickedField.field.x - this.selectedField.field.x, y: clickedField.field.y - this.selectedField.field.y }

        if (Math.abs(v.x) > this.selectedField.field.height || Math.abs(v.y) > this.selectedField.field.height)
            return false

        if (v.x > 0)
            return DIRECTION_EAST
        else if (v.x < 0)
            return DIRECTION_WEST

        else if (v.y > 0)
            return DIRECTION_SOUTH

        return DIRECTION_NORTH
    }

    move(direction, moveCount) {
        if (!this.game.moveToField(this.selectedField.field.x, this.selectedField.field.y, direction, moveCount)) {
            this.unSelectField()
            return
        }

        this.game.nextTurn()
        this.unSelectField()
    }

    selectNewField(clickedField) {
        this.selectedField = clickedField
        this.selectedField.isSelected = true
        this.renderPossibleMoves()

        this.selectedField.domElement.className = this.selectedField.getHoveredClassName()
    }

    unSelectField() {
        this.selectedField.isSelected = false
        this.selectedField.className = this.selectedField.getUnhoveredClassName()
        this.reRenderBoard()
        this.selectedField = null
    }
}