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
  - H2 Database
  - Lombok
  - Spring Data JPA

강의에서는 MySQL을 사용하고 있는데, 여기서는 H2를 사용하도록 하겠습니다.

### 2.1.2. 스프링 배치 활성화

스프링 배치를 사용하기 위해서는 `@EnableBatchProcessing` 어노테이션을 추가해야 합니다.

```java
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

좀 더 자세히 알아보겠습니다. `@EnableBatchProcessing` 어노테이션 내부를 보면, `BatchConfigurationSelector` 클래스가 Import 되어 있는 것을 확인할 수 있습니다.

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(BatchConfigurationSelector.class)
public @interface EnableBatchProcessing {

	/**
	 * Indicate whether the configuration is going to be modularized into multiple application contexts. If true then
	 * you should not create any &#64;Bean Job definitions in this context, but rather supply them in separate (child)
	 * contexts through an {@link ApplicationContextFactory}.
	 *
	 * @return boolean indicating whether the configuration is going to be
	 * modularized into multiple application contexts.  Defaults to false.
	 */
	boolean modular() default false;

}
```

`BatchConfigurationSelector` 클래스는 `modular` 설정을 따로 하지 않으면, `SimpleBatchConfiguration` 클래스를 가장 먼저 설정합니다.

```java
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

`SimpleBatchConfiguration`는 


### 2.1.3. 스프링 배치 초기화 설정 클래스

스프링 배치와 관련된 설정 클래스는 `BatchAutoConfiguration`, `SimpleBatchConfiguration`, `BasicBatchConfigurer`, `JpaBatchConfigurer`로 총 네 가지입니다.

`BatchAutoConfiguration`은 스프링 배치가 초기화될 때 자동으로 실행되는 설정 클래스입니다. 이 클래스 내에는 Job을 수행하는 `JobLauncherApplicationRunner` 클래스가 포함되어 있으며, `JobLauncherApplicationRunner`는 Bean으로 생성됩니다.

```java
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

`SimpleBatchConfiguration`은 `JobBuilderFactory`와 `StepBuilderFactory`를 생성합니다.



`BatchConfigurerConfiguration` 내에 `BasicBatchConfigurer` 클래스와 `JpaBatchConfigurer` 클래스가 존재합니다.




## 2.2. Hello Spring Batch 시작하기






















## DB 스키마 생성 및 이해






























> 본 게시글은 [스프링 배치 - Spring Boot 기반으로 개발하는 Spring Batch](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%EB%B0%B0%EC%B9%98) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.

**추가로 참고한 내용**
- <https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/ApplicationRunner.html>
- <https://mangkyu.tistory.com/233>
- <https://zzang9ha.tistory.com/424>