# 07. 비츠

::: tip ✅ 실습 환경

- Mac M1
- Elasticsearch 7.10.2
- Logstash 7.10.2
- Kibana 7.10.2
- Java 11

:::

## 7.1. 비츠 소개

비츠는 **가볍고 사용하기 쉬운 데이터 수집기**로, 다음과 같은 특징을 가집니다.

- 고 프로그래밍 언어로 작성된 경량 프로그램
- **하나의 목적만을 수행**
- 애플리케이션의 성능에 영향을 미치지 않음
- 로그스태시, 엘라스틱서치와 연계해 다양한 시스템 이벤트 수집 가능
- 온프레미스와 가상 머신 뿐만 아니라 컨테이너와 쿠버네티스 환경에서도 사용 가능
- 설정 간편
- 별도의 데이터 가공을 위한 프로그래밍 작업 필요 X

비츠의 종류는 다음과 같습니다.

| 비트명                   | 설명                                                                          |
|:----------------------|:----------------------------------------------------------------------------|
| 파일비트 (filebeat)       | 로그 파일을 실시간으로 읽어 들여 전송함. 로그스태시나 엘라스틱서치에 데이터 전달 시 부하 방지 기능 지원                 |
| 하트비트 (heartbeat)      | 서비스가 살아있는지 확인하고 모니터링함. 크론(cron) 스케줄 표현식을 기반으로 주기적으로 서비스 활성화 여부 판단           |
| 메트릭비트 (metricbeat)    | 운영체제를 포함하여 서비스로부터 주기적으로 통계 지표 수집                                            |
| 패킷비트 (packetbeat)     | 네트워크 패킷 분석기로 네트워크 데이터 수집                                                    |
| 오딧비트 (auditbeat)      | 리눅스의 시스템 보안 정보를 감사하는 auditd에서 생성하는 로그 수집                                    |
| 저널비트 (journalbeat)    | 리눅스 systemd로 실행되는 서비스들에 대한 로그 수집                                            |
| 펑션비트 (functionbeat)   | 클라우드 서버리스 환경에서 사용                                                           |
| 윈로그비트 (winlogbeat)    | 윈도우에서 발생하는 이벤트 로그 수집                                                        |
| 커스텀 비츠 (custom beats) | 오픈소스 커뮤니티에서 만든 비츠. 아파치비트(apachebeat), 카프카비트(kafkabeat), 엔진엑스비트(nginxbeat) 등 |

비츠는 성격에 따라 종류가 나뉘며, 사용 방식은 비슷하나 설치 방법이나 용도가 조금씩 다릅니다.

## 7.2. 파일비트

### 7.2.1. 파일비트 아키텍처

파일비트는 **로그 파일을 쉽게 수집**하도록 도와주며, 엘라스틱과 키바나를 이용해 로그를 추적하고 통계를 만들어 활용할 수 있게 도와줍니다.
그리고 로그스태시처럼 **간단한 필터 작업**도 가능합니다.

<img width="479" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/48c295fb-25f2-4cd9-bb36-afd3fda047ea">

파일비트는 세 가지 구성요소로 이루어져 있습니다.

| 구성요소             | 내용                                                                                             |
|:-----------------|:-----------------------------------------------------------------------------------------------|
| 입력 (input)       | 설정 파일에서 하베스터에 대한 입력 소스 설정. 하나 혹은 여러 개의 입력을 가질 수 있음                                             |
| 하베스터 (harvester) | 입력에 명시된 파일을 직접 수집하는 주체. 파일을 한 줄씩 읽고 내보내는 역할 및 파일을 열고 닫는 역할을 함. 하베스터가 실행되는 동안에는 파일 디스크립터가 열려 있음 |
| 스풀러(spooler)     | 하베스터가 수집한 이벤트를 전달하는 역할                                                                         |

### 7.2.2. 파일비트 설치

먼저 [공식 홈페이지](https://www.elastic.co/kr/downloads/past-releases/filebeat-7-10-2)에서 파일을 다운 받습니다.

<img width="299" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/afba6aa6-3642-4547-95dd-a534e11ff89d">

그 다음, 아래와 같이 `filebeat.yml` 설정을 변경해줍니다.

```yaml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /Users/subin/WorkSpace/TIL/logstash-7.10.2/config/test-input.log

setup.kibana:
  host: "localhost:5601"

output.elasticsearch:
  hosts: ["localhost:9200"]
```

여기서 `input`은 파일비트를 가져오는 입력이고, `output`은 내보내는 출력입니다.

input으로 설정할 수 있는 타입은 다음과 같습니다.

| input 타입  | 설명                                          |
|:----------|:--------------------------------------------|
| log       | 가장 기본이 되는 타입. 파일 시스템의 지정한 경로에서 로그 파일을 읽어 들임 |
| container | 도커 같은 컨테이너의 로그 수집을 위한 입력                    |
| s3        | 아마존 웹 서비스의 S3 버킷에 위치한 파일을 읽어 들임             |
| kafka     | 카프카 토픽을 읽어 들임                               |

그리고 output으로 설정할 수 있는 타입은 다음과 같습니다. output은 하베스터가 읽어들인 데이터를 전달하는 곳입니다.

| output 타입     | 설명                                                            |
|:--------------|:--------------------------------------------------------------|
| elasticsearch | 가장 많이 사용되는 타입. 수집한 이벤트를 엘라스틱서치로 직접 인덱싱                        |
| logstash      | 다수의 비츠를 사용해 엘라스틱서치로 전송되는 인덱싱 리퀘스트의 양이 많거나, 가공 작업이 필요할 때 주로 사용 |
| kafka         | 수집 중 장애 발생 시 데이터 손실을 최소화하기 위해 사용                              |
| console       | 수집한 이벤트를 시스템 콘솔에 출력                                           |

위에서 설장한 파일비트를 실행하기 전, setup 옵션을 실행하겠습니다. 여기서 `-e`는 모니터에 오류나 로그를 보여주는 옵션입니다.

```bash
./filebeat setup -e
```

아래와 같이 `Loaded Ingest pipelines`까지 보이면 셋업이 완료됩니다.

<img width="996" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/0bce3b9b-3914-44e7-bde2-c973e98957ec">

이렇게 셋업을 하면 파일비트 관련 부분이 키바나에 추가됩ㄴ다.

<img width="1254" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/63fb20fb-33ea-4cd5-874a-a7b948d26fea">

파일비트와 엘라스틱서치, 키바나 간의 셋업이 끝났으므로 파일비트를 실행해봅시다.

```bash
./filebeat -e
```

그 다음 키바나 메뉴의 `Management > Stack Management > Index Management` 로 가보면, 다음과 같이 `filebeat-*`이라는 이름으로 인덱스가 생성된 것을 확인할 수 있습니다.
직접 만들지만 파일비트에서 setup 과정을 통해 만든 것입니다.

<img width="1255" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/e4ecfe9b-1539-45d9-a40a-bac6ef48e5af">

### 7.2.3. 파일비트 설정

파일비트를 설치하면 `filebeat.reference.yml`라는 파일이 존재하는데, 이 파일에는 **파일비트의 모든 설정에 대한 설명과 기본 값**이 적혀 있는 참조 파일입니다.
버전에 맞춰 추가/삭제된 옵션이 모두 포함되어 있으니 설정 파일을 수정할 때 참고하면 됩니다.

파일비트의 설정 중 자주 사용되는 옵션에 대해 살펴보겠습니다.

먼저, `ignore_older`는 새로운 파일 탐색 시 **오래된 파일은 읽어 들이지 않고 무시하기 위한 설정**입니다.

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /Users/subin/WorkSpace/TIL/logstash-7.10.2/config/test-input.log
    ignore_older: 24h
    
setup.kibana:
  host: "localhost:5601"

output.elasticsearch:
  hosts: ["localhost:9200"]
```

`ignore_older`는 시간은 h, 분은 m 처럼 타임스트림 형식으로 작성하며, 위 처림 24h라고 설정하면 최근 24시간 내 로그만 수집하겠다는 의미입니다.
기본값은 0으로, 특별히 값을 명시하지 않으면 파일의 생성/수정 시간과 무관하게 모든 내용을 읽어 들인다는 의미입니다.

다음은 **특정 라인이나 파일을 추가/제외**하는 옵션입니다.

- `include_lines` : 특정 라인을 정규 표현식을 이용해 필터링하고 매칭된 라인만 비츠에서 수용
- `exclude_lines` : 특정 라인을 정규 표현식을 이용해 필터링하고 매칭된 라인은 비츠에서 수집 X
- `exclude_files` : 패턴에 일치하는 파일을 무시할 때 사용

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /Users/subin/WorkSpace/TIL/logstash-7.10.2/config/test-input.log
    include_lines: ['^ERR', '^WARN']
    exclude_lines: ['^DBG']
    exclude_files: ['\.gz$']
    
setup.kibana:
  host: "localhost:5601"

output.elasticsearch:
  hosts: ["localhost:9200"]
```

위 설정은 ERR이나 WARN으로 시작하는 로그 라인은 수집하고, DBF로 싲가하는 라인은 수집하지 않습니다.
그리고 확장자가 gz인 파일은 무시합니다.

이번에는 **멀티라인** 옵션에 대해 알아보겠습니다.
멀티라인 옵션은 여러 라인을 하나의 로그로 인식해야 할 때 사용합니다.

멀티라인에는 다음과 같이 세 가지 하위 옵션이 있습니다.

- `multiline.patter` : 정규식을 이용해 패턴 지정
- `multiline.negate` : true일 때 패턴 일치 조건을 반전시킴
- `multiline.match` : 멀티라인을 처리하는 방식으로, before와 after를 지정할 수 있음

`negate`와 `match`를 조합해서 사용하면 다음 그림과 같이 네 가지 경우가 생깁니다.

<img width="555" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/482aff30-8f06-4594-a783-bca0ee0d0898">

### 7.2.4. 모듈

모듈은 **많이 사용되고 잘 알려진 시스템 데이터를 수집하기 위한 일반적인 설정을 사전 정의해 둔 것**입니다.
파일비트의 경우 아래와 같은 모듈을 지원합니다.

| 모듈            | 설명                                              |
|:--------------|:------------------------------------------------|
| aws           | AWS의 CloudWatch, CloudTrail 같은 서비스에서 발생하는 로그 수집 |
| cef           | 시스로그를 통해 CEF (Common Event Format) 이벤트를 입력 받음   |
| cisco         | 시스코사의 ASA, Nexus 등 네트워크 장비에서 발생되는 이벤트 수집        |
| elasticsearch | 엘라스틱서치의 클러스터, GC, 감사로그 등 수집                     |
| googlecloud   | 구글 클라우드 플랫폼의 VPC 플로우, 방화벽 로그 등을 수집              |
| logstash      | 로그스태시에서 발생한 로그들 수집                              |

모듈을 사용하려면 먼저 비츠 설정 파일을 다음과 같이 수정해주어야 합니다.
input은 모듈 설정 파일에서 작성해야 하므로 제외하고, modules 설정을 추가합니다.

```yaml
filebeat.inputs:
  - type: log
    enabled: false

setup.kibana:
  host: "localhost:5601"

output.elasticsearch:
  hosts: ["localhost:9200"]

filebeat.config.modules:
  path: ${path.config}/modules.d/*.yml
```

여기서 사용한 `${path.config}`는 파일비트에서 자주 사용되는 경로를 변수로 정의한 것입니다. 파일비트 경로 변수는 다음과 같습니다.

| 경로 변수       | 경로            |
|:------------|:--------------|
| path.home   | 파일비트 설치 경     |
| path.config | 파일비트 구성 파일 경로 |
| path.data   | 파일비트 데이터 경로   |
| path.logs   | 파일비트 로그 경로    |

여러 모듈 중 logstash 모듈을 활성화합니다.

```bash
./filebeat modules enable logstash
```

명령어를 보면 알 수 있듯이 `enable`을 이용하면 모듈이 활성화됩니다. 비활성화는 `disable`을 통해 할 수 있습니다.

현재 활성화된 모듈이 무엇인지는 다음 명령어를 통해 확인할 수 있습니다.

```bash
./filebeat modules list
```

실행해보면, 방금 활성화한 logstash만 Enabled 되어 있는 것을 확인할 수 있습니다.

<img width="506" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/3367a932-be9d-4b8f-9f5c-ec230211e8a0">

이제 **모듈 속성 파일**을 수정해보겠습니다. `modules.d` 디렉토리로 이동한 다음, `logstash.yml` 파일을 열어줍니다.
참고로, 비활성화된 모듈은 `disabled` 확장자가 붙어 있고, 활성화된 모듈은 disabled 확장자가 빠져있습니다.

logstash.yml 을 열었다면, 아래와 같이 `var.paths` 를 logstash의 logs 디렉토리로 설정합니다.

<img width="633" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/3251c5a9-f701-4828-a96d-1dcb96069b6b">

그 다음 파일비트를 setup 합니다.

```bash
./filebeat setup
```

`Loaded Ingest pipelines`가 뜨면 setup이 완료됩니다.

<img width="766" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/9f2fc6fc-b1c8-4396-8fd1-d1b5a9de3591">

이제 파일비트를 실행해봅시다.

```bash
./filebeat -e
```

그 다음 로그스태시를 실행합니다.

```bash
./bin/logstash
```

이제 키바나로 접속해서 `Dashboards`로 이동합니다. 그리고 `[Filebeat Logstash] Logstash Logs ECS`를 선택합니다.

<img width="886" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/fedaa057-f8c3-4c03-8d2a-0e915228e8a9">

그러면 아래와 같은 대시보드가 생성되는 것을 확인할 수 있습니다.

<img width="1261" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/c3262b0c-8d01-439c-b9ae-c606db7e74c6">

## 7.3. 모니터링

파일비트를 모니터링을 하기 위해서는 모니터링 설정을 추가해야 합니다.

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /Users/subin/WorkSpace/TIL/logstash-7.10.2/config/test-input.log

setup.kibana:
  host: "localhost:5601"

output.elasticsearch:
  hosts: ["localhost:9200"]

monitoring.enabled: true
monitoring.cluster_uuid: hKiI06BNR5iIx5eMLPdHwg
monitoring.elasticsearch:
  hosts: ["localhost:9200"]
```

모니터링 사용을 위해서는 엘라스틱서치 호스트 정보 입력이 필요합니다.
만약 엘라스틱 클러스터를 분리해서 사용한다면, 모니터링 클러스터의 UUID를 적어야 합니다.
여기서는 엘라스틱 클러스터가 도커에 있고 파일비트는 로컬에 있기 때문에 추가하였습니다.


설정을 완료하면 파일비트를 실행합니다.

```bash
./filebeat -e
```

실행했을 때 `[monitoring]` 이라는 단어가 로그에 찍히면 정상적으로 모니터링 중입니다.

<img width="1107" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/fbc7dffa-317b-4d9d-aaf9-388c72c02fb3">

이제 키바나에서 모니터링이 가능해졌습니다. `Management > Stack Monitoring` 에 접속해봅시다.
그러면 다음과 같이 Beats가 추가된 것을 확인할 수 있습니다.

<img width="630" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/e2b8a92e-4ce2-41fd-98c4-e551ec3c86ba">

그 밖의 다양한 비츠 사용법은 파일비트와 유사하므로 생략하도록 하겠습니다.

> 본 게시글은 [엘라스틱 스택 개발부터 운영까지](https://product.kyobobook.co.kr/detail/S000001932755) 도서를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 책을 읽어보실 것을 추천해 드립니다.
>
