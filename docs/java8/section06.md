# 6. Date와 Time

## Date와 Time API 소개

### 자바 8에서 새로운 날짜와 시간 API 생긴 이유

- 그 전까지 사용하던 java.util.Date 클래스는 mutable 하기 때문에 thread safe 하지 않다.

  ⇒ setTime을 하면 날짜가 바뀌기 때문에 mutable하며, 이렇게 mutable한 객체는 multithread 환경에서 안전하게 쓰기 어렵다.

    ```java
    Thread.sleep(1000 * 3); // 3초간 재움
    Date after3Seconds = new Date(); // 현재 시간 가져옴
    System.out.println(after3Seconds); // Sat Feb 18 10:32:17 KST 2023
    after3Seconds.setTime(time); // 이전 시간으로 값 변경 가능 => mutable함
    System.out.println(after3Seconds); // Sat Feb 18 10:32:14 KST 2023
    ```

- 클래스 이름이 명확하지 않다.

  ⇒ Date인데 시간까지 다룬다.

    ```java
    Date date = new Date();
    long time = date.getTime();
    System.out.println(date); // Sat Feb 18 10:27:29 KST 2023
    System.out.println(time); // 1676683649115
    ```

- 버그가 발생할 여지가 많다.

  Date에서 getTime()은 long 타입인데 Calendar에서 getTime()은 Date인 것처럼 타입 안정성이 없고, 월이 0부터 시작하는 등의 문제가 있다.

    ```java
    // 1월이 0이므로, 3월은 2라고 써야 함.
    Calendar myBirthDay = new GregorianCalendar(1998, 2, 20); // 1998.03.20
    System.out.println(myBirthDay.getTime()); // Fri Mar 20 00:00:00 KST 1998
    
    // 그래서 숫자 대신 Calendar.MARCH 이렇게 쓰는 게 좋음.
    myBirthDay = new GregorianCalendar(1998, Calendar.MARCH, 20);
    System.out.println(myBirthDay.getTime()); // Fri Mar 20 00:00:00 KST 1998
    ```

- 날짜 시간 처리가 복잡한 애플리케이션에서는 보통 Joda Time을 쓰곤 했다.

### 자바 8에서 제공하는 Date-Time API

- JSR-310 스팩의 구현체를 제공한다.
- 디자인 철학
    - Clear

      → API를 명확히 구분한다. (getTime() 시 time 정보가 나오고, getDate()  시 date 정보가 나오는 등…)

    - Fluent

      → null 을 리턴하거나 받지 않기 때문에 다양하게 연결하여 쓸 수 있어 유연하다.

    - Immutable

      → 날짜를 변경하면 기존의 인스턴스가 바뀌는 것이 아닌 새로운 인스턴스를 반환한다.

    - Extensible

      → 다양한 커스텀 달력을 만들 수 있는 확장성이 있다.


### 주요 API

- 기계용 시간(machine time)과 인류용 시간(human time)으로 나눌 수 있다.
- 기계용 시간은 EPOCK부터 현재까지의 타임스탬프를 표현한다.
- 인류용 시간은 우리가 흔히 사용하는 연,월,일,시,분,초 등을 표현한다.
- 타임스탬프는 Instant를 사용한다.
- 특정 날짜(LocalDate), 시간(LocalTime), 일시(LocalDateTime)를 사용할 수 있다.
- 기간을 표현할 때는 Duration(시간 기반)과 Period(날짜 기반)를 사용할 수 있다.
- DateTimeFormatter를 사용해서 일시를 특정한 문자열로 포맷팅할 수 있다.

## Date와 Time API 사용해보기

### 지금 이 순간을 기계 시간으로 표현하는 방법

- Instant.now() : 현재 UTC(GMT, 기준시)를 리턴

  Universal Time Coordinated == Grenwich Mean Time

    ```java
    Instant instant = Instant.now();
    System.out.println(instant); // 기준시 UTC, GMT : 2023-02-18T02:15:49.144563Z
    System.out.println(instant.atZone(ZoneId.of("UTC"))); // 2023-02-18T02:15:49.144563Z[UTC]
    ```

- 현재 위치의 시간을 나타내는 방법

    ```java
    ZoneId zone = ZoneId.systemDefault();
    System.out.println(zone); // Asia/Seoul
    ZonedDateTime zonedDateTime = instant.atZone(zone);
    System.out.println(zonedDateTime); // 2023-02-18T11:15:49.144563+09:00[Asia/Seoul]
    ```


### 인류용 일시를 표현하는 방법

- LocalDateTime.now() : 현재 시스템 Zone에 해당하는 (로컬) 일시 리턴

    ```java
    LocalDateTime now = LocalDateTime.now();
    System.out.println(now); // 2023-02-18T11:18:30.148366
    ```

- LocalDateTime.of(int, Month, int, int, int, int) : 로컬의 특정 일시 리턴

    ```java
    LocalDateTime birthDay = LocalDateTime.of(1998, Month.MARCH, 20, 18, 30, 0);
    System.out.println(birthDay); // 1998-03-20T18:30
    ```

- ZonedDateTime.of(int, Month, int, int, int, int, ZoneId) : 특정 Zone의 특정 일시 리턴

    ```java
    // 특정 존의 현재 시간 출력
    ZonedDateTime nowInUTC = ZonedDateTime.now(ZoneId.of("UTC"));
    System.out.println(nowInUTC); // 2023-02-18T02:23:04.792204Z[UTC]
    ```


### 기간을 표현하는 방법

- Period : 날짜 비교 - 인류용 시간 비교

    ```java
    LocalDate today = LocalDate.now();
    LocalDate lastDay = LocalDate.of(2023, Month.FEBRUARY, 28);
    Period period = Period.between(today, lastDay);
    System.out.println(period.getDays()); // 10 -> 2월 마지막날까지 10일 남음
    // 다른 방법
    Period until = today.until(lastDay);
    System.out.println(until.get(ChronoUnit.DAYS)); // 10
    ```

- Duration : 시간 비교 - 기계용 시간 비교

    ```java
    Instant nowInstant = Instant.now();
    Instant plus = nowInstant.plus(10, ChronoUnit.SECONDS); // now에 10 더함
    Duration between = Duration.between(nowInstant, plus);
    System.out.println(between.getSeconds()); // 10
    ```


### Formatting, Parsing

- 문자열로 변경할 때 쓸 수 있는 formatting
- 미리 정의해 둔 포맷이 있을 사용할 수도 있고, 직접 만들어 쓸 수도 있음

    ```java
    LocalDateTime nowDateTime = LocalDateTime.now();
    DateTimeFormatter MMddyyyy = DateTimeFormatter.ofPattern("MM/dd/yyyy"); // 커스텀 포맷
    System.out.println(nowDateTime.format(MMddyyyy)); // 02/18/2023
    ```

- LocalDateTime.parse(String, DateTimeFormatter);

    ```java
    LocalDate parse = LocalDate.parse("03/20/1998", MMddyyyy);
    System.out.println(parse); // 1998-03-20
    ```


### 레거시 API 지원

- toInstant()를 붙일 수 있는 레거시 API는 호환된다.

    ```java
    Date date = new Date();
    Instant dateInstant = date.toInstant(); // toInstant()로 레거시한 date를 Instant로 변경
    System.out.println(dateInstant); // 2023-02-18T02:46:32.869Z
    Date newDate = Date.from(dateInstant); // 반대로 Instant를 date로 변경할 수도 있음
    System.out.println(newDate); // Sat Feb 18 11:46:32 KST 2023
    
    // GregorianCalendar를 LocalDateTime으로 변경 (toInstant를 붙일 수 있다면 레거시를 다 변경 가능함!)
    GregorianCalendar gregorianCalendar = new GregorianCalendar();
    LocalDateTime dateTime = gregorianCalendar.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    System.out.println(dateTime); // 2023-02-18T11:46:32.921
    // GregorianCalendar를 ZoneDateTime으로 변경할 수도 있고, 그 반대의 경우도 가능
    ZonedDateTime zonedDT = gregorianCalendar.toInstant().atZone(ZoneId.systemDefault());
    GregorianCalendar from = GregorianCalendar.from(zonedDT);
    System.out.println(from.getTime()); // Sat Feb 18 11:46:32 KST 2023
    ```

- TimeZone과 ZoneId는 호환된다.