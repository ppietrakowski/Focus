import { DIRECTION_NORTH, DIRECTION_WEST, FIELD_STATE_PLAYER_A } from './Field'
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

gameFocus.events.on(Focus.MOVED_FIELD, () => fieldsGui[0].renderPossibleMoves())

gameFocus.gameBoard.each(
    element => {
        const e = new FieldView(gameFocus, element, fieldsGui)
        board.appendChild(e.domElement)
        e.events.on(FieldView.FIELD_CLICK, () => renderPossibleMoves(e.field))
        e.events.on(FieldView.FIELD_UNCLICK, () => erasePossibleMoves())
        
        fieldsGui.push(e)
    }
)