# ✅ Rule

## 커밋 컨벤션

커밋은 아래와 같은 방식으로 기록합니다.

<aside>

💡 **[Feat] ✨ OOO 기능 추가**

</aside>

- Init : 프로젝트 초기 생성
- Feat : 새로운 기능 추가
- Fix : 버그 해결
- Design : UI 디자인 변경
- !BREAKING CHANGE : 커다란 API 변경
- !HOTFIX : 급하게 치명적인 버그를 고쳐야하는 경우
- Style : 코드 포맷 변경, 세미 콜론 누락 등 코드 수정이 없는 경우
- Refactor : 코드 리팩토링
- Comment : 필요한 주석 추가/변경
- Docs : 문서 생성/수정
- Test : 테스트 추가/변경, 테스트 리팩토링
- Chore : 빌드 태스트 업데이트, 패키지 매니저를 설정 등 기타 변경 사항
- Rename : 파일 혹은 폴더명 수정/이동
- Remove : 파일 삭제

이모지는 **gitmoji**에 있는 이미지를 상황에 맞춰 사용합니다.

[gitmoji](https://gitmoji.dev/)

[[협업] 협업을 위한 git 커밋컨벤션 설정하기](https://overcome-the-limits.tistory.com/entry/%ED%98%91%EC%97%85-%ED%98%91%EC%97%85%EC%9D%84-%EC%9C%84%ED%95%9C-%EA%B8%B0%EB%B3%B8%EC%A0%81%EC%9D%B8-git-%EC%BB%A4%EB%B0%8B%EC%BB%A8%EB%B2%A4%EC%85%98-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0)

## Git-Flow

- main : 제품으로 출시될 수 있는 브랜치
- develop : 다음 출시 버전을 개발하는 브랜치
- feature : 기능을 개발하는 브랜치
- release : 이번 출시 버전을 준비하는 브랜치
- hotfix : 출시 버전에서 발생한 버그를 수정 하는 브랜치

[우린 Git-flow를 사용하고 있어요 | 우아한형제들 기술블로그](https://techblog.woowahan.com/2553/)