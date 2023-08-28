# 01. 웹 애플리케이션 이해

## 1.1. 웹 서버, 웹 애플리케이션 서버

### 1.1.1 웹 서버 vs. 웹 애플리케이션 서버

웹 서버 (Web Server)와 웹 애플리케이션 서버 (WAS - Web Application Server)는 모두 **`HTTP`를 기반으로 동작**합니다.
웹 서버와 웹 애플리케이션의 차이는 다음과 같습니다.

|             | 특징                                                                                                                                          |              예              |
|:-----------:|:--------------------------------------------------------------------------------------------------------------------------------------------|:---------------------------:|
|    웹 서버     | - 정적 리소스 및 기타 부가 기능 제공<br/>- 정적 리소스 : 정적(파일) HTML, CSS, JS, 이미지, 영상                                                                         |        NGINX, APACHE        |
| 웹 애플리케이션 서버 | - 웹 서버 기능을 포함하고 있음 (정적 리소스 제공 가능)<br/>- 프로그램 코드를 실행해서 애플리케이션 로직 수행<br/>&nbsp;&nbsp;- 동적 HTML, HTTP API(JSON)&nbsp;&nbsp;- 서블릿, JSP, 스프링 MVC | 톰캣(Tomcat), Jetty, Undertow |

사실 웹 서버와 웹 애플리케이션 서버의 용어에 대한 경계가 모호합니다.
웹 서버도 프로그램을 실행하는 기능을 포함하기도 하고, 웹 애플리케이션 서버도 웹 서버의 기능을 제공합니다.
기억하기 쉽게 정리하면, **웹 서버는 정적 리소스(파일), WAS는 애플리케이션 로직**을 제공합니다.

### 1.1.2 웹 시스템 구성

웹 시스템은 `WAS`와 `DB`만으로 시스템을 구성할 수 있습니다. 왜냐하면, `WAS`가 정적 리소스와 애플리케이션 로직을 모두 제공하기 때문입니다.

<img width="330" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/564e07db-22d1-4c0b-88f2-b9ff8f13dfcc">

그런데 이렇게 WAS가 너무 많은 역할을 담당하면, 서버 과부하가 발생할 수 있습니다.
정적 리소스는 단순히 파일을 내려주는 것이기에 비용이 싼데, 이러한 **정적 리소스 때문에 가장 비싼 애플리케이션 로직 수행이 어려울 수 있기** 때문입니다.
뿐만 아니라, **WAS에서 장애가 발생하면, 오류 화면도 노출할 수 없습니다.**

이러한 문제를 해결하기 위해서는 다음과 같이 **정적 리소스를 웹 서버가 처리**하도록 구성해야 합니다.
웹 서버는 애플리케이션 로직 같은 동적 처리가 필요한 부분에 대해서만 WAS에 요청을 위임하며, WAS는 중요한 애플리케이션 로직에 대한 처리를 전담하게 됩니다.

<img width="637" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/078bbbd8-e4f3-4dd8-9487-fa4a32fd9a8e">

그리고 이렇게 구성하면, **리소스 관리를 효율적**으로 할 수 있습니다.
정적 리소스가 많이 사용되면 웹 서버를 증설하면 되고, 애플리케이션 리소스가 많이 사용되면 WAS를 증설하면 되기 때문입니다.

또한, 정적 리소스만 제공하는 웹 서버는 WAS와 달리 잘 죽지 않습니다.
그렇기에 WAS나 DB에서 장애가 발생하여도, **WEB 서버가 오류 화면을 제공**할 수 있습니다.

<img width="635" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/f5d0b7fa-3647-4203-95c9-b322cd400465">

## 1.2. 서블릿

다음 그림의 클라이언트는 이름과 나이를 입력한 다음 전송 버튼을 누르면 회원 가입이 되는 `HTML Form`이라고 가정하겠습니다.

<img width="537" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/919c57a6-64b3-4356-bf8c-b9db14055a78">

`HTML Form`을 자세히 살펴보면 `URL`은 `/save`이고, `method`를 보아 `POST` 방식으로 데이터를 전송한다는 사실을 알 수 있습니다.
이 때, `body`는 `username`이라는 필드와 `age`라는 필드를 가지며, 각 필드의 값은 사용자가 입력한 이름과 나이입니다.
클라이언트에서 **전송**을 클릭하면 우측과 같은 요청 HTTP 메시지를 생성하며, `HTML Form` 형태로 전송하면 `Content-Type`은 일반적으로 `application/x-www-form-urlencoded`로 설정됩니다.

만약 웹 애플리케이션 서버를 밑바닥부터 직접 구현한다면, 다음 그림의 좌측 목록과 같은 일련의 과정을 진행해야 합니다.
그러나 이 중 의미있는 비즈니스 로직은 **비즈니스 로직 실행** 뿐입니다.

<img width="605" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/75aec815-bef8-401b-92c5-041bb2ca5fd2">

그런데 서블릿을 지원하는 WAS를 사용하게 되면, 의미있는 비즈니스 로직만 수행하면 됩니다. 그 외에 줄로 그은 부분은 모두 서블릿이 자동화해주기 때문입니다.

<img width="501" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/b4f26ae7-11b9-48ff-a44c-12b3d38c16b4">

서블릿은 다음과 같이 `@WebServlet` 어노테이션을 사용하고, `HttpServlet`을 상속 받으면 됩니다.

```java
@WebServlet(name = "helloServlet", urlPatterns = "/hello")
public class HelloServlet extends HttpServlet {
    
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) {
        // 애플리케이션 로직
    }
}
```

`urlPatterns`의 URL(/hello)이 호출되면 서블릿 코드가 실행됩니다.
그리고 `HttpServletRequest`를 통해 `HTTP` 요청 정보를 사용할 수 있고,
`HttpServletResponse`를 통해 `HTTP` 응답 정보를 편리하게 제공할 수 있습니다.
그렇기에 개발자는 `HTTP` 스펙을 매우 편리하게 사용할 수 있게 됩니다.
참고로, 개발자는 기본적인 `HTTP` 스펙에 대해서는 알고 있어야 합니다.

서블릿을 통해 통신을 주고 받는 전체 흐름은 다음과 같습니다.

<img width="734" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/dbd9cddc-b055-4db0-adef-96319b49e344">

1. 웹 브라우저에서 WAS로 `localhost:8080/hello` 요청
2. WAS는 request, response 객체를 새로 만들어 서블릿 객체 (`helloServlet`) 호출
3. request, response 객체를 파라미터로 서블릿 컨테이너의 `helloServlet` 실행
4. 서블릿 컨테이너의 `helloServlet`이 종료되면 반환되는 response 객체 정보를 바탕으로 HTTP 응답 생성
5. WAS에서 웹 브라우저로 응답 메시지 전송

그렇다면 서블릿 컨테이너는 무엇일까요? 사실 우리는 서블릿을 사용하기 위해 코드를 작성하기만 했습니다.
실제로 **서블릿 객체를 생성, 초기화, 호출, 종료하는 생명주기를 관리**하는 것은 **서블릿 컨테이너**입니다/

<img width="493" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/153a9a34-91fd-477c-8fd9-f548178a3db1">

톰캣처럼 서블릿을 지원하는 WAS를 서블릿 컨테이너라고 하며, 다음과 같은 **특징**을 가집니다.

- 서블릿 객체는 **싱글톤으로 관리**
  - 최초 로딩 시점에 서블릿 객체를 미리 만들어두고 재사용
  - 모든 고객 요청은 동일한 서블릿 객체 인스턴스에 접근
  - 서블릿 컨테이너 종료 시 함께 종료
  - **공유 변수 사용 시 주의**
- JSP도 서블릿으로 변환되어서 사용됨
- 동시 요청을 위한 **멀티 쓰레드 처리 지원**

> 본 게시글은 [스프링 MVC 1편 - 백엔드 웹 개발 핵심 기술](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-mvc-1) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.