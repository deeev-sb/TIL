# 05. HTTP 메서드 활용

## 5.1. 클라이언트에서 서버로 데이터 전송

클라이언트에서 서버로 데이터를 전달하는 방법은 크게 두 가지 입니다.

1. 쿼리 파라미터를 통한 데이터 전송
   - GET
   - 주로 정렬 필터 (검색어)
2. 메시지 바디를 통한 데이터 전송
   - POST, PUT, PATCH
   - 회원 가입, 상품 주문, 리소스 등록, 리소스 변경

클라이언트에서 서버로 데이터 전송하는 것을 **네 가지 상황**을 통해 살펴보겠습니다.

### 5.1.1. 정적 데이터 조회

<img width="334" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/72e18858-fc91-4a59-ac72-25de58cc4450">

- 주로 이미지, 정적 텍스트 문서 등을 조회하는 데 사용
- `GET` 사용
- 일반적으로 **쿼리 파라미터 없이** 리소스 경로로 단순하게 조회 가능

### 5.1.2. 동적 데이터 조회

<img width="358" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/039ba1c8-b4d1-4d62-8b85-d5e8e2d376da">

- 주로 검색, 게시판 목록 정렬/필터 등을 조회하는 데 사용
- `GET` 사용
- **쿼리 파라미터를 사용**하여 데이터 전달

### 5.1.3. HTML Form을 통한 데이터 전송

다음과 같이 Form 형식으로 데이터를 전송하면, 웹 브라우저에서 HTTP 메시지를 생성하여 서버로 요청합니다.

<img width="476" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/59e79db6-96ed-4a09-82d4-64714f429584">

Form 형식은 POST 뿐만 아니라 GET도 지원합니다.

<img width="404" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/e4a62d5e-8c49-484f-9206-e5369c463dd5">

그리고 이미지와 같은 데이터 전송도 지원합니다.

<img width="673" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/63a93757-c5dc-4093-8baf-8639b2989e7d">

HTML Form을 통한 데이터 전송에 대해 정리하면 다음과 같습니다.

- HTML Form submit 시 POST 전송 (e.g. 회원 가입, 상품 주문, 데이터 변경)
- HTML Form은 GET, POST만 지원
- Content-Type: application/x-www-form-urlencoded 사용
  - form 내용을 메시지 바디를 통해 전송 (key=value, 쿼리 파라미터 형식)
  - 전송 데이터를 url encoding 처리 (e.g. abc김 → abc%EA%B9%80 )
- Content-Type: multipart/form-data
  - 파일 업로드 같은 바이너리 데이터 전송 시 사용
  - 다른 종류의 여러 파일과 폼의 내용을 함께 전송 가능

### 5.1.4. HTTP API를 통한 데이터 전송

<img width="398" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/24fe5ec3-3432-4cfd-b499-7e1d3db23333">

- 통신 종류
  - 서버 to 서버 : 백엔드 시스템 통신
  - 서버 to 앱 클라이언트 : 아이폰, 안드로이드
  - 서버 to 웹 클라이언트 : HTML에서 Form 전송 대신 자바 스크립트를 통한 통신에 사용 (AJAX)
- POST, PUT, PATCH : 메시지 바디를 통해 데이터 전송
- GET : 조회, 쿼리 파라미터로 데이터 전달
- Content-Type : application/json을 주로 사용 (사실상 표준)
  - Content-Type은 TEXT, XML, JSON 등이 있음. 과거에는 XML을 많이 사용하였는데, 지금은 JSON을 많이 사용함.

## 5.2. HTTP API 설계 예시

HTTP URI를 어떻게 설계해야 하는지에 대해 세 가지 예시를 통해 살펴보도록 하겠습니다.

1. HTTP API - 컬렉션
   - POST 기반 등록
   - e.g. 회원 관리 API 제공
2. HTTP API - 스토어
   - PUT 기반 등록
   - e.g. 정적 컨텐츠 관리, 원격 파일 관리
3. HTML FORM 사용
   - 웹 페이지 회원 관리
   - GET, POST만 지원

### 5.2.1. POST 기반 등록

회원 관리 시스템 API를 다음과 같이 설계했다고 가정해봅시다.

- 회원 목록 /members → GET
- 회원 등록 /members → POST
- 회원 조회 /members/{id} → GET
- 회원 수정 /members/{id} → PATCH, PUT, POST(애매할 때 사용)
- 회원 삭제 /members/{id} → DELETE

여기서 POST 기반으로 신규 자원을 등록하는 것에 대한 특징은 다음과 같습니다.

- 클라이언트는 등록될 리소스의 URI를 모른다.
  - 회원 등록 : `POST /members`
- 서버가 새로 등록된 리소스 URI를 생성해준다.
  ```text
  HTTP/1.1 201 Created
  Location: **/members/100**
  ```
- 컬렉션(Collection)
  - 서버가 관리하는 리소스 디렉터리
  - 서버가 리소스의 URI를 생성하고 관리
  - 여기서 컬렉션은 `/members`

### 5.2.2. PUT 기반 등록

파일 관리 시스템 API를 다음과 같이 설계했다고 가정해봅시다.

- 파일 목록 /files → GET
- 파일 조회 /files/{filename} → GET
- 파일 등록 /files/{filename} → PUT
- 파일 삭제 /files/{filename} → DELETE
- 파일 대량 등록 /files → POST

이 때, 파일 등록을 `PUT`으로 설계한 이유는 클라이언트가 등록할 파일 이름을 알고 있기 때문입니다.
동일한 이름으로 파일을 등록하려고 할 때, 기존 파일을 삭제하고 업로드하는 방식이 아닌, 바로 덮어쓰기 되도록 구현한 것 입니다.

이러한 PUT 기반 등록의 특징은 다음과 같습니다.

- 클라이언트가 리소스 URI를 알고 있어야 한다.
  - 파일 등록 : `PUT /files/star.jpg`
- 클라이언트가 직접 리소스의 URI를 지정한다.
- 스토어 (Store)
  - 클라이언트가 관리하는 리소스 저장소
  - 클라이언트가 리소스의 URI를 알고 관리
  - 여기서 스토어는 `/files`

### 5.2.3. HTML FORM 사용

HTML FORM은 이전에도 얘기했듯 **GET, POST**만 지원합니다.
물론, AJAX 같은 기술을 통해 해결할 수 있으나 여기서는 순수 HTML FORM에 대해서만 살펴보겠습니다.

HTML FORM을 통해 회원 관리 시스템 API를 다음과 같이 설계했다고 합시다.

- 회원 목록 /members → GET
- 회원 등록 폼 /members/new →
- 회원 등록 /members/new, /members → POST
- 회원 조회 /members/{id} → GET
- 회원 수정 폼 / members/{id}/edit → GET
- 회원 수정 /members/{id}/edit, /members/{id} → POST
- 회원 삭제 /members/{id}/delete → POST

이러한 HTML FORM은 다음과 같은 특징을 가집니다.

- GET, POST 만지원
- 컨트롤 URI
  - GET, POST만 지원되는 제약을 해결하기 위해 동사로 된 리소스 경로 사용
  - POST의 `/new`, `/edit`, `/delete`가 컨트롤 URI
  - HTTP 메서드로 해결하기 애매한 경우 사용 (HTTP API 사용)

컨트롤 URI는 정말 어쩔 수 없는 상황에만 사용하도록 합시다!

### 5.2.4. 정리

지금까지 살펴본 내용을 정리하면 다음과 같습니다.

- HTTP API : 컬렉션
  - POST 기반 등록
  - 서버가 리소스 URI 결정
- HTTP API : 스토어
  - PUT 기반 등록
  - 클라이언트가 리소스 URI 결정
- HTML FORM 사용
  - 순수 HTML + HTML FORM 사용 시 GET, POST만 지원

> 본 게시글은 [모든 개발자를 위한 HTTP 웹 기본 지식](https://www.inflearn.com/course/http-%EC%9B%B9-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/dashboard) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.
