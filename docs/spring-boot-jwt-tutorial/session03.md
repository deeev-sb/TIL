# 03. JWT 코드, Security 설정 추가

## JWT 설정 추가

JWT를 사용하기 위해 먼저 `application.yml`에 관련 설정을 추가해보겠습니다.
여기서는 HS512 알고리즘을 사용할 것이므로 secret key를 64 byte 이상으로 설정해야 합니다. 참고로, 아래 설정에서 사용한 secret key는 64 byte 이상의 특정 문자열을 base64를 인코딩한 값입니다. ~~사용한 문자열은 spring-boot-jwt-tutorial-spring-boot-jwt-tutorial 입니다.~~
그리고 토큰 만료 시간은 86400초로 설정하였습니다.

```yaml
jwt:
  header: Authorization
  secret: c3ByaW5nLWJvb3Qtand0LXR1dG9yaWFsLXNwcmluZy1ib290LWp3dC10dXRvcmlhbC1zcHJpbmctYm9vdC1qd3QtdHV0b3JpYWwtc3ByaW5nLWJvb3Qtand0LXR1dG9yaWFs
  token-validity-in-seconds: 86400
```

그 다음 `build.gradle`에 JWT 관련 `dependency`를 추가합니다.

```groovy
implementation group: 'io.jsonwebtoken', name: 'jjwt-api', version: '0.12.5'
runtimeOnly group: 'io.jsonwebtoken', name: 'jjwt-impl', version: '0.12.5'
runtimeOnly group: 'io.jsonwebtoken', name: 'jjwt-jackson', version: '0.12.5'
```

## JWT 관련 코드 개발

### TokenProvider

`jwt` 디렉터리를 생성한 다음, 토큰의 생성과 유효성 검증 등을 담당할 Token Provider를 만들어보겠습니다.
`InitializingBean`를 `implements`하여 `TokenProvider`를 구성했습니다.
이렇게 구성한 이유는, Bean이 생성되고 주입 받은 후 secret 값을 Base64로 decode하여 key 변수에 할당하기 위함입니다.

```java
@Component
public class TokenProvider implements InitializingBean {

    private final Logger log = LoggerFactory.getLogger(TokenProvider.class);
    private static final String AUTHORITIES_KEY = "auth";
    private final String secret;
    private final long tokenValidityInMilliseconds;
    private SecretKey secretKey;

    public TokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.token-validity-in-seconds}") long tokenValidityInSeconds) {
        // application.yml 값을 가져와서 설정
        this.secret = secret;
        this.tokenValidityInMilliseconds = tokenValidityInSeconds * 1000;
    }

    @Override
    public void afterPropertiesSet() {
        // BASE64로 decode 한 값을 key 로 설정
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }
}
```

위 코드에 Authentication 객체의 권한 정보를 담은 토큰을 생성하는 `createToken`을 추가하겠습니다.

```java
@Component
public class TokenProvider implements InitializingBean {

    private final Logger log = LoggerFactory.getLogger(TokenProvider.class);
    private static final String AUTHORITIES_KEY = "auth";
    private final String secret;
    private final long tokenValidityInMilliseconds;
    private Key key;

    // ...

    public String createToken(Authentication authentication) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = (new Date()).getTime();
        Date validity = new Date(now + this.tokenValidityInMilliseconds);

        // JWT 객체 build 및 반환
        return Jwts.builder()
                .subject(authentication.getName())
                .claim(AUTHORITIES_KEY, authorities)
                .signWith(secretKey, Jwts.SIG.HS512)
                .expiration(validity)
                .compact();
    }
}
```

반대로 토큰에 담겨있는 정보를 이용해 Authentication 객체를 리턴하는 `getAuthentication`를 추가하겠습니다.
토큰을 바탕으로 Claims 객체를 생성하고, 이를 이용해 유저 객체를 만듭니다.
이 유저 객체와 토큰, 권한 정보를 이용해 Authentication 객체를 만들어 반환합니다.

```java
@Component
public class TokenProvider implements InitializingBean {

  // ...

  public Authentication getAuthentication(String token) {
      Claims claims = Jwts
                .parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

      Collection<? extends GrantedAuthority> authorities =
              Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
                      .map(SimpleGrantedAuthority::new)
                      .toList();

      User principal = new User(claims.getSubject(), "", authorities);

      return new UsernamePasswordAuthenticationToken(principal, token, authorities);
  }
}
```

마지막으로 토큰의 유효성 검증을 수행하는 `validateToken`을 추가하겠습니다.
`validateToken`는 토큰을 파싱하는 과정에서 exception이 발생하는지 확인합니다.
exception이 발생하지 않는다면 유효한 토큰이고, 발생한다면 유효하지 않는 토큰입니다.

```java
@Component
public class TokenProvider implements InitializingBean {

  // ...

  public boolean validateToken(String token) {
    try {
        Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
        return true;
    } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
        log.info("잘못된 JWT 서명입니다.");
    } catch (ExpiredJwtException e) {
        log.info("만료된 JWT 토큰입니다.");
    } catch (UnsupportedJwtException e) {
        log.info("지원되지 않는 JWT 토큰입니다.");
    } catch (IllegalArgumentException e) {
        log.info("JWT 토큰이 잘못되었습니다.");
    }
    return false;
  }
}
```

### JwtFilter

JWT를 위한 Custom Filter인 `JwtFilter`를 생성해보겠습니다.
`JwtFilter`는 `GenericFilterBean`을 `extends` 하고, `doFilter`를 `Oevveride`합니다.
`doFilter`는 토큰의 인증 정보를 `SecurityContext`에 저장하는 역할을 수행하게 됩니다.

```java
public class JwtFilter extends GenericFilterBean {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

    }
}
```

`JwtFilter`는 이전에 생성한 `TokenProvider`를 주입받아 사용하도록 구성하였습니다.
또한, request Header에서 Token 정보를 꺼내오는 `resolveToken`을 추가하였습니다.

```java
@RequiredArgsConstructor
public class JwtFilter extends GenericFilterBean {
    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);
    public static final String AUTHORIZATION_HEADER = "Authorization";
    private final TokenProvider tokenProvider;

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}
```

마지막으로 Custom Filter의 핵심 로직인 `doFilter`를 작성해보겠습니다.
먼저 `resolveToken()`을 통해 request Header에서 JWT 토큰을 가져옵니다. 그 다음, if 문과 같이 유효성을 검증합니다.
토큰이 유효한 경우, JWT 토큰에서 Authentication 객체를 가져와 SecurityContext에 저장합니다.

```java
@Override
public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
  HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
  String jwt = resolveToken(httpServletRequest); // JWT 토큰을 가져옴
  String requestURI = httpServletRequest.getRequestURI();

  if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) { // 유효성 검증
      Authentication authentication = tokenProvider.getAuthentication(jwt);
      SecurityContextHolder.getContext().setAuthentication(authentication); // SecurityContext에 저장
      log.debug("Security Context에 '{}' 인증 정보를 저장했습니다, uri: {}", authentication.getName(), requestURI);
  } else {
      log.debug("유효한 JWT 토큰이 없습니다, uri: {}", requestURI);
  }

  filterChain.doFilter(servletRequest, servletResponse);
}
```

### JwtSecurityConfig

이번에는 `TokenProvider`와 `JwtFilter`를 `SecurityConfig`에 적용하기 위한 `JwtSecurityConfig`를 생성하겠습니다.
`JwtSecurityConfig`는 `JwtFilter`를 Security 로직에 필터로 등록하는 역할을 합니다. 이 때, `JwtFilter`에서 사용하기 위한 `TokenProvider`를 주입받아야 합니다.

```java
@RequiredArgsConstructor
public class JwtSecurityConfig extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {
    private final TokenProvider tokenProvider;

    @Override
    public void configure(HttpSecurity http) {
        http.addFilterBefore(
            new JwtFilter(tokenProvider),
            UsernamePasswordAuthenticationFilter.class
        );
    }
}
```

### 에러 처리

마지막으로 401, 403 에러를 처리하기 위한 클래스를 추가하도록 하겠습니다.

`JwtAuthenticationEntryPoint` 클래스는 유효하지 않은 자격 증명으로 접근할 때 `401 Unauthorized` 에러를 반환하도록 구성하였습니다.

```java
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
    }
}
```

`JwtAccessDeniedHandler` 클래스는 필요한 권한이 존재하지 않은 상태로 접근할 때 `403 Forbidden` 에러를 반환하도록 구성하였습니다.

```java
@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        response.sendError(HttpServletResponse.SC_FORBIDDEN);
    }
}
```

## Security 설정 추가

지금까지 생성한 클래스들을 `SecurityConfig`에 적용하도록 하겠습니다.

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final TokenProvider tokenProvider;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .accessDeniedHandler(jwtAccessDeniedHandler)
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )
                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers("/api/hello", "/api/authenticate", "/api/signup").permitAll()
                                .requestMatchers(PathRequest.toH2Console()).permitAll()
                                .anyRequest().authenticated())
                .sessionManagement(sessionManagement ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .with(new JwtSecurityConfig(tokenProvider), customizer -> {})
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

추가한 내용에 대해 하나하나 살펴보도록 하겠습니다..

- `@EnableMethodSecurity` : 메서드 단위로 Security 적용을 위해 추가
- `@RequiredArgsConstructor` : lombok을 통해 `TokenProvider`, `JwtAuthenticationEntryPoint`, `JwtAccessDeniedHandler`를 주입 받기 위해 추가 (생성자 주입)
- `exceptionHandling` : `JwtAuthenticationEntryPoint`와 `JwtAccessDeniedHandler`를 통한 에러 처리 설정
- `.requestMatchers("/api/hello", "/api/authenticate", "/api/signup").permitAll()` : 로그인과 회원 가입을 위한 URL 추가 오픈
- `sessionManagement` : 세선 설정. 여기서는 세션을 사용하지 않을 것이기 때문에 `STATELESS` 설정
- `.with(new JwtSecurityConfig(tokenProvider), customizer -> {})` : JwtSecurityConfig 적용


> 본 게시글은 [Spring Boot JWT Tutorial](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81%EB%B6%80%ED%8A%B8-jwt) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.

**추가로 참고한 내용**

- <https://github.com/SilverNine/spring-boot-jwt-tutorial/blob/master/src/main/resources/application.yml>
- <https://www.baeldung.com/spring-enablemethodsecurity>
