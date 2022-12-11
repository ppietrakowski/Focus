import { AiController } from './AiController'
import { Move } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { getAvailableMoves, IAvailableMoves } from './LegalMovesFactory'
import { IPlayer } from './Player'

export class MonteCarloSearch extends AiController {
    private r = 0
    private bestProbability = -1
    private currentPlayer: IPlayer
    private firstMoveBoard: IGameBoard
    private tempBoard: IGameBoard
    private moves: Move[]
    private maxSimulationCount = 3
    private probability = 0

    supplyBestMove(): Move {
        return this.monteCarloSearch()
    }

    private monteCarloSearch(): Move {
        this.bestProbability = -1
        this.moves = getAvailableMoves(this.gameBoard, this.ownedPlayer).map(m => m.move)
        this.currentPlayer = this.ownedPlayer
        this.bestMove = null

        for (const move of this.moves) {
            this.simulateMove(move)
        }

        console.log(this.bestProbability)

        return this.bestMove
    }

    private simulateMove(move: Move) {
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

    private updateToNewMove(move: Move) {
        this.bestMove = move
        this.bestProbability = this.probability
    }

    private simulateNextMove(move: Move) {
        this.firstMoveBoard = this.gameBoard.getBoardAfterSpecifiedMove(move, this.currentPlayer)
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
        const availableMoves = getAvailableMoves(this.tempBoard, this.currentPlayer).map(m => m.move)
        if (this.shouldPlaceSomething(this.currentPlayer)) {
            const allPlacingMoves = availableMoves.filter(m => !!m.shouldPlaceSomething)
            const randomIndex = Math.floor(Math.random() * allPlacingMoves.length)
            const randomMove = allPlacingMoves[randomIndex]
            this.tempBoard = this.tempBoard.getBoardAfterPlace(randomMove.x, randomMove.y, this.currentPlayer).gameBoard
            this.currentPlayer = this.game.getNextPlayer(this.currentPlayer)
            return
        }

        const randomIndex = Math.floor(Math.random() * availableMoves.length)
        const randomMove = availableMoves[randomIndex]
        if (randomMove.direction) {
            this.tempBoard = this.tempBoard.getBoardAfterSpecifiedMove(randomMove, this.currentPlayer)
        } else {
            this.tempBoard = this.tempBoard.getBoardAfterPlace(randomMove.x, randomMove.y, this.currentPlayer).gameBoard
        }

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