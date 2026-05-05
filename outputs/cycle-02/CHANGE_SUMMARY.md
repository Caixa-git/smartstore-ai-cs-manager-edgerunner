# Cycle 02 — CHANGE_SUMMARY

## 사이클 개요

| 항목 | 값 |
|------|-----|
| 사이클 | 02 |
| 작업 유형 | 기능 개선 (기존 프로젝트) |
| 시작 상태 | Cycle 01 완료, GitHub Pages 활성 |
| 종료 상태 | 검색/정렬/위험도필터/모바일/초기화 개선 완료 |

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| index.html | 수정 (+32줄) | 검색창, 정렬 버튼, 위험도 서브필터, 리셋 버튼 HTML 추가 |
| style.css | 수정 (+64줄) | 검색/정렬/위험도/배지/리셋/모바일 480px 스타일 추가 |
| app.js | 수정 (+156줄) | setupSearch, setupSort, setupRiskFilter, resetAll, sortItems, 검색+필터+정렬 조합 로직 |
| outputs/cycle-02/REQUIREMENTS_CYCLE02.md | 생성 | 개선 요구사항 정의서 |
| outputs/cycle-02/QA_RESULTS.md | 생성 | 검증 결과 (46/46) |
| outputs/cycle-02/CYCLE_REPORT.md | 생성 | 사이클 보고서 (워커 기록 포함) |
| outputs/cycle-02/NEXT_CYCLE_INPUT.md | 생성 | 다음 사이클 입력값 |
| outputs/cycle-02/CHANGE_SUMMARY.md | 생성 | 본 파일 |
| outputs/cycle-02/SCREENSHOT_NOTES.md | 생성 | 스크린샷 메모 |
| outputs/INDEX.md | 수정 | Cycle 02 항목 추가 |
| README.md | 수정 | Cycle 02 변경 사항 및 기능 목록 업데이트 |
| CYCLE_REPORT.md | 갱신 | 최신 사이클 반영 |

## 변경되지 않은 파일

- data/sample_inquiries.json — 31건 그대로 유지
- DEMO_SCENARIO.md — 기존 시나리오 유지
- PORTFOLIO_SUMMARY.md — 기존 포트폴리오 유지
- outputs/cycle-01/ — 모든 산출물 보존

## 롤백 방법

```bash
git checkout v0.1.0-cycle-01
```

또는 개별 파일만 되돌리려면:
```bash
git checkout v0.1.0-cycle-01 -- index.html style.css app.js
```
