# 02. 스프링 배치 시작

## 2.1. 프로젝트 구성 및 의존성 설정

### 2.1.1. 프로젝트 구성

먼저 스프링 배치 프로젝트를 생성합니다. 인텔리제이에서 바로 생성해도 되고, Spring initializr(`start.spring.io`)를 사용해도 됩니다.
프로젝트는 다음과 같은 스펙으로 생성했습니다.

- Java 11
- Maven
- Packaging : Jar
- Spring : 2.7.17
- Dependency
  - Spring Batch
  - Lombok
  - Spring Data JPA
  - H2 Database
  - MySQL


### 2.1.2. 스프링 배치 활성화

스프링 배치를 사용하기 위해서는 `@EnableBatchProcessing` 어노테이션을 추가해야 합니다.

```java{2}
@SpringBootApplication
@EnableBatchProcessing
public class SpringBatchApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBatchApplication.class, args);
    }

}
```

`@EnableBatchProcessing` 어노테이션이 선언되면 스프링 배치와 관련된 설정 클래스를 실행시키며, 스프링 배치의 모든 초기화 및 실행 구성이 이루어집니다.
그리고 스프링 부트 배치의 자동 설정 클래스가 실행되며, 빈으로 등록된 모든 Job을 검색하여 초기화 및 Job 수행을 동시에 하도록 구성되어 있습니다.

좀 더 자세히 알아보겠습니다. `@EnableBatchProcessing` 어노테이션 내부를 보면 `BatchConfigurationSelector` 클래스가 Import 되어 있는 것을 확인할 수 있습니다.

```java{4}
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(BatchConfigurationSelector.class)
public @interface EnableBatchProcessing {

	boolean modular() default false;

}
```

`BatchConfigurationSelector` 클래스는 `modular` 설정을 따로 하지 않으면, `SimpleBatchConfiguration` 클래스를 가장 먼저 설정합니다.

```java{17}
public class BatchConfigurationSelector implements ImportSelector {

	@Override
	public String[] selectImports(AnnotationMetadata importingClassMetadata) {
		Class<?> annotationType = EnableBatchProcessing.class;
		AnnotationAttributes attributes = AnnotationAttributes.fromMap(importingClassMetadata.getAnnotationAttributes(
				annotationType.getName(), false));
		Assert.notNull(attributes, String.format("@%s is not present on importing class '%s' as expected",
				annotationType.getSimpleName(), importingClassMetadata.getClassName()));

		String[] imports;
		if (attributes.containsKey("modular") && attributes.getBoolean("modular")) {
			imports = new String[] { ModularBatchConfiguration.class.getName() };
		}
		else {
			imports = new String[] { SimpleBatchConfiguration.class.getName() };
		}

		return imports;
	}

}
```

`SimpleBatchConfiguration`는 배치 초기화 설정 클래스입니다. `SimpleBatchConfiguration` 외에 또 어떤 클래스들이 있는지 살펴보도록 하겠습니다.

### 2.1.3. 스프링 배치 초기화 설정 클래스

스프링 배치 초기화 설정 클래스는 `SimpleBatchConfiguration`, `BasicBatchConfigurer`, `JpaBatchConfigurer`, `BatchAutoConfiguration`로 총 네 가지입니다. 스프링 배치 초기화 실행 순서는 아래와 같습니다.

<img width="140" src="https://github.com/Kim-SuBin/TIL/assets/46712693/ba70b680-bcfa-4ced-8014-b376104d3753" alt="image">

### 2.1.3.1. SimpleBatchConfiguration

`SimpleBatchConfiguration` 클래스는 `AbstractBatchConfiguration` 추상 클래스를 상속 받습니다.

```java{2}
@Configuration(proxyBeanMethods = false)
public class SimpleBatchConfiguration extends AbstractBatchConfiguration {
    // ..
}
```

`AbstractBatchConfiguration` 추상 클래스는 `JobBuilderFactory`와 `StepBuilderFactory`를 생성합니다.

```
@Configuration(proxyBeanMethods = false)
@Import(ScopeConfiguration.class)
public abstract class AbstractBatchConfiguration implements ImportAware, InitializingBean {

	@Autowired(required = false)
	private DataSource dataSource;

	private BatchConfigurer configurer;

	private JobRegistry jobRegistry = new MapJobRegistry();

	private JobBuilderFactory jobBuilderFactory;

	private StepBuilderFactory stepBuilderFactory;

    // ...
}
```

그리고 `SimpleBatchConfiguration` 클래스는 `createLazyProxy()` 메서드를 통해 알 수 있듯 스프링 배치의 주요 구성 요소를 프록시 객체로 생성합니다.

```java
@Configuration(proxyBeanMethods = false)
public class SimpleBatchConfiguration extends AbstractBatchConfiguration {

	// ...

	private <T> T createLazyProxy(AtomicReference<T> reference, Class<T> type) {
		ProxyFactory factory = new ProxyFactory();
		factory.setTargetSource(new ReferenceTargetSource<>(reference));
		factory.addAdvice(new PassthruAdvice());
		factory.setInterfaces(new Class<?>[] { type });
		@SuppressWarnings("unchecked")
		T proxy = (T) factory.getProxy();
		return proxy;
	}
}
```

### 2.1.3.2. BasicBatchConfigurer 및 JpaBatchConfigurer

`BatchConfigurerConfiguration` 내에 `BasicBatchConfigurer` 클래스와 `JpaBatchConfigurer` 클래스가 존재합니다.

```java
@ConditionalOnClass(PlatformTransactionManager.class)
@ConditionalOnBean(DataSource.class)
@ConditionalOnMissingBean(BatchConfigurer.class)
@Configuration(proxyBeanMethods = false)
class BatchConfigurerConfiguration {

	@Configuration(proxyBeanMethods = false)
	@ConditionalOnMissingBean(name = "entityManagerFactory")
	static class JdbcBatchConfiguration {

		@Bean
		BasicBatchConfigurer batchConfigurer(BatchProperties properties, DataSource dataSource,
				@BatchDataSource ObjectProvider<DataSource> batchDataSource,
				ObjectProvider<TransactionManagerCustomizers> transactionManagerCustomizers) {
			return new BasicBatchConfigurer(properties, batchDataSource.getIfAvailable(() -> dataSource),
					transactionManagerCustomizers.getIfAvailable());
		}

	}

	@Configuration(proxyBeanMethods = false)
	@ConditionalOnClass(EntityManagerFactory.class)
	@ConditionalOnBean(name = "entityManagerFactory")
	static class JpaBatchConfiguration {

		@Bean
		JpaBatchConfigurer batchConfigurer(BatchProperties properties, DataSource dataSource,
				@BatchDataSource ObjectProvider<DataSource> batchDataSource,
				ObjectProvider<TransactionManagerCustomizers> transactionManagerCustomizers,
				EntityManagerFactory entityManagerFactory) {
			return new JpaBatchConfigurer(properties, batchDataSource.getIfAvailable(() -> dataSource),
					transactionManagerCustomizers.getIfAvailable(), entityManagerFactory);
		}

	}

}
```

`BasicBatchConfigurer` 클래스는 `SimpleBatchConfiguration` 클래스에서 생성한 프록시 객체의 실제 대상 객체를 생성하는 설정 클래스입니다.
`BasicBatchConfigurer` 클래스를 빈으로 의존성 주입을 받아서 주요 객체들을 참조해 사용할 수 있습니다.

`JpaBatchConfigurer` 클래스는 JPA 관련 객체를 생성하는 설정 클래스이며, `BasicBatchConfigurer` 상속 받아 구현되었습니다.

```java
public class JpaBatchConfigurer extends BasicBatchConfigurer {
	// ...
}
```

`BasicBatchConfigurer` 클래스와 `JpaBatchConfigurer` 클래스는 `BatchConfigurer` 인터페이스를 구현한 것입니다. 즉, `BatchConfigurer` 인터페이스를 사용자 정의 클래스로 구현하여 사용할 수도 있다는 의미입니다.

### 2.1.3.3. BatchAutoConfiguration

`BatchAutoConfiguration`은 스프링 배치가 초기화될 때 자동으로 실행되는 설정 클래스입니다. 이 클래스 내에는 Job을 수행하는 `JobLauncherApplicationRunner` 클래스가 포함되어 있으며, `JobLauncherApplicationRunner`는 Bean으로 생성됩니다.

```java{13}
@AutoConfiguration(after = HibernateJpaAutoConfiguration.class)
@ConditionalOnClass({ JobLauncher.class, DataSource.class })
@ConditionalOnBean(JobLauncher.class)
@EnableConfigurationProperties(BatchProperties.class)
@Import({ BatchConfigurerConfiguration.class, DatabaseInitializationDependencyConfigurer.class })
public class BatchAutoConfiguration {

	@Bean
	@ConditionalOnMissingBean
	@ConditionalOnProperty(prefix = "spring.batch.job", name = "enabled", havingValue = "true", matchIfMissing = true)
	public JobLauncherApplicationRunner jobLauncherApplicationRunner(JobLauncher jobLauncher, JobExplorer jobExplorer,
			JobRepository jobRepository, BatchProperties properties) {
		JobLauncherApplicationRunner runner = new JobLauncherApplicationRunner(jobLauncher, jobExplorer, jobRepository);
		String jobNames = properties.getJob().getNames();
		if (StringUtils.hasText(jobNames)) {
			runner.setJobNames(jobNames);
		}
		return runner;
	}

    // ...
}
```

`JobLauncherApplicationRunner`는 `ApplicationRunner` 인터페이스를 구현한 클래스이기 때문에 `ApplicationRunner`와 동일하게 스프링 애플리케이션이 구동된 후 실행됩니다.

```java
public class JobLauncherApplicationRunner implements ApplicationRunner, InitializingBean, Ordered, ApplicationEventPublisherAware {
    // ...
}
```

## 2.2. Hello Spring Batch 시작하기

이번에는 코드를 통해 Spring Batch Job을 실제로 어떻게 구현하는지에 대해 살펴보도록 하겠습니다.

```java
@RequiredArgsConstructor
@Configuration
public class HelloJobConfiguration {

    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;

    @Bean
    public Job helloJob() {
        return jobBuilderFactory.get("helloJob")
                .start(helloStep1())
                .next(helloStep2())
                .build();
    }

    @Bean
    public Step helloStep1() {
        return stepBuilderFactory.get("helloStep1")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("=====================");
                        System.out.println(">> Hello Spring Batch!!!");
                        System.out.println("=====================");

                        return RepeatStatus.FINISHED;
                    }
                })
                .build();
    }


    @Bean
    public Step helloStep2() {
        return stepBuilderFactory.get("helloStep2")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {

                        System.out.println("=====================");
                        System.out.println(">> Start Step2!!!");
                        System.out.println(">> ==================");

                        return RepeatStatus.FINISHED; // 한 번만 실행 후 종료 라는 의미. 설정 하지 않으면 Task를 무한 반복함.
                    }
                })
                .build();
    }
}
```

코드를 하나씩 뜯어서 살펴보도록 하겠습니다.

`@Configuration` 애노테이션을 선언하면 하나의 배치 Job을 정의하고 빈으로 설정합니다.

```java
@Configuration
public class HelloJobConfiguration {
	// ...
}
```

`JobBuilderFactory` `StepBuilderFactory`를 Lombok과 final을 사용해 생성자 주입으로 의존성을 추가한 것을 확인할 수 있습니다. 이 두 가지는 스프링 배치에서 Job을 쉽게 구성할 수 있도록 제공하는 유틸입니다. `JobBuilderFactory`는 Job을 생성하는 빌더 팩토리이고, `StepBuilderFactory`는 Step을 생성하는 빌더 팩토리입니다.

```java
@RequiredArgsConstructor
@Configuration
public class HelloJobConfiguration {

    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;

	// ...
}
```

Job 객체는 다음과 같은 방식으로 생성합니다. `jobBuilderFactory.get()`에는 생성할 Job 이름을 추가합니다. `start`와 `next`에는 인자로 step 객체를 넣고 있으며, `start`, `next`는 step을 실행하는 순서입니다.

```java
public class HelloJobConfiguration {

    // ...

    @Bean
    public Job helloJob() {
        return jobBuilderFactory.get("helloJob")
                .start(helloStep1())
                .next(helloStep2())
                .build();
    }

	// ...
}
```

Step 객체는 다음과 같은 방식으로 구현하며, Job 객체와 유사하게 `stepBuilderFactory.get()`에 Step 이름을 설정합니다. 그 다음 `tasklet()`에 실제로 작업할 내용을 작성합니다. 이 때, `RepeatStatus.FINISHED`를 `return`하여 작업이 단 한 번만 수행되도록 설정합니다. 이렇게 하지 않으면 `tasklet()`은 무한 반복합니다.

```java
public class HelloJobConfiguration {

    // ...

	@Bean
    public Step helloStep1() {
        return stepBuilderFactory.get("helloStep1")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("=====================");
                        System.out.println(">> Hello Spring Batch!!!");
                        System.out.println("=====================");

                        return RepeatStatus.FINISHED;
                    }
                })
                .build();
    }
	// ...
}
```

`tasklet()`은 기본적으로 익명 내부 클래스로 작성이 되는데, 이를 좀 더 간결하게 람다 표현식을 사용해 작성할 수도 있습니다.

```java
public class HelloJobConfiguration {

    // ...

    @Bean
    public Step helloStep1() {
        return stepBuilderFactory.get("helloStep1")
                .tasklet((contribution, chunkContext) -> {
                    System.out.println("=====================");
                    System.out.println(">> Hello Spring Batch!!!");
                    System.out.println("=====================");

                    return RepeatStatus.FINISHED;
                })
                .build();
    }

	// ...
}
```

정리하면 Job은 다음과 같은 구조로 이루어져 있으며, **Job 구동 → Step 실행 → Tasklet 실행** 순서로 Job이 실행됩니다.
그리고 Job 내에는 여러 Step이 존재할 수 있으며, Step 내에는 단 하나의 Tasklet만 존재할 수 있습니다.
만약 Step 내에 여러 개의 Tasklet을 생성하면 마지막 Tasklet만 동작합니다.

<img width="500" src="https://github.com/Kim-SuBin/TIL/assets/46712693/c78f56b5-d95a-4dfc-81f3-4d0502dc46b5" alt="image">

## 2.3. DB 스키마 생성 및 이해

스프링 배치는 실행 및 관리를 위한 목적으로 여러 도메인(Job, Step, JobParameters, ...)의 정보들을 저장 및 업데이트하고 조회할 수 있는 스키마를 제공합니다.
과거, 현재의 실행에 대한 세세한 정보, 실행에 대한 성공과 실패 여부 등과 같은 **스프링 배치 메타 데이터**를 관리할 수 있어 리스크 발생 시 빠른 대처가 가능합니다.
그리고 DB와 연동을 하면 필수적으로 메타 테이블이 생성되어야 합니다.
어떤 DB에 대한 스키마를 제공하는지는 `/org/springframework/batch/core/schema-*.sql`을 확인하면 됩니다.

<img width="247" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/8ce75b69-7866-4ef1-9ff3-955be1677c21">

### 2.3.1. 스키마 생성 설정

스키마를 생성하는 방법은 수동 생성과 자동 생성이 있습니다.
**수동 생성**은 쿼리를 복사한 다음 직접 실행하는 것입니다.
그리고 **자동 생성**은 `spring.batch.jdbc.initialize-schema` 설정을 properties에 추가하면 됩니다.
자동 생성은 다음과 같이 세 가지 속성을 가집니다.

1. ALWAYS
   - 스크립트를 항상 실행
   - RDBMS 설정이 되어 있을 경우 내장 DB보다 우선적으로 실행
2. EMBEDDED : 내장 DB일 때만 실행되며 스키마가 자동 생성됨. (default)
3. NEVER
   - 스크립트를 항상 실행 안함
   - 내장 DB일 경우 스크립트가 생성이 안되기 때문에 오류 발생

운영 환경에서는 속성을 NEVER로 설정한 다음, 수동으로 스크립트를 생성하는 것을 권장합니다.

### 2.3.2. DB 스키마

스프링 배치 메타 데이터를 통해 생성되는 DB 스키마는 다음과 같습니다.

<img width="500" src="https://docs.spring.io/spring-batch/docs/3.0.x/reference/html/images/meta-data-erd.png" alt="image">

`BATCH_JOB_INSTANCE`, `BATCH_JOB_EXCUTION`, `BATCH_JOB_EXECUTION_PARAMS`, `BATCH_JOB_EXECUTION_CONTEXT`는 Job과 관련된 스키마이고, `BATCH_STEP_EXECUTION`, `BATCH_STEP_EXECUTION_CONTEXT`는 Step과 관련된 스키마입니다.

















> 본 게시글은 [스프링 배치 - Spring Boot 기반으로 개발하는 Spring Batch](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%EB%B0%B0%EC%B9%98) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.

**추가로 참고한 내용**

- <https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/ApplicationRunner.html
- <https://mangkyu.tistory.com/233>
- <https://zzang9ha.tistory.com/424>
- <https://docs.spring.io/spring-batch/docs/3.0.x/reference/html/metaDataSchema.html