import EventEmitter from 'eventemitter3'
import { FieldView, IClickListener, IFieldView } from './FieldView'
import { IField } from './IField'
import { IPlayer } from './Player'


export class FieldViewRequest implements IFieldView
{
    readonly events: EventEmitter
    field: IField
    domElement: HTMLDivElement

    constructor(private readonly _fieldView: IFieldView, private readonly _owningPlayer: IPlayer)
    {
        this.domElement = this._fieldView.domElement
        this.field = this._fieldView.field
        this.events = this._fieldView.events

        this.domElement.addEventListener('mouseover', () => this.onMouseOver())
        this.domElement.addEventListener('mouseleave', () => this.onMouseLeave())
        this.domElement.addEventListener('click', () => this.onClick())
    }

    addClickListener(clickListener: IClickListener, context: any, backup?: boolean): void
    {
        this._fieldView.addClickListener(clickListener, context, backup)
    }

    backupClickListeners(): void
    {
        this._fieldView.backupClickListeners()
    }

    restoreClickListeners(): void
    {
        this._fieldView.restoreClickListeners()
    }


    private onClick(): void
    {
        if (this._fieldView instanceof FieldView)
        {
            this._fieldView.onClick()
        }
    }

    private onMouseLeave(): void
    {
        if (this._fieldView instanceof FieldView)
        {
            this._fieldView.onMouseLeave()
        }
    }

    private onMouseOver(): void
    {
        if (this._fieldView instanceof FieldView)
        {
            this._fieldView.onMouseOver()
        }
    }

    isInRange(anotherField: IField, range: { x: number; y: number; }): boolean
    {
        return this._fieldView.isInRange(anotherField, range)
    }

    visualizeHovered(): void
    {
        this._fieldView.visualizeHovered()
    }

    visualizeUnhovered(): void
    {
        this._fieldView.visualizeUnhovered()
    }
}