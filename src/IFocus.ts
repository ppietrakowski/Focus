import EventEmitter from 'eventemitter3';
import { IField } from './IField';
import { IGameBoard } from "./IGameBoard";
import { IPlayer } from './Player';


export interface IFocus {
    events: EventEmitter;
    gameBoard: IGameBoard;

    moveToField(x: number, y: number, direction: { x: number; y: number; }, howManyFieldWantMove: number): boolean;
    placeField(x: number, y: number, owner: IPlayer): void;
    getOffsetBasedOnDirection(field: IField, direction: { x: number; y: number; }, howManyFieldWantMove: number): { x: number; y: number; };
    getNextPlayer(player?: IPlayer): IPlayer;
    nextTurn(): void;

    get currentPlayer(): IPlayer;
    set currentPlayer(player: IPlayer)
}
