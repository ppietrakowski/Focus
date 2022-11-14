import { AiController } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { GameBoard } from './GameBoard'
import { randomBoolean } from './GameUtils'
import { IField } from './IField'
import { IFocus, Move } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
import { getLegalMovesFromField } from './LegalMovesFactory'
import { IPlayer } from './Player'


interface AiMove
{
    move?: Move
    gameBoardAfterSuchThing: IGameBoard
    shouldPlaceSomething?: boolean
    x?: number
    y?: number
}

interface BestMove
{
    bestMove?: Move
    value: number
    shouldPlaceSomething?: boolean
    x?: number
    y?: number
}

export class MinMaxAiPlayerController extends AiController
{
    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView)
    {
        super(aiOwnedPlayer, _game, _gameBoard)
    }

    move(): void
    {
        const bestMove = this.minMax(this._gameBoard.gameBoard, 2, true) as BestMove

        if (bestMove.shouldPlaceSomething)
        {
            console.log(`${bestMove.x}, ${bestMove.y}`)
            this._game.placeField(bestMove.x, bestMove.y, this.ownedPlayer)
        }
        else
        {
            this._game.moveToField(bestMove.bestMove.x, bestMove.bestMove.y, bestMove.bestMove.direction, bestMove.bestMove.moveCount)
        }

    }

    onPlaceStateStarted(): void
    {
        const { x, y } = this.getRandomFieldPosition(f => f.isPlayable)

        this._game.placeField(x, y, this.ownedPlayer)
    }

    private minMax(board: IGameBoard, depth: number, isMaximizingPlayer: boolean): { value: number } | BestMove
    {
        if (depth === 0 || board.countPlayersFields(this._game.getNextPlayer(this.ownedPlayer)) === 0)
            return evaluateMove(board, this.ownedPlayer, this._game)

        if (isMaximizingPlayer)
        {
            let maxEval = -Infinity

            const moves = this.getAvailableMoves(board)
            let bestMove = moves[0].move
            let x = 0
            let y = 0
            let shouldPlaceSomething = false

            for (let i = 0; i < moves.length; i++)
            {
                const current = this.minMax(moves[i].gameBoardAfterSuchThing, depth - 1, false)
                if (current.value > maxEval)
                {
                    maxEval = current.value
                    bestMove = moves[i].move
                    x = moves[i].x
                    y = moves[i].y
                    shouldPlaceSomething = moves[i].shouldPlaceSomething
                }
            }

            return { bestMove, value: maxEval, x, y, shouldPlaceSomething }
        } else
        {
            let minEval = Infinity

            const moves = this.getAvailableMoves(board)
            let bestMove = moves[0].move
            let x = 0
            let y = 0
            let shouldPlaceSomething = false

            for (let i = 0; i < moves.length; i++)
            {
                const current = this.minMax(moves[i].gameBoardAfterSuchThing, depth - 1, true)

                if (current.value < minEval)
                {
                    minEval = current.value
                    bestMove = moves[i].move
                    x = moves[i].x
                    y = moves[i].y
                    shouldPlaceSomething = moves[i].shouldPlaceSomething
                }
            }

            return { bestMove, value: minEval, x, y, shouldPlaceSomething }
        }
    }

    private getAvailableMoves(board: IGameBoard): AiMove[]
    {
        let moves: Move[] = []

        const yourFields: IField[] = []
        const enemyFields: IField[] = []

        board.each(v =>
        {
            if (this.ownedPlayer.doesOwnThisField(v))
                yourFields.push(v)
            else
                enemyFields.push(v)
        })

        moves = yourFields.flatMap(v => getLegalMovesFromField(board, v.x, v.y))

        let aiMoves: AiMove[] = moves.map(move =>
        {

            const fieldFrom = board.getFieldAt(move.x, move.y)
            const fieldTo = board.getFieldAt(move.x + move.direction.x * move.moveCount, move.y + move.direction.y * move.moveCount)

            const gameBoardAfterSuchThing = board.getBoardAfterMove(fieldFrom, fieldTo)

            return { gameBoardAfterSuchThing, move, shouldPlaceSomething: false, x: 0, y: 0 }
        })

        if (this.ownedPlayer.pooledPawns > 0)
        {
            aiMoves = aiMoves.concat(enemyFields.map(v =>
            {
                const gameBoard = board.getBoardAfterPlace(v.x, v.y, this.ownedPlayer)

                return { shouldPlaceSomething: true, x: v.x, y: v.y, gameBoardAfterSuchThing: gameBoard }
            }))
        }

        aiMoves.sort((a, b) => evaluateMove(a.gameBoardAfterSuchThing, this.ownedPlayer, this._game).value - evaluateMove(b.gameBoardAfterSuchThing, this.ownedPlayer, this._game).value)

        return aiMoves
    }
}