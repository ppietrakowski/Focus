import { FieldState, IField } from './IField'
import { IFocus } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { IPlayer } from './Player'



export function evaluateMove(board: IGameBoard, player: IPlayer, game: IFocus): number {
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
        ratioInReserve = 0.0

    const yourFields: IField[] = board.filter(f => player.doesOwnThisField(f))
    const enemyFields: IField[] = board.filter(f => game.getNextPlayer(player).doesOwnThisField(f))

    controlledByYou = yourFields.length
    controlledByEnemy = enemyFields.length
    const ratio = controlledByYou - (2 * controlledByEnemy)

    const heightOfYourFields = yourFields.reduce((accumulated, current) => accumulated + current.height - 1, 0)
    const heightOfEnemyFields = enemyFields.reduce((accumulated, current) => accumulated + current.height - 1, 0)

    const evalValue = 10 * ratio + 1 * ratioInReserve + 2 * (heightOfYourFields - heightOfEnemyFields)

    return evalValue
}