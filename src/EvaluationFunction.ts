import { FieldState, IField } from './IField'
import { IFocus } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { getOffsetBasedOnDirection } from './LegalMovesFactory'
import { AiMove } from './MinMaxAiPlayerController'
import { IPlayer } from './Player'



export function evaluateMove(board: IGameBoard, afterPlaceMove: AiMove, player: IPlayer, game: IFocus) {
    let controlledByYou = 0

    let controlledByEnemy = 0

    let controlledInReserveByYou = 0
    let controlledInReserveByEnemy = 0


    if (player.state === FieldState.Red) {
        controlledInReserveByYou = board.redPlayerPawnCount
        controlledInReserveByEnemy = board.greenPlayerPawnCount
    } else {
        controlledInReserveByEnemy = board.redPlayerPawnCount
        controlledInReserveByYou = board.greenPlayerPawnCount
    }


    let ratioInReserve = controlledInReserveByYou - controlledInReserveByEnemy
    if (Number.isNaN(ratioInReserve))
        ratioInReserve = 0

    const yourFields: IField[] = []
    const enemyFields: IField[] = []

    board.each(v => {
        if (player.doesOwnThisField(v))
            yourFields.push(v)
        else if (game.getNextPlayer(player).doesOwnThisField(v)) {
            enemyFields.push(v)
        }
    })

    controlledByYou = yourFields.reduce((accumulated, current) => accumulated + current.height, 0)
    controlledByEnemy = enemyFields.reduce((accumulated, current) => accumulated + current.height, 0)
    const ratio = controlledByYou - controlledByEnemy


    const heightOfYourFields = yourFields.reduce((accumulated, current) => accumulated + current.height, 0)

    const evalValue = 48 * ratio + 25 * ratioInReserve + 11 * heightOfYourFields
    return evalValue
}