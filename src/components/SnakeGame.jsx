import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiRotateCcw, FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight, FiVolume2, FiVolumeX } from 'react-icons/fi';

const GRID_SIZE = 20;
const CELL_COUNT = 20; // 20x20 grid
const SPEED = 130; // ms per tick

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: -1 }); // Moving UP initially
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('snake_highscore');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Game states and timing refs for continuous 60fps slithering animation
  const prevSnakeRef = useRef(snake);
  const lastTickTimeRef = useRef(performance.now());
  const directionRef = useRef(direction);
  directionRef.current = direction;

  // Particle systems
  const particlesRef = useRef([]);

  // Input queue to prevent rapid double-taps causing self-collisions
  const inputQueueRef = useRef([]);

  // Sound Synth via Web Audio API (completely client-side, zero external files)
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'eat') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
      }
    } catch (e) {
      console.warn('Web Audio Context not supported or allowed yet.', e);
    }
  };

  // Particle Spawning on eating food
  const spawnParticles = (x, y) => {
    const temp = [];
    const colors = ['#4a9eff', '#ee6e4d', '#ffffff'];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3.5;
      temp.push({
        x: x * GRID_SIZE + GRID_SIZE / 2,
        y: y * GRID_SIZE + GRID_SIZE / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: 1.5 + Math.random() * 2,
      });
    }
    particlesRef.current.push(...temp);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused || isGameOver || !isPlaying) return;

      let nextDir = null;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          nextDir = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          nextDir = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          nextDir = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          nextDir = { x: 1, y: 0 };
          break;
        default:
          return;
      }

      e.preventDefault();
      
      // Buffer input to queue
      const queue = inputQueueRef.current;
      const lastInQueue = queue.length > 0 ? queue[queue.length - 1] : directionRef.current;
      
      // Prevent reversing directly in queue
      if (
        (nextDir.x !== 0 && lastInQueue.x === 0) || 
        (nextDir.y !== 0 && lastInQueue.y === 0)
      ) {
        if (queue.length < 2) {
          queue.push(nextDir);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, isGameOver, isPlaying]);

  // Main game tick loop
  useEffect(() => {
    if (isPaused || isGameOver || !isPlaying) return;

    const gameTick = () => {
      // Dequeue next move
      let nextDir = direction;
      if (inputQueueRef.current.length > 0) {
        nextDir = inputQueueRef.current.shift();
        setDirection(nextDir);
      }

      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + nextDir.x,
          y: head.y + nextDir.y,
        };

        // Wall collisions
        if (
          newHead.x < 0 ||
          newHead.x >= CELL_COUNT ||
          newHead.y < 0 ||
          newHead.y >= CELL_COUNT
        ) {
          setIsGameOver(true);
          playSound('gameover');
          return prevSnake;
        }

        // Self-collision
        for (const segment of prevSnake) {
          if (segment.x === newHead.x && segment.y === newHead.y) {
            setIsGameOver(true);
            playSound('gameover');
            return prevSnake;
          }
        }

        const newSnake = [newHead, ...prevSnake];

        // Eat food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => {
            const nextScore = s + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('snake_highscore', nextScore.toString());
            }
            return nextScore;
          });
          playSound('eat');
          spawnParticles(food.x, food.y);
          generateFood(newSnake);
        } else {
          newSnake.pop();
        }

        // Keep trace of previous position for sub-frame animation slithering
        prevSnakeRef.current = prevSnake;
        lastTickTimeRef.current = performance.now();
        return newSnake;
      });
    };

    const timer = setInterval(gameTick, SPEED);
    return () => clearInterval(timer);
  }, [direction, food, isPaused, isGameOver, isPlaying, highScore, soundEnabled]);

  // Generate food at vacant coordinates
  const generateFood = (currentSnake) => {
    let newFood;
    let isOnSnake = true;
    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * CELL_COUNT),
        y: Math.floor(Math.random() * CELL_COUNT),
      };
      isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
    }
    setFood(newFood);
  };

  // High performance Canvas rendering loop running at 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId;

    const render = () => {
      // 1. Calculate time interpolation factor t in range [0, 1]
      const now = performance.now();
      const elapsed = now - lastTickTimeRef.current;
      const t = (isPlaying && !isPaused && !isGameOver) ? Math.min(1, elapsed / SPEED) : 1;

      // 2. Clear Screen
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. Draw Grid Matrix (Glowing dark neon theme)
      ctx.strokeStyle = 'rgba(238, 110, 77, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= CELL_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
      }

      // 4. Update and Draw Particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;
        if (p.alpha <= 0) return false;
        
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      // 5. Draw Food (Pulsing glowing target)
      const pulseSpeed = 0.007;
      const pulseScale = 1 + Math.sin(now * pulseSpeed) * 0.15;
      
      ctx.save();
      ctx.fillStyle = '#4a9eff';
      ctx.shadowColor = '#4a9eff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        (GRID_SIZE / 2.4) * pulseScale,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.restore();

      // 6. Draw Snake segments (Animated smooth slithering)
      const prevS = prevSnakeRef.current;
      
      snake.forEach((segment, idx) => {
        let rx = segment.x;
        let ry = segment.y;

        // Interpolate position between previous cell and current cell
        if (isPlaying && !isPaused && !isGameOver && prevS && prevS[idx]) {
          const prevSeg = prevS[idx];
          rx = prevSeg.x + (segment.x - prevSeg.x) * t;
          ry = prevSeg.y + (segment.y - prevSeg.y) * t;
        }

        ctx.save();
        ctx.fillStyle = '#ee6e4d';
        ctx.shadowColor = '#ee6e4d';
        ctx.shadowBlur = idx === 0 ? 10 : 4;

        if (idx === 0) {
          // Draw head (circular/rounded style)
          ctx.beginPath();
          ctx.arc(
            rx * GRID_SIZE + GRID_SIZE / 2,
            ry * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 2 - 1,
            0,
            2 * Math.PI
          );
          ctx.fill();

          // Draw little eyes matching the direction
          ctx.fillStyle = '#000000';
          ctx.shadowBlur = 0;
          
          let curDir = directionRef.current;
          let eyeOffset = 3.5;
          let eyeRadius = 1.5;
          let centerX = rx * GRID_SIZE + GRID_SIZE / 2;
          let centerY = ry * GRID_SIZE + GRID_SIZE / 2;

          if (curDir.x !== 0) {
            // Horizontal movement eyes
            ctx.beginPath();
            ctx.arc(centerX + curDir.x * 2, centerY - eyeOffset, eyeRadius, 0, Math.PI * 2);
            ctx.arc(centerX + curDir.x * 2, centerY + eyeOffset, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Vertical movement eyes
            ctx.beginPath();
            ctx.arc(centerX - eyeOffset, centerY + curDir.y * 2, eyeRadius, 0, Math.PI * 2);
            ctx.arc(centerX + eyeOffset, centerY + curDir.y * 2, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Draw body segments (glowing pills with connection gaps)
          ctx.beginPath();
          ctx.arc(
            rx * GRID_SIZE + GRID_SIZE / 2,
            ry * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 2 - 2.5,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
        ctx.restore();
      });

      // 7. Render CRT scanline raster effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillRect(0, y, canvas.width, 1);
      }

      // 8. CRT Vignette reflection gradient
      const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width / 3,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [snake, food, isPlaying, isPaused, isGameOver]);

  const startGame = () => {
    playSound('click');
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ]);
    prevSnakeRef.current = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setDirection({ x: 0, y: -1 });
    setFood({ x: 5, y: 5 });
    setScore(0);
    inputQueueRef.current = [];
    particlesRef.current = [];
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    lastTickTimeRef.current = performance.now();
  };

  const togglePause = () => {
    playSound('click');
    setIsPaused(!isPaused);
  };

  const handleDpadPress = (newDirString) => {
    if (isPaused || isGameOver || !isPlaying) return;
    playSound('click');
    
    let nextDir = null;
    if (newDirString === 'UP') nextDir = { x: 0, y: -1 };
    if (newDirString === 'DOWN') nextDir = { x: 0, y: 1 };
    if (newDirString === 'LEFT') nextDir = { x: -1, y: 0 };
    if (newDirString === 'RIGHT') nextDir = { x: 1, y: 0 };

    const queue = inputQueueRef.current;
    const lastInQueue = queue.length > 0 ? queue[queue.length - 1] : directionRef.current;
    
    if (
      (nextDir.x !== 0 && lastInQueue.x === 0) || 
      (nextDir.y !== 0 && lastInQueue.y === 0)
    ) {
      if (queue.length < 2) {
        queue.push(nextDir);
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      {/* Score Header & Sound Toggle */}
      <div className="w-[320px] max-w-full flex justify-between items-center mb-3 font-mono text-xs tracking-widest text-white bg-black/60 px-4 py-2 rounded-md border border-white/10 backdrop-blur-md">
        <div>SCORE: <span className="text-[#ee6e4d] font-bold">{String(score).padStart(3, '0')}</span></div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="text-gray-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? <FiVolume2 size={15} /> : <FiVolumeX size={15} />}
          </button>
          <div className="border-l border-white/10 h-3" />
          <div>HI-SCORE: <span className="text-[#4a9eff] font-bold">{String(highScore).padStart(3, '0')}</span></div>
        </div>
      </div>

      {/* Screen Frame Bezel */}
      <div className="relative p-3 rounded-2xl border-4 border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/90 flex items-center justify-center max-w-full overflow-hidden focus-within:border-[#ee6e4d]/40 transition-colors">
        {/* Curved Glare overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 z-20 rounded-xl" />

        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_COUNT}
          height={GRID_SIZE * CELL_COUNT}
          className="rounded-lg border border-white/5 w-[300px] h-[300px] sm:w-[320px] sm:h-[320px] shadow-inner"
        />

        {/* Arcade UI Overlay Screens */}
        {(!isPlaying || isPaused || isGameOver) && (
          <div className="absolute inset-3 bg-black/85 rounded-lg flex flex-col items-center justify-center text-center p-5 backdrop-blur-[2px] z-10 border border-white/5">
            {isGameOver ? (
              <>
                <p className="text-2xl font-black text-red-500 mb-1 tracking-widest animate-pulse font-mono">GAME OVER</p>
                <p className="text-gray-400 text-xs mb-5 font-mono">SCORE OBTAINED: {score}</p>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#ee6e4d] text-black font-extrabold rounded-lg shadow-lg shadow-[#ee6e4d]/30 hover:scale-105 active:scale-95 transition-all text-xs tracking-wider"
                >
                  <FiRotateCcw size={16} /> PLAY AGAIN
                </button>
              </>
            ) : !isPlaying ? (
              <>
                <p className="text-[#ee6e4d] text-base font-extrabold tracking-widest mb-1 font-mono">RETRO SNAKE ARCADE</p>
                <p className="text-[#4a9eff] text-[10px] tracking-wider mb-5 animate-pulse font-mono font-bold">★ INSERT COIN TO PLAY ★</p>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-3 bg-[#ee6e4d] text-black font-extrabold rounded-lg shadow-lg shadow-[#ee6e4d]/40 hover:scale-105 active:scale-95 transition-all text-xs tracking-widest"
                >
                  <FiPlay size={16} /> INSERT COIN (START)
                </button>
              </>
            ) : isPaused ? (
              <>
                <p className="text-[#4a9eff] text-xl font-extrabold tracking-widest mb-4 font-mono">GAME PAUSED</p>
                <button
                  onClick={togglePause}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#4a9eff] text-black font-extrabold rounded-lg shadow-lg shadow-[#4a9eff]/30 hover:scale-105 active:scale-95 transition-all text-xs tracking-wider"
                >
                  <FiPlay size={16} /> RESUME GAME
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mt-4 w-[320px] max-w-full justify-between items-center">
        {isPlaying && !isGameOver && (
          <button
            onClick={togglePause}
            className="flex-1 flex justify-center items-center gap-1.5 py-2 rounded-lg border border-white/10 bg-zinc-900/60 hover:bg-zinc-800/80 text-white text-xs tracking-widest font-mono hover:border-[#4a9eff]/30 transition-all active:scale-95 shadow-md"
          >
            {isPaused ? <FiPlay size={14} /> : <FiPause size={14} />} {isPaused ? "RESUME" : "PAUSE"}
          </button>
        )}
        {isPlaying && (
          <button
            onClick={startGame}
            className="flex-1 flex justify-center items-center gap-1.5 py-2 rounded-lg border border-white/10 bg-zinc-900/60 hover:bg-zinc-800/80 text-white text-xs tracking-widest font-mono hover:border-[#ee6e4d]/30 transition-all active:scale-95 shadow-md"
          >
            <FiRotateCcw size={14} /> RESET
          </button>
        )}
      </div>

      {/* Tactile D-pad for touch screen devices */}
      <div className="mt-5 flex flex-col items-center gap-1 lg:hidden">
        <button
          onClick={() => handleDpadPress('UP')}
          disabled={!isPlaying || isPaused || isGameOver}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-[#ee6e4d] shadow-lg shadow-black/40 active:bg-[#ee6e4d] active:text-black transition-all disabled:opacity-20 disabled:pointer-events-none"
        >
          <FiChevronUp size={24} />
        </button>
        <div className="flex gap-8">
          <button
            onClick={() => handleDpadPress('LEFT')}
            disabled={!isPlaying || isPaused || isGameOver}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-[#ee6e4d] shadow-lg shadow-black/40 active:bg-[#ee6e4d] active:text-black transition-all disabled:opacity-20 disabled:pointer-events-none"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={() => handleDpadPress('RIGHT')}
            disabled={!isPlaying || isPaused || isGameOver}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-[#ee6e4d] shadow-lg shadow-black/40 active:bg-[#ee6e4d] active:text-black transition-all disabled:opacity-20 disabled:pointer-events-none"
          >
            <FiChevronRight size={24} />
          </button>
        </div>
        <button
          onClick={() => handleDpadPress('DOWN')}
          disabled={!isPlaying || isPaused || isGameOver}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-[#ee6e4d] shadow-lg shadow-black/40 active:bg-[#ee6e4d] active:text-black transition-all disabled:opacity-20 disabled:pointer-events-none"
        >
          <FiChevronDown size={24} />
        </button>
      </div>
    </div>
  );
};

export default SnakeGame;
