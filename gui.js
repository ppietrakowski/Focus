import { EventEmitterObj } from "./eventemmiter3.js";
import { Field, FIELD_STATE_EMPTY, FIELD_STATE_GREEN, FIELD_STATE_RED, FIELD_STATE_UNPLAYABLE } from "./field.js";
import { GameBoard, PLAYER_GREEN, PLAYER_RED } from "./gameboard.js";
import { isAvailableForMove, setAvailableForMove } from "./gameloop.js";


let fields = [[document.querySelector('div')]];

let attachedBoard = new GameBoard();;

let htmlGameboard = document.querySelector('#virtualBoard');

let initialized = false;

export const GUI_EVENTS = new EventEmitterObj();

const UnSelectedFields = [
    { state: FIELD_STATE_UNPLAYABLE, className: 'emptyReserve' },
    { state: FIELD_STATE_EMPTY, className: 'emptyReserve' },
    { state: FIELD_STATE_RED, className: 'redUnselected' },
    { state: FIELD_STATE_GREEN, className: 'greenUnselected' }
];

const SelectedFields = [
    { state: FIELD_STATE_UNPLAYABLE, className: 'emptyReserve' },
    { state: FIELD_STATE_EMPTY, className: 'emptyReserve' },
    { state: FIELD_STATE_RED, className: 'redselected' },
    { state: FIELD_STATE_GREEN, className: 'greenselected' }
];

const redReservePanel = document.querySelector('.reserveRed');
const greenReservePanel = document.querySelector('.reserveGreen');


export function initializeGuiForBoard(board) {
    if (initialized) {
        throw Error('double initialization detected');
    }
    attachedBoard = board;

    // generate board
    for (let y = 0; y < 8; y++) {
        fields[y] = [];

        for (let x = 0; x < 8; x++) {
            fields[y][x] = document.createElement('div');

            fields[y][x].className = 'rootClickableObject';

            fields[y][x].x = x;
            fields[y][x].y = y;

            fields[y][x].onclick = onFieldClick;

            htmlGameboard.appendChild(fields[y][x]);

            const element = document.createElement('div');
            element.className = UnSelectedFields.find(v => v.state === attachedBoard.getFieldAt(x, y).fieldState).className;
            fields[y][x].appendChild(element);

            for (let i = 1; i < 5; i++) {
                const element = document.createElement('div');
                element.className = UnSelectedFields.find(v => v.state === FIELD_STATE_EMPTY).className;
                fields[y][x].appendChild(element);
            }
            visualizeElements(fields[y][x]);
        }
    }

    redReservePanel.onclick = onPlayerReserveClick.bind(redReservePanel, PLAYER_RED);
    greenReservePanel.onclick = onPlayerReserveClick.bind(greenReservePanel, PLAYER_GREEN);

    initialized = true;
}

var isCurrentPlayerInPlacingMode = false;

function onPlayerReserveClick(attachedPlayer) {
    if (isCurrentPlayerInPlacingMode) {
        console.log('cancelled');
        updateReserve();
        clearAllBoard();

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                fields[y][x].onclick = onFieldClick;
            }
        }
        isCurrentPlayerInPlacingMode = false;
        return;
    }

    if (attachedBoard.currentPlayer === attachedPlayer && attachedBoard.isCurrentPlayerControlledByPlayer()) {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                fields[y][x].onclick = placeAtField;
            }
        }
        isCurrentPlayerInPlacingMode = true;
    }
}

function placeAtField() {
    if (attachedBoard.fields[this.y][this.x].fieldState !== FIELD_STATE_UNPLAYABLE) {
        placeAtGameBoard(attachedBoard, this.x, this.y, attachedBoard[CURRENT_PLAYER_INDEX]);
        updateReserve();
        clearAllBoard();

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                fields[y][x].onclick = onFieldClick;
            }
        }

        isCurrentPlayerInPlacingMode = false;

        setAvailableForMove();
    }
}

let selectedField = null;

export function onFieldClick(e) {
    if (!attachedBoard.isCurrentPlayerControlledByPlayer() && isAvailableForMove) {
        console.warn('You cheaty bastard !');
        return;
    }

    if (selectedField && selectedField.posX === this.x && selectedField.posY === this.y) {
        clearAllBoard();
        selectedField = null;
        return;
    }

    if (!selectedField && attachedBoard.fields[this.y][this.x].fieldState !== attachedBoard.fields[CURRENT_PLAYER_INDEX]) {
        console.log('trying to click not own field')
        return;
    }

    if (selectedField === null) {
        if (attachedBoard.fields[this.y][this.x].fieldState === attachedBoard.currentPlayer) {
            selectedField = attachedBoard.fields[this.y][this.x];
            renderMovesFromField(this);
        } else {
            console.log('trying to click not own field')
            return;
        }
    } else {
        try {
            let offsetX = selectedField.posX - this.x;
            let offsetY = selectedField.posY - this.y;

            if (offsetX !== 0 && offsetY !== 0) {
                clearSelection();
                throw Error('Diagonal move detected');
            }

            if (Math.abs(offsetX) > selectedField.getFieldHeight() || Math.abs(offsetY) > selectedField.getFieldHeight()) {
                clearSelection();
                return;
            }

            if (!attachedBoard.moveInGameboard(selectedField.posX, selectedField.posY, this.x, this.y, attachedBoard[CURRENT_PLAYER_INDEX])) {
                clearSelection();
                throw Error(`Maybe illegal move ? from (${selectedField.posX}, ${selectedField.posY}) to (${this.x}, ${this.y})`);
            }

            clearSelection();
            updateReserve();
            setAvailableForMove();
        } catch (e) {
            console.log(e);
        }
    }
}

export function updateReserve() {
    let { children } = redReservePanel;

    for (let i = 0; i < children.length; i++) {
        children[i].className = 'reserveEmptyPawn';
    }

    let reserveCount = attachedBoard.reserve[PLAYER_RED];
    for (let i = 0; i < reserveCount; i++) {
        children[i].className = 'reserveRedPawn';
    }

    ({ children } = greenReservePanel);

    for (let i = 0; i < children.length; i++) {
        children[i].className = 'reserveEmptyPawn';
    }

    reserveCount = attachedBoard.reserve[PLAYER_GREEN];
    for (let i = 0; i < reserveCount; i++) {
        children[i].className = 'reserveGreenPawn';
    }
}

function clearSelection() {
    clearAllBoard();
    selectedField = null;
}

export function clearAllBoard() {
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            visualizeElements(fields[y][x]);
        }
    }
}

function visualizeElements(htmlElement) {
    const { children } = htmlElement;

    for (let i = 0; i < children.length; i++) {
        children[i].className = UnSelectedFields.find(v => v.state === FIELD_STATE_EMPTY).className;
    }

    let scale = 1.0
    const field = attachedBoard.getFieldAt(htmlElement.x, htmlElement.y);

    const { tower } = field;

    for (let i = tower.length - 1; i >= 0; i--) {
        children[i].className = UnSelectedFields.find(v => v.state === tower[i]).className;
        children[i].style.scale = scale.toString();
        children[i].style.zIndex = 5 - i;
        scale -= 0.1;
    }
}

function renderMovesFromField(htmlElement) {
    const moves = attachedBoard.getMovesFromField(htmlElement.x, htmlElement.y);

    for (let move of moves) {
        let fieldX = htmlElement.x + move.x;
        let fieldY = htmlElement.y + move.y;
        const field = attachedBoard.getFieldAt(fieldX, fieldY);

        const { children } = fields[fieldY][fieldX];
        let scale = 1.0

        const { tower } = field;

        for (let i = tower.length - 1; i >= 0; i--) {
            children[i].className = SelectedFields.find(v => v.state === tower[i]).className;
            children[i].style.scale = scale.toString();
            children[i].style.zIndex = 5 - i;
            scale -= 0.1;
        }
    }
}

export function cleanupGui() {

    if (!initialized) {
        throw Error('Trying to cleanup unexisting gui');
    }

    htmlGameboard.replaceChildren();

    initialized = false;
}