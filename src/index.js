import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_SOUTH, DIRECTION_WEST, FIELD_STATE_PLAYER_A } from './Field'
import { FieldView } from './FieldView'
import { Focus } from './Game'
import { GameBoardView } from './GameBoardView'

const gameFocus = new Focus()


const gameBoardView = new GameBoardView(gameFocus)

gameBoardView.hookGuiMethods()
gameFocus.events.on(Focus.ADDED_ITEM_TO_POOL, () => console.log("added to pool"))
gameFocus.events.on(Focus.VICTORY, (p) => console.log(`${JSON.stringify(p)} won`))