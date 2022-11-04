import { IFocus } from "./IFocus";
import { IFieldView } from './FieldView';
import { IReserveView } from './ReserveView';
import { IGameBoard } from "./IGameBoard";
import EventEmitter from 'eventemitter3';


export interface ForEachFieldInView {
    (field: IFieldView): void
}

export interface IGameBoardView {
    gameBoard: IGameBoard;
    game: IFocus;
    board: HTMLDivElement;
    events: EventEmitter;

    getFieldAt(i: number): IFieldView;

    erasePossibleMoves(): void;
    renderPossibleMoves(selectedField: IFieldView): void;
    each(callback: ForEachFieldInView): void

    greenReserve: IReserveView;
    redReserve: IReserveView;
}
