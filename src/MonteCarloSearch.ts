import { AiController } from './AiController'
import { Move } from './IFocus';
import { getAvailableMoves, IAvailableMoves } from './LegalMovesFactory';

export class MonteCarloSearch extends AiController {

    simulationsCount = 3

    move(): Promise<boolean> {
        this.bestMove = this.monteCarloSearch(getAvailableMoves(this._gameBoard.gameBoard, this.ownedPlayer))

        return Promise.resolve(true)
    }

    private monteCarloSearch(availableMoves: IAvailableMoves): Move {
        let bestChild = null
        let bestProbability = -1

        for (let move of availableMoves) {
            let r = 0
            for (let i = 0; i < this.simulationsCount; i++) {
                let tempMove = move

                
            }
        }

        return bestChild
    }
}