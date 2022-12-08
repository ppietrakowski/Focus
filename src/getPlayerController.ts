import { IPlayer } from './Player'
import PlayerAiController from './PlayerAiController'
import { RandomPlayer } from './RandomPlayer'
import { MinMaxAiPlayerController } from './MinMaxAiPlayerController'
import { IAiController } from './IGameBoardController'
import { NegaMaxPlayer } from './NegaMaxAiPlayerController'
import { AlphaBetaPlayerController } from './AlphaBetaPlayerController'
import { AbNegaMaxPlayer } from './AbNegaMaxPlayerController'
import { focus, gameBoardView } from './index'

export function getPlayerController(name: string, player: IPlayer): IAiController {

    if (name === 'human') {
        return new PlayerAiController(player, focus, gameBoardView)
    }

    if (name === 'random') {
        return new RandomPlayer(player, focus, gameBoardView)
    }

    if (name === 'minimax') {
        return new MinMaxAiPlayerController(player, focus, gameBoardView)
    }

    if (name === 'negamax') {
        return new NegaMaxPlayer(player, focus, gameBoardView)
    }

    if (name === 'abminimax') {
        return new AlphaBetaPlayerController(player, focus, gameBoardView)
    }

    if (name === 'abnegaminimax') {
        return new AbNegaMaxPlayer(player, focus, gameBoardView)
    }

    throw new Error('Selected unavailable player controller')
}
