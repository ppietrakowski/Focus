import { FieldState, IField } from './IField'
import { IFocus } from "./IFocus"
import { IPlayer } from './Player'

export interface IClickListener
{
    onFieldViewClick(fieldView: IFieldView): void
}

export interface IMouseStateListener
{
    onMouseOverFieldView(player: IPlayer, fieldView: IFieldView): void
    onMouseLeaveFieldView(player: IPlayer, fieldView: IFieldView): void
}

export interface IFieldView
{
    isInRange(anotherField: IField, range: { x: number, y: number }): boolean
    visualizeHovered(): void
    visualizeUnhovered(): void

    addClickListener(listener: IClickListener): void
    addMouseStateListener(listener: IMouseStateListener): void
    backupClickListeners(): void
    restoreClickListeners(): void

    field: IField
    domElement: HTMLDivElement
}


export class FieldView implements IFieldView
{

    static readonly FIELD_UNCLICK = 'UnClick'
    static readonly FIELD_CLICK = 'Click'
    static readonly FIELD_DBL_CLICK = 'DblClick'

    static readonly FieldMouseOver = 'FieldMouseOver'
    static readonly FieldMouseLeave = 'FieldMouseLeave'

    field: IField

    domElement: HTMLDivElement
    private clickListeners: IClickListener[]
    private backedClickListeners: IClickListener[]

    private _mouseStateListeners: IMouseStateListener[]

    constructor(private readonly game: IFocus, field: IField)
    {
        this.field = field
        this.domElement = document.createElement('div')

        this.domElement.className = this.getUnhoveredClassName()
        this.clickListeners = []
        this.backedClickListeners = []
        this._mouseStateListeners = []
    }

    addMouseStateListener(listener: IMouseStateListener)
    {
        this._mouseStateListeners.push(listener)
    }

    addClickListener(listener: IClickListener): void
    {
        this.clickListeners.push(listener)
    }

    backupClickListeners(): void
    {
        this.backedClickListeners = this.clickListeners.map(v => v)
        this.clickListeners = []
    }

    restoreClickListeners(): void
    {
        this.clickListeners = this.backedClickListeners.map(v => v)
        this.backedClickListeners = []
    }

    visualizeHovered()
    {
        this.domElement.className = this.getHoveredClassName()
    }

    visualizeUnhovered()
    {
        this.domElement.className = this.getUnhoveredClassName()
    }

    isInRange(anotherField: IField, range: { x: number, y: number })
    {
        return (anotherField.x - range.x >= this.field.x && anotherField.x + range.x <= this.field.x) &&
            (anotherField.y - range.y >= this.field.y && anotherField.y + range.y <= this.field.y)
    }

    onMouseLeave()
    {
        this._mouseStateListeners.forEach(l => l.onMouseLeaveFieldView(this.game.currentPlayer, this))
    }

    private getHoveredClassName()
    {
        return (this.field.state & FieldState.Red) ? 'playerRedFieldHovered' : (this.field.state & FieldState.Green) ? 'playerGreenFieldHovered' : 'emptyField'
    }

    private getUnhoveredClassName()
    {
        return (this.field.state & FieldState.Red) ? 'playerRedField' : (this.field.state & FieldState.Green) ? 'playerGreenField' : 'emptyField'
    }

    onMouseOver()
    {
        this._mouseStateListeners.forEach(l => l.onMouseOverFieldView(this.game.currentPlayer, this))
    }

    onClick()
    {
        this.clickListeners.forEach(l => l.onFieldViewClick(this))
    }
}