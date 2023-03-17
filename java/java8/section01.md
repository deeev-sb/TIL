# 1. 함수형 인터페이스와 람다 표현식

## 함수형 인터페이스 (Functional Interface)

함수형 인터페이스는 **추상 메서드를 딱 하나만 가지고 있는 인터페이스** 이며,

SAM (Single Abstract Method) 인터페이스라고도 한다.

```java
public interface RunSomething {
    // abstract 가 생략된 추상 메서드
    void doIt();

    // 이렇게 추상 메서드가 아닌 다른 메서드가 존재하더라도
		// 인터페이스 내에 추상 메서드가 하나이므로 함수형 인터페이스이다.
    static void pringName() {
				System.out.println("RunSomething");
		}
}
```

@FuncationInterface 어노테이션을 사용하면 추상 메서드가 두 개 이상 존재할 때 컴파일 에러가 발생한다.

```java
@FunctionalInterface
public interface RunSomething {
    void doIt();
}
```

- (참고) 인터페이스 내에서 정의할 수 있는 메서드의 종류도 다양하다 (Java 8 특징)

    ```java
    public interface RunSomething {
        void doIt();
    
        // 추상 메서드 내에 public 이 생략된 static 메서드를 정의할 수 있음
        static void printName() {
            System.out.println("RunSometing");
        }
    
        // 추상 메서드 내에 default 메서드를 정의할 수 있음
        default void printAge() {
            System.out.println("25");
        }
    }
    ```


## 람다 표현식

Java 8  이전에는 **익명 내부 클래스 (anonymous inner class)**를 정의하여 함수형 인터페이스의 구현체를 만들었다.

```java
public class Foo {
    public static void main(String[] args) {
        RunSomething runSomething = new RunSomething() {
            @Override
            public void doIt() {
                System.out.println("Hello");
            }
        };
    }
}
```

Java 8부터는 이를 **람다 표현식**을 사용하여 간결하게 구현할 수 있다.

```java
public class Foo2 {
    public static void main(String[] args) {
        RunSomething runSomething = () -> System.out.println("Hello");
        runSomething.doIt();
    }
}
```

만약, 내부 코드가 한 줄이 아니라 여러 줄이라면 아래와 같이 작성하면 된다.

```java
public class Foo2 {
    public static void main(String[] args) {
        RunSomething runSomething2 = () -> {
            System.out.println("Lambda");
            System.out.println("Expression");
        };
        runSomething2.doIt();
    }
}
```

이렇듯 람다 표현식은 **메서드 매개변수**로 만들어 사용할 수도 있고, **리턴 타입, 변수**로 만들어서 사용할 수도 있다.

### 람다 표현식 구조

```java
(인자 리스트) -> {바디}
```

### 인자 리스트

- 인자가 없을 때 : (0
- 인자가 한 개 일 때 : (one) 또는 one
- 인자가 여러 개 일 때 : (one, two)
- 인자 타입은 컴파일러가 추론하기 때문에 생략해도 되지만, 명시할 수도 있다.
  : (Integer one, Integer two)

### 바디

- 화살표 오른쪽에 함수 본문을 정의한다.
- 여러 줄인 경우에는 {}를 사용해서 묶는다.
- 한 줄인 경우 {}는 생략 가능하며, 이 때 return 도 생략할 수 있다.

### 변수 캡처

- **로컬 변수 캡처**
    - final이거나 effective final 인 경우에만 참조할 수 있다.
    - 그렇지 않을 경우 concurrency 문제가 생길 수 있어서 컴파일가 방지한다.
- **effective final**
    - 이것도 역시 자바 8부터 지원하는 기능으로 **“사실상" final인 변수.**
    - final 키워드 사용하지 않은 변수를 익명 클래스 구현체 또는 람다에서 참조할 수 있다.
- **익명 클래스 구현체와 달리 ‘Shadowing’ 하지 않는다.**
    - 익명 클래스는 새로 Scope을 만들지만, 람다는 람다를 감싸고 있는 Scope과 같다.

```java
public class VariableCapture {
    public static void main(String[] args) {
        VariableCapture variableCapture = new VariableCapture();
        variableCapture.run();
    }

    private void run() {
        final int baseNumber = 10; // java8 부터는 값이 사실상 final 인 경우 final 생략 가능

        // 로컬 클래스
        class LocalClass {
            void printBaseNumber() {
                System.out.println(baseNumber);
            }
        }

        // 익명 클래스
        Consumer<Integer> integerConsumer = new Consumer<Integer>() {
            @Override
            public void accept(Integer integer) {
                System.out.println(baseNumber);
            }
        };

        // 람다
        IntConsumer printInt = i -> System.out.println(i + baseNumber);

        printInt.accept(10);
    }
}
```

### Shadowing

**내부에 선언한 변수로 바깥 변수를 덮는 것**을 Shadowing 이라고 한다.

아래 예제 코드와 같이 로컬 클래스와 익명 클래스는 내부에서 동일 이름으로 선언이 가능하며, 내부 변수를 인식하여 동작한다. 그러나 람다는 참조하는 baseNumber와 동일한 scope 이기 때문에 인자 값으로 넣을 수 없으며, **람다는 effective final 값만 참조 가능하여 변경도 불가하다.**

```java
public class Shadowing {
    public static void main(String[] args) {
        int baseNumber = 10;

        // 로컬 클래스
        class LocalClass {
            void printBaseNumber() {
                int baseNumber = 11;
                System.out.println(baseNumber); // 로컬 클래스 scope 내의 baseNumber 출력 - Shadowing
            }
        }
        new LocalClass().printBaseNumber(); // 11 출력

        // 익명 클래스
        Consumer<Integer> integerConsumer = new Consumer<Integer>() {
            @Override
            public void accept(Integer baseNumber) {
                System.out.println(baseNumber); // 익명 클래스 scope 내의 baseNumber 출력 - Shadowing
            }
        };
        integerConsumer.accept(11); // 11 출력

        // 람다
        // baseNumber 와 같은 scope 이기 때문에 애초에 인자 값으로 baseNumber 넣을 수 없음
        IntConsumer printInt = i -> System.out.println(i + baseNumber); // 람다는 effective final 값만 참조할 수 있음

        printInt.accept(10);
    }
}
```

## 자바에서 함수형 프로그래밍

### 일급 객체 (First Class Object)

- Java 에서는 함수형 프로그래밍을 **일급 객체로 사용할 수 있다.**

  여기서는 `() -> System.out.println("Hello");` 와 같이 함수처럼 작성했지만, 사실 자바는 이를 변수에 할당하거나 메서드의 파라미터로 전달하거나 return 할 수 있다.

  ⇒ 그렇기에 함수형 프로그래밍은 **고차 함수**이다.


### **고차 함수**

- **함수가 함수를 매개변수로 받거나 리턴할 수 있다.**
- 자바에서는 단순한 Object 이기 때문에 무조건 고차함수이다.

### **순수 함수**

- **동일한 입력에 항상 같은 값을 반환하는 함수**이다.

    ```java
    public class Foo3 {
        public static void main(String[] args) {
            // 함수형 인터페이스는 동일한 입력에 항상 같은 값을 반환해야 함 => 순수 함수
            RunSomething2 runSomething = (number) -> (number + 10);
    
    				// 1을 넣으면 항상 11 반환
            System.out.println("runSomething = " + runSomething.doIt(10)); // 11
            System.out.println("runSomething = " + runSomething.doIt(10)); // 11
            System.out.println("runSomething = " + runSomething.doIt(10)); // 11
    
        }
    }
    ```

- **함수 밖에 있는 값을 사용하지 않기** 때문에, 아래와 같은 경우는 순수 함수가 아니다.

    ```java
    public class Foo4 {
        public static void main(String[] args) {
            int baseNumber = 10; // 함수 밖에 존재하는 경우 순수 함수 X
            RunSomething2 runSomething = new RunSomething2() {
                int baseNumber = 10; // 함수 밖에 존재하는 경우 순수 함수 X
                @Override
                public int doIt(int number) {
                    return number + baseNumber;
                }
            };
        }
    }
    ```

  함수 밖에 있는 값을 사용하는 경우 **final** 이라고 가정하고 사용하기 때문에, 값을 변경하지 못한다.

- 순수함수는 **함수 밖에 있는 값을 변경하지 않기** 때문에 사이드 이펙트를 만들지 않는다.

  그러므로 아래와 같이 함수 밖에 있는 값을 변경하는 경우는 순수함수가 아니다.

    ```java
    public class Foo4 {
        public static void main(String[] args) {
            RunSomething2 runSomething = new RunSomething2() {
                int baseNumber = 10;
                @Override
                public int doIt(int number) {
                    baseNumber++; // 문법적으로는 가능하지만 함수형 인터페이스 X
                    return number + baseNumber;
                }
            };
        }
    }
    ```

- 함수 밖에 정의되어 있는 상태가 없다.

### 불변성

## 자바에서 제공하는 함수형 인터페이스

자바가 기본으로 제공하는 다양한 함수형 인터페이스 중 자주 사용할만한 함수형 인터페이스에 대해서만 설명한다. 자세한 설명은 [java.util.function 패키지](https://docs.oracle.com/javase/8/docs/api/java/util/function/package-summary.html)에서 확인하길 바란다.

- **주요 함수형 인터페이스 요약 테이블**


    | Interface | Function | Description | 함수 조합용 메서드 |
    | --- | --- | --- | --- |
    | Function<T, R> |  R apply(T t) | T 타입을 받아서 R 타입으로 리턴하는 함수형 인터페이스 | andThen
    compose |
    | BiFunction<T, U, R> | R apply(T t, U u) | 두 개의 값 (T, U) 를 받아서 R 타입을 리턴하는 함수형 인터페이스 |  |
    | Consumer<T> | void accept(T t) | T 타입을 받아서 아무 값도 리턴하지 않는 함수형 인터페이스 | andThen |
    | Supplier<T> | T get() | T 타입의 값을 제공하는 함수형 인터페이스 |  |
    | Predicate<T> | boolean test(T t) | T 타입을 받아서 boolean을 리턴하는 함수형 인터페이스 | And
    Or
    Negate |
    | UnaryOperator<T> |  | Function<T, R>의 특수한 형태로, 입력 값 하나를 받아서 동일한 타입으로 리턴하는 함수형 인터페이스 |  |
    | BinaryOperator<T> |  | BiFunction<T, U, R>의 특수한 형태로, 동일한 타입의 입력 값 두 개를 받아 리턴하는 함수형 인터페이스 |  |

### 코드로 보기

```java
public class FunctionalInterfaces {
    public static void main(String[] args) {
        // 자바에서 제공하는 Function 인터페이스 활용================
        Function<Integer, Integer> plus10 = i -> i + 10; // Foo3의 메서드와 동일한 기능
        System.out.println(plus10.apply(1)); // R apply(T t) : T 타입을 받아서 R 타입으로 반환

        Function<Integer, Integer> multiply2 = i -> i * 2;
        System.out.println(multiply2.apply(2)); // 2

        // compose 내 메서드가 먼저 수행된 결과를 사용해 앞에 있는 메서드가 수행된다.
        // 즉, multiply2 가 먼저 적용되고 plus10이 적용된다.
        Function<Integer, Integer> multiply2AndPlus10 = plus10.compose(multiply2);
        System.out.println(multiply2AndPlus10.apply(2)); // 14

        // 앞에 있는 메서드 결과를 사용해 andThen 내 메서드가 수행된다.
        // 즉, plus10 이 먼저 실행되고 multiply2 가 적용된다.
        Function<Integer, Integer> plus10AndMultiply2 = plus10.andThen(multiply2);
        System.out.println(plus10AndMultiply2.apply(2)); // 24

        // 자바에서 제공하는 Consumer 인터페이스 활용================
        Consumer<Integer> printT = i -> System.out.println(i);
        printT.accept(10); // void accept(T t) : T 타입을 받아서 아무 값도 리턴하지 않음

        // 자바에서 제공하는 Supplier 인터페이스 활용================
        Supplier<Integer> get10 = () -> 10; // 전달 받는 인자 값 X
        System.out.println(get10.get()); // 호출 시 T 타입 값을 반환

        // 자바에서 제공하는 Predicate 인터페이스 활용================
        // test 에 T 타입 값을 넣으면 체크 후 boolean 타입으로 반환함
        Predicate<String> startsWithFunc = s -> s.startsWith("func");
        System.out.println(startsWithFunc.test("function")); // true
        System.out.println(startsWithFunc.test("Function")); // false
        Predicate<Integer> isEven = i -> i % 2 == 0;
        System.out.println(isEven.test(2)); // true
        System.out.println(isEven.test(5)); // false

        // 자바에서 제공하는 UnaryOperator 인터페이스 활용================
        // Function<T, R> 의 특수한 형태로, T 타입과 R 타입이 동일
        UnaryOperator<Integer> plus1 = i -> i + 1;
    }
}
```