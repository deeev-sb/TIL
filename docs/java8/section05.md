# 5. Optional

- 시작 전 준비 코드

  OnlineClass

    ```java
    public class OnlineClass {
        private Integer id;
        private String title;
        private final boolean closed;
    
        public Progress progress;
    
        public OnlineClass(Integer id, String title, boolean closed) {
            this.id = id;
            this.title = title;
            this.closed = closed;
        }
    
        public Integer getId() {
            return id;
        }
    
        public void setId(Integer id) {
            this.id = id;
        }
    
        public String getTitle() {
            return title;
        }
    
        public void setTitle(String title) {
            this.title = title;
        }
    
        public boolean isClosed() {
            return closed;
        }
    
        public Progress getProgress() {
            return progress;
        }
    
        public void setProgress(Progress progress) {
            this.progress = progress;
        }
    }
    ```

  Progress

    ```java
    public class Progress {
        private Duration studyDuration; // 학습 기간
        private boolean finished; // 수료 여부
        public Duration getStudyDuration() {
            return studyDuration;
        }
    
        public void setStudyDuration(Duration studyDuration) {
            this.studyDuration = studyDuration;
        }
    }
    ```

  OptionalPractice

    ```java
    public class OptionalPractice {
        public static void main(String[] args) {
            List<OnlineClass> springClasses = new ArrayList<>();
            springClasses.add(new OnlineClass(1, "spring boot", true));
            springClasses.add(new OnlineClass(2, "spring data jpa", true));
            springClasses.add(new OnlineClass(3, "spring mvc", false));
            springClasses.add(new OnlineClass(4, "spring core", false));
            springClasses.add(new OnlineClass(5, "rest api development", false));
        }
    }
    ```


## Optional

자바 프로그래밍에서 null 값이 반환되는 경우, 아래와 같은 null 체크를 하지 않고 동작을 수행하게 되면 NPE를 마주하게 된다.

```java
OnlineClass springBoot = new OnlineClass(1, "spring boot", true);
Progress progress = springBoot.getProgress(); // 현재 설정된 값이 없기 때문에 null

if (progress != null) {
    System.out.println(progress.getStudyDuration()); // null 처리 없이 출력하면 NPE 발생
}
```

NPE를 마주하게 한 주범은 `getProgress()` 로, 설정한 progress 값이 없기 때문에 null을 반환하여 클라이언트 코드에서 NPE를 마주하게 된 것이다. 이렇듯 메서드가 작업 중 값을 제대로 리턴할 수 없는 경우, 보통 아래와 같은 세 가지 방법으로 처리를 한다.

1. 예외를 던진다.

   예외가 발생할 때마다 자바에서는 스택트레이스를 찍기 때문에 리소스를 소비하게 된다. (비싸다!!)

    ```java
    public Progress getProgress() {
        if (this.progress == null) {
            throw new IllegalArgumentException();
        }
        return progress;
    }
    ```

2. null을 리턴한다.

   비용 문제는 없지만, 클라이언트에서 null이 발생하는 경우에 대해 “알아서” 처리를 해주어야 한다.

    ```java
    public Progress getProgress() {
        return progress;
    }
    ```

3. Optional을 리턴한다.

    ```java
    public Optional<Progress> getProgress() {
        return Optional.ofNullable(progress);
    }
    ```


**그렇다면 Optional은 무엇일까?**

Optional은 하나의 값이 들어있을 수도 있고 없을 수도 있는 컨테이너이다.

Optional을 사용하면 클라이언트에 명시적으로 빈 값일수도 있다는 것을 알려줄 수 있고, 빈 값인 경우에 대한 처리를 강제할 수 있다.

Optional을 사용할  때는 아래 사항에 주의하자!

- 리턴 값으로만 쓰기를 권장한다.

  Optional은 메서드 매개변수 타입, 맵의 키 타입, 인스턴스 필드 타입으로 사용하는 것은 문법적인 오류는 아니지만 권장하지 않는다. 자세한 내용은 아래를 참고하자.

    - 메서드 매개변수 타입으로 사용하는 경우, **매개변수 값으로 null이 들어올 수 있기 때문에** null에 대한 체크를 하지 않으면 **NPE**가 발생하게 된다. NPE를 막기 위해 아래와 같이 null 체크를 추가하면 IntelliJ를 사용하는 경우, `Replace with 'isPresent()'` 를 제안한다. Optional을 사용하면서 null을 체크하기 때문이다.

        ```java
        public void setProgress(Optional<Progress> progress) {
            if (progress != null)
                progress.ifPresent(p -> this.progress = p);
        }
        ```

      그러나 아래와 같이 `isPresent()`를 사용하는 코드로 변경하는 순간 다시 NPE를 마주하게 된다. ⇒ Optional을 사용하는 이유가 명확하지 않게 되고, 권장하지 않는 처리가 추가되어야 하므로 사용하지 않도록 하자

        ```java
        public void setProgress(Optional<Progress> progress) {
            if (progress.isPresent())
                progress.ifPresent(p -> this.progress = p); // null 체크를 하지 않으면 NPE 발생
        }
        ```

    - 맵이 가지고 있는 가장 큰 특징은 **키 값은 null을 가질 수 없다**는 것이다. 그러므로 키 타입으로 Optional을 사용하는 것은 맵이라는 인터페이스가 가지고 있는 **특징을 깨트리는 것**이다.
    - 인스턴스 필드 타입으로 Optional을 사용하는 것은 설계 자체에 문제가 있는 것이다. 상위 클래스와 하위 클래스로 쪼개거나 Validation을 사용하는 등 다른 방법으로 구현하자.
- Optional을 리턴하는 메서드에서 null을 리턴하지 말자.

  ⇒ null 대신 `Optional.empty()` 를 사용하여 비어있는 상태의 Optional을 반환하자.

- 프리미티브 타입용 Optional이 따로 있다. ⇒ OptionalInt, OptionalLong, …

  `Optional.of()`를 사용하는 것은 내부적으로 박싱, 언박싱이 이루어지기 때문에 권장하지 않으며 프리미티브 타입용 Optional을 사용해서 `OptionalInt.of()`, `OptionalLong.of()` 등과 같은 방법으로 사용하기를 권장한다.

- Collection, Map, Stream Array, Optional은 Optional로 감싸지 말자.

## Optional API

스트림을 사용할 때도 Optional을 리턴하는 오퍼레이션이 몇 개 있는데, 그 중 아래 코드를 활용하여 Optional을 살펴보려한다.

```java
Optional<OnlineClass> spring = springClasses.stream()
        .filter(onlineClass -> onlineClass.getTitle().startsWith("spring"))
        .findFirst();
```

### Optional에 값이 있는지 없는지 확인하기

- isPresent() : 값이 있는지 확인
- isEmpty() : 값이 없는지 확인
- e.g. springClasses의 강의 중 title이 “spring”으로 시작하는 첫 번째 값 존재 여부 확인

    ```java
    // Optional에 값이 있는지 없는지 확인
    System.out.println(spring.isPresent()); // true
    System.out.println(spring.isEmpty()); // false
    ```


### Optional 값 가져오기

- get()

    ```java
    OnlineClass onlineClass = spring.get();
    System.out.println(onlineClass.getTitle()); // spring boot 출력
    ```

  get()을 사용해 비어 있는 Optional에서 값을 가져오려고 하면 `runtime exception`이 발생한다. ⇒ 가끔적이면 get()을 사용하지 않고 **아래 방법들을 사용하자**

- ifPresent(Consumer) : Optional에 값이 있는 경우 수행

    ```java
    spring.ifPresent(oc -> System.out.println(oc.getTitle())); // spring boot 출력
    ```

- orElse(T) : Optional에 값이 없는 경우 `특정 값` 을 반환

  Optional에 값이 있는 경우에도 실행은 되며 반환이 되지 않음

    ```java
    Optional<OnlineClass> jpa = springClasses.stream()
            .filter(onlineClass -> onlineClass.getTitle().startsWith("jpa"))
            .findFirst();
    
    OnlineClass jpaClass = jpa.orElse(createNewClass()); // create new online class 출력
    System.out.println(jpaClass.getTitle()); // new class 출력
    
    OnlineClass onlineClass = spring.orElse(createNewClass()); // create new online class 출력
    System.out.println(onlineClass.getTitle()); // spring boot 출력
    ```

- orElseGet(Supplier) : Optional에 값이 없는 경우에만 수행

    ```java
    OnlineClass onlineClass1 = spring.orElseGet(OptionalPractice::createNewClass);
    System.out.println(onlineClass1.getTitle()); // spring boot 출력
    ```

- orElseThrow() : Optional에 값이 없는 경우 에러를 던짐

    ```java
    OnlineClass onlineClass2 = jpa.orElseThrow(IllegalArgumentException::new);
    System.out.println("Exception 발생했나요?"); // Exception이 터져서 수행 X
    ```


### Optional 값 걸러내기

- filter(Predicate)

  filter에 해당하면 값을 반환하고, 해당하지 않으면 비어있는 값을 반환함

    ```java
    Optional<OnlineClass> onlineClass2 = spring.filter(oc -> oc.getId() > 10);
    System.out.println(onlineClass2); // Optional.empty 출력
    ```


### Optional 값 변환하기

- map(Function)

  map 내부에 Optinoal이 존재하면 양파 껍질 까듯이 Optional을 꺼내야 함 ⇒ 불편

    ```java
    Optional<Optional<Progress>> progress = spring.map(OnlineClass::getProgress);
    Optional<Progress> progress1 = progress.orElseThrow();
    ```

- flatMap(Function)

  Optional 안에 들어있는 인스턴스가 Optional인 경우 꺼내서 저장 ⇒ 편리

    ```java
    Optional<Progress> progress2 = spring.flatMap(OnlineClass::getProgress);
    ```

  참고로 Stream에서 쓰는 flatMap은 input은 하나이지만 output이 여러 개인 상황에 사용므로, Optional의 flatMap과 다르다!

> 본 게시글은 [스프링 핵심 원리 - 기본편](https://www.inflearn.com/course/the-java-java8) 강의를 참고하여 작성되었습니다.
>
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.
>