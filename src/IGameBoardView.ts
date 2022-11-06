import { IFocus } from './IFocus'
import { IFieldView } from './FieldView'
import { IReserveView } from './ReserveView'
import { IGameBoard } from './IGameBoard'
import { IPlayer } from './Player'


export interface ForEachFieldInView
{
    (field: IFieldView): void
}

export interface IPoolClickedListener
{
    onPoolClicked(player: IPlayer, reserve: IReserveView): void
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


    addPoolClickedListener(listener: IPoolClickedListener): void
    removePoolClickedListener(listener: IPoolClickedListener): void

    get isSomethingSelected(): boolean
    
    greenReserve: IReserveView
    redReserve: IReserveView
}
