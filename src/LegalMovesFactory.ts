import { Direction, DirectionEast, DirectionNorth, DirectionSouth, DirectionWest, FieldState, IField } from './IField'
import { Move } from './IFocus'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { AiMove } from './MinMaxAiPlayerController'
import { IPlayer } from './Player'

function getOffsetBasedOnDirection(field: IField, direction: { x: number, y: number }, howManyFieldWantMove: number)
{
    let mult = howManyFieldWantMove

    if (howManyFieldWantMove < 1)
    {
        mult = 1
    }

    if (field.height < howManyFieldWantMove)
    {
        mult = field.height
    }

    return { x: direction.x * mult, y: direction.y * mult }
}

function isMoveLegal(board: IGameBoard, x: number, y: number, direction: Direction, moveCount: number): boolean
{
    const field = board.getFieldAt(x, y)

    const offset = getOffsetBasedOnDirection(field, direction, moveCount)

    try
    {
        const fieldFromOffset = board.getFieldAt(x + offset.x, y + offset.y)
        return fieldFromOffset.isPlayable
    }
    catch (e)
    {
        return false
    }
}

function getMovesFromDirection(board: IGameBoard, field: IField, x: number, y: number, direction: Direction)
{
    const moves: Move[] = []
    for (let moveCount = 1; moveCount <= field.height; moveCount++)
    {
        const isLegalMove = isMoveLegal(board, x, y, direction, moveCount)
        if (isLegalMove)
        {
            moves.push({ direction: direction, x: x, y: y, moveCount: moveCount })
        }
    }
    return moves
}

export function getLegalMovesFromField(board: IGameBoard, x: number, y: number): Move[]
{
    const field = board.getFieldAt(x, y)
    let moves: Move[] = []

    // accumulate all moves in all directions
    moves = moves.concat(getMovesFromDirection(board, field, x, y, DirectionNorth))
    moves = moves.concat(getMovesFromDirection(board, field, x, y, DirectionEast))
    moves = moves.concat(getMovesFromDirection(board, field, x, y, DirectionWest))
    moves = moves.concat(getMovesFromDirection(board, field, x, y, DirectionSouth))

    return moves
}

export function getAvailableMoves(board: IGameBoard, player: IPlayer)
{
    let moves: Move[] = []

    const yourFields: IField[] = []
    const enemyFields: IField[] = []

    board.each(v =>
    {
        if (player.doesOwnThisField(v))
            yourFields.push(v)
        else
            enemyFields.push(v)
    })

    moves = yourFields.flatMap(v => getLegalMovesFromField(board, v.x, v.y))

    const aiMoves: AiMove[] = moves.map(move =>
    {
        const fieldFrom = board.getFieldAt(move.x, move.y)
        const fieldTo = board.getFieldAt(move.x + move.direction.x * move.moveCount, move.y + move.direction.y * move.moveCount)

        const gameBoardAfterMove = board.getBoardAfterMove(fieldFrom, fieldTo, player)

        return { gameBoardAfterMove: gameBoardAfterMove.gameBoard, move, shouldPlaceSomething: false, x: 0, y: 0, greenCount: gameBoardAfterMove.greenCount, redCount: gameBoardAfterMove.redCount } as AiMove
    })

    const afterPlaceMoves: AfterPlaceMove[] = []

    enemyFields.forEach(v =>
    {
        const afterPlaceMove = board.getBoardAfterPlace(v.x, v.y, player)

        if (player.state === FieldState.Green && afterPlaceMove.greenCount > 0)
            aiMoves.push({ shouldPlaceSomething: true, x: v.x, y: v.y, gameBoardAfterMove: afterPlaceMove.gameBoard, redCount: afterPlaceMove.redCount, greenCount: afterPlaceMove.greenCount })
        else if (player.state === FieldState.Red && afterPlaceMove.redCount > 0)
            aiMoves.push({ shouldPlaceSomething: true, x: v.x, y: v.y, gameBoardAfterMove: afterPlaceMove.gameBoard, redCount: afterPlaceMove.redCount, greenCount: afterPlaceMove.greenCount })

        afterPlaceMoves[aiMoves.length - 1] = afterPlaceMove
    })


    return { aiMoves, afterPlaceMoves }
}