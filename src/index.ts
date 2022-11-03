import { Focus } from './Game'
import { GameBoardView } from './GameBoardView'

const focus = new Focus()

const gameBoardView = new GameBoardView(focus)

gameBoardView.hookGuiMethods()
focus.events.on(Focus.ADDED_ITEM_TO_POOL, () => console.log("added to pool"))
focus.events.on(Focus.ENEMY_HAS_POOL, () => console.log('Should place pawn'))
focus.events.on(Focus.VICTORY, (p) => console.log(`${JSON.stringify(p)} won`))

const gameBoard = document.querySelector('.gameBoard') as HTMLDivElement
gameBoard.style.visibility = 'hidden'

const playerVsPlayerButton = document.querySelector('#playerVsPlayer')
const playerVsAIButton = document.querySelector('#playerVsAI')
const AIVsAIButton = document.querySelector('#AIvsAI')

playerVsPlayerButton.addEventListener('click', () => gameBoard.style.visibility = 'visible')

function notImplementedYet(caller: any) {
    console.warn(caller, '# not implemented yet')
}

playerVsAIButton.addEventListener('click', () => notImplementedYet('playerVsAIButton'))
AIVsAIButton.addEventListener('click', () => notImplementedYet('AIVsAIButton'))