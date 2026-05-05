# 스마트스토어 AI CS 매니저 — 모모펫 스토어

> **쇼핑몰 문의 답변, AI 직원이 먼저 정리합니다.**  
> 반려동물 용품 스마트스토어 '모모펫 스토어'를 위한 AI CS 관리 대시보드 데모

## 현재 상태

✅ **완료** — Cycle 02 (검색·정렬·위험도 필터 보강)

## Live Demo

🔗 [https://caixa-git.github.io/smartstore-ai-cs-manager-edgerunner/](https://caixa-git.github.io/smartstore-ai-cs-manager-edgerunner/) ✅ 배포 완료

## 빠른 실행

```bash
cd smartstore-ai-cs-manager-edgerunner
python3 -m http.server 8000
# → http://localhost:8000
```

## 이 데모가 보여주는 것

| 고객 문의가 들어오면 | AI CS 매니저가 |
|-------------------|----------------|
| 배송 지연 문의 | AI가 송장번호 확인 후 자동 답변 |
| 교환/환불 요청 | AI가 절차 안내 + 사이즈 추천 |
| 화난 고객 클레임 | AI가 위험 감지 → 사장님 확인 요청 |
| 긍정 리뷰 | AI가 감사 답변 자동 발송 |
| 단순 상품 문의 | AI가 즉시 답변 초안 작성 |

## 핵심 기능

| 기능 | 설명 |
|------|------|
| 🏠 첫 화면 | 제품명 + 한 줄 가치 제안 + 오늘 문의 요약 통계 |
| ⭐ 데모 하이라이트 | 위험 클레임 / 자동 답변 / 긍정 사례 3종 카드 |
| 🔍 6종 필터 | 전체 / 사장님 확인 필요 / 자동 답변 가능 / 클레임 위험 / 배송문의 / 교환/환불 |
| 🔎 검색어 입력 | 고객명·상품명·문의내용·AI요약·답변초안 실시간 검색 (250ms 디바운스) |
| 🔽 4종 정렬 | 최신순 / 우선순위 높은순 / 위험도 높은순 / 사장님 확인 필요 우선 |
| ⚠️ 위험도 서브 필터 | 치명(critical) / 높음(high) / 보통(medium) / 낮음(low) 세분화 필터링 |
| 🔄 초기화 버튼 | 검색어·필터·정렬·위험도 필터 전체 한 번에 리셋 |
| 📋 상세 모달 | 고객 원문 → AI 요약 → 답변 초안 → 톤 가이드 → 연동 방식 |
| 📊 Before/After | AI 도입 전후 비교 섹션 |
| 🤖 AI 직원 6명 | 문의분류 / 답변작성 / 클레임감지 / 주문정리 / 리뷰관리 / 위험감지 |
| 🔴 위험 감지 | critical(소비자원), high(부작용/1주지연), medium(화남) 등급 구분 |
| 🎯 답변 톤 가이드 | 각 문의별로 AI가 제안하는 응대 톤 |
| 🔧 연동 방식 안내 | 실제 도입 시 API 연동 방안을 각 문의 상세에 표시 |

## 데모 데이터 안내

> 이 데모의 모든 데이터는 포트폴리오용 가상 데이터입니다.  
> **실제 고객 정보, 실제 주문정보, 실제 API 연동은 포함되어 있지 않습니다.**  
> 가상 쇼핑몰 '모모펫 스토어'의 CS 시나리오를 재현한 데모입니다.

## 산출물

| 링크 | 설명 |
|------|------|
| [Outputs Index](outputs/INDEX.md) | 전체 산출물 인덱스 |
| [Cycle Report](CYCLE_REPORT.md) | 최신 사이클 보고서 |
| [Next Cycle Input](NEXT_CYCLE_INPUT.md) | 다음 사이클 입력값 |
| [Demo Scenario](DEMO_SCENARIO.md) | 데모 시나리오 가이드 |
| [Portfolio Summary](PORTFOLIO_SUMMARY.md) | 포트폴리오 요약 |

## 사이클 기록

| Cycle | 상태 | 보고서 | 다음 입력 | 태그 |
|-------|------|--------|-----------|------|
| cycle-01 | ✅ 완료 | [보고서](outputs/cycle-01/CYCLE_REPORT.md) | [입력](outputs/cycle-01/NEXT_CYCLE_INPUT.md) | `v0.1.0-cycle-01` |
| cycle-02 | ✅ 완료 | [보고서](outputs/cycle-02/CYCLE_REPORT.md) | [입력](outputs/cycle-02/NEXT_CYCLE_INPUT.md) | `v0.2.0-cycle-02` |

## 검증 결과

| 구분 | 결과 |
|------|------|
| Cycle 01 검증 | 25/25 통과 |
| Cycle 02 검증 | **46/46 통과 (100%)** |

자세한 결과: [outputs/cycle-02/QA_RESULTS.md](outputs/cycle-02/QA_RESULTS.md)

## GitHub 전달 준비 상태

| 항목 | 상태 |
|------|------|
| GitHub 저장소 | https://github.com/Caixa-git/smartstore-ai-cs-manager-edgerunner |
| 저장소 공개 범위 | ✅ **public** |
| Live Demo | ✅ https://caixa-git.github.io/smartstore-ai-cs-manager-edgerunner/ |
| 태그 | ✅ v0.1.0-cycle-01, ✅ v0.2.0-cycle-02 |
| GitHub 링크만으로 검토 가능 | ✅ **가능** |

## 구현하지 않은 것 (이번 사이클)

- 실제 스마트스토어 / 네이버 / OpenAI / 카카오톡 API 연동
- 실제 로그인 / 회원가입 / 결제
- 데이터베이스
- 서버 구축
- 실제 고객 개인정보
- 스크린샷 자동 생성 (Playwright/Puppeteer 미설치)

## 다음 사이클 추천

| 순위 | 항목 |
|------|------|
| P1 | 모바일 반응형 최적화 (480px 이하) |
| P2 | 필터 초기화 버튼, 우선순위 정렬, 검색어 입력 |
| P3 | GPT 연동 시뮬레이션 (AI 응답 생성 체험), 통계 차트, 영문 버전 |

자세한 내용: [outputs/cycle-01/NEXT_CYCLE_INPUT.md](outputs/cycle-01/NEXT_CYCLE_INPUT.md)
