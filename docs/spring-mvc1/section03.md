# 03. 서블릿, JSP, MVC 패턴

## 3.1. 회원 관리 웹 애플리케이션 요구사항

다음과 같은 요구사항을 지닌 회원 관리 웹 애플리케이션을 만들어보도록 하겠습니다.

- 회원 정보
  - 이름 : `username`
  - 나이 : `age`
- 기능 요구사항
  - 회원 저장
  - 회원 목록 조회

### 3.1.1. 회원 도메인 모델

먼저 회원 정보 요구사항을 바탕으로 회원 도메인 모델을 생성합니다. 이 때, 회원을 구분하기 위한 유니크 아이디인 `id`를 추가하여 생성합니다.
`id`는 `Member`를 회원 저장소에 저장하면, 회원 저장소가 할당합니다.

```java
@Getter @Setter
public class Member {
    private Long id;
    private String username;
    private int age;

    // 기본 생성자
    public Member() {
    }

    public Member(String username, int age) {
        this.username = username;
        this.age = age;
    }
}
```

### 3.1.2. 회원 저장소

이번에는 회원 정보를 저장할 저장소를 생성하도록 하겠습니다. 회원 저장소는 **싱글톤 패턴**을 적용하였습니다.
스프링을 사용하면 스프링 빈으로 등록하면 되지만, 여기서는 최대한 스프링없이 서블릿만으로 구현하는 것이 목적이기에 직접 작성하였습니다.
싱글톤 패턴은 객체를 단 하나만 생성해서 공유해야 하므로, 생성자를 **`private`** 접근자로 막아두어야 합니다.

```java
public class MemberRepository {
    private static Map<Long, Member> store = new HashMap<>();
    private static long sequence = 0L;

    // 싱글톤 패턴 적용
    private static final MemberRepository instance = new MemberRepository();

    public static MemberRepository getInstance() {
        return instance;
    }

    private MemberRepository() {
    }

    public Member save(Member member) {
        member.setId(++sequence);
        store.put(member.getId(), member);
        return member;
    }

    public Member findById(Long id) {
        return store.get(id);
    }

    public List<Member> findAll() {
        return new ArrayList<>(store.values());
    }

    public void clearStore() {
        store.clear();
    }
}
```

참고로, 해당 코드는 동시성 문제가 고려되어 있지 않습니다. 실무에서는 동시성 문제를 고려해 `HashMap`이 아닌 `ConcurrentHashMap`이나 `AtomicLong`을 사용하는 것이 더 좋습니다.

### 3.1.3. 회원 저장소 테스트 코드

마지막으로 정상 동작하는지 확인하기 위해 테스트 코드를 작성해보겠습니다.

```java
class MemberRepositoryTest {
    MemberRepository memberRepository = MemberRepository.getInstance();

    @AfterEach
    void afterEach() {
        memberRepository.clearStore();
    }

    @Test
    void save() {
        // given
        Member member = new Member("kim", 20);

        // when
        Member savedMember = memberRepository.save(member);

        // then
        Member findMember = memberRepository.findById(savedMember.getId());
        assertThat(findMember).isEqualTo(savedMember);
    }

    @Test
    void findAll() {
        // given
        Member member1 = new Member("member1", 20);
        Member member2 = new Member("member2", 30);

        memberRepository.save(member1);
        memberRepository.save(member2);

        // when
        List<Member> result = memberRepository.findAll();

        // then
        assertThat(result.size()).isEqualTo(2);
        assertThat(result).contains(member1, member2);
    }
}
```

`@AfterEach` 어노테이션이 붙은 메서드는 `@Test` 어노테이션이 붙은 테스트 코드의 실행이 종료되면 바로 실행됩니다.
여기서는 테스트가 끝날 때마다 매번 `memberRepository`의 `store`에 저장된 데이터를 초기화합니다.


## 3.2. 서블릿으로 회원 관리 웹 애플리케이션 만들기

요구사항에 대한 기본적인 기능을 만들었으니, 이제 회원 관리 웹 애플리케이션을 만들어보겠습니다.

### 3.2.1. 회원 등록 폼

먼저 서블릿으로 회원 등록 HTML 폼을 구현해보겠습니다.

```java
@WebServlet(name = "memberFormServlet", urlPatterns = "/servlet/members/new-form")
public class MemberFormServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html");
        response.setCharacterEncoding("utf-8");

        PrintWriter w = response.getWriter(); // 간단하게 w로 표기

        w.write("<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <title>Title</title>\n" +
                "</head>\n" +
                "<body>\n" +
                "<form action=\"/servlet/members/save\" method=\"post\">\n" +
                "    username: <input type=\"text\" name=\"username\" />\n" +
                "    age:      <input type=\"text\" name=\"age\" />\n" +
                " <button type=\"submit\">전송</button>\n" + "</form>\n" +
                "</body>\n" +
                "</html>\n");

    }
}
```

`MemberFormServlet`은 회원의 이름과 나이에 대한 정보를 입력할 수 있는 HTML Form을 응답합니다.
서블릿을 사용하면 단순하게 만들 수 있지만, Java 코드로 HTML을 제공해야 한다는 불편함이 존재합니다.

코드를 실행해보면 다음과 같은 회원 등록 HTML 폼이 출력되는 것을 확인할 수 있습니다.

<img width="374" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/742ae170-6579-43e8-bdb7-795cf6892191">

### 3.2.2. 회원 저장

그 다음으로, 전송 버튼을 누르면 연결되는 `/servlet/members/save` 경로에 해당하는 페이지를 생성하도록 하겠습니다.

```java
@WebServlet(name = "memberSaveServlet", urlPatterns = "/servlet/members/save")
public class MemberSaveServlet extends HttpServlet {

    private final MemberRepository memberRepository = MemberRepository.getInstance(); // 싱글톤이기 때문에 new 사용 X. 기존 instance 를 불러옴.

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String username = request.getParameter("username");
        int age = Integer.parseInt(request.getParameter("age"));

        Member member = new Member(username, age);
        memberRepository.save(member);

        response.setContentType("text/html");
        response.setCharacterEncoding("utf-8");

        PrintWriter w = response.getWriter();
        w.write("<html>\n" +
                "<head>\n" +
                " <meta charset=\"UTF-8\">\n" + "</head>\n" +
                "<body>\n" +
                "성공\n" +
                "<ul>\n" +
                "    <li>id=" + member.getId() + "</li>\n" +
                "    <li>username=" + member.getUsername() + "</li>\n" +
                " <li>age=" + member.getAge() + "</li>\n" + "</ul>\n" +
                "<a href=\"/index.html\">메인</a>\n" + "</body>\n" +
                "</html>");
    }
}
```

HTML Form에서 입력한 정보를 통해 Member 객체를 생성한 다음, MemberRepository를 통해 저장합니다.
그리고 Member 객체를 사용하여 저장에 대한 정보를 보여주는 HTML을 동적으로 만들어 응답합니다.

`username`을 `kim`으로, `age`는 25로 전송하면, 다음과 같이 저장된 결과를 확인할 수 있습니다.

<img width="141" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/9b7edc7d-dfa9-4727-91b4-5b728566e066">

### 3.2.3. 회원 목록

이번에는 저장된 모든 회원 목록을 조회하는 기능을 구현해보겠습니다.

```java
@WebServlet(name = "memberListServlet", urlPatterns = "/servlet/members")
public class MemberListServlet extends HttpServlet {

    private final MemberRepository memberRepository = MemberRepository.getInstance();

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        List<Member> members = memberRepository.findAll();

        response.setContentType("text/html");
        response.setCharacterEncoding("utf-8");

        PrintWriter w = response.getWriter();
        w.write("<html>");
        w.write("<head>");
        w.write("    <meta charset=\"UTF-8\">");
        w.write("    <title>Title</title>");
        w.write("</head>");
        w.write("<body>");
        w.write("<a href=\"/index.html\">메인</a>");
        w.write("<table>");
        w.write("    <thead>");
        w.write("    <th>id</th>");
        w.write("    <th>username</th>");
        w.write("    <th>age</th>");
        w.write("    </thead>");
        w.write("    <tbody>");
        
        for (Member member : members) {
            w.write("    <tr>");
            w.write("        <td>" + member.getId() + "</td>");
            w.write("        <td>" + member.getUsername() + "</td>");
            w.write("        <td>" + member.getAge() + "</td>");
            w.write("    </tr>");
        }

        w.write("    </tbody>");
        w.write("</table>");
        w.write("</body>");
        w.write("</html>");

    }
}
```

이 때, 반복적으로 동작하는 코드는 `for`문을 통해 회원 수만큼 동적으로 생성하고 응답합니다.

재실행하면 메모리에 올려진 데이터가 삭제되므로 다시 회원가입을 해주어야 합니다.
다음과 같은 세 사람에 대해 먼저 회원가입을 합니다.

| username | age |
|:--------:|:---:|
|   kim    | 25  |
|   lee    | 20  |
|   park   | 30  |

그 다음 `/servlet/members`로 이동하여 회원가입한 사람들을 모두 출력하는지 확인해보면, 다음과 같이 모두 정상적으로 출력되는 것을 확인할 수 있습니다.

<img width="118" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/4cdcc34a-4a71-46af-b6c2-b0e66405f80b">

지금까지 서블릿과 Java 코드만으로 HTML을 만들어보았습니다. 서블릿을 사용하면 **동적**으로 원하는 HTML을 만들 수 있지만, 코드를 보았듯 **매우 복잡하고 비효율적**입니다.
이러한 불편함을 개선하기 위해 나온 것이 바로 **템플릿 엔진**입니다. 템플릿 엔진에는 JSP, Thymeleaf, Freemarker, Velocity 등이 있으며, 3.3에서 JSP를 활용하여 동일한 작업을 진행하려 합니다.

## 3.3. JSP로 회원 관리 웹 애플리케이션 만들기

JSP를 사용하려면 `build.gradle` 먼저 다음 라이브러리를 추가해야 합니다. 참고로, 스프링 부트 3.0 이상의 경우, 강의 자료를 통해 `build.gradle` 추가 방법을 확인할 수 있습니다.

```groovy
implementation 'org.apache.tomcat.embed:tomcat-embed-jasper'
implementation 'javax.servlet:jstl'
```

### 3.3.1. 회원 등록 폼 JSP

먼저 회원 등록 폼을 JSP 파일을 만들어보겠습니다. 이 때, `main/webapp/jsp/members/new-form.jsp`로 파일을 생성해야 합니다.

<img width="241" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/468a0077-26dc-4645-8713-6480abff6c75">

그 다음 아래와 같이 코드를 작성합니다.

```html
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>
<form action="/jsp/members/save.jsp" method="post">
    username: <input type="text" name="username" />
    age: <input type="text" name="age" />
    <button type="submit">전송</button>
</form>
</body>
</html>
```

코드를 보면 일반적인 HTML과 유사한 것을 알 수 있습니다. 차이점은 첫 줄의 `<%@ page contentType="text/html;charset=UTF-8" language="java" %>`인데, 첫 줄은 JSP 문서임을 나타냅니다.

이제 실행 후 `http://localhost:8080/jsp/members/new-form.jsp` 에 접속해보면 이전에 서블릿으로 작성했던 HTML 폼과 동일한 형태의 폼이 뜨는 것을 확인할 수 있습니다.
참고로, JSP 페이지에 접속할 때는 마지막에 `.jsp` 확장자를 붙여주어야 합니다.

<img width="450" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/a12e5402-6b02-4869-acc7-1fd913dd737f">

### 3.3.2. 회원 저장 JSP

그 다음으로, 전송 버튼을 누르면 연결되는 `/jsp/members/save.jsp` 경로에 해당하는 페이지를 생성하도록 하겠습니다.

```html
<%@ page import="practice.mvc1servlet.domain.member.MemberRepository" %>
<%@ page import="practice.mvc1servlet.domain.member.Member" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    MemberRepository memberRepository = MemberRepository.getInstance();
    System.out.println("save.jsp");
    String username = request.getParameter("username");
    int age = Integer.parseInt(request.getParameter("age"));
    Member member = new Member(username, age);
    System.out.println("member = " + member);
    memberRepository.save(member);
%>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body> 성공
<ul>
    <li>id=<%=member.getId()%>
    </li>
    <li>username=<%=member.getUsername()%>
    </li>
    <li>age=<%=member.getAge()%>
    </li>
</ul>
<a href="/index.html">메인</a>
</body>
</html>
```

JSP는 자바 코드를 그대로 사용할 수 있습니다.
`<%@ page import="practice.mvc1servlet.domain.member.MemberRepository" %>` 부분은 자바의 import 문과 같습니다.
그리고 `<% %>` 내에 자바 코드를 입력할 수 있으며, `<%= %>`를 통해 자바 코드를 출력할 수도 있습니다.

<img width="407" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/a84f73e7-da70-4130-ba0c-e308ca138190">

### 3.3.3. 회원 목록 JSP

마지막으로 회원 목록을 JSP 페이지로 생성해보겠습니다.

```html
<%@ page import="practice.mvc1servlet.domain.member.MemberRepository" %>
<%@ page import="practice.mvc1servlet.domain.member.Member" %>
<%@ page import="java.util.List" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    MemberRepository memberRepository = MemberRepository.getInstance();
    List<Member> members = memberRepository.findAll();
%>
<html>
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<a href="/index.html">메인</a>
<table>
    <thead>
    <th>id</th>
    <th>username</th>
    <th>age</th>
    </thead>
    <tbody>
    <%
        for (Member member : members) {
            out.write("    <tr>");
            out.write("        <td > " + member.getId() + " </td > ");
            out.write("        <td > " + member.getUsername() + " </td > ");
            out.write("        <td > " + member.getAge() + " </td > ");
            out.write("    </tr>");


        } %>
    </tbody>
</table>
</body>
</html>
```

재실행하면 메모리에 올려진 데이터가 삭제되므로 다시 회원가입을 해주어야 합니다.
서블릿 때와 동일하게 세 사람에 대해 먼저 회원가입을 합니다.
그 다음 `/jsp/members.jsp`로 이동하면, 다음과 같이 정보가 표출되는 것을 확인할 수 있습니다.

<img width="362" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/6d2f625e-b669-48b6-86a5-b2b0d1248092">

### 3.3.4. 서블릿과 JSP 한계

**서블릿**으로 HTML 화면을 개발할 때, 자바 코드에 HTML이 섞여 **지저분하고 복잡**했습니다.
**JSP**에서 뷰를 생성하였을 때는 **HTML 작업을 깔끔**하게 가져가고, 중간 중간 동적으로 변경이 필요한 부분만 자바 코드를 적용했습니다.
그러나 JSP에 자바 코드를 직접 사용하다보니 비즈니스 로직과 데이터를 조회하는 리포지토리 등 **다양한 코드가 모두 JSP에 노출**되어 있습니다.
뿐만 아니라 이렇게 사용하면 JSP에서 너무 많은 역할을 하게 됩니다.

이러한 문제를 해결하기 위해 등장한 것이 **MVC 패턴**입니다. 3.4 부터는 MVC 패턴에 대해 알아보고, 적용해보도록 하겠습니다.



> 본 게시글은 [스프링 MVC 1편 - 백엔드 웹 개발 핵심 기술](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-mvc-1) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.