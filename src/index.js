import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_SOUTH, DIRECTION_WEST, FIELD_STATE_PLAYER_A } from './Field'
import { Focus } from './Game'
import { GameBoardView } from './GameBoardView'



const gameFocus = new Focus()

const gameBoardView = new GameBoardView(gameFocus)

gameBoardView.hookGuiMethods()
gameFocus.events.on(Focus.ADDED_ITEM_TO_POOL, () => console.log("added to pool"))
gameFocus.events.on(Focus.ENEMY_HAS_POOL, () => console.log('Should place pawn'))
gameFocus.events.on(Focus.VICTORY, (p) => console.log(`${JSON.stringify(p)} won`))
document.querySelector('.gameBoard').style.visibility = 'hidden'

const playerVsPlayerButton = document.querySelector('#playerVsPlayer')
const playerVsAIButton = document.querySelector('#playerVsAI')
const AIVsAIButton = document.querySelector('#AIvsAI')

playerVsPlayerButton.addEventListener('click', () => document.querySelector('.gameBoard').style.visibility = 'visible')

function notImplementedYet(caller) {
    console.warn(caller, '# not implemented yet')
}

playerVsAIButton.addEventListener('click', () => notImplementedYet('playerVsAIButton'))
AIVsAIButton.addEventListener('click', () => notImplementedYet('AIVsAIButton'))