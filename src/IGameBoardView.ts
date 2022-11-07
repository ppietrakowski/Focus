import { IFocus } from './IFocus'
import { IFieldView } from './FieldView'
import { IReserveView } from './IReserveView'
import { IGameBoard } from './IGameBoard'
import { IPlayer } from './Player'
import EventEmitter from 'eventemitter3'


export interface ForEachFieldInView
{
    (field: IFieldView): void
}

export interface IPoolClickedListener
{
    (player: IPlayer, reserve: IReserveView): void
}

export interface IGameBoardView
{
    gameBoard: IGameBoard;
    game: IFocus;
    board: HTMLDivElement;

    getFieldAt(i: number): IFieldView;

    erasePossibleMoves(): void;
    renderPossibleMoves(selectedField: IFieldView): void
    each(callback: ForEachFieldInView): void

    addPoolClickedListener(listener: IPoolClickedListener, context: any): void
    removePoolClickedListener(listener: IPoolClickedListener, context: any): void

    get isSomethingSelected(): boolean
    
    greenReserve: IReserveView
    redReserve: IReserveView

    events: EventEmitter
}
