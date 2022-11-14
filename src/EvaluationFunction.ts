import { IFocus } from "./IFocus"
import { IGameBoard } from "./IGameBoard"
import { IPlayer } from "./Player"

export function evaluateMove(board: IGameBoard, player: IPlayer, game: IFocus) 
{
    const controlledByYou = board.countPlayersFields(player)

    const controlledByEnemy = board.countPlayersFields(game.getNextPlayer(player))

    let ratio = controlledByYou / controlledByEnemy

    if (Number.isNaN(ratio))
        ratio = 0

    const controlledInReserveByYou = player.pooledPawns
    const controlledInReserveByEnemy = game.getNextPlayer(player).pooledPawns

    let ratioInReserve = controlledInReserveByYou / controlledInReserveByEnemy
    if (controlledInReserveByYou === 0 || controlledInReserveByEnemy === 0)
        ratioInReserve = 0

    return { value: 4 * ratio + 3 * ratioInReserve }
}