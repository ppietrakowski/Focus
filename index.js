import { Ai, MinMaxPlayer, RandomPlayer } from "./ai.js";
import { makeGameboardFromJson, PLAYER_GREEN, PLAYER_RED, PLAYER_TYPE_AI, setPlayerType, switchToNextPlayer } from "./gameboard.js";
import { GAMELOOP_EVENTS, initializeGameLoop } from "./gameloop.js";
import { cleanupGui, GUI_EVENTS, initializeGuiForBoard } from "./gui.js";

export const board = makeGameboardFromJson();

initializeGuiForBoard(board);

const ai = new Ai(new MinMaxPlayer(), PLAYER_GREEN, board);

setPlayerType('green', PLAYER_TYPE_AI);

initializeGameLoop(board, null, ai);