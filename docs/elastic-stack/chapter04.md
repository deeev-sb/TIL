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

### 4.4.2. 매치 쿼리

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

### 4.4.6. 멀티 매치 쿼리

**여러 개의 필드에서 검색**하기 위한 멀티 매치 쿼리는 전문 검색 쿼리의 일종으로,
**텍스트 타입**으로 매핑된 필드에서 사용하는 것이 좋습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "_source": ["customer_first_name", "customer_last_name", "customer_full_name"],
  "query": {
    "multi_match": {
      "query": "mary",
      "fields": ["customer_first_name", "customer_last_name", "customer_full_name"]
    }
  }
}
```

위 명령어와 같이 이름이 유사한 복수의 필드를 선택할 때는 `*` 같은 **와일드카드**를 사용하여 좀 더 간단하게 변경할 수 있습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "_source": ["customer_*_name"],
  "query": {
    "multi_match": {
      "query": "mary",
      "fields": "customer_*_name"
    }
  }
}
```

여러 개의 필드 중 **특정 필드에 가중치**를 두는 방법을 **부스팅(boosting) 기법**이라고 합니다.
가중치를 부여하고자 하는 특정 필드에 `^` 기호와 숫자를 적어주면, 그 필드의 스코어 값을 n배 해줍니다.

예를 들어, 부스팅 기법을 통해 `customer_full_name` 필드의 스코어 값을 2배로 설정한려면 아래와 같이 요청하면 됩니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "_source": ["customer_*_name"],
  "query": {
    "multi_match": {
      "query": "mary",
      "fields": [
        "customer_first_name", 
        "customer_last_name", 
        "customer_full_name^2"]
    }
  }
}
```

### 4.4.7. 범위 쿼리

범위 쿼리는 특정 날짜나 숫자의 범위를 지정해 **범위 안에 포함된 데이터들을 검색**할 때 사용됩니다.
**날짜/숫자/IP 타입**의 데이터는 범위 쿼리가 가능하지만, 문자형, 키워드 타입의 데이터는 사용할 수 없습니다.

`kibana_sample_data_ecommerce` 인덱스의 `order_date` 필드를 이용해 날짜/시간 쿼리를 요청해봅시다.
이 때, 샘플 데이터는 로드한 날짜를 기준으로 `date`가 설정되므로 로드한 시점의 근처 날짜로 변경해야 합니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "query": {
    "range": {
      "order_date": {
        "gte": "2023-05-25",
        "lte": "2023-05-26"
      }
    }
  }
}
```

여기서 `yyyy-mm-dd` 형식으로 날짜/시간 포맷을 검색하였는데, 그 이유는 필드가 그렇게 설정되어 있기 때문입니다.
만약, `yyyy-mm-dd' 형식이 아닌 `yyyy/mm/dd` 형식으로 작성하여 쿼리를 요청하면 `parse_exception` 에러가 발생합니다.

위 명령어에서 사용한 `gte`, `lte` 파라미터는 범위를 지정하는 파라미터입니다. 범위 쿼리는 네 가지 파라미터를 지원합니다.

| 파라미터 | 설명                                         |
|:----:|:-------------------------------------------|
| gte  | 설정한 날짜/숫자 이상                               |
|      | `gte: 10` 10과 같거나 10보다 큰 값                 |
|      | `gte: 2023-05-25` 2023년 5월 25일이거나 그 이후의 날짜 |
|  gt  | 설정한 날짜/숫자 초과                               |
|      | `gt: 10` 10보다 큰 값                          |
|      | `gt: 2023-05-25` 2023년 5월 25일 이후의 날짜       |
| lte  | 설정한 날짜/숫자 이하                               |
|      | `lte: 10` 10과 같거나 10보다 작은 값                |
|      | `lte: 2023-05-25` 2023년 5월 25일이거나 그 이전의 날짜 |
|  lt  | 설정한 날짜/숫자 미만                               |
|      | `lt: 10` 10보다 작은 값                         |
|      | `lt: 2023-05-25` 2023년 5월 25일 이전의 날짜       |

범위 쿼리에서 날짜/시간을 표현하는 몇 가지 방식을 더 알아봅시다.
예를 들어, 한 달 전 도큐먼트들이나 일주일/하루 전 도큐먼트들에 대해서 요청하고 싶은 경우 더 편리하게 검색할 수 있는 표현식이 준재합니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "query": {
    "range": {
      "order_date": {
        "gte": "now-1M"
      }
    }
  }
}
```

이렇게 사용하면 오늘 날짜/시간을 직접 입력하지 않기 때문에 시스템 운영 시 유연하게 대처할 수 있습니다.

이러한 날짜/시간 관련 범위 표현식을 표로 살펴보도록 하겠습니다.

| 표현식                       | 설명                                          |
|:--------------------------|:--------------------------------------------|
| now                       | 현재 시각 (2023-05-29T15:20:33)                 |
| now + 1d                  | 현재 시각 + 1일 (2023-05-30T15:20:33)            |
| now+1h+30m+10s            | 현재 시각 + 1시간, 30분, 10초 (2023-05-30T16:50:43) |
| 2023-05-29&#124;&#124;+1M | 2023-05-29 + 1달 (2025-06-29T00:00:00)       |

위 표에서 사용한 d, h, m, s 같은 알파벳은 날짜/시간 단위 표기법으로, 아래 표와 같습니다.

| 시간 단위  |     의미     |
|:------:|:----------:|
|   y    |  year, 연   |
|   M    |  month, 월  |
|   w    |  weeks, 주  |
|   d    |  days, 일   |
| H 또는 h |  hours, 시  |
|   m    | minutes, 분 |
|   s    | seconds, 초 |

M과 m이 헷갈릴 수 있는데, **시간 관련 설정은 모두 소문자**라고 외우면 크게 헷갈리지 않을 것입니다.

엘라스틱서치 데이터 타입 중 **범위 데이터 타입**이라는 것이 있는데, 말 그대로 범위 데이터를 저장할 수 있는 타입입니다.
범위 데이터 타입은 `integer_range`, `float_range`, `long_range`, `double_range`, `date_range`, `ip_range` 총 여섯 가지를 지원합니다.

범위 데이터 타입을 갖는 인덱스를 만들고 범위 쿼리를 요청하는 실습해보도록 하겠습니다.

먼저, 범위 데이터 타입을 갖는 인덱스를 만들어줍니다.

```bash
PUT range_test_index
{
  "mappings": {
    "properties": {
      "test_date": {
        "type": "date_range"
      }
    }
  }
}
```

그 다음 도큐먼트를 인덱싱합니다.

```bash
PUT range_test_index/_doc/1
{
  "test_date": {
    "gte": "2023-05-21",
    "lt": "2023-05-25"
  }
}
```

이제 검색할 도큐먼트가 준비되었으니, 다음과 같이 날짜와 시간을 지정하여 범위 쿼리를 요청합니다.
이 때, `relation`이라는 파라미터를 이용해 어떤 범위를 포함할지 결정하였습니다.

```bash
GET range_test_index/_search
{
  "query": {
    "range": {
      "test_date": {
        "gte": "2023-05-21",
        "lte": "2023-05-28",
        "relation": "within"
      }
    }
  }
}
```

`relation`은 검색할 때 어떤 범위를 포함할 것인지에 대한 파라미터로, 다음과 같이 세 가지의 값을 지원합니다.

|        값         | 설명                                         |
|:----------------:|:-------------------------------------------|
| intersects (기본값) | 쿼리 범위 값이 도큐먼트의 범위 데이터를 **일부**라도 포함하기만 하면 됨 |
|     contains     | 도큐먼트의 범위 데이터가 쿼리 범위 값을 **모두** 포함해야 함       |
|      within      | 도큐먼트의 범위 데이터가 쿼리 범위 **값 내에 전부 속해야 함**      |

위 표에 대한 내용을 그림으로 표현하면 다음과 같습니다. 조금 더 이해하기 쉽도록 숫자형 범위를 사용하였습니다.

<img width="435" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/23de3ff7-a34c-490d-8f62-920539c4a6cf">

### 4.4.8. 논리 쿼리

논리 쿼리는 **복합 쿼리(compound query)**로, 앞에서 배웠던 쿼리를 조합할 수 있습니다.

논리 쿼리 작성 포맷은 다음과 같습니다.

```bash
GET <index>/_search
{
  "query": {
    "bool" : {
      "must" : [{쿼리문}, ...],
      "must not" : [{쿼리문}, ...],
      "should" : [{쿼리문}, ...],
      "filter" : [{쿼리문}, ...]
    }
  }
}
```

여기서 사용된 타입은 총 4개로, 전문 쿼리나 용어 수준 쿼리, 범위 쿼리, 지역 쿼리 등을 사용할 수 있습니다.

|    타입    | 설명                              |
|:--------:|:--------------------------------|
|   must   | 쿼리를 실행하여 참인 도큐먼트 검색             |
|          | 복수의 쿼리를 실행하면 AND 연산             |
| must_not | 쿼리를 실행하여 거짓인 도큐먼트 검색            |
|          | 다른 타입과 같이 사용할 경우 도큐먼트에서 제외      |
|  should  | 단독으로 사용 시 쿼리를 실행하여 참인 도큐먼트 검색   |
|          | 복수의 쿼리를 실행하면 OR 연산              |
|          | 다른 타입과 같이 사용할 경우, 스코어에만 활용      |
|  filter  | 쿼리를 실행하여 "예/아니오" 형식의 필터 컨텍스트 수행 |

각 타입에 대해서 예제와 함께 살펴보도록 하겠습니다.

#### 4.4.8.1. must 타입
must 타입은 **쿼리를 실행하고 참인 도큐먼트**를 찾습니다.

다음과 같이 작성하면 `customer_first_name` 필드에 `mary`가 들어간 도큐먼트를 검색합니다.

```bash
GET kibana_sample_data_ecommerce/_search
{ 
  "_source": ["customer_first_name"], 
  "query": {
    "bool": {
      "must" : {
        "match" : {"customer_first_name": "mary"}
      }
    }
  }
}
```

실행 결과를 살펴보면 다음과 같이 `mary`가 들어간 도큐먼트가 검색된 것을 확인할 수 있습니다.

```json
{
   // ...
  "hits" : {
     "total": {
        "value": 154,
        "relation": "eq"
     },
     "max_score": 3.5671005,
     "hits": [
        {
           "_index": "kibana_sample_data_ecommerce",
           "_type": "_doc",
           "_id": "hd1mU4gBbg2lvvgijQi-",
           "_score": 3.5671005,
           "_source": {
              "customer_first_name": "Mary"
           }
        },
        // ...
     ]
  }
}
```

아래와 같이 **복수 개의 쿼리를 실행하면 AND 효과**를 얻을 수 있습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{ 
  "_source": ["customer_first_name"], 
  "query": {
    "bool": {
      "must" : [
        {"term": {"day_of_week": "Sunday"}},
        {"match" : {"customer_first_name": "mary"}}
      ]
    }
  }
}
```

실행해보면 다음과 같이 `day_of_week`가 `Sunday`면서 `customer_first_name`이 `mary`인 것을 출력하는 것을 확인할 수 있습니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 15,
      "relation" : "eq"
    },
    "max_score" : 5.59649,
    "hits" : [
      {
        "_index" : "kibana_sample_data_ecommerce",
        "_type" : "_doc",
        "_id" : "hd1mU4gBbg2lvvgijQi-",
        "_score" : 5.59649,
        "_source" : {
          "customer_first_name" : "Mary",
          "day_of_week" : "Sunday"
        }
      }, // ...
    ]
  }
}
```

#### 4.4.8.2 must_not 타입

must_not 타입은 **도쿠먼트에서 제외할 쿼리를 실행**합니다.

```bash
GET kibana_sample_data_ecommerce/_search
{ 
  "_source": ["customer_first_name"], 
  "query": {
    "bool": {
      "must_not" : {
        "match" : {"customer_first_name": "mary"}
      }
    }
  }
}
```

실행해보면, `customer_first_name` 필드가 `mary`라는 용어를 가지지 않는 도큐먼트만 출력하는 것을 확인할 수 있습니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 4521,
      "relation" : "eq"
    },
    "max_score" : 0.0,
    "hits" : [
      {
        "_index" : "kibana_sample_data_ecommerce",
        "_type" : "_doc",
        "_id" : "hN1mU4gBbg2lvvgijQi-",
        "_score" : 0.0,
        "_source" : {
          "customer_first_name" : "Eddie"
        }
      },
      // ...
    ]
  }
}
```

이러한 must_not을 다른 쿼리와 함께 사용하면 **특정 조건의 쿼리를 제외**할 수 있습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{ 
  "_source": ["customer_first_name", "customer_last_name"], 
  "query": {
    "bool": {
      "must" : {
        "match" : {"customer_first_name": "mary"}
      },
      "must_not": {
        "term": {"customer_last_name": "bailey"}
      }
    }
  }
}
```

실행해보면 다음과 같이 `bailey`가 포함되지 않은 단어만 출력함을 확인할 수 있습니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 151,
      "relation" : "eq"
    },
    "max_score" : 3.5671005,
    "hits" : [
      {
        "_index" : "kibana_sample_data_ecommerce",
        "_type" : "_doc",
        "_id" : "mt1mU4gBbg2lvvgijQi-",
        "_score" : 3.5671005,
        "_source" : {
          "customer_last_name" : "Barber",
          "customer_first_name" : "Mary"
        }
      }, 
      // ...
    ]
  }
}
```

#### 4.4.8.3. should 타입

should 타입에 **하나의 쿼리를 사용**한다면, **must 타입과 같은 결과**를 얻을 수 있습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{ 
  "_source": ["customer_first_name"], 
  "query": {
    "bool": {
      "should": {
        "match" : {"customer_first_name": "mary"}
      }
    }
  }
}
```

위 명령어의 실행 결과는 이전에 보았던 must 타입의 결과와 같으므로 생략하였습니다.

이러한 should 타입에 **복수 개의 쿼리를 사용하면 OR 효과**를 얻을 수 있습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{ 
  "_source": ["day_of_week", "customer_first_name"], 
  "query": {
    "bool": {
      "should" : [
        {"term": {"day_of_week": "Sunday"}},
        {"match" : {"customer_first_name": "mary"}}
      ]
    }
  }
}
```

실행해보면 다음과 같이 `day_of_week`가 `Sunday` 이거나 `customer_first_name`이 `mary`인 값이 조회된 것을 확인할 수 있습니다.
이전에 똑같은 조건에 대해 `must`로 조회했을 때는 15개의 결과가 조회되었는데, `should`로 하니 753개나 되는 검색 결과가 나옵니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 753,
      "relation" : "eq"
    },
    "max_score" : 5.59649,
    "hits" : [
      {
        "_index" : "kibana_sample_data_ecommerce",
        "_type" : "_doc",
        "_id" : "hd1mU4gBbg2lvvgijQi-",
        "_score" : 5.59649,
        "_source" : {
          "customer_first_name" : "Mary",
          "day_of_week" : "Sunday"
        }
      }, 
      // ...
    ]
  }
}
```

should 타입을 **다른 타입과 함께 사용**하는 경우, `should`에서 검색한 조건에 맞는 도큐먼트들의 우선순위를 높입니다.

비교를 위해 먼저 `must`를 단독으로 사용해보겠습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{ 
  "_source": ["day_of_week", "customer_first_name"], 
  "query": {
    "bool": {
      "must" : {
        "match" : {"customer_first_name": "mary"}
      }
    }
  }
}
```

검색했을 때, 첫 번째로 표시되는 결과의 `day_of_week`는 `Sunday` 입니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 154,
      "relation" : "eq"
    },
    "max_score" : 3.5671005,
    "hits" : [
      {
        "_index" : "kibana_sample_data_ecommerce",
        "_type" : "_doc",
        "_id" : "hd1mU4gBbg2lvvgijQi-",
        "_score" : 3.5671005,
        "_source" : {
          "customer_first_name" : "Mary",
          "day_of_week" : "Sunday"
        }
      },
      // ...
    ]
  }
}

```

이번에는 `should` 타입으로 조건을 추가해보겠습니다.

```json
GET kibana_sample_data_ecommerce/_search
{ 
  "_source": ["day_of_week", "customer_first_name"], 
  "query": {
    "bool": {
      "must" : {
        "match" : {"customer_first_name": "mary"}
      },
      "should": {
        "term": {"day_of_week": "Monday"}
      }
    }
  }
}
```

명령어를 실행해보면, should 조건인 `Monday`가 `day_of_week`인 도큐먼트가 첫 번째 결과로 나오는 것을 확인할 수 있습니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 154,
      "relation" : "eq"
    },
    "max_score" : 5.6551332,
    "hits" : [
      {
        "_index" : "kibana_sample_data_ecommerce",
        "_type" : "_doc",
        "_id" : "3N1mU4gBbg2lvvgijQi-",
        "_score" : 5.6551332,
        "_source" : {
          "customer_first_name" : "Mary",
          "day_of_week" : "Monday"
        }
      },
      // ...
    ]
  }
}
```

#### 4.4.8.4. filter 타입

filter는 **must와 같은 동작**을 하지만 **필터 컨텍스트로 동작**하기 때문에 유사도 스코어에 영향을 미치지 않습니다.
즉, **예/아니오** 두 가지 결과만 제공합니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "_source": ["products.base_price"],
  "query": {
    "bool": {
      "filter": {
        "range": {
          "products.base_price": {
            "gte": 30,
            "lte": 60
          }
        }
      }
    }
  }
}
```

위와 같이 filter 타입을 사용하고 range 쿼리를 사용하면, 스코어는 계산되지 않아서 `0.0`이고 `products.base_price`가 30 이상 60 이하인 모든 도큐먼트가 검색된 것을 확인할 수 있습니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 2336,
      "relation" : "eq"
    },
    "max_score" : 0.0,
    "hits" : [
      {
        "_index" : "kibana_sample_data_ecommerce",
        "_type" : "_doc",
        "_id" : "iN1mU4gBbg2lvvgijQi-",
        "_score" : 0.0,
        "_source" : {
          "products" : [
            {
              "base_price" : 59.99
            },
            {
              "base_price" : 20.99
            }
          ]
        }
      },
      // ...
    ]
  }
}
```

이번에는 filter 타입을 **다른 타입과 같이 사용**해보겠습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{ 
  "_source": ["day_of_week", "customer_first_name"], 
  "query": {
    "bool": {
      "filter": {
        "term": {"day_of_week": "Sunday"}
      },
      "must" : {
        "match" : {"customer_first_name": "mary"}
      }
    }
  }
}
```

이렇게 검색을 하면, 먼저 `day_of_week`가 `Sunday`인 도큐먼트에 대해 필터링을 한 다음 `customer_first_name`이 `mary`인 도큐먼트에 대해 검색을 합니다.
앞에서 설명 드렸듯 `should` 타입 검색은 유사도 검색을 하지 않기 때문에, 필터를 통해 불필요한 도큐먼트를 제외하고 검색하기 때문에 검색 성능을 높일 수 있습니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 15,
      "relation" : "eq"
    },
    "max_score" : 3.5671005,
    "hits" : [
      {
        "_index" : "kibana_sample_data_ecommerce",
        "_type" : "_doc",
        "_id" : "hd1mU4gBbg2lvvgijQi-",
        "_score" : 3.5671005,
        "_source" : {
          "customer_first_name" : "Mary",
          "day_of_week" : "Sunday"
        }
      },
      // ... 
    ]
  }
}
```

### 4.4.9. 패턴 검색

검색하려는 검색어가 길거나 정확히 알지 못하는 경우, 패턴을 이용해 검색할 수 있습니다.
패턴 검색에는 **와일드카드 쿼리 (wildcard query)**와 **정규식 쿼리(regexp query)**가 있습니다.

#### 4.4.9.1. 와일드카드 쿼리

와일드카드 쿼리는 다음과 같은 특징을 가집니다.

- `*`과 `?`라는 두 가지 기호 사용
  - `*` : 공백까지 포함하여 글자 수에 상관없이 모든 문자 매칭
  - `?` : 한 문자만 매칭
- 용어의 맨 앞에 `*`과 `?`를 사용하면 속도가 매우 느려짐

예제를 통해 자세히 살펴보도록 하겠습니다.

<img width="461" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/7a50d4ec-a5e3-4aca-ae86-55716d9fb68b">

위 그림은 와일드 카드인 `*`를 이용했을 때와 `?` 기호를 사용하였을 때 `aabbcd` 용어와 매칭되거나 되지 않는 케이스에 대해서 보여줍니다.

`*` 기호 하나만 쓰면 어떤 문자가 들어와도 매칭되고, `aabbcd*` 이런식으로 마지막에 `*`을 붙이면 공백이 포함되기 때문에 매칭에 성공합니다.
그러나 `b*`은 `b`로 시작하는 문자이기 때문에 `a`로 시작되는 `aabbcd`와 매칭되지 않습니다.

`?` 기호는 1개의 문자와 매칭 되기 때문에 문자 길이도 동일해야 합니다. `a?bb??`나 `a???cd`는 문자 길이가 동일하고 `?`가 아닌 부분은 동일하기에 매칭됩니다.
그러나 `a?`는 두 글자 문자만 매칭될 수 있고, `aabbcd?`는 문자 길이가 달라 매칭되지 않습니다.

와일드카드 쿼리는 다음과 같은 형식으로 작성합니다.
```bash
GET kibana_sample_data_ecommerce/_search
{
  "_source": "customer_full_name",
  "query": {
    "wildcard": {
      "customer_full_name.keyword": "M?r*"
    }
  }
}
```

그러면 다음과 같으 `M?r*`에 해당하는 검색 결과가 출력됩니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 218,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "kibana_sample_data_ecommerce",
        "_type" : "_doc",
        "_id" : "hd1mU4gBbg2lvvgijQi-",
        "_score" : 1.0,
        "_source" : {
          "customer_full_name" : "Mary Bailey"
        }
      },
     // ...
    ]
  }
}
```

#### 4.4.9.2. 정규식 쿼리

정규식은 특정한 패턴을 가진 문자열을 표현하기 위한 형식 언어입니다.
여기서 주의할 점은, 와일드카드에서 사용한 `*`, `?` 기호가 정규식에서는 쓰임이 다르다는 것입니다.

정규식 쿼리에서 자주 사용하는 몇 가지 표현식은 다음과 같습니다.

| 기호  | 설명                                                             |
|:---:|:---------------------------------------------------------------|
|  .  | 하나의 문자를 의미. 문자 길이만 맞는다면 어떤 문자가 와도 매칭                           |
|  +  | 앞 문자와 같은 문자가 한 번 이상 반복되면 매칭                                    |
|  *  | 앞 문자와 같은 문자가 0번 이상 반복되면 매칭                                     |
|  ?  | 앞 문자와 같은 문자가 0번 혹은 한 번 나타나면 매칭                                 |
| ()  | 문자를 그룹핑하여 반복되는 문자들을 매칭. 독자적으로 사용하기 보다는 +, ?, * 같은 기호들과 혼합하여 사용 |
| []  | 문자를 클래스화하여 특정 범위의 문자들을 매칭                                      |

각 기호에 대해 매칭되는 경우와 매칭되지 않는 경우를 살펴보면 아래 그림과 같습니다.

<img width="557" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/23f41b8a-efee-4440-9746-638336e50e43">

`.`은 하나의 문자를 의미하기 때문에 글자 길이가 다르거나 중간에 비어있는 문자 수가 다르면 매칭을 실패하는 것을 확인할 수 있습니다.

`+`는 앞의 문자를 한 번 이상 반복되면 매칭되는데 `aabbcd`에는 `e`가 존재하지 않아 `aabbcde+`는 매칭 실패합니다.

`*`은 앞 문자와 같은 문자가 0번 이상 반복되면 매칭되기 때문에 왠만해서는 다 매칭되며, 맨 앞에 오는 경우에 대해서 실패합니다.
`*` 뿐만 아니라 `?`와 `*` 같은 기호도 정규 표현식의 맨 앞에 올 수 없습니다.

`?`는 앞 문자와 같은 문자가 0번 혹은 한 번 나타나면 매칭되므로 `aa?b?b?cd` 같은 경우는 매칭에 성공하지만 `aab?cd`나 `a?b?cd`의 경우는 한 번 나타난다고 하더라도 `aabbcd`를 충족하지 못하기 때문에 매칭에 실패합니다.

`()`는 반복되는 문자들에 대해 매칭되므로, 글자 수가 다르거나 다른 문자가 들어가는 경우에 대해 매칭 실패합니다.

`[]`는 문자를 특정 범위의 문자를 매칭합니다. `[ab]`는 해당 위치에 a 또는 b가 매칭된다는 의미입니다.
`[a-z]`는 a와 z 사이의 문자가 매칭되며, `[^a]`는 a가 아닌 다른 문자가 오면 매칭됩니다.
그렇기에 `[^a]abcd`는 첫 문자가 a가 아니게 되고, `aabbcd`의 첫 문자는 a여서 매칭에 실패합니다.

정규식 쿼리는 다음과 같은 형식으로 작성합니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "_source": "customer_first_name",
  "query": {
    "regexp": {
      "customer_first_name.keyword": "Mar."
    }
  }
}
```

그러면 다음과 같으 `Mar.`에 해당하는 검색 결과가 출력됩니다.

```json
{
  // ...
  "hits" : {
    "total" : {
      "value" : 154,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "kibana_sample_data_ecommerce",
        "_type" : "_doc",
        "_id" : "hd1mU4gBbg2lvvgijQi-",
        "_score" : 1.0,
        "_source" : {
          "customer_first_name" : "Mary"
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