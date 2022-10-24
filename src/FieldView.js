import { EventEmitter } from "eventemitter3"
import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_SOUTH, DIRECTION_WEST, Field, FIELD_STATE_PLAYER_A, FIELD_STATE_PLAYER_B } from "./Field"
import { Focus } from "./Game"


/**
 * 
 * @param {{state: number}} underElement 
 * @returns 
 */
function getSourceOfUnderElement(underElement) {
    return (underElement.state & FIELD_STATE_PLAYER_A) ? 
        '../img/focusPawnRed.svg' 
        : (underElement.state & FIELD_STATE_PLAYER_B) ?
        '../img/focusPawnGreen.svg' : ''
}

export class FieldView {

    static FIELD_UNCLICK = 'UnClick'
    static FIELD_CLICK = 'Click'

    constructor(game, field) {
        /**
         * @type {Field}
         */
        this.field = field
        this.isSelected = false

        /**
         * @type {Focus}
         */
        this.game = game

        this.events = new EventEmitter()

        this.domElement = document.createElement('div')

        this.underField = [document.createElement('img')]
        for (let i = 1; i < 5; i++) {
            this.underField.push(document.createElement('img'))
        }

        this.underField.forEach(v => this.domElement.appendChild(v))
        
        this.domElement.className = this.getUnhoveredClassName()

        this.domElement.addEventListener('mouseover', e => this.onMouseOver())
        this.domElement.addEventListener('mouseleave', e => this.onMouseLeave())
        this.domElement.addEventListener('click', () => this.onClick())
    }

    onMouseLeave() {
        if (this.game.currentPlayer.doesOwnThisField(this.field) && !this.isSelected)
            this.domElement.className = this.getUnhoveredClassName()
    }

    getHoveredClassName() {
        return (this.field.state & FIELD_STATE_PLAYER_A) ? 'playerRedFieldHovered' : (this.field.state & FIELD_STATE_PLAYER_B) ? 'playerGreenFieldHovered' : 'emptyField'
    }

    getUnhoveredClassName() {
        return (this.field.state & FIELD_STATE_PLAYER_A) ? 'playerRedField' : (this.field.state & FIELD_STATE_PLAYER_B) ? 'playerGreenField' : 'emptyField'
    }

    onMouseOver() {
        if (this.game.currentPlayer.doesOwnThisField(this.field) && !this.isSelected) {
            this.domElement.className = this.getHoveredClassName()
        }
    }

    onClick() {
        this.events.emit(FieldView.FIELD_CLICK, this.field)
    }

    visualizeHovered() {
        this.domElement.className = this.getHoveredClassName()
    }

    visualizeUnhovered() {
        this.domElement.className = this.getUnhoveredClassName()
    }

    updateField() {
        for (let i = 0; i < this.field.underThisField.length; i++) {
            const src = getSourceOfUnderElement(this.field.underThisField[i])
            this.underField[i].src = src
            this.underField[i].style.zIndex = i
            this.underField[i].style.position = this.domElement.style.position
        }

        this.domElement.style.zIndex = this.field.underThisField.length
    }

    /**
     * 
     * @param {Field} anotherField 
     */
    isInRange(anotherField, range) {
        return (anotherField.x - range.x >= this.field.x && anotherField.x + range.x <= this.field.x) &&
            (anotherField.y - range.y >= this.field.y && anotherField.y + range.y <= this.field.y)
    }
}