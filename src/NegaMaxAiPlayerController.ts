
import { AiController } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { IFocus, Move } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
import { getAvailableMoves } from './LegalMovesFactory'
import { IPlayer } from './Player'


export class NegaMaxPlayer extends AiController {
    bestMove: Move

    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView) {
        super(aiOwnedPlayer, _game, _gameBoard)
    }

    once = true

    depth = 3

    move(): Promise<boolean> {
        console.log('negamax')
        this.negamax(this._gameBoard.gameBoard, this.depth, this.ownedPlayer)

        return super.move()
    }

    private negamax(board: IGameBoard, depth: number, player: IPlayer, sign = 1): number {
        if (this.hasReachedEndConditions(board, depth)) {
            return this.calculateOnEndConditions(board, player)
        }

        const moves = getAvailableMoves(board, player)

        if ((moves.length === 0))
            return evaluateMove(board, player, this._game)

        let evaluation = -Infinity

        for (let i = 0; i < moves.length; i++) {
            let current = this.negamax(moves[i].gameBoardAfterMove, depth - 1, player, -sign)
            current *= -1

            if (current > evaluation) {
                if (depth === this.depth) {
                    this.bestMove = moves[i].move
                }

                evaluation = current
            }
        }

        return evaluation
    }
}