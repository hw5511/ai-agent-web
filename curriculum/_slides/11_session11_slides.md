# Session 11 — 클라우드 DB (Supabase CRUD) 슬라이드 목차

> **회차 목표**: Supabase 가입 → 테이블 만들기 → JS SDK로 CRUD 4종(Create·Read·Update·Delete) 실행
> **누적 위치**: 10주 LocalStorage(내 컴퓨터만) → 11주 클라우드 DB(모든 사용자 공유)
> **총 8장 구성** (표지 1 / 학습목표 1 / 개념 3 / 실습 3 — 정리 슬라이드는 8번에 통합 / 실제 분류: 표지·학습목표·개념·실습·정리)

---

### 슬라이드 1 — 11회차 오프닝: 클라우드 DB로 도약
- **유형**: 표지
- **goal**: 오늘 우리는 "내 컴퓨터에만 있던 데이터"를 "모두가 공유하는 클라우드 DB"로 옮긴다.
- **핵심 토픽**:
  - Session 11 — 클라우드 DB (Supabase CRUD)
  - 심화 트랙 / Part 2 / 2시간
  - 1개념 = 클라우드 DB 연결
  - 회차 끝 학생 상태: 클라우드 DB에 데이터가 쌓이는 방명록·게시판 페이지
  - 어제까지 LocalStorage → 오늘부터 Supabase에 연결된 클라우드 DB
- **시각 요소**:
  - 표지 일러스트: "노트북 1대(LocalStorage)" → "구름 아이콘(Supabase 클라우드 DB)" → "여러 노트북·스마트폰" 화살표 다이어그램
  - 상단 라벨: Session 11 / 우측 진행 배지(11/16)
- **강사 노트**: 지난 주에 만든 방명록이 "나만 보이는" 문제를 가볍게 환기. 오늘 끝나면 친구가 다른 컴퓨터에서 내 글을 볼 수 있다고 강조.

---

### 슬라이드 2 — 오늘의 학습 목표
- **유형**: 학습목표
- **goal**: Supabase에 연결된 클라우드 DB를 만들고, JS SDK로 4종 쿼리(CRUD)를 직접 호출할 수 있다.
- **핵심 토픽**:
  - 목표 1: Supabase 가입 + 새 프로젝트 생성 (URL·anon key 확보)
  - 목표 2: Table Editor로 테이블·컬럼 만들기 (10주 설계한 스키마 적용)
  - 목표 3: JS SDK로 Create·Read 호출 성공
  - 목표 4: 10주차 LocalStorage 방명록을 Supabase로 전환
  - 도착점: 다른 사람도 볼 수 있는 클라우드 방명록 페이지 1개
- **시각 요소**:
  - 4단계 체크리스트 카드 (가입 → 테이블 → CRUD 코드 → 방명록 전환)
  - 좌측: "Before — 내 컴퓨터만" / 우측: "After — 모두가 공유" Before/After 비교 박스
- **강사 노트**: "코드 한 줄도 직접 안 쳐도 됩니다. Claude Code가 다 해줍니다"로 위협감 차단. 학생은 가입과 클릭만 직접.

---

### 슬라이드 3 — 개념 1: Supabase = "가입만 하면 DB 주는 서비스"
- **유형**: 개념
- **goal**: Supabase가 무엇이고, 왜 우리 수업에 딱 맞는지 한 문장으로 이해한다.
- **핵심 토픽**:
  - Supabase = PostgreSQL 기반의 클라우드 DB 서비스 (BaaS)
  - 가입 → 프로젝트 생성 → 바로 사용 가능한 DB가 인터넷 주소로 발급됨
  - 무료 플랜으로 우리 수업 충분 (DB 500MB·사용자 5만 명)
  - Vercel을 활용한 DB·API 연동의 짝꿍 — 배포는 Vercel, 데이터는 Supabase
  - "Firebase 들어봤다면? Supabase는 그 대안 + SQL 기반"
- **시각 요소**:
  - 다이어그램: [내 웹페이지] ←→ [Supabase 클라우드 DB(구름 아이콘)]
  - 비교 표: LocalStorage(내 컴퓨터만, 무료, 0설정) vs Supabase(전 세계 공유, 무료 시작, 가입 1분)
  - 우측 배지: "코드 0줄, 가입만 1분"
- **강사 노트**: 학생이 "서버 직접 만들어야 하나?" 걱정하지 않게, "Supabase가 DB와 연결 통로를 다 만들어 준다"고 단순화. "백엔드"라는 단어는 쓰지 않음.

---

### 슬라이드 4 — 개념 2: 테이블 + 컬럼 = 데이터의 엑셀 시트
- **유형**: 개념
- **goal**: 테이블/컬럼/행 개념을 엑셀에 비유해 이해하고, 10주차에 설계한 스키마를 그대로 적용할 수 있다.
- **핵심 토픽**:
  - 테이블 = 엑셀 시트 1장 / 컬럼 = 시트의 열(제목줄) / 행 = 데이터 한 줄
  - 필수 컬럼 3종 세트: `id`(자동 번호), `created_at`(자동 시간), 내가 저장할 내용(예: `message`)
  - 컬럼 타입: text(글자), int8(숫자), timestamp(시간), uuid(고유 ID)
  - 10주차에 종이에 그렸던 스키마 → 그대로 Table Editor에 옮기기
  - "한 번 만들면 영구 저장, 언제든 컬럼 추가 가능"
- **시각 요소**:
  - 엑셀 시트 ↔ Supabase Table Editor 좌우 매칭 이미지
  - 예시 표:
    | id | created_at | nickname | message |
    |----|-----------|----------|---------|
    | 1 | 2026-05-25 | 우희 | 안녕하세요! |
  - Table Editor UI 캡처 풍 일러스트
- **강사 노트**: "10주차에 종이에 그린 표 = 오늘 만들 테이블"이라고 연결. id·created_at은 Supabase가 자동 채워 준다고 안심시키기.

---

### 슬라이드 5 — 개념 3: CRUD 4종 = 데이터와 대화하는 4가지 방법
- **유형**: 개념
- **goal**: Create·Read·Update·Delete 4종 쿼리 패턴을 SDK 코드 한 줄 단위로 이해한다.
- **핵심 토픽**:
  - **C**reate: `.insert({ message: '안녕' })` — 새 데이터 추가
  - **R**ead: `.select('*')` — 데이터 조회 (필터: `.eq('id', 1)`)
  - **U**pdate: `.update({ message: '수정' }).eq('id', 1)` — 기존 데이터 수정
  - **D**elete: `.delete().eq('id', 1)` — 데이터 삭제
  - 공통 패턴: `supabase.from('테이블이름').동작()` → "어느 테이블에, 무엇을 할지" 두 가지만 정함
  - 모든 쿼리는 비동기(`await`)
- **시각 요소**:
  - 4분할 카드: Create / Read / Update / Delete (각 아이콘 + 코드 1줄)
  - 코드박스:
    ```js
    const supabase = createClient(URL, ANON_KEY)
    await supabase.from('guestbook').insert({ message: '안녕!' })
    const { data } = await supabase.from('guestbook').select('*')
    ```
  - 우측 메모: "쿼리(query) = DB에게 보내는 질문/명령"
- **강사 노트**: 학생이 코드를 외울 필요 없음 강조. "Claude Code에게 'CRUD 4종 작성해줘'라고 부탁하면 끝." 패턴만 눈에 익히기.

---

### 슬라이드 6 — 실습 1: Supabase 가입 + 첫 프로젝트 만들기
- **유형**: 실습
- **goal**: supabase.com에 가입하고 첫 프로젝트를 만들어 URL과 anon key를 손에 넣는다.
- **핵심 토픽**:
  - Step 1: supabase.com 접속 → "Start your project" → GitHub/이메일로 가입
  - Step 2: New Project 클릭 → 이름(예: my-guestbook), DB 비밀번호 입력, 리전은 Northeast Asia (Seoul) 선택
  - Step 3: 프로젝트 생성 대기 (약 1~2분)
  - Step 4: Settings → API 메뉴에서 **Project URL**과 **anon public key** 2개 복사 → 메모장에 붙여 두기
  - 주의: anon key는 공개해도 되는 키. service_role 키는 절대 복사하지 않기
- **시각 요소**:
  - 4단계 스크린샷 흐름도 (가입 화면 → New Project → 로딩 → API 키 화면)
  - 빨간 박스: "여기 두 값을 복사해서 메모장에 붙여 두세요" (Project URL / anon public)
  - 타이머 아이콘: 약 5~7분
- **강사 노트**: 학생이 비밀번호 잊어버리지 않게 메모장에 같이 적도록 안내. 리전은 반드시 서울로(속도). 가입 단계에서 막히는 학생은 옆에서 화면 같이 보기.

---

### 슬라이드 7 — 실습 2: Table Editor로 guestbook 테이블 만들기 + Create·Read 코드
- **유형**: 실습
- **goal**: UI로 테이블 만들고, Claude Code에게 SDK 코드를 받아 첫 데이터 1건을 클라우드 DB에 저장·조회한다.
- **핵심 토픽**:
  - Step 1: 좌측 메뉴 → Table Editor → New table → 이름 `guestbook`
  - Step 2: 컬럼 추가 — `nickname`(text), `message`(text) (id·created_at은 자동)
  - Step 3: index.html에 Supabase CDN 추가 (jsdelivr)
  - Step 4: Claude Code에게 프롬프트 전달 →
    > "내 페이지에서 Supabase의 guestbook 테이블에 데이터 추가하고 전체 조회하는 코드 작성해줘. URL은 ___, key는 ___"
  - Step 5: 브라우저에서 글 1건 작성 → Supabase Table Editor 새로고침 → 데이터 들어온 것 확인
- **시각 요소**:
  - 좌: Table Editor 컬럼 설정 UI / 우: 결과 확인 화면 좌우 분할
  - 코드박스 (CDN):
    ```html
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
    ```
  - 체크포인트 박스: "데이터 1건이 Supabase 대시보드에 보이면 성공"
- **강사 노트**: URL·키를 코드에 붙여 넣을 때 따옴표 누락 자주 발생 → Claude Code가 자동 처리하므로 학생이 그대로 복사·붙여넣기만 하도록 유도. 첫 데이터가 대시보드에 뜨는 순간 박수.

---

### 슬라이드 8 — 실습 3 + 정리: 방명록을 클라우드로 전환 + 다음 회차 예고
- **유형**: 실습 + 정리
- **goal**: 10주차 LocalStorage 방명록을 Supabase로 전환해, 다른 컴퓨터·다른 사람도 볼 수 있는 클라우드 방명록을 완성한다.
- **핵심 토픽**:
  - 실습 3 프롬프트:
    > "지난 주 LocalStorage로 만든 방명록을 Supabase로 옮겨줘. 모든 방문자가 글을 볼 수 있도록."
  - 변경 포인트: `localStorage.getItem/setItem` → `supabase.from('guestbook').select()/insert()`
  - 검증: 친구 폰/다른 브라우저로 같은 페이지 접속 → 내가 쓴 글이 보이면 성공
  - 오늘 얻은 것: 클라우드 DB에 연결된 방명록 1개 + CRUD 4종 패턴 + Supabase 대시보드 사용법
  - 다음 회차(12) 예고: 회원 시스템 — "이 글을 누가 썼는지" 기록하기 (Supabase Auth)
  - 표현 정리: "Supabase에 연결된 클라우드 DB" / "Vercel을 활용한 DB·API 연동"
- **시각 요소**:
  - Before/After 다이어그램: [노트북 1대 안 LocalStorage] → [구름 + 여러 기기]
  - 체크리스트 4종: 가입O / 테이블O / Create·Read O / LocalStorage→Supabase 전환 O
  - 다음 주 티저 카드: "Session 12 — 회원 시스템 (로그인·내 글만 수정)"
- **강사 노트**: 친구 폰으로 직접 접속해 보는 시연을 강하게 권장 — "공유"가 체감되는 결정적 순간. 표현 가이드(백엔드 금지) 다시 한 번 환기.

---

## 참고 메모

- **에셋 경로**: `assets/basic/step11/`
- **외부 서비스**: supabase.com (무료 플랜)
- **CDN**: `cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js`
- **표현 가이드**: "백엔드/풀스택/서버 사이드" 사용 금지 → "Supabase에 연결된 클라우드 DB" / "Vercel을 활용한 DB·API 연동" / "쿼리" 사용 OK
- **학생 프로파일 반영**: 코드 직접 작성 0줄, 가입·UI 클릭·Claude Code 프롬프트만으로 진행 가능하도록 구성
