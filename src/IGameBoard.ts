import { IField } from './IField';
import { IPlayer } from './Player';
import { ForEachCallback } from './GameBoard';

export interface IGameBoard
{
    each(callback: ForEachCallback): void;
    getFieldAt(x: number, y: number): IField;
    countPlayersFields(player: IPlayer): number;
}
