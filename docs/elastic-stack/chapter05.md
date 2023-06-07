# 05. 엘라스틱서치 : 집계

::: tip ✅ 실습 환경

- Elasticsearch 7.10.2
- Kibana 7.10.2

:::

엘라스틱서치에서 집계(aggregation)는 **데이터를 그룹핑하고 통계값을 얻는 기능**입니다.
이를테면 데이터를 날짜별로 묶거나 특정 카테고리별로 묶어 그룹별 통계를 내는 식입니다.

## 5.1. 집계의 요청-응답 형태

`search API`의 요청 본문에 `aggs` 파라미터를 이용하면 쿼리 결과에 대한 집계를 생성할 수 있습니다.

엘라스틱서치에서 **집계를 요청하는 기본 형태**는 다음과 같습니다.

```bash
GET <인덱스>/_search
{
  "aggs": {
    "my_aggs": {
      "agg_type" : {
        ...
      }
    }
  }
}
```

- `aggs`: 집계 요청을 하겠다는 의미
- `my_aggs` : 사용자가 지정하는 집계 이름
- `agg_type` : 집계 타입

엘라스틱서치는 다음과 같이 크게 두 가지 타입의 집계가 있습니다.

- 메트릭 집계 (metring aggregations) : 통계나 계산에 사용
- 버킷 집계 (bucket aggregations) : 도큐먼트를 그룹핑하는 데 사용

각 집계에 대해서는 뒤에서 설명드리도록 하겠습니다.

다음으로 엘라스틱서치으 **집계 응답 형태**를 살펴보도록 하겠습니다.

```bash
{
  ...
  "hits": {
    "total": 
    ...
  },
  "aggregations": {
    "my_aggs": {
      "value":
    }
  }
}
```

- `aggregations` : 응답 메시지가 집계 요청에 대한 결과임을 알려줌
- `my_aggs` : 요청 시 사용자가 지정한 집계 이름
- `value` : 실제 집계 결과

## 5.2. 메트릭 집계

메트릭 집계는 **필드의 최소/최대/합계/평균/중간값 같은 통계 결과**를 보여줍니다.

메트릭 집계 종류는 다음과 같습니다.

| 메트릭 집계       | 설명                                               |
|:-------------|:-------------------------------------------------|
| avg          | 필드의 평균값 계산                                       |
| min          | 필드의 최솟값 계산                                       |
| max          | 필드의 최댓값 계산                                       |
| sum          | 필드의 총합 계산                                        |
| percentiles  | 필드의 백분윗값 계산                                      |
| stats        | 필드의 min, max, sum, avg, count(도큐먼트 개수)를 한 번에 보여줌 |
| cardinality  | 필드의 유니크한 값 개수를 보여줌                               |
| geo-centroid | 필드 내부의 위치 정보의 중심점 계산                             |

여기서 가장 널리 사용되는 대표적인 집계 타입을 중심으로 살펴보도록 하겠습니다.

### 5.2.1. 평균값/중간값 구하기

특정 필드의 **평균값**을 구하는 집계 요청을 먼저 살펴보도록 하겠습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "avg_aggs": {
      "avg": {
        "field": "products.base_price"
      }
    }
  }
}
```

위 명령은 평균 집계(avg)를 이용해  `products.base_price` 필드의 평균값을 구하는 요청입니다.
평균 집계를 사용하려면 **필드 타입이 정수나 실수 타입**이어야 하며, `size : 0`으로 설정하면 집계에 사용한 도큐먼트를 결과에 포함하지 않음으로써 **비용을 절약**할 수 있습니다.

```json
{
  // ...
  "aggregations" : {
    "avg_aggs" : {
      "value" : 34.88652318578368
    }
  }
}
```

이번에는 특정 퍼센트에 속하는 값을 구할 수 있는 **백분위 집계**를 살펴보도록 하겠습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "percent_aggs": {
      "percentiles": {
        "field": "products.base_price",
        "percents": [
          25,
          50
        ]
      }
    }
  }
}
```

위 요청은 `products.base_price` 필드의 백분위값 중 25%와 50%에 속하는 데이터를 요청합니다.

```json
{
  // ...
  "aggregations" : {
    "percent_aggs" : {
      "values" : {
        "25.0" : 16.984375,
        "50.0" : 25.6708156779661
      }
    }
  }
}
```

### 5.2.2. 필드의 유니크한 값 개수 확인하기

필드의 중복된 값들을 제외한 유니크한 데이터의 개수를 보고 싶다면 **카디널리티 집계**를 사용하면 됩니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "cadi_aggs": {
      "cardinality": {
        "field": "day_of_week",
        "precision_threshold": 100
      }
    }
  }
}
```

위 요청은 `day_of_week` 필드의 유니크한 데이터 개수를 요청합니다.
`precision_threshold` 파라미터는 정확도 수치이며, 값이 크면 정확도가 올라가는 대신 시스템 리소스를 많이 소모합니다.
반대로 값이 작으면 정확도는 떨어지지만 시스템 리소스를 덜 소모합니다.

```json
{
  // ...
  "aggregations" : {
    "cadi_aggs" : {
      "value" : 7
    }
  }
}
```

참고로, 카디널리티는 매우 적은 메모리로 집합의 원소 개수를 추정할 수 있는 **HyperLogLog++ 알고리즘** 기반으로 동작합니다.
`HyperLogLog++` 알고리즘은 집합 내 중복되지 않는 항목의 개수를 세기 위한 알고리즘으로, 5% 이내의 오차를 보이며 정밀도를 직접 지정하여 오차율을 낮출 수 있습니다.
특히, 집계 대상의 크기가 얼마나 크든 간에 지정한 정밀도 이상의 메모리를 사용하지 않기 때문에 엘라스틱서치와 같은 대용량 데이터베이스에 유용한 알고리즘입니다.

만약, `precision_threshold` 값을 실제 결과인 7보다 작은 5를 넣으면 결과가 어떻게 바뀌는지 살펴봅시다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "cadi_aggs": {
      "cardinality": {
        "field": "day_of_week",
        "precision_threshold": 5
      }
    }
  }
}
```

그러면 잘못된 결과를 반환하는 것을 알 수 있습니다.

```json
{
  // ...
  "aggregations" : {
    "cadi_aggs" : {
      "value" : 8
    }
  }
}
```

일반적으로 `precision_threshold` 값은 카디널리티의 실제 결과(7)보다 크게 잡아야 합니다.
그러나 실제 결과를 모르기 때문에 `precision_threshold` 값을 변경해보면서 값이 변경되지 않는 임계점을 찾는 것도 방법입니다.

**기본값은 3000**이며, 최대 40000까지 값을 설정할 수 있습니다.

### 5.2.3. 검색 결과 내에서의 집계

이번에는 검색 쿼리와 함께 집계를 사용하는 방법을 알아보도록 하겠습니다.

먼저 검색 쿼리를 이용해 `day_of_week` 필드 값이 `Monday`인 도큐먼트만을 뽑아낸 다음,
`products.base_price` 필드의 합을 집계해보려 합니다.
```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "query": {
    "term": {
      "day_of_week": "Monday"
    }
  },
  "aggs": {
    "query_aggs": {
      "sum": {
        "field": "products.base_price"
      }
    }
  }
}
```

결과를 보면 576개의 도큐먼트를 뽑아낸 다음 합을 계산하는 것을 확인할 수 없습니다.
참고로, 모든 도큐먼트는 4675개입니다.

```json
{
  // ..
  "hits" : {
    "total" : {
      "value" : 579,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "aggregations" : {
    "query_aggs" : {
      "value" : 45457.28125
    }
  }
}
```

## 5.3. 버킷 집계

버킷 집계는 **특정 기준에 맞춰서 도큐먼트를 그룹핑하는 역할**을 합니다.
여기서 버킷은 도큐먼트가 분할되는 단위로 나뉜 각 그룹을 의미합니다.

버킷 집계의 종류는 다음과 같습니다.

| 버킷 집계             | 설명                                                                        |
|:------------------|:--------------------------------------------------------------------------|
| histogram         | 숫자 타입 필드를 일정 간격으로 분류                                                      |
| date_histogram    | 날짜/시간 타입 필드를 일정 날짜/시간 간격으로 분류                                             |
| range             | 숫자 타입 필드를 사용자가 지정한 범위 간격으로 분류                                             |
| date_range        | 날짜/시간 타입 필드를 사용자가 지정한 날짜/시간 간격으로 분류                                       |
| terms             | 필드에 많이 나타나는 용어(값)들을 기준으로 분류                                               |
| significant_terms | terms와 유사하나, 모든 값 대상이 아닌 인덱스 내 전체 문서 대비 현재 검색 조건에서 통계적으로 유의마한 값들을 기준으로 분류 |
| filters           | 각 그룹에 포함시킬 문서 조건을 직접 지정. 이때, 조건은 일반적으로 검색에 사용되는 쿼리와 동일                    |

### 5.3.1. 히스토그램 집계

히스토그램 집계는 **숫자 타입 필드를 일정 간격 기준으로 구분**해주는 집계입니다. 예제를 살펴봅시다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "histogram_aggs": {
      "histogram": {
        "field": "products.base_price",
        "interval": 100
      }
    }
  }
}
```

위 요청은 `products.base_price` 필드값을 100 간격으로 구분한 히스토그램 집계 요청입니다.

```json
{
  // ...
  "aggregations" : {
    "histogram_aggs" : {
      "buckets" : [
        {"key" : 0.0, "doc_count" : 4672},
        {"key" : 100.0, "doc_count" : 263},
        {"key" : 200.0, "doc_count" : 12},
        {"key" : 300.0, "doc_count" : 1},
        {"key" : 400.0, "doc_count" : 1},
        {"key" : 500.0, "doc_count" : 0},
        {"key" : 600.0, "doc_count" : 0},
        {"key" : 700.0, "doc_count" : 0},
        {"key" : 800.0, "doc_count" : 0},
        {"key" : 900.0, "doc_count" : 0},
        {"key" : 1000.0, "doc_count" : 1}
      ]
    }
  }
}
```

### 5.3.2. 범위 집계

**히스토그램 집계**는 설정이 간단하지만 **각 버킷의 범위를 동일하게 지정**할 수 밖에 없다는 단점이 있습니다.
그렇기에 특정 구간에 데이터가 몰려 있거나 데이터 편차가 큰 경우 모든 데이터를 표현하는 데 비효율적입니다.
이런 경우, 범위 집계를 이용하면 됩니다. **범위 집계는 각 버킷의 범위를 사용자가 직접 설정**할 수 있습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "range_aggs": {
      "range": {
        "field": "products.base_price",
        "ranges": [
          {"from": 0, "to": 50},
          {"from": 50, "to": 100},
          {"from": 100, "to": 200},
          {"from": 200, "to": 1000}
        ]
      }
    }
  }
}
```

히스토그램 버킷 결과 0 ~ 200 사이에 거의 모든 데이터가 몰려 있어, 위와 같이 범위를 세분화해 요청을 했습니다.

```json
{
  // ...
  "aggregations" : {
    "range_aggs" : {
      "buckets" : [
        {
          "key" : "0.0-50.0",
          "from" : 0.0,
          "to" : 50.0,
          "doc_count" : 4341
        },
        {
          "key" : "50.0-100.0",
          "from" : 50.0,
          "to" : 100.0,
          "doc_count" : 1902
        },
        {
          "key" : "100.0-200.0",
          "from" : 100.0,
          "to" : 200.0,
          "doc_count" : 263
        },
        {
          "key" : "200.0-1000.0",
          "from" : 200.0,
          "to" : 1000.0,
          "doc_count" : 13
        }
      ]
    }
  }
}
```

그런데 결과를 보면 히스토그램 집계 요청에서의 도큐먼트 총합과 범위 집계의 도큐먼트 총합이 다릅니다.
이러한 이유는, `products`가 배열이기 때문입니다.

예를 들어, 도큐먼트 A에서 `products.base_price`가 배열 형태로 [20, 70] 값을 갖고 있다고 해봅시다.
히스토그램 집계에서는 범위가 0 ~ 100이기 때문에 1이 카운트되고,
범위 집계에서는 범위가 0 ~ 50, 50 ~ 100으로 세분화되기 때문에 도큐먼트 A가 개별로 계산되어 총합은 2로 카운트됩니다.

<img width="526" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/1986f534-b379-46f3-84a6-c609574e5502">

### 5.3.3. 용어 집계

용어 집계는 **필드의 유니크한 값을 기준으로 버킷을 나눌 때 사용**됩니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "term_aggs": {
      "terms": {
        "field": "day_of_week",
        "size": 6
      }
    }
  }
}
```
 
위 요청은 `day_of_week` 필드 값을 기준으로 도큐먼트 수가 많은 상위 6개 버킷을 요청하고 있습니다.
size를 작성하지 않으면 기본 값으로 10이 적용됩니다.

```json
{
  // ...
  "aggregations" : {
    "term_aggs" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 579,
      "buckets" : [
        {"key" : "Thursday", "doc_count" : 775},
        {"key" : "Friday", "doc_count" : 770},
        {"key" : "Saturday", "doc_count" : 736},
        {"key" : "Sunday", "doc_count" : 614},
        {"key" : "Tuesday", "doc_count" : 609},
        {"key" : "Wednesday", "doc_count" : 592}
      ]
    }
  }
}
```

여기서 `doc_count_error_upper_bound`은 버킷이 잠재적으로 카운트하지 못할 도큐먼트의 수이고,
`sum_other_doc_count`는 버킷에는 있지만 size 때문에 보이지 않는 도큐먼트의 수입니다.
size 설정 때문에 보이지는 않지만, 아마 579는 결과에 없는 `Monday` 버킷의 도큐먼트 개수일 것입니다.

#### 5.3.3.1. 용어 집계가 정확하지 않은 이유

용어 집계가 **부정확도를 표시하는 이유**는 **분산 시스템의 집계 과정에서 발생하는 잠재적인 오류 가능성** 때문입니다.
분산 시스템에서는 데이터를 여러 노드에서 분산하고 취합하는 과정에서 오류가 발생할 수 있으며,
엘라스틱서치는 샤드에 도큐먼트를 저장하고 이를 분산하기에 size 설정 값과 샤드 개수 등에 의애 집계에 오류가 발생할 수 있습니다.

오류가 발생하는 상황에 대해 살펴보도록 하겠습니다.

<img width="457" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/e9bffac5-6890-453f-ab79-fd0f79b5e039">

먼저 실제 결과를 보면 토요일은 9개, 일요일은 11개이고, 나머지 요일은 각각 10개입니다.
그런데 용어 집계 결과를 보면 토요일은 8개, 일요일은 7개로 실제 결과와 다른 것을 확인할 수 있습니다.
이는 **분산된 개별 노드 단에서 먼저 집계를 하고 그 결과를 취합해 다시 집계하기 때문**입니다.
상위 6개 버킷만 가져오기 때문에 샤드 1은 일요일을 제외한 상위 6개 버킷에 대해서 집계를 하고,
샤드 2는 토요일을 제외하고 집계를 합니다. 그 후, 취합된 결과에서 토요일을 제외한 상위 6개의 결과를 반환합니다.
이 경우 정확한 값과 다른 결과가 나올 수 있고, 이러한 정보가 응답 결과의 `doc_count_error_upper_bound`에 표시됩니다.

#### 5.3.3.2. 용어 집계 정확성 높이기

용어 집계의 정확성을 높이려면, **고속 처리를 위한 리소스와 속도 간 트레이드오프의 일환으로 리소스 소비량을 늘려야** 합니다.

먼저 문제가 있는지 확인하기 위해, 용어 집계 요청 시 `show_term_doc_count_error` 파라미터를 추가합니다.
이 파라미터는 버킷마다 `doc_count_error_upper_bound` 값을 확인합니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "term_aggs": {
      "terms": {
        "field": "day_of_week",
        "size": 6,
        "show_term_doc_count_error": true
      }
    }
  }
}
```

각 버킷마다 `doc_count_error_upper_bound` 값이 0이 나오면 오류가 없다는 뜻입니다.

```json
{
  // ...
  "aggregations" : {
    "term_aggs" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 579,
      "buckets" : [
        {
          "key" : "Thursday",
          "doc_count" : 775,
          "doc_count_error_upper_bound" : 0
        },
        // ...
      ]
    }
  }
}
```

호가인 결과 이상값이 나오면 이를 **해결**하기 위해 다음과 같이 **샤드 크기 파라미터를 늘릴** 필요가 있습니다.

```json
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "term_aggs": {
      "terms": {
        "field": "day_of_week",
        "size": 6,
        "shard_size": 100
      }
    }
  }
}
```

위와 같이 `shard_size` 파라미터를 이용해 샤드 크기를 늘릴 수 있습니다.
**샤드 크기는 용어 집계 과정에서 개별 샤드에서 집계를 위해 처리하는 개수**를 의미합니다.
샤드 크기를 크게 하면 정확도가 올라가는 대신 리소스 사용량이 올라가 성능이 떨어질 수 있음에 주의해야 합니다.

## 5.4. 집계의 조합

### 5.4.1. 버킷 집계와 메트릭 집계

집계 조합의 가장 기본적인 형태는 보통 버킷 집계로 도큐먼트를 그룹핑한 후 각 버킷 집계별 메트릭 집계를 사용하는 것입니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "term_aggs": {
      "terms": {
        "field": "day_of_week",
        "size": 5
      },
      "aggs": {
        "avg_aggs": {
          "avg": {
            "field": "products.base_price"
          }
        }
      }
    }
  }
}
```

위 요청은 용어 집계로 상위 5개 버킷을 만들고 각 버킷 내부에서 `products.base_price` 필드의 평균값을 구하는 요청입니다.

실행해보면 요일 내에 평균 값이 있는 것을 확인할 수 있습니다.

```json
{
  // ...
  "aggregations" : {
    "term_aggs" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 1171,
      "buckets" : [
        {
          "key" : "Thursday",
          "doc_count" : 775,
          "avg_aggs" : {
            "value" : 34.68040897713688
          }
        },
        // ...
      ]
    }
  }
}
```

만약 버킷 집계 후 다수의 메트릭 집계를 요청하고 싶다면, 다음과 같이 요청하면 됩니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "term_aggs": {
      "terms": {
        "field": "day_of_week",
        "size": 5
      },
      "aggs": {
        "avg_aggs": {
          "avg": {
            "field": "products.base_price"
          }
        },
        "sum_aggs": {
          "sum": {
            "field": "products.base_price"
          }
        }
      }
    }
  }
}
```

### 5.4.2. 서브 버킷 집계

서브 버킷은 **버킷 안에 다시 버킷 집계를 요청하는 집계**로, **트리 구조**를 떠올리면 됩니다.

히스토그램 집계를 사용해 `products.base_price` 필드를 100 단위로 구분한 다음, `day_of_week` 필드를 유니크한 값 기준으로 구분하여 상위 2개 버킷만 반환하는 요청을 통해 서브 버킷을 살펴보겠습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "histogram_aggs": {
      "histogram": {
        "field": "products.base_price",
        "interval": 100
      },
      "aggs": {
        "term_aggs": {
          "terms": {
            "field": "day_of_week",
            "size": 2
          }
        }
      }
    }
  }
}
```

실행해보면, 아래와 같이 히스토그램 집계 결과 내에 상위 2개의 버킷에 대한 결과가 포함되어 있는 것을 확인할 수 있습니다.

```json
{
  // ...
  "aggregations" : {
    "histogram_aggs" : {
      "buckets" : [
        {
          "key" : 0.0,
          "doc_count" : 4672,
          "term_aggs" : {
            "doc_count_error_upper_bound" : 0,
            "sum_other_doc_count" : 3128,
            "buckets" : [
              {"key" : "Thursday", "doc_count" : 775},
              {"key" : "Friday", "doc_count" : 769}
            ]
          }
        },
        {
          "key" : 100.0,
          "doc_count" : 263,
          "term_aggs" : {
            "doc_count_error_upper_bound" : 0,
            "sum_other_doc_count" : 176,
            "buckets" : [
              {"key" : "Friday", "doc_count" : 44},
              {"key" : "Thursday", "doc_count" : 43}
            ]
          }
        },
        // ...
      ]
    }
  }
}
```

이러한 서브 버킷은 **2단계를 초과해서 만들지 않는 편이 좋습니다.**
서브 버킷을 많이 만들수록 버킷의 수는 기하급수적으로 늘어나,
**집계 성능이 느려질 뿐만 아니라 클러스터에 과도한 부하**를 가하게 될 수 있습니다.

## 5.5. 파이프라인 집계

파이프라인 집계는 **이전 집계로 만들어진 결과를 입력으로 삼아 다시 집계하는 방식**입니다.
이러한 파이프라인은 다음과 같이 2가지 유형이 존재합니다.

- 부모 집계 : 기존 집계 결과를 이용해 새로운 집계 생성. 결과는 기존 집계 내부에서 나옴
  ```json
  {
    "aggs": {
      // ...
      "aggs": {
        // ...
        "부모 집계"
      }
    }
  }
  ```
- 형제 집계 : 기존 집계를 참고해 집계 수행. 결과는 기존 집계와 동일 선상에 나옴
  ```json
  {
    "aggs": {
      // ...
      "aggs": {
        // ...
      },
      "형제 집계"
    }
  }
  ```
  
자주 사용되는 파이프라인 집계는 다음과 같습니다.

| 형제/부모 집계 | 집계 종류             | 설명                                          |
|:--------:|:------------------|:--------------------------------------------|
|  형제 집계   | min_bucket        | 기존 집계 중 최솟값을 구함                             |
|          | max_bucket        | 기존 집계 중 최댓값을 구함                             |
|          | avg_bucket        | 기존 집계의 평균값을 구함                              |
|          | sum_bucket        | 기존 집계의 총합을 구함                               |
|          | stat_bucket       | 기존 집계의 min, max, sum, count, avg를 구함        |
|          | percentile_bucket | 기존 집계의 백분윗값을 구함                             |
|          | moving_avg        | 기존 집계의 이동 평균을 구함. 단, 기존 집계는 순차적인 데이터 구조여야 함 |
|  부모 집계   | derivative        | 기존 집계의 미분을 구함                               |
|          | cumulative_sum    | 기존 집계의 누적합을 구함                              |

### 5.5.1. 부모 집계

부모 집계는 **단독으로 사용할 수 없고 반드시 먼저 다른 집계가 있어야 하며, 그 집계 결과를 부모 집계가 사용**합니다.
누적합을 구하는 요청을 통해 부모 집계를 살펴보겠습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "histogram_aggs": {
      "histogram": {
        "field": "products.base_price",
        "interval": 100
      },
      "aggs": {
        "sum_aggs": {
          "sum": {
            "field": "taxful_total_price"
          }
        },
        "cum_aggs": {
          "cumulative_sum": {
            "buckets_path": "sum_aggs"
          }
        }
      }
    }
  }
}
```

위 요청을 해보면, 아래와 같이 누적합 결과인 `cum_sum`이 개별 버킷 내부에서 보이고 실제로 점점 누적되는 것을 확인할 수 있습니다.

```json
{
  // ...
  "aggregations" : {
    "histogram_aggs" : {
      "buckets" : [
        {
          "key" : 0.0,
          "doc_count" : 4672,
          "sum_aggs" : {"value" : 348124.12890625},
          "cum_aggs" : {"value" : 348124.12890625}
        },
        {
          "key" : 100.0,
          "doc_count" : 263,
          "sum_aggs" : {"value" : 44002.0},
          "cum_aggs" : {"value" : 392126.12890625}
        },
        // ...
      ]
    }
  }
}
```

### 5.5.2. 형제 집계

형제 집계는 **기존 집계 내부가 아닌 외부에서 기존 집계를 이용해 집계 작업**을 합니다.
총합 버킷 요청을 통해 형제 집계를 살펴보겠습니다.

```bash
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "term_aggs": {
      "terms": {
        "field": "day_of_week",
        "size": 2
      },
      "aggs": {
        "sum_aggs": {
          "sum": {
            "field": "products.base_price"
          }
        }
      }
    },
    "sum_total_price": {
      "sum_bucket": {
        "buckets_path": "term_aggs>sum_aggs"
      }
    }
  }
}
```

먼저 `term_aggs`는 용어 집계로 `day_of_week` 필드를 기준으로 요일별 버킷을 나눕니다.
`size`가 2이므로 상위 2개의 버킷을 생성하고, `sum_aggs`에서 `products.base_price` 필드의 총합을 구합니다.
그 다음 `sum_bucket` 형제 집계를 이용해 기존 버킷별 합을 구한 집계를 다시 합칩니다.
이 때 버킷 경로에서 사용한 `>` 기호는 하위 집계 경로를 나타낼 때 씁니다.

```json
{
  // ...
  "aggregations" : {
    "term_aggs" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 3130,
      "buckets" : [
        {
          "key" : "Thursday",
          "doc_count" : 775,
          "sum_aggs" : {
            "value" : 58020.32421875
          }
        },
        {
          "key" : "Friday",
          "doc_count" : 770,
          "sum_aggs" : {
            "value" : 58341.9765625
          }
        }
      ]
    },
    "sum_total_price" : {
      "value" : 116362.30078125
    }
  }
}
```


> 본 게시글은 [엘라스틱 스택 개발부터 운영까지](https://product.kyobobook.co.kr/detail/S000001932755) 도서를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 책을 읽어보실 것을 추천해 드립니다.
>