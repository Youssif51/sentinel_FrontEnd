const STICKERS = [
  // Gaming controllers & devices
  { emoji: '🎮', top: '6%',   left: '4%',  rot: '-12deg', delay: '0s',   size: '24px', dur: '7s'  },
  { emoji: '🕹️', top: '14%',  left: '89%', rot: '8deg',   delay: '1.2s', size: '20px', dur: '8s'  },
  { emoji: '👾', top: '28%',  left: '78%', rot: '-6deg',  delay: '2.4s', size: '22px', dur: '6.5s'},
  { emoji: '🖥️', top: '38%',  left: '7%',  rot: '10deg',  delay: '0.6s', size: '20px', dur: '9s'  },
  { emoji: '🖱️', top: '52%',  left: '94%', rot: '-10deg', delay: '3.1s', size: '18px', dur: '7.5s'},
  { emoji: '⌨️', top: '62%',  left: '2%',  rot: '7deg',   delay: '1.8s', size: '20px', dur: '8.5s'},
  // Trophies & achievements
  { emoji: '🏆', top: '72%',  left: '84%', rot: '-14deg', delay: '0.9s', size: '22px', dur: '6s'  },
  { emoji: '💎', top: '82%',  left: '16%', rot: '9deg',   delay: '2.7s', size: '20px', dur: '7s'  },
  { emoji: '⭐', top: '88%',  left: '70%', rot: '-5deg',  delay: '1.5s', size: '18px', dur: '9.5s'},
  { emoji: '🥇', top: '20%',  left: '46%', rot: '11deg',  delay: '3.8s', size: '18px', dur: '8s'  },
  // Combat & action
  { emoji: '⚔️', top: '44%',  left: '57%', rot: '-8deg',  delay: '2.1s', size: '20px', dur: '7.5s'},
  { emoji: '🛡️', top: '76%',  left: '49%', rot: '13deg',  delay: '0.3s', size: '20px', dur: '6.5s'},
  { emoji: '🎯', top: '8%',   left: '62%', rot: '6deg',   delay: '1.0s', size: '18px', dur: '8s'  },
  { emoji: '⚡', top: '58%',  left: '32%', rot: '-4deg',  delay: '4.2s', size: '20px', dur: '7s'  },
  { emoji: '🔥', top: '90%',  left: '90%', rot: '-16deg', delay: '3.5s', size: '22px', dur: '6s'  },
  // Tech & futuristic
  { emoji: '🤖', top: '32%',  left: '22%', rot: '5deg',   delay: '2.9s', size: '20px', dur: '8.5s'},
  { emoji: '🔮', top: '16%',  left: '34%', rot: '-9deg',  delay: '1.6s', size: '18px', dur: '7s'  },
  { emoji: '🚀', top: '48%',  left: '72%', rot: '14deg',  delay: '0.7s', size: '20px', dur: '9s'  },
  { emoji: '💻', top: '66%',  left: '60%', rot: '-7deg',  delay: '3.3s', size: '20px', dur: '7.5s'},
  { emoji: '🎲', top: '94%',  left: '38%', rot: '8deg',   delay: '4.6s', size: '18px', dur: '8s'  },
];

export function AuroraBg() {
  return (
    <>
      {/* Aurora orbs */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-orb-3" />
        <div className="aurora-orb-4" />
        <div className="aurora-orb-5" />
        <div className="aurora-grain" />
      </div>

      {/* Gaming stickers */}
      <div className="stickers-layer" aria-hidden="true">
        {STICKERS.map((s, i) => (
          <span
            key={i}
            className="sticker"
            style={{
              top: s.top,
              left: s.left,
              fontSize: s.size,
              '--r': s.rot,
              transform: `rotate(${s.rot})`,
              animationDelay: s.delay,
              animationDuration: s.dur,
            } as React.CSSProperties}
          >
            {s.emoji}
          </span>
        ))}
      </div>
    </>
  );
}
