# 02. Elasticsearch 동작 이해하기

## 2.1. 색인 과정 이해하기

색인(indexing)이란 **문서를 분석하고 저장하는 과정**입니다. 색인 과정은 다음과 같이 진행됩니다.

<img width="617" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/3437fd56-3dda-4ccb-bd6a-5299beaa7ffc">

샤드와 관련하여 색인이 되는 과정을 조금 더 자세히 살펴보도록 하겠습니다.

다음과 같이 `number_of_shard`와 `number_of_replicas`가 기본 값으로 설정된 3개의 데이터 노드가 있습니다.
이 중 1번 데이터 노드에 색인 요청(`PUT /books/_doc/1`)을 하면, 내부에 있는 프라이머리 샤드에 색인을 하고 레플리카 샤드에 복사합니다.

<img width="646" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/201989fa-e3c5-4294-9ac4-fee5a4ad9b23">

이번에는 2번 데이터 노드에 색인 요청(`PUT /books/_doc/2`)을 해보겠습니다.
색인 요청을 하면, 2번 데이터 노드는 프라이머리 샤드를 가지고 있지 않아 1번 데이터 노드로 요청을 전달합니다.
그러면 1번 데이터 노드에서 프라이머리 샤드에 색인하고, 레플리카 샤드에 복사합니다.

<img width="582" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/ac848b40-ec54-4cb6-9037-17a62bd9f1bf">

이 과정을 통해 우리는 여러 대의 데이터 노드 중 프라이머리 샤드를 가진 단 하나의 데이터 노드에서만 색인이 일어난다는 사실을 확인할 수 있습니다.
심지어 레플리카 샤드도 존재하지 않는 3번 데이터 노드는 색인과 관련된 일을 하지 않고 있습니다.
색인의 관점에서 보면 데이터 노드는 3대이지만, 사실상 1대만 있는 것과 마찬가지입니다.
이는 클러스터로서의 이점을 전혀 살리지 못하고 있는 상황이며, 
**적절한 수의 샤드 개수를 설정하는 것이 성능에 큰 영향**을 미친다는 것을 알 수 있습니다.

이번에는 다음과 같은 인덱스 템플릿이 설정되었을 때의 색인 과정을 살펴보겠습니다.

```bash
PUT _index_template/base_template
{
  "index_patterns": ["books"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1
    }
  }
}
```

세 가지 색인 요청을 살펴보면, 프라이머리 샤드가 3개이기 때문에 3대의 데이터 노드 모두 색인에 참여한다는 사실을 확인할 수 있습니다.

<img width="369" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/4bb9865b-e8a8-4de7-84e2-f4eb5b97c63c">

그렇다면 여기서 데이터 노드가 하나 더 추가된다면 어떻게 될까요?

다음 그림은 데이터 노드가 추가됨에 따라 샤드의 배치가 변경된 모습입니다.

<img width="564" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/e5063fbd-3426-456c-9dff-94050be99f07">

프라이머리 샤드는 3개이기에 사실상 색인에 참여하는 노드는 3대입니다.
그리고 만약 각 샤드가 10GB씩 사용한다고 하면, 1번과 3번 데이터 노드는 10GB, 2번과 4번 데이터 노드은 20GB로 다른 용량을 가지게됩니다.
다시 말해, 데이터 노드가 하나 추가되면 샤드의 개수가 고르게 분배되지 않기 때문에 **용량 불균형**이 일어날 수 있습니다.

그렇다면 **적절한 샤드의 개수**는 어떻게 정해야 할까요? 사실 처음부터 완벽한 샤드 배치 계획을 세울 순 없습니다.
그렇지만 샤드의 개수를 어떻게 정하면 좋을지에 대해 예제를 통해 살펴보도록 하겠습니다.

예를 들어 하루 100GB의 로그를 30일간 저장하는 클러스터를 생성한다고 하면, 다음과 같은 과정을 통해 클러스터를 구성할 수 있습니다.

1. 필요한 저장 공간 : 100GB * 2 (레플리카) * 30 = 600GB
2. 인덱스 별 샤드의 최대 크기를 10GB로 설정하면, 인덱스 별 프라이머리 샤드 개수는 10개
3. 데이터 노드의 개수를 10개로 설정하면 데이터 노드 당 가져야 할 디스크의 크기는 600GB
4. 데이터 노드 장애를 대비해서 700GB 정도로 설정

성능에 문제가 있다면 샤드 수를 늘리거나 데이터 노드를 스케일 아웃/업하면서 최적의 수치를 찾아 갑니다.
- e.g. 데이터 노드의 CPU가 남아 더 처리할 수 있다면 샤드의 개수를 늘린다.
- e.g. CPU가 너무 많이 사용한다면 데이터 노드 개수를 늘린다.

## 2.2. 검색 과정 이해하기

검색 과정은 다음과 같이 이루어집니다.

<img width="150" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/9f7fd5fc-872d-4246-8957-de051cecfc6c">

여기서 `inverted index`는 **문자열을 분석한 결과를 저장하고 있는 구조체**입니다.
다음과 같이 생성된 도큐먼트를 분석기를 통해 분석한 다음, 분석한 결과인 토큰과 어떤 도큐먼트에 있는지에 대한 정보를 `inverted index`에 저장하고 있다고 이해하시면 됩니다.

<img width="543" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/82d3b311-5aca-422e-8c7d-e1618952b5b2">

문자열을 분석해서 `inverted index` 구성을 위한 토큰을 만들어 내는 과정을 **애널라이저(`Analyzer`)** 라고 합니다.
애널라이저는 다음과 같이 `character filter`, `tokenizer`, `token filter`로 구성됩니다.

<img width="639" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/cb444cbf-ad55-4001-bcd4-ca88c8504ac0">

`character filter`는 입력받은 문자열을 변경하거나 불필요한 문자들을 제거하는 등 전처리를 합니다.
그리고 `tokenizer`는 문자열을 토큰으로 분리합니다. 마지막으로 `token filter`는 분리된 토큰의 필터 작업으로 대소문자 구분이나 형태소 분석 등의 후처리를 합니다.

이러한 애널라이저는 다음과 같이 API 요청을 통해서 동작을 확인할 수도 있습니다.

```bash
GET _analyze
{
  "analyzer": "standard",
  "text": "linux kernel"
}
```

그러면 다음과 같은 애널라이저 결과를 응답으로 받을 수 있습니다.

```json
{
  "tokens" : [
    {
      "token" : "linux",
      "start_offset" : 0,
      "end_offset" : 5,
      "type" : "<ALPHANUM>",
      "position" : 0
    },
    {
      "token" : "kernel",
      "start_offset" : 6,
      "end_offset" : 12,
      "type" : "<ALPHANUM>",
      "position" : 1
    }
  ]
}
```

애널라이저에 대한 내용과 함께 검색 과정을 다시 정리하면 다음과 같습니다.

<img width="340" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/87587609-e766-4cd4-87e3-60216d151acf">

검색 요청은 색인과 달리 **프라이머리 샤드와 레플리카 샤드 모두 처리** 할 수 있습니다.

다음과 같이 프라이머리 샤드와 레플리카 샤드가 구성되어 있을 때, 검색 요청은 두 대의 데이터 노드에서만 처리가 가능합니다.

<img width="528" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/8526420a-8eeb-473a-93ca-8d35af462be4">

이 상황에서 색인 성능은 그대로 유지하고 **검색 성능만 높이고 싶은 경우**, `number_of_replicas`를 늘리면 됩니다.

<img width="528" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/337a54bf-144d-4837-b47f-f2c136d573d8">

`number_of_replicas`는 변경하여도 이슈가 없기 때문에, 운영 중 검색 성능을 높이고 싶다면 `number_of_replicas` 값을 변경하면 됩니다.
그러나 `number_of_shards`를 변경하면 `Routing Rule`이 변경되기 때문에 인덱스 생성 후 변경해서는 안됩니다.

## 2.3. text vs. keyword

이번에는 문자열을 나타내기 위한 타입인 `text`와 `keyword`의 차이점에 대해 살펴보겠습니다.

먼저 `text` 타입은 전문 검색(Full-text search)을 위해 토큰이 생성됩니다.
`analyze API`를 통해 어떻게 토큰이 생성되는지 살펴보겠습니다.

```bash
GET _analyze
{
  "analyzer": "standard",
  "text": "elasticsearch essential"
}
```

명령어를 실행하면 다음과 같이 띄워쓰기를 기준으로 분리되어 생성된 토큰을 볼 수 있습니다.
그렇기에 `elasticsearch`라고만 검색해도 `elasticsearch essential`이라는 문자열을 검색 결과로 가져올 수 있습니다.

```json
{
  "tokens" : [
    {
      "token" : "elasticsearch",
      "start_offset" : 0,
      "end_offset" : 13,
      "type" : "<ALPHANUM>",
      "position" : 0
    },
    {
      "token" : "essential",
      "start_offset" : 14,
      "end_offset" : 23,
      "type" : "<ALPHANUM>",
      "position" : 1
    }
  ]
}
```

그리고 `keyword` 타입은 `Exact Matching`을 위해 토큰이 생성됩니다.
마찬가지로 `analyze API`를 통해 어떻게 토큰이 생성되는지 살펴보겠습니다.

```bash
GET _analyze
{
  "analyzer": "keyword",
  "text": "elasticsearch essential"
}
```

명령어를 실행하면 입력한 텍스트가 하나의 토큰으로 저장된 것을 확인할 수 있습니다.
그렇기에 keyword 타입의 색인 속도가 더 빠릅니다.

```json
{
  "tokens" : [
    {
      "token" : "elasticsearch essential",
      "start_offset" : 0,
      "end_offset" : 23,
      "type" : "word",
      "position" : 0
    }
  ]
}
```

이렇듯 똑같은 문자열이지만, 타입에 따라 다르게 토큰이 생성되는 것을 확인할 수 있습니다.

<img width="445" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/7af7c34b-1c32-41f8-b403-df6e0181207b">

그리고 문자열 필드가 **동적 매핑되면 text 타입과 keyword 타입이 모두 생성**됩니다.
그렇기에 문자열의 특성에 따라 text 타입과 keyword 타입을 **정적 매핑 해주면 성능에 도움**이 됩니다.

text 타입과 keyword 타입을 정적 매핑할 때 도움이 될 수 있도록 어떤 필드를 추천하는지 예시를 적어 보았습니다.

|        text 타입을 추천하는 필드        |  keyword 타입을 추천하는 필드   |
|:------------------------------:|:----------------------:|
| 주소<br/>이름<br/>물품 상세 정보<br/>... | 성별<br/>물품 카테고리<br/>... |

물론 반드시 이렇게 하는 것이 좋다가 아니며, 상황에 맞춰 text 타입과 keyword 타입을 설정할 것을 추천드립니다.

> 본 게시글은 [Elasticsearch Essential](https://www.inflearn.com/course/elasticsearch-essential) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.