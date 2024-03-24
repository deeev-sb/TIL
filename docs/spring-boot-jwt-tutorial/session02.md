# 02. Security 설정, Data 설정

## Security 설정

강의에서 사용하고 있는 버전은 Spring Boot 2.4.1이어서 `SecurityConfig`를 다음과 같이 작성하였습니다.

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter{
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .authorizeRequests()
                .antMatchers("/api/hello").permitAll()
                .anyRequest().authenticated();
    }
}
```
`@EnableWebSecurity` 애노테이션은 기본적인 웹 보안을 활성화하겠다는 의미입니다.
추가적인 설정을 위해 `WebSecurityConfigurer`를 implements 하거나 `WebSecurityConfigurerAdapter`를 extends 하는 방법이 있는데 강의에서는 `WebSecurityConfigurerAdapter` 사용하였습니다. `configure` 내에 있는 설정의 의미는 다음과 같습니다.

- `authorizeRequests()` : HttpServletRequest를 사용하는 요청들에 대한 접근 제한을 설정하겠다는 의미
- `anyMatchers("/api/hello").permitAll()` : 설정된 요청 URI는 인증 없이 접근을 허용하겠다(permitAll())는 의미
- `anyRequest().authenticated()` : 나머지 요청에 대해서는 모두 인증을 받아야 함

그러나 Spring Boot 3.2.3에서는 `WebSecurityConfigurerAdapter`와 `antMatchers`가 deprecated 되었습니다.
`WebSecurityConfigurerAdapter`을 extends 하여 사용하는 대신 `SecurityFilterChain` Bean을 사용합니다.
그리고 `antMatchers` 대신 `requestMatchers`를 사용하여 설정합니다.

> Spring Security 5.4 introduced the capability to publish a SecurityFilterChain bean instead of extending WebSecurityConfigurerAdapter. In 6.0, WebSecurityConfigurerAdapter is removed. To prepare for this change, you can replace constructs like:
> 
> In Spring Security 5.8, the antMatchers, mvcMatchers, and regexMatchers methods were deprecated in favor of new requestMatchers methods.
> The new requestMatchers methods were added to authorizeHttpRequests, authorizeRequests, CSRF configuration, WebSecurityCustomizer and any other places that had the specialized RequestMatcher methods. The deprecated methods are removed in Spring Security 6.

더 상세한 내용은 [공식 문서](https://docs.spring.io/spring-security/reference/5.8/migration/servlet/config.html)를 참고하시길 바랍니다.

변경된 내용을 바탕으로 `SecurityConfig`를 작성하면 다음과 같습니다.

```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers("/api/hello").permitAll()
                                .anyRequest().authenticated())
                .build();
    }
}
```

이제 프로젝트 실행 후 `/api/hello` 요청을 하여 인증 없이 동작하는지 확인해보겠습니다.
그러면 다음과 같이 정상적으로 응답이 내려오는 것을 확인할 수 있습니다.

![image](https://github.com/deeev-sb/TIL/assets/46712693/be924051-0c08-478a-a1f7-355ee7dc965d)


## Datasource, JPA 설정

이번에는 Datasource와 JPA를 설정하도록 하겠습니다. `application.yml` 파일에 다음과 같이 설정을 작성합니다.

```yaml
spring:
  application:
    name: spring-boot-jwt-tutorial

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
    properties:
      hibernate:
        format_sql: true
        show_sql: true

logging:
  level:
    practice: DEBUG
```

H2 인메모리 DB를 사용하도록 Datasource 를 설정하고, JPA 관련 기본 설정도 하였습니다.
JPA 설정 중 `ddl-auto: create-drop`은 Session 실행 시 스키마를 생성하고, 종료 시 삭제하는 설정입니다.
`ddl-auto`의 다른 설정은 다음과 같으며, 실제 배포 시에는 `validate`나 `none`을 사용합니다.

- `create` : SessionFactory 시작 시 스키마를 삭제하고 다시 생성
- `update` : SessionFactory에 연결된 DB와 비교하여 추가된 항목이 있는 경우 추가. 만약 같은 변수 명이 존재하면 오류 발생
- `validate` : SessionFactory 시작 시 객체 구성과 스키마가 다르면 예외 발생
- `none` : 아무것도 안함

`format_sql`과 `show_sql`은 console에서 SQL을 보기 위해 설정한 것이며, logging level은 DEBUG로 설정하였습니다.

## Entity 생성 및 Data 설정

강의를 참고하여 `Authority`라고 하는 권한에 대한 Entity와 `User` Entity를 생성합니다. 이 때, User와 Authority는 ManyToMany 관계입니다.

`ddl-auto: create-drop`이라고 설정되어 있어 매번 새로 테이블이 생성되므로, 초기 데이터를 자동으로 추가하도록 구성해보겠습니다.

```sql
insert into "user" (username, password, nickname, activated) values ('admin', '$2a$08$lDnHPz7eUkSi6ao14Twuau08mzhWrL4kyZGGU5xfiGALO/Vxd5DOi', 'admin', 1);
insert into "user" (username, password, nickname, activated) values ('user', '$2a$08$UkVvwpULis18S19S5pZFn.YHPZt3oaqHZnDwqbCW9pft6uFtkXKDC', 'user', 1);

insert into authority (authority_name) values ('ROLE_USER');
insert into authority (authority_name) values ('ROLE_ADMIN');

insert into user_authority (user_id, authority_name) values (1, 'ROLE_USER');
insert into user_authority (user_id, authority_name) values (1, 'ROLE_ADMIN');
insert into user_authority (user_id, authority_name) values (2, 'ROLE_USER');
```

그 다음 `data.sql`이 정상 실행되도록 `application.yml`에 `jpa.defer-datasource-initialization: true` 설정을 추가해줍니다.
해당 설정을 추가하지 않으면 `Error creating bean with name 'dataSourceScriptDatabaseInitializer' defined in class path resource`라는 에러를 마주하게 됩니다.

```yaml
  jpa:
    defer-datasource-initialization: true
```


## H2 Console 결과 확인

H2 Console에 접속하기 위해서는 `SecurityConfig` 수정이 필요합니다.

```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers("/api/hello").permitAll()
                                .requestMatchers(PathRequest.toH2Console()).permitAll()
                                .anyRequest().authenticated())
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .build();
    }
}
```

- `csrf(AbstractHttpConfigurer::disable)` : csrf 비활성화 (H2 Console은 CSRF에 대응되지 않는 페이지)
- `requestMatchers(PathRequest.toH2Console()).permitAll()` : `PathRequest.toH2Console()`을 사용하여 자동으로 올바른 경로를 찾아주도록 설정
- `headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))` : H2 Console이 정상 동작하기 위해서는 같은 Origin에 대해 허용 필요

그 다음 프로젝트를 실행해보면 console에 `data.sql`에 작성한 SQL문이 뜨는 것을 확인할 수 있습니다.

![image](https://github.com/deeev-sb/TIL/assets/46712693/23522513-1a42-4eb2-b381-d9e4986e3988)

실제로 H2 Console(http://localhost:8080/h2-console)에 접속해보면, 다음과 같은 로그인 화면이 뜹니다.

![image](https://github.com/deeev-sb/TIL/assets/46712693/6fbc4a14-e8ee-4a17-838c-340fd046bef5)

여기서 `connect` 버튼을 클릭하면, 다음과 같이 테이블이 정상적으로 생성된 것을 확인할 수 있습니다.

![image](https://github.com/deeev-sb/TIL/assets/46712693/eae90c36-0600-41f9-987d-e6ee787560c5)

> 본 게시글은 [Spring Boot JWT Tutorial](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81%EB%B6%80%ED%8A%B8-jwt) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.

**추가로 참고한 내용**
- <https://docs.spring.io/spring-security/reference/5.8/migration/servlet/config.html>
- <https://soojae.tistory.com/53>
- <https://haservi.github.io/posts/spring/hibernate-ddl-auto/>
- <https://www.inflearn.com/questions/787320/spring-boot-%EC%B5%9C%EC%8B%A0-3-xx-%EB%B2%84%EC%A0%84-security-%EC%84%A4%EC%A0%95-%EA%B3%B5%EC%9C%A0%EB%93%9C%EB%A6%BD%EB%8B%88%EB%8B%A4>