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

        newElement.addEventListener('mouseover', e => {
            if (gameFocus.currentPlayer.doesOwnThisField(element))
                newElement.className = (element.state & FIELD_STATE_PLAYER_A) ? 'playerRedFieldHovered' : 'playerGreenFieldHovered'
        })

        newElement.addEventListener('mouseleave', e => {
            if (gameFocus.currentPlayer.doesOwnThisField(element))
                newElement.className = (element.state & FIELD_STATE_PLAYER_A) ? 'playerRedField' : 'playerGreenField'
        })

        board.appendChild(newElement)
    }
)