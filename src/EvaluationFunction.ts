import { FieldState, IField } from './IField'
import { IFocus } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { AiMove } from './MinMaxAiPlayerController'
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

    const yourFields: IField[] = []
    const enemyFields: IField[] = []

    board.each(v => {
        if (player.doesOwnThisField(v))
            yourFields.push(v)
        else if (game.getNextPlayer(player).doesOwnThisField(v)) {
            enemyFields.push(v)
        }
    })

    controlledByYou = yourFields.length
    controlledByEnemy = enemyFields.length
    const ratio = controlledByYou - controlledByEnemy


    const heightOfYourFields = yourFields.reduce((accumulated, current) => accumulated + current.height, 0)
    const heightOfEnemyFields = enemyFields.reduce((accumulated, current) => accumulated + current.height, 0)

    const evalValue = 40 * ratio + 4 * ratioInReserve + 8 * heightOfEnemyFields / heightOfYourFields
    return evalValue
}