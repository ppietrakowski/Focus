

import { AiController } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { PLAYER_RED } from './Game'
import { IFocus, Move } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
import { getAvailableMoves } from './LegalMovesFactory'
import { IPlayer } from './Player'


export class AlphaBetaPlayerController extends AiController {
    bestMove: Move

    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView) {
        super(aiOwnedPlayer, _game, _gameBoard)
    }

    depth = 3

    move(): Promise<boolean> {
        this.alphaBeta(this._gameBoard.gameBoard, this.depth, this.ownedPlayer)

        return super.move()
    }

    private alphaBeta(board: IGameBoard, depth: number, player: IPlayer, alpha = -Infinity, beta = Infinity): number {

        if (this.hasReachedEndConditions(board, depth)) {
            return this.calculateOnEndConditions(board, player)
        }

        const moves = getAvailableMoves(board, this.ownedPlayer)

        if ((moves.length === 0))
            return evaluateMove(board, player, this._game)

        if (player === this._game.currentPlayer) {
            let evaluation = -Infinity

            for (let i = 0; i < moves.length; i++) {
                player = this._game.getNextPlayer(player)
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
                player = this._game.getNextPlayer(player)

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
