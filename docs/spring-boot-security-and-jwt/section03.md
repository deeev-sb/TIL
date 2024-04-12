# 03. 스프링 시큐리티 JWT 서버 구축

> 강의와 다르게 Spring Boot 3, Spring Security 6을 사용하여 진행하였습니다.

## 프로젝트 환경 설정

프로젝트 기본 환경은 [section01](./section01.md)과 동일하게 구성하였습니다.

- Gradle Project(Groovy)
- Spring Boot 3.2.4
- Jar
- Java 17
- Dependency
  - H2 Database
  - Spring Web
  - Spring Security
  - Lombok
  - Spring Boot Dev Tools
  - Spring Data JPA
  - Mustache

JWT를 만드릭 쉽게 도와주는 Java JWT Library를 Gradle에 추가합니다.

```groovy
implementation group: 'com.auth0', name: 'java-jwt', version: '4.4.0'
```

yaml 설정도 [section01](./section01.md)과 동일하게 해주겠습니다.

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

그 다음 테스트용 API를 하나 생성하도록 하겠습니다.

```java
@RestController
public class RestApiController {
    @GetMapping("/home")
    public String home() {
        return "<h1>home</h1>";
    }
}
```

프로젝트 실행 후 `http://localhost:8080/home`를 입력하면 로그인 페이지가 뜹니다.

![image](https://github.com/deeev-sb/TIL/assets/46712693/067c7dc2-d5d2-44ec-a13d-3407de15d163)

`Username`은 `user`를 입력하면 되고, `Password`는 다음과 같이 터미널에 있는 password를 그대로 입력하면 됩니다.

```bash
Using generated security password: 9d69ebda-d75c-4407-8cb5-7efd8e21d926
```

그러면 `/home`으로 접속되는 것을 확인할 수 있습니다.

![image](https://github.com/deeev-sb/TIL/assets/46712693/c8c68385-ba42-432e-a430-e731858435ae)

## Security 설정

`SecurityConfig`는 다음과 같이 합니다.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/user/**").hasAnyRole("USER", "MANAGER", "ADMIN")
                        .requestMatchers("/api/v1/manager/**").hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers(PathRequest.toH2Console()).permitAll()
                        .anyRequest().permitAll()
                )
                .sessionManagement(sessionManagement ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .formLogin(FormLoginConfigurer::disable)
                .httpBasic(HttpBasicConfigurer::disable)
                .build();
    }
}
```

- `csrf(AbstractHttpConfigurer::disable)` : csrf 비활성화
- `authorizeHttpRequests` : HTTP 요청 관련 설정
  - `requestMatchers(PathRequest.toH2Console()).permitAll()` : H2 사용을 위한 설정
- `sessionManagement` : Session 설정. 미사용할 경우 `STATELESS`로 설정
- `headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))` : H2 사용을 위한 설정
- `formLogin(FormLoginConfigurer::disable)` : formLogin 비활성화
- `httpBasic(HttpBasicConfigurer::disable)` : httpBasic 비활성화

이렇게 설정하고 나면 다음과 같은 User 모델을 생성했을 때, H2 Console에 정상 접근을 통해 확인할 수 있습니다.

```java
@Data
@Entity
@Table(name = "`user`")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String username;
    private String password;
    private String roles;

    // ENUM으로 안하고 ,로 해서 구분해서 ROLE을 입력 -> 그걸 파싱!!
    public List<String> getRoleList(){
        if(!this.roles.isEmpty()){
            return Arrays.asList(this.roles.split(","));
        }
        return new ArrayList<>();
    }
}
```

![image](https://github.com/deeev-sb/TIL/assets/46712693/0eee7158-116d-4dae-bd0b-d0df7fbcad70)


## CORS 설정

다른 Origin에서 HTTP 요청이 발생해도 정상 동작할 수 있도록, CORS 설정을 하겠습니다.

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowCredentials(true);
        configuration.addAllowedOrigin("*");
        configuration.addAllowedHeader("*");
        configuration.addAllowedMethod("*");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

- `setAllowCredentials` : 자격 증명이 지원되는지 여부
- `addAllowedOrigin` : 허용할 URL. *은 모두 허용
- `addAllowedHeader` : 허용할 Header. *은 모두 허용
- `addAllowedMethod` : 허용할 HTTP Method. *은 모두 허용

CORS 설정 적용을 위해서는 Security 설정에 `cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))` 설정을 추가해야 합니다.

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfig corsConfig;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors
                        .configurationSource(corsConfig.corsConfigurationSource()))
                // ...
    }
}
```


> 본 게시글은 [스프링부트 시큐리티 & JWT 강의](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81%EB%B6%80%ED%8A%B8-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.

**추가로 참고한 내용**
- <https://velog.io/@woojjam/Spring-Security-HTTP-Basic-Authentication>
- <https://docs.spring.io/spring-security/reference/reactive/integrations/cors.html>
- <https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html>
- <https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/cors/CorsConfiguration.html>
- <https://toycoms.tistory.com/37>