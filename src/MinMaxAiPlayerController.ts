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

export class MinMaxAiPlayerController extends AiController
{
    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView)
    {
        super(aiOwnedPlayer, _game, _gameBoard)
        const availableMoves = this.getAvailableMoves(_gameBoard.gameBoard)
        console.warn(availableMoves)
    }

    move(): void
    {
        this.minMax(this._gameBoard.gameBoard, 3, true)
    }

    onPlaceStateStarted(): void
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    {
    }

    private minMax(board: IGameBoard, depth: number, isMaximizingPlayer: boolean)
    {
        if (depth === 0 || this._game.hasEnded)
            return this.evaluateMove(board)

        if (isMaximizingPlayer)
        {
            let maxEval = -Infinity

            for (let i = 0; i < board.length(); i++)
            {
                const evaluation = this.minMax(board, depth - 1, false)
                maxEval = Math.max(evaluation, maxEval)
            }

            return maxEval
        } else {
            let minEval = -Infinity

            for (let i = 0; i < board.length(); i++)
            {
                const evaluation = this.minMax(board, depth - 1, true)
                minEval = Math.min(evaluation, minEval)
            }

            return minEval
        }
    }

    private evaluateMove(board: IGameBoard)
    {
        const controlledByYou = board.countPlayersFields(this.ownedPlayer)
        const controlledByEnemy = board.countPlayersFields(this._game.getNextPlayer(this.ownedPlayer))

        const ratio = controlledByYou / controlledByEnemy

        const controlledInReserveByYou = this.ownedPlayer.pooledPawns
        const controlledInReserveByEnemy = this._game.getNextPlayer(this.ownedPlayer).pooledPawns

        const ratioInReserve = controlledInReserveByYou / controlledInReserveByEnemy
        
        return Math.floor(4 * ratio + 3 * ratioInReserve)
    }

    private getAvailableMoves(board: IGameBoard): AiMove[]
    {
        let moves: Move[] = []

        const yourFields: IField[] = []

        this._gameBoard.gameBoard.each(v => {
            if (this.ownedPlayer.doesOwnThisField(v))
                yourFields.push(v)
        })

        moves = yourFields.flatMap(v => this._game.getLegalMovesFromField(v.x, v.y))

        const aiMoves: AiMove[]  = moves.map(move => {

            const fieldFrom = board.getFieldAt(move.fromX, move.fromY)
            const fieldTo = board.getFieldAt(move.fromX + move.direction.x * move.moveCount, move.fromY + move.direction.y * move.moveCount)

            const gameBoardAfterSuchThing = board.getBoardAfterMove(fieldFrom, fieldTo)


            return {gameBoardAfterSuchThing, move}
        })

        return aiMoves
    }
}