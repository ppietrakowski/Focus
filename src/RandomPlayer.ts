import { AiController, getPlayerName } from './AiController'
import { randomInteger } from './GameUtils'
import { IField } from './IField'
import { IFocus, Move } from './IFocus'
import { IGameBoardView } from './IGameBoardView'
import { getLegalMovesFromField } from './LegalMovesFactory'
import { IPlayer } from './Player'


export class RandomPlayer extends AiController {

    constructor(aiOwnedPlayer: IPlayer, game: IFocus, gameBoard: IGameBoardView) {
        super(aiOwnedPlayer, game, gameBoard)
    }

    move(): Promise<boolean> {
        let moves: Move[] = []

        const yourFields: IField[] = []

        this._gameBoard.gameBoard.each(v => {
            if (this.ownedPlayer.doesOwnThisField(v))
                yourFields.push(v)
        })

        moves = yourFields.flatMap(v => getLegalMovesFromField(this._gameBoard.gameBoard, v.x, v.y))

        const randomMove = moves[randomInteger(0, moves.length)] || null
        if (randomMove !== null) {
            return this._game.moveToField(randomMove.x, randomMove.y, randomMove.direction, randomMove.moveCount)
        }

        return Promise.reject('not move founded')
    }
}