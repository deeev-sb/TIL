# 02. 서블릿

## 2.1. 프로젝트 생성

기본적으로 강의에서 지정한 설정과 유사하게 하였습니다. 개인의 SpringBoot 버전에 맞게 Java 버전을 설정하면 됩니다.
Project Meta 정보 또한 본인이 설정하고 싶은대로 해도 괜찮습니다.
다만, `packing`은 **반드시 war**로 설정해야 하며, 내장 Tomcat을 사용하기 위해서는 `spring web`을 Dependecy로 추가해야 합니다.

- Gradle Project
- SpringBoot 2.7.4
- Java 11
- Project Meta
  - group : practice
  - name : mvc1-servlet
  - artifact : mvc1-servlet
  - package name : practice.mvc1-servlet
  - packing : war
- Dependency :
  - spring web
  - lombok

intellij에서 lombok 관련 설정을 하는 방법은 강의 내용을 참고해주세요. 그리고  **postman**도 함께 준비해야 합니다.

사실 스프링 부트와 서블릿은 크게 관계가 없습니다. 원래 서블릿은 톰캣 같은 WAS를 직접 설치하고 그 위에 서블릿 코드를 클래스 파일로 빌드해서 올린 다음, 톰캣 서버를 실행하는 방식으로 많이 사용합니다.
하지만 이 과정은 매우 번거롭기 때문에 스프링 부트에서 제공하는 내장 톰캣을 활용하여 진행하고자 합니다.


## 2.2. Hello 서블릿

스프링 부트는 서블릿을 등록해서 사용할 수 있도록 `@ServletComponentScan`을 지원합니다.
해당 어노테이션을 사용하면, 스프링 부트가 서블릿 코드를 찾아 자동으로 등록해줍니다.

```java
@ServletComponentScan
@SpringBootApplication
public class Mvc1ServletApplication {

    public static void main(String[] args) {
        SpringApplication.run(Mvc1ServletApplication.class, args);
    }

}
```

서블릿을 사용하기 위한 기본 세팅을 완료하였으니, 이제 서블릿을 직접 생성해보도록 하겠습니다.
`basic`이라는 이름으로 컴포넌트를 만들고 `HelloServlet` 클래스를 다음과 같이 생성하였습니다.

```java
@WebServlet(name = "helloServlet", urlPatterns = "/hello")
public class HelloServlet extends HttpServlet {
}
```

서블릿 코드를 작성하려면 `HttpServlet`을 상속 받아야 하며, `@WebServlet` 어노테이션 설정을 해야 합니다.
`@WebServlet` 설정 중 `name`은 서블릿 이름이며, `urlPatterns`는 해당 서블릿을 연결하는 URL 설정입니다.
여기서는 `/hello` 라는 URL이 HelloServlet에 매핑되도록 설정하였습니다. 참고로, `name`과 `urlPatterns`는 중복되지 않게 설정해야 합니다.

그 다음 메서드 내에서 `control` + `o`를 입력하면 다음과 같이 `Select Methods to override/Implement` 화면이 표출됩니다.
여기서 **좌물쇠가 잠겨있는** `service`를 선택하면, 서블릿 호출 시 실행되는 서비스 메서드를 자동 생성할 수 있습니다.
참고로, 해당 설정은 Mac 환경의 intellij 기준 입니다.

<img width="872" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/2ee82268-b62c-4a8b-83d3-1d0edaf83d6b">

자동 생성된 서비스 메서드 내용은 다음과 같습니다.

```java
@WebServlet(name = "helloServlet", urlPatterns = "/hello")
public class HelloServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        super.service(req, resp);
    }
}
```

호출이 되는지 확인하기 위해 해당 코드를 다음과 같이 수정하고 실행해 봅시다.
이 때, req는 들어온 요청 객체인 `HttpServletRequest`이며, resp는 응답 객체인 `HttpServletResponse`입니다.

```java
@WebServlet(name = "helloServlet", urlPatterns = "/hello")
public class HelloServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("HelloServlet.service");
        System.out.println("request = " + req);
        System.out.println("response = " + resp);
    }
}
```

스프링부트가 실행되면 `localhost:8080/hello`로 접속을 합니다.
그 다음 터미널을 확인해보면 다음과 같이 `HelloServlet.service`과 각 구현체 정보가 함께 출력된 것을 확인할 수 있습니다.

<img width="704" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/6e6bee25-210b-49de-8e7d-e7e75fa5b999">

이번에는 `localhost:8080/hello?username=kim`과 같은 요청을 출력하고 응답 데이터를 표출할 수 있도록 코드를 작성해보겠습니다.

```java
@WebServlet(name = "helloServlet", urlPatterns = "/hello")
public class HelloServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // ...

        String username = req.getParameter("username");
  
        resp.setContentType("text/plain");
        resp.setCharacterEncoding("utf-8");
        resp.getWriter().write("hello " + username);
    }
}
```

서블릿에서는 `HttpServletRequest` 객체를 활용하여 쿼리 파라미터를 쉽게 받아올 수 있도록 `getParameter`라는 메서드를 제공합니다.
그리고 응답에서 작성한 `setContentType`과 `setCharacterEncoding`은 헤더 정보로 전달되고, `getWriter().write`는 바디 정보로 전달됩니다.

실제로 `localhost/hello?username=kim`에 접속해보면 다음과 같이 전달한 바디 정보가 화면에 표출되는 것을 확인할 수 있습니다.

<img width="460" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/26570555-2632-45dc-9464-82a6aa8ac3cd">

만약 HTTP 요청 메시지 로그를 확인하고 싶다면, `application.properties`에 아래 내용을 추가하면 됩니다.

```properties
logging.level.org.apache.coyote.http11=debug
```

실제로 실행해보면 다음과 같이 HTTP 요청 메시지 정보를 터미널 출력합니다.

```text
Received [GET /hello?username=kim HTTP/1.1
Host: localhost:8080
Connection: keep-alive
Cache-Control: max-age=0
sec-ch-ua: "Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "macOS"
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: none
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Accept-Encoding: gzip, deflate, br
Accept-Language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7

]
```

운영 서버에서 이렇게 모든 요청 정보를 다 남기면 성능이 저하될 수 있으므로 **개발 단계에서만 적용**하는 것이 좋습니다.

## 2.3. HttpServletRequest

`HttpServletRequest`는 서블릿이 HTTP 요청 메시지를 파싱한 결과를 담고 있는 객체입니다.
~~물론 개발자가 직접 HTTP 요청 메세지를 파싱해서 쓸 수도 있어요~~

`HttpServletRequest`를 사용하면, 아래와 같은 HTTP 요청 메시지를 편리하게 조회할 수 있습니다.

```text
POST /save HTTP/1.1
Host: localhost:8080
Content-Type: application/x-www-form-urlencoded

username=kim&age=20
```

그리고 HTTP 요청 메시지 조회 뿐만 아니라 여러 부가 기능도 함께 제공합니다.

- 임시 저장소 기능
  - 해당 HTTP 요청의 시작부터 끝날 때까지 유지되는 임시 저장소 기능
  - 저장 : `request.setAttribute(name, value)`
  - 조회 : `reuqest.getAttribute(name)`
- 세션 관리 기능
  - `request.getSession(create: true)`

HTTP 요청 메시지의 **Start Line**은 다음과 같은 방법으로 불러올 수 있습니다.

```java
@WebServlet(name = "requestHeaderServlet", urlPatterns = "/request-header")
public class RequestHeaderServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        printStartLine(request);
    }

    private void printStartLine(HttpServletRequest request) {
        System.out.println("--- REQUEST-LINE - start ---");
        System.out.println("request.getMethod() = " + request.getMethod()); //GET
        System.out.println("request.getProtocol() = " + request.getProtocol()); //HTTP/1.1
        System.out.println("request.getScheme() = " + request.getScheme()); //http// http://localhost:8080/request-header
        System.out.println("request.getRequestURL() = " + request.getRequestURL());// /request-header
        System.out.println("request.getRequestURI() = " + request.getRequestURI());//username=hi
        System.out.println("request.getQueryString() = " + request.getQueryString());
        System.out.println("request.isSecure() = " + request.isSecure()); //https 사용 유무
        System.out.println("--- REQUEST-LINE - end ---");
        System.out.println();
    }
}
```

해당 코드를 실행하고 `localhost:8080/request-header`에 접속 후 터미널을 확인해보면 다음과 같은 Start Line 정보가 표출됩니다.

```text
--- REQUEST-LINE - start ---
request.getMethod() = GET
request.getProtocol() = HTTP/1.1
request.getScheme() = http
request.getRequestURL() = http://localhost:8080/request-header
request.getRequestURI() = /request-header
request.getQueryString() = null
request.isSecure() = false
--- REQUEST-LINE - end ---
```

이번에는 모든 헤더 정보를 출력해보겠습니다. 헤더 정보의 경우 과거에는 다음과 같은 방법으로 출력을 했습니다.

```java
@WebServlet(name = "requestHeaderServlet", urlPatterns = "/request-header")
public class RequestHeaderServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        printStartLine(request);
        printHeaders(request);
    }

    // ... start line 정보

    private void printHeaders(HttpServletRequest request) {
        System.out.println("--- Headers - start ---");

        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            System.out.println(headerName + ": " + request.getHeader(headerName));
        }
    }
}
```

요즘은 `Iterator`를 사용하여 좀 더 간결하게 사용합니다.

```java
@WebServlet(name = "requestHeaderServlet", urlPatterns = "/request-header")
public class RequestHeaderServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        printStartLine(request);
        printHeaders(request);
    }

    // ...
    
    private void printHeaders(HttpServletRequest request) {
        System.out.println("--- Headers - start ---");
        request.getHeaderNames().asIterator()
                .forEachRemaining(headerName -> System.out.println(headerName + ": " + request.getHeader(headerName)));
        System.out.println("--- Headers - end ---");
        System.out.println();
    }

}
```

`localhost:8080/request-header`에 접속 후 터미널을 확인해보면 두 코드 모두 결과는 다음과 같은 동일한 내용을 출력합니다.

```text
--- Headers - start ---
host: localhost:8080
connection: keep-alive
cache-control: max-age=0
sec-ch-ua: "Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "macOS"
upgrade-insecure-requests: 1
user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36
accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
sec-fetch-site: same-origin
sec-fetch-mode: navigate
sec-fetch-user: ?1
sec-fetch-dest: document
referer: http://localhost:8080/basic.html
accept-encoding: gzip, deflate, br
accept-language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7
--- Headers - end ---
```

전체 헤더 정보가 아닌 다음과 같이 필요한 헤더 정보만을 가져와서 사용할 수도 있습니다.

```java
@WebServlet(name = "requestHeaderServlet", urlPatterns = "/request-header")
public class RequestHeaderServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        printStartLine(request);
        printHeaders(request);
        printHeaderUtils(request);
    }

    // ...
    
    private void printHeaderUtils(HttpServletRequest request) {
        System.out.println("--- Header 편의 조회 start ---");
        System.out.println("[Host 편의 조회]");
        System.out.println("request.getServerName() = " + request.getServerName()); //Host 헤더 System.out.println("request.getServerPort() = " +
        System.out.println("request.getServerPort() = " + request.getServerPort()); //Host 헤더 System.out.println();
        System.out.println();
        System.out.println("[Accept-Language 편의 조회]");
        request.getLocales().asIterator()
                .forEachRemaining(locale -> System.out.println("locale = " + locale));
        System.out.println("request.getLocale() = " + request.getLocale());
        System.out.println();
        System.out.println("[cookie 편의 조회]");
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                System.out.println(cookie.getName() + ": " + cookie.getValue());
            }
        }
        System.out.println();
        System.out.println("[Content 편의 조회]");
        System.out.println("request.getContentType() = " + request.getContentType());
        System.out.println("request.getContentLength() = " + request.getContentLength());
        System.out.println("request.getCharacterEncoding() = " + request.getCharacterEncoding());
        System.out.println("--- Header 편의 조회 end ---");
        System.out.println();
    }
}
```

`localhost:8080/request-header`에 접속 후 터미널을 확인해보면 Host, Accept-Language, Cookie, Content 정보가 출력되는 것을 확인할 수 있습니다.

```text
--- Header 편의 조회 start ---
[Host 편의 조회]
request.getServerName() = localhost
request.getServerPort() = 8080

[Accept-Language 편의 조회]
locale = ko_KR
locale = ko
locale = en_US
locale = en
request.getLocale() = ko_KR

[cookie 편의 조회]

[Content 편의 조회]
request.getContentType() = null
request.getContentLength() = -1
request.getCharacterEncoding() = UTF-8
--- Header 편의 조회 end ---
```


HTTP 요청 메시지 정보 뿐만 아니라 다음과 같이 요청이 들어온 Remote 정보나 현재 서버에 대한 Local 정보도 확인할 수 있습니다.

```java
@WebServlet(name = "requestHeaderServlet", urlPatterns = "/request-header")
public class RequestHeaderServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        printStartLine(request);
        printHeaders(request);
        printHeaderUtils(request);
        printEtc(request);
    }

    // ...

    // 기타 정보
    private void printEtc(HttpServletRequest request) { System.out.println("--- 기타 조회 start ---");
        System.out.println("[Remote 정보]");
        System.out.println("request.getRemoteHost() = " +
                request.getRemoteHost()); //
        System.out.println("request.getRemoteAddr() = " +
                request.getRemoteAddr()); //
        System.out.println("request.getRemotePort() = " +
                request.getRemotePort()); //
        System.out.println();
        System.out.println("[Local 정보]");
        System.out.println("request.getLocalName() = " +
                request.getLocalName()); //
        System.out.println("request.getLocalAddr() = " +
                request.getLocalAddr()); //
        System.out.println("request.getLocalPort() = " +
                request.getLocalPort()); //
        System.out.println("--- 기타 조회 end ---");
        System.out.println();
    }
}
```

`localhost:8080/request-header`에 접속 후 터미널을 확인해보면 어디서 요청이 들어왔고 응답을 내려준 서버의 정보가 무엇인지 확인할 수 있습니다.

```text
--- 기타 조회 start ---
[Remote 정보]
request.getRemoteHost() = 0:0:0:0:0:0:0:1
request.getRemoteAddr() = 0:0:0:0:0:0:0:1
request.getRemotePort() = 50796

[Local 정보]
request.getLocalName() = localhost
request.getLocalAddr() = 0:0:0:0:0:0:0:1
request.getLocalPort() = 8080
--- 기타 조회 end ---
```

## 2.4. HTTP 요청 데이터

HTTP 요청 메시지를 통해 클라이언트에서 서버로 데이터를 전달하는 데, 주로 다음과 같은 3가지 방법을 사용합니다.

1. GET - 쿼리 파라미터
   - `/url?username=hello&age=20`과 같이 URL의 쿼리 파라미터에 데이터를 포함해서 전달
   - 여기서 쿼리 파리미터 정보는 `username=hello&age=20`
   - e.g. 검색, 필터, 페이징 등에서 많이 사용
2. POST - HTML Form
   - `content-type: application/x-www-form-urlencoded`
   - 메시지 바디에 쿼리 파라미터 형식으로 전달 (`username=hello&age=20`)
   - e.g. 회원 가입, 상품 주문, HTML Form
3. HTTP message body에 데이터를 직접 담아서 요청
   - HTTP API에서 주로 사용
   - 데이터 형식은 JSON, XML, TEXT이 있으며, 주로 JSON을 사용
   - POST, PUT, PATCH 등 사용 가능

각 방법에 대해 코드와 함께 살펴보도록 하겠습니다.

### 2.4.1. GET 쿼리 파라미터

다음 데이터를 URL의 **쿼리 파라미터**를 사용해서 클라이언트에서 데이터로 전송해보겠습니다.

```text
username=hello
age=20
```

URL 뒤에 `?`를 붙이고 그 뒤에 쿼리 파라미터를 작성합니다. 추가 파라미터는 `&`로 구분을 하면 됩니다.

```text
http://localhost:8080/request-param?username=hello&age=20
```

서버에서는 다음과 같이 `HttpServletRequest`가 제공하는 메서드를 통해 쿼리 파라미터를 편리하게 조회할 수 있습니다.

```java
@WebServlet(name = "requestParamServlet", urlPatterns = "/request-param")
public class RequestParamServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        System.out.println("[전체 파라미터 조회] - start");

        request.getParameterNames().asIterator()
                .forEachRemaining(paramName -> System.out.println(paramName + " = " + request.getParameter(paramName)));

        System.out.println("[단일 파라미터 조회]");

        String username = request.getParameter("username");
        System.out.println("username = " + username);

        String age = request.getParameter("age");
        System.out.println("age = " + age);
    }
}
```

`getParameterNames()`는 요청으로 들어온 파라미터명(`username`, `age`)을 가져옵니다.
그리고 `getParameter()`에 인자로 파라미터명을 보내면 값(`hello`, `20`)을 반환합니다.

실재로 코드를 실행한 다음 URI를 보내면, 터미널에 다음과 같이 출력됩니다.

```text
[전체 파라미터 조회] - start
username = hello
age = 20
[단일 파라미터 조회]
username = hello
age = 2
```

다음과 같이 똑같은 이름으로 들어온 경우에도 처리가 가능합니다.

```text
http://localhost:8080/request-param?username=hello&age=20&username=hello2
```

`request.getParameterValues()`를 사용하면, 중복된 값을 모두 출력할 수 있습니다.
참고로, 중복으로 보냈을 때 `request.getParameter()`를 사용하면 `request.getParameterValues()`의 첫 번째 값을 반환합니다.

```java
@WebServlet(name = "requestParamServlet", urlPatterns = "/request-param")
public class RequestParamServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // ...

        System.out.println("[이름이 같은 복수 파라미터 조회]");
        String[] usernames = request.getParameterValues("username");
        for (String name : usernames) {
            System.out.println("name = " + name);
        }
    }
}
```

실재로 코드 실행 후 URI를 접속하면, 터미널에 다음과 같이 출력됩니다.

```text
[이름이 같은 복수 파라미터 조회]
name = hello
name = hello2
```

### 2.4.2. POST HTML Form

이번에는 HTML Form을 사용해서 클라이언트에서 서버로 데이터를 전송해보겠습니다.
이전에 언급했듯, `content-type`은 `application/x-www-form-urlencoded`를 사용해야 합니다.
그리고 메시지 바디에 쿼리 파라미터 형식(`username=hello&age=20`)으로 데이터를 전달해야 합니다.

먼저 데이터를 입력할 Form을 생성합니다.

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<form action="/request-param" method="post">
    username: <input type="text" name="username" />
    age: <input type="text" name="age" />
    <button type="submit">전송</button>
</form>
</body>
</html>
```

그런데 이 때 `action`을 확인해보면, 이전에 GET 쿼리 파라미터에서 생성한 서블릿의 URI와 같은 것을 알 수 있습니다.
이는 `application/x-www-form=urlencoded` 형식이 `username=hello&age=20`이라는 쿼리 파라미터와 동일한 형태로 message body를 보내기 때문입니다.
클라이언트 입장에서는 두 방식에 차이가 있지만, 서버 입장에서는 큰 차이가 없기 때문에 **쿼리 파라미터 조회 메서드를 그대로 사용**해도 됩니다.

실제로 코드를 실행한 다음, `http://localhost:8080/basic/hello-form.html` URL로 접속하면 다음과 같은 화면을 볼 수 있습니다.

<img width="373" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/c795a76d-fbd0-412e-be3a-6b69f4b6956f">

각 Form에 `kim`과 `age`라고 입력하고 전송을 누르면, 다음과 같은 내용을 터미널에서 확인할 수 있습니다.
이를 통해 `requestServlet`을 그대로 사용하고 있음을 다시 확인할 수 있습니다.

```text
[전체 파라미터 조회] - start
username = kim
age = 20
[단일 파라미터 조회]
username = kim
age = 20
[이름이 같은 복수 파라미터 조회]
name = kim
```

참고로, HTML form 테스트를 위해 매번 HTML을 만드는 것이 아닌 Postman을 사용하면 좀 더 쉽게 테스트 할 수 있습니다.

<img width="1486" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/fdc2e136-d5eb-4f78-a7cc-235596f2d32a">

### 2.4.3. API 메시지 바디

HTTP message body에 데이터를 직접 담아서 요청하는 방법을 알아보도록 하겠습니다.

먼저, **단순 텍스트**를 데이터로 전달하는 방법을 알아보겠습니다.

```java
@WebServlet(name = "requestBodyStringServlet", urlPatterns = "/request-body-string")
public class RequestBodyStringServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletInputStream inputStream = request.getInputStream();
        String messageBody = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);

        System.out.println("messageBody = " + messageBody);
    }
}
```

HTTP 메시디 바디의 데이터는 `InputStream`을 사용해서 직접 읽을 수 있습니다.
이 때, `InputStream`은 byte 코드를 반환하기 때문에 우리가 읽을 수 있는 문자로 보기 위해서는 문자표(Charset)를 지정해주어야 합니다.
여기서는 `UTR_8 Charset`을 지정해주었습니다.

다음과 같이 Postman으로 호출을 해보겠습니다. 이 때, `messagebody` 타입을 `raw`에 `Text`로 지정해주세요.
이는 `content-type:text/plain`과 같습니다.

<img width="1489" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/26b6ab47-28f3-40a4-a2ee-cb5046409486">

호출한 다음 터미널을 확인해보면 아래와 같이 정상적으로 데이터가 들어온 것을 확인할 수 있습니다.

```text
messageBody = hello
```

이번에는 주로 사용하는 **JSON** 형식으로 데이터를 전달해보겠습니다.

JSON 형식은 데이터를 `{"username": "hello", "age": 20}`과 같은 형태로 보내기 때문에 파싱할 수 있는 객체가 필요합니다.

```java
@Getter
@Setter
public class HelloData {
    private String username;
    private int age;
}
```

파싱 할 수 있는 객체를 생성할 때, lombok을 통해 getter와 setter를 생성해주었습니다.

그 다음으로 데이터를 받아올 서블릿을 생성하겠습니다.
`InputStream`을 통해 텍스트 형식과 동일하게 데이터를 가져온 다음, `ObjectMapper`라는 Jackson 라이브러리를 사용하여 데이터를 파싱합니다.

```java
@WebServlet(name = "requestBodyJsonServlet", urlPatterns = "/request-body-json")
public class RequestBodyJsonServlet extends HttpServlet {
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletInputStream inputStream = request.getInputStream();
        String messageBody = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
        System.out.println("messageBody = " + messageBody);

        HelloData helloData = objectMapper.readValue(messageBody, HelloData.class);
        System.out.println("helloData.getUsername() = " + helloData.getUsername());
        System.out.println("helloData.getAge() = " + helloData.getAge());
    }
}
```

Postman을 통해 실행해봅시다.

<img width="1483" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/ae665a2c-7393-4246-8036-90ea9e2f9531">

그러면 다음과 같은 내용을 터미널에서 확인하실 수 있습니다.

```text
messageBody = {
    "username": "hello",
    "age": 20
}
helloData.getUsername() = hello
helloData.getAge() = 20
```



> 본 게시글은 [스프링 MVC 1편 - 백엔드 웹 개발 핵심 기술](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-mvc-1) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.