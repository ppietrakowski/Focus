import { FieldState, IField } from './IField'
import { IPlayer } from './Player'
import { ForEachCallback } from './GameBoard'

export interface AfterPlaceMove {
    gameBoard: IGameBoard
    redCount: number
    greenCount: number
}

export interface IGameBoard {
    redPlayerPawnCount: number
    greenPlayerPawnCount: number

    each(callback: ForEachCallback): void
    getFieldAt(x: number, y: number): IField
    countPlayersFields(player: IPlayer): number
    length(): number

    getBoardAfterMove(fromField: IField, toField: IField, player: IPlayer): AfterPlaceMove
    getBoardAfterPlace(x: number, y: number, player: IPlayer): AfterPlaceMove
}

export function getAllFieldBelongingToPlayer(board: IGameBoard, player: IPlayer): IField[] {
    const fields: IField[] = []

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const f = board.getFieldAt(x, y)

            if (f.isEmpty || (f.state & FieldState.Unplayable))
                continue
            
            if (f.state === player.state)
                fields.push(f)
        }
    }

    return fields
}