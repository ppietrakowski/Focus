import { IPlayer } from './Player'

export interface IAiController {
    move(): Promise<boolean>
    stopMoving(): void
    checkIsYourTurn(player: IPlayer): Promise<void>

    attachGameBoardController(controller: IGameBoardController): void

    onPlaceStateStarted(): void

    readonly ownedPlayer: IPlayer
}

export interface IGameBoardController {
    start(): void
    switchToPoolState(player: IPlayer): void
    placePoolState(player: IPlayer, aicontroller: IAiController): void
}