import { AiController } from './AiController'
import { IFocus, Move } from './IFocus'
import { IGameBoardView } from './IGameBoardView'
import { getAvailableMoves } from './LegalMovesFactory'
import { IPlayer } from './Player'


export class RandomPlayer extends AiController {

    supplyBestMove(): Move {
        const availableMoves = getAvailableMoves(this.gameBoard, this.ownedPlayer)
        const index = Math.floor(Math.random() * availableMoves.length)

        return availableMoves[index].move
    }

    constructor(aiOwnedPlayer: IPlayer, game: IFocus, gameBoard: IGameBoardView) {
        super(aiOwnedPlayer, game, gameBoard)
    }
}   