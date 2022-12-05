
import { AiController } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { IField } from './IField'
import { IFocus, Move } from './IFocus'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
import { getAvailableMoves } from './LegalMovesFactory'
import { comparatorPlaceMoveType } from './MinMaxAiPlayerController'
import { IPlayer } from './Player'

let ownedPlayer: IPlayer = null
let _game: IFocus = null

function availablePlaceMovesComparator(a: comparatorPlaceMoveType, b: comparatorPlaceMoveType) {
    return evaluateMove(a.afterPlaceMove.gameBoard, ownedPlayer, _game) - evaluateMove(b.afterPlaceMove.gameBoard, ownedPlayer, _game)
}

export class AbNegaMaxPlayer extends AiController {
    bestMove: Move
    alpha = -Infinity
    beta = Infinity

    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView) {
        super(aiOwnedPlayer, _game, _gameBoard)
    }

    once = true

    depth = 4

    move(): Promise<boolean> {
        this.alpha = -Infinity
        this.beta = Infinity
        this.abNegaMax(this._gameBoard.gameBoard, this.depth, this.ownedPlayer, this.alpha, this.beta)

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

        ownedPlayer = this.ownedPlayer
        _game = this._game

        availablePlaceMoves.sort(availablePlaceMovesComparator)

        const best = availablePlaceMoves[0]


        this._game.placeField(best.x, best.y, this.ownedPlayer)
    }

    private abNegaMax(board: IGameBoard, depth: number, player: IPlayer, alpha: number, beta: number, sign = 1): number {
        if (board.countPlayersFields(this._game.getNextPlayer(this.ownedPlayer)) === 0) {
            // owned player wins
            const result = sign * evaluateMove(board, player, this._game)
            return result
        }

        if (board.countPlayersFields(this.ownedPlayer) === 0) {
            // owned player wins
            const result = sign * -evaluateMove(board, player, this._game)
            return result
        }
        
        if (depth === 0)
            return evaluateMove(board, player, this._game)

        const movesAndCount = getAvailableMoves(board, player)

        if ((movesAndCount.afterPlaceMoves.length === 0 && movesAndCount.aiMoves.length === 0))
            return evaluateMove(board, player, this._game)

        const moves = movesAndCount.aiMoves
        if (moves.length < 1)
            return null

        let evaluation = -Infinity

        for (let i = 0; i < moves.length; i++) {
            let current = this.abNegaMax(moves[i].gameBoardAfterMove, depth - 1, player, -beta, -alpha, -sign)
            current *= -1

            if (current > evaluation) {
                if (depth === this.depth) {
                    this.bestMove = moves[i].move
                }

                evaluation = current
            }

            alpha = Math.max(alpha, evaluation)
            if (alpha >= beta) {
                break
            }
        }

        return evaluation
    }
}