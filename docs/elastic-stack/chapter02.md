# 02. 실습 환경 구성


::: tip ✅ 실습 환경

- Mac M1
- Elasticsearch 7.10.2  
- Kibana 7.10.2

:::

책의 2장에서는 윈도우 환경에 **엘라스틱서치**와 **키바나**를 설치하는 방법에 대해 설명하며, **로그스태시**는 6장, **비츠**는 7장에서 설치 방법을 설명합니다.
그러나 여기서는 윈도우 환경이 아닌 **Mac M1 환경에서 docker를 활용해 설치**할 예정이며, 윈도우 환경 설치 방법이 궁금하시다면 책을 참고하시길 바랍니다.

엘라스틱 스택에 포함되는 제품들은 다음과 같은 언어 기반으로 만들어져, 운영체제에 대한 종속이 거의 없는 편입니다.

| 제품                     | 개발 언어               |
|------------------------|---------------------|
| 엘라스틱서치 (Elasticsearch) | 자바 (Java)           |
| 로그스태시 (Logstash)       | 제이루비 (JRuby)        |
| 키바나 (Kibana)           | 자바스크립트 (Javascript) |
| 비츠 (Beats)             | 고 (Go)              |

다만, 실제 엘라스틱에서 공식적으로 동작을 보증하는 환경이나 버전에 대해서는 [공식 홈페이지의 서포트 매트릭스](https://www.elastic.co/kr/support/matrix#matrix_os)를 확인하시길 바랍니다.

## 2.1. 엘라스틱서치 설치 및 실행

엘라스틱서치를 도커로 설치하기 위해 아래 명령어를 통해 엘라스틱서치 이미지를 내려받습니다.

```bash
docker pull docker.elastic.co/elasticsearch/elasticsearch:7.10.2
```

이미지 받기가 완료되면, 엘라스틱서치 이미지를 통해 컨테이너를 띄워보도록 하겠습니다.
실습 환경에서 사용할 엘라스틱서치이므로 단일 노드 클러스터로 설정하여 띄워줍니다.
이 때, `--name`을 통해 컨테이너 이름을 `elasticsearch`로 지정하고, 백그라운드로 실행되도록 `-d` 명령어를 포함하여 실행합니다.

```bash
docker run --name elasticsearch -d -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.10.2
```

설치가 완료되면, `docker ps` 명령어를 통해 정상 동작 중인지 확인할 수 있습니다.
정상 실행 상태라면 명렁어에 대한 응답이 다음과 유사하게 뜰 것입니다.

```bash
CONTAINER ID   IMAGE                                                  COMMAND                  CREATED              STATUS              PORTS                                            NAMES
8118f3245652   docker.elastic.co/elasticsearch/elasticsearch:7.10.2   "/tini -- /usr/local…"   About a minute ago   Up About a minute   0.0.0.0:9200->9200/tcp, 0.0.0.0:9300->9300/tcp   elasticsearch
```

다른 환경에서 엘라스틱서치를 설치하고 실행 방법은 [공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/7.10/install-elasticsearch.html)에서 확인하거나 책을 참고하시길 바랍니다.

이제 엘라스틱서치 설치 및 실행을 완료하였으니, 아래 명령어를 통해 정상 응답이 오는지 확인해봅시다.

```bash
curl -X GET "localhost:9200?pretty"
```

정상적으로 엘라스틱서치가 실행되었다면 아래와 유사한 형태의 JSON 응답을 확인할 수 있습니다.

```json
{
  "name" : "8118f3245652",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "0j7i6gY_QlmK9emJ0N6kkQ",
  "version" : {
    "number" : "7.10.2",
    "build_flavor" : "default",
    "build_type" : "docker",
    "build_hash" : "747e1cc71def077253878a59143c1f785afa92b9",
    "build_date" : "2021-01-13T04:42:47.157277Z",
    "build_snapshot" : false,
    "lucene_version" : "8.7.0",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```

명령 시 사용한 `curl`은 다양한 통신 프로토콜을 지원하여 데이터를 전송할 수 있는 소프트웨어입니다. 명령행 기반의 터미널 환경에서 동작하기 때문에 서버 환경에서 쉽게 테스트해볼 수 있다는 장점이 있습니다. `-X` 는 옵션이며, 아래와 같은 옵션을 많이 사용합니다.

| 옵션  | 설명                                             |
|-----|------------------------------------------------|
| -X  | 요청 시 사용할 메소드를 정한다. (POST/GET/PUT/DELETE)       |
| -d  | POST 요청에서만 사용되며, 데이터를 전송할 수 있다.                |
| -o  | 리모트에서 받아온 데이터를 표준 출력에 보여주는 것이 아닌 파일 형식으로 저장한다. |

## 2.2. 키바나 설치 및 실행

이번에는 키바나를 설치해보도록 하겠습니다. 엘라스틱서치를 설치할 때처럼, 키바나 이미지를 먼저 pull 받습니다.

```bash
docker pull docker.elastic.co/kibana/kibana:7.10.2
```

그 다음 아래 명령어를 입력하여 키바나를 실행합니다.
이 때, `YOUR_ELASTICSEARCH_CONTAINER_NAME_OR_ID` 부분에 현재 실행 중인 엘라스틱서치의 컨테이너 이름이나 ID를 입력해야합니다.
위에서 설정한 엘라스틱서치가 실행중이므로 이 부분에 저는 `elasticsearch` 라고 넣었습니다.
그리고 `--name`을 통해 컨테이너 이름을 `kibana`로 설정하고, `-d`를 통해 백그라운드로 실행하였습니다.

```bash
docker run --link YOUR_ELASTICSEARCH_CONTAINER_NAME_OR_ID:elasticsearch -p 5601:5601 docker.elastic.co/kibana/kibana:7.10.2

# e.g.
docker run --name kibana -d --link elasticsearch:elasticsearch -p 5601:5601 docker.elastic.co/kibana/kibana:7.10.2
```

이 때, **엘라스틱서치를 먼저 실행하고 키바나를 실행**해야 합니다. 그렇게 하지 않으면 에러가 발생합니다.

다른 환경에서 키바나를 설치하고 실행 방법은 [공식 문서](https://www.elastic.co/guide/en/kibana/7.10/install.html)에서 확인하거나 책을 참고하시길 바랍니다.

키바나 설치 및 실행을 완료하였으니, `http://localhost:5601` 주소를 통해 웹 브라우저 접속해봅시다.
그러면 아래와 같이 `Welcom to Elastic` 이라는 문구와 함께 페이지 접속이 되는 것을 확인할 수 있습니다.

<img width="591" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/b5979799-5ebd-4b55-8059-599a9a636911">

## 2.3. 엘라스틱 스택 라이선스 확인

엘라스틱서치와 키바나를 정상적으로 실행하여 브라우저에 접속하였다면, 이번에는 엘라스틱 스택 라이선스를 확인해보도록 하겠습니다. 메뉴를 열어 `Management > Stack Management > Stack > License Management` 로 접속하면 현재 설정된 라이선스를 확인할 수 있습니다. 최초 설치 시 자동으로 베이직 라이선스가 활성화되며, 여기서는 베이직 라이선스를 통해 실습을 진행할 예정입니다.

![image](https://user-images.githubusercontent.com/46712693/234765028-88333315-ea84-4e58-aa1f-50be08546058.png)

## 2.4. Docker Compose 이용하기

`docker-compose.yml`이라는 이름의 파일을 생성하고, 내용을 다음과 같이 작성합니다.

```yaml
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.10.2
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms1g -Xmx1g
    ports:
      - 9200:9200

  kibana:
    image: docker.elastic.co/kibana/kibana:7.10.2
    container_name: kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - 5601:5601
```

그 다음 아래 명령어를 통해 Docker Compose를 실행합니다.
그러면 Docker Compose는 `docker-compose.yml`

```bash
docker-compose up -d
```

`-d`는 백그라운드로 명령어를 실행하겠다는 의미입니다.

`docker-compose.yml` 작성과 관련하여 더 자세한 내용이 궁금하시다면, [공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html#docker-compose-file)를 참고하시길 바랍니다.

> 본 게시글은 [엘라스틱 스택 개발부터 운영까지](https://product.kyobobook.co.kr/detail/S000001932755) 도서를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 책을 읽어보실 것을 추천해 드립니다.
>

추가로 참고한 내용
- <https://www.elastic.co/guide/en/elasticsearch/reference/7.10/docker.html>
- <https://www.elastic.co/guide/en/kibana/7.10/docker.html>
