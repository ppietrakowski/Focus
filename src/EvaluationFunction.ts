import { FieldState, getDirectionFromOffset, IField } from './IField'
import { IFocus, Move } from './IFocus'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { getLegalMovesFromField, getNeighbours, getOffsetBasedOnDirection } from './LegalMovesFactory'
import { AiMove } from './MinMaxAiPlayerController'
import { IPlayer } from './Player'



export function evaluateMove(board: IGameBoard, afterPlaceMove: AiMove, player: IPlayer, game: IFocus) 
{
    const controlledByYou = board.countPlayersFields(player)

    const controlledByEnemy = board.countPlayersFields(game.getNextPlayer(player))

    let ratio = controlledByYou - controlledByEnemy

    if (Number.isNaN(ratio))
        ratio = 0

    let controlledInReserveByYou = 0
    let controlledInReserveByEnemy = 0

    if (afterPlaceMove.move)
    {
        if (player.state === FieldState.Red)
        {
            controlledInReserveByYou = afterPlaceMove.move.redPawns
            controlledInReserveByEnemy = afterPlaceMove.move.greenPawns
        } else 
        {
            controlledInReserveByYou = afterPlaceMove.move.greenPawns
            controlledInReserveByEnemy = afterPlaceMove.move.greenPawns
        }
    } else
    {
        if (player.state === FieldState.Red)
        {
            controlledInReserveByYou = board.redPlayerPawnCount
            controlledInReserveByEnemy = board.greenPlayerPawnCount
        } else 
        {
            controlledInReserveByEnemy = board.redPlayerPawnCount
            controlledInReserveByYou = board.greenPlayerPawnCount
        }
    }

    let ratioInReserve = controlledInReserveByYou - controlledInReserveByEnemy
    if (Number.isNaN(ratioInReserve))
        ratioInReserve = 0

    const yourFields: IField[] = []

    board.each(v =>
    {
        if (player.doesOwnThisField(v))
            yourFields.push(v)
    })

    let heightOfNeighbour = 1

    if (afterPlaceMove && afterPlaceMove.move && afterPlaceMove.move.direction)
    {
        const offset = getOffsetBasedOnDirection(board.getFieldAt(afterPlaceMove.move.x, afterPlaceMove.move.y), afterPlaceMove.move.direction, afterPlaceMove.move.moveCount)

        try
        {
            heightOfNeighbour = Math.max(heightOfNeighbour, board.getFieldAt(offset.x, offset.y).height)
        } catch (e)
        // eslint-disable-next-line no-empty
        {
        }
    }
    
    
    const evalValue = 15 * ratio + 10 * ratioInReserve + heightOfNeighbour * 30
    return evalValue
}