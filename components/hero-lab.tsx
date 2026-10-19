"use client";
import { useState, type CSSProperties } from "react";
import { Code2, Pause, Play, Plus, RotateCcw } from "lucide-react";

const palettes = [
  { name: "Cobalt", color: "#4668f5", light: "#a7b9ff" },
  { name: "Coral", color: "#e3754f", light: "#f6bc9d" },
  { name: "Mint", color: "#299482", light: "#8fd5bc" },
];

export default function HeroLab() {
  const [planets, setPlanets] = useState(3);
  const [speed, setSpeed] = useState(1);
  const [palette, setPalette] = useState(0);
  const [running, setRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const theme = palettes[palette];
  function reset() {
    setPlanets(3);
    setSpeed(1);
    setPalette(0);
    setRunning(false);
    setGeneration((value) => value + 1);
  }
  return (
    <div className="orbit-lab">
      <div className="orbit-lab-heading"><span><i /> A LITTLE LAB. A LOT OF POSSIBILITY.</span><Code2 size={18} aria-hidden="true" /></div>
      <div className="orbit-title"><div><h2>Make a little universe.</h2><p>Change the rules. See what happens.</p></div><span className="lab-example">TRY IT</span></div>
      <div className="orbit-stage" style={{ "--planet-color": theme.color, "--planet-light": theme.light } as CSSProperties}>
        <div className="orbit-stage-label"><span>ORBIT LAB</span><span>{String(planets).padStart(2, "0")} PLANETS</span></div>
        <svg viewBox="0 0 360 230" role="img" aria-label={`${planets} ${theme.name.toLowerCase()} planets around a star. ${running ? "Orbit running" : "Orbit paused"}.`}>
          <defs><radialGradient id="star-glow"><stop stopColor="#ffcc7b" stopOpacity=".4"/><stop offset="1" stopColor="#ffcc7b" stopOpacity="0"/></radialGradient></defs>
          {[[24,42],[316,53],[48,180],[323,187],[95,25],[275,211],[338,114],[25,107]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%3===0?1.6:1} fill="#b0bfd3" />)}
          <circle cx="180" cy="115" r="39" fill="url(#star-glow)" />
          <circle cx="180" cy="115" r="12" fill="#efa65a" />
          <path d="M180 96v5m0 28v5m-19-19h5m28 0h5m-32-13 4 4m18 18 4 4m-26 0 4-4m18-18 4-4" stroke="#efa65a" strokeWidth="2" strokeLinecap="round" />
          {Array.from({ length: planets }, (_, i) => {
            const radius = 30 + i * 17;
            return <g key={`${generation}-${i}`}>
              <circle cx="180" cy="115" r={radius} fill="none" stroke="#d6e0ee" strokeDasharray={i%2 ? "3 5" : undefined} />
              <g className="orbit-revolution" style={{ animationDuration: `${(12 + i * 6) / speed}s`, animationPlayState: running ? "running" : "paused" } as CSSProperties}>
                <g transform={`rotate(${i * 137 + 25} 180 115)`}>
                  <circle className="orbit-planet-halo" cx={180 + radius} cy="115" r={i%2 ? 12 : 10} />
                  <circle className="orbit-planet" cx={180 + radius} cy="115" r={i%2 ? 7 : 5} />
                </g>
              </g>
            </g>;
          })}
        </svg>
        <div className="orbit-stage-bottom"><span className={running ? "orbit-live active" : "orbit-live"}><i />{running ? "Your universe is running" : "Orbits paused. Ready when you are."}</span><span className="orbit-speed-readout">{speed}×</span></div>
      </div>
      <div className="orbit-controls">
        <div className="orbit-settings">
          <fieldset className="orbit-colors"><legend>Planet colour</legend><div>{palettes.map((item, i) => <button key={item.name} type="button" aria-label={`${item.name} planets`} aria-pressed={palette === i} onClick={() => setPalette(i)} style={{ "--swatch": item.color } as CSSProperties}><span />{palette === i && <span className="swatch-check" aria-hidden="true">✓</span>}</button>)}</div></fieldset>
          <label className="orbit-speed">Orbit speed <span>{speed}×</span><input aria-label="Orbit speed" type="range" min="0.5" max="2" step="0.5" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></label>
        </div>
        <div className="orbit-actions">
          <button className="orbit-run" type="button" onClick={() => setRunning((value) => !value)}>{running ? <Pause size={15} /> : <Play size={15} />}{running ? "Pause orbits" : "Launch orbits"}</button>
          <button className="orbit-add" type="button" disabled={planets >= 5} onClick={() => setPlanets((value) => Math.min(5, value + 1))}><Plus size={15} />{planets >= 5 ? "All 5 in orbit" : "Add a planet"}</button>
          <button className="orbit-reset" type="button" aria-label="Reset the orbit lab" title="Reset the orbit lab" onClick={reset}><RotateCcw size={16} /></button>
        </div>
      </div>
      <div className="orbit-code"><span>YOUR CHANGES, IN CODE</span><code><b>orbit</b>({"{ "}planets: <em>{planets}</em>, speed: <em>{speed}</em>, colour: <em>"{theme.name.toLowerCase()}"</em>{" }"})</code></div>
      <p className="orbit-note" aria-live="polite">{planets === 5 ? "Five planets. Your own tiny system. Try a different speed." : "A few variables. A whole different world. Make it yours."}</p>
      <p className="orbit-motion-note">Reduced motion is on. Explore colours and planets with the orbits held still.</p>
    </div>
  );
}
