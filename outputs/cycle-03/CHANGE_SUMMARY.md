# Cycle 03 — CHANGE_SUMMARY

## 사이클 개요

| 항목 | 값 |
|------|-----|
| 사이클 | 03 |
| 작업 유형 | 기능 개선 (기존 프로젝트) |
| 시작 상태 | Cycle 02 완료, GitHub Pages 활성 |
| 종료 상태 | 데이터 시각화/AI 시뮬레이션/CSV/문의 폼/영업 데모 강화 완료 |

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| index.html | 수정 (+120줄) | Chart.js CDN, 시각화 섹션, AI 시뮬레이션 섹션, CSV 버튼, 문의 등록 폼, AI 시뮬 모달 추가 |
| style.css | 수정 (+500줄) | 시각화/시뮬레이션/CSV/폼/모달/반응형 스타일 추가 |
| app.js | 수정 (+300줄) | renderCharts (Chart.js 3종), startSimulation (5단계), setupCsvExport (BOM CSV), setupInquiryForm (등록/분류) 추가 |
| outputs/cycle-03/CYCLE_REPORT.md | 생성 | 사이클 보고서 (워커 기록 포함) |
| outputs/cycle-03/NEXT_CYCLE_INPUT.md | 생성 | 다음 사이클 입력값 |
| outputs/cycle-03/QA_RESULTS.md | 생성 | 검증 결과 (49/50) |
| outputs/cycle-03/CHANGE_SUMMARY.md | 생성 | 본 파일 |
| outputs/cycle-03/SCREENSHOT_NOTES.md | 생성 | 스크린샷 메모 |
| outputs/INDEX.md | 수정 | Cycle 03 항목 추가 |
| DEMO_SCENARIO.md | 수정 | 30초/3분 영업 스크립트 + 클릭 순서 + CTA + 도입 자료 목록 추가 |
| PORTFOLIO_SUMMARY.md | 수정 | Before/After, 기능 목록, 도입 효과, 가격 제안 문구, 연동 방향 추가 |
| README.md | 수정 | Cycle 03 변경 사항, 새 기능 목록, 다음 사이클 추천 업데이트 |
| CYCLE_REPORT.md | 갱신 | 최신 사이클 반영 |
| NEXT_CYCLE_INPUT.md | 갱신 | 최신 사이클 입력값 반영 |

## 변경되지 않은 파일

- data/sample_inquiries.json — 31건 그대로 유지
- outputs/cycle-01/ — 모든 산출물 보존
- outputs/cycle-02/ — 모든 산출물 보존

## 새 의존성

- Chart.js 4.4.7 (CDN): `https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js`
  - README.md에 CDN 의존성 명시

## 롤백 방법

```bash
git checkout v0.2.0-cycle-02
```

또는 개별 파일만 되돌리려면:
```bash
git checkout v0.2.0-cycle-02 -- index.html style.css app.js
```
