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
          className="absolute right-6 top-[124px] bottom-12 z-40 w-[24rem] md:w-[26rem] max-md:left-0 max-md:top-[90px] max-md:bottom-0 max-md:w-full max-md:rounded-none rounded-2xl border border-white/12 shadow-[-16px_0_50px_rgba(0,0,0,0.8)] flex flex-col font-sans overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(8,12,20,0.95) 0%, rgba(3,5,10,0.98) 100%)',
            backdropFilter: 'blur(36px) saturate(190%)',
            WebkitBackdropFilter: 'blur(36px) saturate(190%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 select-none shrink-0">
            <div className="flex items-center gap-3 text-white">
              <div className="w-6 h-6 rounded-lg bg-[#00E5A8]/15 border border-[#00E5A8]/30 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,168,0.25)]">
                <Clock className="w-3.5 h-3.5 text-[#00E5A8]" />
              </div>
              <div>
                <h2 className="text-xs font-bold tracking-wider uppercase text-white/95">
                  Control Center
                </h2>
                <p className="text-[9px] tracking-widest uppercase font-semibold text-[#94A3B8]">
                  Telemetry & Chronometer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                className="p-1.5 rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                aria-label="Settings"
              >
                <Settings2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggle}
                className="p-1.5 rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Clocks & Telemetry List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
            {/* Realtime Clocks Section */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-[#00E5A8] tracking-wider uppercase flex items-center gap-2 mb-2">
                <Radio className="w-3.5 h-3.5 text-[#00E5A8]" />
                World Chronometer
              </div>
              {clocks.map((clock, i) => (
                <div
                  key={i}
                  className={`
                    p-3.5 rounded-xl border relative overflow-hidden transition-all duration-200
                    ${clock.highlight
                      ? 'bg-[#00E5A8]/10 border-[#00E5A8]/40 shadow-[0_4px_20px_rgba(0,229,168,0.15)]'
                      : 'bg-[#12161E]/80 border-white/10 hover:border-white/20'}
                  `}
                >
                  <div className="relative z-10 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#94A3B8] tracking-wider">
                        {clock.label}
                      </span>
                      {clock.highlight && (
                        <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#00E5A8]/20 border border-[#00E5A8]/40 text-[#00E5A8]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] animate-ping" />
                          SYS MASTER
                        </span>
                      )}
                    </div>

                    <div
                      suppressHydrationWarning
                      className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${
                        clock.highlight ? 'text-white drop-shadow-[0_0_16px_rgba(0,229,168,0.5)]' : 'text-white/95'
                      }`}
                    >
                      {clock.time}
                    </div>

                    <div className="text-[9px] font-semibold text-[#94A3B8]/70 tracking-widest uppercase">
                      {clock.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Astronomical Telemetry */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="text-xs font-bold text-[#5EE6FF] tracking-wider uppercase flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-[#5EE6FF]" />
                Astronomical Telemetry
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-[#12161E]/90 border border-white/10 p-4 rounded-xl">
                <div className="space-y-2.5">
                  <div className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider">Heliocentric</div>
                  <TechTimeBlock
                    icon={<Sun className="w-3 h-3 text-amber-400" />}
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
                <div className="space-y-2.5 border-l border-white/10 pl-3">
                  <div className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider">Lunar Phase</div>
                  <TechTimeBlock
                    icon={<Moon className="w-3 h-3 text-sky-300" />}
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
              <div className="bg-[#12161E]/90 border border-white/10 p-4 rounded-xl flex flex-col gap-2">
                <div className="text-xs font-bold text-white/90 tracking-wider uppercase">
                  Subsolar Coordinates
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-[#94A3B8]">LATITUDE</span>
                    <span suppressHydrationWarning className="text-sm font-mono font-bold text-[#00E5A8] tabular-nums mt-0.5">
                      {subSolarLatStr}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-[#94A3B8]">LONGITUDE</span>
                    <span suppressHydrationWarning className="text-sm font-mono font-bold text-[#00E5A8] tabular-nums mt-0.5">
                      {subSolarLngStr}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Systems Technical Timestamps */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="text-xs font-bold text-[#94A3B8] tracking-wider uppercase">
                System Timestamps
              </div>
              <div className="bg-[#12161E]/90 border border-white/10 p-4 rounded-xl space-y-2.5">
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
      <div className="text-[9px] font-semibold text-[#94A3B8] tracking-wider uppercase flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div suppressHydrationWarning className="text-xs font-mono font-bold text-white tabular-nums truncate">
        {value}
      </div>
    </div>
  );
}
