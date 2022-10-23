import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_SOUTH, DIRECTION_WEST, FIELD_STATE_PLAYER_A } from './Field'
import { FieldView } from './FieldView'
import { Focus } from './Game'

const gameFocus = new Focus()

const board = document.getElementsByClassName('gameBoard')[0]
const fieldsGui = []

function renderInSameLine(selectedField, maxPossibleMoves, baseDirection) {
    for (let i = 1; i <= maxPossibleMoves; i++) {
        const offset = gameFocus.getOffsetBasedOnDirection(selectedField, baseDirection, i)

        const elements = fieldsGui.filter(v => v.isInRange(selectedField, offset))

        elements.forEach(v => v.domElement.className = v.getHoveredClassName())
    }
}

let selectedField = null

/**
 * 
 * @param {Field} selectedField 
 */
function renderPossibleMoves(selectedField) {
    const maxPossibleMoves = selectedField.height

    // north & south
    renderInSameLine(selectedField, maxPossibleMoves, DIRECTION_NORTH)

    // east & west
    renderInSameLine(selectedField, maxPossibleMoves, DIRECTION_WEST)
}



function erasePossibleMoves() {
    fieldsGui.forEach(v => v.domElement.className = v.getUnhoveredClassName())
}

function reRenderBoard() {
    erasePossibleMoves()
}

function calculateMoveCount(clickedField) {
    const v = { x: clickedField.field.x - selectedField.field.x, y: clickedField.field.y - selectedField.field.y }

    if (Math.abs(v.x) > 0)
        return Math.abs(v.x)

    return Math.abs(v.y)
}

function calculateDirection(clickedField) {
    const v = { x: clickedField.field.x - selectedField.field.x, y: clickedField.field.y - selectedField.field.y }

    if (Math.abs(v.x) > clickedField.field.height || Math.abs(v.y) > clickedField.field.height)
        return false

    if (v.x > 0)
        return DIRECTION_EAST
    else if (v.x < 0)
        return DIRECTION_WEST

    else if (v.y > 0)
        return DIRECTION_SOUTH

    return DIRECTION_NORTH
}


// TODO Add checking for is player don't click something out of it's possible moves
function checkSelection(clickedField) {

    erasePossibleMoves()
    if (!selectedField) {
        selectedField = clickedField
        selectedField.isSelected = true
        renderPossibleMoves(selectedField.field)
        selectedField.domElement.className = selectedField.getHoveredClassName()
    } else {
        if (selectedField === clickedField) {
            selectedField.isSelected = false
            selectedField.className = selectedField.getUnhoveredClassName()
            selectedField = null
            erasePossibleMoves()
            return
        }

        let moveCount = calculateMoveCount(clickedField)
        let direction = calculateDirection(clickedField)

        if (!direction) {
            console.warn('Tried to move more than is available in this time')
            selectedField.isSelected = false
            selectedField.className = selectedField.getUnhoveredClassName()
            reRenderBoard()
            return
        }

        gameFocus.moveToField(selectedField.field.x, selectedField.field.y, direction, moveCount)
        reRenderBoard()
        gameFocus.nextTurn()
        selectedField.isSelected = false
        selectedField.className = selectedField.getUnhoveredClassName()
        selectedField = null
    }

}


gameFocus.gameBoard.each(
    element => {
        const e = new FieldView(gameFocus, element, fieldsGui)
        board.appendChild(e.domElement)
        e.events.on(FieldView.FIELD_CLICK, () => checkSelection(e))

        fieldsGui.push(e)
    }
)
