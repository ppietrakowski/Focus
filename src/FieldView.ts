import EventEmitter from 'eventemitter3'
import { Field } from './Field'
import { FieldState } from './FieldState'
import { Focus } from './Game'
import { IField } from './IField'
import { IFocus } from "./IFocus"

export interface IClickListener {
    (field: IFieldView): void
}

export interface IFieldView {
    isInRange(anotherField: IField, range: {x: number, y: number}): boolean
    visualizeHovered(): void
    visualizeUnhovered(): void
    addClickListener(listener: IClickListener, context: any): void
    
    backupClickListeners(): void
    restoreClickListeners(): void

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
    private clickListeners: IClickListener[]
    private backedClickListeners: IClickListener[]


    constructor(private readonly game: IFocus, field: IField) {
        this.field = field
        this.events = new EventEmitter()
        this.domElement = document.createElement('div')
        
        this.domElement.className = this.getUnhoveredClassName()
        this.clickListeners = []
        this.backedClickListeners = []
    }

    addClickListener(listener: IClickListener, context: any): void {
        this.clickListeners.push(listener.bind(context))
    }
    
    backupClickListeners(): void {
        this.backedClickListeners = this.clickListeners.map(v => v)
        this.clickListeners = []
    }

    restoreClickListeners(): void {
        this.clickListeners = this.backedClickListeners.map(v => v)
        this.backedClickListeners = []
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

    onMouseLeave() {
        this.events.emit(FieldView.FieldMouseLeave, this.game.currentPlayer, this)
    }

    private getHoveredClassName() {
        return (this.field.state & FieldState.FIELD_STATE_PLAYER_RED) ? 'playerRedFieldHovered' : (this.field.state & FieldState.FIELD_STATE_PLAYER_GREEN) ? 'playerGreenFieldHovered' : 'emptyField'
    }

    private getUnhoveredClassName() {
        return (this.field.state & FieldState.FIELD_STATE_PLAYER_RED) ? 'playerRedField' : (this.field.state & FieldState.FIELD_STATE_PLAYER_GREEN) ? 'playerGreenField' : 'emptyField'
    }
    
    onMouseOver() {
        this.events.emit(FieldView.FieldMouseOver, this.game.currentPlayer, this)
    }

    onClick() {
        this.clickListeners.forEach(v => v(this))
    }
}