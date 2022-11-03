import EventEmitter from 'eventemitter3'
import { Field, FIELD_STATE_PLAYER_GREEN, FIELD_STATE_PLAYER_RED, IField } from './Field'
import { Focus, IFocus } from './Game'

export interface IFieldView {
    isInRange(anotherField: IField, range: {x: number, y: number}): boolean
    visualizeHovered(): void
    visualizeUnhovered(): void

    field: IField
    events: EventEmitter
    domElement: HTMLDivElement
}

export class FieldView implements IFieldView {

    static readonly FIELD_UNCLICK = 'UnClick'
    static readonly FIELD_CLICK = 'Click'
    static readonly FIELD_DBL_CLICK = 'DblClick'

    static readonly FieldMouseOver = 'FieldMouseOver'
    static readonly FieldMouseLeave = 'FieldMouseLeave'

    field: IField

    events: EventEmitter
    domElement: HTMLDivElement

    constructor(private readonly game: IFocus, field: IField) {
        this.field = field
        this.events = new EventEmitter()
        this.domElement = document.createElement('div')
        
        this.domElement.className = this.getUnhoveredClassName()

        this.domElement.addEventListener('mouseover', () => this.onMouseOver())
        this.domElement.addEventListener('mouseleave', () => this.onMouseLeave())
        this.domElement.addEventListener('click', () => this.onClick())
    }

    visualizeHovered() {
        this.domElement.className = this.getHoveredClassName()
    }

    visualizeUnhovered() {
        this.domElement.className = this.getUnhoveredClassName()
    }

    isInRange(anotherField: IField, range: {x: number, y: number}) {
        return (anotherField.x - range.x >= this.field.x && anotherField.x + range.x <= this.field.x) &&
            (anotherField.y - range.y >= this.field.y && anotherField.y + range.y <= this.field.y)
    }

    private onMouseLeave() {
        if (this.game.currentPlayer.doesOwnThisField(this.field)) {
            this.events.emit(FieldView.FieldMouseLeave, this.game.currentPlayer)
        }
    }

    private getHoveredClassName() {
        return (this.field.state & FIELD_STATE_PLAYER_RED) ? 'playerRedFieldHovered' : (this.field.state & FIELD_STATE_PLAYER_GREEN) ? 'playerGreenFieldHovered' : 'emptyField'
    }

    private getUnhoveredClassName() {
        return (this.field.state & FIELD_STATE_PLAYER_RED) ? 'playerRedField' : (this.field.state & FIELD_STATE_PLAYER_GREEN) ? 'playerGreenField' : 'emptyField'
    }

    private onMouseOver() {
        if (this.game.currentPlayer.doesOwnThisField(this.field)) {
            this.events.emit(FieldView.FieldMouseOver, this.game.currentPlayer)
        }
    }

    private onClick() {
        this.events.emit(FieldView.FIELD_CLICK, this)
    }
}