/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStore } from './store';
import { Scene } from './Scene';
import { runInterpreter, stopInterpreter, resetInterpreter, stepForward, stepBackward } from './interpreter';
import { Play, Square, RotateCcw, Plus, Minus, StepForward, StepBack } from 'lucide-react';

export default function App() {
  const code = useStore((state) => state.code);
  const setCode = useStore((state) => state.setCode);
  const isPlaying = useStore((state) => state.isPlaying);
  const error = useStore((state) => state.error);
  const speed = useStore((state) => state.speed);
  const setSpeed = useStore((state) => state.setSpeed);
  const resetLevel = useStore((state) => state.resetLevel);
  const currentLine = useStore((state) => state.currentLine);
  const historyLength = useStore((state) => state.history.length);
  
  const handlePlayPause = () => {
    if (isPlaying) {
      stopInterpreter();
    } else {
      runInterpreter();
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Header */}
      <header className="h-16 px-8 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Algorithmic Visualization: <span className="text-indigo-600">Beeper Spreading</span></h1>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500 uppercase tracking-widest">Karel 3D</div>
          <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest ${isPlaying ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {isPlaying ? 'Simulating' : 'Idle'}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow flex overflow-hidden w-full">
        
        {/* Left: 3D Scene Viewport */}
        <div className="flex-grow relative flex items-center justify-center bg-slate-200">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]"></div>
          
          {/* Scene wrapper */}
          <div className="absolute inset-0 z-10">
            <Scene />
          </div>
        </div>

        {/* Right: Sidebar / Console */}
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0 z-20">
          
          {/* Levels Section */}
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Levels</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => useStore.getState().loadLevel('spread')}
                className={`flex-grow py-2 border rounded text-xs font-semibold ${useStore.getState().currentLevel === 'spread' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >Spread Beepers</button>
              <button 
                onClick={() => useStore.getState().loadLevel('towers')}
                className={`flex-grow py-2 border rounded text-xs font-semibold ${useStore.getState().currentLevel === 'towers' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >Towers</button>
            </div>
          </div>

          {/* Code View */}
          <div className="flex-grow flex flex-col p-6 bg-slate-900 overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Program.kp</h3>
              <div className="flex flex-col items-end gap-1">
                 <div className="text-[10px] text-slate-500 font-mono">Speed</div>
                 <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setSpeed(Math.min(2000, speed + 100))}
                      className="p-1 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 hover:text-white"
                    ><Minus size={10} /></button>
                    <button 
                      onClick={() => setSpeed(Math.max(100, speed - 100))}
                      className="p-1 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 hover:text-white"
                    ><Plus size={10} /></button>
                 </div>
              </div>
            </div>

            <div className="relative flex-grow overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isPlaying}
                className="absolute inset-0 w-full h-full bg-transparent text-slate-300 font-mono text-xs leading-6 resize-none focus:outline-none disabled:opacity-80 disabled:cursor-not-allowed z-10"
                spellCheck={false}
              />
              {isPlaying && currentLine !== null && (
                 <div 
                   className="absolute left-0 right-0 h-6 bg-indigo-500/20 pointer-events-none transition-all duration-200 z-0"
                   style={{ top: `${currentLine * 24}px` }}
                 />
              )}
            </div>

            {error && (
              <div className="absolute top-1/2 left-4 right-4 transform -translate-y-1/2 p-3 bg-red-900/90 border border-red-500 rounded-md shadow-xl text-red-200 text-xs z-20 backdrop-blur">
                {error}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-6 space-y-4 bg-white">
            <button 
              onClick={isPlaying ? undefined : handlePlayPause}
              disabled={isPlaying}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-transform ${
                isPlaying 
                  ? 'bg-indigo-400 text-white cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
              }`}
            >
              {isPlaying ? (
                <>Simulating...</>
              ) : (
                <>
                  <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-white border-b-4 border-b-transparent"></div>
                  Resume Logic
                </>
              )}
            </button>
            <div className="flex gap-2">
              <button 
                onClick={stepBackward}
                disabled={isPlaying || historyLength === 0}
                className="flex-[0.5] py-2 border border-slate-200 rounded text-sm text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center"
              >
                <StepBack size={16} />
              </button>
              <button 
                onClick={stepForward}
                disabled={isPlaying}
                className="flex-grow flex items-center justify-center gap-1 py-2 border border-slate-200 rounded text-sm text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                <StepForward size={16} /> Step Over
              </button>
              <button 
                onClick={resetInterpreter}
                className="flex-grow py-2 border border-slate-200 rounded text-sm text-slate-600 font-medium hover:bg-slate-50"
              >Reset</button>
              {isPlaying && (
                <button 
                  onClick={stopInterpreter}
                  className="flex-[0.5] py-2 border border-red-200 bg-red-50 text-red-600 rounded text-sm font-medium hover:bg-red-100 flex items-center justify-center"
                >
                  <Square size={16} />
                </button>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Instructions</p>
              <div className="flex flex-wrap gap-1 font-mono text-[10px] text-slate-500">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">move</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">turnleft</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">pick</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">put</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">check</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-10 px-8 border-t border-slate-200 bg-white flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : isPlaying ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            <span className="text-[10px] text-slate-500 font-medium uppercase">Engine: {error ? 'Error' : isPlaying ? 'Active' : 'Ready'}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">BEEPERS_CARRIED: {useStore.getState().robot.bag}</div>
          <div className="text-[10px] text-slate-400 font-mono">CELL_INDEX: ({useStore.getState().robot.x}, {useStore.getState().robot.z})</div>
        </div>
        <div className="text-[10px] text-slate-400 italic font-medium">
          Simulation speed: {speed}ms
        </div>
      </footer>
    </div>
  );
}

