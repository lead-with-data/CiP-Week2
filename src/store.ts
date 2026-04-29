import { create } from 'zustand';

export type Direction = 0 | 1 | 2 | 3; // 0: East (+X), 1: North (-Z), 2: West (-X), 3: South (+Z)

export interface GridState {
  beepers: Record<string, number>; // key: "x,z", value: count
}

export interface RobotState {
  x: number;
  z: number;
  dir: Direction;
  bag: number;
}

interface AppState {
  gridSize: number;
  robot: RobotState;
  grid: GridState;
  isPlaying: boolean;
  code: string;
  currentLine: number | null;
  error: string | null;
  speed: number;
  currentLevel: string;
  
  // Actions
  setCode: (code: string) => void;
  setSpeed: (speed: number) => void;
  resetLevel: () => void;
  loadLevel: (levelId: string) => void;
  
  // Robot Actions
  move: () => boolean; // returns true if successful
  turnLeft: () => void;
  pickBeeper: () => boolean;
  putBeeper: () => boolean;
  checkBeeper: () => boolean;

  // Execution
  setIsPlaying: (playing: boolean) => void;
  setCurrentLine: (line: number | null) => void;
  setError: (error: string | null) => void;

  history: { robot: RobotState; grid: GridState; currentLine: number | null }[];
  pushHistory: () => void;
  popHistory: () => void;
}

export const LEVELS = {
  spread: {
    id: 'spread',
    name: 'Spread Beepers',
    robot: { x: 0, z: 0, dir: 0 as Direction, bag: 0 },
    grid: { beepers: { "1,0": 4 } },
    defaultCode: `move
pick 
move 
put 
turnleft
turnleft 
move
pick 
turnleft
turnleft 
move
move 
put 
turnleft
turnleft
move
move
pick
turnleft
turnleft
move
move
move
put`
  },
  towers: {
    id: 'towers',
    name: 'Towers of Beepers',
    robot: { x: 0, z: 4, dir: 0 as Direction, bag: 0 },
    grid: { beepers: { "1,0": 6, "1,1": 2, "1,2": 5, "1,3": 1 } },
    defaultCode: `// Navigate the columns
move
turnleft`
  }
};

const INITIAL_LEVEL = LEVELS.spread;

export const useStore = create<AppState>((set, get) => ({
  gridSize: 10,
  robot: { ...INITIAL_LEVEL.robot },
  grid: { ...INITIAL_LEVEL.grid },
  isPlaying: false,
  code: `// Goal: Move to the stack, pick them all up, 
// and spread them out in a line.

move
pick
pick
pick
pick
move
put
move
put
move
put
move
put`,
  currentLine: null,
  error: null,
  speed: 500,
  currentLevel: 'spread',
  history: [],

  setCode: (code) => set({ code }),
  setSpeed: (speed) => set({ speed }),
  
  resetLevel: () => {
    const levelKey = get().currentLevel as keyof typeof LEVELS;
    const level = LEVELS[levelKey];
    set({
      robot: { ...level.robot },
      grid: { ...level.grid },
      isPlaying: false,
      currentLine: null,
      error: null,
      history: [],
    });
  },

  loadLevel: (levelId) => {
    const level = LEVELS[levelId as keyof typeof LEVELS];
    if (level) {
      set({
        currentLevel: levelId,
        robot: { ...level.robot },
        grid: { ...level.grid },
        code: level.defaultCode,
        isPlaying: false,
        currentLine: null,
        error: null,
        history: [],
      });
    }
  },

  move: () => {
    const { robot, gridSize } = get();
    let { x, z, dir } = robot;
    
    if (dir === 0) x += 1;
    else if (dir === 1) z -= 1;
    else if (dir === 2) x -= 1;
    else if (dir === 3) z += 1;

    if (x >= 0 && x < gridSize && z >= 0 && z < gridSize) {
      set({ robot: { ...robot, x, z } });
      return true;
    } else {
      set({ error: "Robot crashed into a wall!" });
      return false;
    }
  },

  turnLeft: () => {
    const { robot } = get();
    set({ robot: { ...robot, dir: ((robot.dir + 1) % 4) as Direction } });
  },

  pickBeeper: () => {
    const { robot, grid } = get();
    const key = `${robot.x},${robot.z}`;
    const count = grid.beepers[key] || 0;

    if (count > 0) {
      set({
        robot: { ...robot, bag: robot.bag + 1 },
        grid: {
          beepers: {
            ...grid.beepers,
            [key]: count - 1,
          }
        }
      });
      return true;
    } else {
      set({ error: "No beepers to pick up here!" });
      return false;
    }
  },

  putBeeper: () => {
    const { robot, grid } = get();
    const key = `${robot.x},${robot.z}`;
    const count = grid.beepers[key] || 0;

    if (robot.bag > 0) {
      set({
        robot: { ...robot, bag: robot.bag - 1 },
        grid: {
          beepers: {
            ...grid.beepers,
            [key]: count + 1,
          }
        }
      });
      return true;
    } else {
      set({ error: "Bag is empty!" });
      return false;
    }
  },

  checkBeeper: () => {
    const { robot, grid } = get();
    const key = `${robot.x},${robot.z}`;
    const count = grid.beepers[key] || 0;

    if (count > 0) {
      return true;
    } else {
      set({ error: "Check failed: No beepers at current position!" });
      return false;
    }
  },

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentLine: (currentLine) => set({ currentLine }),
  setError: (error) => set({ error, isPlaying: error !== null ? false : get().isPlaying }),

  pushHistory: () => {
    const { robot, grid, currentLine, history } = get();
    set({
      history: [...history, { robot: { ...robot }, grid: { ...grid }, currentLine }],
    });
  },

  popHistory: () => {
    const { history } = get();
    if (history.length > 0) {
      const newHistory = [...history];
      const previousState = newHistory.pop();
      if (previousState) {
        set({
          robot: previousState.robot,
          grid: previousState.grid,
          currentLine: previousState.currentLine,
          history: newHistory,
          error: null,
        });
      }
    }
  },
}));
