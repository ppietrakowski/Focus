import { FieldState, IField } from './IField'
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

    let ratioInReserve = controlledInReserveByEnemy / controlledInReserveByYou
    if (Number.isNaN(ratioInReserve))
        ratioInReserve = 0

    const enemyFields: IField[] = []

    board.each(v =>
    {
        if (!player.doesOwnThisField(v))
            enemyFields.push(v)
    })

    const value = enemyFields.reduce(
        (accumulated, value) =>
        {
            accumulated += value.height
            
            return accumulated
        }, 0
    )

    const evalValue =  4 * ratio + 5 * ratioInReserve + value * 3

    return evalValue
}