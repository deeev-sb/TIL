# 01. 스프링 배치 소개

## 1.1. 개요

### 1.1.1. 스프링 배치 탄생 배경

자바에는 I/O, Network(TCP, UDP, IP), Thread, JDBC 등 여러 가지 표준 기술이 있으며, 이는 JSR(Java Specification Request)에 정의되어 있습니다.
그런데 **자바 기반 표준 배치 기술은 존재하지 않습니다.** 그로 인해 배치 처리에서 요구하는 재사용 가능한 자바 기반 배치 아키텍처 표준의 필요성이 대두되었습니다.
이러한 배경에서 탄생하게 된 것이 스프링 배치입니다.

스프링 배치는 SpringSource(현재 Pivotal)과 Accenture이 협력하여 만든 프레임워크입니다. Accenture는 배치 아키텍처를 구현하면서 쌓은 기술적인 경험과 노하우를 가지고 있었으며, 이를 기반으로 SpringSource에서 스프링 프레임워크를 합쳐 만든 것이 스프링 배치입니다. 그래서 스프링 배치는 스프링의 특성인 DI, AOP, 서비스 추상화 등을 그대로 가지고 있습니다.

### 1.1.2. 배치 핵심 패턴

일반적으로 배치 프로그램은 다음과 같은 패턴으로 이루어져 있습니다.

![image](https://github.com/Kim-SuBin/spring-batch/assets/46712693/a2b9c7e4-a7fb-46d7-a136-5a10d1456495)

- Read : 데이터베이스, 파일, 큐에서 다량의 데이터를 조회
- Process : 데이터 가공
- Write : 가공된 데이터를 저장

이러한 배치 프로그램의 패턴은 데이터베이스의 ETL과 유사합니다. ETL이란 Extract, Transform, Load의 앞 글자를 딴 용어이며, 데이터를 추출, 변환, 적재한다는 의미입니다. ETL과 배치 프로그램의 패턴을 비교하면 다음과 같습니다.

|배치 핵심 패턴|데이터베이스 ETL|
|:---:|:---:|
|Read|Extract|
|Process|Transform|
|Write|Load|

### 1.1.3. 배치 시나리오

스프링 배치는 다음과 같은 비즈니스 시나리오를 가집니다.

-  배치 프로세스를 주기적으로 커밋
   - 스프링 배치에서는 최소한의 자원으로 최대한의 성능을 내는 커밋 전략 제공합니다.
-  동시 다발적인 Job의 배치, 대용량 병렬 처리
   - 여러 개의 Job을 동시에 실행합니다. 이 때, Job 간의 간섭은 없어야 합니다.
   - 대용량인 경우 multithread를 통해 병렬 처리를 합니다.
-  실패 후 수동 또는 스케줄링에 의한 재시작
-  의존 관꼐가 있는 step 여러 개를 순차적으로 처리
-  조건적 Flow 구성을 통한 체계적이고 유연한 배치 모델 구성
-  반복, 재시도, skip 처림

## 1.2. 아키텍처

스프링 배치는 Application, Batch Core, Batch Infrastructure라는 3개의 레이어로 구성되어 있습니다.

![](https://docs.spring.io/spring-batch/docs/4.3.x/reference/html/images/spring-batch-layers.png)

- Application
  - 일반적으로 배치 Job을 구성하는 애플리케이션 프로그램
  - 스프링 배치 프레임워크를 통해 개발자가 만든 모든 배치 Job과 커스텀 코드를 포함
  - 개발자는 업무 로직의 구현에만 집중하고 공통적인 기반 기술은 프레임워크가 담당 ⇒ 개발자는 더 생상성 높고 효율적으로 배치 생성 가능!
- Batch Core
  - Job 실행, 모니터링, 관리하는 API로 구성
  - JobLuncher, Job, Step, Flow 등
- Batch InfraStructure
  - Application과 Batch Core가 빌드되는 위치
  - Job 실행의 흐름과 처리를 위한 틀을 제공
  - Read, Processor Writer, Skip, Retry 등

> 본 게시글은 [스프링 배치 - Spring Boot 기반으로 개발하는 Spring Batch](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%EB%B0%B0%EC%B9%98) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.

**추가로 참고한 내용**

- <https://docs.spring.io/spring-batch/docs/4.3.x/reference/html/spring-batch-intro.html#spring-batch-intro>
- <https://blog.naver.com/PostView.naver?blogId=mygoaway&logNo=222693490644>
- <https://www.databricks.com/kr/glossary/extract-transform-load>