import { Focus, PLAYER_GREEN, PLAYER_RED } from './Game'
import { GameBoardView } from './GameBoardView'
import { IAddedToPoolListener, IEnemyHasPoolListener, INewTurnListener, IVictoryListener } from './IFocus'
import { GameBoardController } from './IGameBoardController'
import { IPlayer } from './Player'
import PlayerAiController from './PlayerAiController'
import { RandomPlayer } from './RandomPlayer'


const focus = new Focus()

const gameBoardView = new GameBoardView(focus)

gameBoardView.hookGuiMethods()

class LoggingListener implements IAddedToPoolListener, IEnemyHasPoolListener, IVictoryListener, INewTurnListener
{
    onAddedToPool(toWhichPlayer: IPlayer): void
    {
        console.log('added to pool')
    }

    onEnemyHasPool(enemy: IPlayer): void
    {
        console.log('Should place pawn')
    }
    onVictory(victoriousPlayer: IPlayer): void
    {
        console.log(`${JSON.stringify(victoriousPlayer)} won`)
    }
    onNextTurnBegin(currentPlayer: IPlayer): void
    {
        console.log(`Next turn`)
    }
}

const logging = new LoggingListener()

focus.addAddedToPoolListener(logging)
focus.addVictoryListener(logging)
focus.addEnemyHasPoolListener(logging)
focus.addNewTurnListener(logging)

const gameBoard = document.querySelector('.gameBoard') as HTMLDivElement
gameBoard.style.visibility = 'hidden'

const playerVsPlayerButton = document.querySelector('#playerVsPlayer') as HTMLButtonElement
const playerVsAIButton = document.querySelector('#playerVsAI') as HTMLButtonElement
const AIVsAIButton = document.querySelector('#AIvsAI') as HTMLButtonElement

var gameBoardController = new GameBoardController(gameBoardView, new PlayerAiController(PLAYER_RED, focus, gameBoardView), new RandomPlayer(PLAYER_GREEN, focus, gameBoardView))
playerVsPlayerButton.addEventListener('click', () => gameBoard.style.visibility = 'visible')

function notImplementedYet(caller: any)
{
    console.warn(caller, '# not implemented yet')
}

playerVsAIButton.addEventListener('click', () => notImplementedYet('playerVsAIButton'))
AIVsAIButton.addEventListener('click', () => notImplementedYet('AIVsAIButton'))