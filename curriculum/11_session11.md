# Session 11 — 클라우드 DB (Supabase CRUD)

## 회차 개요

- **시간**: 2시간
- **트랙**: 심화 / Part 2
- **1개념**: **클라우드 DB 연결**
- **목표**: Supabase 가입 → 테이블 만들기 → JS SDK로 CRUD 4종 (Create·Read·Update·Delete) 실행.
- **누적 위치**: 10주 LocalStorage(내 컴퓨터만) → 11주 클라우드 DB(모든 사용자 공유)로 도약.
- **회차 끝 학생 상태**: 클라우드 DB에 데이터 쌓이는 방명록·게시판 페이지

---

## 슬라이드 8장

| # | 파일 | 유형 | goal |
|---|------|------|------|
| 01 | `01_오늘의_목표.svg` | 인트로 | 11회차 목표(Supabase로 클라우드 DB 연결) |
| 02 | `02_Supabase란.svg` | 개념 | 가입만 하면 DB 주는 서비스 (BaaS) |
| 03 | `03_실습1_가입_프로젝트.svg` | 실습 | supabase.com 가입 → 새 프로젝트 생성 |
| 04 | `04_테이블_+_컬럼.svg` | 개념 | UI로 테이블 만들기 (10주 설계한 스키마 적용) |
| 05 | `05_실습2_Read_+_Create.svg` | 실습 | Supabase JS SDK로 데이터 추가·조회 |
| 06 | `06_Update_Delete.svg` | 개념 | CRUD 4종 = Create·Read·Update·Delete |
| 07 | `07_실습3_방명록_클라우드_전환.svg` | 실습 | 10주차 LocalStorage 방명록을 Supabase로 전환 |
| 08 | `08_정리.svg` | 정리 | "모든 사용자가 공유하는 데이터" + 다음 주 회원 시스템 |

### 슬라이드별 topics

- **02 Supabase**: PostgreSQL 기반 클라우드 DB / 무료 플랜 충분 / Firebase 대안
- **03 가입**: 이메일로 가입 / New Project / 비밀번호·리전 설정
- **04 테이블**: Table Editor / 컬럼 추가 (id·created_at·내용) / 타입 선택
- **05 Read·Create**: createClient(URL·anon키) / .from('table').select() / .insert()
- **06 CRUD**: 4종 패턴 / .update() / .delete() / 필터 .eq()
- **07 전환**: LocalStorage 부분을 Supabase 호출로 교체 / 다른 사람도 볼 수 있는 방명록

### 실습 프롬프트

| 실습 | 프롬프트 |
|------|---------|
| 03 가입 | supabase.com에서 새 프로젝트 만들고, project URL과 anon key를 확인해줘. (학생 직접 진행) |
| 05 첫 Read·Create | 내 페이지에서 Supabase의 guestbook 테이블에 데이터 추가하고 전체 조회하는 코드 작성해줘. URL은 ___, key는 ___. |
| 07 방명록 전환 | 지난 주 LocalStorage로 만든 방명록을 Supabase로 옮겨줘. 모든 방문자가 글을 볼 수 있도록. |

---

## 사용 에셋·라이브러리·CDN

- **슬라이드 에셋**: `assets/basic/step11/`
- **외부 서비스**: supabase.com (무료 플랜)
- **CDN**: `cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js`

---

## 표현 가이드 ⚠️

- "백엔드" 금지 → "Supabase에 연결된 클라우드 DB"
- "쿼리" 가능 (학생에게 친숙한 단어)

---

## 구조 평가·개선 메모

_TBD_
