import { Focus, PLAYER_GREEN, PLAYER_RED } from './Game'
import { GameBoardView } from './GameBoardView'
import { EventAddedToPool, EventEnemyHasPool, EventNewTurn, EventVictory } from './IFocus'
import { GameBoardController } from './GameBoardController'
import { IPlayer } from './Player'
import PlayerAiController from './PlayerAiController'
import { RandomPlayer } from './RandomPlayer'
import { MinMaxAiPlayerController } from './MinMaxAiPlayerController'
import { IAiController } from './IGameBoardController'
import { getPlayerName } from './AiController'
import { NegaMaxPlayer } from './NegaMaxAiPlayerController'
import { initializeTiming, runTimeout } from './Timing'
import { AlphaBetaPlayerController } from './AlphaBetaPlayerController'


const focus = new Focus()

const gameBoardView = new GameBoardView(focus)

class LoggingListener {
    useLogging = true

    onAddedToPool(toWhichPlayer: IPlayer): void {
        if (this.useLogging)
            console.log('added to pool ', getPlayerName(toWhichPlayer))
    }

    onEnemyHasPool(): void {
        if (this.useLogging)
            console.log('Should place pawn')
    }
    onVictory(victoriousPlayer: IPlayer): void {
        if (this.useLogging)
            console.log(`${getPlayerName(victoriousPlayer)} won`)
        console.log(focus.gameBoard)
    }
    onNextTurnBegin(): void {
        if (this.useLogging)
            console.log('Next turn')
    }
}

const logging = new LoggingListener()
logging.useLogging = true

focus.events.on(EventAddedToPool, logging.onAddedToPool, logging)
focus.events.on(EventVictory, logging.onVictory, logging)
focus.events.on(EventEnemyHasPool, logging.onEnemyHasPool, logging)
focus.events.on(EventNewTurn, logging.onNextTurnBegin, logging)

const gameBoard = document.querySelector('.gameBoard') as HTMLDivElement
gameBoard.style.visibility = 'hidden'
gameBoard.style.opacity = '0'

const player1Select = document.getElementById('player1') as HTMLSelectElement
const player2Select = document.getElementById('player2') as HTMLSelectElement

const beginPlay = document.getElementById('BeginPlayButton') as HTMLButtonElement

function getPlayer(name: string, player: IPlayer): IAiController {

    if (name === 'human') {
        return new PlayerAiController(player, focus, gameBoardView)
    }

    if (name === 'random') {
        return new RandomPlayer(player, focus, gameBoardView)
    }

    if (name === 'minimax') {
        return new MinMaxAiPlayerController(player, focus, gameBoardView)
    }

    if (name === 'negamax') {
        return new NegaMaxPlayer(player, focus, gameBoardView)
    }

    if (name === 'abminimax') {
        return new AlphaBetaPlayerController(player, focus, gameBoardView)
    }

    throw new Error('Selected unavailable player controller')
}

beginPlay.addEventListener('click', () => {
    let p1
    let p2

    try {
        p1 = getPlayer(player1Select.options[player1Select.selectedIndex].value, PLAYER_RED)
        p2 = getPlayer(player2Select.options[player2Select.selectedIndex].value, PLAYER_GREEN)
    } catch (e) {
        alert(e)
        return
    }

    gameBoard.style.visibility = 'visible'
    gameBoard.style.opacity = '1.0'

    const parent = beginPlay.parentElement as HTMLSelectElement
    
    parent.disabled = true

    const controller = new GameBoardController(gameBoardView, p1, p2)
    focus.events.on(EventVictory, p => {
        alert(`${getPlayerName(p)} won`)
        document.location.reload()
    }
    )

    initializeTiming()

    runTimeout(1).then(() => controller.start())
})
