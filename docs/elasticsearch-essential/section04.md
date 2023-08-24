# 04. Elasticsearch 트러블슈팅

## 4.1. 트러블 슈팅의 기본

**트러블 슈팅**이란 문제 상황을 파악하고 원인을 분석한 후 해결하는 과정입니다.
각 과정에 대해 간략하게 정리해보겠습니다.

먼저 **문제 상황 파악**은 다음과 같은 일련의 과정을 통해서 어디서 문제가 발생했는지 찾는 것입니다.
참고로, 이 순서는 절대적인 순서가 아니라 문제 상황 파악의 예시입니다.

<img width="170" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/8efba6c3-7838-430a-92d3-499abf754fc2">

어떤 문제인지 확인이 끝났으면, 그 다음은 원인을 분석해합니다.
**원인 분석**을 위해서는 주요 지표를 학인하고, 에러 로그를 분석하는 단계를 거칩니다.

원인이 파악되었다면 이를 해결하기 위한 과정을 진행해야 하는데, 이를 **문제 해결**이라고 합니다.
문제 해결과 관련된 내용은 사례를 분석하며 살펴보겠습니다.

## 4.2. 트러블 슈팅 사례 분석

### 4.2.1. 클러스터 상태가 `green`이 아닌 경우

클러스터 상태가 `green`인 경우는 프라이머리 샤드와 레플리카 샤드 모두 정상적으로 각 노드에 배치되어 동작하고 있는 상태입니다.
`green`이 아닌 경우일 때는, `yello` 또는 `red` 상태에 따른 **영향도를 정확하게 파악**하는 것이 먼저입니다.

엘라스틱서치 서버에서 다음과 같은 명령어를 통해 상태가 `red`인 인덱스 목록을 출력합니다.

```bash
curl -X GET "localhost:9200/_cat/indices" | grep -i red
```

그 결과가 예를 들어 다음과 같다고 가정하겠습니다.

```bash
red open access_log-2023-08-01 sejiajidnilnIvdas 5 1 ...
red open access_log-2023-08-04 adfaekfhkusbcjbxd 5 1 ...
red open access_log-2023-08-11 fd2kln3nidnknlsnk 5 1 ...
```

이 상황이 장애일수도 있고 아닐수도 있습니다. 생성으로부터 3일이 지나면 스냅샷을 찍어두도록 설정을 했을 때,
현재 날짜는 2023-08-21이라면 해당 상황은 장애가 아닙니다.
여기서 `red` 상태인 인덱스는 이미 스냅샷이 존재하므로, 스냅샷으로 복구하면 됩니다.

그런데 만약 장애라면 `yello` 혹은 `red`인 인덱스들 중 **어떤 샤드들에 문제가 생겼는지 파악**이 필요합니다.
다음 명령어를 통해서 샤드의 상태를 출력합니다. 이 때, `unassingned.reason`을 추가하면 어떠한 문제라 샤드의 상태에 문제가 생겼는지 알 수 있습니다.
그리고 `grep` 명령어 옵션을 `v`로 설정하면 입력한 단어가 아닌 즉, `started`가 아닌 경우에 대해서만 출력합니다.

```bash
curl -X GET "localhost:9200/_cat/shards?h=idx,sh,pr,st,docs,unassigned.reason" | grep -iv started
```

해당 요청을 통해 다음과 같은 결과가 나왔다고 가정하겠습니다.

```bash
index                  shard prirep state        docs unassigned.reason
access_log-2023-08-01  1     p       UNASSIGNED  ..   NODE_LEFT
access_log-2023-08-01  2     p       UNASSIGNED  ..   NODE_LEFT
```

위와 같이 두 개의 샤드가 비정상적으로 동작하고 있고 전체 샤드의 수가 10개라면,
20%의 문서 유실이 발생하고 있다고 공유하면 됩니다.

정리하면, 클러스터의 상태가 `yellow`나 `red`이더라도, 경우에 따라서는 장애 상황이 아닐 수 있기 때문에 **정확한 파악**이 중요합니다.

### 4.2.2. Disk Usage가 100% 인 경우

`Disk Usage`(노드의 디스크 사용량)이 100%가 되면 노드의 운영 체제도 정상적으로 동작하지 않기 때문에
엘라스틱서치에는 디스크 사용량이 일정 수준 이상이 되면 더 이상 색인하지 않도록 보호하는 장치가 있습니다.
그로 인해 갑자기 **클러스터에서 문서가 색인되지 않거나 클라이언트에서 `403 Forbidden Error`가 발생**합니다.

엘라스틱서치를 100% 사용하고 싶다면 `cluster.routing.allocation.disk.threadhold_enabled` 설정을 비활성화 하면 됩니다.
이 보호 장치와 관련된 설정은 다음과 같이 3가지가 있습니다.
- `cluster.routing.allocation.disk.watermark.low`
  - 설정한 값보다 높아지면 더 이상 샤드를 배치하지 않음
  - 기본 값 : 85%
- `cluster.routing.allocation.disk.watermark.high`
  - 설정한 값보다 높아지면 샤드들을 다른 데이터 노드로 옮김
  - 기본 값 : 90%
- `cluster.routing.allocation.disk.watermark.flood_stage`
  - 설정한 값보다 높아지면 더 이상 색인을 하지 않음
  - 기본 값 : 95%

이러한 경우에는 **데이터 노드를 증설**하거나 **불필요한 인덱스를 삭제**해서 디스크 공간을 확보해야 합니다.
그리고 디스크 공간 확보 후 `Read-Only` 상태의 인덱스들을 명시적으로 풀어주어야 합니다.
왜냐하면 색인이 불가능해지고 403이 발생하게 되면 엘라스틱서치에서 모든 인덱스를 `Read-Only` 상태로 변경하기 때문입니다.

```bash
PUT /*/settings
{
  "index.blocks.read_only_allow_delete": null
}
```

### 4.2.3. 색인 중 간헐적인 일부 문서 누락 또는 Rejected 에러가 발생한 경우

엘라스틱서치에는 색인/검색 요청을 처리하는 스레드가 존재합니다.
그리고 스레드가 모두 요청을 처리하고 있을 때를 대비해서 큐도 존재합니다.
그런데 요청이 많아 **큐가 가득 찬 경우** 색인 과정에서 일부 문서가 누락되거나 Rejected 에러가 발생합니다.

이 경우에는 다음과 같은 두 가지 해결 방법이 있습니다.

1. 데이터 노드 증설
    - 가장 근본적인 해결 방법
    - 샤드가 적절히 분배될 수 있도록 설정해야 함
2. 큐 증설
    - 당장 데이터 노드를 증설하기 어려운 경우 큐 증설 
    - 간헐적으로 많은 양의 요청이 인입되는 경우
    - 일시적으로 데이터 처리량을 늘리는 것

### 4.2.4. 샤드가 배치되지 않는 경우

여러 가지 원인으로 샤드가 배치되지 않을 수 있는데,
그 중 **노드들이 가질 수 있는 샤드의 개수 제한**으로 인해 문제가 발생한 경우에 대해 살펴보겠습니다.
각 노드들은 가질 수 있는 샤드 제한되어 있고 이를 넘어가면 **더 이상 샤드가 생성되지 않고 인덱스 생성도 불가능**해집니다.
그리고 각 노드들이 가질 수 있는 샤드 수는 `cluster.max_shards_per_node`로 설정 할 수 있으며, <u>기본 값은 1000</u>입니다.

매일 생성되는 인덱스의 설정이 아래와 같다고 가정해 보겠습니다.

```yaml
{
  "index.number_of_shards": 5,
  "index.number_of_replicas": 1
}
```

매일 총 10개의 샤드가 생성이 되는데, 만약 1년간 로그를 유지한다면 10 * 365 = 3,650개의 샤드가 생성됩니다.
그런데 데이터 노드의 개수가 3대라면 가질 수 있는 샤드 수를 넘어가기 때문에 어느 순간부터 인덱스가 생성되지 않게 됩니다.

이 문제를 해결할 수 있는 방법은 다음과 같이 3가지입니다.

1. 데이터 노드 증설
2. 인덱스 설정 변경
3. `cluster.max_shards_per_node` 변경

이 중 인덱스 설정 변경을 살펴보겠습니다.
앞서 살펴본 인덱스 설정을 아래와 같이 변경하는 경우를 예로 들어보겠습니다.

```yaml
{
  "index.number_of_shards": 3,
  "index.number_of_replicas": 1
}
```

매일 총 6개의 샤드가 생성되며, 1년간 유지하면 6 * 365 = 2,190개의 샤드가 생성됩니다.
데이터 노드 3대가 각각 가지게 될 샤드의 개수는 730개로 1000개보다 적은 수를 유지하게 됩니다.

그 다음으로 `cluster.max_shards_per_node` 변경에 대해 알아보겠습니다.

```bash
PUT _cluster/settings
{
  "persistent": {
    "cluster.max_shards_per_node": "3000"
  }
}
```

그러나 너무 많은 샤드가 배치되면 CPU나 디스크, 힙메모리의 사용량이 증가하게 됩니다.
그렇기에 권고하지는 않습니다.

### 4.2.5. CMS GC 환경에서 잦은 Old GC가 발생하는 경우

CMS GC를 사용할 때, Old GC가 발생하면 Stop-the-World 현상이라고 하여 잠시 멈추는 현상이 발생합니다.
그렇기에 Old GC가 많이 발생하거나 작업이 길게 발생하면 성능에 영향을 끼칩니다.

<img width="902" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/8f48dd29-dffc-4eeb-b145-b4c4b9224f4d">

이렇게 잦은 Old GC 발생은 **불필요하게 많은 객체들이 Old 메모리 영역으로 이동**하기 때문에 발생합니다.

CMS GC 환경에서의 `JVM Heap Memory`는 다음과 같이 구성됩니다.

<img width="300" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/696f4545-601e-4f80-a835-8e72823375e9">

최초의 객체는 `Eden` 영역에 생성이 됩니다.
`Eden` 영역이 가득 차면 이 중 살아 남은 객체들은 `Survivor 0` 영역으로 이동하고, 또 여기서 살아 남은 객체는 `Survivor 1` 영역으로 이동하는데, 이를 마이너 GC(Young GC)라고 합니다.
그리고 `Survivor 1`에서 살아남은 객체는 `Old` 영역으로 이동하게 되는데 이를 메이저 GC(Old GC)라고 부릅니다.

그런데 만약 `Survivor` 영역이 이미 가득차서 `Eden`에서 `Survivor` 영역으로 이동할 수 없다면, `Eden` 영역에서 바로 `Old` 영역으로 이동하게 됩니다.

이러한 경우는 `Survivor` 영역을 늘려주어 해결할 수 있습니다.
이를 위해서는 `NewRatio`와 `SurvivorRatio` 튜닝이 필요합니다.

30 GB의 `Heap Memory`를 튜닝하지 않았을 때, 다음과 같은 비율로 영역이 공간을 할당 받습니다.

```text
Young:Old=1:9
Eden:S0:S1=8:1:1
```

즉, 각 영역은 다음과 같은 용량을 가지게 됩니다.

<img width="376" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/a2cf10d0-368d-4f98-aea8-7b4cee6ef0fd">

그렇기에 객체의 크기가 0.4 GB면 바로 Old 영역으로 이동하게 됩니다.

그렇다면 다음과 같이 `Heam Memory`를 튜닝한 경우를 하면 어떻게 될까요?
참고로, `CMSInitiatingOccupancyFraction`는 `Old` 영역이 몇 퍼센트 찼을 때 GC를 수행할 것인지에 대한 설정입니다.

```yaml
-XX:NewRatio=2
-XX:SurvivorRatio=6
-XX:CMSInitiatingOccupancyFraction=80 # Defaults 75
```

비율은 다음과 같이 변하게 됩니다.

```text
Young:Old=1:2
Eden:S0:S1=6:1:1
```

그리고 각 영역은 다음과 같은 용량을 가지게 됩니다.

<img width="372" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/fa13e930-7318-4beb-a028-1747e89f6522">

이렇게 변경하면 Old GC 타이밍이 27GB * 0.75 = 20.25GB에서 20GB * 0.8 = 16GB로 빨라지긴 하지만,
`Old` 영역에 들어오는 객체의 수가 많이 줄어되어 훨씬 안정적으로 운영할 수 있게 됩니다.


> 본 게시글은 [Elasticsearch Essential](https://www.inflearn.com/course/elasticsearch-essential) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.