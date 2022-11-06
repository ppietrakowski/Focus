import { AiController } from './AiController'
import { GameBoard } from './GameBoard'
import { DirectionEast, DirectionNorth, DirectionSouth, DirectionWest } from './IField'
import { IFocus } from './IFocus'
import { IGameBoardView } from './IGameBoardView'
import { IPlayer } from './Player'


export class RandomPlayer extends AiController
{

    constructor(aiOwnedPlayer: IPlayer, game: IFocus, gameBoard: IGameBoardView)
    {
        super(aiOwnedPlayer, game, gameBoard)
        console.warn(this.ownedPlayer)
    }

    move(): void
    {
        let x = 0
        let y = 0
        const directions = [DirectionNorth, DirectionEast, DirectionSouth, DirectionWest]
        let direction = DirectionNorth

        do
        {
            while (!this.ownedPlayer.doesOwnThisField(this.game.gameBoard.getFieldAt(x, y)))
            {
                x = Math.floor(Math.random() * GameBoard.GAME_BOARD_WIDTH)
                y = Math.floor(Math.random() * GameBoard.GAME_BOARD_HEIGHT)

                while (true)
                {
                    try
                    {
                        direction = directions[Math.floor(Math.random() * directions.length)]
                        const p = this.game.gameBoard.getFieldAt(x + direction.x, y + direction.y)
                        break
                    } catch (e)
                    {
                        continue
                    }
                }
            }
            console.log(x, y, direction)

        }
        while (this.game.moveToField(x, y, direction, 1))
    }

    onPlaceStateStarted(): void
    {
        let x = 0
        let y = 0
        console.log('Computer player places')

        while (!this.ownedPlayer.doesOwnThisField(this.game.gameBoard.getFieldAt(x, y)))
        {
            x = Math.floor(Math.random() * GameBoard.GAME_BOARD_WIDTH)
            y = Math.floor(Math.random() * GameBoard.GAME_BOARD_HEIGHT)
        }

        this.game.placeField(x, y, this.ownedPlayer)
    }

    stopMoving(): void
    {
        console.log(this.game.currentPlayer, __filename)
    }

}