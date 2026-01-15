import React, { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Waves, Activity } from "lucide-react";

/**
 * Minimal ambient audio prototype.
 *
 * Important: This intentionally avoids astrology language and removes emoji usage.
 * The generator uses a cyclical time-based parameter set to demonstrate how a
 * small, legible system can drive an expressive audio output.
 */

type CycleData = {
  cycleName: string;
  percent: number; // 0..1
  intensity: number; // 0..1
  secondsInCycle: number;
};

const CYCLE_SECONDS = 300; // 5-minute loop

const calculateCycle = (date: Date): CycleData => {
  const seconds = Math.floor(date.getTime() / 1000);
  const secondsInCycle = seconds % CYCLE_SECONDS;
  const percent = secondsInCycle / CYCLE_SECONDS;

  // Smooth intensity curve: 0..1..0 across the cycle
  const intensity = 0.5 - 0.5 * Math.cos(percent * Math.PI * 2);

  const cycleName =
    percent < 0.25
      ? "Ignition"
      : percent < 0.5
        ? "Lift"
        : percent < 0.75
          ? "Drift"
          : "Return";

  return { cycleName, percent, intensity, secondsInCycle };
};

const cycleToParams = (cycle: CycleData) => {
  // Base frequency anchored slightly below A4 for warmth.
  const base = 392; // G4

  // Five-note palette (pentatonic-ish) chosen for stability.
  const ratios = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3];
  const idx = Math.floor(cycle.percent * ratios.length) % ratios.length;
  const note = ratios[idx];

  // Intensity controls octave range and modulation.
  const octave = Math.pow(2, -1 + cycle.intensity * 1.2);
  const root = base * note * octave;

  return {
    root,
    fifth: root * 1.5,
    octave: root * 2,
    third: root * 1.25,
    lfoRate: 0.05 + cycle.intensity * 0.25,
    filterCutoff: 250 + cycle.intensity * 2400,
    reverbMix: 0.25 + (1 - cycle.intensity) * 0.35,
  };
};

interface MoonTunerPlayerProps {
  compact?: boolean;
}

const MoonTunerPlayer: React.FC<MoonTunerPlayerProps> = ({ compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [cycle, setCycle] = useState<CycleData>(() => calculateCycle(new Date()));
  const [params, setParams] = useState(() => cycleToParams(cycle));
  const [waveformData, setWaveformData] = useState<number[]>(new Array(64).fill(0));
  const [currentTime, setCurrentTime] = useState(new Date());

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update cycle data every 2 seconds for a responsive-but-calm evolution.
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const c = calculateCycle(now);
      setCycle(c);
      setParams(cycleToParams(c));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyserRef.current = analyser;

    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Ambient stack
    const oscTypes: OscillatorType[] = ["sine", "sine", "triangle", "sine"];
    const multipliers = [1, 1.5, 2, 0.5];
    const gains = [0.28, 0.14, 0.09, 0.18];

    oscTypes.forEach((type, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = params.root * multipliers[i];
      g.gain.value = gains[i];
      osc.connect(g);
      g.connect(masterGain);
      oscillatorsRef.current.push(osc);
    });

    // Subtle LFO
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = params.lfoRate;
    lfoGain.gain.value = 10;
    lfo.connect(lfoGain);
    oscillatorsRef.current.forEach((osc) => lfoGain.connect(osc.frequency));
    oscillatorsRef.current.push(lfo);
  }, [params.root, params.lfoRate, volume]);

  const startAudio = useCallback(() => {
    if (!audioContextRef.current) initAudio();
    if (audioContextRef.current?.state === "suspended") audioContextRef.current.resume();

    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.start();
      } catch {
        // already started
      }
    });
    setIsPlaying(true);
  }, [initAudio]);

  const stopAudio = useCallback(() => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // already stopped
      }
    });
    oscillatorsRef.current = [];

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) stopAudio();
    else startAudio();
  }, [isPlaying, startAudio, stopAudio]);

  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Update oscillator frequencies as params evolve
  useEffect(() => {
    if (!isPlaying || !audioContextRef.current) return;

    const freqs = [params.root * 1, params.root * 1.5, params.root * 2, params.root * 0.5];
    oscillatorsRef.current.slice(0, 4).forEach((osc, i) => {
      osc.frequency.setTargetAtTime(freqs[i], audioContextRef.current!.currentTime, 0.5);
    });
  }, [params, isPlaying]);

  // Waveform visualization
  useEffect(() => {
    const update = () => {
      if (analyserRef.current && isPlaying) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(dataArray);
        setWaveformData(Array.from(dataArray));
      }
      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  // Canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth * dpr;
    const height = canvas.clientHeight * dpr;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // hairline waveform
    ctx.lineWidth = 2 * dpr;
    ctx.strokeStyle = "rgba(184, 134, 11, 0.55)"; // warm gold
    ctx.beginPath();
    waveformData.forEach((v, i) => {
      const x = (i / (waveformData.length - 1)) * width;
      const y = (v / 255) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [waveformData]);

  const containerClass = compact
    ? "rounded-2xl border border-black/10 bg-white/[0.6] backdrop-blur-md"
    : "rounded-3xl border border-black/10 bg-white/[0.6] backdrop-blur-md";

  return (
    <div className={`${containerClass} overflow-hidden`}> 
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full border border-black/10 bg-gradient-to-br from-black to-black/60 flex items-center justify-center text-white">
                <Waves size={18} />
              </div>
              <div>
                <p className="text-xs tracking-[0.22em] uppercase text-black/50">Audio prototype</p>
                <h3 className="text-lg sm:text-xl font-medium tracking-tight text-black">Parametric ambient generator</h3>
              </div>
            </div>
            <p className="mt-3 max-w-xl text-sm sm:text-base text-black/60 leading-relaxed">
              A small, legible system driving a responsive soundbed. Built to demonstrate how structure can create feeling—without relying on spectacle.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="h-10 w-10 rounded-full border border-black/10 hover:border-black/20 bg-white/70 hover:bg-white transition-colors flex items-center justify-center text-black/70"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={togglePlay}
              className="h-10 px-4 rounded-full border border-black/10 hover:border-black/20 bg-gradient-to-r from-[#B8860B]/90 to-[#D4AF37]/90 text-black font-medium tracking-wide hover:brightness-105 transition"
            >
              {isPlaying ? (
                <span className="inline-flex items-center gap-2"><Pause size={16} /> Stop</span>
              ) : (
                <span className="inline-flex items-center gap-2"><Play size={16} /> Play</span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
            <p className="text-[11px] tracking-[0.22em] uppercase text-black/45">Cycle</p>
            <p className="mt-1 text-sm font-medium text-black">{cycle.cycleName}</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
            <p className="text-[11px] tracking-[0.22em] uppercase text-black/45">Intensity</p>
            <p className="mt-1 text-sm font-medium text-black">{Math.round(cycle.intensity * 100)}%</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
            <p className="text-[11px] tracking-[0.22em] uppercase text-black/45">Updated</p>
            <p className="mt-1 text-sm font-medium text-black">{currentTime.toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/10 bg-white/70 p-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-[11px] tracking-[0.22em] uppercase text-black/45">Signal</p>
            <span className="inline-flex items-center gap-2 text-xs text-black/55">
              <Activity size={14} /> live
            </span>
          </div>
          <div className="h-16 sm:h-20">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-black/55">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-[#B8860B]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoonTunerPlayer;
