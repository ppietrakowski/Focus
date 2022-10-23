import { FIELD_STATE_EMPTY, FIELD_STATE_PLAYER_A, FIELD_STATE_UNPLAYABLE } from './Field'
import { Focus } from './Game'

const gameFocus = new Focus()

const board = document.getElementsByClassName('gameBoard')[0]

gameFocus.gameBoard.each(
    (element, x, y) => {
        const newElement = document.createElement('div')
        if (!(element.state & FIELD_STATE_EMPTY) && !(element.state & FIELD_STATE_UNPLAYABLE)) {
            newElement.className = (element.state & FIELD_STATE_PLAYER_A) ? 'playerRedField' : 'playerGreenField'
        } else {
            newElement.className = 'emptyField'
        }

        board.appendChild(newElement)
    }
)