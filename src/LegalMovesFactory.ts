import { PLAYER_GREEN, PLAYER_RED } from './Game'
import { Direction, DirectionEast, DirectionNorth, DirectionSouth, DirectionWest, FieldState, IField } from './IField'
import { Move } from './IFocus'
import { AfterPlaceMove, getAllFieldBelongingToPlayer, IGameBoard } from './IGameBoard'
import { AiMove } from './MinMaxAiPlayerController'
import { IPlayer } from './Player'

export function getOffsetBasedOnDirection(field: IField, direction: { x: number, y: number }, howManyFieldWantMove: number) {
    let mult = howManyFieldWantMove

    if (howManyFieldWantMove < 1) {
        mult = 1
    }

    if (field.height < howManyFieldWantMove) {
        mult = field.height
    }

    return { x: direction.x * mult, y: direction.y * mult }
}

function isMoveLegal(board: IGameBoard, x: number, y: number, direction: Direction, moveCount: number): boolean {
    const field = board.getFieldAt(x, y)

    const offset = getOffsetBasedOnDirection(field, direction, moveCount)

    try {
        const fieldFromOffset = board.getFieldAt(x + offset.x, y + offset.y)
        return fieldFromOffset.isPlayable
    }
    catch (e) {
        return false
    }
}

export function getNeighbours(board: IGameBoard, x: number, y: number, maxMove: number): IField[] {
    const neighbours: IField[] = []

    for (let i = 1; i < maxMove; i++) {
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

export function getMovesFromDirection(board: IGameBoard, field: IField, x: number, y: number, direction: Direction): Move[] {
    const moves: Move[] = []

    for (let moveCount = 1; moveCount <= field.height; moveCount++) {
        const isLegalMove = isMoveLegal(board, x, y, direction, moveCount)
        if (isLegalMove) {
            moves.push({ direction: direction, x: x, y: y, moveCount: moveCount })
        }
    }
    return moves
}

export function getLegalMovesFromField(board: IGameBoard, x: number, y: number): Move[] {
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

function getAiMoves(move: Move): AiMove {
    const fieldFrom = _board.getFieldAt(move.x, move.y)
    const fieldTo = _board.getFieldAt(move.x + move.direction.x * move.moveCount, move.y + move.direction.y * move.moveCount)

    // buggy one
    const gameBoardAfterMove: AfterPlaceMove = _board.getBoardAfterMove(fieldFrom, fieldTo, _player)

    move.redPawns = gameBoardAfterMove.redCount
    move.greenPawns = gameBoardAfterMove.greenCount

    return { gameBoardAfterMove: gameBoardAfterMove.gameBoard, move }
}

let _aiMoves: AiMove[] = null
let _afterPlaceMoves: AfterPlaceMove[] = null


function getPlaceMoves(v: IField) {
    const afterPlaceMove = _board.getBoardAfterPlace(v.x, v.y, _player)

    const move: AiMove = {

        gameBoardAfterMove: afterPlaceMove.gameBoard,
        move: {
            x: v.x,
            y: v.y,
            shouldPlaceSomething: true,
            redPawns: afterPlaceMove.redCount,
            greenPawns: afterPlaceMove.greenCount
        }
    }

    if (_player.state === FieldState.Green && afterPlaceMove.greenCount > 0) {
        _aiMoves.push(move)
    }
    else if (_player.state === FieldState.Red && afterPlaceMove.redCount > 0)
        _aiMoves.push(move)

    _afterPlaceMoves[_aiMoves.length - 1] = afterPlaceMove
}

export function getAvailableMoves(board: IGameBoard, player: IPlayer) {
    let moves: Move[] = []
    _board = board
    _player = player

    const yourFields: IField[] = getAllFieldBelongingToPlayer(board, player)
    const enemyFields: IField[] = getAllFieldBelongingToPlayer(board, player === PLAYER_RED ? PLAYER_GREEN : PLAYER_RED)

    moves = yourFields.flatMap(v => getLegalMovesFromField(board, v.x, v.y))
    console.log([player])

    const aiMoves: AiMove[] = moves.map(getAiMoves)
    _aiMoves = aiMoves

    const afterPlaceMoves: AfterPlaceMove[] = []
    _afterPlaceMoves = afterPlaceMoves

    enemyFields.forEach(getPlaceMoves)

    return { aiMoves, afterPlaceMoves }
}