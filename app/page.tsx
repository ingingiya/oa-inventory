"use client";

import { useState, useCallback } from "react";
import * as XLSX from "xlsx";

interface SkuRow {
  category: string;
  name: string;
  barcode: string;
  dailySales: number;
  plan15: number;
  planOutbound: number;
  actualOutbound: number;
  revenue: number;
  orders: number;
}

const MASTER_DATA: SkuRow[] = [
  { category:"이미용", name:"오아소닉플로우-베이지",        barcode:"8809822427970", dailySales:30, plan15:450, planOutbound:500, actualOutbound:0, revenue:0, orders:0 },
  { category:"이미용", name:"오아소닉플로우-핑크",           barcode:"8809822428823", dailySales:15, plan15:225, planOutbound:300, actualOutbound:0, revenue:0, orders:0 },
  { category:"이미용", name:"오아소닉플로우-그레이",         barcode:"8809822428816", dailySales:15, plan15:225, planOutbound:300, actualOutbound:0, revenue:0, orders:0 },
  { category:"이미용", name:"오아프리온무선고데기-핑크",     barcode:"8809822428519", dailySales:20, plan15:300, planOutbound:500, actualOutbound:0, revenue:0, orders:0 },
  { category:"이미용", name:"오아에어리미니-블루",           barcode:"8809822428502", dailySales:10, plan15:150, planOutbound:300, actualOutbound:0, revenue:0, orders:0 },
  { category:"이미용", name:"오아에어리소닉드라이기-베이지", barcode:"8809822425549", dailySales:15, plan15:225, planOutbound:300, actualOutbound:0, revenue:0, orders:0 },
  { category:"이미용", name:"오아에어리소닉드라이기-핑크",   barcode:"8809822425136", dailySales:10, plan15:150, planOutbound:200, actualOutbound:0, revenue:0, orders:0 },
  { category:"이미용", name:"오아오토고데기40mm-퍼플",      barcode:"8809822425044", dailySales:10, plan15:150, planOutbound:200, actualOutbound:0, revenue:0, orders:0 },
  { category:"이미용", name:"오아듀얼히팅뷰러-핑크",        barcode:"8809822427611", dailySales:20, plan15:300, planOutbound:300, actualOutbound:0, revenue:0, orders:0 },
  { category:"이미용", name:"오아듀얼히팅뷰러-화이트",      barcode:"8809822425877", dailySales:20, plan15:300, planOutbound:300, actualOutbound:0, revenue:0, orders:0 },
  { category:"이미용", name:"오아미니핏고데기-블루",         barcode:"8809822428120", dailySales:5,  plan15:75,  planOutbound:50,  actualOutbound:0, revenue:0, orders:0 },
  { category:"이미용", name:"오아미니핏고데기-핑크",         barcode:"8809822428106", dailySales:5,  plan15:75,  planOutbound:50,  actualOutbound:0, revenue:0, orders:0 },
  { category:"이미용", name:"오아베이직빗고데기-베이지",     barcode:"8809822429523", dailySales:5,  plan15:75,  planOutbound:50,  actualOutbound:0, revenue:0, orders:0 },
  { category:"이미용", name:"오아베이직빗고데기-블루",       barcode:"8809822429530", dailySales:5,  plan15:75,  planOutbound:50,  actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이워터B-UV-포그밀크",       barcode:"8809822428724", dailySales:60, plan15:900,  planOutbound:974, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이워터B-UV-차콜스톤",       barcode:"8809822428748", dailySales:70, plan15:750,  planOutbound:200, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이워터B-UV-클라우디블루",   barcode:"8809822428731", dailySales:50, plan15:750,  planOutbound:200, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이워터B",                   barcode:"8809487308195", dailySales:40, plan15:600,  planOutbound:974, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이워터BD전용거치대",         barcode:"8809822422173", dailySales:40, plan15:600,  planOutbound:480, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이소프트리필칫솔모2P-화이트",barcode:"8809487307518", dailySales:85, plan15:1275, planOutbound:600, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이소프트리필칫솔모2P-블랙", barcode:"8809487307808", dailySales:55, plan15:825,  planOutbound:400, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이소프트미세모2p-화이트",   barcode:"8809487308751", dailySales:35, plan15:525,  planOutbound:300, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이스윙-블랙",               barcode:"8809822427116", dailySales:20, plan15:300,  planOutbound:480, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이스윙-화이트",             barcode:"8809822427109", dailySales:20, plan15:300,  planOutbound:480, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이소프트미세모2p-블랙",     barcode:"8809487308768", dailySales:20, plan15:300,  planOutbound:200, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이퓨어Pro-화이트",          barcode:"8809822420087", dailySales:20, plan15:150,  planOutbound:300, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이워터전용제트팁2P",         barcode:"8809487308300", dailySales:20, plan15:300,  planOutbound:300, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이퓨어Pro-클라우디블루",    barcode:"8809822429264", dailySales:20, plan15:75,   planOutbound:200, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이퓨어Pro-코튼핑크",        barcode:"8809822429257", dailySales:15, plan15:75,   planOutbound:200, actualOutbound:0, revenue:0, orders:0 },
  { category:"욕실", name:"오아클린이워터전용5종팁세트",        barcode:"8809487308317", dailySales:15, plan15:225,  planOutbound:200, actualOutbound:0, revenue:0, orders:0 },
  { category:"계절", name:"오아아이스볼트맥스-베이지", barcode:"8809822426591", dailySales:30, plan15:450, planOutbound:640, actualOutbound:0, revenue:0, orders:0 },
  { category:"계절", name:"오아에어쿨핸디",           barcode:"8809822424672", dailySales:20, plan15:300, planOutbound:0,   actualOutbound:0, revenue:0, orders:0 },
  { category:"계절", name:"오아아이스볼트-베이지",    barcode:"8809822426607", dailySales:15, plan15:225, planOutbound:0,   actualOutbound:0, revenue:0, orders:0 },
  { category:"계절", name:"오아스톰젯-메탈그레이",    barcode:"8809822427925", dailySales:10, plan15:150, planOutbound:0,   actualOutbound:0, revenue:0, orders:0 },
  { category:"계절", name:"오아아로먼트디퓨저-베이지",barcode:"8809822428229", dailySales:10, plan15:150, planOutbound:108, actualOutbound:0, revenue:0, orders:0 },
  { category:"계절", name:"오아아로먼트디퓨저-블랙",  barcode:"8809822428236", dailySales:10, plan15:150, planOutbound:108, actualOutbound:0, revenue:0, orders:0 },
  { category:"계절", name:"오아터보젯핸디팬",         barcode:"8809822424917", dailySales:5,  plan15:75,  planOutbound:702, actualOutbound:0, revenue:0, orders:0 },
  { category:"계절", name:"오아울트라젯핸디팬",       barcode:"8809822424931", dailySales:5,  plan15:75,  planOutbound:0,   actualOutbound:0, revenue:0, orders:0 },
  { category:"계절", name:"오아턴에어pro탁상팬",      barcode:"8809822424764", dailySales:5,  plan15:75,  planOutbound:0,   actualOutbound:0, revenue:0, orders:0 },
  { category:"건강", name:"오아히트스팟S-블랙",     barcode:"8809822427666", dailySales:15, plan15:225, planOutbound:225, actualOutbound:0, revenue:0, orders:0 },
  { category:"건강", name:"오아눈편한세상",          barcode:"8809487307204", dailySales:15, plan15:225, planOutbound:180, actualOutbound:0, revenue:0, orders:0 },
  { category:"건강", name:"오아히트스팟S-베이지",   barcode:"8809822427673", dailySales:10, plan15:150, planOutbound:225, actualOutbound:0, revenue:0, orders:0 },
  { category:"건강", name:"오아롤링스팟-블랙",      barcode:"8809822426164", dailySales:5,  plan15:75,  planOutbound:115, actualOutbound:0, revenue:0, orders:0 },
  { category:"건강", name:"오아효도손마사지기-블랙", barcode:"8809822425419", dailySales:5,  plan15:75,  planOutbound:60,  actualOutbound:0, revenue:0, orders:0 },
  { category:"모바일", name:"오아퀵롤차저65W-포그밀크",       barcode:"8809822428649", dailySales:25, plan15:375, planOutbound:400, actualOutbound:0, revenue:0, orders:0 },
  { category:"모바일", name:"오아퀵롤차저65W-어비스블랙",     barcode:"8809822429493", dailySales:25, plan15:375, planOutbound:400, actualOutbound:0, revenue:0, orders:0 },
  { category:"모바일", name:"오아큐브멀티탭PD35-그린",        barcode:"8809822427130", dailySales:5,  plan15:75,  planOutbound:90,  actualOutbound:0, revenue:0, orders:0 },
  { category:"모바일", name:"오아큐브멀티탭PD35-베이지",      barcode:"8809822427147", dailySales:5,  plan15:75,  planOutbound:90,  actualOutbound:0, revenue:0, orders:0 },
  { category:"모바일", name:"오아큐브멀티탭PD35-클라우디블루",barcode:"8809822429554", dailySales:5,  plan15:75,  planOutbound:90,  actualOutbound:0, revenue:0, orders:0 },
  { category:"인테리어", name:"오아데이클락-베이지",       barcode:"8809822428540", dailySales:10, plan15:150, planOutbound:150, actualOutbound:0, revenue:0, orders:0 },
  { category:"인테리어", name:"오아무선모던LED시계R-베이지",barcode:"8809822426799", dailySales:10, plan15:150, planOutbound:150, actualOutbound:0, revenue:0, orders:0 },
];

const CAT_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  이미용:   { bg: "#E6F1FB", text: "#185FA5", dot: "#378ADD" },
  욕실:     { bg: "#E1F5EE", text: "#0F6E56", dot: "#1D9E75" },
  계절:     { bg: "#FAEEDA", text: "#854F0B", dot: "#EF9F27" },
  건강:     { bg: "#FBEAF0", text: "#993556", dot: "#D4537E" },
  모바일:   { bg: "#EEEDFE", text: "#534AB7", dot: "#7F77DD" },
  인테리어: { bg: "#F1EFE8", text: "#5F5E5A", dot: "#888780" },
};
const DEFAULT_CAT = { bg: "#F1EFE8", text: "#5F5E5A", dot: "#888780" };
function catStyle(cat: string) { return CAT_COLOR[cat] ?? DEFAULT_CAT; }
function fmt(n: number) { return n.toLocaleString("ko-KR"); }

function parseOutboundFile(wb: XLSX.WorkBook, rows: SkuRow[]): SkuRow[] {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
  const barcodeMap = new Map<string, number>();
  rows.forEach((r, i) => barcodeMap.set(r.barcode, i));
  const updated = rows.map(r => ({ ...r, actualOutbound: 0, revenue: 0, orders: 0 }));
  for (const r of raw) {
    const barcode = r["SKU바코드"]
      ? String(typeof r["SKU바코드"] === "number" ? Math.round(r["SKU바코드"] as number) : r["SKU바코드"]).trim()
      : "";
    const idx = barcodeMap.get(barcode);
    if (idx === undefined) continue;
    updated[idx].actualOutbound += Number(r["출고 수량"] ?? 0);
    updated[idx].revenue += Number(r["주문단위 결제금액"] ?? 0);
    updated[idx].orders += 1;
  }
  return updated;
}

const TH: React.CSSProperties = { textAlign: "left", padding: "9px 14px", fontSize: 11, fontWeight: 500, color: "#aaa", whiteSpace: "nowrap", background: "#fdfcfa" };
const TD: React.CSSProperties = { padding: "10px 14px", verticalAlign: "middle" };

export default function Home() {
  const [rows, setRows] = useState<SkuRow[]>(MASTER_DATA);
  const [outboundFile, setOutboundFile] = useState("");
  const [outboundDate, setOutboundDate] = useState("");
  const [activeTab, setActiveTab] = useState("전체");
  const [sortKey, setSortKey] = useState<"actualOutbound" | "revenue" | "dailySales" | "">("actualOutbound");

  const handleOutbound = useCallback((file: File) => {
    setOutboundFile(file.name);
    const m = file.name.match(/(\d{8})/);
    if (m) setOutboundDate(`${m[1].slice(0,4)}-${m[1].slice(4,6)}-${m[1].slice(6,8)}`);
    const reader = new FileReader();
    reader.onload = e => {
      const wb = XLSX.read(e.target?.result, { type: "array" });
      setRows(parseOutboundFile(wb, MASTER_DATA));
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const categories = ["전체", ...Array.from(new Set(MASTER_DATA.map(r => r.category)))];
  let displayed = activeTab === "전체" ? rows : rows.filter(r => r.category === activeTab);
  if (sortKey) displayed = [...displayed].sort((a, b) => b[sortKey] - a[sortKey]);

  const totalOut = displayed.reduce((s, r) => s + r.actualOutbound, 0);
  const totalRev = displayed.reduce((s, r) => s + r.revenue, 0);
  const totalOrd = displayed.reduce((s, r) => s + r.orders, 0);
  const activeSkus = displayed.filter(r => r.actualOutbound > 0).length;
  const hasOut = outboundFile !== "";

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0" }}>
      <div style={{
        position: "fixed", top: 0, left: 0, width: 200, height: "100vh",
        background: "#fff", borderRight: "0.5px solid #e5e4de",
        display: "flex", flexDirection: "column", padding: "1.25rem 0", zIndex: 10,
      }}>
        <div style={{ padding: "0 1.25rem 1rem", borderBottom: "0.5px solid #f0ede8" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>OA Dashboard</div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>전사 재고 현황</div>
        </div>
        <div style={{ padding: "0.75rem 0.75rem 0", flex: 1, overflowY: "auto" }}>
          {categories.map(cat => {
            const cs = catStyle(cat);
            const count = cat === "전체" ? MASTER_DATA.length : MASTER_DATA.filter(r => r.category === cat).length;
            return (
              <button key={cat} onClick={() => setActiveTab(cat)} style={{
                width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 8,
                border: "none", cursor: "pointer", marginBottom: 2,
                background: activeTab === cat ? cs.bg : "transparent",
                color: activeTab === cat ? cs.text : "#888",
                fontWeight: activeTab === cat ? 500 : 400,
                fontSize: 13, display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {cat !== "전체" && <span style={{ width: 7, height: 7, borderRadius: "50%", background: cs.dot, flexShrink: 0 }} />}
                  {cat}
                </span>
                <span style={{ fontSize: 11, opacity: 0.6 }}>{count}</span>
              </button>
            );
          })}
        </div>
        <div style={{ padding: "0.75rem 1rem", borderTop: "0.5px solid #f0ede8", fontSize: 11, color: "#bbb" }}>
          {outboundDate ? `출고: ${outboundDate}` : "출고 파일 미업로드"}
        </div>
      </div>

      <div style={{ marginLeft: 200, padding: "1.5rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 500 }}>{activeTab === "전체" ? "전사 재고 현황" : `${activeTab} 재고 현황`}</h1>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>
              {hasOut ? `${outboundFile} 기준` : "아르고 출고 파일을 업로드해주세요"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {hasOut && (
              <select value={sortKey} onChange={e => setSortKey(e.target.value as typeof sortKey)}
                style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "0.5px solid #d4d0c8", background: "#fff", color: "#555", cursor: "pointer" }}>
                <option value="actualOutbound">출고 많은 순</option>
                <option value="revenue">매출 높은 순</option>
                <option value="dailySales">일판매량 순</option>
                <option value="">기본 순서</option>
              </select>
            )}
            <label style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, cursor: "pointer", background: hasOut ? "#fff" : "#1a1a1a", color: hasOut ? "#555" : "#fff", border: "0.5px solid #d4d0c8", fontWeight: hasOut ? 400 : 500 }}>
              {hasOut ? "출고 파일 교체" : "↑ 아르고 출고 파일 업로드"}
              <input type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleOutbound(f); }} />
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: "1.5rem" }}>
          {[
            { label: "전체 SKU", value: `${displayed.length}종` },
            { label: "출고 SKU", value: hasOut ? `${activeSkus}종` : "-", dim: !hasOut },
            { label: "총 출고", value: hasOut ? `${fmt(totalOut)}개` : "-", dim: !hasOut },
            { label: "총 주문", value: hasOut ? `${fmt(totalOrd)}건` : "-", dim: !hasOut },
            { label: "총 매출", value: hasOut ? `${(totalRev/10000).toFixed(0)}만원` : "-", dim: !hasOut },
          ].map(c => (
            <div key={c.label} style={{ background: "#ebe9e2", borderRadius: 8, padding: "13px 15px" }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 5 }}>{c.label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: c.dim ? "#ccc" : "#1a1a1a" }}>{c.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e5e4de", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={TH}>카테고리</th>
                <th style={TH}>제품명</th>
                <th style={TH}>바코드</th>
                <th style={{ ...TH, textAlign: "right" }}>일 판매량</th>
                <th style={{ ...TH, textAlign: "right" }}>15일 예상</th>
                <th style={{ ...TH, textAlign: "right" }}>계획 출고</th>
                <th style={{ ...TH, textAlign: "right" }}>
                  실 출고{outboundDate && <span style={{ fontWeight:400, color:"#bbb", marginLeft:4 }}>({outboundDate.slice(5)})</span>}
                </th>
                <th style={{ ...TH, textAlign: "right" }}>매출</th>
                <th style={{ ...TH, textAlign: "right" }}>주문건</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((row, i) => {
                const cs = catStyle(row.category);
                return (
                  <tr key={row.barcode + i} style={{ borderBottom: "0.5px solid #f8f7f4", background: i % 2 === 0 ? "#fff" : "#fdfcfa" }}>
                    <td style={TD}>
                      <span style={{ display:"inline-block", fontSize:11, padding:"2px 8px", borderRadius:20, background:cs.bg, color:cs.text, fontWeight:500, whiteSpace:"nowrap" }}>
                        {row.category}
                      </span>
                    </td>
                    <td style={{ ...TD, fontWeight:500, maxWidth:220 }}>
                      <span style={{ display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.name}</span>
                    </td>
                    <td style={{ ...TD, fontFamily:"monospace", fontSize:11, color:"#aaa" }}>{row.barcode}</td>
                    <td style={{ ...TD, textAlign:"right", color:"#888" }}>{fmt(row.dailySales)}</td>
                    <td style={{ ...TD, textAlign:"right", color:"#888" }}>{fmt(row.plan15)}</td>
                    <td style={{ ...TD, textAlign:"right" }}>{row.planOutbound > 0 ? fmt(row.planOutbound) : <span style={{ color:"#ddd" }}>-</span>}</td>
                    <td style={{ ...TD, textAlign:"right" }}>
                      {!hasOut ? <span style={{ color:"#ddd" }}>-</span>
                        : row.actualOutbound > 0 ? <span style={{ color:"#A32D2D", fontWeight:600 }}>{fmt(row.actualOutbound)}</span>
                        : <span style={{ color:"#ddd" }}>0</span>}
                    </td>
                    <td style={{ ...TD, textAlign:"right" }}>
                      {!hasOut ? <span style={{ color:"#ddd" }}>-</span>
                        : row.revenue > 0 ? <span style={{ color:"#0F6E56", fontWeight:500 }}>{fmt(row.revenue)}원</span>
                        : <span style={{ color:"#ddd" }}>-</span>}
                    </td>
                    <td style={{ ...TD, textAlign:"right" }}>
                      {!hasOut ? <span style={{ color:"#ddd" }}>-</span>
                        : row.orders > 0 ? fmt(row.orders)
                        : <span style={{ color:"#ddd" }}>-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {activeTab === "전체" && hasOut && (
          <div style={{ marginTop:"1.5rem", background:"#fff", borderRadius:12, border:"0.5px solid #e5e4de", padding:"1.25rem" }}>
            <p style={{ fontSize:11, fontWeight:500, color:"#aaa", letterSpacing:"0.05em", marginBottom:14 }}>카테고리별 출고 비중</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {Array.from(new Set(MASTER_DATA.map(r => r.category))).map(cat => {
                const catOut = rows.filter(r => r.category === cat).reduce((s, r) => s + r.actualOutbound, 0);
                const allOut = rows.reduce((s, r) => s + r.actualOutbound, 0);
                const pct = allOut > 0 ? (catOut / allOut) * 100 : 0;
                const cs = catStyle(cat);
                return (
                  <div key={cat} style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:60, fontSize:12, color:"#888", textAlign:"right" }}>{cat}</div>
                    <div style={{ flex:1, height:8, background:"#f1efe8", borderRadius:4 }}>
                      <div style={{ height:8, borderRadius:4, width:`${pct}%`, background:cs.dot }} />
                    </div>
                    <div style={{ fontSize:12, color:"#555", width:60 }}>{fmt(catOut)}개</div>
                    <div style={{ fontSize:11, color:"#bbb", width:40 }}>{pct.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
