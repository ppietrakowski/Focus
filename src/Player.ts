import { IField } from './IField'


export interface IPlayer {

    pooledPawns: number
    
    doesOwnThisField(field: number | IField): boolean
    possessField(field: IField): void
    get hasAnyPool(): boolean
}

export class Player implements IPlayer {

    pooledPawns: number
    state: number

    constructor(state: number) {
        this.state = state
        this.pooledPawns = 0
    }

    doesOwnThisField(field: number | IField) {
        if (typeof field == 'number') {
            return !!(field & this.state)
        }
        
        return !!(field.state & this.state)
    }

    possessField(field: IField): void {
        field.state = this.state
    }

    get hasAnyPool() {
        return this.pooledPawns > 0
    }
}