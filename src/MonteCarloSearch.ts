import { AiController } from './AiController'
import { Move } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { getAvailableMoves, IAvailableMoves } from './LegalMovesFactory'
import { IPlayer } from './Player'

export class MonteCarloSearch extends AiController {


    simulationsCount = 3
    maxCooldown = 18

    supplyBestMove(): Move {
        return this.monteCarloSearch()
    }

    private monteCarloSearch(): Move {
        let bestProbability = -1
        const moves = getAvailableMoves(this.gameBoard, this.ownedPlayer).map(m => m.move)
        let player = this.ownedPlayer
        let bestMove: Move = null

        for (const move of moves) {
            let r = 0
            let numberOfSimulations = 0
            const startTime = Date.now()
            const maxCooldown = startTime + (this.maxCooldown / moves.length)

            while (Date.now() < maxCooldown) {
                numberOfSimulations++
                const board = this.gameBoard.getBoardAfterSpecifiedMove(move, player)
                player = this.game.getNextPlayer(player)

                let tempBoard = board

                while (!this.hasMeetFinalCondition(tempBoard, player)) {
                    const availableMoves = getAvailableMoves(tempBoard, player).map(m => m.move)
                    if (tempBoard.countPlayersFields(player) === 0 && this.hasPlayerPool(tempBoard, player)) {
                        const allPlacingMoves = availableMoves.filter(m => !!m.shouldPlaceSomething)
                        const randomIndex = Math.floor(Math.random() * allPlacingMoves.length)
                        const randomMove = allPlacingMoves[randomIndex]
                        tempBoard = tempBoard.getBoardAfterSpecifiedMove(randomMove, player)
                        player = this.game.getNextPlayer(player)
                        continue
                    }

                    const randomIndex = Math.floor(Math.random() * availableMoves.length)
                    const randomMove = availableMoves[randomIndex]
                    tempBoard = tempBoard.getBoardAfterSpecifiedMove(randomMove, player)
                    player = this.game.getNextPlayer(player)
                }

                if (tempBoard.countPlayersFields(this.game.getNextPlayer(this.ownedPlayer)) == 0) {
                    r++
                }
            }

            if (r / numberOfSimulations > bestProbability) {
                bestMove = move
                bestProbability = r / numberOfSimulations
            }
        }

        if (moves[0] === bestMove) {
            console.log('choosen first move')
        }

        return bestMove
    }

    hasMeetFinalCondition(board: IGameBoard, player: IPlayer) {
        return board.countPlayersFields(player) <= 0 && !this.hasPlayerPool(board, player)
    }

    hasPlayerPool(board: IGameBoard, player: IPlayer): boolean {
        return (player.isRed && board.redPlayerPawnCount > 0)
            || (player.isGreen && board.greenPlayerPawnCount > 0)
    }
}