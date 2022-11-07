import { Focus, PLAYER_GREEN, PLAYER_RED } from './Game'
import { GameBoardView } from './GameBoardView'
import { EventAddedToPool, EventEnemyHasPool, EventNewTurn, EventVictory, IAddedToPoolListener, IEnemyHasPoolListener, INewTurnListener, IVictoryListener } from './IFocus'
import { GameBoardController } from './GameBoardController'
import { IPlayer } from './Player'
import PlayerAiController from './PlayerAiController'
import { RandomPlayer } from './RandomPlayer'
import { MinMaxAiPlayerController } from './MinMaxAiPlayerController'
import { IAiController, IGameBoardController } from './IGameBoardController'
import { FieldState } from './IField'


const focus = new Focus()

const gameBoardView = new GameBoardView(focus)

class LoggingListener
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
        console.log(`${victoriousPlayer.state === FieldState.Green ? 'Green' : 'Red'} won`)
    }
    onNextTurnBegin(currentPlayer: IPlayer): void
    {
        console.log('Next turn')
    }
}

const logging = new LoggingListener()

focus.events.on(EventAddedToPool, logging.onAddedToPool, logging)
focus.events.on(EventVictory, logging.onVictory, logging)
focus.events.on(EventEnemyHasPool, logging.onEnemyHasPool, logging)
focus.events.on(EventNewTurn, logging.onNextTurnBegin, logging)

const gameBoard = document.querySelector('.gameBoard') as HTMLDivElement
gameBoard.style.visibility = 'hidden'
gameBoard.style.opacity = '0'

const playerVsPlayerButton = document.querySelector('#playerVsPlayer') as HTMLButtonElement
const playerVsAIButton = document.querySelector('#playerVsAI') as HTMLButtonElement
const AIVsAIButton = document.querySelector('#AIvsAI') as HTMLButtonElement

//const gameBoardController = new GameBoardController(gameBoardView, new PlayerAiController(PLAYER_RED, focus, gameBoardView), new PlayerAiController(PLAYER_GREEN, focus, gameBoardView))
playerVsPlayerButton.addEventListener('click', () => gameBoard.style.visibility = 'visible')
playerVsPlayerButton.addEventListener('click', () => gameBoard.style.opacity = '1.0')
playerVsPlayerButton.addEventListener('click', () => new GameBoardController(gameBoardView, new PlayerAiController(PLAYER_RED, focus, gameBoardView), new PlayerAiController(PLAYER_GREEN, focus, gameBoardView)))

playerVsAIButton.addEventListener('click', () => gameBoard.style.visibility = 'visible')
playerVsAIButton.addEventListener('click', () => gameBoard.style.opacity = '1.0')
playerVsAIButton.addEventListener('click', () => new GameBoardController(gameBoardView, new PlayerAiController(PLAYER_RED, focus, gameBoardView), new MinMaxAiPlayerController(PLAYER_GREEN, focus, gameBoardView)))

AIVsAIButton.addEventListener('click', () => gameBoard.style.visibility = 'visible')
AIVsAIButton.addEventListener('click', runAiVsAiGame)

const randomPlayerChoose = document.querySelector('#random') as HTMLDivElement
const minMaxPlayerChoose = document.querySelector('#minMax') as HTMLDivElement

function runAiVsAiGame(evt: MouseEvent)
{
    gameBoard.style.visibility = 'visible'
    gameBoard.style.opacity = '1.0'

    let controller: IGameBoardController

    randomPlayerChoose.style.visibility = 'visible'
    minMaxPlayerChoose.style.visibility = 'visible'

    randomPlayerChoose.addEventListener('click', e => controller = new GameBoardController(gameBoardView, new RandomPlayer(PLAYER_RED, focus, gameBoardView), new RandomPlayer(PLAYER_GREEN, focus, gameBoardView)))
    randomPlayerChoose.addEventListener('click', e => setTimeout(() => controller.start(), 1000))
    minMaxPlayerChoose.addEventListener('click', e => controller = new GameBoardController(gameBoardView, new MinMaxAiPlayerController(PLAYER_RED, focus, gameBoardView), new MinMaxAiPlayerController(PLAYER_GREEN, focus, gameBoardView)))
    minMaxPlayerChoose.addEventListener('click', e => setTimeout(() => controller.start(), 1000))
}
