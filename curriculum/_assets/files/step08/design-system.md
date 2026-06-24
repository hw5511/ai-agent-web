---
alwaysApply: true
---

- **중요**: 모든 기본 컴포넌트는 MUI 최신 버전 사용
- **중요**: Grid 컴포넌트는 아래 코드의 import 구문과 props 참고
- 모든 컴포넌트 스타일은 가능한 MUI의 `sx` prop 사용
- 수정 시 의존성을 줄 만한 기능들은 독립된 컴포넌트로 모듈화
- 새로운 수정·추가사항이 있을 때 지시하지 않은 기존 기능·형태에 영향 주지 않도록 조심
- 특별한 의도가 없다면 구글 Material Design 가이드에 기반한 UX에 충실

## 반응형 디자인 규칙

### 1. Grid 시스템 사용법
- Grid 컴포넌트는 반드시 `size={{ xs: 12, md: 6 }}` 형태로 사용
- 주요 breakpoint: xs(0px), sm(600px), md(900px), lg(1200px), xl(1536px)
- 모바일 우선으로 xs부터 설정하고 필요에 따라 md, lg 추가

### 2. Typography 반응형 설정
- `fontSize: { xs: '1rem', md: '1.2rem' }` 형태로 화면 크기별 폰트 크기 설정
- 제목의 경우 `{ xs: '2rem', md: '3rem' }` 등 더 큰 차이 적용
- lineHeight는 1.2~1.6 사이 값으로 가독성 확보

### 3. 간격 및 패딩 반응형
- `py: { xs: 4, md: 8 }` 형태로 화면 크기별 간격 조정
- Container maxWidth: `'sm'`(600px), `'md'`(900px), `'lg'`(1200px), `'xl'`(1536px)
- 모바일에서는 `px: 2`, 데스크톱에서는 `px: 3` 이상 권장

### 4. useMediaQuery 활용
- `const isMobile = useMediaQuery(theme.breakpoints.down('md'))`
- 복잡한 레이아웃 변경이 필요한 경우에만 사용
- 단순한 크기 조정은 sx 속성의 반응형 객체 사용 권장

## 페이지 레이아웃 및 중앙 정렬 규칙 [필수 준수]

### CSS 초기화 (index.css에 반드시 포함)
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

### 전체 페이지 중앙정렬 패턴 (App.jsx에 반드시 적용)
```jsx
return (
  <Box sx={{ 
    width: '100%', 
    minHeight: '100vh', 
    display: 'flex', 
    justifyContent: 'center',
    alignItems: 'center',
    py: { xs: 2, md: 4 }
  }}>
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* 페이지 내용 */}
    </Container>
  </Box>
);
```

### 반응형 설정 필수 적용
- **Container 최대 너비**: `maxWidth="sm"`(600px), `"md"`(900px), `"lg"`(1200px)
- **반응형 패딩**: `py: { xs: 2, md: 4 }`
- **반응형 간격**: `px: { xs: 2, md: 3 }`

## Grid 컴포넌트 참고 코드

```jsx
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

export default function FullWidthGrid() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 8 }}>
          <Item>xs=6 md=8</Item>
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <Item>xs=6 md=4</Item>
        </Grid>
      </Grid>
    </Box>
  );
}
```
