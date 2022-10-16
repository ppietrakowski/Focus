import EventEmitter from 'eventemitter3'
import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_SOUTH, DIRECTION_WEST, Field, FIELD_STATE_EMPTY, FIELD_STATE_PLAYER_A, FIELD_STATE_PLAYER_B } from './Field'
import { Focus } from './Game'

const gameFocus = new Focus()

gameFocus.gameBoard.setFieldAt(1, 2, FIELD_STATE_PLAYER_A)
gameFocus.gameBoard.setFieldAt(1, 1, FIELD_STATE_PLAYER_B)
gameFocus.gameBoard.setFieldAt(3, 1, FIELD_STATE_PLAYER_B)
gameFocus.gameBoard.setFieldAt(2, 1, FIELD_STATE_PLAYER_A)

gameFocus.gameBoard.getFieldAt(3, 1)._top.push({state: FIELD_STATE_PLAYER_B})
gameFocus.gameBoard.getFieldAt(3, 1)._top.push({state: FIELD_STATE_PLAYER_B})
gameFocus.gameBoard.getFieldAt(3, 1)._top.push({state: FIELD_STATE_PLAYER_B})
gameFocus.gameBoard.getFieldAt(3, 1)._top.push({state: FIELD_STATE_PLAYER_A})

const txt = document.createElement('div')
document.body.append(txt)


// console.log('f(1,1)=', gameFocus.gameBoard.getFieldAt(1, 1))
gameFocus.events.on(Focus.MOVED_FIELD, () => txt.innerHTML = gameFocus.gameBoard.grid.map(v => v.state === FIELD_STATE_EMPTY ? "0" : JSON.stringify(v)).join(' , '))
gameFocus.events.on(Focus.ADDED_ITEM_TO_POOL, player => console.log('player ', JSON.stringify(player), 'get a new item in pool'))

gameFocus.nextTurn()
gameFocus.moveToField(1, 1, DIRECTION_EAST, 1)

gameFocus.moveToField(2, 1, DIRECTION_EAST, 1)

txt.innerHTML = gameFocus.gameBoard.grid.map(v => v.state === FIELD_STATE_EMPTY ? "0" : JSON.stringify(v)).join(' , ')
