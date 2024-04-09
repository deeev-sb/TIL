# 01. 스프링 시큐리티 기본

## 환경 설정

[start.spring.io](https://start.spring.io/)를 통해 프로젝트 설정 및 생성을 진행하도록 하겠습니다.

강의와 다르게 현재 제공되는 버전에 맞춰 설정하였습니다.

- Gradle Project(Groovy)
- Spring Boot 3.2.4
- Jar
- Java 17

그리고 다음과 같은 dependency를 추가하였습니다. 강의에서는 MySQL을 사용하였지만, 여기서는 H2 Database를 사용하도록 하겠습니다.

- H2 Database
- Spring Web
- Spring Security
- Lombok
- Spring Boot Dev Tools
- Spring Data JPA
- Mustache

다음과 같이 설정을 완료하였다면, `GENERATE` 버튼을 클릭하여 프로젝트를 생성합니다.

![image](https://github.com/deeev-sb/TIL/assets/46712693/1285fbec-412f-4f18-a177-e9351ec7491a)

그 댜음 `application.yml`을 아래와 같이 설정합니다.

```yaml
server:
  servlet:
    context-path: /
    encoding:
      charset: UTF-8
      enabled: true
      force: true

spring:
  application:
    name: spring-boot-security-and-jwt

  h2:
    console:
      enabled: true

  datasource:
    url: jdbc:h2:mem:test
    driver-class-name: org.h2.Driver
    username: sa
    password:

  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: create-drop
      naming:
        physical-strategy: org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
    properties:
      hibernate:
        show_sql: true
    defer-datasource-initialization: true
```

간단하게 실행 테스트를 하기 위한 Controller를 하나 생성해보겠습니다.

```java
@Controller
public class IndexController {
    @GetMapping({"", "/"})
    public String index() {
        return "index";

    }
}
```

이 `IndexController`는 `mustache`로 구성된 화면을 반환합니다. `mustache`의 기본 경로는 `src/main/resources/`이며,
`view resolver` 설정을 다음과 같이 `application.yml`에 할 수 있습니다.
만약 `gradle`에 `dependency`로 `mustache`를 추가했다면, 아래 내용은 생략해도 됩니다.

```yaml
spring:
    mvc:
        view:
            prefix: templates/
            suffix: .mustache
```

그 다음으로 `index.html`을 만들어보겠습니다.

```html
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Index Page</title>
</head>
<body>
<h1>Index Page</h1>
</body>
</html>
```

분명 위에서 `.mustache`인 경우에 대해 화면을 반환한다고 하였ㄴ는데, 여기서는 `.html`로 index 파일을 생성하였습니다.
이렇게 `.mustache`가 아닌 `.html`로 파일을 구성하고 싶다면, 아래와 같이 `WebMvcConfig`를 생성하면 됩니다.
`WebMvcConfig`에서는 `MustacheViewResolver`를 재설정합니다.

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        MustacheViewResolver resolver = new MustacheViewResolver();
        resolver.setCharset("UTF-8");
        resolver.setContentType("text/html; charset=UTF-8");
        resolver.setPrefix("classpath:/templates/");
        resolver.setSuffix(".html");
        
        registry.viewResolver(resolver);
    }
}
```

그 다음 서버를 실행하고 `localhost:8080`으로 이동하면 다음과 같이 로그인 페이지가 뜹니다.

![image](https://github.com/deeev-sb/TIL/assets/46712693/b28f4238-3a88-4d64-837e-d10a0e09296a)

여기서 `Username`은 `user`로 설정하고, `Password`는 콘솔에 있는 `security password`를 복사해서 붙여 넣으면 됩니다.

```bash
Using generated security password: 38cad299-ec5d-4ae4-b334-ee3f7c96d433
```

그러면 정상적으로 `index.html` 페이지에 연결되는 것을 확인하실 수 있습니다.

![image](https://github.com/deeev-sb/TIL/assets/46712693/4ee9a323-8d1d-4b0c-b597-934998207791)


> 본 게시글은 [스프링부트 시큐리티 & JWT 강의](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81%EB%B6%80%ED%8A%B8-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.

**추가로 참고한 내용**