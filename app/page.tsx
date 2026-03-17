"use client";

import { useState, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  avg7: number;
}

interface DailyRecord {
  date: string;
  outbound: Record<string, { qty: number; revenue: number; orders: number }>;
}

const MASTER_DATA: Omit<SkuRow, "actualOutbound"|"revenue"|"orders"|"avg7">[] = [
  { category:"이미용", name:"오아소닉플로우-베이지",         barcode:"8809822427970", dailySales:30, plan15:450,  planOutbound:500 },
  { category:"이미용", name:"오아소닉플로우-핑크",            barcode:"8809822428823", dailySales:15, plan15:225,  planOutbound:300 },
  { category:"이미용", name:"오아소닉플로우-그레이",          barcode:"8809822428816", dailySales:15, plan15:225,  planOutbound:300 },
  { category:"이미용", name:"오아프리온무선고데기-핑크",      barcode:"8809822428519", dailySales:20, plan15:300,  planOutbound:500 },
  { category:"이미용", name:"오아에어리미니-블루",            barcode:"8809822428502", dailySales:10, plan15:150,  planOutbound:300 },
  { category:"이미용", name:"오아에어리소닉드라이기-베이지",  barcode:"8809822425549", dailySales:15, plan15:225,  planOutbound:300 },
  { category:"이미용", name:"오아에어리소닉드라이기-핑크",    barcode:"8809822425136", dailySales:10, plan15:150,  planOutbound:200 },
  { category:"이미용", name:"오아오토고데기40mm-퍼플",       barcode:"8809822425044", dailySales:10, plan15:150,  planOutbound:200 },
  { category:"이미용", name:"오아듀얼히팅뷰러-핑크",         barcode:"8809822427611", dailySales:20, plan15:300,  planOutbound:300 },
  { category:"이미용", name:"오아듀얼히팅뷰러-화이트",       barcode:"8809822425877", dailySales:20, plan15:300,  planOutbound:300 },
  { category:"이미용", name:"오아미니핏고데기-블루",          barcode:"8809822428120", dailySales:5,  plan15:75,   planOutbound:50  },
  { category:"이미용", name:"오아미니핏고데기-핑크",          barcode:"8809822428106", dailySales:5,  plan15:75,   planOutbound:50  },
  { category:"이미용", name:"오아베이직빗고데기-베이지",      barcode:"8809822429523", dailySales:5,  plan15:75,   planOutbound:50  },
  { category:"이미용", name:"오아베이직빗고데기-블루",        barcode:"8809822429530", dailySales:5,  plan15:75,   planOutbound:50  },
  { category:"욕실", name:"오아클린이워터B-UV-포그밀크",        barcode:"8809822428724", dailySales:60, plan15:900,  planOutbound:974 },
  { category:"욕실", name:"오아클린이워터B-UV-차콜스톤",        barcode:"8809822428748", dailySales:70, plan15:750,  planOutbound:200 },
  { category:"욕실", name:"오아클린이워터B-UV-클라우디블루",    barcode:"8809822428731", dailySales:50, plan15:750,  planOutbound:200 },
  { category:"욕실", name:"오아클린이워터B",                    barcode:"8809487308195", dailySales:40, plan15:600,  planOutbound:974 },
  { category:"욕실", name:"오아클린이워터BD전용거치대",          barcode:"8809822422173", dailySales:40, plan15:600,  planOutbound:480 },
  { category:"욕실", name:"오아클린이소프트리필칫솔모2P-화이트", barcode:"8809487307518", dailySales:85, plan15:1275, planOutbound:600 },
  { category:"욕실", name:"오아클린이소프트리필칫솔모2P-블랙",  barcode:"8809487307808", dailySales:55, plan15:825,  planOutbound:400 },
  { category:"욕실", name:"오아클린이소프트미세모2p-화이트",    barcode:"8809487308751", dailySales:35, plan15:525,  planOutbound:300 },
  { category:"욕실", name:"오아클린이스윙-블랙",                barcode:"8809822427116", dailySales:20, plan15:300,  planOutbound:480 },
  { category:"욕실", name:"오아클린이스윙-화이트",              barcode:"8809822427109", dailySales:20, plan15:300,  planOutbound:480 },
  { category:"욕실", name:"오아클린이소프트미세모2p-블랙",      barcode:"8809487308768", dailySales:20, plan15:300,  planOutbound:200 },
  { category:"욕실", name:"오아클린이퓨어Pro-화이트",           barcode:"8809822420087", dailySales:20, plan15:150,  planOutbound:300 },
  { category:"욕실", name:"오아클린이워터전용제트팁2P",          barcode:"8809487308300", dailySales:20, plan15:300,  planOutbound:300 },
  { category:"욕실", name:"오아클린이퓨어Pro-클라우디블루",     barcode:"8809822429264", dailySales:20, plan15:75,   planOutbound:200 },
  { category:"욕실", name:"오아클린이퓨어Pro-코튼핑크",         barcode:"8809822429257", dailySales:15, plan15:75,   planOutbound:200 },
  { category:"욕실", name:"오아클린이워터전용5종팁세트",         barcode:"8809487308317", dailySales:15, plan15:225,  planOutbound:200 },
  { category:"계절", name:"오아아이스볼트맥스-베이지", barcode:"8809822426591", dailySales:30, plan15:450, planOutbound:640 },
  { category:"계절", name:"오아에어쿨핸디",           barcode:"8809822424672", dailySales:20, plan15:300, planOutbound:0   },
  { category:"계절", name:"오아아이스볼트-베이지",    barcode:"8809822426607", dailySales:15, plan15:225, planOutbound:0   },
  { category:"계절", name:"오아스톰젯-메탈그레이",    barcode:"8809822427925", dailySales:10, plan15:150, planOutbound:0   },
  { category:"계절", name:"오아아로먼트디퓨저-베이지",barcode:"8809822428229", dailySales:10, plan15:150, planOutbound:108 },
  { category:"계절", name:"오아아로먼트디퓨저-블랙",  barcode:"8809822428236", dailySales:10, plan15:150, planOutbound:108 },
  { category:"계절", name:"오아터보젯핸디팬",         barcode:"8809822424917", dailySales:5,  plan15:75,  planOutbound:702 },
  { category:"계절", name:"오아울트라젯핸디팬",       barcode:"8809822424931", dailySales:5,  plan15:75,  planOutbound:0   },
  { category:"계절", name:"오아턴에어pro탁상팬",      barcode:"8809822424764", dailySales:5,  plan15:75,  planOutbound:0   },
  { category:"건강", name:"오아히트스팟S-블랙",      barcode:"8809822427666", dailySales:15, plan15:225, planOutbound:225 },
  { category:"건강", name:"오아눈편한세상",           barcode:"8809487307204", dailySales:15, plan15:225, planOutbound:180 },
  { category:"건강", name:"오아히트스팟S-베이지",    barcode:"8809822427673", dailySales:10, plan15:150, planOutbound:225 },
  { category:"건강", name:"오아롤링스팟-블랙",       barcode:"8809822426164", dailySales:5,  plan15:75,  planOutbound:115 },
  { category:"건강", name:"오아효도손마사지기-블랙",  barcode:"8809822425419", dailySales:5,  plan15:75,  planOutbound:60  },
  { category:"모바일", name:"오아퀵롤차저65W-포그밀크",        barcode:"8809822428649", dailySales:25, plan15:375, planOutbound:400 },
  { category:"모바일", name:"오아퀵롤차저65W-어비스블랙",      barcode:"8809822429493", dailySales:25, plan15:375, planOutbound:400 },
  { category:"모바일", name:"오아큐브멀티탭PD35-그린",         barcode:"8809822427130", dailySales:5,  plan15:75,  planOutbound:90  },
  { category:"모바일", name:"오아큐브멀티탭PD35-베이지",       barcode:"8809822427147", dailySales:5,  plan15:75,  planOutbound:90  },
  { category:"모바일", name:"오아큐브멀티탭PD35-클라우디블루", barcode:"8809822429554", dailySales:5,  plan15:75,  planOutbound:90  },
  { category:"인테리어", name:"오아데이클락-베이지",        barcode:"8809822428540", dailySales:10, plan15:150, planOutbound:150 },
  { category:"인테리어", name:"오아무선모던LED시계R-베이지", barcode:"8809822426799", dailySales:10, plan15:150, planOutbound:150 },
];

const CAT_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  이미용:   { bg:"#E6F1FB", text:"#185FA5", dot:"#378ADD" },
  욕실:     { bg:"#E1F5EE", text:"#0F6E56", dot:"#1D9E75" },
  계절:     { bg:"#FAEEDA", text:"#854F0B", dot:"#EF9F27" },
  건강:     { bg:"#FBEAF0", text:"#993556", dot:"#D4537E" },
  모바일:   { bg:"#EEEDFE", text:"#534AB7", dot:"#7F77DD" },
  인테리어: { bg:"#F1EFE8", text:"#5F5E5A", dot:"#888780" },
};
const D = { bg:"#F1EFE8", text:"#5F5E5A", dot:"#888780" };
const cs = (cat: string) => CAT_COLOR[cat] ?? D;
const fmt = (n: number) => n.toLocaleString("ko-KR");
const fmtDate = (d: string) => d.slice(5).replace("-", "/");

function buildRows(records: DailyRecord[]): SkuRow[] {
  const recent7 = records.slice(-7);
  const latest = records[records.length - 1];
  return MASTER_DATA.map(m => {
    const latestData = latest?.outbound[m.barcode];
    const sum7 = recent7.reduce((s, r) => s + (r.outbound[m.barcode]?.qty ?? 0), 0);
    const avg7 = recent7.length > 0 ? Math.round((sum7 / recent7.length) * 10) / 10 : 0;
    return {
      ...m,
      actualOutbound: latestData?.qty ?? 0,
      revenue: latestData?.revenue ?? 0,
      orders: latestData?.orders ?? 0,
      avg7,
    };
  });
}

const TH: React.CSSProperties = { textAlign:"left", padding:"9px 14px", fontSize:11, fontWeight:500, color:"#aaa", whiteSpace:"nowrap", background:"#fdfcfa" };
const TD: React.CSSProperties = { padding:"10px 14px", verticalAlign:"middle" };

export default function Home() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [activeTab, setActiveTab] = useState("전체");
  const [view, setView] = useState<"table"|"history">("table");
  const [sortKey, setSortKey] = useState<"actualOutbound"|"revenue"|"avg7"|"">("actualOutbound");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Supabase에서 전체 기록 로드
  const loadRecords = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_outbound")
      .select("date, barcode, qty, revenue, orders")
      .order("date", { ascending: true });
    if (error) { console.error(error); setLoading(false); return; }

    // date별로 그룹핑
    const map: Record<string, DailyRecord["outbound"]> = {};
    for (const row of data ?? []) {
      if (!map[row.date]) map[row.date] = {};
      map[row.date][row.barcode] = { qty: row.qty, revenue: row.revenue, orders: row.orders };
    }
    const recs: DailyRecord[] = Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, outbound]) => ({ date, outbound }));
    setRecords(recs);
    setLoading(false);
  }, []);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  // 출고 파일 업로드 → Supabase upsert
  const handleOutbound = useCallback(async (file: File) => {
    setUploading(true);
    const m = file.name.match(/(\d{8})/);
    let date = new Date();
    date.setDate(date.getDate() - 1);
    if (m) {
      const d = new Date(`${m[1].slice(0,4)}-${m[1].slice(4,6)}-${m[1].slice(6,8)}`);
      d.setDate(d.getDate() - 1);
      date = d;
    }
    const dateStr = date.toISOString().slice(0, 10);

    const reader = new FileReader();
    reader.onload = async e => {
      const wb = XLSX.read(e.target?.result, { type:"array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval:"" });

      const agg: Record<string, { qty: number; revenue: number; orders: number }> = {};
      for (const r of raw) {
        const bc = r["SKU바코드"]
          ? String(typeof r["SKU바코드"] === "number" ? Math.round(r["SKU바코드"] as number) : r["SKU바코드"]).trim()
          : "";
        if (!bc) continue;
        if (!agg[bc]) agg[bc] = { qty:0, revenue:0, orders:0 };
        agg[bc].qty     += Number(r["출고 수량"] ?? 0);
        agg[bc].revenue += Number(r["주문단위 결제금액"] ?? 0);
        agg[bc].orders  += 1;
      }

      const upsertRows = Object.entries(agg).map(([barcode, v]) => ({
        date: dateStr,
        barcode,
        qty: v.qty,
        revenue: v.revenue,
        orders: v.orders,
      }));

      const { error } = await supabase
        .from("daily_outbound")
        .upsert(upsertRows, { onConflict: "date,barcode" });

      if (error) {
        showToast("❌ 업로드 실패: " + error.message);
      } else {
        showToast(`✓ ${dateStr} 출고 데이터 저장 완료`);
        await loadRecords();
      }
      setUploading(false);
    };
    reader.readAsArrayBuffer(file);
  }, [loadRecords]);

  const rows = buildRows(records);
  const latestDate = records[records.length - 1]?.date ?? "";
  const categories = ["전체", ...Array.from(new Set(MASTER_DATA.map(r => r.category)))];
  let displayed = activeTab === "전체" ? rows : rows.filter(r => r.category === activeTab);
  if (sortKey) displayed = [...displayed].sort((a, b) => (b[sortKey as keyof SkuRow] as number) - (a[sortKey as keyof SkuRow] as number));

  const totalOut  = displayed.reduce((s, r) => s + r.actualOutbound, 0);
  const totalRev  = displayed.reduce((s, r) => s + r.revenue, 0);
  const totalOrd  = displayed.reduce((s, r) => s + r.orders, 0);
  const totalAvg7 = displayed.reduce((s, r) => s + r.avg7, 0);
  const hasData   = records.length > 0;

  return (
    <div style={{ minHeight:"100vh", background:"#f5f4f0" }}>

      {/* 토스트 */}
      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:999, background:"#1a1a1a", color:"#fff", padding:"10px 18px", borderRadius:10, fontSize:13 }}>
          {toast}
        </div>
      )}

      {/* 사이드바 */}
      <div style={{ position:"fixed", top:0, left:0, width:200, height:"100vh", background:"#fff", borderRight:"0.5px solid #e5e4de", display:"flex", flexDirection:"column", padding:"1.25rem 0", zIndex:10 }}>
        <div style={{ padding:"0 1.25rem 1rem", borderBottom:"0.5px solid #f0ede8" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#1a1a1a" }}>OA Dashboard</div>
          <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>전사 출고 현황</div>
        </div>
        <div style={{ padding:"0.75rem 0.75rem 0", flex:1, overflowY:"auto" }}>
          {categories.map(cat => {
            const c = cs(cat);
            const count = cat === "전체" ? MASTER_DATA.length : MASTER_DATA.filter(r => r.category === cat).length;
            return (
              <button key={cat} onClick={() => setActiveTab(cat)} style={{
                width:"100%", textAlign:"left", padding:"7px 10px", borderRadius:8,
                border:"none", cursor:"pointer", marginBottom:2,
                background: activeTab === cat ? c.bg : "transparent",
                color: activeTab === cat ? c.text : "#888",
                fontWeight: activeTab === cat ? 500 : 400,
                fontSize:13, display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {cat !== "전체" && <span style={{ width:7, height:7, borderRadius:"50%", background:c.dot, flexShrink:0 }} />}
                  {cat}
                </span>
                <span style={{ fontSize:11, opacity:0.6 }}>{count}</span>
              </button>
            );
          })}
        </div>
        <div style={{ padding:"0.75rem", borderTop:"0.5px solid #f0ede8" }}>
          <label style={{ display:"block", textAlign:"center", padding:"8px", borderRadius:8, background:"#1a1a1a", color:"#fff", fontSize:12, fontWeight:500, cursor:"pointer" }}>
            {uploading ? "저장 중..." : "↑ 출고 파일 업로드"}
            <input type="file" accept=".xlsx,.xls" style={{ display:"none" }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleOutbound(f); e.target.value=""; }} />
          </label>
          <div style={{ fontSize:10, color:"#bbb", textAlign:"center", marginTop:6 }}>
            {loading ? "로딩 중..." : hasData ? `${records.length}일 누적 · 최근 ${latestDate}` : "데이터 없음"}
          </div>
        </div>
      </div>

      {/* 메인 */}
      <div style={{ marginLeft:200, padding:"1.5rem 2rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"1.5rem" }}>
          <div>
            <h1 style={{ fontSize:18, fontWeight:500 }}>{activeTab === "전체" ? "전사 출고 현황" : `${activeTab} 출고 현황`}</h1>
            <p style={{ fontSize:12, color:"#aaa", marginTop:3 }}>
              {hasData ? `전일 기준 ${latestDate} · ${records.length}일 누적` : "출고 파일을 업로드해주세요"}
            </p>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ display:"flex", border:"0.5px solid #d4d0c8", borderRadius:8, overflow:"hidden" }}>
              {(["table","history"] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{ padding:"6px 12px", fontSize:12, border:"none", cursor:"pointer", background: view===v ? "#1a1a1a" : "#fff", color: view===v ? "#fff" : "#888" }}>
                  {v === "table" ? "SKU별" : "날짜별"}
                </button>
              ))}
            </div>
            {hasData && view === "table" && (
              <select value={sortKey} onChange={e => setSortKey(e.target.value as typeof sortKey)}
                style={{ fontSize:12, padding:"6px 10px", borderRadius:8, border:"0.5px solid #d4d0c8", background:"#fff", color:"#555", cursor:"pointer" }}>
                <option value="actualOutbound">전일 출고 순</option>
                <option value="avg7">7일 평균 순</option>
                <option value="revenue">매출 순</option>
                <option value="">기본 순서</option>
              </select>
            )}
          </div>
        </div>

        {/* 요약 카드 */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:"1.5rem" }}>
          {[
            { label:"SKU 수",                                        value:`${displayed.length}종` },
            { label:`전일 출고 (${latestDate ? fmtDate(latestDate) : "-"})`, value: hasData ? `${fmt(totalOut)}개`                      : "-", dim:!hasData },
            { label:"전일 매출",                                      value: hasData ? `${(totalRev/10000).toFixed(0)}만원`             : "-", dim:!hasData },
            { label:"전일 주문건",                                    value: hasData ? `${fmt(totalOrd)}건`                             : "-", dim:!hasData },
            { label:"7일 평균 출고",                                  value: hasData ? `${Math.round(totalAvg7)}개/일`                  : "-", dim:!hasData },
          ].map(c => (
            <div key={c.label} style={{ background:"#ebe9e2", borderRadius:8, padding:"13px 15px" }}>
              <div style={{ fontSize:11, color:"#888", marginBottom:5 }}>{c.label}</div>
              <div style={{ fontSize:19, fontWeight:500, color: c.dim ? "#ccc" : "#1a1a1a" }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* SKU 테이블 */}
        {view === "table" && (
          <div style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e5e4de", overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr>
                  <th style={TH}>카테고리</th>
                  <th style={TH}>제품명</th>
                  <th style={{ ...TH, textAlign:"right" }}>계획출고</th>
                  <th style={{ ...TH, textAlign:"right" }}>전일출고{latestDate && <span style={{ fontWeight:400, color:"#bbb", marginLeft:3 }}>({fmtDate(latestDate)})</span>}</th>
                  <th style={{ ...TH, textAlign:"right" }}>7일 평균</th>
                  <th style={{ ...TH, textAlign:"right" }}>전일 매출 <span style={{fontWeight:400,color:"#bbb"}}>(세트기준)</span></th>
                  <th style={{ ...TH, textAlign:"right" }}>주문건</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((row, i) => {
                  const c = cs(row.category);
                  const aboveAvg = row.actualOutbound > row.avg7 && row.avg7 > 0;
                  return (
                    <tr key={row.barcode+i} style={{ borderBottom:"0.5px solid #f8f7f4", background: i%2===0 ? "#fff" : "#fdfcfa" }}>
                      <td style={TD}><span style={{ display:"inline-block", fontSize:11, padding:"2px 8px", borderRadius:20, background:c.bg, color:c.text, fontWeight:500, whiteSpace:"nowrap" }}>{row.category}</span></td>
                      <td style={{ ...TD, fontWeight:500, maxWidth:220 }}><span style={{ display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.name}</span></td>
                      <td style={{ ...TD, textAlign:"right", color:"#aaa" }}>{row.planOutbound > 0 ? fmt(row.planOutbound) : "-"}</td>
                      <td style={{ ...TD, textAlign:"right" }}>
                        {!hasData ? <span style={{ color:"#ddd" }}>-</span>
                          : row.actualOutbound > 0
                            ? <span style={{ color:"#A32D2D", fontWeight:600 }}>{fmt(row.actualOutbound)}{aboveAvg && <span style={{ fontSize:10, marginLeft:4, color:"#1D9E75" }}>↑</span>}</span>
                            : <span style={{ color:"#ddd" }}>0</span>}
                      </td>
                      <td style={{ ...TD, textAlign:"right" }}>{!hasData ? <span style={{ color:"#ddd" }}>-</span> : row.avg7 > 0 ? <span style={{ color:"#555" }}>{row.avg7}</span> : <span style={{ color:"#ddd" }}>-</span>}</td>
                      <td style={{ ...TD, textAlign:"right" }}>{!hasData ? <span style={{ color:"#ddd" }}>-</span> : row.revenue > 0 ? <span style={{ color:"#0F6E56", fontWeight:500 }}>{fmt(row.revenue)}원</span> : <span style={{ color:"#ddd" }}>-</span>}</td>
                      <td style={{ ...TD, textAlign:"right" }}>{!hasData ? <span style={{ color:"#ddd" }}>-</span> : row.orders > 0 ? fmt(row.orders) : <span style={{ color:"#ddd" }}>-</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 날짜별 히스토리 */}
        {view === "history" && (
          <div style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e5e4de", overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr>
                  <th style={TH}>날짜</th>
                  <th style={{ ...TH, textAlign:"right" }}>총 출고</th>
                  <th style={{ ...TH, textAlign:"right" }}>총 매출</th>
                  <th style={{ ...TH, textAlign:"right" }}>주문건</th>
                  <th style={{ ...TH, textAlign:"right" }}>출고 SKU</th>
                  <th style={TH}>카테고리별</th>
                </tr>
              </thead>
              <tbody>
                {[...records].reverse().map((rec, i) => {
                  const dayOut = Object.values(rec.outbound).reduce((s, v) => s + v.qty, 0);
                  const dayRev = Object.values(rec.outbound).reduce((s, v) => s + v.revenue, 0);
                  const dayOrd = Object.values(rec.outbound).reduce((s, v) => s + v.orders, 0);
                  const activeSkus = Object.values(rec.outbound).filter(v => v.qty > 0).length;
                  const catOut: Record<string, number> = {};
                  MASTER_DATA.forEach(m => {
                    const qty = rec.outbound[m.barcode]?.qty ?? 0;
                    if (qty > 0) catOut[m.category] = (catOut[m.category] ?? 0) + qty;
                  });
                  return (
                    <tr key={rec.date} style={{ borderBottom:"0.5px solid #f8f7f4", background: i%2===0 ? "#fff" : "#fdfcfa" }}>
                      <td style={{ ...TD, fontWeight:500 }}>
                        {rec.date}
                        {i === 0 && <span style={{ marginLeft:6, fontSize:10, background:"#E6F1FB", color:"#185FA5", padding:"1px 6px", borderRadius:10 }}>최신</span>}
                      </td>
                      <td style={{ ...TD, textAlign:"right", fontWeight:600, color:"#A32D2D" }}>{fmt(dayOut)}개</td>
                      <td style={{ ...TD, textAlign:"right", color:"#0F6E56", fontWeight:500 }}>{(dayRev/10000).toFixed(0)}만원</td>
                      <td style={{ ...TD, textAlign:"right" }}>{fmt(dayOrd)}건</td>
                      <td style={{ ...TD, textAlign:"right" }}>{activeSkus}종</td>
                      <td style={TD}>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          {Object.entries(catOut).map(([cat, qty]) => {
                            const c = cs(cat);
                            return <span key={cat} style={{ fontSize:10, padding:"1px 7px", borderRadius:20, background:c.bg, color:c.text }}>{cat} {qty}</span>;
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {records.length === 0 && <div style={{ textAlign:"center", padding:"3rem", color:"#bbb", fontSize:13 }}>업로드된 기록이 없어요</div>}
          </div>
        )}

        {/* 카테고리별 바 */}
        {hasData && view === "table" && activeTab === "전체" && (
          <div style={{ marginTop:"1.5rem", background:"#fff", borderRadius:12, border:"0.5px solid #e5e4de", padding:"1.25rem" }}>
            <p style={{ fontSize:11, fontWeight:500, color:"#aaa", letterSpacing:"0.05em", marginBottom:14 }}>카테고리별 전일 출고 비중</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {Array.from(new Set(MASTER_DATA.map(r => r.category))).map(cat => {
                const catOut = rows.filter(r => r.category === cat).reduce((s, r) => s + r.actualOutbound, 0);
                const allOut = rows.reduce((s, r) => s + r.actualOutbound, 0);
                const pct = allOut > 0 ? (catOut / allOut) * 100 : 0;
                const c = cs(cat);
                return (
                  <div key={cat} style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:60, fontSize:12, color:"#888", textAlign:"right" }}>{cat}</div>
                    <div style={{ flex:1, height:8, background:"#f1efe8", borderRadius:4 }}>
                      <div style={{ height:8, borderRadius:4, width:`${pct}%`, background:c.dot }} />
                    </div>
                    <div style={{ fontSize:12, color:"#555", width:50 }}>{fmt(catOut)}개</div>
                    <div style={{ fontSize:11, color:"#bbb", width:40 }}>{pct.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!hasData && !loading && (
          <div style={{ textAlign:"center", padding:"5rem 0", color:"#bbb" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📦</div>
            <div style={{ fontSize:14, color:"#888" }}>왼쪽 버튼으로 아르고 출고 파일을 업로드해주세요</div>
            <div style={{ fontSize:12, marginTop:6 }}>매일 업로드하면 날짜별 누적 · 7일 평균이 자동 계산돼요</div>
          </div>
        )}
      </div>
    </div>
  );
}
