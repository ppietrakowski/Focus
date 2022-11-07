import { AiController } from './AiController'
import { Direction, IField } from './IField'
import { IFocus, Move } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
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

        if (bestMove)
            this._game.moveToField(bestMove.fromX, bestMove.fromY, bestMove.direction, bestMove.moveCount)
    }

    onPlaceStateStarted(): void
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    {
    }

    private minMax(board: IGameBoard, depth: number, isMaximizingPlayer: boolean, move?: Move)
    {
        if (depth === 0 || this._gameBoard.gameBoard.countPlayersFields(this._game.getNextPlayer(this.ownedPlayer)) === 0)
            return this.evaluateMove(board)

        if (isMaximizingPlayer)
        {
            let maxEval = -Infinity

            const moves = this.getAvailableMoves(board)
            let bestMove = moves[0].move

            for (const move of moves)
            {
                const current = this.minMax(move.gameBoardAfterSuchThing, depth - 1, false, move.move)
                if (current.value > maxEval)
                {
                    maxEval = current.value
                    bestMove = move.move
                }
            }

            return { bestMove, value: maxEval }
        } else
        {
            let minEval = Infinity

            const moves = this.getAvailableMoves(board)
            let bestMove = moves[0].move

            for (const move of moves)
            {
                const current = this.minMax(move.gameBoardAfterSuchThing, depth - 1, true, move.move)

                if (current.value < minEval)
                {
                    minEval = current.value
                    bestMove = move.move
                }
            }

            return { bestMove, value: minEval }
        }
    }

    private evaluateMove(board: IGameBoard)
    {
        const controlledByYou = board.countPlayersFields(this.ownedPlayer)
        
        const controlledByEnemy = board.countPlayersFields(this._game.getNextPlayer(this.ownedPlayer))
        
        let ratio = controlledByYou / controlledByEnemy
        
        if (Number.isNaN(ratio))
            ratio = 0

        const controlledInReserveByYou = this.ownedPlayer.pooledPawns
        const controlledInReserveByEnemy = this._game.getNextPlayer(this.ownedPlayer).pooledPawns

        let ratioInReserve = controlledInReserveByYou / controlledInReserveByEnemy
        if (controlledInReserveByYou === 0 || controlledInReserveByEnemy === 0)
            ratioInReserve = 0

        return { value: 4 * ratio + 3 * ratioInReserve }
    }

    private getAvailableMoves(board: IGameBoard): AiMove[]
    {
        let moves: Move[] = []

        const yourFields: IField[] = []

        this._gameBoard.gameBoard.each(v =>
        {
            if (this.ownedPlayer.doesOwnThisField(v))
                yourFields.push(v)
        })

        moves = yourFields.flatMap(v => this._game.getLegalMovesFromField(v.x, v.y))

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