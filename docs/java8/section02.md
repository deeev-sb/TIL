# 2. 메서드 레퍼런스 (Method Reference)

람다가 하는 일이 기존 메서드 또는 생성자를 호출하는 거라면, 메서드 레퍼런스를 사용해서 매우 간결하게 표현할 수 있다.

```java
public class App {
    public static void main(String[] args) {
        // UnaryOperator<String> hi = (s) -> "hi" + s;
        UnaryOperator<String> hi = Greeting::hi; // static 메서드 참조

        // 특정 객체의 인스턴스 메서드 참조
        Greeting greeting = new Greeting();
        UnaryOperator<String> hello = greeting::hello;
        System.out.println(hello.apply("kim"));

        // 생성자
        Supplier<Greeting> newGreeting = Greeting::new; // 이렇게만 해서는 아무런 일도 벌어지지 않음
        newGreeting.get(); // 이렇게 해야 생성됨

        // 입력 값을 받는 생성자
        Function<String, Greeting> nameGreeting = Greeting::new;
        Greeting name = nameGreeting.apply("name");
        System.out.println(name.getName());

        // 임의 객체의 인스턴스 참조
        String[] names = {"kim", "su", "bin"};
        Arrays.sort(names, String::compareToIgnoreCase);
        System.out.println(Arrays.toString(names));
    }
}
```

- **메서드 참조하는 방법**
  - 메서드 또는 생성자의 매개변수로 람다의 입력 값을 받는다.
  - 리턴 값 또는 생성한 객체는 람다의 리턴 값이다.`

| static 메서드 참조      | 타입::static 메서드    |
|--------------------|-------------------|
| 특정 객체의 인스턴스 메서드 참조 | 객체 레퍼런스::인스턴스 메서드 |
| 임의 객체의 인스턴스 메서드 참조 | 타입::인스턴스 메서드      |
| 생성자 참조             | 타입::new           |

> 본 게시글은 [스프링 핵심 원리 - 기본편](https://www.inflearn.com/course/the-java-java8) 강의를 참고하여 작성되었습니다.
>
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.
>
