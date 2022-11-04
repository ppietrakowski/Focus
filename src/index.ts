import { Focus, PLAYER_GREEN, PLAYER_RED } from './Game'
import { GameBoardView } from './GameBoardView'
import { GameBoardController } from './IGameBoardController'
import PlayerAiController from './PlayerAiController'

const focus = new Focus()

const gameBoardView = new GameBoardView(focus)

gameBoardView.hookGuiMethods()
focus.events.on(Focus.ADDED_ITEM_TO_POOL, () => console.log('added to pool'))
focus.events.on(Focus.ENEMY_HAS_POOL, () => console.log('Should place pawn'))
focus.events.on(Focus.VICTORY, (p) => console.log(`${JSON.stringify(p)} won`))

const gameBoard = document.querySelector('.gameBoard') as HTMLDivElement
gameBoard.style.visibility = 'hidden'

const playerVsPlayerButton = document.querySelector('#playerVsPlayer') as HTMLButtonElement
const playerVsAIButton = document.querySelector('#playerVsAI') as HTMLButtonElement
const AIVsAIButton = document.querySelector('#AIvsAI') as HTMLButtonElement

var gameBoardController = new GameBoardController(gameBoardView, new PlayerAiController(PLAYER_RED, focus, gameBoardView), new PlayerAiController(PLAYER_GREEN, focus, gameBoardView))
playerVsPlayerButton.addEventListener('click', () => gameBoard.style.visibility = 'visible')

function notImplementedYet(caller: any) {
    console.warn(caller, '# not implemented yet')
}

playerVsAIButton.addEventListener('click', () => notImplementedYet('playerVsAIButton'))
AIVsAIButton.addEventListener('click', () => notImplementedYet('AIVsAIButton'))