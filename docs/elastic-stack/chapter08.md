# 08. 키바나

::: tip ✅ 실습 환경

- Elasticsearch 7.10.2
- Kibana 7.10.2

:::

## 8.1. 키바나 소개

키바나의 기능은 다음과 같이 세 가지로 분류할 수 있습니다.

| 기능            | 설명                             |
|:--------------|:-------------------------------|
| 데이터 분석과 시각화 툴 | 오플소스 기반의 데이터 탐색 및 시각화 도구 제공    |
| 엘라스틱 관리       | 보안, 스냅샷, 인덱스 관리, 개발자 도구 등을 제공  |
| 엘라스틱 중앙 허브    | 모니터링을 비롯해 엘라스틱 솔루션을 탐색하기 위한 포털 |

그 중 **데이터 분석과 시각화 기능을 중점으로 소개** 할 예정입니다.

키바나는 아래 그림과 같이 시스템의 끝단에서 사용자에게 정보를 효율적으로 제공합니다.
엘라스틱서치에서 제공되는 시계열 데이터나 위치 분석 같은 다양한 분석 결과를 키바나를 통해 시각화 할 수 있습니다.

<img width="383" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/90c1b37b-4a7b-4604-9baa-ae4cc8399559">

키바나의 대표적인 시각화 기능은 다음과 같습니다.

| 시각화 기능           | 설명                                        |
|:-----------------|:------------------------------------------|
| 디스커버 (Discover)  | 데이터를 도큐먼트 단위로 탐색해 구조와 관계 등을 확인할 수 있다.     |
| 시각화 (Visualize)  | 다양한 그래프 타입으로 데이터 시각화를 할 수 있다.             |
| 대시보드 (Dashboard) | 그래프, 지도 등을 한 곳에서 확인하면서 다양한 인사이트를 얻을 수 있다. |
| 캔버스 (Canvas)     | 그래프와 이미지 등을 프레젠테이션 슬라이드처럼 구성할 수 있다.       |
| 맵스 (Maps)        | 위치 기반 데이터를 지도 위에 표현할 수 있다.                |

시각화와 관련된 키바나의 특징은 다음과 같습니다.

- 시각화를 하기 위해서는 **반드시 엘라스틱서치 인덱스에 연결**되어야 함
- 범용적인 시각화 툴로 사용하기에는 무리
- 다양한 그래프와 지도를 지원
- 빅데이터 처리 가능

### 8.1.1. 인덱스 패턴

키바나는 데이터 소스를 엘라스틱서치 인덱스에서 가져오는데, 이를 **인덱스 패턴 (Index patterns)** 이라고 합니다.
키바나 인덱스 패턴은 엘라스틱서치의 인덱스 매핑 정보 등을 키바나에 사용하기 적합하게 **미리 캐싱해둔 것**으로, 여러 개의 인덱스에 대한 메타 데이터를 병합해 저장해뒀다가 검색이나 시각화 생성 시 활용합니다.

예를 들면, 아래 그림과 같이 `syslog-*`이라는 키바나 인덱스 패턴은 엘라스틱서치 인덱스 중 `syslog-*₩ 인덱스 패턴에 접근해 쿼리 및 시각화를 합니다.

<img width="313" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/233a14f4-f68d-4d95-b619-55f1b53d4ba3">

키바나에서 바로 엘라스틱서치 인덱스에 **직접 접근하지 않고 인덱스 패턴이라는 구조를 한 단계 더 거치는 것일까요?**

인덱스 패턴을 만드는 이유는 **복수 인덱스에 대한 매핑을 사전에 병합**해두어 쿼리 생성이나 시각화에 활용할 수 있기 때문입니다.

키바나에서 직접 인덱스 패턴을 생성해봅시다. 우선, 키바나 Dev Tools에서 아래와 같이 인덱스를 추가해줍니다.

```bash
PUT kibana_index1/_doc/1
{
  "name": "kim"
}

PUT kibana_index2/_doc/1
{
  "name": "lee"
}
```

그 다음 메뉴에서 `Management > Stack Management`에 접속하여 `Kibana > Index Patterns`를 선택합니다. 그러면 아래와 같은 이미지를 볼 수 있습니다.

<img width="800" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/cee6d99d-05f6-4654-b49c-a99adf23b463">

화면에서 `Create index pattern` 버튼을 클릭합니다. 그러면 아래와 같은 화면이 뜨는데, 중간의 빈 칸에 `kibana_index*`와 같이 **인덱스 패턴명**을 입력합니다.
인덱스 패턴명에는 와일드카드(*)와 쉼표(,)를 사용해 복수의 패턴을 포함할 수 있고, 패턴 앞에 마이너스(-) 기호를 붙여 특정 패턴을 제외할 수도 있습니다.

<img width="800" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/15b7b3ba-94d7-4ac6-b166-563d0172b342">

`Next step` 버튼 클릭 후 뜨는 화면에서 `Create index pattern`을 클릭하면 인덱스 패턴이 생성됩니다.

<img width="800" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/b7d8217f-cc34-4072-97d9-e5c3d03769c8">

## 8.2. 디스커버

실습을 하기 전 엘라스틱에서 제공하는 샘플 데이터 3개를 로드해주세요. 샘플 데이터를 로드하면 인덱스 생성과 동시에 인덱스 패턴을 만들어줍니다. 샘플 데이터 로드는 이전에 살펴보았기 때문에 설명을 생략하겠습니다.

가장 먼저 디스커버(`Discover`)에 대해 알아보겠습니다. 메뉴에서 `Kibana > Discover`를 클릭하면 아래와 같은 화면을 확인할 수 있습니다.
이렇듯 디스커버는 문서/이벤트/도큐먼트/로그의 시간에 따른 발생량을 히스토그램으로 보여주며, 데이터 구조나 필드 등을 간단히 확인할 수 있습니다.
그렇기에 주로 **데이터를 확인하고 탐색하기 위한 용도로 사용**합니다.

<img width="743" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/3632a27c-0fa7-43c8-ba67-b0b109cfa6d8">

디스커버 화면을 구성하는 각 인터페이스들의 설명은 아래와 같습니다.

| 번호  | 인터페이스       | 설명                                                   |
|:---:|:------------|:-----------------------------------------------------|
|  1  | 툴바          | 결과를 저장하고 불러오는 등 기능 버튼 위치                             |
|  2  | 인덱스 패턴      | 탐색할 인덱스 패턴을 선택할 수 있음                                 |
|  3  | 사이드바        | 필드 타입과 필드명을 볼 수 있어 데이터 구조 확인 가능. 특정 필드만 선택도 가능함      |
|  4  | 시계열 히스토그램   | 시간에 따른 발생량 확인 가능. 인덱스 패턴에 시간/날짜 필드가 없는 경우 아무것도 표출 안함 |
|  5  | 쿼리바         | 쿼리를 이용해 데이터 검색을 할 수 있음                               |
|  6  | 타임피커        | 시계열 데이터의 시간 범위 조정 기능                                 |
|  7  | 필터바         | 쿼리를 필터처럼 사용 가능                                       |

### 8.2.1. 쿼리바, 필더바, 타임피커

쿼리바와 필더바, 타임피커는 Discover 외 다른 메뉴에서도 쓰이며, 잘 사용하면 **데이터를 쉽게 조작하고 탐색**할 수 있습니다.
단, **쿼리바와 필더바는 상호 보완적인 관계**임을 명시합시다. 그리고 타임피커는 인덱스 패턴에 타임 필드를 지정한 경우에만 사용할 수 있습니다.

#### 8.2.1.1. 쿼리바

쿼리바는 **KQL(Kibana Query Language)과 루씬 쿼리 스트링**, 두 가지 언어를 지원합니다. 특별한 설정이 없으면 쿼리바는 기본적으로 KQL 언어를 이용합니다.
쿼리바는 다음과 같이 **자동완성 기능**을 제공하여 손쉽게 쿼리를 구현할 수 있습니다.

<img width="1014" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/45be6d77-176c-4d6e-9c35-fe75e7c835e8">

#### 8.2.1.2. 필터바

필터바는 **필드를 개별적으로 처리**할 수 있습니다. `Add filter`를 클릭하고 다음과 같이 `Field`와 `Operator`, `Value`를 설정하면 됩니다.
필터바 역시 **자동완성 기능을 지원**하며, `Edit as Query DSL` 링크를 이용해 복잡한 쿼리도 설정할 수 있습니다.

<img width="371" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/e157b528-f3b6-42f1-83e4-19c9bc459446">

설정된 필터를 클릭하면 아래 이미지와 같은 메뉴가 뜹니다.

<img width="243" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/dd6d13be-d38e-465b-b160-b1ae0447f113">

메뉴의 `Pin across all apps`를 선택하면, 그 필터는 **모든 앱(대시보드, 시각화 등)에 적용**됩니다.
그리고 `Temporarily disable`은 **일시적으로 필터를 비활성화**하며, 다시 활성화하려면 `Re-enable`을 선택하면 됩니다.

#### 8.2.1.3. 타임피커

타임피커는 **날짜/시간 정보를 조작해 데이터를 특정 날짜/시간 범위 내에서 시각화**합니다. 키바나 인덱스 패턴을 생성할 때, **기본 날짜/시간 필드를 설정**해야 사용할 수 있습니다.

아이콘을 누르면 다음과 같이 `Commonly used`와 `Recently used date ranges` 그리고 `Refresh every`를 볼 수 있습니다.
여기서 `Refresh every`를 `Stop`하지 않으면 계속 데이터를 불러오기 때문에, 특정 데이터에 대해 상세히 확인하고 싶다면 `Stop`으로 설정해야 합니다.

<img width="387" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/e6857f03-46f9-4e43-ab0d-ad5ce04c7b59">

날짜와 시간을 직접 설정하려면, 아래와 같이 날짜 위치를 클릭하면 됩니다. 이 때, 설정을 변경하면 `Update` 버튼을 클릭해야 적용됩니다.

<img width="541" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/37378b3c-4eb5-4c5b-b3c9-fa957c4c1359">

## 8.3. 시각화

시각화(Visualize)는 **엘라스틱서치에 저장된 데이터를 그래프나 표, 지도 등 다양한 타입으로 보여주는 역할**을 합니다.
라인, 바, 파이 차트, 맵 등 **다양한 시각화 타입을 지원**합니다. 시각화 타입은 대부분 메트릭 집계와 버킷 집계를 통해 그래프를 그리고, 복잡한 그래프는 파이프라인 집계를 이용합니다.

메트릭 집계, 버킷 집계, 파이프라인 집계는 앞에서 설명하기에 간략하게 짚고 넘어가도록 하겠습니다.

- 메트릭 집계 : 평균/최소/최대 같은 수량 계산
- 버킷 집계 : 특정 기준에 맞춰 데이터 분리. 서브 버킷 생성 가능
- 파이프라인 집계 : 집계 결과를 입력으로 받아 다시 집계를 함. 부모/형제 집계 유형이 있음

시각화 타입을 생성하기 위해서는 메뉴의 `Kibana > Visualize`에 접속합니다.

<img width="1135" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/9db7912b-a4b5-4ebf-97bb-b90d44ae5916">

그 다음 `Create visualization`을 눌러 줍니다.

<img width="1124" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/2e432748-a77c-41a8-8ece-ef43285a83eb">

그러면 다음과 같은 팝업이 뜹니다. 여기서 원하는 타입을 선택해서 시각화하면 됩니다.

<img width="741" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/2f25e1b4-b459-44c7-867b-81f2c96a216a">

### 8.3.1. 막대 그래프

막대그래프는 막대 형태로 **2차원 데이터를 표현**하며, `Vertical Bar`와 `Horizontal Bar`라는 두 가지 타입이 있습니다.

먼저, `Vertical Bar`를 살펴보겠습니다. `Visualization`에서 `Vertical Bar`를 선택한 다음, `kibana_sample_data_flights`를 인덱스 패턴으로 고르면 다음과 같은 그래프를 볼 수 있습니다.

<img width="1140" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/ec51fa37-e863-4672-b034-a960321f35a5">

`Metrics`는 평균값/최솟값/최댓값 같은 통계를 보여주고, 그래프의 **Y축**에 속합니다.

`Buckets`는 다음과 같은 세 가지 메뉴가 존재합니다.

- `X-axis` : X축을 의미
- `split series` : 서브 버킷 용도로 사용
- `split chart` : 그래프를 버킷 기준으로 쪼개서 보여줄 때

`X-axis`를 선택하면 `Aggregation`을 선택해야 합니다.

<img width="373" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/c4aff016-7879-4bf8-be10-0a6eee95ab5e">

선택할 수 있는 `Aggregation` 종류는 다음과 같습니다.

| 버킷 집계             | 설명                                                  |
|:------------------|:----------------------------------------------------|
| Date Histogram    | 날짜/시간 데이터 타입을 가진 필드만 사용 가능. 일정한 주기를 기준으로 버킷을 구분함    |
| Date Range        | 날짜/시간 데이터 타입을 가진 필드만 사용 가능. 사용자가 임의 범위를 지정해 버킷을 구분함 |
| Filters           | 필터 적용 가능                                            |
| Histogram         | 일정한 주기를 기준으로 버킷을 구분함                                |
| Ipv4 Range        | IP 타입을 가진 필드만 사용 가능. IP 범위를 임의 지정해 버킷을 구분함          |
| Range             | 사용자가 임의의 범위를 지정해 버킷을 구분함                            |
| Significant Terms | 필드의 유니크한 값 중 통계적으로 의미 있는 용어를 기준으로 구분함               |
| Term              | 필드의 유니크한 값을 기준으로 구분함                                |

#### 8.3.1.1. Buckets - Date Histogram

이 중에서 먼저 `Date Histogram`을 선택한 다음, `Field`는 `timestamp`로 설정하고 `Minimum interval`은 `Minute`로 설정한 다음 하단의 `Update` 버튼을 눌러봅시다.
그러면 다음과 같은 `Date Histogram`을 볼 수 있습니다.

<img width="1136" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/665a1d6f-b434-4e59-ae8a-baa09e95086b">

#### 8.3.1.2. Buckets - Range

그 다음 `Range`를 사용해보겠습니다. `Range`를 사용하려면 사용자가 데이터 값의 범위를 대략으로 알고 있어야 합니다. 그래야 임의로 간격을 지정할 수 있기 때문입니다.

먼저, 키바나 콘솔에서 데이터 범위를 확인해봅시다.

```bash
GET kibana_sample_data_flights/_search
{
  "size": 0,
  "aggs": {
    "unique_aggs": {
      "terms": {
        "field": "dayOfWeek"
      }
    }
  }
}
```

엘라스틱서치 search API를 사용해 확인해보면 다음과 같이 `dayOfWeek` 필드가 0부터 6까지의 값을 가진다는 것을 알 수 있습니다.

```json
{
  // ...
  "aggregations" : {
    "unique_aggs" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {"key" : 0, "doc_count" : 2033},
        {"key" : 4, "doc_count" : 2001},
        {"key" : 2, "doc_count" : 1948},
        {"key" : 1, "doc_count" : 1934},
        {"key" : 5, "doc_count" : 1915},
        {"key" : 3, "doc_count" : 1914},
        {"key" : 6, "doc_count" : 1314}
      ]
    }
  }
}
```

이제 `Range`를 생성해봅시다. `Field`는 `dayOfWeek`를 선택하고, 0~1, 1~4, 4~7의 세 구간으로 나눈다음 `Update`를 클릭합니다. 그러면 다음과 같이 Range 별로 구분된 Vertical Bar를 확인할 수 있습니다.

<img width="1143" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/7ba15877-eb12-4db0-86ba-4a4b102b0641">

#### 8.3.1.3. Buckets - Term

`Term`은 특정 필드의 고윳값을 기준으로 데이터를 구분합니다. `Aggregation`은 `Terms`로 선택하고 `Field`는 `dayOfWeek`를 선택합니다.

<img width="1142" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/322577a1-e337-4d0e-bb6d-dd090558d754">

`Order by`라고 하여 X축 정렬이며, 다음과 같이 세 가지입니다.

- `Metric` : Count가 높은 버킷 순으로 정렬
- `Alphabetical` : 알파벳순으로 정렬
- `Custom metric` : 사용자가 정의한 정렬에 사용하기 위한 집계. 정렬을 위한 집계를 생성해야 함.

여기서는 `Custom metric`을 선택했으며, `DistanceMiles` 필드의 평균값이 높은 순으로 X축 정렬하도록 설정했습니다.

그리고 마지막의 `Order`는 정렬을 오름차순으로 할지 내림차순으로 할지 설정하며, `Size`는 그래프로 보여줄 X축의 상위 개수를 선택합니다.

#### 8.3.1.4. Metrics

`Metrics`에 대해 알아보기 전 `Buckets`를 다음과 같이 설정합니다.

<img width="250" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/d33d1f1d-fa80-4552-ba27-c76dca8b1e02">

이제 `Metrics`를 설정해보겠습니다. `Metrics`에서 `+ Add`를 클릭하면 다음과 같은 두 가지 메뉴를 볼 수 있습니다.

- `Y-axis` : Y축이 되는 메트릭 메뉴.
- `dot size` : 라인을 동그라미 원 형태로 만들어줌

`Y-axis`는 특별한 설정을 하지 않으면 `Aggregation`을 `Count`로 지정합니다.
`Aggregation`을 다음과 같이 `Average`로 선택하고, `Field`는 `AvgTicketPrice`를 선택한 다음 `Update`하면 다음과 같음 화면을 볼 수 있습니다.

<img width="1144" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/2eb699e5-45e4-4477-bf92-a35f795e3629">

마지막으로 **파이프라인 집계**를 사용해보겠습니다. 기존의 `Metics`를 유지하고 `+Add`를 누르고 `Y-axis`를 선택합니다.
그 다음 `Aggregation`은 부모 파이프라인 집계 중 `Derivative`(미분)을 선택합니다.
그리고 `Metric`을 이전에 생성한 `Metric: Average AvgTicketPrice`로 선택합니다.

<img width="1143" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/c7f29023-e898-4192-bd40-202045c91442">

이렇게 하면, 이전에 만들었던 Metric을 이용해 미분 집계가 됩니다.

### 8.3.2. 히트맵

히트맵은 **열분포 형태의 시각화 표현 방식**입니다. X, Y축을 2개의 버킷으로 생성하고 메트릭값을 색의 진하기로 표현함으로써 3차원 데이터 처리가 가능합니다.
`Visualization`을 `HeatMap`으로 선택하고, 인덱스 패턴은 이전과 동일하게 `kibana_sample_data_flights`를 선택합니다.
그러면 화면을 볼 수 있습니다.

<img width="1144" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/f83a8ac5-9603-4048-9247-016de8e7a067">

히스토그램으로 구현하기 위해 다음과 같이 설정해주세요.

- Buckets : X-axis
  - Aggregation : Histogram
  - Field : dayOfWeek
  - Interval : 1
- Metrics : Y-axis
  - Sub aggregation : Terms
  - Field : DestCityName
  - Order by : Alphabetical
  - Order : Descending
  - Size : 5

그러면 다음과 같이 히스토그램이 깨진 모양으로 생성되는 것을 확인할 수 있습니다.

<img width="1143" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/be3daf8d-0bd9-47f8-a77c-d47b5ab9ccdf">

X, Y축이 고정되지 않으면 이렇게 데이터에 따라 축이 계속 변경됩니다.
Y축이 고정될 수 있도록 설정을 X축과 Y축을 바꿔줍시다.

<img width="1143" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/408e81ff-080c-4832-a84f-be3692c3730d">

### 8.3.3. TSVB (Time Series Visual Builder)

TSVB는 **시계열 데이터를 처리하기 위한 메뉴**로, 로그 모니터링이나 시간 범위 내의 특정 동작을 시각화하는 데 유용합니다.
TSVB를 통해 시계열 데이터, 통계 정보, n번째 상위 값, 게이지 등을 확인할 수 있습니다.

TSVB를 선택하면 다음과 같은 화면을 볼 수 있습니다.

<img width="1132" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/abe0e7a1-f785-47f3-ad62-1a343c872a17">

상단의 메뉴는 다음과 같습니다.

- `Time Series` : 시계열 데이터를 히스토그램 형태로 표현
- `Metric` : 텍스트 형태로 표현
- `Top N` : 수평 바 형태로 표현
- `Gauge` : 게이지 형태로 표현
- `Markdown` : 마크다운 형태로 표현
- `Table` : 테이블 형태로 표현

#### 8.3.3.1. Panel options

TSVB에서 데이터를 표시하기 위해 먼저 인덱스 패턴을 지정해봅시다. 인덱스 패턴은 `kibana_sample_data_flights`를 입력하고, `Time filed`는 `timestamp`를 입력합니다.

<img width="1132" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/32843f46-5814-45ca-991d-58ba7764a663">

`Interval`은 `Time filed`를 구분할 시간 주기이며, 여기서는 기본 설정 그대로 `auto`로 두었습니다. 그리고 `Panel filter`는 필터를 설정하는 것으로, 쿼리바와 사용법이 동일합니다.
`Cancelled : false` 같은 형식으로 작성하면 데이터 중 Cancelled가 false인 데이터만 필터링해서 보여줍니다.

#### 8.3.3.2. Data

Data는 **매트릭 집계나 파이프라인 집계를 추가**할 수 있습니다.
`AvgTicketPrice` 필드의 min, max를 볼 수 있도록 설정하고, 색이 표시되는 네모 칸을 눌러 색상을 선택합니다.
그러면 다음과 같이 두 개의 그래프가 함께 표출되는 것을 확인할 수 있습니다.

<img width="1133" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/eb63ef74-98a8-4ee0-aefa-05b0627dca5f">

#### 8.3.3.3. Anntations

Annotaion 메뉴에서 추가한 `Data sources`는 데이터에 직접적인 영향을 주는 것이 아닌 어노테이션 처리 용도로만 사용합니다.

`Index pattern`은 `kibana_sample_data_flights`로 설정하고, `Time field`는 `timestamp`로 설정합니다.
그 다음 `Query string`은 `OriginCityName : "Seoul"`로 입력하면 출발지가 서울인 데이터에 대해서만 표출되도록 필터링됩니다.

`Icon`은 어노테이션이 표시되는 아이콘입니다.
그리고 `Fields`와 `Row template`는 어노테이션에 설정이며, 어노테이션 아이콘에 마우스를 올렸을 때 표출되는 문구를 지정할 수 있습니다.
`Fields`는 어노테이션 설정을 할 필드이며, 복수인 경우 쉼표(,)를 넣습니다.
`Row Template`는 어노테이션 설정한 필드를 텍스트로 어떻게 표시할지 입력하며, 두 번의 중괄호(`{{}}`)에 필드명을 적어주면 됩니다.
`Fields`와 `Row template`를 각각 `OriginCityName, DestCityName`, `{{OriginCityName}} -> {{DestCityName}}`이라고 입력합니다.
그러면 다음과 같이 출발지가 서울인 경우에 대해, OriginCityName과 DestiCityName을 어노테이션으로 표시합니다.

<img width="1131" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/3bb8efad-77a9-4d78-b97e-01ecaa474aec">

## 8.4. 대시보드

### 8.4.2. 대시보드 만들기

대시보드는 **시각화에서 만들었던 다양한 타입들을 잘 조합하고 배치해 한 눈에 들어오도록 보여주는 것**입니다.

메뉴의 `Kibana > Dashboards`로 이동하면 다음과 같은 화면을 볼 수 있습니다.

<img width="1128" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/107a1295-2cfc-4202-8e8d-131cc8733db7">

여기서 `Create dashboard` 버튼을 누르면 새로운 대시보드를 만들 수 있습니다.
대시보드를 생성하면 아무것도 표시되지 않은 빈 화면을 볼 수 있습니다.

<img width="1144" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/b8c1831b-6451-4ccb-957b-a34415fdf803">

우측 상단 메뉴에서 `Add`를 누르면 패널을 추가할 수 있습니다. 여기는 `Flights` 샘플 데이터 중 다음과 같이 4개의 패널을 선택합니다.

<img width="569" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/1c3a3ee5-16fe-405a-a3a7-df9688ba45bb">

그러면 아래와 같은 화면이 표시됩니다. **창 이동**을 하고 싶다면 **패널 상단을 클릭한 채 드래그**하면 되고,
**패널 크기를 조절**하고 싶다면 **패널의 오른쪽 하단을 드래그**하면 됩니다.

<img width="757" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/0745e6b1-5f9b-48ea-8a39-f54e4f9a7285">

이미지에 표시된 **범례 표시 여부** 버튼을 클릭하여 범례가 보이지 않도록 설정을 변경하고, 파란색 영역을 드래그하여 타임 피커를 변경해봅시다.
그 다음 `ES-Air`를 선택하여 필터 설정도 해줍니다. 그러면 다음과 같이 변경된 화면을 볼 수 있습니다.

<img width="697" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/b27522d2-c7e7-4dc6-8f6e-58ea89676ff3">

이렇게 만들어진 대시보드는 저장하여 재활용하거나 편집을 할 수 있으며, 다른 웹 페이지에 임베딩하거나 링크를 통해 공유할 수도 있습니다.

## 8.5. 캔버스

캔버스는 **인포그래픽 형태로 데이터를 프레젠테이션할 수 있게 해주는 툴**입니다.
캔버스를 사용하면 보고서나 인포그래픽 형태의 대시보드를 생성할 수 있습니다. 이미지나 폰트 종류와 크기, 색상까지 변경이 가능하며, css 편집도 가능합니다

메뉴의 `Kibana > Canvas`로 이동하면 다음과 같이 샘플 데이터에서 제공하는 캔버스들이 보입니다.

<img width="881" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/b0c045ec-7498-4132-a3b6-783c8e90ea6e">

이렇게 샘플로 제공되는 캔버스를 이용해 캔버스에 대해 익혀보도록 하겠습니다. 목록에서 `[Flights] Overview`를 선택하면 아래와 같은 화면을 볼 수 있습니다.

<img width="1272" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/e64ede6c-9b66-4e56-a322-6f2d3fffbae8">

여기에 사용된 텍스트는 마크다운 객체이며, 비행기 모양의 아이콘은 이미지 객체입니다. 그리고 숫자는 텍스트 객체에서 메트릭 값을 표현한 것 입니다.

객체를 클릭하면 객체가 갖는 속성에 맞춰 오른쪽 인터페이스의 서식이나 설정 메뉴들이 변경됩니다.
이렇게 **객체화된 데이터는 동적으로 변경**할 수 있습니다.

`122 AIRPORTS`를 클릭하면 `Display`, `Data` 메뉴가 우측에 표시됩니다. 그 중 `Data`를 클릭하면 아래와 같이 `Elasticsearch SQL`이 표출되는 것을 확인할 수 있습니다.
이를 통해 여기서는 `Elasticsearch SQL`을 통해 데이터를 가져온다는 사실을 알 수 있습니다.


<img width="632" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/a797f2d5-ed00-46da-bbfa-846a66814702">

`Elasticsearch SQL`을 포함하여 다양한 방법으로 데이터 소스를 가져올 수 있습니다.

| 데이터 소스                      | 설명                            |
|:----------------------------|:------------------------------|
| Timelion                    | Timelion 문법을 이용해 시계열 데이터 시각화  |
| Demo Data                   | 프로젝트에 상관없이 데모로 제공하는 데이터 사용 가능 |
| Elasticsearch SQL           | 엘라스틱서치 쿼리 구문 사용               |
| Elasticsearch raw documents | 엘라스틱서치 데이터를 집계 과정 없이 직접 가져옴   |

이 중, 샘플에서 사용한 `Elasticsearch SQL`로 데이터를 가져오는 것이 가장 일반적입니다.

### 8.5.1. 엘라스틱서치 SQL

엘라스틱서치 SQL 쿼리로 요청을 하면 내부적으로 엘라스틱서치의 쿼리 DSL 형태로 변형하고 최적화하는 형태로 동작합니다.
6.3 버전부터 지원되기 때문에 6.3 이전 버전에서는 사용할 수 없으며, 아직 제약이 조금 있지만 추후 버전에서 계속 개선될 예정입니다.

엘라스틱서치 SQL 문의 `SELECT`문법은 다음과 같습니다.

```text
SELECT select_expr [, ...]
[ FROM table_name ]
[ WHERE condition ]
[ GROUP BY grouping_element [, ...] ]
[ HAVING condition ]
[ ORDER BY expression [ ASC | DESC ] [, ...] ]
[ LIMIT [ count ] ]
[ PIVOT (aggregation_expr FOR column IN ( value [ [ AS ] alias ] [, ...] ) ) ]
```

엘라스틱서치에서는 SQL문 지원을 위해 `_sql` 이라는 API를 제공하고 있습니다.
그렇기에 다음과 같이 키바나 콘솔에서 직접 엘라스틱서치 SQL 문을 사용할 수 있습니다.

```bash
POST _sql?format=txt
{
  "query" : "DESCRIBE kibana_sample_data_flights"
}
```

여기서 `format=txt` 옵션은 SQL 쿼리 결과를 JSON이 아닌 텍스트 형태로 표출한다는 의미이며, SQL 문은 JSON 형태보다 **텍스트 형태가 가독성이 더 높기** 때문에 가능하면 해당 옵션을 붙이는 것이 좋습니다.

<img width="1267" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/f6d681de-1ad7-4601-8abb-aedfa0830e8f">

조금 더 복잡한 여러 줄의 쿼리를 실행한다면 다음과 같이 `"""`로 감싸면 됩니다.

```bash
POST _sql?format=txt
{
  "query": 
  """
    SELECT Dest FROM kibana_sample_data_flights
    WHERE OriginCountry='US'
    ORDER BY DistanceMiles
    DESC LIMIT 10
  """
}
```

<img width="1209" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/a0fab832-325e-4768-9ec5-0b908aed0a9e">

방금 사용한 엘라스틱서치 SQL 문이 엘라스틱서치 DSL 문으로 변환하면 다음과 같습니다.

```bash
GET kibana_sample_data_flights/_search
{
  "_source": false,
  "stored_fields": "_none_",
  "docvalue_fields": [
    {
      "field": "Dest"
    }
  ],
  "query": {
    "term": {
      "OriginCountry": {
        "value": "US",
        "boost": 1.0
      }
    }
  },
  "sort": [
    {
      "DistanceMiles": {
        "order": "desc",
        "missing": "_first",
        "unmapped_type": "float"
      }
    }
  ],
  "size": 10
}
```

`decovalue_fields`에 우리가 보고 싶어하는 `Dest`를 설정하고, `WHERE`절은 `query`를 사용합니다.
그리고 `ORDER BY`는 `sort`를 통해 설정하며, `LIMIT`는 `size`로 설정합니다.

## 8.6 맵스

키바나 맵스는 지도 위에 다양한 정보를 표출하는 것으로, 다음과 같이 활용할 수 있습니다.

- 위치 정보가 포함된 데이터를 지도에 올려서 시각화
- 멀티 레이어 기능을 통해 다양한 형태의 지도를 레이어한 화면 표출
- 벡터 형태의 폴리곤 시각화
- 위치/지역 데이터 표현 및 처리할 수 있는 환경 제공
  - 위치 : 위경도가 포함된 특정 좌표
  - 지역 : 위치가 모여서 만드는 특정 공간, 경계선

`Kibana > Maps`로 이동하면 다음과 같이 샘플 데이터에 의해 생성된 맵스 시각화들이 보입니다.

<img width="977" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/27a5dbaa-9128-460f-bdf7-2b1b020683c8">

이 중 `[Flights] Origing and Destination Flight Time`을 선택하면 다음과 같은 화면을 볼 수 있습니다. 화면을 보면 멀티 레이어가 지원되는 것을 확인할 수 있고, 선택한 항목에 대한 세부 정보가 표출되는 것도 확인할 수 있습니다.

<img width="764" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/0ee4e334-42f5-4a66-99d6-3cec865c5f1b">

뿐만 아니라 대시보드에 추가해 다른 시각화 객체와도 함께 사용할 수 있습니다.

그리고 `Kibana > Maps`에서 `Create map`을 선택하면, `Add layer`를 클릭하면 다음과 같은 화면을 볼 수 있습니다.

<img width="1139" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/ab98505a-58b1-433e-90f8-95e3a8deeb60">

레이어는 크게 **벡터 레이어**와 **타일 서비스**로 구분할 수 있습니다.

- 벡터 레이어
  - 점, 선, 폴리곤 등을 표현
  - Upload GeoJson, Documents, Choropleth, Cluster and grids, Heat map, Point to Point, EMS Boundaries, Configured GeoJSON
- 타일 서비스
  - 타일 서버에서 제공하는 타일 서비스를 사용할 수 있음
  - EMBS Basemap, Configured Tile Map Service, Tile Map Service, Web Map Service, Vector tiles

이 중 `Configured GeoJson`과 `Configured Tile Map Service`는 키바나 설정 파일인 `kibana.yml`을 수정해야 보이는 메뉴입니다.

### 8.6.1. Clusters and grids

`Kibana > Maps`에서 `Create map` 버튼을 클릭하여 새로운 지도를 생성합니다.
그 다음 `Add layer`를 클릭하고 여러 메뉴 중 `Clusters and grids`를 선택합니다.
그리고 아래와 같이 설정한 다음 `Add layer`를 클릭합니다.

<img width="649" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/c6222378-38c4-479d-96f5-97199a3bd418">

그러면 다음과 같이 세부 설정을 할 수 있는 화면이 보입니다.

<img width="746" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/7231d9e5-9fae-4b70-bd66-3fef64d4b4e8">

`Name`을 통해 Layer 이름을 설정할 수 있으며, `Metrics`에서 카운트/최소/최대/평균 같은 매트릭 집계를 구할 수도 있습니다.
그리고 `Grid parameters`에서는 정확도를 설정할 수 있습니다.
여기서는 기본 설정을 유지한 채, `Name`만 `cluster`로 설정하여 생성했습니다.

`grid`로 생성할 때도 동일한 방식으로 진행하면 다음과 같이 클러스터와 그리드가 생성된 것을 확인할 수 있습니다.
그러면 다음과 같이 타일이 불러와 표출된 것을 확인할 수 있습니다.

<img width="743" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/26afeebb-44d9-43d2-9571-db93ee1ed1b8">

### 8.6.2. 타일맵 서비스

타일맵 서비스는 레이어를 등록하는 시점에 URL을 설정하는 것입니다.
타일맵은 지도 이미지를 타일 형태로 저장하고 요청이 올 때 타일 형태로 제공하는 구조로, HTTP API 형태로 사용하기 쉽게 제공됩니다.
`Add Layer`에서 `Tile Map Service`를 선택하고 `URL`에 `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}` 를 입력합니다.

<img width="1169" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/faa09bf1-210c-41a8-ad94-7feb69906997">

진행하는 과정에서 `Configured GeoJson`과 `Configured Tile Map Service`, `GeoJSON`은 생략하였습니다.
내용이 궁금하시다면 책을 보시거나 ElasticSearch Document를 참고하시길 바랍니다.

> 본 게시글은 [엘라스틱 스택 개발부터 운영까지](https://product.kyobobook.co.kr/detail/S000001932755) 도서를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 책을 읽어보실 것을 추천해 드립니다.
>
