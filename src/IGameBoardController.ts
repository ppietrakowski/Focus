import { IPlayer } from './Player'

export interface IAiController
{
    move(): void
    stopMoving(): void
    checkIsYourTurn(player: IPlayer): void

    attachGameBoardController(controller: IGameBoardController): void

    onPlaceStateStarted(): void

    readonly ownedPlayer: IPlayer
} 

export interface IGameBoardController
{
    switchToPoolState(player: IPlayer): void
    placePoolState(player: IPlayer, aicontroller: IAiController): void
}