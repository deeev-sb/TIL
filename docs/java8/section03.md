# 3. 인터페이스 default 메서드와 static 메서드

## 인터페이스 기본 메서드 (Default Methods)

기본 메서드가 어떻게 쓰이는지 알아보기 전, 아래와 같은 상황에 대해 생각해보자.

우선, 아래와 같이 이름을 출력/반환하는 메서드를 구현해야 하는 인터페이스가 존재한다.

```java
public interface Name {
    void printName();
    String getName();
}
```

Name 인터페이스를 아래와 같이 구현을 해두었다.

```java
public class DefaultName implements Name{
    String name;

    public DefaultName(String name) {
        this.name = name;
    }

    @Override
    public void printName() {
        System.out.println(this.name);
    }
   
    public String getName() {
        return this.name;
    }
}
```

이 외에도 여러 메서드가 존재한다고 할 때, 나중에 Name 인터페이스에 기능이 하나 더 추가되면 어떻게 될까?

```java
public interface Name {
    void printName();
    void printNameUpperCase();
}
```

많은 여러 메서드에 해당 메서드를 오버라이드하여 구현해야 하는 불편함이 발생하게 된다.

이러한 문제를 해결할 수 있는 것이 바로 기본 메서드이다.

예를 들어, 이름을 대문자로 변경하여 출력하는 기능을 모두 제공하려 할 때, 아래와 같이 기본 메서드를 구현함으로써 이를 구현하는 다른 메서드에서 구현에 대한 필요 없이 기능을 제공할 수 있게 된다.

```java
public interface Name {
    void printName();
    String getName();

    default void printNameUpperCase() {
        System.out.println(getName().toUpperCase());
    }
}
```

실제로 DefaultName을 생성하여 실행시켜보면, 정상 동작하고 있음을 확인할 수 있다.

```java
public class NameApp {
    public static void main(String[] args) {
        DefaultName name = new DefaultName("Kim");
        name.printName(); // Kim
        name.printNameUpperCase(); // KIM
    }
}
```

참고로, 자바 Collection 내 removeIf 도 기본 메서드로 구현되어 있다.

이렇게 기본 메서드를 생성하여 제공하면, 상속 받는 하위 클래스는 이 기능을 가지게 되어 편리하게 보인다. 그러나, 실제로는 기본 메서드가 정상 동작한다고 판단하기 어렵다. 명확하게 구현되었다고 보기 어려운 부분들이 있기 때문이다. 가령, printNameUpperCase() 메서드에 null 이 들어오면 NPE가 발생할테니…

우리는 이러한 문제를 방지하기 위해 문서화를 잘 해두어야 한다!

자바독을 사용한다면 @implSpec 같은 어노테이션을 활용하여 아래와 같이 문서화를 할 수 있다.

```java
public interface Name {
    void printName();
    String getName();

    /**
     * @implSpec
     * 이 구현체는 getName()으로 가져오는 문자열을 대문자로 바꿔 출력한다.
     */
    default void printNameUpperCase() {
        System.out.println(getName().toUpperCase());
    }
}
```

만약 이렇게 구현한 기본 메서드를 일부에서는 직접 구현해서 사용하려고 한다면, 아래와 같이 추상 메서드로 변경하면 된다.

```java
public interface Names extends Name{
    void printNameUpperCase();
}
```

그렇다면 Name 인터페이스와 Names 인터페이스 두 개를 모두 구현하려고 하면 어떻게 될까?

어떠한 printNameUpperCase()를 사용할지 판단할 수 없어 컴파일 에러가 발생하게 된다.

이 경우는 충돌하는 메서드에 대해 오버라이드하여 직접 구현하면 해결할 수 있다.

참고로, 추상 메서드 - 추상 메서드, 추상 메서드 - 기본 메서드, 기본 메서드 - 기본 메서드 관계 없이 모두 문제가 발생한다.

```java
public class DefaultNames implements Name, Names{
    String name;

    public DefaultNames(String name) {
        this.name = name;
    }

    @Override
    public void printName() {
        System.out.println(this.name);
    }

    public String getName() {
        return this.name;
    }

    @Override
    public void printNameUpperCase() {
        System.out.println(this.name.toUpperCase());
    }
}
```

지금까지 살펴본 내용에 유의 사항까지 포함하여 아래와 같이 정리해보았다.

- 인터페이스에 메서드 선언이 아니라 구현체를 제공하는 방법
- 해당 인터페이스를 구현한 클래스를 깨트리지 않고 새 기능 추가 가능
- 기본 메서드는 구현체가 모르게 추가된 기능으로 그만큼 리스크가 존재함
    - 컴파일 에러는 아니지만, 구현체에 따라 런타임 에러가 발생할 수 있음
    - 문서화 필수 (@implSpec 자바독 태그 사용)
- Object가 제공하는 기능 (equals, hasCode) 는 기본 메서드로 제공 불가
- 본인이 수정할 수 있는 인터페이스에만 기본 메서드 제공 가능
- 인터페이스를 상속 받는 인터페이스에서 다시 추상 메서드로 변경 가능
- 인터페이스 구현체 재정의 가능

## 인터페이스 Static 메서드

해당 인터페이스 타입과 관련된 헬퍼/유틸리티 메서드 제공 시 사용한다.

```java
public interface Name {
    void printName();
    String getName();

    default void printNameUpperCase() {
        System.out.println(getName().toUpperCase());
    }

    // 해당 인터페이스 타입 관련 헬퍼/유틸리티 메서드를 제공할 때는 static 메서드를 제공할 수 있다.
    static void printAnything() {
        System.out.println("Anything");
    }
}
```

## Java8 에서 추가된 API

우선 모든 예제에서 공통으로 사용할 List를 하나 생성하고 시작하도록 하겠다!

```java
public class NameApp {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("kim");
        names.add("Lee");
        names.add("park");
        names.add("bin");
    }
}
```

### Iterable

- forEach()

  forEach를 사용하면 for loop를 사용하는 것보다 더 쉽게 코드를 작성할 수 있다.

    ```java
    names.forEach(System.out::println); // name이 순서대로 출력됨
    ```

    - for loop 예제 보기

        ```java
        for (String n : names) {
            System.out.println(n);
        }
        ```

- spliterator()

  spliterator는 쪼갤 수 있는 기능을 가진 iterator 라고 생각하면 된다.

  그래서 iterator와 순회가 동일하게 동작한다. 아래 예제처럼 while문을 사용하여 순회를 한다고 할 때, 다음 값이 존재하지 않으면 while문은 종료된다.

    ```java
    Spliterator<String> spliterator = names.spliterator();
    Spliterator<String> spliterator1 = spliterator.trySplit();
    while (spliterator.tryAdvance(System.out::println)); // park, bin 출력
    System.out.println("-----------------");
    while (spliterator1.tryAdvance(System.out::println)); // kim, Lee 출력
    ```

  예제에서 trySplit()이라는 메서드를 사용했는데, 이는 spliterator 값을 반으로 나누어 가져가는 메서드이다. trySplit()은 보통 순서가 중요하지 않고 parallel 하게 처리할 때 사용한다.


### Collection

- stream() / parallelStream()

  다음 장에서 자세하게 볼 예정이다! 아래와 같은 방식으로 사용한다는 것만 알고 넘어가자.

    ```java
    names.stream().map(String::toUpperCase)
            .filter(s -> s.startsWith("K"))
            .collect(Collectors.toSet())
            .forEach(System.out::println);
    ```

- removelIf(Predicate)

  조건에 충족하는 값을 제거할 때 사용한다.

    ```java
    names.removeIf(s -> s.startsWith("k")); // kim 을 제외한 names 값이 출력됨
    ```

- spliterator()

참고로, Collection은 Iterable을 상속받는다.

### Comparator

- reversed()

  아래와 같이 사용하면 대소문자 구분 없이 역순 정렬이 가능하다.

    ```java
    Comparator<String> compareToIgnoreCase = String::compareToIgnoreCase;
    names.sort(compareToIgnoreCase.reversed());
    ```

- thenComparing()

  정렬 후, 추가적인 조건을 더해 정렬을 하려고 할 때 사용한다.

- static reverseOrder() / naturalOrder()
- static nullsFirst() / nullsLast()

  nullsFirst()는 정렬 시 null 값의 우선순위가 가장 높고, nullsLast()는 null 값의 우선순위가 가장 낮다.

- static comparing()

> 본 게시글은 [스프링 핵심 원리 - 기본편](https://www.inflearn.com/course/the-java-java8) 강의를 참고하여 작성되었습니다.
>
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.
>