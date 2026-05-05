# Cycle 03 — NEXT_CYCLE_INPUT

## 이전 사이클 상태

| 항목 | 값 |
|------|-----|
| 사이클 | cycle-03 |
| 상태 | 완료 ✅ |
| GitHub Pages | https://caixa-git.github.io/smartstore-ai-cs-manager-edgerunner/ |
| 태그 | v0.3.0-cycle-03 |
| 검증 | 49/50 통과 (98%) |

## 완료된 작업

- 데이터 시각화 3종 (Chart.js: 유형별 bar / 위험도 doughnut / AIvs사장님 horizontal bar)
- AI 응답 처리 시뮬레이션 (5단계 순차 처리, 800ms 간격, 결과 카드 표시)
- CSV 내보내기 (현재 필터 기준, UTF-8 BOM, 16개 컬럼)
- 문의 등록 폼 (자동 분류 + 임시 추가, 새로고침 시 초기화)
- 영업용 데모 흐름 강화 (30초/3분 스크립트, 클릭 순서, CTA)
- PORTFOLIO_SUMMARY.md 강화 (Before/After, 가격 제안, 효과)
- Persona Usage Gate 도입 (6개 단계별 워커 기록)
- outputs/cycle-03 산출물 6종

## 다음 사이클 진입 시 확인 사항

1. Git 상태: `git status`, `git log --oneline -5`
2. GitHub 원격 저장소 연결 확인
3. GitHub 웹 UI/API 기준 이중 검증 (raw.githubusercontent.com만 보지 말 것)
4. Persona Usage Gate 준수 여부
5. Final Sync Gate 준수 여부

## 추천 개선 목표 (Cycle 04)

### P1 — 권장
- **다크 모드 토글** — CSS 변수 기반 테마 전환. 반려동물 샵에 맞는 다크 팔레트
- **알림 배지 시스템** — 헤더에 실시간 업데이트 효과. 새로운 위험 문의 시 뱃지 표시
- **문의 통계 상세 페이지** — 차트를 확장한 전용 분석 뷰. 일별/주별 추이

### P2 — 선택
- **영문 버전 (i18n)** — 기본 구조 i18n으로 전환. 영문 데모 병행 제공
- **실제 API 연동 준비** — 스마트스토어/네이버 API Mock 서버 구축
- **데이터 로딩 시각 효과** — 스켈레톤 UI, 프로그레스 인디케이터

### P3 — 장기
- **실시간 WebSocket 시뮬레이션** — 새로운 문의가 실시간으로 들어오는 효과
- **인쇄/PDF 내보내기** — 보고서 형태로 출력
- **사용자 설정 저장** — localStorage 기반 필터/정렬 상태 유지

## 다음 사이클 워커/페르소나 제안

| 단계 | 제안 워커 | 추천 페르소나 |
|------|----------|-------------|
| 다크 모드 | Theme Worker | UI Theme Designer |
| 알림 배지 | Notification Worker | UX/Interaction Designer |
| i18n | i18n Worker | Localization Specialist |
| API Mock | API Worker | Backend Mock Specialist |
