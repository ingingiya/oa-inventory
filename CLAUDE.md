# OA 재고 대시보드 (OA Inventory Dashboard)

## 프로젝트 개요

오아(OA) 브랜드 제품의 일일 출고량, 매출, 재고를 추적하는 대시보드. Excel 파일을 업로드해 Supabase에 저장하고, 출고현황·재고현황·날짜별 이력을 시각화한다.

## 기술 스택

- **Next.js 14** (App Router, `"use client"`)
- **TypeScript 5**
- **Supabase** — `daily_outbound`, `initial_stock` 두 테이블 사용
- **xlsx** — Excel 파싱
- 스타일: 인라인 CSS (CSS 프레임워크 없음)

## 프로젝트 구조

```
app/
  page.tsx      # 전체 앱 로직이 담긴 단일 컴포넌트 (~1,400줄)
  layout.tsx    # 루트 레이아웃
  globals.css   # 전역 스타일
package.json
.env.local      # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

모든 로직이 `app/page.tsx` 한 파일에 집중되어 있다. 별도 컴포넌트 폴더나 API 라우트 없음.

## 개발 명령어

```bash
npm run dev     # 개발 서버 (localhost:3000)
npm run build   # 프로덕션 빌드
npm run start   # 프로덕션 서버 실행
```

## Supabase 스키마

### `daily_outbound`
| 컬럼 | 설명 |
|------|------|
| date | ISO 날짜 (YYYY-MM-DD) |
| barcode | 제품 바코드 (EAN-13) |
| qty | 출고 수량 |
| revenue | 매출 (원) |
| orders | 주문 수 |

### `initial_stock`
| 컬럼 | 설명 |
|------|------|
| barcode | 제품 바코드 |
| qty | 초기 재고 수량 |
| updated_at | 수정 시각 |

## 핵심 데이터 모델

```typescript
SkuRow {
  category, name, barcode, dailySales, plan15, planOutbound,
  actualOutbound, revenue, orders, avg7, initialStock, currentStock
}

DailyRecord {
  date: string;
  outbound: Record<string, { qty, revenue, orders }>
}
```

## 제품 마스터 데이터

`MASTER_DATA` 배열에 48개 SKU 하드코딩. 카테고리 6개:

| 카테고리 | 색상 | SKU 수 |
|---------|------|--------|
| 이미용 | #185FA5 | 14 |
| 욕실 | #0F6E56 | 18 |
| 계절 | #EF9F27 | 10 |
| 건강 | #993556 | 5 |
| 모바일 | #534AB7 | 5 |
| 인테리어 | #5F5E5A | 2 |

## 주요 로직

### Excel 업로드 처리
- 파일명에서 날짜 추출 (YYYYMMDD 포맷). 없으면 전일(yesterday) 사용
- 파싱 컬럼: `SKU바코드`, `주문번호`, `출고 수량`, `주문단위 결제금액`
- **`8809487308195` (클린이워터B 거치대패키지):** 주문번호 기준 중복 제거
- **`8809822422173`:** 업로드 시 필터링(제외)

### 재고 계산
```
currentStock = initialStock - 누적출고량
```
- `initialStock` 미설정 시 `planOutbound` 기본값 사용
- `currentStock = -1` → 초기재고 미설정 (UI에서 "-" 표시)

### 7일 이동평균
```
avg7 = 최근 7일 출고량 합계 / 7
```

## 주요 기능

1. **출고현황 탭** — 계획 대비 실적, 7일 평균, 매출, 주문 수
2. **재고현황 탭** — 초기재고 vs 누적출고, 잔여재고, 소진률 (색상 경고)
3. **날짜별 탭** — 날짜별 이력 (역순), 카테고리별 일일 집계
4. **초기재고 설정 모달** — 바코드별 초기재고 입력, Supabase에 upsert
5. **요약 카드** — SKU 수, 전일 출고량, 전일 매출, 7일 평균, 총 잔여재고

## 환경 변수 (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 코딩 컨벤션

- 컴포넌트 추가 없이 `page.tsx`에 모든 로직을 집중시키는 패턴 유지
- 스타일은 인라인 CSS 객체 사용 (Tailwind 등 미사용)
- `useRef`로 Supabase 클라이언트 보관 (`sbRef`)
- Toast 알림: 성공 `✓ ...`, 실패 `❌ ...`, 3초 후 자동 소멸

---

## 아이디에이션 워크스페이스

### 역할
아이디어 발굴, 검증, 실행을 돕는 AI 파트너

### 핵심 원칙
- 한국어 전용
- 리서치 없이 주장 금지 (할루시네이션 방지)
- 모든 출처 등급 표기 (A~E):

| 등급 | 기준 |
|------|------|
| A | 공식 문서, 1차 자료, 논문 |
| B | 신뢰할 수 있는 미디어, 전문 블로그 |
| C | 일반 웹사이트, 커뮤니티 |
| D | 출처 불명확, 확인 필요 |
| E | 추정/추론 (출처 없음) |

- 검증 없이 "될 것 같다" 발언 금지
- 아이디어는 반드시 문서화 (휘발 방지)

### 검증 방식 — 4개 페르소나 Council
| 페르소나 | 역할 |
|---------|------|
| Visionary | 잠재력·비전 |
| Pragmatist | 실현 가능성·리소스 |
| Critic | 리스크·약점 |
| User Advocate | 사용자 가치 |

### 폴더 구조
```
10-inbox/      → 참고 자료
20-sparks/     → 아이디어 포착
30-research/   → 리서치 결과
40-foundry/    → 검증 결과
50-blueprints/ → MVP 설계
60-ventures/   → 실행 중
70-playbook/   → 경험 축적
90-shelf/      → 보류 아이디어
```
