import { Focus, PLAYER_GREEN, PLAYER_RED } from './Game'
import { GameBoardView } from './GameBoardView'
import { EventAddedToPool, EventEnemyHasPool, EventNewTurn, EventVictory, IFocus } from './IFocus'
import { GameBoardController } from './GameBoardController'
import { IPlayer } from './Player'
import { getPlayerName } from './AiController'
import { initializeTiming, runTimeout } from './Timing'
import { getPlayerController } from './getPlayerController'
import { IAiController } from './IGameBoardController'


export const focus = new Focus()

export const gameBoardView = new GameBoardView(focus)

class LoggingListener {
    useLogging = true

    constructor(focus: IFocus) {
        focus.events.on(EventAddedToPool, this.onAddedToPool, this)
        focus.events.on(EventVictory, this.onVictory, this)
        focus.events.on(EventEnemyHasPool, this.onEnemyHasPool, this)
        focus.events.on(EventNewTurn, this.onNextTurnBegin, this)
    }

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

const logging = new LoggingListener(focus)
logging.useLogging = true

hideGameBoard()

const playerRedSelect = document.getElementById('player1') as HTMLSelectElement
const playerGreenSelect = document.getElementById('player2') as HTMLSelectElement

const beginPlay = document.getElementById('BeginPlayButton') as HTMLButtonElement

beginPlay.addEventListener('click', () => {
    const gameBoard = document.querySelector('.gameBoard') as HTMLDivElement

    let redController: IAiController
    let greenController: IAiController

    try {
        redController = getPlayerController(playerRedSelect.options[playerRedSelect.selectedIndex].value, PLAYER_RED)
        greenController = getPlayerController(playerGreenSelect.options[playerGreenSelect.selectedIndex].value, PLAYER_GREEN)
    } catch (e) {
        alert(e)
        return
    }

    gameBoard.style.visibility = 'visible'
    gameBoard.style.opacity = '1.0'

    const parent = beginPlay.parentElement as HTMLSelectElement

    parent.disabled = true

    const controller = new GameBoardController(gameBoardView, redController, greenController)
    
    focus.events.on(EventVictory, p => {
        alert(`${getPlayerName(p)} won`)
        document.location.reload()
    })

    initializeTiming()

    runTimeout(1).then(() => controller.start())
})

function hideGameBoard() {
    const gameBoard = document.querySelector('.gameBoard') as HTMLDivElement
    gameBoard.style.visibility = 'hidden'
    gameBoard.style.opacity = '0'
}

