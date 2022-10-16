import EventEmitter from 'eventemitter3'
import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_SOUTH, DIRECTION_WEST, Field, FIELD_STATE_EMPTY, FIELD_STATE_PLAYER_A, FIELD_STATE_PLAYER_B } from './Field'
import { Focus } from './Game'

const gameFocus = new Focus()

gameFocus.gameBoard.setFieldAt(1, 2, FIELD_STATE_PLAYER_A)
gameFocus.gameBoard.setFieldAt(1, 1, FIELD_STATE_PLAYER_B)
gameFocus.gameBoard.setFieldAt(2, 1, FIELD_STATE_PLAYER_B)


gameFocus.nextTurn()


const txt = document.createElement('div')
document.body.append(txt)


const x = document.createElement('input')
document.body.append(x)



const y = document.createElement('input')
document.body.append(y)


txt.innerHTML = gameFocus.gameBoard.grid.map(v => v.state === FIELD_STATE_EMPTY ? "0" : JSON.stringify(v)).join(' , ')

gameFocus.events.on('nextTurn', () => txt.innerHTML = gameFocus.gameBoard.grid.map(v => v.state === FIELD_STATE_EMPTY ? "0" : JSON.stringify(v)).join(' , '))
