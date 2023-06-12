# 02. URI와 웹 브라우저 요청 흐름

## 2.1. URI

### 2.1.1. URI? URL? URN?
URI (Uniform Resource Identifier)의 단어 뜻은 다음과 같습니다.

- Uniform :  리소스를 식별하는 통일된 방식
- Resource : 자원, URI로 식별할 수 있는 모든 것
- Identifier : 다른 항목과 구분하는 데 필요한 정보

URI에는 URL과 URN이 모두 속합니다.

<img width="393" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/21d96a28-91e2-4e13-a53b-4d71e1bcd569">

- URL (Locator) : 리소스가 있는 위치 지정
- URN (Name) : 리소스에 이름 부여

URL과 URN은 다음과 같은 구성으로 되어 있습니다.

<img width="467" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/32a6738f-1a6a-4b07-850f-7fdd054e40bf">

위치는 변할 수 있지만 이름은 변하지 않는다는 점에서 URN이 좋아보이지만, URN 이름만으로 실제 리소스를 찾을 수 있는 방법이 보편화 되지 않았습니다.
따라서 지금부터 URI를 URL과 같은 의미로 이야기한다고 생각하시면 됩니다.

### 2.1.2. URL 문법

URL의 전체 문법은 다음과 같이 구성되어 있습니다.

<img width="634" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/6fa4b771-f0cb-4653-875c-429ea3dc7862">

각각에 대해 살펴보도록 하겠습니다.

- scheme
  - 주로 프로토콜에 사용
  - 프로토콜 : 어떤 방식으로 자원에 접근할 것인가 하는 약속된 규칙 (e.g. http, https, ftp)
  - http는 80 포트, https는 443 포트를 주로 사용하며, 이 두 포트는 생략 가능. 참고로, http에 보안이 추가된 것이 https (HTTP Secure)
- userinfo
  - URL에 사용자 정보를 포함해서 인증하며, 거의 사용하지 않음
- host
  - 도메인명 또는 IP 주소를 직접 사용
- port
  - 접속 포트
  - 일반적으로 생략. 생략된 경우 http는 80, https는 443이라고 보면 됨
- path
  - 리소스 경로이며 계측정 구조임
  - e.g. `/home/file1.jpg`, `/members`, `/members/100`, `/items/iphone12`
- query
  - `key=value` 형태
  - ?로 시작하며, &로 쿼리를 추가할 수 있음 (`?keyA=valueA&keyB=valueB`)
  - 일반적으로 query parameter, query string 등으로 불림
- fragment
  - 잘 사용하지 않음
  - html 내부 북마크 등에 사용
    - `https://github.com/Kim-SuBin/TIL/blob/main/docs/http-web-network/section01.md#13-tcp-udp` 이 url인 경우 `#` 뒤에 붙은 내용
  - 서버에 전송하는 정보는 아님

## 2.2. 웹 브라우저 요청 흐름

"https://www.google.com/search?q=hello&hl=ko" 이라는 URL을 웹 브라우저에서 서버로 요청하고 데이터를 응답 받는 과정을 통해 **웹 브라우저 요청 흐름**을 살펴봅시다.

<img width="700" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/da97f48b-7642-4dfc-910a-fda5a3feb30d">

1. 웹 브라우저에 "https://www.google.com/search?q=hello&hl=ko" URL 입력
2. IP와 Port 정보를 찾음
   - DNS 서버 조회 : www.google.com → 200.200.200.2
   - scheme 조회 : https → 443
3. 웹 브라우저에서 HTTP 요청 메시지를 생성
   <img width="336" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/e92f81c0-6523-492f-928f-54bd524e4511">
   - HTTP 메서드, HTTP 버전 등의 정보가 포함되어 있음
   - 더 많은 정보가 포함되어 있는데, 여기서는 간략하게 표현함
4. SOCKET 라이브러리를 통해 서버로 HTTP 메시지 전달
   - 이 때, 3 way handshake 방식으로 TCP/IP 연결을 함 (IP/PORT 포함)
5. TCP/IP 패킷 생성
6. 인터넷 망의 수많은 노드를 통해 200.200.200.2로 전달
7. 서버에서 패킷을 열어 HTTP 요청 메시지 확인 및 해석
8. 서버에서 HTTP 응답 메시지 생성
   <img width="357" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/a5825ff4-2f08-4209-aaa5-734d928c41cc">
    - HTTP 응답 메시지 관련 내용은 추후 설명 예정이며, 여기서는 생략
9. 서버에서 HTTP 응답 메시지를 TCP/IP 패킷으로 감싸 웹 브라우저로 전달
10. 웹 브라우저에서 HTML 렌더링을 통해 HTML 결과 표출

> 본 게시글은 [모든 개발자를 위한 HTTP 웹 기본 지식](https://www.inflearn.com/course/http-%EC%9B%B9-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/dashboard) 강의를 참고하여 작성되었습니다.
>
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.
>
