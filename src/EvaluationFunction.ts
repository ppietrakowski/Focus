import { FieldState, IField } from './IField'
import { IFocus, Move } from './IFocus'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { getLegalMovesFromField, getNeighbours } from './LegalMovesFactory'
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

    let ratioInReserve = controlledInReserveByEnemy / controlledInReserveByYou
    if (Number.isNaN(ratioInReserve))
        ratioInReserve = 0

    const yourFields: IField[] = []

    board.each(v =>
    {
        if (player.doesOwnThisField(v))
            yourFields.push(v)
    })

    
    const neighbours: IField[] = yourFields.flatMap(v => getNeighbours(board, v.x, v.y, v.height))

    // try to choose fields with the highest height
    neighbours.sort((a, b) => a.height - b.height)

    const valueFromNeighbours = neighbours[0] ? neighbours[0].height : 0

    const evalValue = 5 * ratio + 3 * ratioInReserve + valueFromNeighbours * 1
    return evalValue
}