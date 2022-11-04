import EventEmitter from 'eventemitter3';
import { IField } from './IField';
import { IPlayer } from './Player';
import { ForEachCallback } from './GameBoard';


export interface IGameBoard {
    events: EventEmitter;
    each(callback: ForEachCallback): void;
    getFieldAt(x: number, y: number): IField;
    countPlayersFields(player: IPlayer): number;
}
