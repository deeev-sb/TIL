# 4. Stream

## Stream

- 데이터를 담고 있는 저장소(컬렉션)이 아니다.
- 스트림이 처리하는 데이터 소스를 변경하지 않는다. ⇒ Funtional in nature

    ```java
    public class StreamPractice {
        public static void main(String[] args) {
            List<String> names = new ArrayList<>();
            names.add("kim");
            names.add("lee");
            names.add("park");
    
            Stream<String> stringStream = names.stream().map(String::toUpperCase);
            System.out.println("names = " + names); // names = [kim, lee, park]
        }
    }
    ```

- 스트림으로 처리하는 데이터는 오직 한 번만 처리한다.
- 무제한일 수도 있다 → Short circuit 메서드를 사용해서 제한 할 수 있다.
- 손쉽게 병렬 처리 가능하다.

### 스트림 파이프라인

- 0 또는 다수의 중개 오퍼레이션과 한 개의 종료 오퍼레이션으로 구성된다.
- 스프림의 데이터 소스는 오직 종료 오퍼레이션을 실행할 때만 처리한다.

### 중개 오퍼레이션

- Stream을 리턴한다.
- 근본적으로 lazy 하다.
    - 종료 오퍼레이션이 실행되기 전까지 중개 오퍼레이션은 실행을 하지 않으며, **정의만 된 상태**이다.

        ```java
        names.stream().map((s) -> {
            System.out.println(s);
            return s.toUpperCase();
        });
        ```

    - 아래와 같이 종료 오퍼레이션이 실행되어야 동작하기 때문에 lazy 하다고 표현

        ```java
        List<String> collect = names.stream().map((s) -> {
            System.out.println(s); // 종료 오퍼레이션이 있어야만 출력됨 -> kim, lee, park 순서대로 출력
            return s.toUpperCase();
        }).collect(Collectors.toList());
        System.out.println("collect = " + collect); // collect = [KIM, LEE, PARK]
        ```

- Stateless / Stateful 오퍼레이션으로 더 상세하게 구분 가능하다.
- filter, map, limit, skip, sorted, … 등이 있다.

### 종료 오퍼레이션

- Stream을 리턴하지 않는다.
- 스프림 파이프라인 내에 **단 하나만 존재**한다.
- collect, allMatch, count, forEach, min, max, … 등이 있다.

### 병렬 처리 비교

- 스트림을 사용하지 않은 경우
    - 아래와 같은 루프문을 병렬 처리하기가 어렵다.

      ⇒ 루프문을 특정 크기만큼 자르고 각각 병렬로 수행시킨 후 합치는 과정이 쉽지 않기 때문에 어렵다고 표현했다.

        ```java
        for(String name : names) {
            if (name.startsWith("k")) {
                System.out.println(name.toUpperCase()); // KIM 출력
            }
        }
        ```

- 스트림을 사용할 경우
    - stream() 대신 parallelStream() 을 사용하면 병렬로 처리된다.

        ```java
        collect = names.parallelStream().filter(name -> name.startsWith("k")).map(String::toUpperCase)
                .collect(Collectors.toList());
        collect.forEach(System.out::println); // KIM 출력
        ```

- 중간에 동작 중인 Thread를 출력하여 실제로 병렬 처리되는지 확인해보자.

  병렬 확인을 위해 위 코드와 다르게 filter로 제외했다.

    ```java
    collect = names.parallelStream().map((s) -> {
                System.out.println(s + " " + Thread.currentThread().getName());
                return s.toUpperCase();
            })
            .collect(Collectors.toList());
    collect.forEach(System.out::println);
    ```

  ⇒ 출력을 확인해보면 아래와 같이 `main`, `ForkJoinPool`을 통해 병렬 처리되고 있음을 확인할 수 있다.

    ```
    lee main
    park ForkJoinPool.commonPool-worker-5
    kim ForkJoinPool.commonPool-worker-19
    KIM
    LEE
    PARK
    ```

- parallelStream() 사용 시 주의할 점
    - 병렬 처리한다고 해서 **반드시 속도가 빨라지는 것은 아니다**.
    - 병렬 처리를 할 때, 스레드를 만들고 처리하는 비용이 들기 때문에 한 스레드에서 처리할 때가 더 빠른 경우가 있다.
    - 병렬 처리가 더 유용한 경우는 **대체로 데이터가 방대하게 많을 때**이며, 그 외의 경우에는 병렬 처리 적용 시 **성능 테스트**를 해보기를 권한다.

## Stream API

- 실습을 위한 사전 준비

  **StreamApiPractice**

    ```java
    public class StreamApiPractice {
        public static void main(String[] args) {
            List<OnlineClass> springClasses = new ArrayList<>();
            springClasses.add(new OnlineClass(1, "spring boot", true));
            springClasses.add(new OnlineClass(2, "spring data jpa", true));
            springClasses.add(new OnlineClass(3, "spring mvc", false));
            springClasses.add(new OnlineClass(4, "spring core", false));
            springClasses.add(new OnlineClass(5, "rest api development", false));
    
            List<OnlineClass> javaClasses = new ArrayList<>();
            javaClasses.add(new OnlineClass(6, "The Java, Test", true));
            javaClasses.add(new OnlineClass(7, "The Java, Code manipulation", true));
            javaClasses.add(new OnlineClass(8, "The Java, 8 to 11", false));
    
            List<List<OnlineClass>> onlineClasses = new ArrayList<>();
            onlineClasses.add(springClasses);
            onlineClasses.add(javaClasses);
        }
    }
    ```

  **OnlineClass**

    ```java
    public class OnlineClass {
        private Integer id;
        private String title;
        private boolean closed;
    
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
    }
    ```


### 걸러내기

- filter()
- e.g. “spring으로 시작하는” 수업 출력

    ```java
    springClasses.stream().filter(springClass -> springClass.getTitle().startsWith("spring"))
            .forEach(System.out::println);
    ```

  e.g. “close 되지 않은” 수업 출력

    ```java
    // 방법 1. 람다 사용
    springClasses.stream().filter(springClass -> !springClass.isClosed())
            .forEach(springClass -> System.out.println(springClass.getId()));
  
    // 방법 2. 메서드 레퍼런스와 static 메서드 사용
    springClasses.stream().filter(Predicate.not(OnlineClass::isClosed))
            .forEach(springClass -> System.out.println(springClass.getId()));
    ```


### 변경하기

- map() 또는 flatMap()
- e.g. “수업 이름만” 모아서 출력

    ```java
    springClasses.stream().map(OnlineClass::getTitle)
            .forEach(System.out::println);
    ```

  e.g. 두 수업 목록에 들어있는 모든 수업 아이디 출력

    ```java
    // flatMap 을 사용하면 리스트 내부에 있는 리스트들을 순서대로 꺼내서 stream 으로 실행
    onlineClasses.stream().flatMap(Collection::stream)
            .forEach(onlineClass -> System.out.println(onlineClass.getId()));
    ```


### 생성하기

- generate() 또는 iterate()
- e.g. 10부터 1씩 증가하는 무한 스트림 출력 → 출력을 멈추려면 강제로 멈춰야 함

    ```java
    Stream.iterate(10, i -> i + 1)
            .forEach(System.out::println);
    ```


### 제한하기

- limit(long) 또는 skip(long)
- e.g. 10부터 1씩 증가하는 무한 스트림 중 앞 10개 빼고 최대 10개 출력

    ```java
    Stream.iterate(10, i -> i + 1)
            .skip(10)
            .limit(10)
            .forEach(System.out::println); // 20부터 29까지 출력
    ```


### 스트림에 있는 데이터 조건 만족 확인

- anyMacth() : 일부 데이터가 조건에 만족한다.
- allMatch() : 데이터 전부 조건에 만족한다.
- nonMatch() : 데이터 전부 조건에 불만족한다.
- e.g. 자바 수업 중 Test가 들어있는 수업이 있는지 확인

    ```java
    boolean isIncludeTest = javaClasses.stream().anyMatch(javaClass -> javaClass.getTitle().contains("Test"));
    System.out.println(isIncludeTest); // true 출력
    ```


### 개수 세기

- count()

### 스트림을 데이터 하나로 뭉치기

- reduce(identity, BiFunction), collect(), sum(), max()
- e.g. 스프링 수업 중 제목에 spring이 들어간 제목만 모아서 List 만들기

    ```java
    List<String> titles = springClasses.stream()
            .filter(springClass -> springClass.getTitle().contains("spring"))
            .map(OnlineClass::getTitle)
            .collect(Collectors.toList());
    System.out.println(titles);
    ```

  순서에 따라 다음 오퍼레이터에 지나가는 타입이 변경되기 때문에, 작성 시 순서에 유의하자