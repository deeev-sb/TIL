# 13. 클러스터와 노드 구성

일반적으로 클러스터는 여러 대의 컴퓨터를 병렬로 연결해 하나의 시스템을 구상하는 것을 말하며, 이렇게 구성하면 고가용성을 높이는 동시에 시스템 성능도 높일 수 있습니다.
엘라스틱서치에서는 클러스터를 구성하는 요소를 **노드(node)** 라고 하며, **클러스터는 여러 노드의 집합**이 됩니다.
그리고 노드는 엘라스틱서치가 설치되는 물리적 혹은 논리적 단위입니다.

지금부터 노드, 클러스터 그리고 샤드에 대해 알아보도록 하겠습니다.

## 13.1. 노드의 통신 모듈

노드의 통신 모듈은 두 가지로, 클러스터 내부에서 사용하는 **전송(transport) 모듈**과 외부와의 통신에 사용하는 **HTTP 모듈**이 있습니다.

<img width="335" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/24448d39-e1c6-4313-9fa5-c127f77a0743">

통신 모듈에 대한 특징은 다음과 같습니다.

- 전송 모듈
  - 클러스터 내부 모듈 간의 통신에 사용
  - 노드 간 데이터를 분산 처리하는 구조에 적합한 방식
  - 기본 포트 : 9300 ~ 9399
- HTTP 모듈
  - 엘라스틱 API에서 제공하는 형태로 외부 클라이언트 앱과 통신 시 사용
  - 기본 포트 : 9200 ~ 9299

## 13.2. 노드

노드는 **엘라스틱서치 클러스터를 구성하는 하나의 인스턴스**이며, 데이터를 저장하고 클러스터의 인덱싱과 검색 기능에 참여합니다.
**물리적인 서버 하나에 노드 하나를 구성하는 방식을 권장**하지만, 단일 서버에 복수의 노드를 설치할 수도 있습니다.
클러스터에 참여하는 **노드 이름은 중복돼서는 안 되며**, 하나의 노드가 여러 역할을 할 수도 있습니다.
엘라스틱서치에서 제공하는 노드들의 역할을 알아보겠습니다.

### 13.2.1. 마스터 노드

클러스터는 **반드시 하나의 마스터 노드(master node)를 가져야 합니다.** 마스터 노드가 없으면 클러스터가 멈추기 때문입니다.
마스터 노드는 인덱스의 설정, 매핑 정보와 물리적 위치, 클러스터 설정 정보, 인덱스 템플릿 정보 등 **클러스터의 모든 상태 정보를 관리**합니다.
또한 각 노드들과 통신하며 **클러스터의 변화를 모니터링**합니다.

마스터 노드는 사용자가 지정할 수 없으며 **다수의 마스터 후보 노드가 투표를 통해 결정**합니다.
사용자는 마스터 후보 노드(master-eligible node)만 지정할 수 있습니다.

#### 13.2.1.1. 마스터 노드 선출 과정

클러스터 내 마스터 후보 노드들은 **투표를 통해 마스터 노드를 선출**합니다.
다음과 같이 마스터 후보로 지정된 노드만이 투표 권한을 가집니다.
그렇기에 노드4는 마스터를 투표할 수도 마스터가 될 수도 없습니다.
마스터 후보인 노드1, 노드2, 노드3만 투표가 가능하며, 마스터도 이 셋 중 하나로 결정됩니다.

<img width="363" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/2c029842-dc17-49c9-9b15-095962a2494a">

과반수에 의해 노드1이 마스터 후보가 되었다고 가정하겠습니다.
이 때, 기존의 마스터 노드인 노드1이 클러스터에서 이탈한다면 **마스터 노드를 재선출하는 과정**이 필요하게 됩니다.
마스터 노드 재선출 때도 마찬가지로 **마스터 후보 노드만 투표**할 수 있습니다.

<img width="310" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/c4f69eff-58b7-4a92-9e49-572426e789a5">

노드2와 노드3 중 노드3이 마스터 노드가 되고 난 이후 노드1이 다시 클러스터에 합려를 하면 어떻게 될까요?
**이미 마스터 노드 선출이 완료**된 상황이기 때문에, 노드1이 복귀하더라도 다시 선출하는 상황은 발생하지 않습니다.

<img width="310" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/8a08b8ec-0d15-4bfe-8eb8-e3d34bd234d4">

#### 13.2.1.2. 스플릿 브레인

스플릿 브레인(split brain)은 네트워크 장애 등으로 클러스터가 분리되었을 때 나누어진 각각의 서브 클러스터가 서로 마스터 노드를 선출하고 **독립적인 클러스터로 동작하는 상태**를 의미합니다.
이렇게 되면 **2개의 독립적인 클러스터에서 각각 요청을 처리**하기 때문에 추후 시스템이 합쳐질 때 **동기화 문제**가 발생합니다.

<img width="363" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/887c8d96-2c1a-4037-954f-ef46e2b0da80">

스플릿 브레인을 방지하기 위해서는 최소 마스터 후보 노드 수를 `N/2 + 1`으로 지정하는 것이 좋습니다. (N은 마스터 후보 노드 수)
이렇게 설정을 하면 최소 마스터 후보 노드 수만큼의 마스터 후보 노드가 있는 경우에만 클러스터가 동작하고 그렇지 않은 경우 클러스터는 동작을 멈추게 됩니다.

엘라스틱서치 7.0 이전 버전은 `minimum_master_node`라는 설정으로 최소 마스터 후보 노드 수를 직접 설정합니다.
그리고 **7.0 이후 버전부터는 마스터 노드 선출 알고리즘 변경으로 스플릿 브레인이 발생하지 않습니다.**
정확히는 `node.master: true` 설정을 하면 클러스터 내부에서 `minimum_master_nodes`를 설정하기 때문에 스플릿 브레인이 발생하지 않는 것입니다.
다만, 사용자는 최초 마스터 후보로 선출할 `cluster.initial_master_nodes: [ ]` 값은 설정이 필요합니다.


#### 13.2.1.3. 투표 전용 노드

7.3버전부터는 마스터 후보 노드 중에서 마스터 노드를 선정하는 투표에만 참여하고 실제 마스터 노드가 되지 않는 **투표 전용 노드**가 추가되었습니다.
투표 전용 노드는 다음과 같이 마스터를 선정하지 못하여 클러스터를 이루지 못하고 결국 시스템이 중단되어 버리는 상황을 방지해줍니다.

<img width="514" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/2e25ef72-6f71-406d-b878-8dcd101fee3d">

투표 전용 노드는 마스터 노드가 되지 않기 때문에 마스터 후보 노드보다 부담 없이 운영될 수 있으며,
마스터 후보 노드들이 대량으로 장애가 발생했을 때 시스템이 멈추지 않고 동작할 수 있게 도와줍니다.

### 13.2.3. 인제스트 노드


인제스트 노드는(ingest node)는 **도큐먼트의 가공과 정제를 위한 인제스트 파이프라인이 실행되는 노드**입니다.
인제스트 노드는 엘라스틱서치에 인덱싱하기 전 **파이프라인을 통해 도큐먼트를 원하는 형태로 변형**할 수 있습니다.
인제스트 노드만으로 변형이 가능하다고 하여 로그스태시가 필요하지 않는 것은 아닙니다.
인제스트 노드는 가볍고 간단한 수집 프로세스에서만 활용 가능하며, 좀 더 무겁고 복잡한 가공이 필요하다면 로그 스태시를 사용하는 것이 좋습니다.

인제스트 노드는 다음과 같은 방식으로 동작합니다.

<img width="863" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/f3f9eba8-3a93-44d0-b288-66598bd21513">

인제스트 노드에는 프로세서와 파이프라인이라는 구성 요소를 가집니다.
프로세서는 도큐먼트를 변형할 수 있는 기능적으로 구분되는 모듈이며, 파이프라인은 프로세서의 집합입니다.

#### 13.2.3.1. 파이프라인

인제스트 파이프라인을 생성하는 방법에 대해 알아보도록 하겠습니다.
엘라스틱서치에서는 파이프라인 생성을 위한 REST API를 제공하는 데, 주요 파라미터는 `description`과 `processors`입니다.
`description`은 파이프라인에 대한 설명이고, `processors`는 파이프라인이 처리해야 할 프로세서들입니다.

```bash
PUT _ingest/pipeline/pipelinename
{
  "description" : "description",
  "processors" : [ ... ]
}
```

`testpipe`라는 이름의 파이프라인을 다음과 같이 생성해보았습니다.

<img width="300" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/21cec9ff-da79-4d01-87ca-d9af65b798ab">

`processors` 내에 있는 `set`은 특정 필드 값을 추가/수정하는 역할을 수행합니다. 
그리고 `on_failure`는 파이프라인이나 프로세스 처리에 실패했을 때 예외를 처리하는 방법을 입력하며, 적는 위치에 따라 적용 범위도 바뀌게 됩니다.

파이프라인을 적용하는 방법에 대해 살펴보겠습니다.

먼저, **도큐먼트 생성 시** 적용하는 방법입니다. 이 방법은 간단하게, 인덱스 생성 시 끝에 파이프라인에 대한 정보를 기입하면 됩니다.

```bash
PUT test_index/_doc/1?pipeline=testpipe
{
  "name": "id1",
  "status": "high"
}
```

`high`라고 입력한 값이 변경되었는지 조회를 통해 알아봅시다. (`GET test_index/_search`)

<img width="238" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/9b1b9211-8c54-4a8c-8620-3be56fbe3bc2">

그러면 파이프라인이 적용되어 입력한 `high`가 아닌 `low`로 값이 변경되어 있는 것을 확인할 수 있습니다.

그 다음으로 도큐먼트를 수정할 때 파이프라인을 적용하는 방법에 대해 알아보겠습니다.
수정 적용 방법은 **update API에 파이프라인을 적용하는 방법**과 **reindex API에 파이프라인을 적용하는 방법**이 있습니다.
update API를 사용할 때는 `update_by_query`라는 API를 사용해야 합니다.

우선 API 적용을 위한 인덱스를 생성하겠습니다.

```bash
PUT test_index2/_doc/1
{
  "name": "id1",
  "status": "low"
}

PUT test_index2/_doc/2
{
  "name": "id2"
}
```

그 다음 `update_by_query`를 사용해 파이프라인을 적용해보겠습니다.

```bash
POST test_index2/_update_by_query?pipeline=testpipe
```

그 다음 인덱스를 조회해보면, 다음과 같이 파이프라인 설정에 맞게 추가/수정된 것을 확인할 수 있습니다.

<img width="238" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/919b3350-b50d-4614-99f3-d3b99fd63282">

update API가 아닌 reindex API를 사용하려면 다음과 같이 요청하면 됩니다.
reindex API는 기존에 있던 인덱스를 복제해 새로운 index를 생성합니다. 이 때, 새로 생성된 `test_index4`는 `testpipe` 파이프라인의 영향을 받게 됩니다.

```bash
POST _reindex
{
  "source": {
    "index": "test_index3"
  },
  "dest": {
    "index": "test_index4",
    "pipeline": "testpipe"
  }
}
```

여기서 `test_index3`는 `test_index2`를 추가할 때와 유사하게 추가하여 생성했습니다.

```bash
PUT test_index3/_doc/1
{
  "name": "id1",
  "status": "low"
}

PUT test_index3/_doc/2
{
  "name": "id2"
}
```

파이프라인 적용 전인 `test_index3`와 적용 후인 `test_index4`를 비교해보면 다음과 같습니다.

|                                                       test_index3                                                        |                                                       test_index4                                                        |
|:------------------------------------------------------------------------------------------------------------------------:|:------------------------------------------------------------------------------------------------------------------------:|
| <img width="229" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/779f7c6a-62c7-4cad-9f67-bf9c2fa6d139"> | <img width="238" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/35ab0ecc-8ec9-4d28-8d5e-3d544d5faaa8"> |

수정해야 하는 도큐먼트가 많다면 update API 보다는 reindex API를 사용하는 것이 성능상 유리할 수 있습니다.
업데이트는 내부적으로 검색, 해당 도큐먼트 삭제, 수정된 도큐먼트로 리인덱싱이라는 순서로 작업이 진행됩니다.
이 때 삭제된 도큐먼트는 세그먼트 머지가 발생하기 전까지 ID만 내부적으로 기록해뒀따가 검색 시 필터링 하는 방식이어서
검색 성능에 나쁜 영향을 미칩니다.

마지막으로 **인덱스 설정에서 기본 파이프라인을 적용하는 방법**에 대해 알아보겠습니다.

다음과 같이 인덱스 생성 시 설정(`settings`)로 파이프라인을 설정해두면, 도큐먼트 인덱싱 시 자동으로 적용됩니다.

```bash
PUT test_index5
{
  "settings": {
    "default_pipeline": "testpipe"
  }
}
```

실제로 적용되는지 확인해보겠습니다.

```bash
PUT test_index5/_doc/1
{
  "name": "id1",
  "status": "high"
}
```

도큐먼트를 생성하고 조회해보면 다음과 같이 값이 변경되어 있는 것을 확인할 수 있습니다.

<img width="227" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/c497089b-7e12-4746-b83b-5b236207d502">

#### 13.2.3.2. 프로세서

프로세서는 파이프라인을 구성하는 요소이며, 자주 사용하는 프로세서는 다음과 같습니다.
- date
   - 날짜/시간 데이터를 파싱
   - 다음 예시의 경우 `myfield` 필드에 있는 데이터가 `formats`에 있는 날짜/시간 포맷일 경우 `timestamp`에 날짜 객체 저장

      ```bash
      {
        "date": {
          "field" : "myfield",
          "target_field" : "timestamp",
          "formats" : ["dd/MM/yyyy hh:mm:ss"]
        }
      } 
      ```

- drop 
  - 특정 도큐먼트를 저장하고 싶지 않을 때 사용
  - 주로 `if` 옵션을 이용해 조건 지정

    ```bash
    {
      "drop" : {
        "if" : "ctx.myfield == 'guest'"
      }
    }
    ```

- grok 
  - 고수준의 정규식 패턴인 grok을 이용해 특정 필드를 구조화된 필드로 만들 수 있음
- set 
  - 특정 필드에 값 지정 
  - 필드가 이미 있다면 변경하고 없다면 새로 추가
- split
  - 필드를 구분 기호를 이용해 분리
  - 분리된 필드는 배열 형태의 값을 가짐

    ```bash
    {
      "field": "myfield",
      "separator": ","
    }
    ```

모든 프로세서에는 `if`, `tag`, `on_failure`라는 공통 파라미터가 존재합니다.
`if`는 조건문에 사용하며, `tag`는 동작 과정에는 영향이 없지만 프로세서를 쉽게 추적하기 위해 사용합니다.
그리고 `on_failure`는 문제가 발생했을 때 후속 조치를 위해 사용합니다.

### 13.2.4 그 밖의 노드들

#### 13.2.4.1. 머신러닝 노드

머신러닝 노드(machine learning node)는 **엘라스틱서치가 제공하는 머신러닝 기능을 이용할 수 있는 노드**이며, 유료 라이선스에 포함된 기능입니다.
이상징후를 알리고, 시계열을 예측하고, 분류나 회귀 분석 같은 기능을 제공합니다.

#### 13.2.4.2. 코디네이터 노드

코디네이터 노드(coordinator node)는 **REST API 요청을 처리하는 역할**을 하며, 기본적으로 모든 노드가 코디네이터 노드 역할을 수행할 수 있습니다.

다음 그림에서 노드는 코디네이터 노드이자 데이터 노드입니다.

<img width="264" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/09681d5f-6a46-4dd9-8030-cfa14982a70a">

클라이언트 앱에서 엘라스틱서치 클러스터로 요청이 들어오고, 여기서 노드2가 요청을 받았다고 하겠습니다.
노드 2는 각 노드에서 처리한 요청을 취합하는 **코디네이팅**을 합니다. 그 다음 노드2가 클라이언트 앱으로 HTTP 응답을 보냅니다.

그런데 **처리해야 하는 요청이 많거나 무거운 집계를 돌리는 경우** 코디네티어 노드에서 결과를 취합하는 데 **많은 리소스가 필요**하게 됩니다.
따라서 데이터 코디네이터 작업이 많은 경우에는 **코디네이터 노드를 따로 구성**하는 것이 좋습니다.
이렇게 구성해야 데이터 노드의 부하를 줄이고 검색 효율을 높일 수 있습니다.

<img width="467" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/b4ccf20f-5dac-40f0-a7e3-06255f0f4bbe">

#### 13.2.5 전용 노드

전용 노드를 사용하면 노드 역할에 따라 하드웨어를 다르게 구성할 수 있고, 역할에 맞춰 최적화를 할 수 있습니다.
따라서 대규모 시스템인 경우 전용 노드를 활용해 시스템을 구성하는 것이 좋습니다.

전용 노드별 설정은 다음과 같이 합니다.

| 노드 타입       | node.roles            |
|:------------|:----------------------|
| 마스터 전용 노드   | [master]              |
| 투표 전용 노드    | [master, voting_only] |
| 데이터 전용 노드   | [data]                |
| 인제스트 전용 노드  | [ingest]              |
| 머신러닝 전용 노드  | [ml]                  |
| 코디네이터 전용 노드 | []                    |

그리고 전용 노드별 권장 하드웨어 사양은 다음과 같습니다.

| 노드           | CPU |  메모리  | 저장장치 |
|:-------------|:---:|:-----:|:----:|
| 마스터 후보 전용 노드 | 저사양 |  저사양  | 저사양  |
| 데이터 전용 노드    | 고사양 |  고사양  | 고사양  |
| 인제스트 전용 노드   | 고사양 | 중간 사양 | 저사양  |
| 코디네이터 전용 노드  | 저사양 | 중간 사양 | 저사양  |

## 13.5. 샤드

엘라스틱 서치에는 여러 대의 노드를 효율적으로 활용하기 위해 데이터를 **샤드**라는 단위로 나눠 분산 저장합니다.
여기서 샤드란 **인덱스에 색인되는 문서가 저장되는 공간**을 말합니다.
샤드를 사용해 데이터를 분산 저장하면 클러스터의 수평적인 확장이 가능하고 작업을 분산 처리해 성능과 처리량을 높일 수 있습니다.

<img width="401" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/71dc1a47-2d8a-4c74-84e2-88d1e82d9711">

도큐먼트가 인뎅덱싱되면서 어떤 샤드를 선택할지 결정하는 공식도 존재하며, 이 공식에 따라 도큐먼트가 어떤 샤드에 저장되는지 결정하는 것을 **라우팅**이라고 합니다.

```text
shard = hash(_routing) % 프라이머리 샤드 개수
```

### 13.5.1. 프라이머리 샤드와 레플리카 샤드

샤드는 프라이머리 샤드와 레플리카 샤드로 구분됩니다.

- 프라이머리 샤드
  - 문서가 저장되는 원본 샤드 
    - 색인과 검색 성능에 모두 영향을 줌 
- 레플리카 샤드 
  - 프라이머리 샤드의 복제 샤드 
  - 검색 성능에 영향을 줌 
  - 프라이머리 샤드에 문제가 생기면 레플리카 샤드가 프라이머리 샤드로 승격

샤드는 인덱스를 생성할 때, 다음과 같이 명령어를 통해 설정할 수 있습니다.

```bash
PUT index
{
  "settings": {
    "number_of_shards" : 3,
    "number_of_replicas" : 2
  }
}
```

위 명령어를 실행하면 프라이머리 샤드가 3개 생성되고, 각 프라이머리 샤드의 레플리카 샤드는 2개씩 생성한다는 의미입니다.
즉, 레플리카 샤드는 number_of_shards 값과 number_of_replicas 값을 곱한 결과인 6개 생성됩니다.
그렇기에 생성된 총 샤드 수는 9개 입니다.

#### 13.5.1.1. 레플리카 샤드의 필요성

레플리카 샤드는 사실상 프라이머리 샤드의 복제본으로 보이는데 왜 필요할까요?

레플리카 샤드는 다음과 같은 이유로 필요합니다.

1. 고가용성 : 시스템이 오랜 기간 동안 지속적으로 운영할 수 있는 성질
2. 처리 속도 향상 : 응답성이 좋은 샤드를 선택해 리소스 활용량을 최적화할 수 있음

### 13.5.2. 샤드 할당 과정

샤드 할당 과정은 다음과 같이 네 단계로 구분할 수 있습니다.

1. UNASSIGNED
   - 샤드는 있지만 아직 노드에 할당되지 않은 상태
2. INITIALIZING
   - 샤드를 노드에 로딩 중인 상태
   - 초기화를 위한 상태로, 샤드를 노드에 적재하지 못하는 상황 등 특별한 경우가 아니면 샤드 모니터링으로 발견하기 쉽지 않음
   - 메모리에 온전하게 적재된 것은 아니라서 샤드 사용 불가
3. STARTED
   - 샤드가 메모리에 올라간 상태
   - 샤드에 접근 가능한 상태
4. RELOCATION
   - 샤드가 재배치되는 단계
   - 다음과 같은 이유로 재배치됨
     1. 노드의 고장이나 네트워크 문제로 노드가 추가/삭제 되는 것과 같이 노드가 변경된 경우
     2. 노드 수가 변하지 않더라도 저장 공간이나 샤드 수 등 기준으로 주기적인 리밸런싱이 일어나는 경우

~~샤드 재배치에 대한 내용은 다른 강의 수강하며 정리하였기 때문에 여기서는 생략!~~

### 13.5.3. 상태 모니터링

샤드 상태를 모니터링 하기 위해서는 `cat` 함수를 사용하면 됩니다.

```bash
GET _cat/shards?v
```

위와 같이 입력하면 프라이머리 샤드는 p, 레플리카 샤드는 r로 표출하며, 샤드의 상태에 대해서도 알 수 있습니다.

참고로 `cat` 함수를 사용해 인덱스 상태도 확인할 수 있습니다.

```bash
GET _cat/indices?v
```

인덱스 상태는 `red`, `yellow`, `green` 이라는 세 가지 상태로 구분합니다.

| health | 설명                                                                                                                       |
|:------:|:-------------------------------------------------------------------------------------------------------------------------|
|  red   | -하나 이상의 프라이머리 샤드가 클러스터에 정상적으로 적재되지 않은 상태<br/>-데이터 읽기/쓰기가 정상저긍로 동작하지 않음                                                   |
| yellow | - 프라이머리 샤드는 모두 적재되었지만 하나 이상의 레플리카 샤드가 정상적으로 적재되지 않은 상태<br/>- 인덱스를 읽고 쓰는 것은 문제 없지만 레플리카 샤드가 없으면 장애 발생 시 해당 인덱스에 대한 서비스 불가 |
| green  | - 프라이머리 샤드와 레플리카 샤드가 모두 정상적으로 적재되어 있는 상태                                                                                 |

## 13.6. 샤드 개수와 크기 구성 가이드

### 13.6.1. 샤드 개수 가이드

인덱스를 생성할 때 엘라스틱서치에서 제공하는 **기본 샤드 개수**가 있습니다.
6.x 버전까지는 프라이머리 샤드 5개, 레플리카 샤드 1개가 기본 값이었는데,
**7.x 버전부터는 프라이머리 샤드 1개, 레플리카 샤드 1개**로 기본 값이 변경되었습니다.
그 이유는 **프라이머리가 많으면 인덱스를 너무 작게 나누어 오버샤딩 문제를 발생시킬 가능성이 있기 때문**입니다.

**오버샤딩**은 다음과 같은 이유로 발생합니다.

1. 각 샤드가 개별적으로 리소스를 소비함
2. 인덱스를 검색하기 위해 인덱스가 저장된 모든 샤드에 접근해야 함

그렇다고 샤드 수가 적은 것이 무조건 좋은 것은 아닙니다. **샤드 수가 많으면 그만큼 분산/병렬 처리에 좋습니다.**

엘라스틱에서는 **실 데이터를 가지고 샤드 수를 조정하며 벤치마크하는 것**을 권장하고 있습니다.

### 13.6.2. 샤드 크기 가이드

엘라스틱에서는 **통계적으로 볼 때 샤드 하나의 크기가 10GB ~ 40GB 정도로 관리하는 것이 좋다**고 권고하고 있습니다.
요즘은 ILM을 통해 인덱스를 관리하는 데, `rollover API`와 `shrink API`를 통해 관리하는 방법도 있습니다.

#### 13.6.2.1. rollover API

rollover API는 **인덱스가 특정 조건에 도달했을 때 새로운 인덱스를 생성하는 API**입니다.
그러나 rollover API 요청이 있을 경우에만 발생하기 때문에 요청 전까지는 샤드 크기가 아무리 커져도 새로운 인덱스가 생성되지 않습니다.
그래서 **ILM에서 시스템이 자동으로 조건을 체크하고 조건에 맞는 경우 새로운 인덱스를 생성하는 기능을 따로 제공**합니다.

먼저 롤오버를 사용할 인덱스를 다음과 같은 형식으로 생성합니다.
**롤오버를 사용하는 인덱스는 `-숫자`형태로 끝나야 합니다.**
그리고 별칭(`alias`)을 사용해야 롤오버를 설정할 수 있습니다.
참고로, 인덱스에 별칭을 추가하면 별칭이 같은 인덱스 간 그룹핑 효과를 얻을 수 있습니다.

```bash
PUT rollover-00001
{
  "aliases": {
    "rollover-alias": {
      "is_write_index": true
    }
  }
}
```

롤오버를 사용할 인덱스를 생성하였다면, 다음과 같이 별칭에 rollover API를 사용해 상세 설정을 합니다.

```bash
POST rollover-alias/_rollover
{
  "conditions": {
    "max_age" : "30d",
    "max_docs": 1,
    "max_size": "50gb"
  }
}
```

rollover API 조건은 다음과 같습니다.

|    옵션    | 설명                                                 |
|:--------:|:---------------------------------------------------|
| max_age  | 인덱스가 생성되고 경과된 시간. d(일), s(초) 같이 기본 시간 날짜/시간 표현식 사용 |
| max_docs | 인덱스 도큐먼트 최대 개수                                     |
| max_size | 인덱스 최대 크기                                          |


롤오버된 인덱스를 검색을 할 때는 `PUT 별칭/_doc_/아이디` 형식으로 검색해야 합니다.

```bash
GET rollover-alias/_search
```

#### 13.6.2.2. shrink API

shrink API는 다음과 같은 상황에 사용하는 API 입니다.

1. 오버샤딩 문제 해결을 위해 기존 인덱스의 프라이머리 샤드를 줄여야 하는 경우
2. 자주 사용되지 않아 핫 노드에서 웜 노드로 이동하는 인덱스
3. 자주 사용하지 않는 기존 인덱스를 롤오버 하면서 샤드 개수를 줄이기 위해

참고로, shrink API를 사용하려면 반드시 여러 개의 샤드를 가지고 있어야 합니다.

shrink API를 사용하기 위해서는 크게 두 가지 설정이 필요합니다.

1. 인덱스 내 모든 샤드를 하나의 노드로 옮긴다.
   - `index.routing.allocation.require` 속성 태그를 이용해 인덱스를 특정 샤드에만 접근할 수 있는 방법으로 샤드 옮기기
   - 추가적으로 `index.number_of_replicas`를 0으로 설정해 레플리카 샤드를 비활성화 할 것을 권장
2. 새로운 도큐먼트의 인덱싱 방지를 위해 `index.blocks.write`를 `true`로 설정해 인덱스를 읽기 전용 모드로 변경

그 다음 `GET _cat/revocery` API를 사용해 샤드의 재할당이 끝나길 모니터링하다가, 샤드 재할당이 완료되면 shrink API를 사용해 샤드 크기를 변경합니다.

```bash
POST shrink-index/_shrink/shrink-target-index
{
  "settings": {
    "index.number_of_shards": 1,
    "index.number_of_replicas": 1,
    "index.routing.allocation.require_name": null,
    "index.blocks.write": null
  }
}
```

먼저 프라이머리 샤드를 1개로 설정하고, 레플리카 활성화를 위해 1로 설정합니다.
그리고 쉬링크 전에 했던 설정을 초기화하기 위해 `index.routing.allocation.require_name`와 `index.blocks.write` 설정을 `null`로 합니다.

## 13.7 설정

엘라스틱서치 설정은 **클러스터 > 노드 > 인덱스** 레벨로 시스템 영향도가 높습니다.

|   설정    | 설명                                                                                                          |
|:-------:|:------------------------------------------------------------------------------------------------------------|
| 클러스터 설정 | - 로그 레벨이나 클러스터 전반에 관한 설정 <br/>- REST API를 이용해 동적으로 설정 값 변경 가능                                               |
|  노드 설정  | - 네트워크 인터페이스, 보안 설정 등 노드 구성에 관한 설정<br/>- elasticsearch.yml 파일에서 정적으로 수정                                     |
| 인덱스 설정  | - 인덱스와 관련된 설정<br/>- 프라이머리 샤드나 레플리카 샤드 설정 등을 할 수 있으며 정적/동적 설정 모두 가능<br/>- REST API를 이용해 동적으로 인덱스별 설정 값 변경 가능 |

각 설정에 관한 내용은 책이나 공식 문서를 참고하시면 됩니다.

::: 참고

13.3과 13.4는 생략하였습니다.
해당 부분은 Hot/Warm/Cold에 대한 내용이나 클러스터 백업 관련 내용이며, 엘라스틱서치 API를 사용한 예제로 구성되어 있습니다.
책에는 쓰여 있지 않지만 해당 기능은 Kibana 내에서 설정을 통해서도 할 수 있습니다.

:::

> 본 게시글은 [엘라스틱 스택 개발부터 운영까지](https://product.kyobobook.co.kr/detail/S000001932755) 도서를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 책을 읽어보실 것을 추천해 드립니다.
>

**추가로 참고한 내용**

- <https://esbook.kimjmin.net/03-cluster/3.3-master-and-data-nodes>
- <https://github.com/deeev-sb/TIL/blob/main/docs/elasticsearch-essential/section01.md>