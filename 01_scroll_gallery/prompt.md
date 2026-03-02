C:/woohee_dev/408_ai_agent_web/01_scroll_gallery/index.html 경로에 단일 HTML 파일로 다음 웹페이지를 만들어줘. CSS/JS 모두 인라인으로 포함.

### 레퍼런스
GSAP ScrollTrigger "Card Stack" 효과 재현. 순수 JS로 구현 (GSAP CDN 사용 금지).

### 전체 흐름
1. 첫 화면: 검정 배경 (#111) 풀스크린, 상단 네비게이션, 화면 중앙에 "Scroll" 텍스트
2. 세로 스크롤하면 → 카드들이 오른쪽에서 왼쪽으로 수평 이동하며 등장 (세로 스크롤을 가로 이동으로 변환)
3. 카드가 다 지나가면 → 다시 빈 화면 (카드가 뷰포트 왼쪽 밖으로 완전히 사라져야 함)

### 구현 방식
- section을 position: sticky/fixed로 뷰포트에 고정 (pin)
- body의 height를 충분히 길게 (500vh) 설정하여 스크롤 거리 확보
- window scroll 이벤트로 스크롤 진행률(0~1) 계산 → 카드 컨테이너의 translateX에 매핑
- requestAnimationFrame + lerp로 부드러운 보간 (60fps)
- **핵심: translateX 범위는 +100vw (화면 밖 오른쪽) ~ -(카드 트랙 전체 폭 + 100vw) (화면 밖 왼쪽)까지. 카드가 오른쪽에서 들어와서 왼쪽으로 완전히 빠져나가야 함**

### 레이아웃
- 배경: #111 (아주 어두운 갈색빛 검정)
- 상단 네비: 좌측 "STUDIO" / 중앙 "SCROLL GALLERY COLLECTION" / 우측 "6 WORKS" (흰색, 작은 모노스페이스, letter-spacing 넓게)

### 카드 디자인 (핵심 - 레퍼런스와 최대한 비슷하게)
- 총 6장: images/01.jpg ~ images/06.jpg (로컬)
- 카드 크기: 약 320px x 440px, 둥근 모서리 (border-radius: 20~24px)
- **테두리: 매우 굵게 (10~14px), 네온 느낌의 선명한 색상**
  - 카드1: #5B8DEF (파랑), 카드2: #C8FF00 (형광 연두), 카드3: #00E5CC (시안), 카드4: #FFD700 (골드), 카드5: #FF69B4 (핑크), 카드6: #FF4444 (빨강)
- 카드 내부 상단: 좌측 "COLLECTION" + 우측 "INDIE POP" 같은 작은 태그 텍스트 (8~9px, 흰색, uppercase, letter-spacing 넓게)
- 카드 내부 중앙: 타원형 "FROM" 뱃지 (테두리 색상 배경, 검정 텍스트, 작은 크기)
- **카드 하단 텍스트: 아주 크고 (70~90px) 굵은 폰트 (Bebas Neue 900), 테두리 색상과 매칭, 카드 하단에 위치하되 카드 밖으로 살짝 삐져나옴 (overflow: visible)**
  - 텍스트 예시: NEON WAVES / VELVET DRIFT / ECHO FLAME / PHANTOM BEAT / CRYSTAL VIBE / JET FLAME
  - text-shadow로 가독성 확보
- 카드 각도: 각각 다르게 살짝 기울어짐 (-3, 2, -1.5, 3, -2.5, 1.5 등)
- 카드 간격: 불균일, 서로 살짝 겹침
- 이미지: object-fit: cover, 선명하게 (filter: contrast(1.05) saturate(1.05))

### 스크롤 인터랙션
- body height: 500vh (스크롤 거리)
- 카드 컨테이너: position fixed, 수직 중앙
- **스크롤 매핑 (중요!):**
  - progress 0.0 → translateX = window.innerWidth (카드들이 화면 오른쪽 밖)
  - progress 0.5 → translateX = 카드들이 화면 중앙 부근
  - progress 1.0 → translateX = -(카드 트랙 전체 scrollWidth) (카드들이 화면 왼쪽 밖으로 완전히 사라짐)
- lerp 보간 (계수 0.08~0.1) 으로 부드럽게
- 스크롤 진행에 따라 카드 각도도 미세하게 변화 (parallax)
