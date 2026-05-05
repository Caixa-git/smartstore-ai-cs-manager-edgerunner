# Cycle 02 — SCREENSHOT_NOTES

## 스크린샷 미생성 사유

동일: 자동화된 스크린샷 도구(Playwright/Puppeteer)를 실행 환경에서 사용할 수 없었습니다. (QA는 Playwright 헤드리스로 DOM 기반 검증 수행)

## 대체 확인 방법

### 로컬 실행
```bash
cd smartstore-ai-cs-manager-edgerunner
python3 -m http.server 8000
# http://localhost:8000
```

### GitHub Pages
[https://caixa-git.github.io/smartstore-ai-cs-manager-edgerunner/](https://caixa-git.github.io/smartstore-ai-cs-manager-edgerunner/)

### Cycle 02 주요 확인 포인트
1. 🔍 검색창에 "사료" 입력 → 결과 필터링 확인
2. 🔽 정렬 버튼 클릭 → "위험도 높은순"으로 변경
3. ⚠️ 위험도 서브필터 "치명" 선택 → INQ-018만 표시 확인
4. 🔄 초기화 버튼 클릭 → 모든 필터 리셋 확인
5. 📱 브라우저 폭 480px로 줄여 모바일 레이아웃 확인
