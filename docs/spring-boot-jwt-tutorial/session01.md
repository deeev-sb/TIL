# 01. JWT 소개, 프로젝트 생성

## JWT

JWT(JSON Web Token)는 JSON 객체를 사용하여 정보를 전송하는 Web Token이며, RFC 7519 웹 표준으로 지정되어 있습니다.
JWT HMAC 알고리즘을 사용하거나 RSA나 ECDSA를 사용하는 공개/개인 키 쌍으로 사용하여 서명할 수 있습니다.

### JWT 구조
JWT는 Header, Payload, Signature라는 3개의 부분으로 구성되어 있습니다.

![image](https://github.com/deeev-sb/TIL/assets/46712693/9228b48c-fd01-4d99-afb6-6935176762b3)

#### Header (헤더)

Header는 Signature를 해싱하기 위한 알고리즘 정보들이 담겨 있으며, 다음과 같이 구성됩니다.

- alg : Signature(서명) 생성 시 사용한 해시 알고리즘
  - e.g. HMAC SHA256
- type : 토큰 타입. JWT 형식만 지원

Header 예시는 다음과 같습니다.

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### Payload (내용)

Payload는 서버와 클라이언트가 주고 받는 정보가 담겨 있으며, 클레임(claims)을 포함합니다.
클레임은 엔티티 및 추가 데이터에 대한 설명이며, registered, public, private 타입이 존재합니다. 

- registered claims : 미리 정의된 클레임 집합
  - iss (Issuer) : 토큰 발급자
  - sub (Subject) : JWT 인증 주체
  - aud (Audience) : 토큰 수신자 (클라이언트)
  - exp (Expiration Time) : 만료 시간
  - nbf (Not Before) : 토큰 활성 시간
  - iat (Issued At) : 발급 시간
  - jti (JWT ID) : JWT에 대한 고유 식별자
- public claims : 원하는 대로 정의한 공개된 클레임으로, 충돌 방지를 위해 IANA JSON Web Token Registry에 정의하거나 URI로 정의
- private claims : 사용 당사자 간 정보 공유를 위해 생성된 맞춤 클레임으로, 공개 클레임과 충돌이 일어나지 않게 사용하면 됨

Payload 예시는 다음과 같습니다.

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true
}
```

#### Signature (서명)

Signature에는 토큰의 유효성 검증을 위해 인코딩된 헤더, 인코딩된 페이로드, secret key, 헤더에 지정된 알고리즘 정보로 구성됩니다.

예를 들어 HMAC SHA256 알고리즘을 사용하려는 경우, Signature는 다음과 같은 방식으로 생성합니다.

```text
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
```

## JWT 장/단점

JWT는 다음과 같은 장점을 가집니다.

- 서버 확장성이 높으며 대량의 트래픽이 발생해도 대처 가능
- 특정 DB/서버에 의존하지 않아도 인증 가능 (시스템 수평 확장에 유리)

그러나 다음과 같은 단점도 존재합니다.

- Payload의 정보가 많아지면 네트워크 사용량 증가
- 데이터 노출로 인한 보안적인 문제 존재 (주요 데이터는 토큰 내에 기입 X)

## 프로젝트 생성

[start.spring.io](https://start.spring.io/)를 통해 프로젝트 설정 및 생성을 진행하도록 하겠습니다.

강의와 다르게 현재 제공되는 버전에 맞춰 설정하였습니다. 강의에서는 Spring Boot 2.4.1과 Java 8을 사용합니다.

- Gradle Project(Groovy)
- Spring Boot 3.2.3
- Jar
- Java 17

그리고 다음과 같은 dependency를 추가하였습니다.

- Spring Web
- Spring Security
- Spring Data JPA
- H2 Database
- Lombok
- Validation

다음과 같이 설정을 완료하였다면, `GENERATE` 버튼을 클릭하여 프로젝트를 생성합니다.

![image](https://github.com/deeev-sb/TIL/assets/46712693/0c3b8432-a7f2-4c6c-86ba-c6f322717764)

프로젝트 내에 다음과 같이 테스트를 위한 API를 하나 생성해보도록 하겠습니다.

```java
@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("hello");
    }
}
```

테스트는 Intellij에서 제공하는 Endpoints를 이용해보겠습니다.
Endpoints를 클릭하면 다음과 같이 현재 프로젝트 내에 생성된 API 목록을 확인할 수 있습니다.

![image](https://github.com/deeev-sb/TIL/assets/46712693/002e71a5-f91f-4a88-9eac-e8d9104431b9)

프로젝트를 실행한 다음, HTTP Client 내에 있는 초록색 버튼을 클릭하면 요청이 실행됩니다.
현재 Security 설정이 되어 있지 않아 401 에러가 발생하는 것을 확인할 수 있습니다.

![image](https://github.com/deeev-sb/TIL/assets/46712693/59d1dd8b-0660-41d3-b394-c09b337ac915)


> 본 게시글은 [Spring Boot JWT Tutorial](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81%EB%B6%80%ED%8A%B8-jwt) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.

**추가로 참고한 내용**
- <https://jwt.io/introduction>
- <https://guide.ncloud-docs.com/docs/globaledge-jwt>
- <https://datatracker.ietf.org/doc/html/rfc7519#section-4.1>
- <https://hudi.blog/self-made-jwt/>
- <https://puleugo.tistory.com/138>