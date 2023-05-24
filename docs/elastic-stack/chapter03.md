# 03. 엘라스틱서치 기본

::: tip ✅ 실습 환경

- Elasticsearch 7.10.2  
- Kibana 7.10.2

:::

## 3.1. 준비 작업

### 3.1.1. 엘라스틱서치 요청과 응답
엘라스틱서치는 **모든 요청과 응답을 REST API 형태로 제공**합니다.

![image](https://github.com/Kim-SuBin/TIL/assets/46712693/34e36450-2ef1-4f73-9c54-66b771d97846)

REST란 `Representational State Transfer'의 약자로, 웹 상의 모든 리소스에 URI를 부여하고 활용하는 아키텍처입니다. REST는 다음과 같은 디자인 원칙을 가집니다.
1. 균일한 인터페이스
    - 요청이 어디에서 오는지와 무관하게, 동일한 리소스에 대한 모든 API 요청은 동일하게 보여야 함
    - 클라이언트가 필요로 하는 모든 정보를 포함해야 함
2. 클라이언트-서버 디커플링
    - REST API 디자이너에서 클라이언트와 서버 애플리케이션은 서로 간에 완전히 독립적이어야 함
3. Stateless (무상태)
    - 각 요청에서 처리에 필요한 모든 정보를 포함해야 함
4. 캐싱 가능성
    - 가능하면 리소스를 클라이언트나 서버에서 캐싱할 수 있어야 함
    - 서버 응답에 전달된 리소스에 대해 캐싱 허용 여부에 대한 정보가 포함되어야 함
5. 계층 구조 아키텍처
    - 호출과 응답이 서로 다른 계층을 통과함
6. 코드 온디맨드
    - 일반적으로 정적 리소스를 전송하지만, 특정 응답에 실행 코드를 포함할 수도 있음

REST API는 이러한 REST 아키텍처 스타일의 디자인 원칙을 준수하는 API 입니다. REST API는 다음과 같은 네 가지 메소드 타입을 가지고 리소스의 CRUD(생성/조회/수정/삭제) 작업을 진항하며, URI는 리소스를 명시하는 방법입니다.

|메소드|설명|
|:---:|:---|
|POST|리소스 추가|
|GET|리소스 조회|
|PUT|리소스 수정|
|DELETE|리소스 삭제|

### 3.1.2. 키바나 콘솔 사용법

`Management > Dev Tools`를 선택하면 키바나 콘솔 화면으로 이동됩니다.

![image](https://github.com/Kim-SuBin/TIL/assets/46712693/1b341697-cc67-40c9-858b-404029178569)

키바나 콘솔을 이용하면 복잡한 앱 개발이나 프로그램 설치 없이 엘라스틱서치와 REST API로 통신할 수 있습니다. 키바나 콘솔은 엘라스틱서치 API 자동 완성 기능도 지원하며, 문법이 올바른지 구문 검사도 해주기 때문에 입력 오류로 인한 불필요한 시간 낭비도 막아줍니다.

### 3.1.3. 시스템 상태 확인

`cat API`를 사용하면 엘라스틱서치의 현재 상태를 빠르게 확인할 수 있습니다. 여기서 cat은 'compact and aligned text'의 약어이며, 콘솔에서 시스템 상태를 확인할 때 가독성을 높일 목적으로 만들어진 API 입니다.

`GET _cat`을 요청하면 cat API가 지원하는 목록을 확인할 수 있습니다.

![image](https://github.com/Kim-SuBin/TIL/assets/46712693/a2aacf31-e009-49cf-9a62-14b306c1bc1c)

위 이미지를 통해 알 수 있듯이, cat API를 통해 노드, 샤드, 템플릿 등의 상태 정보나 통계 정보를 확인할 수 있습니다.

예를 들어, 아래와 같은 명령어를 입력하면 클러스터 내부 인덱스 목록을 확인할 수 있습니다.

```bash
GET _cat/indices?v
```

`?` 기호 뒤에는 붙은 `v`는 파라미터이며, v (verbose) 파라미터를 사용하면 컬럼의 이름을 확인할 수 있습니다. v 외에도 정렬 옵션인 s (sort) 파라미터, 설정한 열만 표시하는 h (header) 파라미터 등이 있습니다. cat API에 대한 더 자세한 내용이 궁금하시다면 [공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/7.10/cat.html)를 참고하시길 바랍니다.

확인된 결과는 다음과 같습니다.

```bash
health status index     uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   .kibana_1 PGiP7ED9RYqaQ4WwNOQSHA   1   1         41           14     99.1kb         44.7kb
```

## 3.2. 인덱스와 도큐먼트
엘라스틱서치는 다음과 같이 클러스터(cluster), 인덱스(index)와 도큐먼트(document), 필드(field)로 구성되어 있습니다.

![image](https://github.com/Kim-SuBin/TIL/assets/46712693/d27fa8f4-af1c-44bd-8b69-77dfa0fa57bd)

엘라스틱서치를 이해하기 위해서는 인덱스와 도큐먼트가 무척 중요합니다. 지금부터 인덱스와 도큐먼트에 대해 조금 더 자세하게 알아보도록 하겠습니다.

### 3.2.1. 도큐먼트

도큐먼트에 대해 정리하면 다음과 같습니다.
- 엘라스틱서치에서 데이터가 저장되는 기본 단위
- JSON 형태
- 하나의 도큐먼트는 여러 필드(field)와 값(value)을 가짐
- 인덱스 내부에 생성됨

RDB를 알고 있다면 아래 표를 통해 더 직관적으로 이해될 것입니다.

|RDB|엘라스틱서치|
|:---:|:---:|
|테이블|인덱스|
|레코드|도큐먼트|
|컬럼|필드|
|스키마|매핑|

참고로, 엘라스틱서치 7.x 이전 버전에는 타입(type)이라는 개념이 존재했습니다. 그러나 여기서는 7.10.2 버전을 통해 사용하기 때문에 타입이 존재하지 않으므로, 관련 설명은 생략하도록 하겠습니다.

### 3.2.2. 인덱스

인덱스에 대해 정리하면 다음과 같습니다.

- 도큐먼트를 저장하는 논리적 단위
- 하나의 인덱스에 다수의 도큐먼트가 포함되는 구조
- 클러스터 내부에 생성됨
- 인덱스 이름에는 영어 소문자와 \, /, *, ?, ", <, >, |, #, 공백, 쉼표 등을 제외한 특수문자를 사용할 수 있으며, 255 바이트를 넘을 수 없음

인덱스 그룹핑 방법은 다음과 같이 2가지입니다.

1. 스키마에 따른 그룹핑
    - 스키마에 따라 인덱스를 구분한다.<br/>e.g. 회원 정보 인덱스, 장바구니 인덱스
    - 인덱스 스키마는 매핑을 통해 정의한다.
2. 관리 목적의 그룹핑
    - 성능을 위해 인덱스 용량을 제한해야 한다.<br/>인덱스는 용량이나 숫자 제한 없이 무한대의 도큐먼트를 포함할 수 있는데, 인덱스가 커지면 검색 시 많은 도큐먼트를 참조해야 하기 때문에 성능이 나빠질 수 있다.
    - 주로 도큐먼트 개수, 용량, 날짜/시간 단위로 분리한다.
    - 날짜/시간 단위로 분리하면 특정 날짜의 데이터를 쉽게 처리할 수 있다.<br/>e.g. 1개월 지난 데이터 모두 삭제

## 3.3. 도큐먼트 CRUD

### 3.3.1. 인덱스 생성/확인/삭제

도큐먼트는 반드시 하나의 인덱스에 포함되어야 하기 때문에, 도큐먼트 CRUD에 대해 알아보기 전 인덱스를 생성/확인/삭제하는 방법을 알아보도록 하겠습니다. 실습은 키바나 콘솔에서 진행하도록 하겠습니다.

1. 인덱스 생성하기

```bash
PUT {인덱스명}
# 예제
PUT index1
```

2. 인덱스 확인하기

```bash
GET {인덱스명}
# 예제
GET index1
```

3. 인덱스 삭제하기

```bash
DELETE {인덱스명}
# 예제
DELETE index1
```

**인덱스를 삭제하면 인덱스에 저장되어 있는 모든 도큐먼트가 삭제되므로 주의**해야 합니다.

### 3.3.2. 도큐먼트 생성

도큐먼트를 인덱스에 포함시키는 것을 **인덱싱(indexing)** 이라고 합니다. 아래 명령어를 통해 도큐먼트를 인덱싱해봅시다.

```bash
PUT index2/_doc/1
{
    "name" : "mike",
    "age" : 25,
    "gender" : "male"
}
```

명령어를 실행하면 기존에 존재하지 않던 index2 인덱스가 생성됨과 동시에 index2에 도큐먼트를 인덱싱합니다. 명령어의 각 내용을 살펴보면 다음과 같습니다.

- index2 : 인덱스 이름
- _doc : 엔드포인트 구분을 위한 예약어
- 1 : 인덱싱할 도큐먼트 고유 아이디
- name, age, gender : 필드

index2가 정상적으로 생성되었는지 조회해봅시다.

```bash
GET index2
```

명령어를 실행하면 다음과 같이 각 데이터 타입이 자동으로 지정된 것을 확인할 수 있습니다.

```json
{
  "index2" : {
    "aliases" : { },
    "mappings" : {
      "properties" : {
        "age" : {
          "type" : "long"
        },
        "gender" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        },
        "name" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        }
      }
    },
    // ...
  }
}
```
또한, 새로운 필드를 추가하고 기존 필드 일부를 생략해도 인덱싱은 정상 동작합니다.

```bash
PUT index2/_doc/2
{
    "name" : "jane",
    "country" : "france"
}
```

그리고 데이터 타입을 잘못 입력한 경우에는 엘라스틱서치에서 알아서 형변환을 해줍니다.

```bash
PUT index2/_doc/3
{
    "name" : "luna",
    "age" : "20"
}
```

이렇게 엘라스틱서치는 데이터 타입을 지정하지 않아도 도큐먼트의 필드와 값을 보고 자동으로 데이터 타입을 지정해주는 것을 다이나믹 매핑(dynamic mapping)이라고 하며, 관련 내용은 뒤에서 더 자세하게 다루도록 하겠습니다.

### 3.3.3. 도큐먼트 읽기
도큐먼트를 읽는 방법은 크게 두 가지입니다.

1. 도큐먼트 아이디를 이용해 조회하는 방법

```bash
GET index2/_doc/1
```

도큐먼트 아이디를 이용해 조회하면, 명령어 내 도큐먼트 아이디를 가진 도큐먼트 하나만을 가져옵니다.

2. 쿼리 DSL (Domain Specific Language)를 이용해 검색하는 방법

```bash
GET index2/_search
```

쿼리 DSL을 사용한 위 명령어는 index2 인덱스 내의 모든 도큐먼트를 가져옵니다.

### 3.3.4. 도큐먼트 수정

**PUT**을 사용한 도큐먼트 인덱싱 과정에서 같은 도큐먼트 아이디가 있으면 **덮어쓰기** 됩니다.

```bash
PUT index2/_doc/1
{
    "name" : "park",
    "age" : 45,
    "gender" : "male"
}
```

위의 수정 명령어 실행 후 `GET index/_doc/1` 명령어를 실행하면 정상적으로 덮어쓰기가 된 것을 확인할 수 있습니다.

```json
{
  "_index" : "index2",
  "_type" : "_doc",
  "_id" : "1",
  // ...
  "_source" : {
    "name" : "park",
    "age" : 45,
    "gender" : "male"
  }
}
```

PUT은 무조건 덮어쓰기 때문에 도큐먼트 내용 중 일부만 업데이트를 하려고 해도, 수정할 내용을 포함한 모든 도큐먼트 내용을 입력해야 합니다. 만약 1번 도큐먼트의 이름과 나이만 변경하려고 할 때, 다음과 같이 입력하면 gender 정보가 사라지는지 확인해봅시다.

```bash
PUT index2/_doc/1
{
    "name" : "kim",
    "age" : 25
}
```

`GET index/_doc/1` 명령어를 실행하면 정상적으로 덮어쓰기되어 gender가 사라진 것을 확인할 수 있습니다.

```json
{
  "_index" : "index2",
  "_type" : "_doc",
  "_id" : "1",
  // ...
  "_source" : {
    "name" : "kim",
    "age" : 25
  }
}
```

**일부 필드만 업데이트**하고 싶다면 **update API**를 사용하면 됩니다.

```bash
POST index2/_update/1
{
    "doc" : {
      "name" : "lee"
    }
}
```

`GET index/_doc/1` 명령어를 실행하면 name만 변경되고 나머지 데이터는 그대로 존재하는 것을 확인할 수 있습니다.

```json
{
  "_index" : "index2",
  "_type" : "_doc",
  "_id" : "1",
  // ...
  "_source" : {
    "name" : "lee",
    "age" : 25
  }
}
```

그러나 엘라스틱서치 도큐먼트 수정 작업은 비용이 많이 들기 때문에 권장하지 않습니다. 수정 작업이 많다면, 다른 데이터베이스를 이용하는 것이 좋습니다.

### 3.3.5. 도큐먼트 삭제

다음과 같이 `DELETE {인덱스 이름}/_doc/{도큐먼트 아이디}`로 명령어를 실행하면, 도큐먼트 아이디에 해당하는 도큐먼트가 삭제됩니다.

```bash
DELETE index2/_doc/2
```

수정과 마찬가지로 삭제 작업은 비용이 많이 들기 때문에 사용 시 주의해야 합니다.

## 3.4. 응답 메시지

엘라스틱서치 REST API 응답 코드는 다음과 같습니다.

|코드|상태|해결 방법|
|:---:|:---|:---|
|200, 201|정상 수행||
|4xx|클라이언트 오류|클라이언트에서 문제 수정|
|404|요청한 리소스가 없음|인덱스나 도큐먼트가 존재하는지 체크|
|405|요청 메소드(GET, POST 등)을 지원하지 않음|API 사용법 다시 확인|
|429|요청 과부화(busy)|재전송, 노드 추가 같은 조치|
|5xx|서버 오류|엘라스틱서치 로그 확인 후 조치|

아직 만들어지지 않은 index5라는 이름을 가진 인덱스를 조회하여 어떻게 응답되는지 살펴봅시다.

```bash
GET index5
```

`status`로 404를 반환하며, 오류 원인을 `reason`에 상세히 설명해주는 것을 확인할 수 있습니다.

```json
{
  "error" : {
    "root_cause" : [
      {
        "type" : "index_not_found_exception",
        "reason" : "no such index [index5]",
        "resource.type" : "index_or_alias",
        "resource.id" : "index5",
        "index_uuid" : "_na_",
        "index" : "index5"
      }
    ],
    "type" : "index_not_found_exception",
    "reason" : "no such index [index5]",
    "resource.type" : "index_or_alias",
    "resource.id" : "index5",
    "index_uuid" : "_na_",
    "index" : "index5"
  },
  "status" : 404
}
```

## 3.5. 벌크 데이터

엘라스틱서치는 여러 개의 API를 한 번에 수행할 수 있는 `bulk API`를 지원하며, bulk API를 통해 REST API 콜(call) 횟수를 줄여 성능을 높일 수 있습니다.

bulk API는 도큐먼트 읽기는 지원하지 않고, **도큐먼트 생성/수정/삭제**만 지원합니다.

```bash
POST _bulk
{"index" : {"_index" : "test", "_id" : "1"}}
{"field1" : "value1"}
{"create" : {"_index" : "test", "_id" : "3"}}
{"field1" : "value3"}
{"update" : {"_id" : "1", "_index" : "test"}}
{"doc" : {"field2" : "value2"}}
{"delete" : {"_index" : "test", "_id" : "2"}}
```

위 예제를 통해 알 수 있는 사실은 다음과 같습니다.

- 삭제는 한 줄, 나머지는 두 줄로 작성
  - 첫 번째 줄은 bulk 키워드를 포함한 도큐먼트 작업 정보
  - 두 번째 줄은 생성/수정 관련 field, value
- NDJSON (New-line Delimited JSON) 형태 : 복수의 JSON 구조를 줄바꿈 문자열로 구분

 벌크 데이터를 파일 형태로 만들어서 적용하는 방법도 있습니다. 키바나 콘솔에서는 파일 불러오기를 할 수 없기 때문에 콘솔에서 `curl`로 `bulk API`를 사용해봅시다.

먼저, 다음과 같은 내용을 가진 벌크 파일 bulk_index2를 생성합니다.

```json
{"index" : {"_index" : "index2", "_id" : "4"}}
{"name" : "park",  "age" : 30, "gender" : "female"}
{"index" : {"_index" : "index2", "_id" : "5"}}
{"name" : "jung",  "age" : 50, "gender" : "female"}
{"index" : {"_index" : "index2", "_id" : "6"}}
{"name" : "lee",  "age" : 40, "gender" : "female"}
{"index" : {"_index" : "index2", "_id" : "7"}}
{"name" : "kim",  "age" : 20, "gender" : "female"}
```

그리고 아래의 `curl` 명령어를 통해 bulk 파일을 실행합니다.

```bash
curl -H "Content-Type: application/x-ndjson" -X POST "localhost:9200/_bulk" --data-binary "@./bulk_index2"
```

curl 명령을 자세히 살펴보면 다음과 같습니다.
- `-H` : curl 헤더 옵션, 여기서는 NDJSON 타입의 콘텐츠를 사용한다는 의미
- `-X` : 요청 메소드, 여기서는 POST
- `localhost:9200` : 엘라스틱서치 호스트 주소
- `/_bulk` : bulk API 호출
- `--data-binary` : POST 메소드에 파일을 바이너리 형태로 전송해주는 파라미터

## 3.6. 매핑

매핑(mapping)은 **JSON 형태의 데이터를 루씬이 이해할 수 있도록 바꿔주는 작업**입니다. 엘라스틱서치가 자동으로 하면 다이나믹 매핑, 사용자가 직접 설정하면 명시적 매핑이라고 합니다.

### 3.6.1. 다이나믹 매핑

엘라스틱서치의 모든 인덱스는 매핑 정보를 갖고 있지만, 정의를 강제하지 않습니다. 그렇기 때문에 앞에서 index2 인덱스를 만들 때 따로 매핑을 설정하지 않았습니다. 그럼에도 도큐먼트가 인덱싱되었던 이유는 엘라스틱서치의 다이나믹 매핑(dynamic mapping) 때문입니다. 원본 데이터가 다이나믹 매핑에 의해 어떤 타입으로 변환되는지 아래 표를 통해 살펴봅시다.

|원본 소스 데이터 타입|다이나믹 매핑으로 변환된 데이터 타입|
|:---|:---|
|null|필드를 추가하지 않음|
|boolean|boolean|
|float|float|
|integer|long|
|object|object|
|string|string 데이터 형태에 따라 date, text/keword 필드|

다이나믹 매핑의 장단점은 다음과 같습니다.
- 장점
  - 스키마 설계를 고민하기보다 데이터의 형태만 고민하면 됨
- 단점
  - 숫자 타입은 무조건 범위가 가장 넓은 long으로 매핑되어 불필요한 메모리를 차지할 수 있음
  - 문자열의 경우 검색과 정렬 등을 고려한 매핑이 제대로 되지 않음

엘라스틱서치는 인덱스 매핑값을 확인할 수 있는 `mapping API`를 제공하고 있습니다. mapping API를 통해 index2 인덱스의 매핑 값이 어떻게 되어 있는지 확인해봅시다.

```bash
GET index2/_mapping
```

명령어를 실행해보면 다음과 같이 age는 long 타입으로 매핑되어 있고, country와 gender, name은 text 타입과 keyword 타입이 모두 선언되어 있는 것을 확인할 수 있습니다.

```json
{
  "index2" : {
    "mappings" : {
      "properties" : {
        "age" : {
          "type" : "long"
        },
        "country" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        },
        "gender" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        },
        "name" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        }
      }
    }
  }
}
```

### 3.6.2. 명시적 매핑

인덱스를 직접 정의하는 명시적 매핑은 두 가지 방법을 통해 인덱스에 매핑을 할 수 있습니다.

1. 인덱스를 생성할 때 mappings 정의 설정
2. mapping API를 이용해 매핑 지정

먼저 인덱스를 생성할 때 mappings 정의를 설정하는 방법을 살펴보도록 하겠습니다. mappings 정의 설정은 다음과 같은 구조로 합니다.

```bash
PUT "인덱스명"
{
    "mappings": {
        "properties": {
            "필드명" : "필드 타입"
        }
    }
}
```

이 구조로 index3 인덱스를 만들면서 직접 매핑을 해보도록 하겠습니다.

```bash
PUT index3
{
    "mappings": {
        "properties": {
            "age": {"type": "short"},
            "name": {"type": "text"},
            "gender": {"type": "keyword"}
        }
    }
}
```

`GET index3/_mapping`을 통해 설정한 매핑이 적용되었는지 확인해보면, 아래와 같이 정상적으로 적용된 것을 확인할 수 있습니다.

```json
{
  "index3" : {
    "mappings" : {
      "properties" : {
        "age" : {
          "type" : "short"
        },
        "gender" : {
          "type" : "keyword"
        },
        "name" : {
          "type" : "text"
        }
      }
    }
  }
}
```

이렇게 명시적 매핑을 하려면 **인덱스에 들어갈 데이터의 구조를 이해**하고 있어야 합니다.그리고 **인덱스 매핑이 정해지면 새로운 필드는 추가할 수 있으나, 이미 정의된 필드를 수정하거나 삭제할 수는 없습니다.** 그러므로 매핑 작업은 신중하게 해야 합니다. 여기서는 `properties` 파라미터를 사용하였는데, 이 외에 분석기(analyzer)나 포맷(format) 등을 설정하는 파라미터도 있습니다.

### 3.6.3. 매핑 타입

명시적 매핑을 하기 위해서는 엘라스틱서치에서 사용하는 데이터 타입에 대한 이해가 필요합니다. 다양한 데이터 타입 중 기본적인 데이터 타입에 대해서만 살펴보도록 하겠습니다.

|데이터 형태|데이터 타입|설명|
|:---:|:---|:---|
|텍스트|text|전문 검색이 필요한 데이터로, 텍스트 분석기가 텍스트를 작은 단위로 분리함|
||keyword|정렬이나 집계에 사용되는 텍스트 데이터로, 원문을 통째로 인덱싱함|
|날짜|date|날짜/시간 데이터|
|정수|byte|부호 있는 8비트 데이터 (-128 ~ 127)|
||short|부호 있는 16비트 데이터 (-32,768 ~ 32,767)|
||integer|부호 있는 32비트 데이터 (-2^31 ~ 2^31 - 1)|
||long|부호 있는 64비트 데이터 (-2^63 ~ 2^63 - 1)|
|실수|scaled_float|float 데이터에 특정 값을 곱해서 정수형으로 바꾼 데이터. 정확도는 떨어지나 필요에 따라 집계 등에서 효율적으로 사용 가능|
||half_float|16비트 부동소수점 실수 데이터|
||double|32비트 부동소수점 실수 데이터|
||float|64비트 부동소수점 실수 데이터|
|불린|boolean|참/거짓 데이터로, true/false 만을 값으로 가짐|
|IP 주소|ip|ipv4, ipv6 타입 IP 주소로 입력 가능|
|위치 정보|geo-point|위도, 경도 값을 가짐|
||geo-shape|하나의 위치 포인트가 아닌 임의의 지형|
|범위 값|integer_range, long_range, float_range, double_range, ip_range, date_range|범위를 설정할 수 있는 데이터, integer_range, long_range는 정수형 범위, float_range, double_range는 실수형 범위, ip_range는 IP 주소 범위, date_range는 날짜/시간 데이터 범위 값을 저장하고 검색할 수 있게 함. 최솟값과 최댓값을 통해 범위 입력|
|객체형|object|계층 구조를 갖는 형태로, 필드 안에 다른 필드들이 들어갈 수 있음. name: {"first": "kim", "last": "tony"}로 타입을 정의하면 name.first, name/last 형태로 접근 가능|
|배열형|nested|배열형 객체 저장. 배열 내부의 객체에 쿼리로 접근 가능|
||join|부모/자식 관계 표현 가능|

### 3.6.4. 멀티 필드를 활용한 문자열 처리
엘라스틱서치 5.x 버전부터 문자열 타입이 텍스트와 키워드라는 두 가지 타입으로 분리되었습니다.

1. 텍스트 타입
    - 일반적으로 문장을 저장하는 매핑 타입
    - 텍스트 타입 문자열은 분석기에 의해 토큰으로 분리됨 ⇒ 역인덱싱(분리된 토큰들 인덱싱) 됨
    - 역인덱스에 저장된 토큰들을 용어(term)라고 함
    - 전문 검색에 사용
    - 텍스트 타입 인덱스 생성 방법
        ```bash
        PUT text_index
        {
            "mappings": {
                "properties": {
                    "feild_name": {"type": "text"}
                }
            }
        }
        ```
2. 키워드 타입
    - 규칙성이 있거나 유의미한 값들의 집합인 범주형 데이터에 주로 사용
    - 문자열 전체가 하나의 용어로 인덱싱
    - 집계나 정렬에 사용
    - 텍스트가 정확히 일치하는 경우에만 값 검색 (부분 일치 X)
    - 키워드 타입 인덱스 생성 방법
        ```bash
        PUT keyword_index
        {
            "mappings": {
                "properties": {
                    "feild_name": {"type": "keyword"}
                }
            }
        }
        ```
3. 멀티 필드
    - 단일 필드 입력에 대해 여러 하위 필드를 정의하는 기능
    - fields라는 매핑 파라미터 사용
    - 전문 검색이 필요하면서 정렬이나 필터도 필요한 경우 사용
    - 텍스트 타입 인덱스 생성 방법
        ```bash
        PUT multifield_index
        {
            "mappings": {
                "properties": {
                    "feild_name": {
                        "type": "text",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    }
                }
            }
        }
        ```

## 3.7. 인덱스 템플릿

인덱스 템플릿은 주로 **설정이 동일한 복수의 인덱스를 만들 때 사용**합니다.

### 3.7.1. 템플릿 확인

다음 명령어를 통해 템플릿을 확인할 수 있습니다.

```bash
GET _index_template
```

아직 설정한 템플릿이 없기 때문에 아래처럼 아무 내용이 없이 인덱스 템플릿 설정에 대한 내용을 반환합니다.

```json
{
  "index_templates" : [ ]
}
```

### 3.7.2. 템플릿 설정

`test_template` 라는 이름으로 **인덱스 템플릿을 생성**해보도록 하겠습니다.

```bash
PUT _index_template/test_template
{
    "index_patterns": ["test_*"],
    "priority": 1,
    "template": {
        "settings": {
            "number_of_shards": 3,
            "number_of_replicas": 1
        },
        "mappings": {
            "properties": {
                "name": {"type": "text"},
                "age": {"type": "short"},
                "gender": {"type": "keyword"}
            }
        }
    }
}
```

위 명령어를 입력하면 `test_template`가 생성됩니다. 여기서 템플릿에 사용된 `indeX_patterns`, `priority`, `template`는 자주 사용하는 템플릿 파라미터입니다.

|파라미터|설명|
|:---:|:---|
|index_patterns|새로 만들어지는 인덱스 중 인덱스 이름이 인덱스 패턴과 매칭되는 경우, 이 템플릿 적용. 여기서는 test_로 시작하는 이름을 가진 인덱스 모두 test_template 적용|
|priority|인덱스 생성 시 이름에 매칭되는 템플릿이 둘 이상일 때, 우선순위가 더 높은 템플릿 적용|
|template|새로 생성되는 인덱스에 적용되는 settings, mappings 같은 인덱스 설정 정의|

템플릿을 생성한 다음 **새로 만들어지는 인덱스들만 영향**을 받고, **이미 존재하던 템플릿은 패턴이 일치하더라도 적용되지 않습니다.** 그러므로, 패턴에 맞는 새로운 인덱스를 생성하여 **템플릿이 적용**되는 것을 확인해보도록 하겠습니다.

```bash
PUT test_index1/_doc/1
{
  "name": "kim",
  "age": 10,
  "gender": "male"
}
```

`GET test_index1/_mapping`을 통해 `test_template` 템플릿이 적용되었는지 확인해보면, 아래와 같이 정상적으로 적용된 것을 확인할 수 있습니다.

```json
{
  "test_index1" : {
    "mappings" : {
      "properties" : {
        "age" : {
          "type" : "short"
        },
        "gender" : {
          "type" : "keyword"
        },
        "name" : {
          "type" : "text"
        }
      }
    }
  }
}
```

이번에는 템플릿 매핑 값과 다른 타입으로 도큐먼트 인덱싱을 해보도록 하겠습니다.

```bash
PUT test_index2/_doc/1
{
  "name": "lee",
  "age": "19 years"
}
```

위 명령어를 실행하면 아래와 같이 `400` 상태 오류와 함께 문제가 발생한 이유를 알려줍니다.

```json
{
  "error" : {
    "root_cause" : [
      {
        "type" : "mapper_parsing_exception",
        "reason" : "failed to parse field [age] of type [short] in document with id '1'. Preview of field's value: '19 years'"
      }
    ],
    "type" : "mapper_parsing_exception",
    "reason" : "failed to parse field [age] of type [short] in document with id '1'. Preview of field's value: '19 years'",
    "caused_by" : {
      "type" : "number_format_exception",
      "reason" : "For input string: \"19 years\""
    }
  },
  "status" : 400
}
```

이렇듯 인덱스 템플릿을 사용하면, **사용자 실수를 막아주고 반복적인 작업을 줄여줍니다.** 실제로, 특정 날짜/시간 별로 인덱스를 만드는 경우, 로그스태시나 비츠 같은 데이터 수집 툴에서 엘라스틱서치로 데이터를 보낼 때 템플릿을 이용해 인덱스를 생성하는 경우가 많습니다.

이번에는 **템플릿을 삭제**해보도록 하겠습니다.

```bash
DELETE _index_template/test_template
```

위 명령어를 이용해 `test_template`를 삭제해도 **기존 인덱스들은 영향을 받지 않습니다.** 이미 만들어진 인덱스들이 변경되는 것이 아닌 단순히 템플릿이 지워지는 것이기 때문입니다.

### 3.7.3 템플릿 우선순위
`priority`를 이용해 복수의 템플릿이 매칭될 경우 우선순위를 정할 수 있습니다. 실습을 통해 살펴보겠습니다.

먼저 우선순위가 다른 템플릿을 두 개 생성합니다.

```bash
PUT _index_template/multi_template1
{
  "index_patterns": "multi_*",
  "priority": 1,
  "template": {
    "mappings": {
      "properties": {
        "age": {"type": "integer"},
        "name": {"type": "text"}
      }
    }
  }
}
```

```bash
PUT _index_template/multi_template2
{
  "index_patterns": "multi_data_*",
  "priority": 2,
  "template": {
    "mappings": {
      "properties": {
        "name": {"type": "keyword"}
      }
    }
  }
}
```

그 다음 두 템플릿의 패턴에 모두 일치하는 인덱스를 하나 생성합니다.

```bash
PUT multi_data_index
```

그 다음 `GET multi_data_index/_mapping`을 통해 확인해보면 `multi_template2` 템플릿이 적용된 것을 알 수 있습니다.

```json
{
  "multi_data_index" : {
    "mappings" : {
      "properties" : {
        "name" : {
          "type" : "keyword"
        }
      }
    }
  }
}
```

### 3.7.4. 다이나믹 템플릿

다이나믹 템플릿은 **매핑을 다이나믹하게 지정하는 템플릿 기술**입니다.
**매핑을 정확하게 정할 수 없거나 대략적인 데이터 구조만 알고 있을 때 사용할 수 있는 방법**입니다.

아래와 같이 `match_mapping_type`을 사용하여 조건에 만족하는 타입에 대해서만 매핑을 설정할 수 있습니다.

```bash
PUT dynamic_index1
{
  "mappings": {
    "dynamic_templates": [
        {
          "my_string_fields": {
            "match_mapping_type": "string",
            "mapping": {"type": "keyword"}
          }
        }
      ]
  }
}
```

타입에 대해서가 아닌 필드 패턴으로 설정하는 방법도 있습니다.
`match`를 이용해 필드 이름이 조건과 일치하는 경우에 대해서만 설정할 수도 있고,
`unmatch` 를 사용하여 match 패턴과 일치하는 경우에 제외할 패턴을 설정할 수도 있습니다.

```bash
PUT dynamic_index2
{
  "mappings": {
    "dynamic_templates": [
        {
          "my_long_fields": {
            "match": "long_*",
            "unmatch": "*_text",
            "mapping": {"type": "long"}
          }
        }
      ]
  }
}
```

지금까지 사용한 조건문을 포함하여 자주 사용하는 **다이나믹 템플릿 조건문**을 표로 정리했습니다.

| 조건문                      | 설명                                                                                 |
|:-------------------------|:-----------------------------------------------------------------------------------|
| match_mapping_type       | 데이터 타입을 확인하고 타입들(boolean, date, double, long, object, string) 중 일부를 지정한 매핑 타입으로 변경 |
| match                    | 필드명이 패턴과 일치할 경우 매핑 타입으로 변경                                                         |
| unmatch                  | match 패턴과 일치하는 경우에 제외할 패턴 설정                                                       |
| match_pattern            | match 패턴에서 사용할 수 있는 파라미터 조정 (e.g. 정규식, 와일드 패턴 등)                                   |
| path_match, path_unmatch | match, unmatch와 비슷하지만 점(.)이 들어가는 필드명에서 사용                                          |

더 자세한 설명과 조건문들이 궁금하시다면, [공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/7.10/dynamic-templates.html)를 참고해주시길 바랍니다.

## 3.8. 분석기

분석기에 대해 알아보기 전에 관련 내용을 간략하게 정리하고 넘어가도록 하겠습니다.
엘라스틱서치는 **전문 검색을 지원**하기 위해 **역인덱싱 기술을 사용**합니다.

- 전문 검색 : 장문의 문자열에서 부분 검색을 수행하는 것
- 역인덱싱 : 장문의 문자열을 분석해 작은 단위로 쪼개어 인덱싱하는 기술

분석기 모듈은 다음과 같이 캐릭터 필터, 토크나이저(tokenizer), 토큰 필터로 구성되어 있습니다.

<img width="392" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/3856b93b-adc1-4d7d-b471-f3f16086bfd9">

분석기에는 하나의 토크나이저가 반드시 포함되어야 하며, 캐릭터 필터와 토큰 필터는 옵션이므로 존재하지 않아도 괜찮습니다.

여기서 헷갈리기 쉬운 토큰(token)과 용어(term)에 대해 간단하게 정의하고 넘어가도록 하겠습니다.

- 토큰 : 분석기 내부에서 일시적으로 존재하는 상태
- 용어 : 인덱싱되어 있는 단위, 검색에 사용되는 단위

### 3.8.1. 분석기 구성

위에서 설명한대로 분석기는 세 가지로 구성되어 있습니다.

|  구성요소  | 설명                                                |
|:------:|:--------------------------------------------------|
| 캐릭터 필터 | 입력받은 문자열을 변경하거나 불필요한 문자들을 제거함 (전처리)               |
| 토크나이저  | 문자열을 토큰으로 분리. 분리할 때 토큰의 순서나 시작/끝 위치 기록            |
| 토큰 필터  | 분리된 토큰들의 필터 작업을 함 (후처리). 대소문자 구분, 형태소 분석 등의 작업 가능 |

#### 3.8.1.1. 역인덱싱

분석기를 이해하려면 우선 **역인덱싱**에 대해 알아야 합니다.
엘라스틱서치는 단어들을 연인덱싱하여 도큐먼트를 손쉽게 찾을 수 있습니다.
연인덱싱 테이블에는 용어가 어떤 문서에 속해 있는지 기록되어 있기 때문입니다.

<img width="444" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/91ddd964-fb6a-4f1b-abb6-87f7da046ec4">

#### 3.8.1.2. 분석기 API

엘라스틱서치는 **필터와 토크나이저를 테스트**해볼 수 있는 `analyze API`를 제공합니다.

`analyze API`는 다음과 같이 사용하려는 분석기와 분석할 분자열을 입력하면 사용할 수 있습니다.

```bash
POST _analyze
{
  "analyzer": "stop",
  "text": "The 10 most loving dog breeds."
}
```

명령어를 실행해보면, 아래와 같이 분석 결과를 반환하는 것을 확인할 수 있습니다.

```json
{
  "tokens" : [
    {
      "token" : "most",
      "start_offset" : 7,
      "end_offset" : 11,
      "type" : "word",
      "position" : 1
    },
    {
      "token" : "loving",
      "start_offset" : 12,
      "end_offset" : 18,
      "type" : "word",
      "position" : 2
    },
    {
      "token" : "dog",
      "start_offset" : 19,
      "end_offset" : 22,
      "type" : "word",
      "position" : 3
    },
    {
      "token" : "breeds",
      "start_offset" : 23,
      "end_offset" : 29,
      "type" : "word",
      "position" : 4
    }
  ]
}
```

참고로 스톱(stop) 분석기는 소문자 변경 토크나이저와 스톱 토큰 필터로 구분되어 있습니다. 관련된 설명은 뒤에서 다루도록 하겠습니다.

#### 3.8.1.3. 분석기 종류

분석기 종류는 다양한데, 그 중 자주 사용되는 분석기는 아래의 표와 같습니다.

|    분석기     | 설명                                                                                     |
|:----------:|:---------------------------------------------------------------------------------------|
|  standard  | 특별한 설정이 없으면 엘라스틱서치에서 기본적으로 사용하는 분석기. 영문법을 기준으로 한 스탠다드 토크나이저와 소문자 변경 필터, 스톱 필터가 포함되어 있음 |
|   simple   | 문자만 토큰화함. 공백, 숫자, 하이픈(-), 작은 따옴표(') 같은 문자는 토큰화 X                                       |
| whitespace | 공백을 기준으로 구분하여 토근화                                                                      |
|    stop    | simple 분석기와 유사하지만 스톱 필터가 포함되어 있음. a, the와 같은 불용어 제거                                    |

### 3.8.2. 토크나이저

토크나이저는 **문자열을 분리해 토큰화하는 역할**을 합니다. 자주 쓰이는 토크나이저 종류는 아래와 같습니다.

|     토크나이저     | 설명                                                                                                                                   |
|:-------------:|:-------------------------------------------------------------------------------------------------------------------------------------|
|   standard    | 스탠다드 분석기가 사용하는 토크나이저. 쉼표(,)나 점(.) 같은 기호를 제거하며, 텍스트 기반으로 토큰화                                                                          |
|   lowercase   | 텍스트 기반으로 토큰화. 모든 문자를 소문자로 변경                                                                                                         |
|     ngram     | 원문으로부터 N개의 연속된 글자 단위 모두 토큰화. 예를 들어, '엘라스틱'이라는 원문을 2gram으로 토큰화하면 [엘라, 라스, 스틱]과 같이 연속된 두 글자 모두 추출. 저장 공간을 많이 차지하며 N개 이하의 글자 수로는 검색 불가능 |
| uax_url_email | 스탠다드 분석기와 유사하지만 URL이나 이메일을 토큰화하는 데 강점이 있음                                                                                            |

### 3.8.3. 필터

필터는 단독으로 사용할 수 없고 **반드시 토크나이저가 있어야 합니다.**

#### 3.8.3.1. 캐릭터 필터

캐릭터 필터는 **토크나이저 전에 위치**하며, 문자들을 **전처리**하는 역할을 합니다.
예를 들면, HTML 문법 제거/변경, 특정 문자가 왔을 때 다른 문자로 대체하는 일 등을 합니다.

캐릭터 필터를 사용하기 위해서는 **커스텀 분석기를 만들어 사용**하는 것이 좋습니다.

#### 3.8.3.2. 토큰 필터
토큰 필터는 **토크나이저에 의해 토큰화되어 있는 문자들에 필터를 적용**합니다.
토큰들을 변경하거나 추가, 삭제하는 작업이 가능합니다.

자주 사용하는 토큰 필터는 다음과 같습니다.

|    필터     | 설명                        |
|:---------:|:--------------------------|
| lowercase | 모든 문자를 소문자로 변환            |
| uppercase | 모든 문자를 대문자로 변환            |
|  stemmer  | 영어 문법을 분석하는 필터            |
|   stop    | 기본 필터에서 제거하지 못하는 특정 단어 제거 |

참고로, stemmer 분석기와 stop 분석기는 영어 기반이기 때문에 한글 텍스트에서 잘 동작하지 않습니다.

### 3.8.4. 커스텀 분석기
커스텀 분석기는 엘라스틱서치에서 제공하는 내장 분석기들 중 원하는 기능을 만족하는 분석기가 없을 때 사용자가 **직접 토크나이저, 필터 등을 조합해 사용할 수 있는 분석기**입니다.

먼저 원하는 분석기를 직접 생성해보도록 하겠습니다.

```bash
PUT custom_analyzer
{
  "settings": {
    "analysis": {
      "filter": {
        "my_stopwords": {
          "type": "stop",
          "stopwords": ["lions"]
        }
      },
      "analyzer": {
        "my_analyzer": {
          "type" : "custom",
          "char_filter": [],
          "tokenizer": "standard",
          "filter": ["lowercase", "my_stopwords"]
        }
      }
    }
  }
}
```

위 명령어를 통해 생성한 커스텀 분석기는 기본 스탠다드 토크나이저를 사용하고, 캐릭터 필터는 사용하지 않습니다.
그리고 토큰 필터는 소문자로 변경하는 필터와 `lions`라는 단어를 불용어로 인식하여 처리하는 역할을 추가한 스톱 필터로 설정하였습니다.

이제 분석기 API를 이용해 텍스트가 어떻게 토큰화가 되는지 살펴봅시다.

```bash
GET custom_analyzer/_analyze
{
  "analyzer": "my_analyzer",
  "text": "Cats Lions Dogs"
}
```

필터 배열은 **첫 번째 순서부터 필터가 적용**되기 때문에, 텍스트는 모두 소문자로 변경되여 "cats lions dogs"가 됩니다.
이 때, lions는 불용어로 설정하였기 때문에 삭제되고 다음과 같은 결과를 얻을 수 있습니다.

```json
{
  "tokens" : [
    {
      "token" : "cats",
      "start_offset" : 0,
      "end_offset" : 4,
      "type" : "<ALPHANUM>",
      "position" : 0
    },
    {
      "token" : "dogs",
      "start_offset" : 11,
      "end_offset" : 15,
      "type" : "<ALPHANUM>",
      "position" : 2
    }
  ]
}
```

필터 순서가 바뀐다면 원하는 결과가 아닌 다른 결과를 얻게 됩니다. 확인해보기 위해 아래와 같이 필터 순서를 변경해서 실행해봅시다.

```bash
GET custom_analyzer/_analyze
{
  "tokenizer": "standard",
  "filter": ["my_stopwords", "lowercase"],
  "text": "Cats Lions Dogs"
}
```

그러면 `Cats Lions Dogs`에서 불용어를 먼저 삭제한 다음 소문자로 변경되기 때문에, lions이 삭제되지 않고 존재함을 확인할 수 있습니다.

```json
{
  "tokens" : [
    {
      "token" : "cats",
      "start_offset" : 0,
      "end_offset" : 4,
      "type" : "<ALPHANUM>",
      "position" : 0
    },
    {
      "token" : "lions",
      "start_offset" : 5,
      "end_offset" : 10,
      "type" : "<ALPHANUM>",
      "position" : 1
    },
    {
      "token" : "dogs",
      "start_offset" : 11,
      "end_offset" : 15,
      "type" : "<ALPHANUM>",
      "position" : 2
    }
  ]
}
```

> 본 게시글은 [엘라스틱 스택 개발부터 운영까지](https://product.kyobobook.co.kr/detail/S000001932755) 도서를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 책을 읽어보실 것을 추천해 드립니다.
>

추가로 참고한 내용
- <https://www.ibm.com/kr-ko/topics/rest-apis>
- <https://www.elastic.co/guide/en/elasticsearch/reference/7.10/cat.html>
