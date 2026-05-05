# Cycle 01 — NEXT_CYCLE_INPUT

## 이전 사이클 상태

| 항목 | 값 |
|------|-----|
| 사이클 | cycle-01 |
| 상태 | 완료 ✅ |
| GitHub Pages URL | https://caixa-git.github.io/smartstore-ai-cs-manager-edgerunner/ |
| 태그 | v0.1.0-cycle-01 |
| 검증 | 22/22 통과 (100%) |

## 완료된 작업

- 정적 웹앱 구현 (히어로/하이라이트/필터/모달/BA)
- 가상 CS 데이터 31건
- 문서 4종 (README, DEMO_SCENARIO, PORTFOLIO_SUMMARY, CYCLE_REPORT)
- outputs/cycle-01 산출물 5종
- Git 커밋 + 태그 + GitHub public push + Pages 배포

## 다음 사이클 진입 시 확인 사항

1. Git 상태: `git status`, `git log --oneline -5`
2. GitHub 원격 저장소 연결 확인: `git remote -v`
3. README의 GitHub 상태가 실제와 일치하는지 확인
4. Live Demo 접근 가능 여부 확인

## 추천 개선 목표

### P1 — 다음 사이클에서 권장
- **480px 이하 모바일 최적화** — 히어로 통계 카드가 세로 정렬될 때 디자인 개선
- **필터 초기화 버튼** — 현재 reset-btn 존재하나 시각적 강조 부족
- **필터별 결과 건수 강조** — 0건 시에도 자연스러운 UX

### P2 — 선택적 개선
- **검색어 입력** — 문의 내용 검색 기능
- **우선순위 정렬** — 높은 우선순위 먼저 표시
- **로딩 스켈레톤** — 데이터 로드 중 UI

### P3 — 장기 개선
- **GPT API 연동 시뮬레이션** — AI 응답 생성 체험 (데모용)
- **통계 차트** — Chart.js 기반 문의 추이
- **영문 버전** — 해외 검토자 대응

## 변경 시 주의사항

- outputs/cycle-01/ 산출물 절대 덮어쓰지 않음
- 새 산출물은 outputs/cycle-02/에 저장
- data/sample_inquiries.json 필드 구조 변경 시 하위 호환성 유지
- 민감정보 방지 규칙 유지
