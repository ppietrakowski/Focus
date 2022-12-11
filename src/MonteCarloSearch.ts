import { AiController } from './AiController'
import { Move } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { getAvailableMoves, IAvailableMoves } from './LegalMovesFactory'
import { AiMove } from './MinMaxAiPlayerController'
import { IPlayer } from './Player'

export class MonteCarloSearch extends AiController {
    private r = 0
    private bestProbability = -1
    private currentPlayer: IPlayer
    private firstMoveBoard: IGameBoard
    private tempBoard: IGameBoard
    private moves: AiMove[]
    private maxSimulationCount = 3
    private probability = 0

    supplyBestMove(): Move {
        return this.monteCarloSearch()
    }

    private monteCarloSearch(): Move {
        this.bestProbability = -1
        this.moves = getAvailableMoves(this.gameBoard, this.ownedPlayer)
        this.currentPlayer = this.ownedPlayer
        this.bestMove = null

        for (const move of this.moves) {
            this.simulateMove(move)
        }

        return this.bestMove
    }

    private simulateMove(move: AiMove) {
        this.r = 0

        for (let i = 0; i < this.maxSimulationCount; i++) {
            this.simulateNextMove(move)
        }

        this.probability = this.r / this.maxSimulationCount

        if (this.isBetterMoveThanPrevious()) {
            this.updateToNewMove(move)
        }
    }

    private isBetterMoveThanPrevious() {
        return this.probability > this.bestProbability
    }

    private updateToNewMove(move: AiMove) {
        this.bestMove = move.move
        this.bestProbability = this.probability
    }

    private simulateNextMove(move: AiMove) {
        this.firstMoveBoard = move.gameBoardAfterMove
        this.currentPlayer = this.game.getNextPlayer(this.currentPlayer)

        this.tempBoard = this.firstMoveBoard

        while (!this.tempBoard.checkForVictoryCondition()) {
            this.simulateUntilWin()
        }

        if (this.tempBoard.winner === this.ownedPlayer) {
            this.r++
        }
    }

    simulateUntilWin() {
        const availableMoves = getAvailableMoves(this.tempBoard, this.currentPlayer)
        const randomIndex = Math.floor(Math.random() * availableMoves.length)
        const randomMove = availableMoves[randomIndex]
        this.tempBoard = randomMove.gameBoardAfterMove

        this.currentPlayer = this.game.getNextPlayer(this.currentPlayer)
    }

    hasMeetFinalCondition() {
        return (this.tempBoard.isTerminalForPlayer(this.currentPlayer) || this.tempBoard.isTerminalForPlayer(this.game.getNextPlayer(this.currentPlayer)))
    }

    shouldPlaceSomething(player: IPlayer) {
        return this.tempBoard.countPlayersFields(player) === 0 && this.hasPlayerPool(this.tempBoard, player)
    }

    hasPlayerPool(board: IGameBoard, player: IPlayer): boolean {
        return (player.isRed && board.redPlayerPawnCount > 0)
            || (player.isGreen && board.greenPlayerPawnCount > 0)
    }
}