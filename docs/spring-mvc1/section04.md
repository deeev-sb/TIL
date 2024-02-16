# 04. MVC 프레임워크 만들기

## 4.1. 프론트 컨트롤러 패턴

프론트 컨트롤러 패턴을 도입하기 전에는 공통 기능을 모든 컨트롤러에 생성해야 했습니다.

<img width="391" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/e420b509-b743-4185-8ad8-527c11d8fe80">

프론트 컨트롤러 패턴을 도입하면, 프론트 컨트롤러 서블릿 하나에서 공통 기능을 처리할 수 있게 됩니다.
또한, 프론트 컨트롤러가 요청에 맞는 컨트롤러를 찾아서 호출하는 입구 역할도 합니다.

<img width="512" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/d1a5cda3-781b-4084-9f4e-162cc8f8ec8b">

프론트 컨트롤러 패턴을 간단하게 정리하면 다음과 같습니다.

- 프론트 컨트롤러 서블릿 하나로 클라이언트의 요청을 받음
- 프론트 컨트롤러가 요청에 맞는 컨트롤러를 찾아서 호출함
- 공통 기능을 한 곳에서 처리 가능
- 프론트 컨트롤러를 제외한 나머지 컨트롤러는 서블릿을 사용하지 않아도 됨

참고로, 스프링 웹 MVC의 **DispatcherServlet** 이 프론트 컨트롤러 패턴으로 구현되어 있습니다.

## 4.2. 프론트 컨트롤러 도입

이번 목표는 기존 코드를 최대한 유지하면서 프론트 컨트롤러를 도입하는 것입니다.

<img width="544" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/162c6830-6bdd-48e8-9023-f19842e4713e">

먼저 서블릿과 비슷한 모양의 인터페이스를 도입합니다.
각 컨트롤러는 이 인터페이스를 구현하면 도비니다.
이렇게 하면 프론트 컨트롤러는 인터페이스만 호출하면 되기에, 구현에 관계없이 로직의 일관성을 가져갈 수 있습니다. (다형성)

```java
public interface ControllerV1 {
    void process(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;
}
```

처음에 기존 코드를 최대한 유지하는 것이 목표라고 하였기에, 컨트롤러를 생성할 때 내부 로직은 이전 MVC 패턴 설명(section 3)과 거의 같습니다.
process 내부에 이전 코드의 service 내부 코드를 추가합니다.

```java
public class MemberFormControllerV1 implements ControllerV1 {
    @Override
    public void process(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String viewPath = "/WEB-INF/views/new-form.jsp";
        RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
        dispatcher.forward(request, response);
    }
}
```

MemberRepository는 기존과 유사하게 process 밖에 선언하면 됩니다.

```java
public class MemberSaveControllerV1 implements ControllerV1 {
    private MemberRepository memberRepository = MemberRepository.getInstance();
    @Override
    public void process(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String username = request.getParameter("username");
        int age = Integer.parseInt(request.getParameter("age"));

        Member member = new Member(username, age);
        memberRepository.save(member);

        request.setAttribute("member", member);

        String viewPath = "/WEB-INF/views/save-result.jsp";
        RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
        dispatcher.forward(request, response);
    }
}
```

기존 로직과 유사하기에 `MemberListController`에 대한 코드는 생략하겠습니다.

그 다음 각 컨트롤러의 앞에서 입구 역할을 할 프론트 컨트롤러를 생성합니다.

```java
@WebServlet(name = "frontControllerServletV1", urlPatterns = "/front-controller/v1/*")
public class FrontControllerServletV1 extends HttpServlet {

    private Map<String, ControllerV1> controllerMap = new HashMap<>();
    
    public FrontControllerServletV1() {
        controllerMap.put("/front-controller/v1/members/new-form", new MemberFormControllerV1());
        controllerMap.put("/front-controller/v1/members/save", new MemberSaveControllerV1());
        controllerMap.put("/front-controller/v1/members", new MemberListControllerV1());
    }

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String requestURI = request.getRequestURI();

        ControllerV1 controller = controllerMap.get(requestURI);
        if (controller == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        controller.process(request, response);
    }
}
```
`urlPatterns = "/front-controller/v1/*`이라고 선언하여, `/front-controller/v1` 하위의 모든 요청을 서블릿에서 받아들입니다.
그리고 각 URI와 웹 페이지를 매핑하기 위해 `controllerMap`을 생성합니다.
이 때, key는 매핑 URI로 설정하고, value는 호출 될 컨트롤러로 생성합니다.
그 다음 `request.getRequestURI()`를 통해 불러온 URI를 통해 `controllerMap`에서 실제 호출할 컨트롤러를 찾습니다.
만약 없다면 존재하지 않는 URI 호출이므로 `404(SC_NOT_FOUND)` 상태 코드를 반환하고,
컨트롤러를 찾으면 `controller.process(request,response);`를 통해 해당 컨트롤러를 실행합니다.

이렇게 구성이 가능한 이유는 부모 클래스는 자식 클래스를 호출할 수 있기 때문이며, `controller.process`는 실제로는 자식 클래스로 오버라이드되어 동작합니다.

참고로, JSP는 이전 MVC 패턴 설명에서 사용한 페이지 그대로 사용하였습니다.

> 본 게시글은 [스프링 MVC 1편 - 백엔드 웹 개발 핵심 기술](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-mvc-1) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.