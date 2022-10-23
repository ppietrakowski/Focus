import { FIELD_STATE_PLAYER_A } from './Field'
import { Focus } from './Game'

const gameFocus = new Focus()

const board = document.getElementsByClassName('gameBoard')[0]

gameFocus.gameBoard.each(
    element => {
        const newElement = document.createElement('div')
        if (!element.isEmpty && element.isPlayable) {
            newElement.className = (element.state & FIELD_STATE_PLAYER_A) ? 'playerRedField' : 'playerGreenField'
        } else {
            newElement.className = 'emptyField'
        }

        board.appendChild(newElement)
    }
)