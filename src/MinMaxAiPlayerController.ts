import { AiController } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { randomBoolean } from './GameUtils'
import { IField } from './IField'
import { IFocus, Move } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
import { getLegalMovesFromField } from './LegalMovesFactory'
import { IPlayer } from './Player'


interface AiMove
{
    move: Move
    gameBoardAfterSuchThing: IGameBoard
}

interface BestMove
{
    bestMove: Move
    value: number
}

export class MinMaxAiPlayerController extends AiController
{
    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView)
    {
        super(aiOwnedPlayer, _game, _gameBoard)
    }

    move(): void
    {
        const { bestMove } = this.minMax(this._gameBoard.gameBoard, 3, true) as BestMove


        if (this.ownedPlayer.hasAnyPool && randomBoolean()) {
            this.onPlaceStateStarted()
            return
        }

        if (bestMove)
            this._game.moveToField(bestMove.fromX, bestMove.fromY, bestMove.direction, bestMove.moveCount)
    }

    onPlaceStateStarted(): void
    {
        const { x, y } = this.getRandomFieldPosition(f => f.isPlayable)

        this._game.placeField(x, y, this.ownedPlayer)
    }

    private minMax(board: IGameBoard, depth: number, isMaximizingPlayer: boolean)
    {
        if (depth === 0 || board.countPlayersFields(this._game.getNextPlayer(this.ownedPlayer)) === 0)
            return evaluateMove(board, this.ownedPlayer, this._game)

        if (isMaximizingPlayer)
        {
            let maxEval = -Infinity

            const moves = this.getAvailableMoves(board)
            let bestMove = moves[0].move

            for (let i = 0; i < moves.length; i++)
            {
                const current = this.minMax(moves[i].gameBoardAfterSuchThing, depth - 1, false)
                if (current.value > maxEval)
                {
                    maxEval = current.value
                    bestMove = moves[i].move
                }
            }

            return { bestMove, value: maxEval }
        } else
        {
            let minEval = Infinity

            const moves = this.getAvailableMoves(board)
            let bestMove = moves[0].move

            for (let i = 0; i < moves.length; i++)
            {
                const current = this.minMax(moves[i].gameBoardAfterSuchThing, depth - 1, true)

                if (current.value < minEval)
                {
                    minEval = current.value
                    bestMove = moves[i].move
                }
            }

            return { bestMove, value: minEval }
        }
    }

    private getAvailableMoves(board: IGameBoard): AiMove[]
    {
        let moves: Move[] = []

        const yourFields: IField[] = []

        board.each(v =>
        {
            if (this.ownedPlayer.doesOwnThisField(v))
                yourFields.push(v)
        })

        moves = yourFields.flatMap(v => getLegalMovesFromField(board, v.x, v.y))

        const aiMoves: AiMove[] = moves.map(move =>
        {

            const fieldFrom = board.getFieldAt(move.fromX, move.fromY)
            const fieldTo = board.getFieldAt(move.fromX + move.direction.x * move.moveCount, move.fromY + move.direction.y * move.moveCount)

            const gameBoardAfterSuchThing = board.getBoardAfterMove(fieldFrom, fieldTo)

            return { gameBoardAfterSuchThing, move }
        })

        return aiMoves
    }
}