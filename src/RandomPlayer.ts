import { AiController, getPlayerName } from './AiController'
import { randomInteger } from './GameUtils'
import { IField } from './IField'
import { IFocus, Move } from './IFocus'
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
        let moves: Move[] = []

        const yourFields: IField[] = []

        this._gameBoard.gameBoard.each(v =>
        {
            if (this.ownedPlayer.doesOwnThisField(v))
                yourFields.push(v)
        })

        moves = yourFields.flatMap(v => this._game.getLegalMovesFromField(v.x, v.y))

        const randomMove = moves[randomInteger(0, moves.length)] || null
        if (randomMove !== null)
        {
            this._game.moveToField(randomMove.fromX, randomMove.fromY, randomMove.direction, randomMove.moveCount)
        }
    }

    onPlaceStateStarted(): void
    {
        console.log(`Computer player(${getPlayerName(this.ownedPlayer)}) places`)
        const { x, y } = this.getRandomFieldPosition(f => f.isPlayable)

        this._game.placeField(x, y, this.ownedPlayer)
    }
}