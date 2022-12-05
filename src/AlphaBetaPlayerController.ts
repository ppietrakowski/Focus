

import { AiController } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { IField } from './IField'
import { IFocus, Move } from './IFocus'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
import { getAvailableMoves } from './LegalMovesFactory'
import { IPlayer } from './Player'


export class AlphaBetaPlayerController extends AiController {
    bestMove: Move

    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView) {
        super(aiOwnedPlayer, _game, _gameBoard)
    }

    depth = 4
    alpha = -Infinity
    beta = Infinity

    move(): Promise<boolean> {
        console.log('alpha-beta megamax')

        this.alpha = -Infinity
        this.beta = Infinity
        this.alphaBeta(this._gameBoard.gameBoard, this.depth, this.ownedPlayer)

        if (!this.bestMove && !this.bestMove.shouldPlaceSomething) {
            const v = getAvailableMoves(this._gameBoard.gameBoard, this.ownedPlayer)
            console.log(v)
            console.log(this.bestMove)
            console.log(this._game.gameBoard)
            return Promise.reject(!this.bestMove)
        }

        if (this.bestMove.shouldPlaceSomething)
            console.log(true)

        if (this.bestMove.shouldPlaceSomething) {
            console.log(`placed at ${this.bestMove.x}, ${this.bestMove.y}`)
            this._game.placeField(this.bestMove.x, this.bestMove.y, this.ownedPlayer)
            return Promise.resolve(true)
        }

        const pr = this._game.moveToField(this.bestMove.x,
            this.bestMove.y, this.bestMove.direction, this.bestMove.moveCount)

        return pr
    }


    onPlaceStateStarted(): void {
        const enemyFields: IField[] = []

        this._game.gameBoard.each(v => {
            if (!this.ownedPlayer.doesOwnThisField(v))
                enemyFields.push(v)
        })

        const availablePlaceMoves: { afterPlaceMove: AfterPlaceMove, x: number, y: number }[] = []

        enemyFields.forEach(v => {
            const afterPlaceMove = this._game.gameBoard.getBoardAfterPlace(v.x, v.y, this.ownedPlayer)
            availablePlaceMoves.push({ afterPlaceMove, x: v.x, y: v.y })
        })

        const best = availablePlaceMoves[0]


        this._game.placeField(best.x, best.y, this.ownedPlayer)
    }

    private alphaBeta(board: IGameBoard, depth: number, player: IPlayer): number {

        if (board.countPlayersFields(this._game.getNextPlayer(this.ownedPlayer)) === 0) {
            // owned player wins
            const result = evaluateMove(board, player, this._game)
            return result
        }

        if (board.countPlayersFields(this.ownedPlayer) === 0) {
            // owned player wins
            const result = -evaluateMove(board, player, this._game)
            return result
        }

        // omit the calculating moves
        if (depth === 0) {
            const result = evaluateMove(board, player, this._game)

            return result
        }

        const movesAndCount = getAvailableMoves(board, this.ownedPlayer)

        player = this._game.getNextPlayer(player)

        if ((movesAndCount.afterPlaceMoves.length === 0 && movesAndCount.aiMoves.length === 0))
            return evaluateMove(board, player, this._game)

        player = this._game.getNextPlayer(player)

        const moves = movesAndCount.aiMoves
        if (moves.length < 1) {
            return 0
        }

        if (player === this.ownedPlayer) {
            let evaluation = -Infinity

            for (let i = 0; i < moves.length; i++) {
                player = this._game.getNextPlayer(player)

                const current = this.alphaBeta(moves[i].gameBoardAfterMove, depth - 1, player)

                player = this._game.getNextPlayer(player)
                if (current > evaluation) {
                    if (depth === this.depth) {
                        this.bestMove = moves[i].move
                    }
                    evaluation = current
                }

                this.alpha = Math.max(this.alpha, current)

                if (this.alpha >= this.beta) {
                    break
                }
            }

            return evaluation
        } else {

            let evaluation = Infinity


            for (let i = 0; i < moves.length; i++) {
                player = this._game.getNextPlayer(player)

                const current = this.alphaBeta(moves[i].gameBoardAfterMove, depth - 1, player)

                player = this._game.getNextPlayer(player)
                if (current < evaluation) {
                    if (depth === this.depth) {
                        this.bestMove = moves[i].move
                    }
                    evaluation = current
                }

                this.beta = Math.min(this.beta, current)

                if (this.alpha >= this.beta) {
                    break
                }
            }

            return evaluation
        }
    }
}
