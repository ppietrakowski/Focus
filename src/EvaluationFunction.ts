import { FieldState } from './IField'
import { IFocus } from './IFocus'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { AiMove } from './MinMaxAiPlayerController'
import { IPlayer } from './Player'

export function evaluateMove(board: IGameBoard, afterPlaceMove: AiMove, player: IPlayer, game: IFocus) 
{
    const controlledByYou = board.countPlayersFields(player)

    const controlledByEnemy = board.countPlayersFields(game.getNextPlayer(player))

    let ratio = controlledByYou / controlledByEnemy

    if (Number.isNaN(ratio))
        ratio = 0

    let controlledInReserveByYou = 0
    let controlledInReserveByEnemy = 0

    if (afterPlaceMove)
    {
        if (player.state === FieldState.Red)
        {
            controlledInReserveByYou = afterPlaceMove.redCount
            controlledInReserveByEnemy = afterPlaceMove.greenCount
        } else 
        {
            controlledInReserveByYou = afterPlaceMove.greenCount
            controlledInReserveByEnemy = afterPlaceMove.redCount
        }
    } else
    {
        controlledInReserveByYou = player.pooledPawns
        controlledInReserveByEnemy = game.getNextPlayer(player).pooledPawns
    }

    let ratioInReserve = controlledInReserveByYou / controlledInReserveByEnemy
    if (Number.isNaN(ratioInReserve))
        ratioInReserve = 0

    return { value: 4 * ratio + 3 * ratioInReserve }
}