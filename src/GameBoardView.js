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
            if (!clickedField.field.belongsTo(this.game.currentPlayer))
                return

            this.selectNewField(clickedField)
        } else {
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
            console.log(clickedField)
        }

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
        this.game.moveToField(this.selectedField.field.x, this.selectedField.field.y, direction, moveCount)
        this.reRenderBoard()
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