import { AiController } from './AiController'
import { FieldView } from './FieldView'
import { Focus } from './Game'
import { GameBoard } from './GameBoard'
import { GameBoardView } from './GameBoardView'
import { Player } from './Player'


export default class PlayerAiController extends AiController {

    selectedField: FieldView

    constructor(player: Player, game: Focus, gameBoard: GameBoardView) {
        super(player, game, gameBoard)
        
        this.selectedField = null
    }

    move(): void {
        this.selectedField = null
    }

    stopMoving(): void {
        this.selectedField = null
    }
}