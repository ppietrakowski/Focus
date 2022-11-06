import EventEmitter from 'eventemitter3'
import { FieldView, IClickListener, IFieldView } from './FieldView'
import { IField } from './IField'
import { IPlayer } from './Player'


export class FieldViewRequest implements IFieldView
{
    readonly events: EventEmitter
    field: IField
    domElement: HTMLDivElement
    
    constructor(private readonly fieldView: IFieldView, private readonly owningPlayer: IPlayer)
    {
        this.domElement = this.fieldView.domElement
        this.field = this.fieldView.field
        this.events = this.fieldView.events

        this.domElement.addEventListener('mouseover', () => this.onMouseOver())
        this.domElement.addEventListener('mouseleave', () => this.onMouseLeave())
        this.domElement.addEventListener('click', () => this.onClick())
    }

    addClickListener(clickListener: IClickListener, context: any, backup?: boolean): void
    {
        this.fieldView.addClickListener(clickListener, context, backup)
    }

    backupClickListeners(): void
    {
        this.fieldView.backupClickListeners()
    }

    restoreClickListeners(): void
    {
        this.fieldView.restoreClickListeners()
    }


    private onClick(): void
    {
        if (this.fieldView instanceof FieldView)
        {
            this.fieldView.onClick()
        }
    }

    private onMouseLeave(): void
    {
        if (this.fieldView instanceof FieldView)
        {
            this.fieldView.onMouseLeave()
        }
    }

    private onMouseOver(): void
    {
        if (this.fieldView instanceof FieldView)
        {
            this.fieldView.onMouseOver()
        }
    }

    

    isInRange(anotherField: IField, range: { x: number; y: number; }): boolean
    {
        return this.fieldView.isInRange(anotherField, range)
    }

    visualizeHovered(): void
    {
        this.fieldView.visualizeHovered()
    }

    visualizeUnhovered(): void
    {
        this.fieldView.visualizeUnhovered()
    }
}