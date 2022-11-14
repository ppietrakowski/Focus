import { Direction, DirectionEast, DirectionNorth, DirectionSouth, DirectionWest, IField } from './IField'
import { Move } from './IFocus'
import { IGameBoard } from './IGameBoard'

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
            moves.push({direction: direction, fromX: x, fromY: y, moveCount: moveCount})
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

