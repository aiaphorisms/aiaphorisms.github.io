import { useState, useEffect, useRef } from "react";

const SECTIONS = [
  "Overview",
  "Labor Theory of Value",
  "Reproduction Schemas",
  "Transformation Problem",
  "Capital Flow Dynamics",
  "Where the Math Breaks",
  "Toward Better Models",
];

const KaTeX_CSS = `@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,400&display=swap');`;

function MathBlock({ tex, label }) {
  return (
    <div style={{
      background: "rgba(45,25,15,0.04)",
      border: "1px solid rgba(120,80,40,0.15)",
      borderLeft: "3px solid rgba(140,70,30,0.5)",
      borderRadius: 4,
      padding: "16px 20px",
      margin: "16px 0",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 14,
      lineHeight: 1.7,
      overflowX: "auto",
      position: "relative",
    }}>
      {label && (
        <div style={{
          position: "absolute", top: -10, left: 16,
          background: "#faf6f1", padding: "0 8px",
          fontSize: 11, color: "rgba(140,70,30,0.7)",
          fontFamily: "'Crimson Pro', serif", fontStyle: "italic",
        }}>{label}</div>
      )}
      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{tex}</pre>
    </div>
  );
}

function SimPanel({ title, children, color = "rgba(140,70,30,0.7)" }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid rgba(0,0,0,0.1)",
      borderRadius: 6,
      padding: 20,
      margin: "16px 0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{
        fontFamily: "'Crimson Pro', serif",
        fontSize: 16, fontWeight: 600,
        color, marginBottom: 12,
        borderBottom: `1px solid ${color}33`,
        paddingBottom: 8,
      }}>{title}</div>
      {children}
    </div>
  );
}

/* ─── Simulation: LTV vs Market Price ─── */
function LTVSimulation() {
  const [supplyShift, setSupplyShift] = useState(0);
  const [demandShift, setDemandShift] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    // axes
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 10); ctx.lineTo(50, H - 30); ctx.lineTo(W - 10, H - 30);
    ctx.stroke();
    ctx.fillStyle = "#555";
    ctx.font = "11px 'Crimson Pro', serif";
    ctx.fillText("Price", 8, 20);
    ctx.fillText("Quantity", W - 60, H - 12);

    const ox = 50, oy = H - 30, gw = W - 70, gh = H - 50;

    // Supply curve (upward sloping)
    ctx.strokeStyle = "#c0392b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = ox + (i / 100) * gw;
      const baseY = gh - (i / 100) * gh * 0.8;
      const y = oy - baseY + supplyShift * 15;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = "#c0392b";
    ctx.fillText("Supply (S)", W - 65, oy - gh * 0.75 + supplyShift * 15);

    // Demand curve (downward sloping)
    ctx.strokeStyle = "#2980b9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = ox + (i / 100) * gw;
      const baseY = gh * 0.85 - (i / 100) * gh * 0.8;
      const y = oy - baseY - demandShift * 15;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = "#2980b9";
    ctx.fillText("Demand (D)", W - 75, oy - gh * 0.1 - demandShift * 15);

    // LTV line (horizontal — labor value is fixed)
    const ltvY = oy - gh * 0.45;
    ctx.strokeStyle = "#27ae60";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(ox, ltvY); ctx.lineTo(ox + gw, ltvY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#27ae60";
    ctx.fillText("Labor Value (fixed)", ox + gw * 0.35, ltvY - 8);

    // Equilibrium point
    // S: y = (i/100) * 0.8 * gh - supplyShift*15 → from bottom
    // D: y = 0.85*gh - (i/100)*0.8*gh + demandShift*15 → from bottom
    // equil: (i/100)*0.8 - supplyShift*15/gh = 0.85 - (i/100)*0.8 + demandShift*15/gh
    const ss = supplyShift * 15 / gh;
    const ds = demandShift * 15 / gh;
    const eqFrac = (0.85 + ds + ss) / 1.6;
    const eqX = ox + eqFrac * gw;
    const eqPriceFromBottom = eqFrac * 0.8 * gh - supplyShift * 15;
    const eqY = oy - eqPriceFromBottom;

    if (eqFrac > 0 && eqFrac < 1) {
      ctx.fillStyle = "#e67e22";
      ctx.beginPath();
      ctx.arc(eqX, eqY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e67e22";
      ctx.font = "bold 12px 'Crimson Pro', serif";
      ctx.fillText("Market Price", eqX + 8, eqY - 8);

      // Show gap
      const gap = Math.abs(eqY - ltvY);
      if (gap > 5) {
        ctx.strokeStyle = "#e67e2288";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(eqX, eqY);
        ctx.lineTo(eqX, ltvY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#e67e22";
        ctx.fillText(
          eqY < ltvY ? "Price > Value" : "Price < Value",
          eqX + 8, (eqY + ltvY) / 2
        );
      }
    }
  }, [supplyShift, demandShift]);

  return (
    <SimPanel title="Interactive: Labor Value vs. Market Price Divergence">
      <p style={{ fontSize: 13, color: "#555", margin: "0 0 12px", fontFamily: "'Source Serif 4', serif" }}>
        Marx assumed market prices oscillate around labor values. Shift supply and demand to see how equilibrium price diverges from the fixed labor-determined value — a core empirical weakness.
      </p>
      <canvas ref={canvasRef} width={460} height={280} style={{ width: "100%", maxWidth: 460, background: "#faf6f1", borderRadius: 4 }} />
      <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
        <label style={{ fontSize: 13, fontFamily: "'Crimson Pro', serif" }}>
          Supply Shift: <input type="range" min={-5} max={5} value={supplyShift} onChange={e => setSupplyShift(+e.target.value)} style={{ verticalAlign: "middle" }} /> {supplyShift > 0 ? `+${supplyShift}` : supplyShift}
        </label>
        <label style={{ fontSize: 13, fontFamily: "'Crimson Pro', serif" }}>
          Demand Shift: <input type="range" min={-5} max={5} value={demandShift} onChange={e => setDemandShift(+e.target.value)} style={{ verticalAlign: "middle" }} /> {demandShift > 0 ? `+${demandShift}` : demandShift}
        </label>
      </div>
    </SimPanel>
  );
}

/* ─── Simulation: Reproduction Schema ─── */
function ReproductionSim() {
  const [periods, setPeriods] = useState(5);
  const [rateS, setRateS] = useState(1.0); // s/v for Dept I
  const [orgComp, setOrgComp] = useState(4); // c/v for Dept I

  const simulate = () => {
    let results = [];
    let c1 = 4000, v1 = 1000, c2 = 1500, v2 = 750;
    const sv = rateS;
    for (let t = 0; t <= periods; t++) {
      const s1 = v1 * sv;
      const s2 = v2 * sv;
      const w1 = c1 + v1 + s1;
      const w2 = c2 + v2 + s2;
      const balanceCondition = v1 + s1; // should equal c2
      const imbalance = balanceCondition - c2;
      results.push({ t, c1, v1, s1, w1, c2, v2, s2, w2, balanceCondition, imbalance });
      // Simple expanded reproduction
      const reinvest1 = s1 * 0.5;
      const reinvest2 = s2 * 0.5;
      c1 = c1 + reinvest1 * (orgComp / (orgComp + 1));
      v1 = v1 + reinvest1 * (1 / (orgComp + 1));
      c2 = c2 + reinvest2 * 0.6;
      v2 = v2 + reinvest2 * 0.4;
    }
    return results;
  };

  const data = simulate();

  return (
    <SimPanel title="Interactive: Marx's Two-Department Reproduction Schema">
      <p style={{ fontSize: 13, color: "#555", margin: "0 0 12px", fontFamily: "'Source Serif 4', serif" }}>
        Dept I produces means of production, Dept II produces consumption goods. The balance condition v₁ + s₁ = c₂ must hold for equilibrium. Adjust parameters to see how easily the system becomes imbalanced.
      </p>
      <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
        <label style={{ fontSize: 13, fontFamily: "'Crimson Pro', serif" }}>
          Periods: <input type="range" min={3} max={10} value={periods} onChange={e => setPeriods(+e.target.value)} /> {periods}
        </label>
        <label style={{ fontSize: 13, fontFamily: "'Crimson Pro', serif" }}>
          Rate s/v: <input type="range" min={50} max={200} value={rateS * 100} onChange={e => setRateS(+e.target.value / 100)} /> {rateS.toFixed(2)}
        </label>
        <label style={{ fontSize: 13, fontFamily: "'Crimson Pro', serif" }}>
          c/v (Dept I): <input type="range" min={1} max={10} value={orgComp} onChange={e => setOrgComp(+e.target.value)} /> {orgComp}
        </label>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
          <thead>
            <tr style={{ background: "rgba(140,70,30,0.08)" }}>
              {["t", "c₁", "v₁", "s₁", "W₁", "c₂", "v₂", "s₂", "W₂", "v₁+s₁", "Gap"].map(h => (
                <th key={h} style={{ padding: "6px 8px", borderBottom: "2px solid rgba(140,70,30,0.3)", textAlign: "right", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i} style={{ background: Math.abs(r.imbalance) > 50 ? "rgba(192,57,43,0.06)" : "transparent" }}>
                <td style={cellStyle}>{r.t}</td>
                <td style={cellStyle}>{r.c1.toFixed(0)}</td>
                <td style={cellStyle}>{r.v1.toFixed(0)}</td>
                <td style={cellStyle}>{r.s1.toFixed(0)}</td>
                <td style={{ ...cellStyle, fontWeight: 600 }}>{r.w1.toFixed(0)}</td>
                <td style={cellStyle}>{r.c2.toFixed(0)}</td>
                <td style={cellStyle}>{r.v2.toFixed(0)}</td>
                <td style={cellStyle}>{r.s2.toFixed(0)}</td>
                <td style={{ ...cellStyle, fontWeight: 600 }}>{r.w2.toFixed(0)}</td>
                <td style={{ ...cellStyle, color: "#2980b9" }}>{r.balanceCondition.toFixed(0)}</td>
                <td style={{ ...cellStyle, color: Math.abs(r.imbalance) > 50 ? "#c0392b" : "#27ae60", fontWeight: 600 }}>
                  {r.imbalance > 0 ? "+" : ""}{r.imbalance.toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: "#888", marginTop: 8, fontStyle: "italic", fontFamily: "'Crimson Pro', serif" }}>
        Red rows = system imbalanced (|Gap| &gt; 50). Gap = (v₁+s₁) − c₂. Non-zero gap → overproduction or underproduction crisis.
      </p>
    </SimPanel>
  );
}

const cellStyle = { padding: "5px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)", textAlign: "right", whiteSpace: "nowrap" };

/* ─── Simulation: Transformation Problem ─── */
function TransformationSim() {
  const [industries, setIndustries] = useState([
    { name: "Heavy Industry", c: 80, v: 20, s: 20 },
    { name: "Light Mfg.", c: 60, v: 40, s: 40 },
    { name: "Agriculture", c: 40, v: 60, s: 60 },
  ]);

  const totalC = industries.reduce((a, x) => a + x.c, 0);
  const totalV = industries.reduce((a, x) => a + x.v, 0);
  const totalS = industries.reduce((a, x) => a + x.s, 0);
  const avgProfitRate = totalS / (totalC + totalV);

  const transformed = industries.map(ind => {
    const capital = ind.c + ind.v;
    const laborValue = capital + ind.s;
    const avgProfit = capital * avgProfitRate;
    const prodPrice = capital + avgProfit;
    const deviation = prodPrice - laborValue;
    const devPct = ((deviation / laborValue) * 100).toFixed(1);
    return { ...ind, capital, laborValue, avgProfit: avgProfit.toFixed(1), prodPrice: prodPrice.toFixed(1), deviation: deviation.toFixed(1), devPct };
  });

  const totalDeviation = transformed.reduce((a, x) => a + parseFloat(x.deviation), 0);

  const updateIndustry = (i, field, val) => {
    const next = [...industries];
    next[i] = { ...next[i], [field]: +val };
    if (field === "v") next[i].s = +val; // s/v = 1 for simplicity
    setIndustries(next);
  };

  return (
    <SimPanel title="Interactive: The Transformation Problem (Values → Prices)">
      <p style={{ fontSize: 13, color: "#555", margin: "0 0 12px", fontFamily: "'Source Serif 4', serif" }}>
        Marx's Volume III attempts to transform labor values into prices of production. The mathematical problem: total prices ≠ total values AND total profits ≠ total surplus value cannot both hold simultaneously. Adjust organic compositions to see the deviation.
      </p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
          <thead>
            <tr style={{ background: "rgba(140,70,30,0.08)" }}>
              {["Industry", "c", "v", "s", "Value", "Capital", "Avg π", "Prod. Price", "Δ", "Δ%"].map(h => (
                <th key={h} style={{ padding: "6px 8px", borderBottom: "2px solid rgba(140,70,30,0.3)", textAlign: h === "Industry" ? "left" : "right", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transformed.map((r, i) => (
              <tr key={i}>
                <td style={{ ...cellStyle, textAlign: "left", fontFamily: "'Crimson Pro', serif" }}>{r.name}</td>
                <td style={cellStyle}>
                  <input type="number" value={r.c} onChange={e => updateIndustry(i, "c", e.target.value)}
                    style={{ width: 50, textAlign: "right", border: "1px solid #ddd", borderRadius: 3, padding: "2px 4px", fontSize: 12, fontFamily: "'JetBrains Mono'" }} />
                </td>
                <td style={cellStyle}>
                  <input type="number" value={r.v} onChange={e => updateIndustry(i, "v", e.target.value)}
                    style={{ width: 50, textAlign: "right", border: "1px solid #ddd", borderRadius: 3, padding: "2px 4px", fontSize: 12, fontFamily: "'JetBrains Mono'" }} />
                </td>
                <td style={cellStyle}>{r.s}</td>
                <td style={{ ...cellStyle, fontWeight: 600 }}>{r.laborValue}</td>
                <td style={cellStyle}>{r.capital}</td>
                <td style={{ ...cellStyle, color: "#2980b9" }}>{r.avgProfit}</td>
                <td style={{ ...cellStyle, fontWeight: 600, color: "#8e44ad" }}>{r.prodPrice}</td>
                <td style={{ ...cellStyle, color: parseFloat(r.deviation) > 0 ? "#c0392b" : "#27ae60" }}>{r.deviation}</td>
                <td style={{ ...cellStyle, color: "#888" }}>{r.devPct}%</td>
              </tr>
            ))}
            <tr style={{ background: "rgba(140,70,30,0.05)", fontWeight: 600 }}>
              <td style={{ ...cellStyle, textAlign: "left", fontFamily: "'Crimson Pro', serif" }}>Total</td>
              <td style={cellStyle}>{totalC}</td>
              <td style={cellStyle}>{totalV}</td>
              <td style={cellStyle}>{totalS}</td>
              <td style={cellStyle}>{totalC + totalV + totalS}</td>
              <td style={cellStyle}>{totalC + totalV}</td>
              <td style={{ ...cellStyle, color: "#2980b9" }}>{(totalS).toFixed(1)}</td>
              <td style={{ ...cellStyle, color: "#8e44ad" }}>{(totalC + totalV + totalS).toFixed(1)}</td>
              <td style={{ ...cellStyle, color: Math.abs(totalDeviation) < 0.01 ? "#27ae60" : "#c0392b" }}>{totalDeviation.toFixed(1)}</td>
              <td style={cellStyle}>—</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{
        marginTop: 12, padding: "10px 14px",
        background: avgProfitRate > 0 ? "rgba(41,128,185,0.06)" : "rgba(192,57,43,0.06)",
        borderRadius: 4, fontSize: 13, fontFamily: "'Source Serif 4', serif",
      }}>
        Average rate of profit r̄ = ΣS / Σ(C+V) = {totalS} / {totalC + totalV} = <strong>{(avgProfitRate * 100).toFixed(1)}%</strong>
        <br />
        <span style={{ fontSize: 12, color: "#888" }}>
          Note: Total deviations sum to {totalDeviation.toFixed(1)} — Marx claimed this would be zero (aggregate invariance), 
          which holds here by construction. But the inputs are also transformed (c and v should be in price terms too), 
          creating the iterative inconsistency Bortkiewicz identified in 1907.
        </span>
      </div>
    </SimPanel>
  );
}

/* ─── Capital Flow Visualization ─── */
function CapitalFlowViz() {
  const canvasRef = useRef(null);
  const [profitDiff, setProfitDiff] = useState(3);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    const sectors = [
      { name: "Tech", x: W * 0.2, y: H * 0.3, r: 35, profit: 12 + profitDiff },
      { name: "Finance", x: W * 0.5, y: H * 0.2, r: 30, profit: 10 },
      { name: "Mfg.", x: W * 0.8, y: H * 0.35, r: 28, profit: 8 - profitDiff * 0.5 },
      { name: "Agri.", x: W * 0.35, y: H * 0.7, r: 25, profit: 6 - profitDiff },
      { name: "Services", x: W * 0.65, y: H * 0.75, r: 32, profit: 9 },
    ];

    // Draw flow arrows from low-profit to high-profit sectors
    for (let i = 0; i < sectors.length; i++) {
      for (let j = 0; j < sectors.length; j++) {
        if (i === j) continue;
        const diff = sectors[j].profit - sectors[i].profit;
        if (diff > 2) {
          const dx = sectors[j].x - sectors[i].x;
          const dy = sectors[j].y - sectors[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / dist, ny = dy / dist;
          const sx = sectors[i].x + nx * (sectors[i].r + 5);
          const sy = sectors[i].y + ny * (sectors[i].r + 5);
          const ex = sectors[j].x - nx * (sectors[j].r + 5);
          const ey = sectors[j].y - ny * (sectors[j].r + 5);

          const alpha = Math.min(diff / 10, 0.8);
          ctx.strokeStyle = `rgba(231,76,60,${alpha})`;
          ctx.lineWidth = Math.max(1, diff / 3);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();

          // arrowhead
          const angle = Math.atan2(ey - sy, ex - sx);
          ctx.fillStyle = `rgba(231,76,60,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - 8 * Math.cos(angle - 0.3), ey - 8 * Math.sin(angle - 0.3));
          ctx.lineTo(ex - 8 * Math.cos(angle + 0.3), ey - 8 * Math.sin(angle + 0.3));
          ctx.fill();
        }
      }
    }

    // Draw sectors
    sectors.forEach(s => {
      const hue = s.profit > 10 ? 140 : s.profit > 7 ? 45 : 0;
      ctx.fillStyle = `hsla(${hue}, 50%, 50%, 0.15)`;
      ctx.strokeStyle = `hsla(${hue}, 50%, 40%, 0.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#333";
      ctx.font = "bold 12px 'Crimson Pro', serif";
      ctx.textAlign = "center";
      ctx.fillText(s.name, s.x, s.y - 4);
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillStyle = `hsl(${hue}, 50%, 35%)`;
      ctx.fillText(`r=${s.profit.toFixed(1)}%`, s.x, s.y + 12);
    });

    ctx.textAlign = "left";
  }, [profitDiff]);

  return (
    <SimPanel title="Interactive: Capital Flow Between Sectors" color="#c0392b">
      <p style={{ fontSize: 13, color: "#555", margin: "0 0 12px", fontFamily: "'Source Serif 4', serif" }}>
        In real capitalism, capital flows toward higher profit rates. Marx's equalization assumption requires perfect mobility and information — neither holds empirically. Increase the profit differential to see intensifying flows.
      </p>
      <canvas ref={canvasRef} width={460} height={280} style={{ width: "100%", maxWidth: 460, background: "#faf6f1", borderRadius: 4 }} />
      <label style={{ fontSize: 13, fontFamily: "'Crimson Pro', serif", marginTop: 8, display: "block" }}>
        Profit Rate Differential: <input type="range" min={0} max={8} value={profitDiff} onChange={e => setProfitDiff(+e.target.value)} style={{ verticalAlign: "middle" }} /> {profitDiff}
      </label>
      <p style={{ fontSize: 12, color: "#888", fontStyle: "italic", fontFamily: "'Crimson Pro', serif", marginTop: 6 }}>
        Arrow thickness ∝ profit differential. Red arrows show capital migration. Marx predicted equalization; reality shows persistent differentials due to barriers to entry, information asymmetry, and institutional friction.
      </p>
    </SimPanel>
  );
}


/* ─── Main App ─── */
export default function MarxMathModels() {
  const [activeSection, setActiveSection] = useState(0);
  const contentRef = useRef(null);

  const scrollToSection = (idx) => {
    setActiveSection(idx);
    const el = document.getElementById(`section-${idx}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{
      fontFamily: "'Source Serif 4', serif",
      background: "#faf6f1",
      minHeight: "100vh",
      color: "#2c1810",
    }}>
      <style>{KaTeX_CSS}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #2c1810 0%, #4a2518 40%, #6b3420 100%)",
        padding: "40px 24px 32px",
        color: "#faf6f1",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 3, opacity: 0.5, marginBottom: 12 }}>
            MATHEMATICAL ECONOMICS
          </div>
          <h1 style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: 32, fontWeight: 300,
            margin: 0, lineHeight: 1.2,
          }}>
            The Mathematics of Karl Marx
          </h1>
          <p style={{
            fontSize: 16, fontWeight: 300, opacity: 0.75,
            marginTop: 12, lineHeight: 1.5, maxWidth: 560,
          }}>
            Formal models of value, reproduction, and capital flow — where the assumptions break, and how to build better mathematics.
          </p>
        </div>
      </div>

      {/* Nav */}
      <div style={{
        background: "#f0e8df",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        position: "sticky", top: 0, zIndex: 10,
        overflowX: "auto", whiteSpace: "nowrap",
        padding: "0 24px",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 0 }}>
          {SECTIONS.map((s, i) => (
            <button key={i} onClick={() => scrollToSection(i)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "10px 14px",
              fontFamily: "'Crimson Pro', serif", fontSize: 13,
              color: activeSection === i ? "#8c4620" : "#888",
              borderBottom: activeSection === i ? "2px solid #8c4620" : "2px solid transparent",
              fontWeight: activeSection === i ? 600 : 400,
              whiteSpace: "nowrap",
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>

        {/* Section 0: Overview */}
        <section id="section-0" style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>0. Marx as Mathematician</h2>
          <p style={pStyle}>
            Karl Marx was trained in Hegelian philosophy, but his mature work in <em>Das Kapital</em> (1867–1894) is fundamentally mathematical. He constructed formal models of economic reproduction, applied algebraic identities to value theory, and attempted what we would now call a general equilibrium transformation. His mathematical manuscripts — published posthumously — show engagement with calculus, series, and the foundations of analysis.
          </p>
          <p style={pStyle}>
            The key mathematical structures in Marx are: (1) the <strong>Labor Theory of Value</strong> as a linear pricing model, (2) the <strong>Reproduction Schemas</strong> as a two-sector input-output system, and (3) the <strong>Transformation Problem</strong> as a nonlinear mapping from labor values to market prices. Each rests on specific assumptions that create well-defined mathematical difficulties.
          </p>
          <p style={pStyle}>
            This document presents each model formally, identifies the precise mathematical assumptions that fail empirically, demonstrates the dynamics through interactive simulations, and sketches directions for constructing better models.
          </p>
        </section>

        {/* Section 1: LTV */}
        <section id="section-1" style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>1. The Labor Theory of Value: A Linear Pricing Model</h2>

          <h3 style={h3Style}>1.1 Formal Statement</h3>
          <p style={pStyle}>
            Let there be n commodities. Define the <strong>value</strong> of commodity i as the total socially necessary labor time embedded in it. Marx decomposes this into three components:
          </p>
          <MathBlock label="Value Decomposition" tex={`Wᵢ = cᵢ + vᵢ + sᵢ

where:
  cᵢ = constant capital (dead labor: machinery, raw materials)
  vᵢ = variable capital (living labor: wages)
  sᵢ = surplus value (unpaid labor appropriated by capital)

The rate of surplus value (exploitation):  e = sᵢ / vᵢ
The organic composition of capital:        qᵢ = cᵢ / vᵢ`} />

          <p style={pStyle}>
            In matrix form, for an economy with n sectors producing commodities using each other's outputs, define the technology matrix A ∈ ℝⁿˣⁿ where aᵢⱼ is the amount of commodity j required per unit of commodity i, and the labor vector l ∈ ℝⁿ where lᵢ is direct labor per unit of i. Then:
          </p>
          <MathBlock label="Leontief-Marx Value System" tex={`λ = λA + l

Solving: λ = l(I − A)⁻¹

where λ ∈ ℝⁿ is the vector of labor values, provided
the spectral radius ρ(A) < 1 (the economy is productive).`} />

          <h3 style={h3Style}>1.2 Key Assumptions</h3>
          <p style={pStyle}>
            <strong>A1 (Homogeneous labor):</strong> All labor is reducible to a single "abstract labor" unit via fixed skill multipliers. Mathematically, this assumes a scalar-valued function φ: L → ℝ₊ mapping heterogeneous labor types to a common measure — a strong dimensional reduction assumption.
          </p>
          <p style={pStyle}>
            <strong>A2 (Single technique):</strong> Each commodity has exactly one production technique. No joint production, no choice of technique. This makes (I − A)⁻¹ unique.
          </p>
          <p style={pStyle}>
            <strong>A3 (Value determines price):</strong> Market prices are gravitational centers around labor values. This is the "law of value" — an equilibrium claim that prices oscillate around λ.
          </p>

          <LTVSimulation />

          <h3 style={h3Style}>1.3 Mathematical Problems</h3>
          <p style={pStyle}>
            The simulation above demonstrates the core issue: there is no dynamical mechanism in the model that forces market price back to labor value. Marx's claim was empirical ("in the long run"), but the model itself contains no attractor, no Lyapunov function, no convergence proof. The gap between price and value is not bounded by the model — it is a separate assertion.
          </p>
          <p style={pStyle}>
            Furthermore, assumption A1 collapses under joint production (Steedman 1977 showed labor values can be negative in joint production systems), and assumption A2 fails in any real economy with technological choice — Sraffa demonstrated in 1960 that reswitching of techniques makes the value-price correspondence non-monotonic.
          </p>
        </section>

        {/* Section 2: Reproduction */}
        <section id="section-2" style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>2. The Reproduction Schemas: A Two-Sector IO Model</h2>

          <h3 style={h3Style}>2.1 Formal Statement</h3>
          <p style={pStyle}>
            Marx's most original mathematical contribution is the two-department reproduction schema in Volume II. It is effectively a discrete-time, two-sector input-output model — predating Leontief by 60 years.
          </p>
          <MathBlock label="Simple Reproduction (Stationary State)" tex={`Department I  (means of production): W₁ = c₁ + v₁ + s₁
Department II (consumption goods):     W₂ = c₂ + v₂ + s₂

Equilibrium condition:
  v₁ + s₁ = c₂

This says: the new value created in Dept I (wages + surplus)
must exactly equal the constant capital consumed by Dept II.
Otherwise the system cannot reproduce itself at the same scale.

Equivalently:  W₁ = c₁ + c₂  (total means of production = total demand)
               W₂ = (v₁ + s₁) + (v₂ + s₂)  (consumption = total income)`} />

          <MathBlock label="Expanded Reproduction (Growth)" tex={`Each department reinvests a fraction αᵢ of surplus value:

  Δcᵢ = αᵢ · sᵢ · (qᵢ / (qᵢ + 1))    (additional constant capital)
  Δvᵢ = αᵢ · sᵢ · (1 / (qᵢ + 1))      (additional variable capital)

The balance condition becomes:
  v₁ + s₁ = c₂ + Δc₂

This is a system of coupled difference equations in
(c₁(t), v₁(t), c₂(t), v₂(t)) — structurally identical
to a linear dynamical system x(t+1) = Mx(t).`} />

          <ReproductionSim />

          <h3 style={h3Style}>2.2 What Marx Got Right</h3>
          <p style={pStyle}>
            This is remarkably modern. The schema captures: (a) intersectoral dependence, (b) the possibility of disproportionality crises (when the balance condition fails), and (c) the requirement that aggregate demand and aggregate supply must match across sectors. Marx essentially derived the conditions for balanced growth in a multi-sector economy, anticipating Feldman (1928), Harrod-Domar (1939/1946), and von Neumann (1937).
          </p>

          <h3 style={h3Style}>2.3 Mathematical Limitations</h3>
          <p style={pStyle}>
            The model has only two sectors — insufficient for real economies (Leontief's actual IO tables have 500+ sectors). There is no price mechanism to restore balance: when v₁ + s₁ ≠ c₂, the model has no adjustment dynamics. There are no inventory buffers, credit, or money. And critically, the reinvestment fractions αᵢ are exogenous — Marx provides no optimization principle or behavioral theory for how capitalists choose α. A modern formulation would require either a fixed-point argument or an optimal control framework to close the model.
          </p>
        </section>

        {/* Section 3: Transformation */}
        <section id="section-3" style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>3. The Transformation Problem: Marx's Deepest Mathematical Difficulty</h2>

          <h3 style={h3Style}>3.1 The Problem</h3>
          <p style={pStyle}>
            In Volume I, commodities exchange at labor values. In Volume III, Marx recognizes that competition equalizes profit rates across sectors with different organic compositions of capital (c/v). He attempts to "transform" values into prices of production. This is the central mathematical problem of Marxian economics.
          </p>

          <MathBlock label="Marx's Transformation (Volume III, Ch. 9)" tex={`Step 1: Compute average profit rate
  r̄ = ΣS / Σ(C + V)

Step 2: Price of production for sector i
  pᵢ = (cᵢ + vᵢ)(1 + r̄)

Step 3: Marx claims two aggregate invariances hold:
  (I)   Σpᵢ = ΣWᵢ     (total prices = total values)
  (II)  Σπᵢ = ΣSᵢ     (total profit = total surplus value)

  where πᵢ = (cᵢ + vᵢ)r̄ is the average profit of sector i.`} />

          <h3 style={h3Style}>3.2 The Bortkiewicz Critique (1907)</h3>
          <p style={pStyle}>
            Ladislaus von Bortkiewicz identified the fundamental error: Marx transforms the outputs (the Wᵢ) from values to prices, but leaves the inputs (cᵢ, vᵢ) in value terms. Since inputs are also outputs of other sectors, they too must be in price terms. The correct formulation requires simultaneous equations:
          </p>

          <MathBlock label="Bortkiewicz Simultaneous System" tex={`Let pⱼ be the price of commodity j, and λⱼ its labor value.
Define the price/value ratio: μⱼ = pⱼ / λⱼ

The correct price equations (for 3 departments):

  p₁(c₁ᵢμ₁ + c₂ᵢμ₂ + c₃ᵢμ₃ + vᵢμ₃)(1 + r) = Wᵢμᵢ

This is a system of n equations in (n+1) unknowns
(μ₁, μ₂, ..., μₙ, r). One normalization is needed.

CRITICAL RESULT: Both invariances (I) and (II) cannot
hold simultaneously, except in the trivial case where
all sectors have identical organic composition (qᵢ = q ∀i).

This is not a computational error by Marx — it is a
mathematical impossibility, a rank-deficiency in the
constraint system.`} />

          <TransformationSim />

          <h3 style={h3Style}>3.3 Modern Resolution Attempts</h3>
          <p style={pStyle}>
            The "New Interpretation" (Duménil 1980, Foley 1982) resolves this by redefining the value of money — defining the monetary expression of labor time (MELT) endogenously so that one invariance holds by definition. The Temporal Single System Interpretation (TSSI) of Kliman and McGlone resolves it by making values and prices co-determined in historical time rather than simultaneously. Mathematically, TSSI replaces the simultaneous equation system with a sequential one — but this makes the solution path-dependent and sensitive to initial conditions.
          </p>
          <p style={pStyle}>
            Sraffa's 1960 approach bypasses the transformation entirely: define prices directly from the physical input-output structure and a given wage-profit frontier. No labor values needed. This is mathematically cleaner but abandons Marx's theoretical claim that exploitation (s/v) is the source of profit.
          </p>
        </section>

        {/* Section 4: Capital Flow */}
        <section id="section-4" style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>4. Capital Flow in Real Capitalism</h2>

          <h3 style={h3Style}>4.1 Marx's Equalization Hypothesis</h3>
          <p style={pStyle}>
            Marx's transformation assumes capital flows freely between sectors, driving all profit rates toward r̄. This is a strong equilibrium assumption — essentially the classical competition postulate. The formal requirement is:
          </p>

          <MathBlock label="Profit Rate Equalization" tex={`dr_i/dt = κ(r̄ − rᵢ)    for all sectors i

This implies exponential convergence:
  rᵢ(t) = r̄ + (rᵢ(0) − r̄)e^(−κt)

Required conditions:
  1. Perfect capital mobility (no barriers to entry)
  2. Perfect information (all investors know all rᵢ)
  3. No increasing returns to scale
  4. No institutional or regulatory barriers
  5. Homogeneous risk across sectors`} />

          <CapitalFlowViz />

          <h3 style={h3Style}>4.2 Empirical Evidence</h3>
          <p style={pStyle}>
            Decades of empirical work (Shaikh 2016, Duménil & Lévy 2004) show that profit rates across sectors exhibit persistent dispersion. The coefficient of variation of sectoral profit rates in the US economy has remained between 0.3–0.6 for over a century. Capital does not equalize profit rates — it exhibits preferential attachment (capital flows to where capital already is), increasing returns, network effects, and institutional lock-in. Marx's model assumes a convex optimization landscape; reality is non-convex with multiple basins of attraction.
          </p>
        </section>

        {/* Section 5: Where Math Breaks */}
        <section id="section-5" style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>5. Where the Mathematics Breaks: A Summary</h2>

          <div style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "1fr",
          }}>
            {[
              {
                model: "Labor Theory of Value",
                assumption: "λ = l(I−A)⁻¹ uniquely determines prices",
                failure: "Joint production → negative values (Steedman). Reswitching → non-monotone price-value map (Sraffa). No convergence mechanism from prices to values.",
                severity: "Structural",
              },
              {
                model: "Reproduction Schemas",
                assumption: "v₁ + s₁ = c₂ (intersectoral balance)",
                failure: "No endogenous adjustment mechanism. No money, credit, or inventory dynamics. Only 2 sectors. Reinvestment fractions exogenous.",
                severity: "Incomplete",
              },
              {
                model: "Transformation Problem",
                assumption: "Both Σp = ΣW and Σπ = ΣS hold simultaneously",
                failure: "Mathematically impossible except in trivial case (Bortkiewicz 1907). Input prices not transformed. System is underdetermined.",
                severity: "Fatal",
              },
              {
                model: "Profit Equalization",
                assumption: "rᵢ → r̄ for all sectors",
                failure: "Empirically falsified. Persistent dispersion. Barriers to entry, increasing returns, and institutional friction prevent convergence.",
                severity: "Empirical",
              },
              {
                model: "Falling Rate of Profit",
                assumption: "r = s/(c+v), rising c/v → falling r",
                failure: "Okishio theorem (1961): cost-reducing technical change raises the equilibrium profit rate, not lowers it. Marx's result requires fixed s/v under rising c/v — not guaranteed.",
                severity: "Theoretical",
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 6,
                padding: "14px 18px",
                borderLeft: `3px solid ${item.severity === "Fatal" ? "#c0392b" : item.severity === "Structural" ? "#e67e22" : item.severity === "Empirical" ? "#2980b9" : "#7f8c8d"}`,
              }}>
                <div style={{ fontFamily: "'Crimson Pro', serif", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                  {item.model}
                  <span style={{
                    float: "right", fontSize: 11, padding: "2px 8px",
                    borderRadius: 3,
                    background: item.severity === "Fatal" ? "rgba(192,57,43,0.1)" : item.severity === "Structural" ? "rgba(230,126,34,0.1)" : "rgba(41,128,185,0.1)",
                    color: item.severity === "Fatal" ? "#c0392b" : item.severity === "Structural" ? "#e67e22" : "#2980b9",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{item.severity}</span>
                </div>
                <div style={{ fontSize: 12, color: "#555", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                  Assumption: {item.assumption}
                </div>
                <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>
                  {item.failure}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Better Models */}
        <section id="section-6" style={{ marginBottom: 48 }}>
          <h2 style={h2Style}>6. Toward Better Mathematical Models</h2>

          <p style={pStyle}>
            Marx identified the right <em>questions</em>: How is surplus generated? How does capital flow between sectors? What are the conditions for systemic reproduction or crisis? His mathematical apparatus was incomplete — but the program is recoverable with modern tools. Here are five directions:
          </p>

          <h3 style={h3Style}>6.1 Replace LTV with Sraffian Price Systems</h3>
          <MathBlock label="Sraffa's Price System (1960)" tex={`p = (1+r)(pA + wl)

where p is the price vector, A is the input-output matrix,
l is the labor vector, w is the wage rate, r is the profit rate.

This determines prices directly from physical technology
and the distributional parameter (w,r) on the wage-profit frontier:
  w = f(r), with f'(r) < 0 (inverse wage-profit relation)

No labor values needed. No transformation problem.
Surplus is visible as r > 0, without needing s/v.`} />

          <h3 style={h3Style}>6.2 Replace 2-Sector Schemas with Leontief-Dynamic IO</h3>
          <MathBlock label="Dynamic Input-Output Model" tex={`x(t+1) = Ax(t) + B·Δx(t) + d(t)

where:
  x(t) = output vector at time t
  A = current input coefficients
  B = capital input coefficients (investment)
  d(t) = final demand

This is a system of n coupled difference equations.
Stability requires the eigenvalues of the system matrix
to lie inside the unit circle. Disproportionality crises
correspond to eigenvalues crossing |z| = 1.`} />

          <h3 style={h3Style}>6.3 Replace Profit Equalization with Agent-Based Capital Flows</h3>
          <p style={pStyle}>
            Instead of assuming r̄ is reached, model capital as an agent-based system where heterogeneous investors with bounded rationality allocate capital according to noisy profit signals, with sector-specific barriers to entry modeled as switching costs. This generates persistent profit rate dispersion as an emergent property rather than assuming it away. Formally, each agent k solves a constrained optimization with information friction:
          </p>
          <MathBlock tex={`max E[Σ δᵗ rₖ(t)]   subject to:
  switching cost:  C(i→j) > 0
  information:     r̂ₖᵢ(t) = rᵢ(t) + εₖᵢ(t),  εₖᵢ ~ N(0, σ²)
  capital constraint: Σⱼ xₖⱼ ≤ Wₖ`} />

          <h3 style={h3Style}>6.4 Replace the Falling Rate with Endogenous Technical Change</h3>
          <p style={pStyle}>
            The Okishio critique shows Marx's falling rate requires exogenous assumptions about the rate of exploitation. A better model endogenizes technical change: firms choose technique (A', l') from a technology set T to maximize profit, which changes both the organic composition and the rate of exploitation simultaneously. This is a fixed-point problem in (p, r, A, l) — solvable via iterative methods or variational inequalities.
          </p>

          <h3 style={h3Style}>6.5 A Unified Modern Framework</h3>
          <MathBlock label="Desiderata for a Post-Marxian Mathematical Economics" tex={`A complete model should satisfy:

D1. Multi-sector IO structure (n ≥ 50 sectors)
D2. Endogenous prices via Sraffa-type system
D3. Capital mobility with friction (agent-based or mean-field)
D4. Endogenous technical change (evolutionary game)
D5. Money and credit (stock-flow consistent, Godley-Lavoie)
D6. Distribution as outcome, not assumption
D7. Crisis as endogenous instability (bifurcation theory)

Mathematical tools required:
  - Perron-Frobenius theory (for non-negative matrices)
  - Dynamical systems / bifurcation analysis
  - Stochastic processes / agent-based simulation
  - Variational inequalities (for equilibrium with friction)
  - Stock-flow consistent accounting (Godley tables)`} />

          <p style={pStyle}>
            The irony of Marx's mathematical economics is that his most important insight — that capitalism is a system with internal contradictions that generate crises endogenously — requires precisely the mathematics that was unavailable to him: dynamical systems theory, bifurcation analysis, and agent-based modeling. The reproduction schemas, in particular, are remarkably close to being a correct stability analysis of a multi-sector economy; they need only the addition of adjustment dynamics and a proper eigenvalue analysis to become a genuine theory of economic crisis.
          </p>
          <p style={pStyle}>
            The path forward is not to abandon Marx's questions, but to answer them with adequate mathematics.
          </p>
        </section>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid rgba(0,0,0,0.1)",
          paddingTop: 24, marginTop: 48,
          fontSize: 12, color: "#888",
          fontFamily: "'Crimson Pro', serif",
        }}>
          <strong>Key References:</strong> Marx, <em>Das Kapital</em> Vols. I–III (1867–1894) · Bortkiewicz, "Value and Price in the Marxian System" (1907) · Sraffa, <em>Production of Commodities by Means of Commodities</em> (1960) · Steedman, <em>Marx After Sraffa</em> (1977) · Okishio, "Technical Change and the Rate of Profit" (1961) · Morishima, <em>Marx's Economics</em> (1973) · Shaikh, <em>Capitalism</em> (2016) · Foley, <em>Understanding Capital</em> (1986) · Godley & Lavoie, <em>Monetary Economics</em> (2007)
        </div>
      </div>
    </div>
  );
}

const h2Style = {
  fontFamily: "'Crimson Pro', serif",
  fontSize: 24, fontWeight: 600,
  color: "#2c1810",
  borderBottom: "1px solid rgba(44,24,16,0.15)",
  paddingBottom: 8, marginBottom: 16, marginTop: 0,
};

const h3Style = {
  fontFamily: "'Crimson Pro', serif",
  fontSize: 17, fontWeight: 600,
  color: "#4a2518",
  marginBottom: 8, marginTop: 24,
};

const pStyle = {
  fontSize: 15,
  lineHeight: 1.75,
  color: "#3a2418",
  marginBottom: 12,
};
