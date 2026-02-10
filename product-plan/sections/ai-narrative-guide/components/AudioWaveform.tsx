interface AudioWaveformProps {
  isPlaying: boolean
}

export function AudioWaveform({ isPlaying }: AudioWaveformProps) {
  return (
    <div className="flex items-center gap-[2px] h-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-[2px] rounded-full bg-red-500 transition-all duration-150"
          style={{
            height: isPlaying ? `${6 + Math.sin(i * 1.2) * 6}px` : '3px',
            animation: isPlaying
              ? `waveform-bar 0.8s ease-in-out ${i * 0.1}s infinite alternate`
              : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes waveform-bar {
          0% { height: 3px; }
          100% { height: 12px; }
        }
      `}</style>
    </div>
  )
}
