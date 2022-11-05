import { IField } from './IField';
import { IGameBoard } from "./IGameBoard";
import { IPlayer } from './Player';


export interface IVictoryListener
{
    onVictory(victoriousPlayer: IPlayer): void
}

export interface IMovedListener
{
    onMoveField(fromX: number, fromY: number, from: IField, to: IField): void
}

export interface IAddedToPoolListener
{
    onAddedToPool(toWhichPlayer: IPlayer): void
}

export interface IEnemyHasPoolListener
{
    onEnemyHasPool(enemy: IPlayer): void
}

export interface INewTurnListener
{
    onNextTurnBegin(currentPlayer: IPlayer): void
}

export interface IFocus
{
    gameBoard: IGameBoard;

    moveToField(x: number, y: number, direction: { x: number; y: number; }, howManyFieldWantMove: number): boolean;
    placeField(x: number, y: number, owner: IPlayer): void;
    getOffsetBasedOnDirection(field: IField, direction: { x: number; y: number; }, howManyFieldWantMove: number): { x: number; y: number; };
    getNextPlayer(player?: IPlayer): IPlayer;
    nextTurn(): void;

    addVictoryListener(listener: IVictoryListener): void
    removeVictoryListener(listener: IVictoryListener): void

    addMovedListener(listener: IMovedListener): void
    removeMovedListener(listener: IMovedListener): void

    addAddedToPoolListener(listener: IAddedToPoolListener): void
    removeAddedToPoolListener(listener: IAddedToPoolListener): void

    addEnemyHasPoolListener(listener: IEnemyHasPoolListener): void
    removeEnemyHasPoolListener(listener: IEnemyHasPoolListener): void

    addNewTurnListener(listener: INewTurnListener): void
    removeNewTurnListener(listener: INewTurnListener): void

    get currentPlayer(): IPlayer;
    set currentPlayer(player: IPlayer)
}
