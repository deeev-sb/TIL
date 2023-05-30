# 04. 엘라스틱서치 : 검색

::: tip ✅ 실습 환경

- Elasticsearch 7.10.2
- Kibana 7.10.2

:::

## 4.1. 쿼리 컨텍스트와 필터 컨텍스트

과거 엘라스틱서치의 검색은 크게 **쿼리 컨텍스트(query context)** 와 **필터 컨텍스트(filter context)** 로 구분되었습니다.
하지만 논리 쿼리가 나오면서 필터 컨텍스트는 모두 논리 쿼리에 포함되었습니다.
이는 필터 컨텍스트를 단독으로 사용하기보다는 쿼리/필터 컨텍스트를 조합해 사용하는 방향으로 가는 추세라고 생각하면 될 것입니다.

### 4.1.1. 쿼리 컨텍스트

쿼리 컨텍스트는 질의에 대한 유사도를 계산해 이를 기준으로 더 정확한 결과를 먼저 보여줍니다.

쿼리 컨텍스트를 실행해보기 전, 엘라스틱에서 제공하는 샘플 데이터를 추가해봅시다.

키바나 홈으로 이동하여 `Add data`를 클릭합니다.

<img width="1107" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/63bb54a0-8455-4850-b6b9-5ea78f009f24">

그 다음 `Sample data`를 클릭하면 나오는 세 가지 샘플 중, `Sample eCommerce orders`를 `Add data` 합니다.

<img width="1114" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/87455abd-2cec-4f12-9e6d-5cacfe4a83da">

이제 샘플 데이터 추가가 끝났으니 키바나의 `Dev Tools`로 이동해서 실습을 해봅시다!

아래 명령어를 사용해서 쿼리 컨텍스트를 실행해보겠습니다.
여기서 `_search`는 검색 쿼리를 위해 엘라스틱에서 제공하는 REST API 이며, 쿼리 컨텍스트 뿐만 아니라 필터 컨텍스트도 `search API`를 사용합니다.
그리고 `match`는 전문 검색을 위한 쿼리로, 역인덱싱된 용얼르 검색할 때 사용됩니다. 자세한 내용은 뒤에서 자세히 살펴보도록 하겠습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "query": {
    "match": {
      "category": "clothing"
    }
  }
}
```

위 명령어를 실행하면 `clothing` 용어가 있는 도큐먼트를 찾아서 반환합니다.

```json
{
  // ...
  "hits": {
    "total": {
      "value": 3927,
      "relation": "eq"
    },
    "max_score": 0.20545526,
    "hits": [
      {
        "_index": "kibana_sample_data_ecommerce",
        "_type": "_doc",
        "_id": "hN1mU4gBbg2lvvgijQi-",
        "_score": 0.20545526,
        "_source": {
          "category": [
            "Men's Clothing"
          ],
          // ...
        }
      },
      {
        "_index": "kibana_sample_data_ecommerce",
        "_type": "_doc",
        "_id": "hd1mU4gBbg2lvvgijQi-",
        "_score": 0.20545526,
        "_source": {
          "category": [
            "Women's Clothing"
          ],
          // ...
        }
      }
      // ...
    ]
  }
}
```

`hits.hits`에는 찾은 도큐먼트가 **높은 스코어 순으로 정렬**되어 있으며, `_score` 값은 요청한 검색과 유사도를 나타내는 지표입니다.

### 4.1.2. 필터 컨텍스트

필터 컨텍스트는 유사도를 계산하지 않고 일치 여부에 따른 결과만을 반환합니다.
그렇기에 스코어를 계산하지 않아도 되어서, 전체적인 쿼리 속도를 올릴 수 있습니다.
또한, 결과에 대해 업데이트를 매번 수행할 필요가 없기 때문에 캐시를 이용할 수 있습니다.

필터 컨텍스트를 사용해 `day_of_week` 필드가 `Friday`인 도큐먼트를 찾는 필터 컨텍스트를 실행해보도록 하겠습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "query": {
    "bool": {
      "filter": {
        "term": {
          "day_of_week": "Friday"
        }
      }
    }
  }
}
```
실행 결과, 원하는대로 `day_of_week` 필드가 `Friday`인 것을 확인할 수 있습니다.

```json
{
  // ...
  "hits": {
    "total": {
      "value": 770,
      "relation": "eq"
    },
    "max_score": 0.0,
    "hits": [
      {
        "_index": "kibana_sample_data_ecommerce",
        "_type": "_doc",
        "_id": "mt1mU4gBbg2lvvgijQi-",
        "_score": 0.0,
        "_source": {
          "day_of_week": "Friday",
          // ...
        }
      },
      {
        "_index": "kibana_sample_data_ecommerce",
        "_type": "_doc",
        "_id": "m91mU4gBbg2lvvgijQi-",
        "_score": 0.0,
        "_source": {
          "day_of_week": "Friday",
          // ...
        }
      },
      // ...
    ]
  }
}
```

## 4.2. 쿼리 스트링과 쿼리 DSL

### 4.2.1. 쿼리 스트링
쿼리 스트링은 `REST API의 URI 주소에 쿼리문을 작성하는 방식`으로,
한 줄 정도의 간단한 쿼리입니다.

```bash
GET kibana_sample_data_ecommerce/_search?q=customer_full_name:Mary
```

위 쿼리 스트링을 실행하면 `customer_full_name`이 `Mary`인 도큐먼트에 대해서 반환합니다.

```json
{
  // ...
  "hits": {
    "total": {
      "value": 154,
      "relation": "eq"
    },
    "max_score": 3.4912553,
    "hits": [
      {
        "_index": "kibana_sample_data_ecommerce",
        "_type": "_doc",
        "_id": "hd1mU4gBbg2lvvgijQi-",
        "_score": 3.4912553,
        "_source": {
          "customer_full_name": "Mary Bailey",
          // ...
        }
      },
      {
        "_index": "kibana_sample_data_ecommerce",
        "_type": "_doc",
        "_id": "mt1mU4gBbg2lvvgijQi-",
        "_score": 3.4912553,
        "_source": {
          "customer_full_name": "Mary Barber",
          // ...
        }
      }
      // ...
    ]
  }
}
```

한 줄에 모든 쿼리를 작성해야 하기 때문에 **복잡한 쿼리일수록 가독성이 떨어질 수 있습니다.**

### 4.2.2. 쿼리 DSL
쿼리 DSL은 **REST API의 요청 본문 안에 JSON 형태로 쿼리를 작성**합니다.
모든 쿼리 스펙을 지원하기 때문에 매우 강력하며, **복잡한 쿼리를 구현할 수 있다**는 장점이 있습니다.

위에서 실습했던 쿼리 스트링을 쿼리 DSL로 나타내면 아래와 같습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "query": {
    "match": {
      "customer_full_name": "Mary"
    }
  }
}
```

## 4.3. 유사도 스코어
쿼리 컨텍스트는 기본적으로 **BM25 알고리즘**을 이용해 유사도 스코어를 계산합니다.
**유사도 스코어**는 질의문과 도큐먼트의 유사도를 표현하는 값으로,
스코어가 높을수록 찾고자 하는 도큐먼트에 가깝습니다.

쿼리 내부적인 최적화 방법과 어떤 경로를 통해 검색되었으며 어떤 기준으로 스코어가 계산되었는지 궁금하다면, 
검색할 때 `explain: true`를 추가하면 됩니다.

```bash{8}
GET kibana_sample_data_ecommerce/_search
{
  "query": {
    "match": {
      "products.product_name": "Pants"
    }
  },
  "explain": true
}
```

실행하면 다음과 같은 결과를 볼 수 있습니다.
그 중 스코어가 가장 높은 id가 `1t1mU4gBbg2lvvgikgrq`인 첫 번째 도큐먼트를 가지고 스코어 계산을 살펴볼 것입니다.
~~저와 id가 다를 수도 있어요!~~

```json
{
  // ...
  "hits": {
    "total": {
      "value": 3,
      "relation": "eq"
    },
    "max_score": 8.268259,
    "hits": [
      {
        "_id": "1t1mU4gBbg2lvvgikgrq",
        "_score": 8.268259,
        "_source": {
          "products": [
            {
              "product_name": "Boots - tan",
              // ...
            },
            {
              "product_name": "Casual Cuffed Pants",
              // ...
            }
          ],
          // ...
        },
        "_explanation": {
          "value": 8.268259,
          "description": "weight(products.product_name:pant in 94) [PerFieldSimilarity], result of:",
          "details": [
            {
              "value": 8.268259,
              "description": "score(freq=1.0), computed as boost * idf * tf from:",
              "details": [
                {
                  "value": 2.2,
                  "description": "boost",
                  "details": []
                },
                {
                  "value": 7.1974354,
                  "description": "idf, computed as log(1 + (N - n + 0.5) / (n + 0.5)) from:",
                  "details": [
                    //...
                  ]
                },
                {
                  "value": 0.52217203,
                  "description": "tf, computed as freq / (freq + k1 * (1 - b + b * dl / avgdl)) from:",
                  "details": [
                    // ...
                  ]
                }
              ]
            }
          ]
        }
      }
    ]
  }
}
```

### 4.3.1. 스코어 알고리즘 (BM25) 이해하기
엘라스틱서치는 5.x 이전 버전에서는 TF-IDF 알고리즘을 사용하여 스코어를 계산했으나,
엘라스틱서치 5.x 부터는 BM25 알고리즘을 기본으로 사용합니다.
BM25 알고리즘은 검색, 추천에 많이 사용되는 알고리즘이며,
루씬의 기본 스코어 알고리즘이 BM25로 바뀌면서 엘라스틱서치도 기본 알고리즘을 BM25로 변경했습니다.

### 4.3.2. IDF 계산
**문서 빈도(document frequency)**는 특정 용어가 얼마나 자주 등장했는지를 의미하는 지표입니다.
이러한 문서 빈도가 적을수록 가중치를 높게 주는데, 이를 **문서 빈도의 역수(IDF, Inverse Document Frequency)라고 합니다.

IDF를 계산하는 식은 엘라스틱서치에서 다음과 같이 알려줍니다.

```
idf, computed as log(1 + (N - n + 0.5) / (n + 0.5)) from:
```

좀 더 자세히 살펴보도록 하겠습니다.

```json
{
  "value" : 7.1974354,
  "description" : "idf, computed as log(1 + (N - n + 0.5) / (n + 0.5)) from:",
  "details" : [
    {
      "value" : 3,
      "description" : "n, number of documents containing term",
      "details" : [ ]
    },
    {
      "value" : 4675,
      "description" : "N, total number of documents with field",
      "details" : [ ]
    }
  ]
}
```

먼저 n은 검색했던 용어(term)가 몇 개의 도큐먼트에 있는지 알려주는 값입니다.
그리고 N은 인덱스 전체 도큐먼트 수 입니다.
위 예제에서 n은 3, N은 4675로, 용어가 있는 도큐먼트는 3개이며 전체 도큐먼트는 4675개입니다.

### 4.3.3. TF 계산

용어 빈도 (TF, Term Frequency)는 특정 용어가 하나의 도큐먼트에 **얼마나 많이 등장**했는지를 의미합니다.
하나의 도큐먼트에서 특정 용어가 많이 나오면 중요한 용어로 인식하고 가중치를 높입니다.

TF 계산식 역시 엘라스틱서치에서 알려주고 있습니다.

```
tf, computed as freq / (freq + k1 * (1 - b + b * dl / avgdl)) from:"
```

각 변수에 대해서도 엘라스틱서치는 `details`로 알려줍니다.

```json
{
"value" : 0.52217203,
"description" : "tf, computed as freq / (freq + k1 * (1 - b + b * dl / avgdl)) from:",
"details" : [
{
  "value" : 1.0,
  "description" : "freq, occurrences of term within document",
  "details" : [ ]
},
{
  "value" : 1.2,
  "description" : "k1, term saturation parameter",
  "details" : [ ]
},
{
  "value" : 0.75,
  "description" : "b, length normalization parameter",
  "details" : [ ]
},
{
  "value" : 5.0,
  "description" : "dl, length of field",
  "details" : [ ]
},
{
  "value" : 7.3161497,
  "description" : "avgdl, average length of field",
  "details" : [ ]
}
]
}
```

각 변수에 대해 정리하면 다음과 같습니다.

- freq : 도큐먼트 내에 용어가 나온 횟수
- k1, b : 알고리즘 정규화를 위한 가중치
- dl : 필드 길이
- avgdl : 전체 도큐먼트에서 평균 필드 길이

이제 **최종 스코어 계산식**을 확인해봅시다.

```json
{
  "description": "score(freq=1.0), computed as boost * idf * tf from:",
  "details": [
    {
      "value": 2.2,
      "description": "boost",
      "details": []
    },
    // ...
  ]
}
```

최종 스코어는 앞에서 배운 IDF와 TF 그리고 boost 변수를 곱하면 됩니다.
boost는 엘라스틱이 지정한 고정값으로 2.2로 정해져 있습니다.

## 4.4. 쿼리

엘라스틱서치에서 검색을 위해 지원하는 쿼리는 크게 두 가지로 나눌 수 있습니다.
1. 리프 쿼리
   - 특정 필드에서 용어를 찾는 쿼리
   - 매치(match), 용어(term), 범위(range) 쿼리 등
2. 복합 쿼리
   - 쿼리를 조합해 사용되는 쿼리
   - 논리(bool) 쿼리 등

### 4.4.1. 전문 쿼리와 용어 수준 쿼리

**전문 쿼리**는 전문 검색을 하기 위해 사용되며,
주로 텍스트 타입 필드에서 검색어를 찾을 때 사용합니다.

**전문 쿼리의 동작 과정**을 살펴보도록 하겠습니다.

<img width="441" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/ec09e99b-d9f5-46e9-8aa2-a596a37beb0c">

그림과 같이 qindex 인덱스를 생성하면, contents 필드는 텍스트 타입이기 때문에 "I Love Elastic Stack." 이라는 문자열은 표와 같이 [i, love, elastic, stack]으로 토큰화가 됩니다.

검색을 위한 도큐먼트가 준비되었으니 매치(match) 쿼리를 사용해 "elastic world"를 전문 검색합니다.
그러면 검색어인 "elastic world"는 [elastic, world]로 토큰화되고, 토큰화된 도큐먼트 용어들과 매칭되어 스코어 계산 후 검색을 합니다.

이러한 전문 쿼리에는 매치 쿼리 (match query), 매치 프라이즈 쿼리 (match phrase query), 멀티 매치 쿼리 (multi-match query), 쿼리 스트링 쿼리 (query string query) 등이 있습니다.

그 다음으로 용어 수준 쿼리에 대해 살펴보겠습니다.

**용어 수준 쿼리**는 정확히 일치하는 용어를 찾기 위해 사용되며,
주로 키워드, 숫자형, 범위형 타입의 필드에서 검색어를 찾을 때 사용합니다.

**용어 수준 쿼리의 동작 과정**을 살펴보도록 하겠습니다.

<img width="439" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/b5973df9-2216-4dcc-8066-49f486e25ee5">

그림과 같이 qindex 인덱스를 생성하면, category 필드는 키워드 타입이기 때문에 "Tech"를 그대로 인덱싱합니다.

검색을 위한 도큐먼트가 준비되었으니 용어(term) 쿼리를 사용해 "tech"를 검색합니다.
검색어인 "tech"와 도큐먼트의 "Tech"는 대소문자의 차이로 인해 매칭에 실패합니다.
이렇듯 용어 수준 쿼리는 정확히 일치하지 않으면 결과로 반환하지 않으며,
관계형 데이터베이스의 WHERE 절과 비슷한 역할을 한다고 이해하면 됩니다.

이러한 용어 수준 쿼리에는 용어 쿼리 (term query), 용어들 쿼리 (terms query), 퍼지 쿼리 (fuzzy query) 등이 있습니다.

## 4.4.2. 매치 쿼리

매치 쿼리는 **대표적인 전문 쿼리**로, 특정 용어나 용어들을 검색할 때 사용합니다.

**하나의 용어를 검색**할 때는 아래와 같이 필드와 용어 하나만 작성하면 됩니다.
여기서는 `Mary`라는 단어를 검색했으며, Mary는 [mary]로 토큰화되어 검색됩니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "_source": ["customer_full_name"],
  "query": {
    "match": {
      "customer_full_name": "Mary"
    }
  }
}
```

참고로, `_source` 파라미터는 검색 결과에서 지정한 특정 필드만 보여줍니다.
그렇기에 아래와 같이 결과는 `customer_full_name`에 대해서만 출력합니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 154,
      "relation" : "eq"
    },
    "max_score" : 3.4912553,
    "hits" : [
      {
        "_index" : "kibana_sample_data_ecommerce",
        "_type" : "_doc",
        "_id" : "hd1mU4gBbg2lvvgijQi-",
        "_score" : 3.4912553,
        "_source" : {
          "customer_full_name" : "Mary Bailey"
        }
      },
      // ...
    ]
  }
}
```

복수 개의 용어를 검색하고 싶다면 두 용어를 입력하면 됩니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "_source": ["customer_full_name"],
  "query": {
    "match": {
      "customer_full_name": "mary bailey"
    }
  }
}
```

이 때, 공백을 `OR`로 인식하여 두 단어 중 하나라도 포함되면 결과에 포함하여 반환합니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 169,
      "relation" : "eq"
    },
    "max_score" : 9.155506,
    "hits" : [
      {
        // ...
        "_source" : {
          "customer_full_name" : "Mary Bailey"
        }
      },
      {
        // ...
        "_source" : {
          "customer_full_name" : "Elyssa Bailey"
        }
      }
      // ...
    ]
  }
}
```

두 단어 모두 포함된 도큐먼트가 매칭된 결과를 알고 싶다면 `operator`라는 파라미터를 변경하면 됩니다.
operator의 기본 값은 OR 이기 때문에 아래와 같이 따로 입력해주지 않으면 위와 같은 결과를 반환하게 됩니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "_source": ["customer_full_name"],
  "query": {
    "match": {
      "customer_full_name": {
        "query": "mary bailey",
        "operator": "and"
      }
    }
  }
}
```

### 4.4.3. 매치 프레이즈 쿼리

매치 프레이즈 쿼리는 **구(phrase)를 검색할 때 사용**합니다.
구는 동사가 아닌 2개 이상의 단어가 연결되어 만들어지는 단어입니다.
그렇기에 검색하는 **단어 순서도 중요**합니다.
예를 들어, '빨간색 바지'를 찾으려고 했는데 '바지 빨간색'이라고 입력하면, 원하지 않은 전혀 다른 결과를 얻게 됩니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "_source": ["customer_full_name"],
  "query": {
    "match_phrase": {
      "customer_full_name": "mary bailey"
    }
  }
}
```

위와 같이 입력하면, 순서가 바뀐 'bailey mary'나 중간에 다른 단어가 포함된 'mary tony bailey'와 같은 단어는 매칭되지 않습니다.

### 4.4.4. 용어 쿼리

용어 쿼리는 **용어 수준 쿼리의 대표적인 쿼리**입니다.
분석기를 거치지 않기 때문에 대소문자까지 정확히 일치하는 용어에 대해서만 매칭됩니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "_source": ["customer_full_name"],
  "query": {
    "term": {
      "customer_full_name": "Mary Bailey"
    }
  }
}
```

검색해보면 아래와 같이 아무런 결과도 반환되지 않는 것을 확인할 수 있습니다.
이는 `Mary Bailey`를 `Mary`로 변경하더라도 똑같습니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  }
}
```

그 이유는 `customer_full_name`이 텍스트와 키워드 타입을 갖는 멀티 필드로 지정되어 있기 때문입니다.
`customer_full_name` 필드는 텍스트 타입이고, `customer_full_name.keyword` 필드가 키워드 타입입니다.
그러므로 키워드 타입인 `customer_full_name.keyword` 필드에 용어 쿼리를 요청해야 결과를 얻을 수 있습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "_source": ["customer_full_name"],
  "query": {
    "term": {
      "customer_full_name.keyword": "Mary Bailey"
    }
  }
}
```

용어 쿼리를 요청하면 아래와 유사한 결과를 확인할 수 있습니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 3,
      "relation" : "eq"
    },
    "max_score" : 7.1974354,
    "hits" : [
      {
        // ...
        "_source" : {
          "customer_full_name" : "Mary Bailey"
        }
      },
      {
        // ...
        "_source" : {
          "customer_full_name" : "Mary Bailey"
        }
      },
      {
        // ...
        "_source" : {
          "customer_full_name" : "Mary Bailey"
        }
      }
    ]
  }
}
```

### 4.4.5. 용어들 쿼리

용어들 쿼리는 용어 수준 쿼리의 일종이며, **여러 용어들을 검색**할 수 있습니다.
**키워드 타입으로 매핑된 필드에서 사용**해야 하며, **대소문자도 신경** 써야 합니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "_source": ["day_of_week"],
  "query": {
    "terms": {
      "day_of_week": ["Monday", "Sunday"]
    }
  }
}
```

위와 같이 입력하면 `day_of_week` 필드가 `Monday`이거나 `Sumday`인 필드가 반환됩니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 1193,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        // ...
        "_score" : 1.0,
        "_source" : {
          "day_of_week" : "Monday"
        }
      },
      {
        // ...
        "_score" : 1.0,
        "_source" : {
          "day_of_week" : "Sunday"
        }
      },
      // ...
    ]
  }
}
```


> 본 게시글은 [엘라스틱 스택 개발부터 운영까지](https://product.kyobobook.co.kr/detail/S000001932755) 도서를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 책을 읽어보실 것을 추천해 드립니다.
>