import EventEmitter from 'eventemitter3'
import { IPoolClickedListener } from './IGameBoardView'
import { IPlayer } from './Player'

export interface IReserveView {
    addToReserve(toWhichPlayer: IPlayer): void
    removeFromReserve(): boolean
    getFieldAt(i: number): HTMLDivElement
    addPoolClickedListener<T>(listener: IPoolClickedListener, context: T): void
    emitPoolClicked(player: IPlayer, reserve: IReserveView): void

    readonly events: EventEmitter
    readonly owner: IPlayer
}

export const EventPoolClicked = 'PoolClicked'