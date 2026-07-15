// public/ 폴더 안 파일을 가리키는 절대경로 문자열을 만들 때 쓴다.
// 로컬 개발/루트 배포에서는 '/'가, GitHub Pages 같은 서브경로 배포에서는
// '/저장소이름/'이 import.meta.env.BASE_URL에 자동으로 들어있어서
// 코드에 배포 경로를 하드코딩하지 않아도 된다.
export function publicPath(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
