import { IPlayer } from './Player'

export interface IAiController
{
    move(): Promise<void>
    stopMoving(): void
    checkIsYourTurn(player: IPlayer): void

    attachGameBoardController(controller: IGameBoardController): void

    onPlaceStateStarted(): void

    readonly ownedPlayer: IPlayer
} 

export interface IGameBoardController
{
    start(): Promise<void>
    switchToPoolState(player: IPlayer): void
    placePoolState(player: IPlayer, aicontroller: IAiController): void
}