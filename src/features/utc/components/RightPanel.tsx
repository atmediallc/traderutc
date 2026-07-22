/**
 * RightPanel Component
 *
 * Displays a stack of customizable UTC clocks in a side panel,
 * plus live astronomical telemetry and timezone meta data.
 * Professional terminal design.
 */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Settings2, Compass, Sun, Moon, Radio } from 'lucide-react';
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
        <motion.aside
          initial={{ opacity: 0, x: 360 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 360 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-4 top-[98px] bottom-10 z-40 w-80 max-md:left-0 max-md:top-[84px] max-md:bottom-0 max-md:w-full max-md:max-w-[min(20rem,calc(100vw-1.5rem))] max-md:rounded-none rounded-[16px] border border-white/10 shadow-[-12px_0_40px_rgba(0,0,0,0.8)] flex flex-col font-sans overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(8,12,20,0.92) 0%, rgba(3,5,10,0.98) 100%)',
            backdropFilter: 'blur(32px) saturate(190%)',
            WebkitBackdropFilter: 'blur(32px) saturate(190%)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 select-none shrink-0">
            <div className="flex items-center gap-2.5 text-white/95">
              <div className="w-5 h-5 rounded-[4px] bg-[#00E5A8]/15 border border-[#00E5A8]/25 flex items-center justify-center">
                <Clock className="w-3 h-3 text-[#00E5A8]" />
              </div>
              <div>
                <h2 className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/90">
                  Control Center
                </h2>
                <p className="text-[8px] tracking-[0.2em] uppercase text-white/30">
                  Telemetry & Chronometer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded-[6px] text-white/30 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                aria-label="Settings"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggle}
                className="p-1.5 rounded-[6px] text-white/30 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                aria-label="Close panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Clocks & Telemetry List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
            {/* Realtime Clocks Section */}
            <div className="space-y-2">
              <div className="text-[9px] font-mono font-bold text-[#00E5A8] tracking-[0.2em] uppercase flex items-center gap-1.5 mb-2">
                <Radio className="w-3 h-3 text-[#00E5A8]" />
                World Chronometer
              </div>
              {clocks.map((clock, i) => (
                <div
                  key={i}
                  className={`
                    p-3 rounded-[12px] border relative overflow-hidden transition-all duration-200
                    ${clock.highlight
                      ? 'bg-[#00E5A8]/8 border-[#00E5A8]/30 shadow-[0_4px_16px_rgba(0,229,168,0.1)]'
                      : 'bg-[#12161E]/70 border-white/8 hover:border-white/15'}
                  `}
                >
                  <div className="relative z-10 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-semibold text-[#94A3B8] tracking-wider">
                        {clock.label}
                      </span>
                      {clock.highlight && (
                        <span className="flex items-center gap-1 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#00E5A8]/15 border border-[#00E5A8]/30 text-[#00E5A8]">
                          <span className="w-1 h-1 rounded-full bg-[#00E5A8] animate-ping" />
                          SYS MASTER
                        </span>
                      )}
                    </div>

                    <div
                      suppressHydrationWarning
                      className={`text-xl font-bold tracking-tight font-mono tabular-nums ${
                        clock.highlight ? 'text-white drop-shadow-[0_0_12px_rgba(0,229,168,0.4)]' : 'text-white/90'
                      }`}
                    >
                      {clock.time}
                    </div>

                    <div className="text-[8px] font-mono text-[#94A3B8]/60 tracking-widest uppercase">
                      {clock.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Astronomical Telemetry */}
            <div className="pt-3 border-t border-white/8 space-y-3">
              <div className="text-[9px] font-mono font-bold text-[#5EE6FF] tracking-[0.2em] uppercase flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-[#5EE6FF]" />
                Astronomical Telemetry
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#12161E]/80 border border-white/8 p-3 rounded-[12px]">
                <div className="space-y-2">
                  <div className="text-[8px] font-mono text-white/30 uppercase tracking-wider">Heliocentric</div>
                  <TechTimeBlock
                    icon={<Sun className="w-2.5 h-2.5 text-amber-400" />}
                    label="SOLAR DEC"
                    value={`${(solar.declination * 180 / Math.PI).toFixed(4)}°`}
                  />
                  <TechTimeBlock
                    label="ERA ANGLE"
                    value={`${earthRotationDeg.toFixed(4)}°`}
                  />
                  <TechTimeBlock
                    label="GMST CLOCK"
                    value={gmstString}
                  />
                </div>
                <div className="space-y-2 border-l border-white/8 pl-3">
                  <div className="text-[8px] font-mono text-white/30 uppercase tracking-wider">Lunar Phase</div>
                  <TechTimeBlock
                    icon={<Moon className="w-2.5 h-2.5 text-sky-300" />}
                    label="LUNAR ILLUM"
                    value={`${(moon.illumination * 100).toFixed(1)}%`}
                  />
                  <TechTimeBlock
                    label="LUNAR DIST"
                    value={`${moon.distance.toFixed(2)} ER`}
                  />
                  <TechTimeBlock
                    label="PHASE TYPE"
                    value={getMoonPhaseName(moon.phase)}
                  />
                </div>
              </div>

              {/* Subsolar projection */}
              <div className="bg-[#12161E]/80 border border-white/8 p-3 rounded-[12px] flex flex-col gap-1.5">
                <div className="text-[9px] font-mono font-semibold text-[#94A3B8] tracking-wider uppercase">
                  Subsolar Coordinates
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-white/30">LATITUDE</span>
                    <span suppressHydrationWarning className="text-xs font-mono font-bold text-[#00E5A8] tabular-nums">
                      {subSolarLatStr}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-white/30">LONGITUDE</span>
                    <span suppressHydrationWarning className="text-xs font-mono font-bold text-[#00E5A8] tabular-nums">
                      {subSolarLngStr}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Systems Technical Timestamps */}
            <div className="pt-3 border-t border-white/8 space-y-2">
              <div className="text-[9px] font-mono font-bold text-[#94A3B8] tracking-[0.2em] uppercase">
                System Timestamps
              </div>
              <div className="bg-[#12161E]/80 border border-white/8 p-3 rounded-[12px] space-y-2">
                <TechTimeBlock label="UNIX TIMESTAMP" value={formats.unixTimestamp.toString()} />
                <TechTimeBlock label="JULIAN DATE" value={formats.julianDate} />
                <TechTimeBlock label="GPS TIME SEC" value={formats.gpsTime} />
              </div>
            </div>
          </div>
        </motion.aside>
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
      <div className="text-[8px] font-mono text-[#94A3B8] tracking-wider uppercase flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div suppressHydrationWarning className="text-[11px] font-mono font-bold text-white/90 tabular-nums truncate">
        {value}
      </div>
    </div>
  );
}
