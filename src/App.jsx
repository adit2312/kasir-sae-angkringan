import { useState, useEffect, useRef } from "react";

// ── SUPABASE CONFIG ──
const SUPABASE_URL = "https://escaqwyowrenrsikbvvh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzY2Fxd3lvd3JlbnJzaWtidnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjcyMDEsImV4cCI6MjA5NTY0MzIwMX0.9OXNxsJUmahr2fkarQqGRmdwS1-qkxkXnzic8Wa7LDo";

const sbFetch = async (path, method="GET", body=null) => {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": method === "POST" ? "resolution=merge-duplicates" : "",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
  if (!res.ok) { const e = await res.text(); console.error("SB error:", e); return null; }
  try { return await res.json(); } catch { return null; }
};

const sbInsert = (table, row) => sbFetch(`${table}?on_conflict=id`, "POST", row);
const sbSelect = (table, query="") => sbFetch(`${table}?${query}&order=id.desc`);
const sbDelete = (table, filter) => sbFetch(`${table}?${filter}`, "DELETE");
const sbUpsert = (table, row) => sbFetch(`${table}`, "POST", row);

// ── MENU DATA ──
const MENU = {
  "Aneka Sate-Satean": [
    { id: 1, name: "Sate Usus", price: 4000 },
    { id: 44, name: "Sate Taichan (per pcs)", price: 2500 },
    { id: 3, name: "Sate Kulit", price: 4000 },
    { id: 4, name: "Sate Ati Ampela", price: 4000 },
    { id: 5, name: "Nuget", price: 4000 },
    { id: 6, name: "Sosis", price: 4000 },
    { id: 7, name: "Bakso", price: 4000 },
    { id: 8, name: "Dumpling Ayam", price: 4000 },
    { id: 9, name: "Dumpling Keju", price: 4000 },
    { id: 10, name: "Chikuwa", price: 4000 },
    { id: 11, name: "Daging Saikoro", price: 15000 },
    { id: 12, name: "Sayap", price: 7000 },
    { id: 13, name: "Sate Taichan (10 tusuk)", price: 25000 },
  ],
  "Makanan": [
    { id: 14, name: "Mie Indomie Goreng", price: 10000 },
    { id: 15, name: "Mie Indomie Goreng + Telur", price: 13000 },
    { id: 16, name: "Mie Indomie Goreng + Telur + Kornet", price: 14000 },
    { id: 17, name: "Mie Indomie Rebus", price: 10000 },
    { id: 18, name: "Mie Indomie Rebus + Telur", price: 13000 },
    { id: 19, name: "Mie Indomie Rebus + Telur + Kornet", price: 14000 },
    { id: 20, name: "Omlet", price: 10000 },
    { id: 21, name: "Baso Cuanki Instant", price: 10000 },
    { id: 22, name: "Baso Cuanki Instant + Telur", price: 13000 },
    { id: 23, name: "Pisang Bakar Coklat", price: 10000 },
    { id: 24, name: "Pisang Bakar Coklat Keju", price: 12000 },
    { id: 25, name: "Roti Bakar Coklat", price: 10000 },
    { id: 26, name: "Roti Bakar Coklat Keju", price: 12000 },
  ],
  "Kopi": [
    { id: 27, name: "Kopi Item", price: 7000 },
    { id: 28, name: "Kopi Good Day Cappucino", price: 10000 },
    { id: 29, name: "Kopi Torabika Moka", price: 10000 },
    { id: 30, name: "Kopi Gula Aren", price: 10000 },
  ],
  "Teh": [
    { id: 31, name: "Teh Manis", price: 5000 },
    { id: 32, name: "Lemon Tea", price: 8000 },
    { id: 33, name: "Teh Susu", price: 10000 },
  ],
  "Minuman Sachet": [
    { id: 34, name: "Ovaltine", price: 10000 },
    { id: 35, name: "Ovaltine Keju", price: 12000 },
    { id: 36, name: "Milo", price: 10000 },
    { id: 37, name: "Milo Keju", price: 12000 },
    { id: 38, name: "Bengbeng Drink", price: 10000 },
    { id: 39, name: "Susu Jahe Hangat", price: 12000 },
    { id: 40, name: "Nutrisari", price: 8000 },
    { id: 41, name: "Extrajoss Susu", price: 10000 },
    { id: 42, name: "Chocolatos Drink", price: 10000 },
    { id: 43, name: "Air Mineral", price: 5000 },
  ],
};

const CATEGORY_ICONS = { "Aneka Sate-Satean":"🍢","Makanan":"🍜","Kopi":"☕","Teh":"🍵","Minuman Sachet":"🧃" };
const COLORS = ["#e74c3c","#3498db","#2ecc71","#9b59b6","#f39c12","#1abc9c","#e67e22","#e91e8c"];
const HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

// ACCOUNTS — owner & karyawan
const ACCOUNTS = {
  owner: { pin: "020924", role: "owner", name: "Owner" },
  karyawan1: { pin: "123456", role: "karyawan", name: "Budi" },
  karyawan2: { pin: "123456", role: "karyawan", name: "Siti" },
  karyawan3: { pin: "123456", role: "karyawan", name: "Andi" },
};

const STOK_ITEMS = [
  // Sate-satean
  "Sate Usus", "Sate Taichan (per pcs)", "Sate Kulit", "Sate Ati Ampela",
  "Nuget", "Sosis", "Bakso", "Dumpling Ayam", "Dumpling Keju",
  "Chikuwa", "Daging Saikoro", "Sayap",
  // Makanan
  "Mie Indomie", "Telur", "Kornet", "Baso Cuanki", "Pisang", "Roti tawar",
  // Kopi & Teh
  "Kopi Item", "Kopi Good Day Cappucino", "Kopi Torabika Moka", "Kopi Gula Aren",
  "Teh Manis", "Lemon Tea", "Teh Susu",
  // Minuman Sachet
  "Ovaltine", "Ovaltine Keju", "Milo", "Milo Keju", "Bengbeng Drink",
  "Susu Jahe Hangat", "Nutrisari", "Extrajoss Susu", "Chocolatos Drink", "Air Mineral",
];

const formatRp = (n) => "Rp " + (n||0).toLocaleString("id-ID");
const toDateKey = (d) => { const x=new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; };

// ── LOG helper ──
const createLog = (user, action, detail="") => ({
  id: Date.now() + Math.random(),
  timestamp: new Date().toISOString(),
  user, action, detail,
});

// ════════════════════════════════
// LOGIN SCREEN
// ════════════════════════════════
function LoginScreen({ onLogin }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleNum = (n) => { if (pin.length < 6) setPin(p => p+n); };
  const handleDel = () => setPin(p => p.slice(0,-1));

  const handleLogin = () => {
    const acc = Object.entries(ACCOUNTS).find(([,v]) => v.pin === pin);
    if (acc) {
      onLogin({ username: acc[0], ...acc[1] });
      setPin("");
      setError("");
    } else {
      setError("PIN salah!");
      setShake(true);
      setPin("");
      setTimeout(() => { setShake(false); setError(""); }, 1000);
    }
  };

  useEffect(() => { if (pin.length === 6) handleLogin(); }, [pin]);

  const nums = [1,2,3,4,5,6,7,8,9,"",0,"⌫"];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a0a00,#3d1f00)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ fontSize:32, fontWeight:900, color:"#f5c842", marginBottom:4 }}>SAe Angkringan</div>
      <div style={{ fontSize:13, color:"#c9a96e", marginBottom:40 }}>Masuk dengan PIN</div>

      {/* PIN dots */}
      <div style={{ display:"flex", gap:12, marginBottom:16, animation: shake ? "shake 0.3s" : "none" }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{
            width:16, height:16, borderRadius:"50%",
            background: pin.length > i ? "#f5c842" : "rgba(255,255,255,0.2)",
            transition:"background 0.15s",
          }} />
        ))}
      </div>

      {error && <div style={{ color:"#ff6b6b", fontSize:13, marginBottom:12, fontWeight:700 }}>{error}</div>}

      {/* Numpad */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, width:240 }}>
        {nums.map((n,i) => (
          <button key={i} onClick={() => n==="⌫" ? handleDel() : n!=="" ? handleNum(String(n)) : null}
            style={{
              height:64, borderRadius:16, border:"none", cursor: n==="" ? "default" : "pointer",
              background: n==="" ? "transparent" : n==="⌫" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.12)",
              color:"#fff", fontSize:22, fontWeight:700,
              boxShadow: n!=="" && n!=="⌫" ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
              transition:"background 0.1s",
            }}>
            {n}
          </button>
        ))}
      </div>

      <div style={{ marginTop:32, fontSize:11, color:"rgba(255,255,255,0.3)", textAlign:"center" }}>
        SAe Angkringan © 2026
      </div>

      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }`}</style>
    </div>
  );
}

// ════════════════════════════════
// REKAP (OWNER ONLY)
// ════════════════════════════════
function RekapView({ history, setHistory, logs, setLogs }) {
  const [tab, setTab] = useState("transaksi");
  const [filterDate, setFilterDate] = useState("");
  const [confirmId, setConfirmId] = useState(null); // id of item pending delete
  const today = toDateKey(new Date());

  const filtered = filterDate ? history.filter(t => toDateKey(t.timestamp) === filterDate) : history;
  const totalPendapatan = filtered.reduce((s,t) => s+t.grandTotal, 0);

  const grouped = {};
  filtered.forEach(t => { const dk=toDateKey(t.timestamp); if(!grouped[dk])grouped[dk]=[]; grouped[dk].push(t); });
  const sortedDates = Object.keys(grouped).sort((a,b)=>b.localeCompare(a));

  const hapusTrx = (id) => { setHistory(prev => prev.filter(t => t.id !== id)); setConfirmId(null); };
  const hapusLog = (id) => { setLogs(prev => prev.filter(l => l.id !== id)); setConfirmId(null); };

  const DeleteBtn = ({ id, onConfirm }) => (
    <div style={{ marginTop:6 }}>
      {confirmId === id
        ? <div style={{ display:"flex", gap:6 }}>
            <button onClick={()=>onConfirm(id)} style={{ flex:1, padding:"6px 0", borderRadius:8, border:"none", background:"#ef4444", color:"#fff", fontWeight:800, fontSize:12, cursor:"pointer" }}>✓ Ya, Hapus</button>
            <button onClick={()=>setConfirmId(null)} style={{ flex:1, padding:"6px 0", borderRadius:8, border:"none", background:"#e5e7eb", color:"#555", fontWeight:700, fontSize:12, cursor:"pointer" }}>✕ Batal</button>
          </div>
        : <button onClick={()=>setConfirmId(id)} style={{ width:"100%", padding:"6px 0", borderRadius:8, border:"none", background:"#fee2e2", color:"#ef4444", fontWeight:700, fontSize:12, cursor:"pointer" }}>🗑 Hapus</button>
      }
    </div>
  );

  return (
    <div style={{ padding:14, overflowY:"auto", height:"calc(100vh - 58px)" }}>
      {/* Tab */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {["transaksi","log"].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1, padding:"9px 0", borderRadius:12, border:"none", cursor:"pointer",
            fontWeight:700, fontSize:12,
            background: tab===t ? "#c47a1e" : "#fff",
            color: tab===t ? "#fff" : "#7a4a00",
            boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
          }}>
            {t==="transaksi" ? "💰 Transaksi" : "📋 Log Aktivitas"}
          </button>
        ))}
      </div>

      {tab === "transaksi" && (
        <>
          <div style={{ background:"linear-gradient(135deg,#3d1f00,#c47a1e)", borderRadius:16, padding:"16px 18px", marginBottom:12, color:"#fff", boxShadow:"0 4px 16px rgba(196,122,30,0.3)" }}>
            <div style={{ fontSize:12, opacity:0.8 }}>{filterDate ? `Pendapatan ${filterDate}` : "Total Semua Pendapatan"}</div>
            <div style={{ fontSize:26, fontWeight:900, marginTop:3 }}>{formatRp(totalPendapatan)}</div>
            <div style={{ fontSize:11, opacity:0.7, marginTop:3 }}>{filtered.length} transaksi</div>
          </div>

          <div style={{ background:"#fff", borderRadius:12, padding:"12px 14px", marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#7a4a00", marginBottom:8 }}>📅 Filter Tanggal</div>
            <div style={{ display:"flex", gap:8 }}>
              <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}
                style={{ flex:1, padding:"8px 11px", borderRadius:10, border:"2px solid #e8d5b0", fontSize:13, outline:"none", color:"#2d1a00" }} />
              {filterDate && <button onClick={()=>setFilterDate("")} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#fff0dc", color:"#c47a1e", fontWeight:700, fontSize:12, cursor:"pointer" }}>Semua</button>}
            </div>
            <div style={{ display:"flex", gap:6, marginTop:8 }}>
              {[["Hari ini", today], ["Kemarin", toDateKey(new Date(Date.now()-86400000))]].map(([label, dk]) => (
                <button key={label} onClick={()=>setFilterDate(dk)} style={{
                  padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer",
                  background: filterDate===dk ? "#c47a1e" : "#f5ead6",
                  color: filterDate===dk ? "#fff" : "#7a4a00", fontWeight:700, fontSize:11,
                }}>{label}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0
            ? <div style={{ textAlign:"center", padding:40, color:"#aaa" }}><div style={{fontSize:36}}>📭</div><div style={{fontWeight:700,marginTop:8}}>Tidak ada transaksi</div></div>
            : sortedDates.map(dk => {
              const dayTrxs = grouped[dk];
              const dayDate = new Date(dk+"T00:00:00");
              const dayTotal = dayTrxs.reduce((s,t)=>s+t.grandTotal,0);
              return (
                <div key={dk}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <span style={{ fontWeight:800, fontSize:13, color:"#3d1f00" }}>{HARI[dayDate.getDay()]}, {dayDate.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</span>
                    <span style={{ fontWeight:900, fontSize:13, color:"#c47a1e" }}>{formatRp(dayTotal)}</span>
                  </div>
                  {dayTrxs.map(trx => (
                    <div key={trx.id} style={{ background:"#fff", borderRadius:13, padding:"12px 14px", marginBottom:10, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                        <div>
                          <span style={{ fontSize:11, color:"#999" }}>🕐 {new Date(trx.timestamp).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}</span>
                          <span style={{ fontSize:11, color:"#c47a1e", fontWeight:700, marginLeft:8 }}>👤 {trx.kasirName}</span>
                        </div>
                          <span style={{ fontWeight:900, color:"#c47a1e", fontSize:14 }}>{formatRp(trx.grandTotal)}</span>
                      </div>
                      {trx.pelanggan.map((p,i) => (
                        <div key={i} style={{ marginBottom:6, background:"#fdf6ec", borderRadius:9, padding:"8px 10px", borderLeft:"3px solid #c47a1e" }}>
                          <div style={{ fontSize:12, fontWeight:800, color:"#3d1f00", marginBottom:4 }}>
                            👤 {p.name} <span style={{ color:"#c47a1e", marginLeft:8 }}>{formatRp(p.subtotal)}</span>
                          </div>
                          {p.items.map((item,j) => (
                            <div key={j} style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#666", paddingLeft:4 }}>
                              <span>{item.name} ×{item.qty}</span>
                              <span>{formatRp(item.price*item.qty)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                      <div style={{ fontSize:11, color:"#aaa", borderTop:"1px solid #f0f0f0", paddingTop:5 }}>
                        Bayar {formatRp(trx.bayar)} · Kembalian {formatRp(trx.kembalian)}
                      </div>
                      <DeleteBtn id={trx.id} onConfirm={hapusTrx} />
                    </div>
                  ))}
                </div>
              );
            })
          }
        </>
      )}

      {tab === "log" && (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontWeight:800, fontSize:14, color:"#7a4a00" }}>📋 Semua Aktivitas Karyawan</div>
            {logs.length > 0 && (
              confirmId === "all-logs"
                ? <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>{ setLogs([]); setConfirmId(null); }} style={{ padding:"6px 14px", borderRadius:10, border:"none", background:"#ef4444", color:"#fff", fontWeight:800, fontSize:12, cursor:"pointer" }}>✓ Ya, Hapus Semua</button>
                    <button onClick={()=>setConfirmId(null)} style={{ padding:"6px 14px", borderRadius:10, border:"none", background:"#e5e7eb", color:"#555", fontWeight:700, fontSize:12, cursor:"pointer" }}>✕ Batal</button>
                  </div>
                : <button onClick={()=>setConfirmId("all-logs")} style={{ padding:"5px 12px", borderRadius:10, border:"none", background:"#fee2e2", color:"#ef4444", fontWeight:700, fontSize:11, cursor:"pointer" }}>
                    🗑 Hapus Semua
                  </button>
            )}
          </div>
          {logs.length === 0
            ? <div style={{ textAlign:"center", padding:40, color:"#aaa" }}>Belum ada log</div>
            : logs.map((log) => (
              <div key={log.id} style={{ background:"#fff", borderRadius:11, padding:"10px 13px", marginBottom:8, boxShadow:"0 1px 6px rgba(0,0,0,0.07)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:3 }}>
                  <span style={{ fontWeight:800, fontSize:12, color: log.action.includes("LOGIN") ? "#3498db" : log.action.includes("TRANSAKSI") ? "#22c55e" : log.action.includes("SHIFT") ? "#f39c12" : "#888" }}>
                    {log.action}
                  </span>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:10, color:"#aaa" }}>{new Date(log.timestamp).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}</span>
                    <DeleteBtn id={log.id} onConfirm={hapusLog} />
                  </div>
                </div>
                <div style={{ fontSize:11, color:"#666" }}>👤 {log.user} {log.detail && `· ${log.detail}`}</div>
                <div style={{ fontSize:10, color:"#bbb" }}>{new Date(log.timestamp).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}</div>
              </div>
            ))
          }
        </>
      )}
    </div>
  );
}

// ════════════════════════════════
// STOK VIEW (OWNER ONLY) — Auto dari transaksi
// ════════════════════════════════

// Map nama menu ke nama stok item
const MENU_TO_STOK = {
  "Sate Usus": "Sate Usus",
  "Sate Taichan (per pcs)": "Sate Taichan (per pcs)",
  "Sate Kulit": "Sate Kulit",
  "Sate Ati Ampela": "Sate Ati Ampela",
  "Nuget": "Nuget",
  "Sosis": "Sosis",
  "Bakso": "Bakso",
  "Dumpling Ayam": "Dumpling Ayam",
  "Dumpling Keju": "Dumpling Keju",
  "Chikuwa": "Chikuwa",
  "Daging Saikoro": "Daging Saikoro",
  "Sayap": "Sayap",
  "Sate Taichan (10 tusuk)": "Sate Taichan (per pcs)", // 10 tusuk = 10 pcs
  "Mie Indomie Goreng": "Mie Indomie",
  "Mie Indomie Goreng + Telur": "Mie Indomie",
  "Mie Indomie Goreng + Telur + Kornet": "Mie Indomie",
  "Mie Indomie Rebus": "Mie Indomie",
  "Mie Indomie Rebus + Telur": "Mie Indomie",
  "Mie Indomie Rebus + Telur + Kornet": "Mie Indomie",
  "Omlet": "Telur",
  "Baso Cuanki Instant": "Baso Cuanki",
  "Baso Cuanki Instant + Telur": "Baso Cuanki",
  "Pisang Bakar Coklat": "Pisang",
  "Pisang Bakar Coklat Keju": "Pisang",
  "Roti Bakar Coklat": "Roti tawar",
  "Roti Bakar Coklat Keju": "Roti tawar",
  "Kopi Item": "Kopi Item",
  "Kopi Good Day Cappucino": "Kopi Good Day Cappucino",
  "Kopi Torabika Moka": "Kopi Torabika Moka",
  "Kopi Gula Aren": "Kopi Gula Aren",
  "Teh Manis": "Teh Manis",
  "Lemon Tea": "Lemon Tea",
  "Teh Susu": "Teh Susu",
  "Ovaltine": "Ovaltine",
  "Ovaltine Keju": "Ovaltine Keju",
  "Milo": "Milo",
  "Milo Keju": "Milo Keju",
  "Bengbeng Drink": "Bengbeng Drink",
  "Susu Jahe Hangat": "Susu Jahe Hangat",
  "Nutrisari": "Nutrisari",
  "Extrajoss Susu": "Extrajoss Susu",
  "Chocolatos Drink": "Chocolatos Drink",
  "Air Mineral": "Air Mineral",
};

function hitungTerjualHari(history, dateKey) {
  const terjual = {};
  history.filter(t => toDateKey(t.timestamp) === dateKey).forEach(trx => {
    trx.pelanggan.forEach(p => {
      p.items.forEach(item => {
        const stokKey = MENU_TO_STOK[item.name];
        if (stokKey) {
          // Sate Taichan 10 tusuk = 10 pcs
          const qty = item.name === "Sate Taichan (10 tusuk)" ? item.qty * 10 : item.qty;
          terjual[stokKey] = (terjual[stokKey] || 0) + qty;
        }
      });
    });
  });
  return terjual;
}

function StokView({ stokData, setStokData, onLog, user, history }) {
  const today = toDateKey(new Date());
  const [tab, setTab] = useState("hari-ini");

  const terjualOtomatis = hitungTerjualHari(history, today);
  const todayAwal = stokData[today] || {};

  const handleAwal = (item, val) => {
    const num = parseInt(val) || 0;
    setStokData(prev => ({
      ...prev,
      [today]: { ...prev[today], [item]: num }
    }));
  };

  const handleSave = () => {
    onLog(createLog(user.name, "UPDATE STOK", `Stok awal tanggal ${today} diperbarui`));
    alert("Stok awal tersimpan!");
  };

  const sortedDates = Object.keys(stokData).sort((a,b)=>b.localeCompare(a));

  return (
    <div style={{ padding:14, overflowY:"auto", height:"calc(100vh - 58px)" }}>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {[["hari-ini","📦 Stok Hari Ini"],["riwayat","📅 Riwayat"]].map(([t,label]) => (
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1, padding:"9px 0", borderRadius:12, border:"none", cursor:"pointer",
            fontWeight:700, fontSize:12,
            background: tab===t ? "#c47a1e" : "#fff",
            color: tab===t ? "#fff" : "#7a4a00",
            boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
          }}>{label}</button>
        ))}
      </div>

      {tab === "hari-ini" ? (
        <>
          <div style={{ background:"#fff3cd", borderRadius:12, padding:"10px 13px", marginBottom:12, fontSize:12, color:"#856404", fontWeight:600 }}>
            📌 Input stok awal tiap pagi — terjual & sisa otomatis dihitung dari transaksi
          </div>

          {/* Summary card */}
          <div style={{ background:"linear-gradient(135deg,#3d1f00,#c47a1e)", borderRadius:14, padding:"12px 16px", marginBottom:14, color:"#fff" }}>
            <div style={{ fontSize:12, opacity:0.8, marginBottom:4 }}>Ringkasan Hari Ini</div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
              <span>Total item terjual</span>
              <span style={{ fontWeight:900 }}>{Object.values(terjualOtomatis).reduce((s,v)=>s+v,0)} pcs</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginTop:3 }}>
              <span>Item dengan stok habis</span>
              <span style={{ fontWeight:900, color:"#ffd700" }}>
                {STOK_ITEMS.filter(item => {
                  const awal = todayAwal[item] || 0;
                  const terjual = terjualOtomatis[item] || 0;
                  return awal > 0 && (awal - terjual) <= 0;
                }).length} item
              </span>
            </div>
          </div>

          {STOK_ITEMS.map(item => {
            const awal = todayAwal[item] || 0;
            const terjual = terjualOtomatis[item] || 0;
            const sisa = awal - terjual;
            const status = awal === 0 ? "empty" : sisa <= 0 ? "habis" : sisa <= 3 ? "kritis" : "aman";
            const statusColor = { empty:"#aaa", habis:"#ef4444", kritis:"#f39c12", aman:"#22c55e" };
            const statusLabel = { empty:"Belum diisi", habis:"⚠️ Habis!", kritis:"⚠️ Hampir habis", aman:"✅ Aman" };
            return (
              <div key={item} style={{ background:"#fff", borderRadius:13, padding:"12px 14px", marginBottom:8, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", borderLeft:`3px solid ${statusColor[status]}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div style={{ fontWeight:800, fontSize:13, color:"#3d1f00" }}>{item}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:statusColor[status] }}>{statusLabel[status]}</div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {/* Stok Awal — editable */}
                  <div>
                    <div style={{ fontSize:10, color:"#999", marginBottom:3 }}>Stok Awal</div>
                    <input type="number" value={awal||""} onChange={e=>handleAwal(item,e.target.value)}
                      placeholder="0"
                      style={{ width:"100%", padding:"6px 8px", borderRadius:8, border:"2px solid #e8d5b0", fontSize:14, fontWeight:700, outline:"none", boxSizing:"border-box", color:"#2d1a00" }} />
                  </div>
                  {/* Terjual — otomatis */}
                  <div>
                    <div style={{ fontSize:10, color:"#999", marginBottom:3 }}>Terjual 🔄</div>
                    <div style={{ padding:"6px 8px", borderRadius:8, background:"#f0fdf4", border:"2px solid #bbf7d0", fontSize:14, fontWeight:800, color:"#22c55e", textAlign:"center" }}>
                      {terjual}
                    </div>
                  </div>
                  {/* Sisa — otomatis */}
                  <div>
                    <div style={{ fontSize:10, color:"#999", marginBottom:3 }}>Sisa</div>
                    <div style={{ padding:"6px 8px", borderRadius:8, background: sisa<=0&&awal>0?"#fef2f2":sisa<=3&&awal>0?"#fff7ed":"#f8fafc", border:`2px solid ${sisa<=0&&awal>0?"#fca5a5":sisa<=3&&awal>0?"#fed7aa":"#e2e8f0"}`, fontSize:14, fontWeight:800, color:statusColor[status]==="aman"?"#2d1a00":statusColor[status], textAlign:"center" }}>
                      {awal > 0 ? sisa : "-"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={handleSave} style={{
            width:"100%", padding:"13px 0", borderRadius:12, border:"none",
            background:"linear-gradient(135deg,#c47a1e,#f5a623)", color:"#fff",
            fontWeight:900, fontSize:15, cursor:"pointer", marginBottom:20,
            boxShadow:"0 3px 12px rgba(196,122,30,0.4)",
          }}>💾 Simpan Stok Awal</button>
        </>
      ) : (
        <>
          <div style={{ fontWeight:800, fontSize:14, marginBottom:10, color:"#7a4a00" }}>Riwayat Stok</div>
          {sortedDates.length === 0
            ? <div style={{ textAlign:"center", padding:40, color:"#aaa" }}>Belum ada data stok</div>
            : sortedDates.map(dk => {
              const d = new Date(dk+"T00:00:00");
              const dayAwal = stokData[dk] || {};
              const dayTerjual = hitungTerjualHari(history, dk);
              return (
                <div key={dk} style={{ background:"#fff", borderRadius:13, padding:"12px 14px", marginBottom:10, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
                  <div style={{ fontWeight:800, fontSize:13, color:"#3d1f00", marginBottom:8 }}>
                    {HARI[d.getDay()]}, {d.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}
                  </div>
                  {STOK_ITEMS.filter(item => dayAwal[item] > 0 || dayTerjual[item] > 0).map(item => {
                    const awal = dayAwal[item] || 0;
                    const terjual = dayTerjual[item] || 0;
                    const sisa = awal - terjual;
                    return (
                      <div key={item} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"4px 0", borderBottom:"1px dashed #f0e8d8", color: sisa<0?"#ef4444":"#444" }}>
                        <span style={{ flex:1 }}>{item}</span>
                        <span style={{ color:"#999", marginRight:8 }}>Awal: {awal}</span>
                        <span style={{ color:"#22c55e", marginRight:8 }}>Jual: {terjual}</span>
                        <span style={{ fontWeight:700, color: sisa<0?"#ef4444":sisa<=3?"#f39c12":"#2d1a00" }}>Sisa: {sisa}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          }
        </>
      )}
    </div>
  );
}

// ════════════════════════════════
// KASIR VIEW (KARYAWAN)
// ════════════════════════════════
function KasirView({ user, onTransaksi, onLog }) {
  const [pelanggan, setPelanggan] = useState([]);
  const [activePelanggan, setActivePelanggan] = useState(null);
  const [newName, setNewName] = useState("");
  const [activeCategory, setActiveCategory] = useState("Aneka Sate-Satean");
  const [search, setSearch] = useState("");
  const [bayar, setBayar] = useState("");
  const [page, setPage] = useState("kasir");
  const [showSuccess, setShowSuccess] = useState(false);

  const addPelanggan = () => {
    const name = newName.trim(); if (!name) return;
    const id = Date.now();
    const p = { id, name, cart:{}, color: COLORS[pelanggan.length % COLORS.length] };
    setPelanggan(prev=>[...prev,p]); setActivePelanggan(id); setNewName("");
  };

  const removePelanggan = (id) => {
    setPelanggan(prev=>prev.filter(p=>p.id!==id));
    if(activePelanggan===id) setActivePelanggan(pelanggan.find(p=>p.id!==id)?.id||null);
  };

  const updateCart = (pid, item, delta) => {
    setPelanggan(prev=>prev.map(p=>{
      if(p.id!==pid) return p;
      const cart={...p.cart}; const cur=cart[item.id]?.qty||0; const next=cur+delta;
      if(next<=0) delete cart[item.id]; else cart[item.id]={...item,qty:next};
      return {...p,cart};
    }));
  };

  const activePerson = pelanggan.find(p=>p.id===activePelanggan);
  const grandTotal = pelanggan.reduce((sum,p)=>sum+Object.values(p.cart).reduce((s,i)=>s+i.price*i.qty,0),0);
  const bayarNum = parseInt(bayar.replace(/\D/g,""))||0;
  const kembalian = bayarNum - grandTotal;

  const handleBayar = () => {
    if(pelanggan.length===0||grandTotal===0||kembalian<0) return;
    const now = new Date();
    const trx = {
      id: now.getTime(), timestamp: now.toISOString(),
      kasirName: user.name, kasirUsername: user.username,
      pelanggan: pelanggan.map(p=>({ name:p.name, items:Object.values(p.cart), subtotal:Object.values(p.cart).reduce((s,i)=>s+i.price*i.qty,0) })),
      grandTotal, bayar:bayarNum, kembalian,
    };
    onTransaksi(trx);
    onLog(createLog(user.name, "TRANSAKSI", `Total ${formatRp(grandTotal)} · ${pelanggan.length} pelanggan`));
    setPelanggan([]); setActivePelanggan(null); setBayar(""); setPage("kasir");
    setShowSuccess(true); setTimeout(()=>setShowSuccess(false), 2500);
  };

  const allItems = Object.values(MENU).flat();
  const displayItems = search ? allItems.filter(i=>i.name.toLowerCase().includes(search.toLowerCase())) : MENU[activeCategory];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 58px)" }}>
      {showSuccess && (
        <div style={{ position:"fixed", top:68, left:"50%", transform:"translateX(-50%)", background:"#22c55e", color:"#fff", padding:"11px 26px", borderRadius:30, fontWeight:800, fontSize:14, zIndex:999, boxShadow:"0 4px 20px rgba(34,197,94,0.4)" }}>✅ Transaksi Berhasil!</div>
      )}

      {/* Sub tabs */}
      <div style={{ display:"flex", borderBottom:"2px solid #f0e0c0", background:"#fff" }}>
        {["kasir","checkout"].map(v=>(
          <button key={v} onClick={()=>setPage(v)} style={{
            flex:1, padding:"10px 0", border:"none", cursor:"pointer",
            fontWeight:700, fontSize:12,
            background: page===v ? "#fff" : "#fdf6ec",
            color: page===v ? "#c47a1e" : "#aaa",
            borderBottom: page===v ? "2px solid #c47a1e" : "none",
          }}>
            {v==="kasir" ? "🍢 Pesan" : `🧾 Checkout${grandTotal>0?" ("+formatRp(grandTotal)+")":""}`}
          </button>
        ))}
      </div>

      {page==="kasir" && (
        <>
          <div style={{ padding:"10px 14px 0", display:"flex", gap:8 }}>
            <input placeholder="Nama pelanggan..." value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPelanggan()}
              style={{ flex:1, padding:"8px 13px", borderRadius:20, border:"2px solid #e8d5b0", background:"#fff", fontSize:13, outline:"none", color:"#2d1a00" }} />
            <button onClick={addPelanggan} style={{ padding:"8px 16px", borderRadius:20, border:"none", background:"#c47a1e", color:"#fff", fontWeight:800, fontSize:13, cursor:"pointer" }}>+ Tambah</button>
          </div>

          {pelanggan.length > 0 && (
            <div style={{ display:"flex", gap:7, padding:"10px 14px 0", overflowX:"auto" }}>
              {pelanggan.map(p=>{
                const sub=Object.values(p.cart).reduce((s,i)=>s+i.price*i.qty,0);
                const isActive=activePelanggan===p.id;
                return (
                  <div key={p.id} onClick={()=>setActivePelanggan(p.id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:20, cursor:"pointer", background:isActive?p.color:"#fff", color:isActive?"#fff":"#555", fontWeight:700, fontSize:12, whiteSpace:"nowrap", boxShadow:isActive?`0 2px 10px ${p.color}66`:"0 1px 4px rgba(0,0,0,0.1)", border:isActive?"none":`2px solid ${p.color}44` }}>
                    <span>{p.name}</span>
                    {sub>0&&<span style={{fontSize:10,opacity:0.85}}>{formatRp(sub)}</span>}
                    <span onClick={e=>{e.stopPropagation();removePelanggan(p.id);}} style={{marginLeft:2,opacity:0.7,fontSize:13}}>×</span>
                  </div>
                );
              })}
            </div>
          )}

          {pelanggan.length===0 && (
            <div style={{ textAlign:"center", padding:"24px 20px", color:"#b8966e" }}>
              <div style={{fontSize:32,marginBottom:6}}>👤</div>
              <div style={{fontWeight:700}}>Tambah nama pelanggan dulu!</div>
            </div>
          )}

          {activePerson && (
            <>
              <div style={{ padding:"10px 14px 0" }}>
                <input placeholder="🔍 Cari menu..." value={search} onChange={e=>setSearch(e.target.value)}
                  style={{ width:"100%", padding:"8px 13px", borderRadius:20, border:"2px solid #e8d5b0", background:"#fff", fontSize:13, outline:"none", boxSizing:"border-box", color:"#2d1a00" }} />
              </div>
              {!search && (
                <div style={{ display:"flex", gap:7, padding:"8px 14px", overflowX:"auto" }}>
                  {Object.keys(MENU).map(cat=>(
                    <button key={cat} onClick={()=>setActiveCategory(cat)} style={{ whiteSpace:"nowrap", padding:"6px 13px", borderRadius:20, border:"none", cursor:"pointer", fontWeight:700, fontSize:11, background:activeCategory===cat?"#c47a1e":"#fff", color:activeCategory===cat?"#fff":"#7a4a00", boxShadow:activeCategory===cat?"0 2px 8px rgba(196,122,30,0.35)":"0 1px 4px rgba(0,0,0,0.08)" }}>
                      {CATEGORY_ICONS[cat]} {cat}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {activePerson && (
            <div style={{ flex:1, overflowY:"auto", padding:"6px 14px 14px", display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:9, alignContent:"start" }}>
              {displayItems.map(item=>{
                const qty=activePerson.cart[item.id]?.qty||0;
                return (
                  <div key={item.id} style={{ background:"#fff", borderRadius:13, padding:"11px 10px", boxShadow:qty>0?`0 0 0 2px ${activePerson.color}, 0 2px 8px rgba(0,0,0,0.08)`:"0 2px 8px rgba(0,0,0,0.06)", position:"relative", transition:"all 0.15s" }}>
                    {qty>0&&<div style={{ position:"absolute", top:7, right:7, background:activePerson.color, color:"#fff", borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900 }}>{qty}</div>}
                    <div style={{ fontSize:11, fontWeight:700, marginBottom:3, lineHeight:1.3, paddingRight:qty>0?18:0 }}>{item.name}</div>
                    <div style={{ fontSize:12, fontWeight:900, color:"#c47a1e", marginBottom:7 }}>{formatRp(item.price)}</div>
                    <div style={{ display:"flex", gap:5 }}>
                      <button onClick={()=>updateCart(activePerson.id,item,-1)} style={{ width:28, height:28, borderRadius:7, border:"none", background:qty>0?"#fff0dc":"#f0f0f0", color:qty>0?"#c47a1e":"#ccc", fontWeight:900, fontSize:15, cursor:qty>0?"pointer":"default" }}>−</button>
                      <button onClick={()=>updateCart(activePerson.id,item,1)} style={{ flex:1, height:28, borderRadius:7, border:"none", background:activePerson.color, color:"#fff", fontWeight:700, fontSize:11, cursor:"pointer" }}>+ Tambah</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {page==="checkout" && (
        <div style={{ flex:1, overflowY:"auto", padding:14 }}>
          {pelanggan.length===0
            ? <div style={{ textAlign:"center", padding:40, color:"#aaa" }}><div style={{fontSize:36}}>🛒</div><div style={{fontWeight:700,marginTop:8}}>Belum ada pesanan</div></div>
            : <>
              {pelanggan.map(p=>{
                const items=Object.values(p.cart);
                const sub=items.reduce((s,i)=>s+i.price*i.qty,0);
                return (
                  <div key={p.id} style={{ background:"#fff", borderRadius:14, marginBottom:12, overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.07)", border:`2px solid ${p.color}33` }}>
                    <div style={{ background:p.color, padding:"9px 14px", display:"flex", justifyContent:"space-between" }}>
                      <span style={{ color:"#fff", fontWeight:800, fontSize:14 }}>👤 {p.name}</span>
                      <span style={{ color:"#fff", fontWeight:900, fontSize:14 }}>{formatRp(sub)}</span>
                    </div>
                    <div style={{ padding:"10px 14px" }}>
                      {items.length===0
                        ? <div style={{ fontSize:12, color:"#aaa", fontStyle:"italic" }}>Belum pesan apa-apa</div>
                        : items.map(item=>(
                          <div key={item.id} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"3px 0", color:"#444", borderBottom:"1px dashed #f0e8d8" }}>
                            <span>{item.name} <span style={{color:"#999"}}>×{item.qty}</span></span>
                            <span style={{fontWeight:700}}>{formatRp(item.price*item.qty)}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                );
              })}

              <div style={{ background:"linear-gradient(135deg,#3d1f00,#c47a1e)", borderRadius:14, padding:"16px 18px", marginBottom:12, color:"#fff" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{fontSize:13,opacity:0.8}}>Jumlah Pelanggan</span>
                  <span style={{fontWeight:700}}>{pelanggan.length} orang</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:17, fontWeight:900 }}>
                  <span>Grand Total</span><span>{formatRp(grandTotal)}</span>
                </div>
              </div>

              <div style={{ background:"#fff", borderRadius:14, padding:14, boxShadow:"0 2px 10px rgba(0,0,0,0.07)" }}>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#7a4a00" }}>Pembayaran</div>
                <input placeholder="Masukkan uang bayar..." value={bayar} onChange={e=>setBayar(e.target.value)} type="number"
                  style={{ width:"100%", padding:"10px 13px", borderRadius:10, border:"2px solid #e8d5b0", fontSize:14, outline:"none", boxSizing:"border-box", color:"#2d1a00", marginBottom:8 }} />
                {bayarNum>0 && (
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", borderRadius:10, background:kembalian>=0?"#f0fdf4":"#fef2f2", marginBottom:10 }}>
                    <span style={{fontSize:13,fontWeight:700}}>Kembalian</span>
                    <span style={{ fontWeight:900, color:kembalian>=0?"#22c55e":"#ef4444", fontSize:15 }}>{kembalian>=0?formatRp(kembalian):"Uang kurang!"}</span>
                  </div>
                )}
                <button onClick={handleBayar} disabled={grandTotal===0||kembalian<0} style={{
                  width:"100%", padding:"13px 0", borderRadius:12, border:"none",
                  background:grandTotal>0&&kembalian>=0?"linear-gradient(135deg,#c47a1e,#f5a623)":"#ddd",
                  color:"#fff", fontWeight:900, fontSize:16, cursor:"pointer",
                  boxShadow:grandTotal>0&&kembalian>=0?"0 3px 12px rgba(196,122,30,0.4)":"none",
                }}>✅ Selesaikan Transaksi</button>
              </div>
            </>
          }
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════
// MAIN APP
// ════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("kasir");
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stokData, setStokData] = useState({});
  const [shiftOpen, setShiftOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Load data from Supabase on mount + auto-refresh every 10s
  const loadData = async (showSync=false) => {
    if (showSync) setSyncing(true);
    try {
      const trx = await sbSelect("transaksi");
      if (trx) setHistory(trx.map(t => ({
        id: t.id, timestamp: t.timestamp, kasirName: t.kasir_name,
        pelanggan: t.pelanggan, grandTotal: t.grand_total,
        bayar: t.bayar, kembalian: t.kembalian,
      })));

      const stok = await sbSelect("stok_awal");
      if (stok) {
        const obj = {};
        stok.forEach(s => { obj[s.tanggal] = s.data; });
        setStokData(obj);
      }

      const lg = await sbSelect("activity_logs");
      if (lg) setLogs(lg.map(l => ({
        id: l.id, timestamp: l.timestamp, user: l.username,
        action: l.action, detail: l.detail,
      })));
    } catch(e) { console.error("Load error:", e); }
    if (showSync) setSyncing(false);
  };

  useEffect(() => {
    loadData(true);
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => loadData(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const addLog = async (log) => {
    setLogs(prev => [log, ...prev]);
    await sbInsert("activity_logs", {
      id: log.id, timestamp: log.timestamp,
      username: log.user, action: log.action, detail: log.detail,
    });
  };

  const handleLogin = (acc) => {
    setUser(acc);
    addLog(createLog(acc.name, "LOGIN", `Login sebagai ${acc.role}`));
    setView(acc.role === "owner" ? "rekap" : "kasir");
    if (acc.role === "karyawan") setShiftOpen(true);
  };

  const handleLogout = () => {
    if (user) addLog(createLog(user.name, "LOGOUT", "Keluar dari aplikasi"));
    setUser(null); setShiftOpen(false);
  };

  const handleTutupShift = () => {
    addLog(createLog(user.name, "TUTUP SHIFT", `Shift ditutup pukul ${new Date().toLocaleTimeString("id-ID")}`));
    handleLogout();
  };

  // Save transaksi to Supabase
  const handleTransaksi = async (trx) => {
    setHistory(prev => [trx, ...prev]);
    await sbInsert("transaksi", {
      id: trx.id, timestamp: trx.timestamp, kasir_name: trx.kasirName,
      pelanggan: trx.pelanggan, grand_total: trx.grandTotal,
      bayar: trx.bayar, kembalian: trx.kembalian,
    });
  };

  // Save stok to Supabase
  const handleSetStok = async (updater) => {
    const newStok = typeof updater === "function" ? updater(stokData) : updater;
    setStokData(newStok);
    // Save all dates
    for (const [tanggal, data] of Object.entries(newStok)) {
      await sbFetch("stok_awal?tanggal=eq."+tanggal, "DELETE");
      await sbFetch("stok_awal", "POST", { tanggal, data });
    }
  };

  // Delete handlers synced to Supabase
  const handleSetHistory = async (updater) => {
    const prev = history;
    const next = typeof updater === "function" ? updater(prev) : updater;
    setHistory(next);
    const deleted = prev.find(t => !next.find(n => n.id === t.id));
    if (deleted) await sbDelete("transaksi", `id=eq.${deleted.id}`);
  };

  const handleSetLogs = async (updater) => {
    const prev = logs;
    const next = typeof updater === "function" ? updater(prev) : updater;
    setLogs(next);
    if (next.length === 0) {
      // hapus semua
      for (const l of prev) await sbDelete("activity_logs", `id=eq.${l.id}`);
    } else {
      const deleted = prev.find(l => !next.find(n => n.id === l.id));
      if (deleted) await sbDelete("activity_logs", `id=eq.${deleted.id}`);
    }
  };

  if (!user && syncing) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a0a00,#3d1f00)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:28, fontWeight:900, color:"#f5c842", marginBottom:12 }}>SAe Angkringan</div>
      <div style={{ color:"#c9a96e", fontSize:14 }}>⏳ Memuat data...</div>
    </div>
  );

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={{ fontFamily:"'Nunito','Segoe UI',sans-serif", background:"#fdf6ec", minHeight:"100vh", color:"#2d1a00" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#1a0a00,#3d1f00)", padding:"11px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 3px 12px rgba(0,0,0,0.3)" }}>
        <div>
          <div style={{ fontSize:18, fontWeight:900, color:"#f5c842" }}>SAe Angkringan</div>
          <div style={{ fontSize:10, color: user.role==="owner" ? "#f5c842" : "#c9a96e" }}>
            {user.role==="owner" ? "👑 Owner" : `👤 ${user.name}`}
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {user.role === "owner" && (
            <>
              {[["rekap","📊"],["stok","📦"]].map(([v,icon])=>(
                <button key={v} onClick={()=>setView(v)} style={{ padding:"6px 11px", borderRadius:20, border:"none", cursor:"pointer", fontWeight:700, fontSize:11, background:view===v?"#f5c842":"rgba(255,255,255,0.1)", color:view===v?"#1a0a00":"#f5c842" }}>
                  {icon} {v.charAt(0).toUpperCase()+v.slice(1)}
                </button>
              ))}
            </>
          )}
          {user.role === "karyawan" && (
            <button onClick={handleTutupShift} style={{ padding:"6px 12px", borderRadius:20, border:"none", cursor:"pointer", fontWeight:700, fontSize:11, background:"#ef4444", color:"#fff" }}>
              🔒 Tutup Shift
            </button>
          )}
          <button onClick={handleLogout} style={{ padding:"6px 11px", borderRadius:20, border:"none", cursor:"pointer", fontWeight:700, fontSize:11, background:"rgba(255,255,255,0.1)", color:"#f5c842" }}>
            Keluar
          </button>
        </div>
      </div>

      {/* Content */}
      {user.role === "karyawan" && (
        <KasirView user={user} onTransaksi={handleTransaksi} onLog={addLog} />
      )}
      {user.role === "owner" && view === "rekap" && <RekapView history={history} setHistory={handleSetHistory} logs={logs} setLogs={handleSetLogs} />}
      {user.role === "owner" && view === "stok" && <StokView stokData={stokData} setStokData={handleSetStok} onLog={addLog} user={user} history={history} />}
    </div>
  );
}
