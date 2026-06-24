# 새로운 React 프로젝트 세팅 가이드

이 문서는 Claude가 새로운 React 프로젝트를 빠르게 세팅하는 방법을 설명합니다.

## 사용자 요청 예시
```
{프로젝트명}으로 새로운 프로젝트 세팅해줘
```

## Claude가 수행해야 하는 작업 순서

### 1. Vite + React 프로젝트 생성
```bash
npm create vite@latest {프로젝트명} -- --template react
cd {프로젝트명}
npm install
```

### 2. MUI 설치
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

### 3. vite.config.js 설정 (GitHub Pages base path)
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/{프로젝트명}/',
})
```

### 4. 기본 구조 정리
```
src/
├── components/
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Projects.jsx
│   └── Contact.jsx
├── App.jsx
├── main.jsx
└── index.css
```

### 5. index.css 초기화 적용
```css
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
}

#root {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

### 6. 개발 서버 테스트
```bash
# 10초 테스트 (macOS/Linux)
timeout 10 npm run dev

# "Local: http://localhost:xxxx/" 메시지 확인되면 성공
```

## 완료 후 사용자에게 제공할 정보

1. **생성된 프로젝트 구조**
2. **설치된 패키지 목록**
3. **개발 서버 접속 URL** (`npm run dev` 실행 후 확인)
4. **사용 가능한 기능들**:
   - MUI ThemeProvider 적용 완료
   - 기본 컴포넌트 구조 생성 완료
   - CssBaseline 적용 완료

## ⚠️ 중요: 세팅 이후 개발 작업 규칙

1. **Claude는 자동으로 `npm run dev`를 실행하지 않음** — 세팅 시에만 10초 테스트
2. **개발 서버 실행은 사용자 책임** — 코드 작성 완료 후 "npm run dev 실행해보세요" 안내
3. **코드만 작성, 프로세스 관리 X**

## GitHub Pages 배포 (요청 시)

### "백업해줘" 요청 시
```bash
gh repo create {프로젝트명} --public --description "{설명}"
git init
git add .
git commit -m "initial setup"
git branch -M main
git remote add origin https://github.com/{사용자명}/{프로젝트명}.git
git push -u origin main
```

### "배포해줘" 요청 시

1. `.github/workflows/deploy.yml` 생성 (CLAUDE.md의 워크플로우 템플릿 사용)
2. 커밋 + 푸시
3. Pages 설정을 workflow 방식으로 변경:
```bash
gh api repos/{사용자명}/{프로젝트명}/pages -X PUT -f build_type=workflow
```

배포 확인: `https://{사용자명}.github.io/{프로젝트명}`

### 금지 사항
- netlify, vercel 등 외부 호스팅 서비스 사용 금지
- Personal Access Token 직접 발급 금지 (`gh auth login` OAuth 방식만)
- GitHub Pages Legacy 빌드 방식 금지 (Actions 워크플로우만)
