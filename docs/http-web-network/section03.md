# 03. HTTP 기본

## 3.1. 모든 것이 HTTP

### 3.1.1. HTTP (HyperText Transfer Protocol)
HTTP는 **클라이언트와 서버 간 통신을 위한 통신 규칙 프로토콜**입니다.
지금은 HTML, TEXT 뿐만 아니라 이미지, 움성, 영상, 파일, JSON, XML 등 거의 모든 형태의 데이터를 전송할 수 있습니다.
심지어 서버 간 데이터를 주고 받을 때도 대부분 HTTP를 사용합니다.

### 3.1.2. HTTP 역사

1. `HTTP/0.9` 1991년 : GET 메서드만 지원, HTTP 헤더 X
2. `HTTP/1.0` 1996년 : 메서드, 헤더 추가
3. `HTTP/1.1` 1997년 : 가장 많이 사용하며, 지금 사용하는 대부분의 기능 존재
   - RFC2068(1997) → RFC2616(1999) → RFC7230~7235(2014)
4. `HTTP/2.0` 2015년 : 성능 개선
5. `HTTP/3` 진행 중 : TCP 대신 UDP 사용, 성능 개선

지금 우리가 사용하는 HTTP의 기능 대부분은 `HTTP/1.1` 버전에서 나왔으며, 해당 내용에 대해 공부하는 것이 중요합니다.
`HTTP/2` 부터는 성능 개선이 초점에 맞춰졌습니다. 그렇지만, `HTTP/2`, `HTTP/3`도 점점 증가하고 있는 추세입니다.

아래 이미지와 같이 개발자 도구를 켜고 Naver에 접속해보면, http/1.1 뿐만 아니라 h2가 프로토콜에 있는 것을 확인할 수 있습니다. 이 h2가 HTTP/2입니다.
<img width="1827" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/b0b270b7-366e-42d1-9ad5-b27027e40e7f">

### 3.1.3. 기반 프로토콜

기반 프로토콜은 다음과 같습니다.

- TCP : `HTTP/1.1`, `HTTP/2`
- UDP : `HTTP/3`

이걸 보면서 "UDP는 신뢰성이 좋지 않은데 왜 `HTTP/3`에서 사용했지?" 하는 의문이 들 수도 있습니다.

`HTTP/3`는 **UDP 기반의 QUIC (Quick UDP Internet Connection) 계층** 위에서 돌아갑니다.
**QUIC**는 UDP 기반으로 응답 속도를 개선하고, TCP 기반 다중화와 신뢰성 있는 전송이 가능한 차세대 HTTP 프로토콜입니다.
QUIC는 TLS 1.3 기반으로 암호화된 세션과 함께 패킷을 보내면 0-RTT 만에 신뢰성을 확보합니다.

즉, `HTTP/3`는 QUIC를 통해 UDP 기반의 속도와 신뢰성 문제를 해결하며 성능을 개선하였습니다.

### 3.1.4. HTTP 특징

HTTP는 다음과 같은 특징을 가집니다.

- 클라이언트 서버 구조
- 무상태 프로토콜 (Stateless), 비연결성
- HTTP 메시지
- 단순함
- 확장 가능

특징에 대해 아래에서 자세히 설명드릴 예정이며, 각 특징을 통해 어떠한 점에서 단순하고 확장 가능한지 이해하실 수 있을 것이라 생각됩니다.

## 3.2. 클라이언트 서버 구조

클라이언트는 서버에 요청을 보내고, 서버로부터 응답이 올 때까지 대기합니다.
서버는 클라이언트의 요청에 대한 결과를 만들어 응답합니다.
이러한 구조를 **클라이언트 서버 구조**라고 하며, **Request Response 구조**라고도 합니다.

<img width="300" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/9a82c393-d253-4ad5-96bd-1f9ad3d17420">

하나로 관리되던 클라이언트와 서버가 개념적으로 분리되면서,
클라이언트는 UI와 사용성에, 서버는 비즈니스 로직과 데이터에만 집중하게 되었습니다.
명확하게 분리된 **역할**로 인해, 서로에게 영향을 미치지 않고 **독립적으로 진화**하였습니다.

## 3.3. Stateful, Stateless

### 3.3.1. Stateful
`Stateful`은 서버가 클라이언트의 **상태를 유지하는 것**입니다.

다음과 같이 클라이언트가 구매를 요청했을 때, 서버에서 클라이언트가 구매를 할 것이라는 정보를 가지고 있습니다.
그렇기에 클라이언트와 통신 중인 서버에서 장애가 발생하게 되면, 다른 서버가 응답을 줄 수 없게 됩니다.
다른 서버와 통신이 연결된 순간부터 클라이언트는 처음부터 다시 정보를 전달해야 합니다.

<img width="918" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/8aad1faa-9db9-4479-be28-5f52864b7768">

### 3.3.2. Stateless

`Stateless`는 서버가 클라이언트의 **상태를 유지하지 않는 것(무상태)** 입니다.

다음과 같이 클라이언트가 요청을 할 때마다 상태에 대해 전달하기 때문에, 서버가 변경되더라도 응답을 내려줄 수 있습니다.
그렇기에 클라이언트의 요청이 폭발적으로 증가하면 응답을 내려주는 서버를 확장하면 됩니다. (스케일 아웃)
다만, 클라이언트에서 매번 추가 데이터를 전송해야 한다는 단점이 있습니다.

<img width="933" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/2b4bdd8f-a826-44e8-88c2-8267fa57e1c7">

그렇다면 `Stateless`가 무조건 좋을까요?

그건 아닙니다. **모든 것을 무상태로 설계할 수 없기 때문**입니다.
단순 서비스 소개 화면과 같은 경우는 무상태로 할 수 있으나, 로그인과 같은 기능은 상태 유지가 필요합니다.
로그인한 사용자의 상태가 유지되지 않는다면, 페이지 이동을 하자마자 로그인이 풀린다거나 하는 문제가 발생하기 때문입니다.
일반적으로 로그인은 브라우저 쿠키와 서버 세션 등을 사용해서 상태를 유지합니다.
다만, 이러한 상태 유지는 최소한으로 반드시 필요할 때만 하는 것이 서버 확장성 측면에서 좋습니다.




## 3.4. 비연결성 (connectionless)

### 3.4.1. 연결을 유지하는 모델

<img width="200" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/6f3d3bb8-ebc1-444f-aa8c-b6520f5e380c">

연결을 유지하는 모델은 여러 클라이언트에서 서버로 요청이 들어오면, 요청을 한 모든 클라이언트와 연결이 유지된 상태를 의미합니다.
실제로 클라이언트가 아무런 요청을 보내지 않아고 연결이 유지되어 불필요한 서버 자원의 소모가 발생합니다.
여기서는 단순히 클라이언트 3대로 표현했지만, 실제로는 수많은 클라이언트가 연결될 수 있고 그로 인해 많은 서버 자원이 필요하게 됩니다.

### 3.4.2. 연결을 유지하지 않는 모델

<img width="200" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/1bec74c6-516a-4dcb-a151-5c95cb154dee">

연결을 유지하지 않는 모델, 즉 **비연결성** 모델은 클라이언트와의 통신 후 응답을 전달하면 연결을 종료합니다.
그로 인해 서버는 아무런 요청을 보내지 않는 클라이언트와는 연결을 할 필요가 없어, 최소한의 자원으로도 운영이 가능합니다.
뿐만 아니라, 일반적으로 초 단위 이하의 빠른 속도로 응답할 수 있으며, 1시간 동안 수천 명이 서비스를 사용해도 실제 서버에서 동시에 처리하는 요청은 수십 개 이하로 유지할 수 있습니다.
그로 인해 서버 자원을 매우 효율적으로 사용하게 됩니다.

그러나 매번 TCP/IP 연결을 새로 맺어야 하며 (3-way handshake 시간 추가), 연결 시 HTML 뿐만 아니라 자바스크립트, CSS, 추가 이미지 등 수 많은 자원이 함께 다운로드 된다는 문제가 있습니다.

<img width="325" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/4f98288d-bb41-4311-9c2c-a2be41e34c73">

지금은 이러한 문재를 **HTTP 지속 연결 (Persistent Connections)** 으로 해결하였습니다.
게다가 HTTP/2, HTTP/3에서는 이러한 부분에서 더 많은 최적화가 이루어졌습니다.

<img width="324" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/806a9741-87c3-4f8d-a58d-45c39b4b4565">

## 3.5. HTTP 메시지

HTTP 메시지는 다음과 같이 시작 라인, 헤더, 공백 라인, Body로 이루어져 있습니다.

<img width="770" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/4f53df81-6a33-4c58-9f33-5fdda1dce730">

### 3.5.1. 시작 라인

시작 라인은 `request-line`과 `status-line`으로 구분할 수 있습니다.
요청 메세지의 시작 라인은 `request-line`이며, 응답 메시지의 시작 라인은 `status-line` 입니다. 하나씩 살펴보도록 하겠습니다.

`request-line`은 다음과 같이 `HTTP-method SP(공백) request-target SP HTTP-version CRLF(엔터)` 구조로 되어 있습니다.

<img width="300" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/522dbe68-8ad2-43a2-a178-0921466b43fe">

- HTTP 메서드(method)
  - 서버가 수행해야 할 동작 지정
  - 종류
    - GET : 리소스 조회
    - POST : 리소스 생성
    - PUT : 리소스 수정
    - DELETE : 리소스 삭제
- 요청 대상(request target)
   - 절대 경로(`/`)로 시작하고 쿼리를 합친 형태로 많이 사용 : `절대경로[?쿼리]`
   - http://...?x=y 같이 다른 유형의 경로 지정 방법도 있음
- HTTP 버전(version) : 말 그대로 서버에서 요청한 HTTP 버전

그리고 `status-line`은 다음과 같이 `HTTP-version SP status-code SP reason-phrase CRLF` 구조로 되어 있습니다.

<img width="200" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/37d74509-12a1-4230-8f34-91502aed678b">

- HTTP 상태 코드 : 요청 성공, 실패를 나타냄
  - 200 : 성공
  - 400 : 클라이언트 요청 오류
  - 500 : 서버 내부 오류
- reason phrase (이유 문구)
  - 사람이 이해할 수 있는 짧은 상태 코드 설명 글

### 3.5.2. HTTP 헤더

헤더는 다음과 같이 `field-name ":" OWS(띄어쓰기 허용) field-value OMS` 구조로 되어 있습니다. OMS는 띄어쓰기를 해도 되고 안해도 된다는 의미입니다.

<img width="228" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/412ac524-c16b-4d9c-8ca1-4aed3460781e">

`field-name`은 대소문자 구분이 없지만, `field-value`는 대소문자를 구분합니다.

**HTTP 헤더의 용도**는 다음과 같습니다.

- HTTP 전송에 필요한 모든 부가 정보 전달
  - e.g. 메시지 바디 타입, 메시지 바디 크기, 압축, 인증, 요청 클라이언트 정보, 서버 애플리케이션 정보, 캐시 관리 정보 등
- 표준 헤더가 너무 많음
- 필요 시 임의의 헤더 추가 가능
  - e.g. helloworld: hihi

### 3.5.3. HTTP 메시지 바디

메시지 바디는 **실제로 전송할 데이터**이며, HTML 문서, 이미지, 영상 JSON 등등 **byte로 표현할 수 있는 모든 데이터**를 전송할 수 있습니다.

### 3.5.4. 정리

지금까지 HTTP를 살펴보며 되게 단순하고 확장 가능하다는 사실을 알 수 있습니다.
지금까지 배운 HTTP에 대해 다시 정리보면 다음과 같습니다.

- HTTP 메시지에 모든 것을 전송함
- HTTP 역사는 HTTP/1.1을 기준으로 학습하면 됨
- 클라이언트 서버 구조
- 무상태 프로토콜 (stateless)
- HTTP 메시지 구조
- 단순하며 확장 가능함

> 본 게시글은 [모든 개발자를 위한 HTTP 웹 기본 지식](https://www.inflearn.com/course/http-%EC%9B%B9-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/dashboard) 강의를 참고하여 작성되었습니다.
>
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.
>

추가로 참고한 내용
- <https://aws.amazon.com/ko/compare/the-difference-between-https-and-http/>
- <https://github.com/Kim-SuBin/TIL/blob/main/docs/http-web-network/section01.md>
- <http://blog.skby.net/quic-quick-udp-internet-connection/>
- <https://romromlog.tistory.com/entry/%EB%AA%A8%EB%93%A0-%EA%B0%9C%EB%B0%9C%EC%9E%90%EB%A5%BC-%EC%9C%84%ED%95%9C-HTTP-%EC%9B%B9-%EA%B8%B0%EB%B3%B8-%EC%A7%80%EC%8B%9D-3-HTTP-%EA%B8%B0%EB%B3%B8>