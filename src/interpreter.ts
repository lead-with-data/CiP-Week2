import { useStore } from './store';

function getNextInstruction(lines: string[], startIndex: number): number {
  let index = startIndex;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (line !== '' && !line.startsWith('//')) {
      return index;
    }
    index++;
  }
  return index;
}

export function executeStep(): boolean {
  const store = useStore.getState();
  store.setError(null);
  
  const lines = store.code.split('\n').map(l => l.trim().toLowerCase());
  let currentInstruction = store.currentLine !== null ? store.currentLine : getNextInstruction(lines, 0);

  if (currentInstruction >= lines.length) {
    store.setIsPlaying(false);
    store.setCurrentLine(null);
    return false;
  }

  // Save history state right before we execute this instruction
  store.pushHistory();

  const line = lines[currentInstruction];
  
  let success = true;
  if (line === 'move') {
    success = useStore.getState().move();
  } else if (line === 'turnleft') {
    useStore.getState().turnLeft();
  } else if (line === 'pick') {
    success = useStore.getState().pickBeeper();
  } else if (line === 'put') {
    success = useStore.getState().putBeeper();
  } else if (line === 'check') {
    success = useStore.getState().checkBeeper();
  } else {
    useStore.getState().setError(`Unknown command: ${line}`);
    success = false;
  }

  if (!success) {
    useStore.getState().setIsPlaying(false);
    return false;
  }

  // Advance pointer to next valid line
  const nextInstruction = getNextInstruction(lines, currentInstruction + 1);
  if (nextInstruction >= lines.length) {
    useStore.getState().setCurrentLine(null);
    useStore.getState().setIsPlaying(false);
    return false;
  } else {
    useStore.getState().setCurrentLine(nextInstruction);
    return true;
  }
}

export function stepForward() {
  const store = useStore.getState();
  if (store.isPlaying) return; // Don't allow manual step while auto-playing
  executeStep();
}

export function stepBackward() {
  const store = useStore.getState();
  if (store.isPlaying) return;
  store.popHistory();
}

export function runInterpreter() {
  const store = useStore.getState();
  if (store.isPlaying) return;
  
  store.setIsPlaying(true);
  
  // Start from beginning if we are not currently at an instruction
  const lines = store.code.split('\n').map(l => l.trim().toLowerCase());
  if (store.currentLine === null) {
      store.setCurrentLine(getNextInstruction(lines, 0));
  }

  const loop = () => {
    if (!useStore.getState().isPlaying) return;
    
    const hasMore = executeStep();
    if (hasMore && useStore.getState().isPlaying) {
      setTimeout(loop, useStore.getState().speed);
    }
  };

  loop();
}

export function stopInterpreter() {
  useStore.getState().setIsPlaying(false);
}

export function resetInterpreter() {
  stopInterpreter();
  useStore.getState().resetLevel();
}
