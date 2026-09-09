# BlueT_Homepage

BlueT Golf의 반응형 회사 홈페이지와 별도 공지·뉴스 관리자 사이트입니다.

## 테스트 주소

- 홈페이지: https://bluet-golf-homepage.iamjssong.chatgpt.site/
- 관리자: https://bluet-golf-homepage.iamjssong.chatgpt.site/admin.html

초기 테스트 배포는 소유자 전용입니다. 휴대폰에서 같은 ChatGPT 계정으로 로그인해 접속합니다. 관리자 비밀번호는 별도로 전달되며 저장소에 포함하지 않습니다.

## 기능

- 회사 소개, 3열 카트 이미지, 사업 방향, 팀 소개, 공식 문의 이메일
- 모바일·태블릿·데스크톱 반응형 레이아웃
- 홈페이지 공지·뉴스 목록과 상세 보기, 분류별 필터, 더 보기
- 별도 관리자 페이지에서 로그인 후 작성·수정·삭제
- 서버에서 쓰기 권한 확인, 로그인 시도 제한, 입력 검증
- 게시글을 배포 플랫폼의 D1 데이터베이스에 영구 저장

## 실행과 배포

### GitHub Pages 공개 홈페이지

`main` 브랜치에 변경사항을 push하면 GitHub Actions가 홈페이지의 정적 화면을 GitHub Pages에 자동 배포합니다.

- 주소: `https://iamjssong.github.io/BlueT_Homepage/`
- 포함: 홈페이지, 이미지, 스타일, 방문자용 화면
- 제외: 관리자 화면, Worker API, D1 데이터베이스

GitHub Pages는 정적 호스팅이므로 공지·뉴스 API와 관리자 기능은 기존 배포 플랫폼에서 동작합니다. 저장소 Settings → Pages에서 Pages를 활성화하고 Source를 `GitHub Actions`로 선택해야 합니다.

### 로컬 미리보기

Python 3에서 `python3 server.py` 실행 후 http://127.0.0.1:8765 에 접속합니다.
로컬 글과 비밀번호는 프로젝트 상위의 `.bluet-data/`에 저장됩니다. 최초 실행 시 관리자 비밀번호가 생성됩니다. 로컬 데이터와 배포 데이터는 별도입니다.

### 클라우드 빌드

Node.js 24 이상과 pnpm을 사용합니다.

```
pnpm install
pnpm run build
pnpm test
```

`worker.mjs`가 배포용 웹 서버이며 `scripts/build.mjs`가 필요한 공개 파일만 묶어 `dist/server/index.js`를 생성합니다. 원본 HTML·CSS·JS를 그대로 사용하므로 로컬과 클라우드 화면이 같습니다. 데이터베이스 스키마는 `db/schema.ts`, 마이그레이션은 `drizzle/`에 있습니다. 변경 시 `pnpm db:generate`를 실행합니다.

Sites에서 `.openai/hosting.json`의 프로젝트에 배포합니다. 런타임 비밀값 `ADMIN_PASSWORD_SHA256`에 관리자 비밀번호의 SHA-256 해시를 설정합니다. 배포 비밀번호의 원문·DB·키는 GitHub에 올리지 않습니다. GitHub 업로드 자체가 자동 배포를 실행하지는 않습니다.

## 주요 파일

- `index.html`, `style.css`, `script.js`: 회사 홈페이지
- `news.js`: 방문자용 읽기 전용 게시판
- `admin.html`, `admin.css`, `admin.js`: 관리자 사이트
- `worker.mjs`: 클라우드 API, 인증, 정적 파일 제공
- `server.py`: 로컬 테스트 서버
- `tests/worker.test.mjs`: 권한·입력 검증·게시글 CRUD·로그인 제한 테스트
- `assets/bluet-three-row-cart.png`: 제공된 프레젠테이션의 3열 카트 원본 이미지
- `assets/vision.jpg`: AI 생성 골프장 비전 이미지
- `design/concept.png`, `assets/hero.jpg`: 보관한 초기 디자인 시안·이미지

카트 원본 이미지는 제공 자료의 표기를 유지했습니다. 프레젠테이션 원본, 투자·재무 자료, 개인 인증 정보는 이 저장소에 포함하지 않았습니다.

문의: bluetgolf@bluetgolf.com
