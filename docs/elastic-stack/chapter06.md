# 06. 로그스태시

::: tip ✅ 실습 환경

- Mac M1
- Elasticsearch 7.10.2
- Logstash 7.10.2
- Kibana 7.10.2
- Java 11

:::

## 6.1. 로그스태시 소개

로그스태시는 **플러그인 기반의 오픈소스 데이터 처리 파이프라인 도구**입니다.

로그스태시의 **특징**은 다음과 같습니다.

- 플러그인 기반
    - 로그스태시의 파이프라인을 구성하는 각 요소들은 전부 플러그인형태로 만들어져 있음
    - 기본으로 제공되는 플러그인 외에도 수많은 커뮤니티 플러그인 존재
    - 플러그인을 관리할 수 있는 기능도 제공
- 모든 형태의 데이터 처리
    - JSON, XML 등 구조화된 텍스트뿐만 아니라 다양한 형태의 데이터를 입력받아 가공 후 저장 가능
    - 시간에 따라 발생하는 데이터를 처리하는 데 최적화되어 있음
- 성능
    - 자체적으로 내장되어 있는 메모리와 파일 기반 큐를 사용하여 처리 속도와 안정성이 높음
    - 인덱싱할 도큐먼트의 수와 용량을 종합적으로 고려해 벌크 인덱싱 수행
    - 파이프라인 배치 크기 조정을 통해 병목현상 방지 및 성능 최적화
- 안정성
    - 장애 상황에 대응하기 위한 재시도 로직 내장
    - 오류가 발생한 도큐먼트를 따로 보관하는 데드 레터 큐 (dead letter queue) 내장
    - 파일 기반의 큐 사용 시, 장애 상황에서도 도큐먼트 유실 최소화 가능

## 6.2. 로그스태시 설치

책에서는 윈도우 환경에서 로그스태시를 설치하는 방법에 대해 설명하지만,
여기서는 윈도우 환경이 아닌 **Mac M1 환경에서 설치**할 예정입니다.
그리고 로그스태시 실행을 위해서는 Java 설치가 필요하며,
Java 설치 방법에 대한 설명은 생략하도록 하겠습니다.
Logstash에서 공식적으로 동작을 보증하는 환경이나 버전에 대해서는 [공식 홈페이지의 서포트 매트릭스](https://www.elastic.co/kr/support/matrix#matrix_os)를 확인하시길 바랍니다.

먼저, Ma1칩에서 x86 아키텍처의 소프트웨어를 실행할 있도록 해주는 `Rosetta`를 설치합니다.

```bash
softwareupdate --install-rosetta
```

그 다음 [공식 홈페이지](https://www.elastic.co/kr/downloads/past-releases/logstash-7-10-2)에서 `MACOS`를 다운로드 받습니다.

<img width="150" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/6889f062-d1df-4616-a956-e37e36576b10">

다운로드 받은 tar.gz 파일을 풀고 `logstash-7.10.2` 디렉터리로 이동합니다.

<img width="928" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/732785ee-8413-4857-91d8-942a569b0817">

그 다음 명령 프롬프트에서 아래 명령어를 통해 실행합니다.

```bash
./bin/logstash -e "input { stdin {}} output {stdout{}}"
```

위와 같이 -e 옵션을 사용하면 콘솔에서 직접 로그스태시 파이프라인을 설정할 수 있습니다.
여기서는 표준 입력(stdin)으로 전달받은 메시지를 다시 표준 출력(stdout)으로 표시하도록 구성했습니다.
일반적으로는 이렇게 사용하는 것이 아닌, 따로 설정 파일을 만들거나 config 폴더의 pipelines.yml에 기록합니다.

참고로, `--log.level` 설정을 통해 특정 로그 레벨 미만의 로그를 감출수도 있습니다.

```bash
./bin/logstash -e "input { stdin {}} output {stdout{}}" --log.level error
```

<img width="1119" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/746f4d61-b231-4443-bc7a-735cce76f216">

로그 레벨은 위에서 설정한 `error`를 포함하여 다음과 같이 6가지입니다.

| 로그 레벨 | 설명                                  |
|:-----:|:------------------------------------|
| fatal | 시스템 동작을 멈출 정도의 심각한 오류 발생 시 나타나는 로그들 |
| error | 시스템 동작을 멈추지 않지만 오류가 발생할 때 나타나는 로그들  |
| warn  | 잠재적인 오류를 포함하는 경고성 로그들               |
| info  | 진행 상황이나 상태 변경 등의 정보를 알기 위한 로그들      |
| debug | 개발 과정에서 디버깅을 하기 위한 로그들              |
| trace | 시스템 진행 과정 추적을 위한 로그들                |



## 6.3. 파이프라인

파이프라인은 **데이터를 입력 받아 실시간으로 변경하고 이를 다른 시스템에 전달하는 역할**을 하는 로그스태시의 핵심 기능입니다.
파이프라인은 **입력, 필터, 출력**이라는 세 가지 구성요소로 이루어지며, 입력과 출력은 필수이고 필터는 옵션입니다.

<img width="571" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/4450c0c6-771a-4b88-863c-98753d355bbc">

- 입력 : 소스로부터 데이터를 받아들이는 모듈
- 필터 : 입력으로부터 들어오는 데이터를 원하는 형태로 가공하는 모듈
- 출력 : 데이터를 외부로 전달하는 모듈

출력 예제를 살펴보기 위해 이전에 사용했던 명령어를 통해 로그 스태시를 실행해봅시다.

```bash
./bin/logstash -e "input { stdin {}} output {stdout{}}"
```

그 다음 `Hello World`를 타이핑하면 다음과 같이 출력되는 것을 확인할 수 있습니다.

<img width="320" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/5b28e205-a25f-47df-b68e-7a3ddcef4312">

로그스태시는 `JSON 형태로 데이터를 출력`하며,
`@version`이나 `@timestamp`와 같이 `@`가 붙어 있는 필드는 로그스태시가 만든 필드입니다.
`message`는 데이터를, `host`는 시스템 사용자를 나타냅니다.

지금처럼 간단한 파이프라인일 경우 콘솔에서 직접 작성할 수 있지만,
작업 이력 관리를 위해 **pipelines.yml이나 파이프라인 설정 파일**을 만들어 로그스태시를 동작하는 것이 좋습니다.

**파이프라인을 작성하는 기본 템플릿**은 다음과 같습니다.

```yaml
input {
  { 입력 플러그인 }
}

filter {
  { 필터 플러그인 }
}

output {
  { 출력 플러그인 }
}
```
파이프라인 구성 요소인 입력, 필터, 출력 내부에 플러그인을 지정할 수 있습니다.
용도나 형태에 맞춰 이미 만들어진 수많은 플러그인이 있기 때문에 필요한 기능을 지원하는 플러그인을 검색하여 템플릿에 추가하면 됩니다.

### 6.3.1. 입력

**소스 원본으로부터 데이터를 입력 받는 단계**이며, 직접 대상에 접근해 읽어 들이거나 서버를 열어놓고 받아들이는 형태로 구성합니다.

로그스태시는 다양한 형태의 데이터를 인식할 수 있고, 이를 위해 **다양한 입력 플러그인들이 존재**합니다.
**자주 사용하는 입력 플러그인**은 다음과 같습니다.

| 입력 플러그인 | 설명                                      |
|:-------:|:----------------------------------------|
|  file   | 리눅스의 tail -f 명령처럼 파일을 스트리밍하며 이벤트를 읽어 들임 |
| syslog  | 네트워크를 통해 전달되는 시스로그 수신                   |
|  kafka  | 카프카의 토픽에서 데이터를 읽어 들임                    |
|  jdbc   | JDBC 드라이버로 지정한 일정마다 쿼리를 실행해 결과를 읽어 들임   |

여러 플러그인 중 `file` 플러그인을 사용하여 실습을 진행해보도록 하겠습니다.

로그스태시가 설치된 config 폴더 내에 `test-logstash.conf`라는 이름의 설정 파일을 아래 내용을 포함해 생성합니다.

```yaml
input {
  file {
    path => "/Users/subin/WorkSpace/TIL/logstash-7.10.2/config/test-input.log"
    start_position => "beginning"
  }
}

output {
  stdout { }
}
```

파이프라인 설정은 입력으로 파일 플러그인을, 출력으로 표준 출력 플러그인을 사용했습니다.
파일 플러그인의 옵션인 `path`는 읽을 파일 위치를, `start_position`은 최초 파일을 발견했을 때 읽을 위치를 지정합니다.
여기서 `start_position`을 `beginning`으로 설정하여, 시작 부분부터 읽어들이도록 설정했습니다.

로그스태시에서 읽어올 `test-input.log` 파일은 다음과 같이 작성합니다.

```bash
[2023-06-07 17:54] [ID1] 192.10.2.6 9500 [INFO] -connected.
```

그 다음 로그스태시를 실행시켜봅시다.

```bash
./bin/logstash -f ./config/test-logstash.conf
```

여기서 `-f` 옵션은 설정 파일이나 폴더를 지정하는 옵션으로, 방금 만들었던 `test-logstash.conf` 파이프라인 설정을 사용합니다.
실행해보면 출력 플러그인의 stdout(표준 출력)에 의해 화면에 다음과 같은 결과가 보일 것입니다.

<img width="611" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/ae7b9ffc-ddf2-42e7-aeb4-b7f3f592e8f3">

### 6.3.2. 필터

필터는 **입력 플러그인이 받은 데이터를 의미 있는 데이터로 구조화하는 역할**을 합니다.
비정형 데이터를 정형화하고 데이터 분석을 위한 구조를 잡아줍니다.
즉, 로그스태시 필터를 이용하면 전반적인 데이터 정제/가공 작업을 수행할 수 있습니다.

자주 사용되는 필터 플러그인은 다음과 같습니다.

| 필터 플러그인 | 설명                                                                                                   |
|:-------:|:-----------------------------------------------------------------------------------------------------|
|  grok   | grok 패턴을 사용해 메시지를 구조화된 형태로 분석. grok 패턴은 일반적인 정규식과 유사하나, 추가적으로 미리 정의된 패턴이나 필드 이름 설정, 데이터 타입 정의 등을 도와줌 |
| dissect | 간단한 패턴을 사용해 메시지를 구조화된 형태로 분석. 정규식을 사용하지 않아 grok에 비해 자유도는 조금 떨어지지만 더 빠른 처리 가능                         |
| mutate  | 필드명을 변경하거나 문자열 처리 등 일반적인 가공 함수들을 제공                                                                  |
|  date   | 문자열을 지정한 패턴의 날짜형으로 분석                                                                                |

이전에 생성했던 `test-input.log` 파일 내용을 다음과 같이 수정해줍니다.

```bash
[2023-06-07 17:54] [ID1] 192.10.2.6 9500 [INFO] - connected.
[2023/06/08 22:15:23]   [ID2] 218.25.32.70 1070 [warn] - busy server.
```

그 다음 `test-logstsash.conf` 파일 내용을 아래와 같이 수정합니다.

```yaml
input {
  file {
    path => "/Users/subin/WorkSpace/TIL/logstash-7.10.2/config/test-input.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
  }
}

output {
  stdout { }
}
```

여기서 추가한 내용은 `sincedb_path => "/dev/null"` 입니다. `sincedb`는 파일을 어디까지 읽었는지 기록하는 파일입니다.
`start_position`은 파일을 불러들이는 최초 한 번만 적용되고 이후로는 추가된 내용에 대해서만 로그스태시로 불러들이는데,
이는 `sincedb`에 어디까지 읽었는지 기록되어 있기 때문입니다.
이러한 `sincedb_path`를 **null 파일로 지정하면 이전에 파일을 읽었던 기록이 없어** 로그 스태시를 실행할 때마다 start_position 위치부터 읽게 됩니다.
여기서는 파일의 맨 처음부터 읽게 되는 것입니다. 참고로, `Windows`는 `/dev/null` 대신 `nul`을 사용합니다.

방금 작성한 파이프라인을 실행해보면, 2개의 로그가 로그스태시를 통해 처리되었음을 확인할 수 있습니다.

<img width="654" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/b0448c9a-dd01-4efa-a7ad-5df523c26747">

#### 6.3.2.1. 문자열 자르기

데이터나 로그는 대부분 길이가 길기 때문에 원하는 결과를 추출하여 보는 것이 어렵습니다.
좀 더 쉽게 데이터를 분석하기 위해서는 원하는 형태로 분리해야 합니다.
여기서는 원하는 형태로 문자열을 자르는 방법에 대해 알아보려고 합니다.

필터 플러그인 중 하나인 **mutate 플러그인**의 split 옵션을 이용해 공백을 기준으로 문자열을 잘라봅시다.

```yaml
input {
  file {
    path => "/Users/subin/WorkSpace/TIL/logstash-7.10.2/config/test-input.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
  }
}

filter {
  mutate {
    split => {"message" => " "}
  }
}

output {
  stdout { }
}
```

위 파이프라인을 실행하면, 다음과 같이 문자열이 공백을 기준으로 잘린 것을 확인할 수 있습니다.

<img width="626" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/9e4f8a02-282d-4395-bb2e-49b341cd0a96">

mutate 플러그인은 split 외에도 **필드를 변형하는 다양한 기능**들을 제공합니다.
자주 사용하는 옵션은 다음과 같습니다.

| mutate 옵션 | 설명                                      |
|:----------|:----------------------------------------|
| split     | 쉼표(,)나 공백과 같은 구분 문자를 기준으로 문자열을 배열로 변환   |
| rename    | 필드 이름 변경                                |
| replace   | 해당 필드 값을 특정 값으로 변경                      |
| uppercase | 문자를 대문자로 변경                             |
| lowercase | 문자를 소문자로 변경                             |
| join      | 배열을 쉼표(,)나 공백 같은 구분 문자로 연결해 하나의 문자열로 합침 |
| gsub      | 정규식이 일치하는 항목을 다른 문자열로 대체                |
| merge     | 특정 필드를 다른 필드에 포함시킴                      |
| coerce    | null인 필드 값에 기본 값 추가                     |
| strip     | 필드 값의 좌우 공백 제거                          |

mutate는 많은 옵션이 있어서 **순서가 중요**하며, 다음과 같은 순서로 옵션이 적용됩니다.

coerce - rename - update - replace - convert - gsub - uppercase - capitalize - lowercase - strip - remove - split - join - merge - copy

이번에는 분리한 로그 중 id 값을 `message`와 같은 필드로 생성해보도록 하겠습니다.
그리고 사용했던 원본 데이터인 `message`를 삭제하도록 하겠습니다. filter 플러그인을 다음과 같이 수정해주세요.

```yaml
filter {
  mutate {
    split => {"message" => " "}
    add_field => {"id" => "%{[message][2]}"}
    remove_field => "message"
  }
}
```

`add_field`는 필드를 새로 만들어 추가하는 옵션이고, `remove_field`는 특정 필드를 삭제하는 옵션입니다.
이러한 옵션으로 인해 필드를 지울 수 있습니다. `add_field`와 `remove_field`는 mutate의 특별한 옵션이 아닌,
**모든 필터 플러그인에서 사용할 수 있는 공통 옵션**입니다. 이 외에도 다음과 같은 옵션이 있습니다.

| 공통 옵션         | 설명                                                                          |
|:--------------|:----------------------------------------------------------------------------|
| add_field     | 새로운 필드 추가                                                                   |
| add_tag       | 성공한 이벤트에 태그 추가                                                              |
| enable_metric | 메트릭 로깅 활성화/비활성화. 기본적으로 활성화되어 있으며, 수집 데이터는 로그스태시 모니터링에서 해당 필터의 성능을 분석할 때 사용됨 |
| id            | 플러그인 아이디 설정                                                                 |
| remove_field  | 필드 삭제                                                                       |
| remove_tag    | 성공한 이벤트에 붙은 태그 제거                                                           |

이제 위의 필터 플러그인대로 수정한 파이프라인을 실행해봅시다.
아래와 깉아 id만 존재하고 message가 사라진 것을 확인할 수 있습니다.

<img width="621" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/32cfd849-9d7b-4008-b520-d489939a7dcd">

참고로, split이라는 필터 플러그인이 있는데, split 플러그인은 단일 문서를 복수의 문서로 나눠주는 역할을 합니다.
지금 사용한 split은 mutate 플러그인의 옵션으로 둘을 혼동하지 않도록 주의합시다.

#### 6.3.2.2. dissect를 이용한 문자열 파싱
이번에는 **패턴을 이용해 문자열을 분석하고 주요 정보를 필드로 추출하는 기능**을 수행하는 `dissect` 플러그인을 이용해 문자열을 파싱해보겠습니다.
`test-logstach.conf` 파일의 filter 부분을 다음과 같이 수정해봅시다.

```yaml
filter {
  dissect {
    mapping => {"message" => "[%{timestamp}] [%{id}] %{ip} %{port} [%{level}] - %{message}"}
  }
}
```

`%{필드명}`으로 작서앟면 중괄호(`{}`) 안의 필드명으로 새로운 필드가 만들어집니다.
`%{}` 외의 문자들은 모두 구분자 역할을 합니다.

<img width="637" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/8190fdc7-6aee-4f3a-be3e-a911ceffe5bb">

공백을 표현하기 위해 `^` 기호를 사용했습니다. 그림과 같이 각 필드에 들어가길 원하는 정보가 있는데, LOG2번은 공백이 세 칸 존재합니다.
이 세 칸의 공백으로 인해 LOG2번은 다음과 같이 원하는 결과가 반환되지 않고 `_dissectfailure`라는 오류가 발생했습니다.

<img width="655" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/8ee0f79d-e84f-4736-8bb2-4dae9fbe20b2">

이를 해결하기 위해서는 매핑에 몇 가지 기호를 사용해야 합니다. 다음 예제를 통해 사용할 수 있는 기호에 대해 살펴보도록 하겠습니다.

```yaml
filter {
  dissect {
    mapping => {"message" => "[%{timestamp}]%{?->}[%{id}] %{ip} %{+ip} [%{?level}] - %{}"}
  }
}
```

사용한 기호에 대한 설명은 다음과 같습니다.

- `->` : 공백 무시
- `%{필드명->}` : 공백이 몇 칸이든 한의 공백으로 인식
- `%{+필드명}` : 여러 개의 필드를 하나의 필드로 합쳐서 표현
- `%{?필드명}`, `%{}` : 결과에 포함 X

변경한 파이프라인을 실행하면 다음과 같은 결과가 나옵니다.

<img width="678" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/94d133d9-3029-476c-93aa-50013564a51b">

결과를 보면 `%{?->}`라고 입력하여 공백들이 하나의 필드로 인식되고 무시된 것을 확인할 수 있습니다.
그리고 `%{+ip}`라고 입력하여 ip라는 필드에 port 정보가 포함되어 있는 것도 확인할 수 있습니다.

#### 6.3.2.3. grok을 이용한 문자열 파싱

**grok**은 **정규 표현식을 이용해 문자열을 파싱**할 수 있습니다.
grok은 자주 사용하는 정규 표현식들을 패턴화해뒀으며, 패턴을 이용해 `%{패턴:필드명}` 형태로 데이터에서 특정 필드를 파싱할 수 있습니다.

grok에서 지원하는 패턴들은 다음과 같습니다.

| 패턴명               | 설명                                                          |
|:------------------|:------------------------------------------------------------|
| NUMBER            | 십진수를 인식. 부호와 소수점을 포함할 수 있음                                  |
| SPACE             | 스페이스, 탭 등 하나 이상의 공백을 인식함                                    |
| URI               | URI 인식. 프로토콜, 인증 정보, 호스트, 경로, 파라미터 포함 가능                    |
| IP                | IP 주소 인식                                                    |
| SYSLOGBASE        | 시스로그의 일반적인 포맷에서 타임스탬프, 중요도, 호스트, 프로세스 정보까지 메시지 외의 헤더 부분을 인식 |
| TIMESTAMP_ISO8601 | ISO8601 포맷의 타임스탬프 인식                                        |
| DATA              | 이 패턴의 직전 패턴부터 다음 패턴 사이를 모두 인식                               |
| GREEDYDATA        | DATA 타입과 동일하나, 표현식의 가장 뒤에 위치시킬 경우 해당 위치부터 이벤트의 끝까지를 값으로 인식  |

`test-logstash.conf` 파일을 grok 플러그인을 사용하도록 수정해봅시다.

```yaml
filter {
  grok {
    match => {"message" => "\[%{TIMESTAMP_ISO8601:timestamp}\] [ ]*\[%{DATA:id}\] %{IP:ip} %{NUMBER:port:int} \[%{LOGLEVEL:level}\] \- %{DATA:msg}\."}
  }
}
```

여기서 몇 가지만 설명드리도록 하겠습니다.
먼저, `NUMBER:port:int`를 보면 NUMBER는 패턴명, port는 필드명이고 `int`는 정수 타입으로 지정하는 것입니다. 이러한 설정을 넣지 않으면 기본적으로 모든 데이터는 문자 타입으로 인식됩니다.
그리고 `LOGLEVER`은 시스로그레벨 (WARN, ERROR 등)을 인식합니다.
`[`, `]`, `-`, `.`와 같은 기호는 역슬래시(\)를 붙여 이스케이프할 수 있습니다.
그리고 `[ ]*`은 정규식으로, 모든 공백을 허용하겠다는 의미입니다.

결과를 확인해보면 `_grokparsefailure`와 같은 에러가 발생한 것을 알 수 있습니다.

<img width="630" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/8882c40d-30ab-405e-9b46-bf3981712e26">

이러한 에러가 발생한 이유는 날짜/시간 데이터 포맷이 `TIMESTAMP_ISO8601` 포맷과 맞지 않기 때문입니다.
`TIMESTAMP_ISO8601`은 다음과 같은 패턴을 가집니다.

```yaml
TIMESTAMP_ISO8601 %{YEAR}-%{MONTHNUM}-%{MONTHDAY}[T ]%{HOUR}:?%{MINUTE}(?::?%{SECOND})?%{ISO8601_TIMEZONE}?
```

연-월-일 형태의 포맷만 지원하는데 연/월/일 형태의 포맷을 사용하여 에러가 발생한 것이었습니다.
이러한 사용자 패턴을 지정하려면 grok의 `pattern_definitions` 옵션을 사용해야 합니다.

```yaml
filter {
  grok {
    pattern_definitions => {"MY_TIMESTAMP" => "%{YEAR}[/-]%{MONTHNUM}[/-]%{MONTHDAY}[T ]%{HOUR}:?%{MINUTE}(?::?%{SECOND})?%{ISO8601_TIMEZONE}?"}
    match => {"message" => "\[%{MY_TIMESTAMP:timestamp}\] [ ]*\[%{DATA:id}\] %{IP:ip} %{NUMBER:port:int} \[%{LOGLEVEL:level}\] \- %{DATA:msg}\."}
  }
}
```

실행해보면 다음과 같이 정상적인 결과가 나오는 것을 확인할 수 있습니다.

<img width="649" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/428d232d-7da0-4a68-b696-09dc59bb5b5a">

지금까지 dissect와 grok을 사용해서 파싱을 해보았습니다.
이 두 플러그인은 **패턴을 이용해 구문 분석을 한다**는 공통점이 있지만, **성능 차이**가 있습니다.
로그 형식이 일정하고 패턴이 변하지 않으면 dissect를 사용하는 것이 **패턴을 해석하지 않아 성능이 좋습니다.**
그러나 로그 형태가 일정하다고 장담하기 힘들다면 grok을 사용하는 것이 좋습니다.
grok은 dissect와 기타 필터 조합으로 간단하게 해결되지 않는 진짜 **정규 표현식이 필요한 경우에만 사용**하는 것이 좋습니다.

#### 6.3.2.4. 대소문자 변경

이번에는 소문자를 대문자로 바꿔보도록 하겠습니다. `test-logstash.conf` 파일을 다음과 같이 수정합니다.

```yaml
filter {
  dissect {
    mapping => {"message" => "[%{timestamp}]%{?->}[%{id}] %{ip} %{+ip} [%{?level}] - %{}"}
  }
  mutate {
    uppercase => ["level"]
  }
}
```

`uppercase` 옵션을 통해 `level` 필드의 데이터를 모두 대문자로 변경하였습니다.
소문자로 변경하고 싶다면 `lowercase` 옵션을 사용하면 됩니다.
위 필터를 적용시킨 파이프라인을 실행하면 다음과 같은 결과를 얻을 수 있습니다.

<img width="652" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/375c9855-a891-40e2-bb28-bf48c650ddc3">

#### 6.3.2.5. 날짜/시간 문자열 분석

시간은 '12시 25분, '12:45' 같이 다양하게 표현할 수 있습니다.
이렇듯 로그는 날짜/시간에 대한 포맷이 통일되어 있지 않습니다.
이런 다양한 포맷은 `date` 플러그인을 이용해 기본 날짜/시간 포맷으로
인덱싱할 수 있습니다.

```yaml
filter {
  dissect {
    mapping => {"message" => "[%{timestamp}]%{?->}[%{id}] %{ip} %{+ip} [%{?level}] - %{}"}
  }
  mutate {
    strip => "timestamp"
  }
  date {
    match => ["timestamp", "YYYY-MM-dd HH:mm", "yyyy/MM/dd HH:mm:ss"]
    target => "new_timestamp"
    timezone => "Asia/Seoul"
  }
}
```

`timestamp` 필드 중에서 `YYYY-MM-dd HH:mm` 포맷이거나 `yyyy/MM/dd HH:mm:ss` 포맷인 경우에 `date` 플러그인을 통해 매칭할 수있습니다.
`target`은 매핑된 필드가 저장될 새로운 필드를 의미하며, 여기서는 `new_timestamp` 필드를 생성합니다.
만약, `new_timestamp` 대신 `timestamp`를 사용하면 기존 필드의 내용을 덮어쓰게 됩니다.
`Asia/Seoul`는 타임존을 지정한 것으로, 지정하지 않으면 로컬 PC(서버)의 타임존을 적용하게 됩니다.

<img width="671" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/0776218d-05b9-4a82-9957-5439597774ed">

그런데 실제로 출력된 값을 보면 `UTC`를 기준으로 날짜와 시간이 설정된 것을 볼 수 있습니다. 
이렇게 저장이 된 이유는 **엘라스틱서치에서 사용하는 타임존이 `UTC`이기 때문**입니다.

로그스태시에서 사용하는 날짜/시간 포맷은 **Joda Time 라이브러리**를 사용하며, 패턴은 다음과 같습니다.

| 기호     | 의미            | 예시            |
|:-------|:--------------|:--------------|
| Y 또는 y | 연도            | 1996          |
| M      | 월             | July, Jul, 07 |
| m      | 분             | 30            |
| D      | 일 (연 기준)      | 189           |
| d      | 일 (월 기준)      | 10            |
| H      | 시 (0 ~ 23)    | 18            |
| h      | 시 (0 ~ 12)    | 6             |
| S      | 밀리초 (0 ~ 999) | 978           |
| s      | 초 (0 ~ 59)    | 55            |

#### 6.3.2.6. 조건문

로그스태시는 일반적인 프로그래밍 언어와 동일하게 if, elas if, else 조건문을 제공합니다.
조건문을 이용해 로그 레벨에 따른 필터를 다음과 같이 추가해봅시다.

```yaml
filter {
  dissect { 
    mapping => {"message" => "[%{timestamp}]%{?->}[%{id}] %{ip} %{+ip} [%{level}] - %{}"}
  }
  if [level] == "INFO" {
    drop { }
  }
  else if [level] == "warn" {
    mutate {
      remove_field => ["ip", "port", "timestamp", "level"]
    }
  }
}
```

여기서 drop은 데이터를 삭제하는 플러그인입니다. 로그스태시를 실행하면 다음과 같이 level이 "INFO"인 첫 번재 로그는 출력되지 않은 것을 확인할 수 있습니다.

<img width="648" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/6d719f6e-32e2-4be7-aa9e-63c1ea5d151b">

### 6.3.3. 출력

출력은 파이프라인의 입력과 필터를 거쳐 **가공된 데이터를 지정한 대상으로 내보내는 단계**입니다.

자주 사용하는 출력 플러그인은 다음과 같습니다.

| 출력 플러그인       | 설명                                               |
|:--------------|:-------------------------------------------------|
| elasticsearch | 가장 많이 사용되는 출력 플러그인, bulk API를 사용해 엘라스틱서치에 인덱싱 수행 |
| file          | 지정한 파일의 새로운 줄에 데이터 기록                            |
| kafka         | 카프카 토픽에 데이터 기록                                   |

여러 출력 플러그인 중 elasticsearch 플러그인을 사용해보도록 하겠습니다.
`test-logstash.conf` 파일을 다음과 같이 수정해주세요.

```yaml
input {
  file {
    path => "/Users/subin/WorkSpace/TIL/logstash-7.10.2/config/test-input.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
  }
}

output {
  elasticsearch {
    index => "test-output"
  }
}
```

엘라스틱서치 플러그인의 옵션은 다음과 같습니다.

| 옵션                         | 설명                                                                                                                        |
|:---------------------------|:--------------------------------------------------------------------------------------------------------------------------|
| hosts                      | 이벤트를 전송할 엘라스틱서치의 주소                                                                                                       |
| index                      | 이벤트를 인덱싱할 대상 인덱스                                                                                                          |
| document_id                | 인덱싱될 문서의 아이디를 직접 지정할 수 있는 옵션                                                                                              |
| user/password              | 엘라스틱서치에 보안 기능이 활성화되어 있을 때 인증을 위한 사용자 이름과 비밀번호                                                                             |
| pipeline                   | 엘라스틱서치에 등록된 인제스트 파이프라인을 활용하기 위한 옵션                                                                                        |
| template</br>template_name | 로그스태시에서 기본 제공되는 인덱스 템플릿 외에 커스텀 템플릿을 사용하기 위한 옵션. template에는 정의한 인덱스 템플릿 파일 경로를, template_name에는 엘라스틱서치에 어떤 이름으로 등록할지 설정 가능 |

설정한 파이프라인을 실행해보면, 엘라스틱서치에 정상적으로 반영된 것을 확인할 수 있습니다.

<img width="1200" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/9dae0289-8855-472d-89bc-08e306ef24b4">

그런데 생각해보면 엘라스틱서치에 저장할 인덱스만 지정했을 뿐, 엘라스틱서치의 주소를 적지 않았습니다.
그럼에도 정상 동작하는 이유는 `hosts`는 기본적으로 `localhost:9200`으로 설정되어 있기 때문입니다.

### 6.3.4. 코덱

코덱(codec)은 입력/출력/필터와 달리 **독립적으로 동작하지 않고 입력과 출력 과정에서 사용되는 플러그인**으로,
입/출력 시 메시지를 적절한 형태로 변환하는 **스트림 필터**입니다.

자주 사용하는 플러그인은 다음과 같으며, 입력/출력 단계에서 데이터의 인코딩/디코딩을 담당합니다.

| 플러그인      | 설명                           |
|:----------|:-----------------------------|
| json      | 입력 시 JSON 형태의 메시지를 객체로 읽어 들임 |
| plain     | 메시지를 단순 문자열로 읽어 들임. 코덱 기본 설정 |
| rubydebug | 디버깅을 위한 목적으로 주로 사용. 입력에 사용 X |

`test-logstash.conf`에 json 플러그인을 추가해봅시다. 다음과 같이 수정해주세요.

```yaml
input {
  file {
    path => "/Users/subin/WorkSpace/TIL/logstash-7.10.2/config/test-input.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
    codec => "json"
  }
}

output {
  stdout {}
}
```

파이프라인을 실행해보면 다음과 같이 오류가 발생합니다.

<img width="647" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/098d2bb7-eeb9-49fd-b233-42c3791ea472">

`_jsonparsefailure`는 JSON 문법이 잘못되었다는 뜻이지만, 결국 **파일을 인코딩하지 못한 문제**입니다.
입력 파일은 플레인 텍스트 형식인데 JSON 형식으로 인코딩을 시도했기 때문입니다.

`codec => "plain"`으로 변경하거나 codec 플러그인 설정을 지우면 정상 동작합니다. 관련 예제 및 결과 화면은 생략하겠습니다.
그 외에 입력 코덱은 multiline 코덱도 많이 사용하는 데, 해당 내용은 뒤에서 추후 살펴보도록 하겠습니다.

이번에는 출력 코덱을 확인해봅시다.

```yaml
input {
  file {
    path => "/Users/subin/WorkSpace/TIL/logstash-7.10.2/config/test-input.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
  }
}

output {
  stdout {
    #codec => "line"
    #codec => "json"
    #codec => "rubydebug"
  }
}
```

한 번에 하나의 주석(#)만 풀면서 파이프라인을 세 번 실행하여 결과를 살펴보도록 하겠습니다.

먼저 line 코덱을 실행해봅시다. 아래 그림에서 볼 수 있듯이 라인 형식으로 텍스트를 출력합니다.

<img width="806" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/fed2e236-c288-47fa-b516-e212b18c1cd8">

그 다음 json 코덱을 실행해보면, 다음과 같이 JSON 형태로 로그가 만들어진 것을 볼 수 있습니다.
json 내용을 보면 우리가 만들지 않은 `@timestamp`, `@version` 같은 여러 필드가 추가된 것을 확인할 수있습니다.

<img width="1111" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/348f0616-e9e0-4b93-93f9-04e5213eacbc">

마지막으로 rubydebug 코덱입니다. 실행해보면 그 동안 우리가 보던 결과인 것으로 보아, 표준 출력 플러그인에 코덱을 명시하지 않으면 rubydebug가 기본으로 사용되는 것을 알 수 있습니다.

<img width="648" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/013fe246-f811-4347-84c7-ee7cd77dadc1">

## 6.4. 다중 파이프라인

다중 파이프라인은 **하나의 로그스태시에서 여러 개의 파이프라인을 동작하는 것**입니다.
A 서버와 B 서버에서 하나의 로그스태시로 전달하거나 하나의 서버에서 A 프로그램 로그와 B 프로그램 로그를 저장하는 경우 사용합니다.

<img width="826" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/628e5b3c-ee9e-44a7-8183-e591e80b15e4">

### 6.4.1. 다중 파이프라인 작성

먼저 `pipelines.yml` 파일을 다음과 같은 내용을 추가합니다.

```yaml
- pipeline.id: mypipe1
  path.config: /Users/subin/WorkSpace/TIL/logstash-7.10.2/config/mypipe1.conf
- pipeline.id: mypipe2
  path.config: /Users/subin/WorkSpace/TIL/logstash-7.10.2/config/mypipe2.conf
```

`pipeline.id`와 `path.config`를 포함하여 많이 쓰이는 파이프라인 설정은 아래와 같습니다.

| 설정                  | 설명                                                                                          |
|:--------------------|:--------------------------------------------------------------------------------------------|
| pipeline.id         | 파이프라인의 고유한 아이디                                                                              |
| path.config         | 파이프라인 설정 파일 위치                                                                              |
| pipeline.workers    | 필터와 출력을 병렬로 처리하기 위한 워커 수. 기본적으로 호스트의 CPU 코어 수와 동일하게 설정됨                                     |
| pipeline.batch.size | 입력 시 하나의 워커당 최대 몇 개까지 인베트를 동시에 처리할지 결정. 수치가 클수록 요청 수행 횟수는 줄어들지만 단일 요청이 커지므로 적당히 조절해가며 튜닝 필요 |
| queue.type          | 파이프라인에서 사용할 큐의 종류를 정할 수 있음. 기본적으로 memory 타입이 사용되나, persisted 타입 선택 시 이벤트 유실을 좀 더 최소화할 수 있음  |

다중 파이프라인 사용법을 익히는 것이 목적이기 때문에 `mypip1.conf`와 `mypipe2.conf`는 최대한 간단하게 작성하겠습니다.
`mypipe1.conf`는 다음과 같이 작성합니다.

```yaml
input {
  file {
    path => "/Users/subin/WorkSpace/TIL/logstash-7.10.2/config/test-input.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
  }
}

output {
  stdout {
  }
}
```

그리고 `mypipe2.conf`는 아래와 같이 작성합니다.

```yaml
input {
  file {
    path => "/Users/subin/WorkSpace/TIL/logstash-7.10.2/config/test-input.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
  }
}

output {
  elasticsearch {
    index => "multipipe2"
  }
}
```

그 다음 지금까지와 다르게 `-f` 옵션을 사용하지 않고 실행합니다.

```bash
./bin/logstash         
```

그러면 화면에 다음과 같이 `mypipe1.conf` 실행 결과가 나옵니다.

<img width="655" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/8e679b57-867d-4624-ac04-d980675e5781">

mypipe2는 kibana 대시보드에서 확인해보았습니다.

<img width="1194" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/fb0601e5-47ac-4f9b-baf5-4a1f4bf6b1ea">

## 6.5. 모니터링

로그스태시를 모니터링을 하는 방법은 크게 두 가지입니다

1. 로그스태시가 제공하는 API를 활용해 특정 시점의 통계 정보를 얻는 방법
2. 모니터링 기능을 활성화해서 지속적인 통계 정보를 수집하고, 키바나를 통해 대시보드 형태로 연속적인 모니터링을 수행하는 방법

### 6.5.1. API를 활용하는 방법

로그스태시에서 제공하는 API를 활용하면 **설정 변경이나 시스템 재시작 없이 설정 파일을 확인**할 수 있고,
**전반적인 통계 정보를 제공**하기 때문에 간단한 정보를 빠르게 확인하기 좋습니다.

로그스태시를 실행 중인 상태로, 다른 터미널에서 아래 API를 호출해봅시다.

```bash
curl -X GET "localhost:9600?pretty"
```

정상적으로 실행 중이라면 다음과 같이 로그스태시 정보가 표출됩니다.

<img width="614" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/c6776fe1-315c-49fb-9a19-c1d7d169e861">

로그스태시에서 제공하는 API는 다음과 같이 네 가지입니다.

| 정보    | 사용법                                                   | 설명                                           |
|:------|:------------------------------------------------------|:---------------------------------------------|
| 노드    | curl -X GET "localhost:9600/_node?pretty"             | 로그스태시가 실행되고 있는 노드의 기본 정보 제공 (파이프라인, OS, JVM) |
| 플러그인  | curl -X GET "localhost:9600/_node/plugins?pretty"     | 로그스태시에서 사용하는 플러그인 정보 제공                      |
| 노드 통계 | curl -X GET "localhost:9600/_node/stats?pretty"       | 파이프라인, 이벤트, 프로세스 등 로그스태시 통계 정보 제공            |
| 핫 스레드 | curl -X GET "localhost:9600/_node/hot_threads?pretty" | CPU 사용량이 많은 스레드를 높은 순으로 보여줌                  |

노드 API를 직접 사용해보도록 하겠습니다. 노드 API는 다음과 같은 타입을 가집니다.

| 타입        | 설명                                                  |
|:----------|:----------------------------------------------------|
| pipelines | 실행 중인 파이프라인의 종류와 각 파이프라인에 할당된 배치 크기, 워커 수 등 정보 제공   |
| os        | 로그스태시가 실행되는 노드의 OS 종류와 버전 등의 정보 제공                  |
| jvm       | 로그스태시가 실행되는 노드의 자바 가상 머신의 버전과 GC 방식, 힙 메도리 등의 정보 제공 |

이 중 pipelines 옵션을 실행해보겠습니다.

```bash
curl -X GET "localhost:9600/_node/pipelines?pretty"  
```

그러면 다음과 같이 파이프라인 정보가 표출되는 것을 확인할 수 있습니다.

<img width="581" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/3c75eeb0-da70-4cc1-8241-a014156c645b">

이번에는 노드 통계 정보 API를 사용해보겠습니다. 노드 통계 정보 API는 다음과 같은 타입을 가집니다.

| 타입        | 설명                                                                   |
|:----------|:---------------------------------------------------------------------|
| jvm       | 스레드, 메모리 사용량, GC 등 자바 가상 머신의 사용 통계                                   |
| process   | 사용 중인 파일 디스크립터 수, 즉 열어둔 파일 수와 메모리, CPU 사용량 등 프로세스의 사용 통계             |
| events    | 파이프라인별이 아닌, 실행 중인 로그스태시에 인입/필터링/출력된 총 이벤트 수와 이를 처리하기 위해 소요된 시간 등의 통계 |
| pipelines | 파이프라인과 그 하위에 구성된 플러그인별 이벤트 통계                                        |
| reloads   | 로그스태시에서 자동/수동으로 설정을 리로드했을 때 성공/실패 수 통계                               |
| os        | 로그스태시가 도커와 같은 컨테이너에서 실행될 때 cgroup에 대한 통계                             |

이 중 pipelines 옵션을 실행해봅시다.

```bash
curl -X GET "localhost:9600/_node/stats/pipelines?pretty"  
```

그러면 아래와 같이 파이프라인에 대한 통계 정보가 표출되는 것을 확인할 수 있습니다.

<img width="619" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/2afec384-b68c-4d81-8477-25003db04371">

### 6.5.2. 모니터링 기능 활성화

xpack에서 제공하는 모니터링 기능을 활성화하면 **로그스태시 통계 데이터를 엘라스틱서치에 전송하고, 키바나 GUI를 이용해 모니터링 정보를 연속적으로 파악**할 수 있습니다.
xpack을 사용해야 하기 때문에 Apache 2.0 License만 사용하는 OSS 버전은 x-pack 미지원으로 해당 방법을 활용하기 어렵습니다.

`logstash.yml` 파일을 열고 다음과 같이 수정합니다.

<img width="619" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/73bbcba4-f340-4824-bf24-f379dd110cb7">

그 다음 로그스태시를 재실행합니다.

```bash
./bin/logstash  
```

그 다음 Kibana 대시보드에 접속하여 `Management > Stack Monitoring`을 선택합니다.

<img width="1272" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/edfae65a-5a08-4f17-a0e1-a46b2e76244a">

한 번도 사용한 적이 없다면 UI 실행이 필요합니다. 하단의 `Or, set up with self monitoring`을 클릭합니다.

<img width="554" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/b15bb319-cb33-4411-876c-a04c4fbcea3b">

그 다음은 `Turn on monitoring`을 클릭하면 모니터링 UI가 활성화됩니다.

<img width="552" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/8bbf0a99-df74-4c8a-92a1-33cfc56d2568">

그러면 아래와 같은 화면을 볼 수 있습니다.

<img width="931" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/e0bd3c77-c424-48cd-ba3d-73d8b1cc8c7e">

- 오버뷰 (Overview) : 로그스태시의 전체적인 통계 화면을 보여줌
- 노드 (Nodes) : 로그스태시 인스턴스 통계 지표 표시
- 파이프라인 (Pipelines) : 현재 실행 중인 로그스태시들의 파이프라인 구성과 성능 정보 표시

각각 접속하면 위에서 설명한 다양한 정보들을 볼 수 있습니다. 여기서는 각 화면에 대한 설명은 생략하겠습니다.

> 본 게시글은 [엘라스틱 스택 개발부터 운영까지](https://product.kyobobook.co.kr/detail/S000001932755) 도서를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 책을 읽어보실 것을 추천해 드립니다.
>

추가로 참고한 내용
- <https://systorage.tistory.com/entry/MacOS-M1%EC%B9%A9%EC%97%90%EC%84%9C-logstash-%EC%84%A4%EC%B9%98%ED%95%98%EA%B8%B0>
- <https://renuevo.github.io/elastic/elastic-timezone/>
- <https://discuss.elastic.co/t/elastic-utc-time/191877/4>