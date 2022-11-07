import { AiController } from './AiController'
import { PLAYER_GREEN } from './Game'
import { GameBoard } from './GameBoard'
import { IPredicate, randomInteger } from './GameUtils'
import { Direction, DirectionEast, DirectionNorth, DirectionSouth, DirectionWest, IField } from './IField'
import { IFocus } from './IFocus'
import { IGameBoardView } from './IGameBoardView'
import { IPlayer } from './Player'


export class RandomPlayer extends AiController
{

    constructor(aiOwnedPlayer: IPlayer, game: IFocus, gameBoard: IGameBoardView)
    {
        super(aiOwnedPlayer, game, gameBoard)
    }

    move(): void
    {
        const { x, y } = this.getRandomFieldPosition(f => this.ownedPlayer.doesOwnThisField(f))

        let direction = this.getRandomDirection(x, y)

        while (!this._game.moveToField(x, y, direction, 1))
        {
            direction = this.getRandomDirection(x, y)
        }
    }

    private getRandomFieldPosition(predicate: IPredicate<IField>)
    {
        let x = 0
        let y = 0

        while (!predicate(this._game.gameBoard.getFieldAt(x, y)))
        {
            x = randomInteger(0, GameBoard.GAME_BOARD_WIDTH)
            y = randomInteger(0, GameBoard.GAME_BOARD_HEIGHT)
        }

        return { x, y }
    }

    private getRandomDirection(baseX: number, baseY: number)
    {
        let direction = DirectionNorth

        let hasFoundGoodDirection = true

        while (hasFoundGoodDirection)
        {
            ({ direction, hasFoundGoodDirection } = this.tryGetPosition(baseX, baseY, direction))
        }

        return direction
    }

    private tryGetPosition(x: number, y: number, direction: Direction)
    {
        const directions = [DirectionNorth, DirectionEast, DirectionSouth, DirectionWest]

        try
        {
            direction = directions[randomInteger(0, directions.length)]
            this._game.gameBoard.getFieldAt(x + direction.x, y + direction.y)
            return { direction, hasFoundGoodDirection: true }
        } catch (e)
        {
            return { direction, hasFoundGoodDirection: false }
        }
    }

    onPlaceStateStarted(): void
    {
        console.log('Computer player places')
        const { x, y } = this.getRandomFieldPosition(f => f.isPlayable)

        if (this.ownedPlayer === PLAYER_GREEN)
        {
            this._gameBoard.greenReserve.removeFromReserve()
        } else
        {
            this._gameBoard.redReserve.removeFromReserve()
        }

        this._game.placeField(x, y, this.ownedPlayer)
    }

    stopMoving(): void
    {
        __dirname
    }
}