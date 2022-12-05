import { PLAYER_GREEN, PLAYER_RED } from './Game'
import { Direction, DirectionEast, DirectionNorth, DirectionSouth, DirectionWest, FieldState, IField } from './IField'
import { Move } from './IFocus'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { AiMove } from './MinMaxAiPlayerController'
import { IPlayer } from './Player'

export function getOffsetBasedOnDirection(field: IField, direction: { x: number, y: number }, howManyFieldWantMove: number): Direction {
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


interface IAvailableMoves {
    aiMoves: AiMove[]
    afterPlaceMoves: AfterPlaceMove[]
}

export function getAvailableMoves(board: IGameBoard, player: IPlayer): IAvailableMoves {
    

    const enemyPlayer = player.state === PLAYER_RED.state ? PLAYER_GREEN : PLAYER_RED
    const yourFields: IField[] = board.filter(f => player.doesOwnThisField(f.state))
    const enemyFields: IField[] = board.filter(f => enemyPlayer.doesOwnThisField(f.state))
    
    const aiMoves = yourFields.flatMap(f => getLegalMovesFromField(board, f.x, f.y))
        .map<AiMove>(v => {
            return {
                gameBoardAfterMove: board.getBoardAfterMove(board.getFieldAt(v.x, v.y),
                    board.getFieldAt(v.x + v.direction.x * v.moveCount, v.y + v.direction.y * v.moveCount), player).gameBoard, move: v
            }
        })


    const afterPlaceMoves: AfterPlaceMove[] = []

    enemyFields.forEach(v => {
        const afterPlaceMove = board.getBoardAfterPlace(v.x, v.y, player)

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

        if (player.state === FieldState.Green && afterPlaceMove.greenCount > 0) {
            aiMoves.push(move)
        }
        else if (player.state === FieldState.Red && afterPlaceMove.redCount > 0)
            aiMoves.push(move)

        afterPlaceMoves[aiMoves.length - 1] = afterPlaceMove
    })

    return { aiMoves, afterPlaceMoves: afterPlaceMoves }
}