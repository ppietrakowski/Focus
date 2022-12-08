import { PLAYER_GREEN, PLAYER_RED } from './Game'
import { Direction, DirectionEast, DirectionNorth, DirectionSouth, DirectionWest, FieldState, IField } from './IField'
import { Move } from './IFocus'
import { IGameBoard } from './IGameBoard'
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


type IAvailableMoves = AiMove[]

export function getAvailableMoves(board: IGameBoard, player: IPlayer): IAvailableMoves {
    const enemyPlayer = player.state === PLAYER_RED.state ? PLAYER_GREEN : PLAYER_RED

    const yourFields: IField[] = board.filter(f => player.doesOwnThisField(f.fieldState))
    const enemyFields: IField[] = board.filter(f => enemyPlayer.doesOwnThisField(f.fieldState))

    yourFields.sort((a, b) => b.height - a.height)

    let aiMoves = yourFields.flatMap(f => getLegalMovesFromField(board, f.posX, f.posY))
        .map<AiMove>(convertMoveToAiMove.bind(undefined, board, player))

    // accumulate each place moves
    aiMoves = aiMoves.concat(accumulateEachPlaceMove(enemyFields, board, player))

    return aiMoves
}

function convertMoveToAiMove(board: IGameBoard, player: IPlayer, move: Move): AiMove {
    const xOffset = move.x + move.direction.x * move.moveCount
    const yOffset = move.y + move.direction.y * move.moveCount

    const gameBoardAfterMove = board.getBoardAfterMove(
        board.getFieldAt(move.x, move.y),
        board.getFieldAt(xOffset, yOffset), player)

    return {
        gameBoardAfterMove, move
    }
}

function accumulateEachPlaceMove(enemyFields: IField[], board: IGameBoard, player: IPlayer) {

    const aiMoves: AiMove[] = []

    enemyFields.forEach(v => {
        const afterPlaceMove = board.getBoardAfterPlace(v.posX, v.posY, player)

        const move: AiMove = {
            gameBoardAfterMove: afterPlaceMove.gameBoard,
            move: {
                x: v.posX,
                y: v.posY,
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
    })

    return aiMoves
}
