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

- From : 유저 에이전트의 이메일 정보
  - 요청 헤더에서 사용
  - 일반적으로 잘 사용되지 않음
  - 검색 엔진에서 주로 사용
- Referer : 이전 웹 페이지 주소
  - 요청 헤더에서 사용
  - 현재 요청된 페이지의 이전 웹 페이지 주소
  - `A -> B`로 이동하는 경우, B를 요청할 때 `Referer: A`를 포함하여 요청 ⇒ 유입 경로 분석 가능
  - 참고로, referer은 referrer의 오타
- User-Agent: 유저 에이전트 애플리케이션 정보
  - 요청 헤더에서 사용
  - e.g. `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/
    537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36`
  - 어떤 종류의 브라우저에서 장애가 발생하는지 파악 가능
- Server : 요청을 처리하는 ORIGIN 서버의 소프트웨어 정보
  - 응답 헤더에서 사용
  - e.g. `Server: Apache/2.2.22 (Debian)`
  - ORIGIN 서버는 실제로 요청을 처리하는 서버를 의미함
- Date : 메시지가 발생한 날짜와 시간
  - 응답 헤더에서 사용
  - e.g. `Tue, 15 Nov 1994 08:12:31 GMT`

> 본 게시글은 [모든 개발자를 위한 HTTP 웹 기본 지식](https://www.inflearn.com/course/http-%EC%9B%B9-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/dashboard) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.
