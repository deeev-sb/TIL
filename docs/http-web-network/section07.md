# 07. HTTP 헤더 1 - 일반 헤더

## 7.1. HTTP 헤더 개요

HTTP 헤더는 `field-name ":" OWS(띄어쓰기 허용) field-value OMS` 구조로 이루어져 있으며, `field-name`은 대소문자 구분이 없습니다.

<img width="770" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/4f53df81-6a33-4c58-9f33-5fdda1dce730">

HTTP 헤더는 다음과 같은 특징을 가집니다.

- HTTP 전송에 필요한 모든 부가 정보
  <br/>e.g. 메시지 바디의 내용, 메시지 바디의 크기, 압축, 인증, 요청 클라이언트, 서버 정보, 캐시 관리 정보, ...
- 표준 헤더가 많음
- 필요 시 임으의 헤더 추가 가능 <br/>e.g. `helloword: hihi`

### RFC2616 vs. RFC723x

과거(RFC2616) HTTP 헤더는 다음과 같이 4가지로 헤더를 구분했습니다.

<img width="400" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/2bbeaf1c-671d-420d-abca-ddc44bd91c09">

- General 헤더 : 헤메시지 전체에 적용되는 정보 <br/>e.g. `Connection: close`
- Request 헤더 : 요청 정보 <br/>e.g. `User-Agent: Mozila/5.0 (Macintosh; ..)`
- Response 헤더 : 응답 정보 <br/>e.g. `Server: Apache`
- Entity 헤더 : 엔티티 바디 정보 <br/>e.g. `Content-Type: text/html`, `Content-Length: 3423`

이러한 RFC2616은 2014년 RFC7230~7235로 HTTP 개념이 세분화되면서 폐기됩니다.
RFC2616에서 사용하던 엔티티(Entity)라는 용어가 사라졌으며, 표현(Representation)이라는 용어로 대체됩니다.
여기서 표현은 표현 메타데이터(representation Medata)와 표현 데이터(representation data)가 합친 것 입니다.

`message body`에 대한 정의도 달라졌습니다. 과거와 현재의 HTTP 에 대해 정리하면 다음과 같습니다.

|              | RFC2616     | RFC723x            |
|:-------------|:------------|:-------------------|
| 등장           | 1999년       | 2014년              |
| 요청/응답 실제 데이터 | 엔티티(Entity) | 표현(Representation) |
| 메시지 본문       | 엔티티 본문 전달   | 표현 데이터 전달          |
| 정보 제공 헤더     | 엔티티 헤더      | 표현 헤더              |

엔티티 헤더와 표현 헤더는 동일하게 데이터 유형(html, json), 데이터 길이, 압축 등의 정보를 제공합니다.

## 7.2. 표현(Representation)

표현 헤더에는 다음과 같은 정보를 담고 있으며, 전송과 응답 모두 사용합니다.

- `Content-Type` : 표현 데이터의 형식
  - 미디어 타입, 문자 인코딩 등
  - `text/html; charset=utf-8`, `application/json`, `image/png`, ...
- `Content-Encoding` : 표현 데이터의 압축 방식
  - gzip, deflate, identity 등을 사용하여 표현 데이터를 압축했음을 의미
  - 데이터를 전달하는 곳에서 압축 후 인코딩 헤더 추가 → 데이터를 읽는 쪽에서 인코딩 헤더 정보를 압축 해제
- `Content-Language` : 표현 데이터의 자연 언어
  - ko, en, en-US, ...
- `Content-Length` : 표현 데이터의 길이
  - 바이트 단위
  - `Transfer-Encoding`(전송 코딩)을 사용하면 `Content-Length`를 사용하면 안됨

참고로, 표현 헤더는 표현 메타데이터와 페이로드 메시지를 구분해야 하지만 여기서는 자세한 설명을 생략하였습니다.

## 7.3. 콘텐츠 협상(Content Negotiation)

콘텐츠 협상은 **클라이언트가 선호하는 표현을 서버에게 요청하는 것**이며, 헤더 내에 협상 정보를 포함하여 전달합니다.
이러한 콘텐츠 협상 헤더는 **요청 시에만 사용**하며, 서버는 이를 최대한 맞춰 응답합니다.

- `Accept` : 클라이언트가 선호하는 미디어 타입 전달
- `Accept-Charset` : 클라이언트가 선호하는 문자 인코딩 전달
- `Accept-Encoding` : 클라이언트가 선호하는 압축 인코딩 전달
- `Accept-Language` : 클라이언트가 선호하는 자연 언어 전달

다음과 같이 브라우저에서 선호하는 자연 언어를 지정하여 보냈을 때, 서버에서 선호하는 언어를 지원하는 경우 해당 언어로 응답을 반환합니다.

<img width="350" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/31fb37cc-15ac-4850-a5b2-9fb0c879e5ce">

그렇지만 선호하는 자연 언어를 지원하지 않은 경우, 기본 값으로 지정된 언어를 반환합니다.

<img width="350" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/f78edbf9-9ba0-42c2-92c4-f56ef4c2d5d4">

그러나 독일어가 아닌 영어로 받고 싶다면 어떻게 해야 할까요? 이러한 경우 우선순위를 함께 전달하면 됩니다.

우선순위는 **`Queality Values(q)` 값**을 사용하며, `0 ~ 1`의 범위에서 나타냅니다. 그리고 **값이 클수록 우선순위가 높습니다.**
아래 그림 예시를 통해 조금 더 상세하게 살펴보겠습니다.

<img width="400" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/bf2e1a8f-f18b-402f-b431-bd9ac4941cb6">

`ko-KR`의 경우 `Quality Values` 값이 생략되어 있는데 이러한 경우는 `q=1`입니다. 그리고 그 다음에 적힌 값을 살펴보면 우선순위가 순서대로 기입되어 있는 것을 확인할 수 있습니다. 정리하면 다음과 같습니다.

1. ko-KR;q=1 (q생략)
2. ko;q=0.9
3. en-US;q=0.8
4. en:q=0.7

그렇다면 다음과 같이 적혀 있는 경우는 어떤 것이 더 우선순위가 높을까요?

```text
GET /event
Accept: text/*, text/plain, text/plain;format=flowed, */*
```

이러한 경우, **구체적일수록 우선순위가 높습니다.** 우선순위대로 정리하면 다음과 같습니다.

1. text/plain;format=flowed
2. text/plain
3. text/*
4. */*

다음과 같이 우선순위를 정하였을 때, `text/plain`이라는 미디어 타입은 우선순위가 어떻게 될까요?

```text
Accept: text/*;q=0.3, text/html;q=0.7, text/html;level=1, text/html;level=2;q=0.4, */*;q=0.5
```

이 때는 **구체적인 것을 기준**으로 미디어 타입을 맞춥니다. 그러므로 `text/plain`은 `text/*`과 동일한 `q=0.3`이라는 우선순위를 가집니다.

**협상의 우선순위를 정리**하면 다음과 같습니다.

1. `Quality Values(q)` 값이 클수록 우선순위가 높다.
2. 구체적인 것이 더 우선순위가 높다
3. 구체적인 것을 기준으로 미디어 타입을 맞춘다.

## 7.4. 전송 방식

전송 방식은 다음과 같이 네 가지로 분류할 수 있습니다.

- 단순 전송
- 압축 전송
- 분할 전송
- 범위 전송

먼저 **단순 전송**은 한 번에 요청하고 `Content-Length` 길이만큼 한 번에 응답하는 것입니다.

<img width="420" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/58180892-bf59-4ed4-a791-53f3731a1285">

그리고 **압축 전송**은 요청에 대한 응답 데이터를 압축하여 전송하는 것입니다. 단순 전송과 같은 내용을 응답으로 내려준다고 할 때, 아래와 같이 압축을 하여 더 적은 `Content-Length`를 보내는 것을 확인할 수 있습니다.
이 때, `Content-Encoding`에 어떤 것을 사용하여 압축하였는지에 대한 정보를 반드시 함께 보내야 합니다.

<img width="420" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/b0ade39a-9c1d-44f7-b80b-cacee4906201">

**분할 전송**은 `Transfer-Encoding: chunked`를 헤더에 포함하여 분할 전송임을 명시해야 합니다. 분할 전송은 지정한 크기만큼 데이터를 잘라 보내는 것이며, 아래 이미지의 경우 5 bytes씩 데이터를 전송합니다.
그리고 데이터 전송이 끝나면 `0`과 `\r\n`을 순서대로 전송하여 더 이상 보낼 데이터가 없음을 명시해야 합니다. 분할 전송의 경우, 전체 길이를 예측할 수 없기에 응답 헤더에 `Content-Length`를 포함하지 않습니다.

<img width="420" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/4ba361d3-8102-41bd-bbac-b61b816937cf">

마지막으로 **범위 전송**은 범위를 지정하여 요청하면 그만큼을 응답하는 것입니다. 범위 전송은 주로 응답을 받던 중 연결이 끊어지면, 연결이 끊어긴 지점부터 데이터를 요청하기 위해 사용합니다.

<img width="420" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/7afa8d0a-1208-4054-804f-6ab19556b06b">

## 7.5. 일반 정보

HTTP 헤더를 구성하는 일반 정보는 다음과 같습니다.

- `From` : 유저 에이전트의 이메일 정보
  - 요청 헤더에서 사용
  - 일반적으로 잘 사용되지 않음
  - 검색 엔진에서 주로 사용
- `Referer` : 이전 웹 페이지 주소
  - 요청 헤더에서 사용
  - 현재 요청된 페이지의 이전 웹 페이지 주소
  - `A -> B`로 이동하는 경우, B를 요청할 때 `Referer: A`를 포함하여 요청 ⇒ 유입 경로 분석 가능
  - 참고로, referer은 referrer의 오타
- `User-Agent`: 유저 에이전트 애플리케이션 정보
  - 요청 헤더에서 사용
  - e.g. `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/
    537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36`
  - 어떤 종류의 브라우저에서 장애가 발생하는지 파악 가능
- `Server` : 요청을 처리하는 ORIGIN 서버의 소프트웨어 정보
  - 응답 헤더에서 사용
  - e.g. `Server: Apache/2.2.22 (Debian)`
  - ORIGIN 서버는 실제로 요청을 처리하는 서버를 의미함
- `Date` : 메시지가 발생한 날짜와 시간
  - 응답 헤더에서 사용
  - e.g. `Tue, 15 Nov 1994 08:12:31 GMT`

## 7.6. 특별한 정보

이번에는 특별한 정보를 제공하는 HTTP 헤더에 대해 알아보겠습니다.

### 7.6.1. Host

`Host`는 `www.google.com`과 같이 **요청한 호스트 정보(도메인)** 정보를 입력하며, 요청 헤더에 **필수**로 포함하는 값입니다.
`Host`를 입력함으로서 하나의 서버가 여러 도메인을 처리하거나 하나의 IP 주소에 여러 도메인이 적용되어 있어도 구분할 수 있습니다.

만약 다음과 같이 Host를 입력하지 않고 보내는 경우, 서버는 어디로 들어온 요청인지 알 수 없어 처리를 하지 못하게 됩니다.
이처럼 하나의 IP 주소를 가진 서버에 여러 도메인이 존재하면, TCP는 기본적으로 IP로 통신되기에 연결은 되지만 실질적인 응답은 받을 수 없게 됩니다.

<img width="400" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/3ba6e427-8dee-46b8-84b2-07d77411c2e7">

초창기에는 위처럼 Host를 입력하지 않아 문제가 많이 발생하게 되었고, 나중에 Host를 필수 입력으로 스펙을 변경하게 됩니다.
Host를 입력함으로서 하나의 IP 주소에 여러 도메인이 존재하더라도 어디로 들어온 요청인지 구분할 수 있습니다.

<img width="399" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/1a4be0c6-44d0-4e61-aa69-b31dfd2d85f3">

### 7.6.2. Location

`Location`은 **페이지 리다이렉션** 정보를 나타내는 헤더입니다.
**3xx 응답 결과**에 Location 헤더가 있으면, Location 값(대상 리소스)으로 자동으로 이동(리다이렉트)합니다.

**201 응답 결과**에서도 Location을 사용하기도 하는데, 이 때 Location 값은 생성된 리소스 URI 입니다.

### 7.6.3. Allow

`Allow`는 **허용 가능한 HTTP 메서드 정보**를 나타내는 헤더입니다.
`405 (Method not Allowed)`에서 응답에 `Allow: GET, HEAD` 와 같은 `Allow` 헤더 정보를 포함해야 합니다.

### 7.6.4. Retry-After
`Retry-After`는 **유저 에이전트가 다음 요청을 하기까지 기다려야 하는 시간**을 알려줍니다.
`503 (Service Unavailable)`과 같은 에러가 발생하면, 서비스가 언제까지 불능인지 알려줄 때 사용합니다.
`Retry-After: Fri, 32 Dec 1999 23:59:59 GMT`와 같이 날짜로 표기할 수도 있고, `Retry-After: 120` 과 같이 초단위로 표기할 수도 있습니다.

## 7.7. 인증

인증과 관련된 헤더는 다음과 같이 두 가지입니다.

- `Authorization` : 클라이언트 인증 정보를 서버에 전달
- `WWW-Authenticate` : 리소스 접근 시 필요한 인증 방법 정의
  - `401 Unauthorized` 응답과 함께 사용
  - e.g. `WWW-Autenticate: Newauth realm="apps", type=1, title="Login to \"apps\"", Basic realm="simple"`

## 7.8 쿠키

쿠키를 사용할 때는 다음과 같은 헤더를 사용합니다.

- `Set-Cookie` : 서버에서 클라이언트로 쿠키 전달 (응답)
- `Cookie` : 클라이언트가 서버에서 받은 쿠키를 저장하고, HTTP 요청 시 서버로 전달

그렇다면 쿠키는 무엇일까요? 지금부터 쿠키에 대해 알아보도록 하겠습니다.

먼저 쿠키를 사용하지 않는 경우 어떻게 되는지 살펴보겠습니다.
다음과 같이 `/welcom`으로 접속하면 로그인 하지 않은 경우 "안녕하세요. 손님"이라는 문장을 반환하고, 로그인한 경우 사용자의 이름을 손님 대신 사용하는 서비스가 있습니다.
~~welcome인데 오타가 난 채로 이미지를 만들어버렸네요..ㅎㅎ..~~

<img width="277" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/d0118b08-1a7f-45e7-b266-e27b189a0d13">

해당 서비스에 "홍길동"이라는 사용자가 로그인을 했습니다.

<img width="273" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/82e97397-c33f-46fa-955e-ffcc2e9d90d5">

그 다음, 다시 `/welcom`으로 접속하면, 기대와 다르게 "안녕하세요. 손님"이라는 문장을 반환합니다.

<img width="278" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/10bf2bfb-61ce-46e6-a960-cde394aca8c6">

이렇게 되는 이유는 기본적으로 HTTP는 무상태(Stateless) 프로토콜이기 때문입니다.
무상태 프로토콜은 클라이언트와 서버가 요청과 응답을 주고 받으면 연결이 끊어지며, 클라이언트가 다시 요청을 하였을 때 서버는 이전 요청을 기억하지 못합니다. 즉, 클라이언트와 서버가 서로 상태를 유지하지 않는 것입니다.

이를 해결하기 위한 대안으로는 모든 요청에 사용자 정보를 포함하는 방법이 있습니다. 그러면 다음과 같이 기대했던 "안녕하세요. 홍길동님"이라는 응답을 받을 수 있습니다.

<img width="273" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/f73c897f-923a-4e2b-802e-75bbfdced72e">

그러나 이러한 대안은 심각한 문제가 있습니다. 모든 요청에 사용자 정보를 포함해야 하는 만큼 개발하기 쉽지 않으며, 브라우저를 완전히 종료하고 다시 열면 상태가 모두 사라지게 됩니다. 뿐만 아니라, URI에 정보를 포함하는 만큼 보안에 취약합니다.

이러한 문제를 쿠키를 사용함으로써 해결할 수 있습니다. 다음과 같이 쿠키를 사용하는 서버에 로그인을 하면, 서버는 `Set-Cookie` 헤더에 사용자 정보를 담아 웹 브라우저로 반환합니다.
그러면 웹 브라우저는 `Set-Cookie`에 담긴 정보를 쿠키 저장소에 저장합니다. 

<img width="274" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/353ec8ae-09e4-4590-a201-f324f034b661">

이렇게 저장된 정보는 웹 브라우저에서 모든 요청에 자동으로 추가하여 서버로 요청을 보냅니다.

<img width="274" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/d3370af6-0e1e-4732-a723-13e2dd571ff4">

쿠키에 대한 전체 내용을 정리해보겠습니다.

- 주로 사용자 로그인 세션 관리에 사용
- 최근에는 광고 정보 트래킹 활용
- 쿠키 정보는 항상 서버에 전송되어 네트워크 추가 트래픽을 유발하므로, 최소한의 정보만 사용(세션 id, 인증 토큰)
- 요청할 때마다 서버에 전송하는 것이 아닌 웹 브라우저 내부에 데이터를 저장하여 사용하고 싶다면 웹 스토리지를 사용하는 것을 추천 (localStorage, sessionStorage) 참고
- 쿠키나 웹 스토리지에는 보안에 민감한 데이터를 저장하면 안됨(e.g. 주민번호, 신용카드 번호 등등)
- 서버 세팅 e.g. `Set-cookie: sessionId=abcde1234; expires=Sat, 26-Dec-2020 00:00:00 GMT; path=/; domain=.google.com; Secure 사용처`
- 쿠키 생명주기
  - `expires=Sat, 26-Dec-2020 -4:39:21 GMT` : 만료일이 되면 쿠키 삭제
  - `max-age=3600` : 초 단위. 0이나 음수를 지정하면 쿠키 삭제
- 쿠키 종류
  - 세션 쿠키 : 만료 날짜를 생략하면 브라우저 종료 시까지만 유지
  - 영속 쿠키 : 만료 날짜를 입력하면 해당 날짜까지 유지
- 도메인 (Domain)
  - domain을 명시한 경우, 명시한 문서 기준 도메인과 서브 도메인에 쿠키 정보 포함
    - `domain=example.org` 지정
      - example.org 쿠키 접근
      - dev.example.org 쿠키 접근
  - domain을 생략한 경우, 현재 문서 기준 도메인에만 쿠키 정보 포함
    - `example.org`에서 쿠키를 생성하고 domain 지정 생략
      - example.org 쿠키 접근
      - dev.example.org 쿠키 미접근
- 경로 (Path)
  - 경로를 퐇마한 하위 경로 페이지만 쿠키 접근
  - 일반적으로 `path=/` (루트)로 지정
  - 만약 `path=/home`으로 지정하면,
    - `/home` 쿠키 접근
    - `/home/level1/level2` 쿠키 접근
    - `/hello` 쿠키 미접근
- 보안
  - `Secure` : 일반적으로 쿠키는 http, https 구분하지 않고 전송하는 데, `Secure` 설정 시 https인 경우에만 전송
  - `HttpOnly` : XSS 공격 방지를 위한 설정으로, 자바스크립트에서 쿠키 접근이 불가하며 HTTP 전송에만 사용 가능
  - `SameSite` : XSRF 공격 방지를 위한 설정으로, 요청 도메인과 쿠키에 설정된 도메인이 같은 경우에만 쿠키 전송

> 본 게시글은 [모든 개발자를 위한 HTTP 웹 기본 지식](https://www.inflearn.com/course/http-%EC%9B%B9-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/dashboard) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.
