

import { AiController } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { IFocus, Move } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
import { getAvailableMoves } from './LegalMovesFactory'
import { IPlayer } from './Player'


export class AlphaBetaPlayerController extends AiController {
    
    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView) {
        super(aiOwnedPlayer, _game, _gameBoard)
    }

    depth = 3

    supplyBestMove(): Move {
        this.alphaBeta(this.gameBoardView.gameBoard, this.depth, this.ownedPlayer)
        return this.bestMove
    }
    
    private alphaBeta(board: IGameBoard, depth: number, player: IPlayer, alpha = -Infinity, beta = Infinity): number {

        if (this.hasReachedEndConditions(board, depth)) {
            return this.calculateOnEndConditions(board, player)
        }

        const moves = getAvailableMoves(board, this.ownedPlayer)

        if ((moves.length === 0))
            return evaluateMove(board, player, this.game)

        if (player === this.game.currentPlayingColor) {
            let evaluation = -Infinity

            for (let i = 0; i < moves.length; i++) {
                player = this.game.getNextPlayer(player)
                const current = this.alphaBeta(moves[i].gameBoardAfterMove, depth - 1, player)

                if (current > evaluation) {
                    if (depth === this.depth) {
                        this.bestMove = moves[i].move
                    }
                    evaluation = current
                }

                alpha = Math.max(alpha, current)

                if (alpha >= beta) {
                    break
                }
            }

            return evaluation
        } else {

            let evaluation = Infinity

            for (let i = 0; i < moves.length; i++) {
                player = this.game.getNextPlayer(player)

                const current = this.alphaBeta(moves[i].gameBoardAfterMove, depth - 1, player)

                if (current < evaluation) {
                    if (depth === this.depth) {
                        this.bestMove = moves[i].move
                    }
                    evaluation = current
                }

                beta = Math.min(beta, current)

                if (alpha >= beta) {
                    break
                }
            }

            return evaluation
        }
    }
}
