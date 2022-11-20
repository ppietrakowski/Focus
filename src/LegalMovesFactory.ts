import { evaluateMove } from './EvaluationFunction'
import { PLAYER_GREEN, PLAYER_RED } from './Game'
import { GameBoard } from './GameBoard'
import { Direction, DirectionEast, DirectionNorth, DirectionSouth, DirectionWest, FieldState, IField } from './IField'
import { Move } from './IFocus'
import { AfterPlaceMove, getAllFieldBelongingToPlayer, IGameBoard } from './IGameBoard'
import { AiMove } from './MinMaxAiPlayerController'
import { IPlayer } from './Player'

export function getOffsetBasedOnDirection(field: IField, direction: { x: number, y: number }, howManyFieldWantMove: number)
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

export function getNeighbours(board: IGameBoard, x: number, y: number, maxMove: number): IField[]
{
    const neighbours: IField[] = []

    for (let i = 1; i < maxMove; i++) 
    {
        if (y > maxMove)
            neighbours.push(board.getFieldAt(x, y + DirectionNorth.y * i))
        if (y < maxMove)
            neighbours.push(board.getFieldAt(x, y + DirectionSouth.y * i))

        if (x < maxMove)
            neighbours.push(board.getFieldAt(x + DirectionEast.x * i, y))

        if (x > maxMove)
            neighbours.push(board.getFieldAt(x + DirectionWest.x * i, y))
    }

    return neighbours
}

export function getMovesFromDirection(board: IGameBoard, field: IField, x: number, y: number, direction: Direction)
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

let _board: IGameBoard = null
let _player: IPlayer = null

function getLegalMoves(v: IField)
{
    return getLegalMovesFromField(_board, v.x, v.y)
}

function getAiMoves(move: Move)
{
    const fieldFrom = _board.getFieldAt(move.x, move.y)
    const fieldTo = _board.getFieldAt(move.x + move.direction.x * move.moveCount, move.y + move.direction.y * move.moveCount)

    // buggy one
    const gameBoardAfterMove: AfterPlaceMove = _board.getBoardAfterMove(fieldFrom, fieldTo, _player)

    return { gameBoardAfterMove: gameBoardAfterMove.gameBoard, move, x: 0, y: 0, greenCount: gameBoardAfterMove.greenCount, redCount: gameBoardAfterMove.redCount } as AiMove
}

let _aiMoves: AiMove[] = null
let _afterPlaceMoves: AfterPlaceMove[] = null


function getPlaceMoves(v: IField)
{
    const afterPlaceMove = _board.getBoardAfterPlace(v.x, v.y, _player)

    if (_player.state === FieldState.Green && afterPlaceMove.greenCount > 0)
        _aiMoves.push({ shouldPlaceSomething: true, x: v.x, y: v.y, gameBoardAfterMove: afterPlaceMove.gameBoard, redCount: afterPlaceMove.redCount, greenCount: afterPlaceMove.greenCount })
    else if (_player.state === FieldState.Red && afterPlaceMove.redCount > 0)
        _aiMoves.push({ shouldPlaceSomething: true, x: v.x, y: v.y, gameBoardAfterMove: afterPlaceMove.gameBoard, redCount: afterPlaceMove.redCount, greenCount: afterPlaceMove.greenCount })

    _afterPlaceMoves[_aiMoves.length - 1] = afterPlaceMove
}

export function getAvailableMoves(board: IGameBoard, player: IPlayer)
{
    let moves: Move[] = []
    _board = board
    _player = player

    const yourFields: IField[] = getAllFieldBelongingToPlayer(board, player)
    const enemyFields: IField[] = getAllFieldBelongingToPlayer(board, player === PLAYER_RED ? PLAYER_GREEN : PLAYER_RED)

    moves = yourFields.flatMap(getLegalMoves)

    const aiMoves: AiMove[] = moves.map(getAiMoves)
    _aiMoves = aiMoves

    const afterPlaceMoves: AfterPlaceMove[] = []
    _afterPlaceMoves = afterPlaceMoves

    enemyFields.forEach(getPlaceMoves)

    return { aiMoves, afterPlaceMoves }
}