# 03. Elasticsearch 모니터링하기

## 3.1. cat API 활용하기

`cat API`는 `Compact and Aligned Text (CAT) APIs`의 약자이며, **클러스터 정보를 사람이 읽기 편한 형태로 출력**하기 위한 용도로 만들어진 API 입니다.
cat API는 UI가 존재하지 않으며, 상황을 빠르게 판단하는 데 도움이 됩니다.
cat API는 8.x 버전에서 20개 이상을 제공하는데, 이 중 가장 많이 사용되는 네 가지 API에 대해서만 살펴보려 합니다.

### 3.1.1. _cat/health

`_cat/health`를 사용하면 **Elasticsearch 클러스터의 전반적인 상태를 확인**할 수 있습니다.

다음과 같이 API를 요청하며, 여기서 `v`(verbose) 파라미터는 헤더(컬럼의 이름)를 확인하기 위해 사용하였습니다.

```bash
GET _cat/health?v
```

실제로 요청을 하면 다음과 같은 응답 결과를 얻을 수 있습니다.

```bash
epoch      timestamp cluster        status node.total node.data shards pri relo init unassign pending_tasks max_task_wait_time active_shards_percent
1692459799 15:43:19  docker-cluster yellow          1         1     43  43    0    0        8             0                  -                 84.3%
```

이 중 `relo`은 재배치 중인 샤드 수이며, `init`은 생성되고 있는 샤드의 수입니다.
그리고 `unassign`은 아직 노드에 배치되지 않은 샤드의 수를 나타내며, `unassign`이 있어 클러스터의 상태인 `status`가 `yellow`인 것입니다.

`status`는 `yellow`를 포함하여 다음과 같은 세 가지 상태를 가집니다.

- `green`
  - 프라이머리 샤드, 레플리카 샤드 **모두 정상**적으로 각 노드에 배치되어 동작하고 있는 상태
- `yellow`
  - **프라이머리 샤드는 정상**적으로 동작하지만, **일부 레플리카 샤드가 정상적으로 배치되고 있지 않은 상태**
  - 색인 성능에는 이상이 없지만, 검색 성능에는 영향을 줄 수 있음
- `red`
  - **일부 프라이머리 샤드와 레플리카 샤드가 정상적으로 배치되지 않은 상태**
  - 색인 성능, 검색 성능에 모두 영향을 주며, **문서 유실**이 발생할 수 있음

### 3.1.2. _cat/nodes

`_cat/nodes`를 사용하면 **노드들의 전반적인 상태를 확인**할 수 있으며, 다음과 같이 요청을 합니다.

```bash
GET _cat/nodes?v
```

실제로 요청을 하면 다음과 같이 노드의 상태를 응답 결과로 얻을 수 있습니다.

```bash
ip         heap.percent ram.percent cpu load_1m load_5m load_15m node.role  master name
172.17.0.2           29          82   3    0.04    0.06     0.05 cdhilmrstw *      dab09e8a812c
```

그런데 기본적인 정보로 확인 가능한 정보는 제한적입니다.
그렇기에 `cat nodes`에서 제공하는 다양한 파라미터를 통해 추가적인 정보를 확인할 수 있습니다.
추가적인 정보를 제공하는 파라미터는 `GET _cat/nodes?help` 요청에 대한 응답이나 공식 홈페이지에서 확인할 수 있습니다.

파라미터는 다음과 같이 `h=` 뒤에 원하는 정보를 `,`를 기준으로 입력하면 됩니다.
그리고 `&`를 사용한 다음 `v` 파라미터를 입력하여, 헤더 정보를 출력하도록 설정하였습니다.

```bash
GET _cat/nodes?h=ip,heap.percent,disk.avail,name&v
```

실제 응답 결과는 다음과 같습니다.

```bash
ip         heap.percent disk.avail name
172.17.0.2           30     49.7gb dab09e8a812c
```

`_cat/nodes`는 다음과 같은 상황에서 활용하기 좋습니다.

- 노드들의 디스크 사용량 확인
- 노드들이 명확한 역할을 수행하고 있는지 확인
- 어떤 노드가 마스터 노드인지 확인
- 노드들의 메모리 사용량 확인

### 3.1.3. _cat/indices

`_cat/indices`를 사용하면 **인덱스의 상태를 확인**할 수 있으며, 다음과 같은 형태로 사용합니다.

```bash
GET _cat/indices?v
```

실제로 요청하면, 다음과 같이 인덱스에 대한 정보를 응답으로 받을 수 있습니다.

```bash
health status index                             uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow open   test2                             ejG97vpRR-KOButVFsXgzA   1   1          0            0       208b           208b
yellow open   test1                             QEJJTcpHRK6X8V6OTnqXnw   1   1          0            0       208b           208b
```

이 중 `health`는 인덱스의 상태 입니다. 인덱스의 상태는 클러스터의 상태에 영향을 끼칩니다.
1개 이상의 인덱스가 yellow 상태면 클러스터도 yellow 상태이고, 1개 이상의 인덱스가 red 상태이면 클러스터도 red 상태입니다.

`_cat/indices`는 다음과 같은 상황에서 활용하기 좋습니다.

- 인덱스들의 프라이머리 샤드 개수와 레플리카 샤드 개수 확인
- 이상 상태인 인덱스 확인

### 3.1.4. _cat/shards

`_cat/shards`를 사용하면 **샤드의 상태를 확인**할 수 있으며, 다음과 같이 사용합니다.

```bash
GET _cat/shards?v
```

그러면 다음과 같이 각 인덱스에 속하는 샤드들의 상태를 확인할 수 있습니다.

```bash
index                             shard prirep state      docs   store ip         node
test2                             0     p      STARTED       0    208b 172.17.0.2 dab09e8a812c
test2                             0     r      UNASSIGNED                         
test1                             0     p      STARTED       0    208b 172.17.0.2 dab09e8a812c
test1                             0     r      UNASSIGNED                         
```

상태를 확인해보면, 두 인덱스 모두 레플리카 샤드가 `UNASSIGNED` 상태입니다. 그로 인해 인덱스 `health`가 yellow 였던 것입니다.

그리고 `cat shards`도 `cat nodes`와 마찬가지로, 추가적인 정보를 제공하는 파라미터를 `GET _cat/shards?help` 요청에 대한 응답이나 공식 홈페이지에서 확인할 수 있습니다.

```bash
GET _cat/shards?h=index,shard,prirep,state,docs,unassigned.reason&v
```

위의 요청을 통해, 다음과 같이 어떠한 이유로 `unassigned` 되었는지에 대한 정보를 포함하여 다양한 샤드 정보를 확인할 수 있습니다.

```bash
index                             shard prirep state      docs unassigned.reason
test2                             0     p      STARTED       0 
test2                             0     r      UNASSIGNED      INDEX_CREATED
test1                             0     p      STARTED       0 
test1                             0     r      UNASSIGNED      INDEX_CREATED
```

그렇기에 `cat shards`는 이상 상태인 샤드를 확인하거나 샤드의 이상 상태 원인을 파악할 때 주로 사용합니다.

## 3.2. 주요 모니터링 지표 살펴보기

모니터링의 기본은 **이상 징후를 감지**하고 필요한 정보를 바탕으로 **전파**하는 것 입니다.

그렇다면 어떤 도구로 모니터링을 할 것인지도 중요합니다.
Elasticsearch 클러스터를 구성한다고 하면, 다음과 같은 세 가지 경우를 살펴볼 수 있습니다.

|          시스템 종류           |       추천하는 모니터링 도구       |
|:-------------------------:|:------------------------:|
|       Elastic Cloud       | Kibana의 Stack Monitoring |
| Self-Hosted Elasticsearch | Kibana의 Stack Monitoring |
|  AWS Opensearch Service   |      AWS CloudWatch      |

Stack Monitoring은 Kibana에서 기본적으로 제공하는 모니터링이기 때문에 다양한 상태를 확인할 수 있습니다.
AWS Opensearch Service는 AWS에서 제공하는 Elasticsearch 이며, AWS CloudWatch도 Stack Monitoring과 마찬가지로 다양한 상태를 확인할 수 있습니다.
그리고 이 외에도 Prometheus, Exporter를 사용하는 방법이 있습니다.

이렇듯 **클러스터를 모니터링할 수 있는 지표**는 매우 많습니다. 이렇게 많은 지표들 중에서도 **지표들 간 중요도**는 서로 다릅니다.
그렇기에 지표들이 **어떤 의미**를 가지는지, 어떤 지표를 **중점적**으로 모니터링 해야 하는지 기준을 잡는 것이 중요합니다.

지표는 다음과 같이 크게 두 가지로 나뉩니다.

1. 임계치를 걸어서 알람을 받아야 하는 지표
2. 문제 원인을 찾아내기 위해 분석 용도로 사용하는 지표

본격적으로 이러한 지표에 대해 살펴보겠습니다.
다음은 11가지의 주요 지표를 뽑아 1번 지표와 2번 지표로 나눈 것입니다.

<img width="383" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/82ee991f-e22b-40cf-8a69-07feec5aec23">

먼저 임계치 알림을 받아야 하는 지표들을 볼 때 어떤 것을 중점으로 보아야 하는지, 그리고 임계치 설정은 어느 정도로 할 것을 권장하는지에 대해 정리해보았습니다.

|     지표     | 모니터링 관점                                                                                                                             |               임계치 설정                |
|:----------:|:------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------:|
| CPU Usage  | 노드가 CPU를 얼마나 많이 사용하고 있는가                                                                                                            |               50% 이상                |
| Disk Usage | 노드가 얼마나 많은 문서를 저장하고 있는가                                                                                                             |               70% 이상                |
| Load (부하)  | 노드가 얼마나 많은 CPU와 디스크 연산을 처리하고 있는가                                                                                                    | CPU 개수에 따라 상이 (e.g. CPU가 2개이면 2 이상) |
|  JVM Heap  | 노드의 JVM이 얼마나 많은 메모리를 사용하고 있는가<br/>* 100%가 되면 OOM(Out of Memory)발생                                                                   |               85% 이상                |
|  Threads   | 처리량을 넘어서는 색인/검색 요청이 있는가<br/>* Queue와 Rejection이 있는데, Queue는 Elasticsearch에 순간적으로 많은 요청이 들어올 때 저장하는 공간이며, Queue가 가득차면 Rejection이 발생함 |        Rejected Threads 1이상         |

그 다음으로 원인 분석을 위한 지표들은 어떤 의미를 가지는지, 그리고 어떤 상황에 확인하면 좋은지에 대해 정리해 보았습니다.

|      지표      | 의미                                      | 상황                                                |
|:------------:|:----------------------------------------|:--------------------------------------------------|
| Memory Usage | 노드의 메모리 사용량<br/>* JVM Heap(JVM 사용량)과 다름 | JVM Heap이 많이 사용될 때, JVM Heap을 늘릴 수 있을지 확인이 필요한 상황 |
|   Disk I/O   | 노드에서 발생하는 디스크 연산(I/O) 지연 시간             | CPU가 급격히 증가했을 때, Disk I/O가 불필요하게 많이 일어나지는 않았는지 확인 |
|   GC Rate    | 노드에서 발생하는 GC(Young, Old)의 발생 주기         ||
| GC Duration  | 노드에서 발생하는 GC(Young, Old) 소요 시간          ||
|   Latency    | 노드에서 색인 및 검색에 소요되는 시간                   | Reject 발생 시, 처리에서 많은 시간이 소요되지는 않았는지 확인            |
|     Rate     | 노드에서 색인 및 검색 요청이 인입되는 양                 | Reject 발생 시, 요청이 급증하였는지 확인                        |

> 본 게시글은 [Elasticsearch Essential](https://www.inflearn.com/course/elasticsearch-essential) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.