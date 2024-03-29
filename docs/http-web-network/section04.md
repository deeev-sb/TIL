# 04. HTTP 메서드

## 4.1. HTTP API 만들어보자

회원 정보 관리 API를 만들어달라는 요구사항에 대해 다음과 같이 URI 설계를 했다고 생각해 봅시다.

- 회원 목록 조회 : `/read-member-list`
- 회원 조회 : `/read-member-by-id`
- 회원 등록 : `/create-member`
- 회원 수정 : `/update-member`
- 회원 삭제 : `/delete-member`

이것은 과연 좋은 URI 설계라고 할 수 있을까요?

URI는 **리소스를 식별** 할 수만 있으면 됩니다.
그렇기에 좋은 URI를 설계하기 위해서는 먼저 **리소스와 행위를 분리**해야 합니다.

- 리소스 : 회원
- 행위 : 조회, 등록, 삭제, 변경

리소스와 행위를 분리했으니, 여기에 맞춰 설계를 다시 해보겠습니다.
이 때, URI 계층 구조를 활용하였습니다. 참고로, 계층 구조상 상위를 컬렉션으로 보며, 복수 단어 사용을 권장합니다. (member → members)

- 회원 목록 조회 : `/members`
- 회원 조회 : `/members/{id}`
- 회원 등록 : `/members/{id}`
- 회원 수정 : `/members/{id}`
- 회원 삭제 : `/members/{id}`

리소스만 식별할 수 있게 URI 설계를 완료했습니다.
그러나 같은 URI로 인해 행위가 구분되지 않을 것 입니다.
리소스 행위는 어떻게 구분할까요?
바로 아래에 있는 **HTTP 메서드**를 통해 행위를 구분할 수 있습니다.

정리하면, **URI는 리소스에 대한 식별만 할 수 있게 설계하면 되고,
리소스의 행위는 HTTP 메서드를 통해 구분합니다.**

## 4.2. HTTP 메서드

HTTP 메서드의 종류는 다음과 같습니다.


| 메서드 | 설명                                                                  |
| :-----: | :-------------------------------------------------------------------- |
|   GET   | 리소스 조회                                                           |
|  POST  | 요청 데이터 처리, 주로 등록에 사용                                    |
|   PUT   | 리소스 대체, 해당 리소스가 없으면 생성                                |
|  PATCH  | 리소스 부분 변경                                                      |
| DELETE | 리소스 삭제                                                           |
|  HEAD  | GET과 동일하지만 메시지 부분을 제외하고 상태 줄과 헤더만 반환         |
| OPTIONS | 대상 리소스에 대한 통신 가능 옵션(메서드)을 설명 - 주로 CORS에서 사용 |
| CONNECT | 대상 리소스로 식별되는 서버에 대한 터널 설정                          |
|  TRACE  | 대상 리소스에 대한 경로를 따라 메시지 루프백 테스트를 수행            |

여기서 많이 사용하는 **GET, POST, PUT, PATCH, DELETE**에 대해 살펴보도록 하겠습니다.

참고로, 리소스라는 표현은 최근 Representation 이라고 바뀌었습니다.

### 4.2.1. GET

`GET`은 **리소스를 조회**할 때 사용하며, 서버에 전달하고 싶은 데이터를 **query(쿼리 파라미터, 쿼리 스트링)** 로 전달합니다.
메시지 바디를 사용해서 데이터를 전달할 수 있지만, 지원하는 곳이 많지 않아 권장하지 않습니다.

다음 그림과 같이 클라이언트에서 URI를 요청하면, 서버에서는 해당 요청에 대한 정보를 찾아 클라이언트로 전달합니다.

<img width="290" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/24e0ae5f-0b5d-4a84-919a-ae649e43e273">

### 4.2.2. POST

`POST`는 **요청 데이터를 처리**할 때 사용하며, 클라이언트에서 **메시지 바디**를 통해 서버로 요청 데이터를 전달합니다.
그러면 서버는 메시지 바디를 통해 들어온 **데이터를 처리**하는 모든 기능을 수행합니다.
전달되는 데이터를 주로 신규 리소스 등록이나 프로세스 처리에 사용합니다.

다음과 같이 클라이언트에서 메시지 바디에 내용을 채워 데이터 처리를 요청할 때,
서버에서는 해당 URI에 해당하는 대로 메시지 바디 내용을 처리한 다음 결과를 담아 클라이언트로 전달합니다.
여기서는 받은 데이터를 DB에 저장하였으며, 데이터를 생성했다는 의미로 `201 Created`와 함께 `Location`을 포함하여 응답을 하였습니다.
참고로, 201이 아닌 200을 써도 괜찮습니다.

<img width="401" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/8996e13e-7e66-4dc3-97f1-b2996d561938">

그렇다면 POST는 **요청 데이터를 어떻게 처리한다**는 뜻일까요?

정확하게 표현하면, POST 메서드는 **대상 리소스가 리소스의 고유한 의미 체계에 따라 요청에 포함된 표현을 처리하도록 요청**합니다.
이러한 요청 데이터 처리에는 다음과 같은 기능이 포함됩니다.

- HTML 양식에 입력된 필드와 같은 데이터 블록을 데이터 처리 프로세스에 제공
  - e.g. HTML FORM에 입력한 정보로 회원 가입, 주문 등에 사용
- 게시판, 뉴스 그룹, 메일링 리스트, 블로그 또는 유사한 기사 그룹에 메시지 게시
  - e.g. 게시판 글쓰기, 댓글 달기
- 서버가 아직 식별하지 않은 새 리소스 생성
  - e.g. 신규 주문 생성
- 기존 자원에 데이터 추가
  - e.g. 한 문서 끝에 내용 추가

즉, 리소스 URI에 POST 요청이 오면 요청 데이터를 어떻게 처리할지 **리소스마다 따로 정해야** 하며, 따로 정해진 것은 없습니다.

**POST에 대한 내용을 정리** 하면 다음과 같습니다.

1. 새 리소스 생성(등록)
   - 서버가 아직 식별하지 않은 새 리소스 생성
2. **요청 데이터 처리**
   - 단순히 데이터를 생성하거나 변경하는 것을 넘어, 프로세스를 처리해야 하는 경우
   - e.g. 주문 결재 완료 → 배달 시작 → 배달 완료 처럼 단순히 값 변경을 넘어 프로세스의 상태가 변경되는 경우
   - POST의 결과로 새로운 리소스가 생성되지 않을 수도 있음
   - e.g. POST /orders/{orderId}/start-delivery : 이렇게 행동이 포함되는 URI는 **컨트롤 URI**라고 함
3. 다른 메서드로 처리하기 애매한 경우
   - e.g. JSON으로 조회 데이터를 넘겨야 하는데, GET 메서드를 사용하기 어려운 경우
   - GET이 캐싱을 하기 때문에 조회 성능이 더 좋지만, 메시지 바디에 내용을 담아야 하는 등 어쩔 수 없는 경우에 POST 사용

### 4.2.3. PUT

`PUT`은 **리소스를 대체**할 때 사용합니다. 정확히 말하면, 리소스가 있으면 대체하고 없으면 생성하는 **덮어쓰기**입니다.
POST와 다르게 **클라이언트가 리소스를 식별**할 수 있습니다.

다음과 같이 `members/100`이라는 URI로 리소스를 식별하여 데이터를 전달합니다.
그러면 `members/100`에 있던 기존 데이터는 요청한 데이터로 변경됩니다.
<img width="492" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/5d3ae1c6-0f37-4c77-af19-499803328818">

만약, 리소스가 존재하지 않는다면, 신규 리소스를 생성합니다.

<img width="418" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/4d63f313-ba5a-45c7-9267-d2db25570d81">

처음 `PUT`에 대해 설명할 때, PUT은 리소스를 **덮어쓰기**한다고 표현했습니다.
다음 그림과 같이 기존 데이터에 `username`과 `age`가 존재하는데, PUT의 메시지 바디에 `age`만 담아 보내면 `username`에 대한 내용은 사라지고 새로 요청한 `age`에 대해서만 남아 있습니다.

<img width="536" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/c035bf11-b05d-4405-bedb-94ab02fc93d0">

### 4.2.4. PATCH

리소스를 **부분 변경**하고 싶다면 `PATCH`를 사용하면 됩니다.

위의 `PUT`에 대한 세 번째 그림과 같이 요청 메시지 바디에 `age`에 대한 정보를 담아 보내면,
`PATCH`는 기존의 `username`이 남아 있고, `age`에 대한 내용만 변경됩니다.

<img width="538" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/fdfdcdca-5842-4e2f-8b7d-9d3bda8b7421">

간혹 PATCH가 지원이 되지 않은 경우가 있습니다. 그럴 때는 POST를 사용하면 됩니다.

### 4.2.5. DELETE

`DELETE`는 리소스를 제거할 때 사용합니다.

다음과 같이 `members/100` 리소스를 제거하고 싶다고 요청하면, 서버는 해당 데이터를 DB에서 제거합니다.

<img width="499" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/b7026f5f-b9f6-47d8-b019-42ba0e08a9e9">

## 4.3. HTTP 메서드의 속성

그 동안 배운 HTTP 메서드에 대해 표로 정리해보겠습니다.


| HTTP 메소드 | 요청 Body 존재 | 응답 Body 존재 | 안전 | 멱등 | 캐시 가능 |
| :---------: | :------------: | :------------: | :--: | :--: | :-------: |
|     GET     |       X       |       O       |  O  |  O  |     O     |
|    HEAD    |       X       |       X       |  O  |  O  |     O     |
|    POST    |       O       |       O       |  X  |  X  |     O     |
|     PUT     |       O       |       O       |  X  |  O  |     X     |
|   DELETE   |       X       |       O       |  X  |  O  |     X     |
|   CONNECT   |       O       |       O       |  X  |  X  |     X     |
|   OPTIONS   |      O/X      |       O       |  O  |  O  |     X     |
|    TRACE    |       X       |       O       |  O  |  O  |     X     |
|    PATCH    |       O       |       O       |  X  |  X  |     O     |

여기서 안전, 멱등, 캐시 가능이 무엇인지 살펴봅시다.

### 4.3.1. 안전 (Safe Methods)

안전은 **호출해도 리소스를 변경하지 않는 것**을 의미합니댜.
그래서 GET은 안전하지만, POST, PUT, PATCH와 같이 리소스를 변경할 수 있는 메서드는 안전하지 않다고 합니다.

그렇다면 호출을 많이 해서 쌓이는 로그 같은 것으로 인해 장애가 발생하더라도 안전하다고 할까요?

네. 안전은 **리소스만 고려**하며 그 외의 부분은 고려하지 않습니다.
그렇기에 로그 등으로 인해 장애가 발생하더라도 GET 메서드는 리소스를 변경하지 않으므로 안전하다고 표현합니다.

### 4.3.2. 멱등 (Idempotent Methods)

멱등은 **몇 번을 호출하든 같은 결과를 반환하는 것**입니다.
그렇기에 **자동 복구 메커니즘** 등에 활용됩니다.

멱등 메서드는 다음과 같습니다.

- GET : 몇 번을 조회하든 같은 결과가 반환됨
- PUT : 결과를 대체하므로 같은 요청을 여러 번해도 최종 결과물이 같음
- DELETE : 결과를 삭제하므로, 같은 요청을 여러 번해도 최종적으로는 리소스가 삭제된다는 결과는 똑같음

`POST`는 두 번 요청이 들어왔을 때 최종 결과물이 같지 않기 때문에 **멱등하지 않습니다.**
예를 들어, 게시글 생성 요청을 하면 서로 다른 두 개의 게시글이 생성되며, 결제 요청을 두 번하면 중복 결제가 되기 때문입니다.

그렇다면, 다음과 같이 재요청을 하는 중간에 리소스를 다른 곳에서 변경하여 조회 데이터가 변경되더라도 멱등일까요?

<img width="426" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/8e13cade-cd1b-4269-b173-19f734ba041b">

이러한 상황에도 멱등하다고 표현합니다.
왜냐하면, 멱등은 **외부 요인으로 리소스가 중간에 변경되는 것을 고려하지 않습니다.**

### 4.3.3. 캐시 가능 (Cacheable Methods)

캐시는 데이터나 값을 미리 복사해 놓는 임시 장소이며, GET, HEAD, POST, PATCH 메서드는 캐시 가능합니다.
그러나 실제로는 **GET, HEAD** 정도만 캐시를 사용하고 있습니다.
캐시를 하려면 키가 맞아야 하는데, **POST, PATCH**의 경우 본문 내용 (message body)까지 캐시 키로 고려해야 하기에 구현이 쉽지 않습니다.
그렇기에 실무에서는 잘 사용하지 않습니다.

> 본 게시글은 [모든 개발자를 위한 HTTP 웹 기본 지식](https://www.inflearn.com/course/http-%EC%9B%B9-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/dashboard) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.

추가로 참고한 내용

- [https://ko.wikipedia.org/wiki/HTTP](https://ko.wikipedia.org/wiki/HTTP)
- [https://ko.wikipedia.org/wiki/%EC%BA%90%EC%8B%9C](https://ko.wikipedia.org/wiki/%EC%BA%90%EC%8B%9C)
