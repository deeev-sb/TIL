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


> 본 게시글은 [모든 개발자를 위한 HTTP 웹 기본 지식](https://www.inflearn.com/course/http-%EC%9B%B9-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/dashboard) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.
