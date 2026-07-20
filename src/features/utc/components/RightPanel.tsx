/**
 * RightPanel Component
 *
 * Displays a stack of customizable UTC clocks in a side panel,
 * plus live astronomical telemetry and timezone meta data.
 * Professional terminal design.
 */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Settings2, Compass, Sun, Moon } from 'lucide-react';
import { useLayoutStore } from '@/features/layout/stores/layout.store';
import { useUTCStore } from '../stores/utc.store';
import { utcToIANATime } from '../services/time-format.service';
import { astronomicalEngine } from '@/engines';

export function RightPanel() {
  const isOpen = useLayoutStore((s) => s.rightPanelOpen);
  const toggle = useLayoutStore((s) => s.toggleRightPanel);
  const formats = useUTCStore((s) => s.formats);
  const utcMs = useUTCStore((s) => s.utcMs);

  // Compute astronomical engine data
  const solar = astronomicalEngine.getSolarPosition(utcMs);
  const moon = astronomicalEngine.getMoonPosition(utcMs);
  const earthRotationRad = astronomicalEngine.getEarthRotationAngle(utcMs);
  const earthRotationDeg = (earthRotationRad * 180) / Math.PI;

  const gmstRad = astronomicalEngine.getGreenwichMeanSiderealTime(utcMs);
  const gmstHoursActual = (gmstRad * 12) / Math.PI;
  const gmstH = Math.floor(gmstHoursActual);
  const gmstM = Math.floor((gmstHoursActual * 60) % 60);
  const gmstS = Math.floor((gmstHoursActual * 3600) % 60);
  const gmstString = `${gmstH.toString().padStart(2, '0')}:${gmstM
    .toString()
    .padStart(2, '0')}:${gmstS.toString().padStart(2, '0')}`;

  const clocks = [
    { label: 'UTC (ZULU)', time: formats.utc.slice(0, 8), highlight: true, sub: 'COORDINATED UNIVERSAL TIME' },
    { label: 'NEW YORK (EST)', time: utcToIANATime(utcMs, 'America/New_York').slice(0, 8), sub: 'EASTERN STANDARD TIME' },
    { label: 'LONDON (BST)', time: utcToIANATime(utcMs, 'Europe/London').slice(0, 8), sub: 'BRITISH SUMMER TIME' },
    { label: 'TOKYO (JST)', time: utcToIANATime(utcMs, 'Asia/Tokyo').slice(0, 8), sub: 'JAPAN STANDARD TIME' },
  ];

  function getMoonPhaseName(phase: number): string {
    if (phase < 0.03 || phase > 0.97) return 'NEW MOON';
    if (phase >= 0.03 && phase < 0.22) return 'WAXING CRESCENT';
    if (phase >= 0.22 && phase < 0.28) return 'FIRST QUARTER';
    if (phase >= 0.28 && phase < 0.47) return 'WAXING GIBBOUS';
    if (phase >= 0.47 && phase < 0.53) return 'FULL MOON';
    if (phase >= 0.53 && phase < 0.72) return 'WANING GIBBOUS';
    if (phase >= 0.72 && phase < 0.78) return 'LAST QUARTER';
    return 'WANING CRESCENT';
  }

  const subSolarLatStr = `${Math.abs(solar.subSolarLatitude).toFixed(4)}°${solar.subSolarLatitude >= 0 ? 'N' : 'S'}`;
  const subSolarLngStr = `${Math.abs(solar.subSolarLongitude).toFixed(4)}°${solar.subSolarLongitude >= 0 ? 'E' : 'W'}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute right-0 top-10 bottom-0 z-40 w-80 max-md:left-0 max-md:top-0 max-md:bottom-0 max-md:w-full max-md:max-w-[min(20rem,calc(100vw-1.5rem))] max-md:rounded-none border-l border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] flex flex-col font-sans"
          style={{
            background: 'linear-gradient(225deg, rgba(15,20,30,0.8) 0%, rgba(5,7,12,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 select-none">
            <div className="flex items-center gap-2 text-white/95">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold tracking-widest uppercase">
                CONTROL_CENTER // TELEMETRY
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1 rounded text-white/40 hover:bg-white/5 hover:text-white transition-all">
                <Settings2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggle}
                className="p-1 rounded text-white/40 hover:bg-white/5 hover:text-white transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Clocks & Telemetry List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
            
            {/* Realtime Clocks Section */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-1">
                {"// WORLD_CHRONOMETER"}
              </div>
              {clocks.map((clock, i) => (
                <div
                  key={i}
                  className={`
                    p-3 rounded border relative overflow-hidden transition-all
                    ${clock.highlight
                      ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]'
                      : 'bg-white/1 border-white/5 hover:border-white/10'}
                  `}
                >
                  {/* Background grid line highlight */}
                  {clock.highlight && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
                  )}

                  <div className="relative z-10 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-white/50 tracking-wider">
                        {clock.label}
                      </span>
                      {clock.highlight && (
                        <span className="flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                          SYS_MASTER
                        </span>
                      )}
                    </div>

                    <div
                      suppressHydrationWarning
                      className={`text-2xl font-bold tracking-tight font-mono ${
                        clock.highlight ? 'text-emerald-400 shadow-glow' : 'text-white/90'
                      }`}
                    >
                      {clock.time}
                    </div>

                    <div className="text-[8px] text-white/30 tracking-widest uppercase">
                      {clock.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Astronomical Telemetry */}
            <div className="pt-4 border-t border-white/8 space-y-3">
              <div className="text-[10px] font-bold text-white/30 tracking-widest uppercase flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-emerald-500/70" />
                {"// ASTRONOMICAL_TELEMETRY"}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/1 border border-white/3 p-3 rounded">
                <div className="space-y-2">
                  <div className="text-white/30">{"// HELIOCENTRIC"}</div>
                  <TechTimeBlock
                    icon={<Sun className="w-2.5 h-2.5 text-amber-500/80" />}
                    label="SOLAR_DEC"
                    value={`${(solar.declination * 180 / Math.PI).toFixed(4)}°`}
                  />
                  <TechTimeBlock
                    label="ERA_ANGLE"
                    value={`${earthRotationDeg.toFixed(4)}°`}
                  />
                  <TechTimeBlock
                    label="GMST_CLOCK"
                    value={gmstString}
                  />
                </div>
                <div className="space-y-2 border-l border-white/5 pl-3">
                  <div className="text-white/30">{"// LUNAR_PHASE"}</div>
                  <TechTimeBlock
                    icon={<Moon className="w-2.5 h-2.5 text-blue-300/80" />}
                    label="LUNAR_ILLUM"
                    value={`${(moon.illumination * 100).toFixed(1)}%`}
                  />
                  <TechTimeBlock
                    label="LUNAR_DIST"
                    value={`${moon.distance.toFixed(2)} ER`}
                  />
                  <TechTimeBlock
                    label="PHASE_TYPE"
                    value={getMoonPhaseName(moon.phase)}
                  />
                </div>
              </div>

              {/* Subsolar projection */}
              <div className="bg-white/1 border border-white/3 p-3 rounded flex flex-col gap-1.5">
                <div className="text-[9px] font-bold text-white/50 tracking-wider">
                  SUBSOLAR_COORDINATES
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-white/30">LATITUDE</span>
                    <span suppressHydrationWarning className="text-xs font-semibold text-emerald-400">
                      {subSolarLatStr}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-white/30">LONGITUDE</span>
                    <span suppressHydrationWarning className="text-xs font-semibold text-emerald-400">
                      {subSolarLngStr}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Systems Technical Timestamps */}
            <div className="pt-4 border-t border-white/8 space-y-2">
              <div className="text-[10px] font-bold text-white/30 tracking-widest uppercase">
                {"// SYSTEM_TIMESTAMPS"}
              </div>
              <div className="bg-white/1 border border-white/3 p-3 rounded space-y-2">
                <TechTimeBlock label="UNIX_TIMESTAMP" value={formats.unixTimestamp.toString()} />
                <TechTimeBlock label="JULIAN_DATE" value={formats.julianDate} />
                <TechTimeBlock label="GPS_TIME_SEC" value={formats.gpsTime} />
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TechTimeBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[8px] font-mono text-white/40 tracking-wider uppercase flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div suppressHydrationWarning className="text-[11px] font-mono font-medium text-white/85 truncate">
        {value}
      </div>
    </div>
  );
}
