/**
 * Loading Fallback
 *
 * Shown by Next.js Suspense while the page loads.
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-[#000308]">
      <div className="flex flex-col items-center gap-6">
        {/* Orbital loading animation */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-white/5" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400/50 animate-spin"
            style={{ animationDuration: '1.2s' }}
          />
          <div
            className="absolute inset-3 rounded-full border border-transparent border-t-cyan-400/30 animate-spin"
            style={{ animationDuration: '2s', animationDirection: 'reverse' }}
          />
          <div
            className="absolute inset-6 rounded-full border border-transparent border-t-emerald-300/20 animate-spin"
            style={{ animationDuration: '3s' }}
          />
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-400/60 animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-lg font-semibold tracking-wider text-white/80">
            TraderUTC Earth
          </h1>
          <p className="text-xs font-mono text-white/30 tracking-widest uppercase">
            Initializing Global Market Intelligence
          </p>
        </div>
      </div>
    </div>
  );
}
