# 14. 운영 클러스터 구축

## 14.1. 성능과 안정성을 위한 운영 클러스터 고려사항

### 14.1.1. 노드 구성 계획

노드를 구성할 때는 **최소 3개의 마스터 노드**로 구성하는 것이 좋습니다.
이는 하나의 마스터 노드가 다운되었을 때, 스플릿 브레인(split brain) 없이 서비스가 지속되게 하기 위한 최소한의 구성입니다.
그 다음으로는 **데이터 노드를 최소 두 대 이상** 구성해야 합니다. 데이터 노드가 하나일 경우, 레플리카를 활용할 수 없기 때문입니다.
이 외 인제스트나 코디네이팅 전용 노드, 머신러닝 노드는 상황에 따라 추가하면 됩니다.

### 14.1.2. 하드웨어 선정

하드웨어는 **일반적으로 너무 크지도 작지도 않은 중간 크기를 권장**합니다.

1. 메모리
   - 검색 성능을 위해 샤드 유지, 검색과 집계, 인덱싱, 코디네이팅 등 전반적인 영역에서 메모리 많이 사용
   - **가장 이상적인 메모리는 64GB**
2. CPU
    - 단일 코어 높은 성능 CPU vs. 성능은 낮지만 더 많은 코어 CPU ⇒ **더 많은 코어** CPU가 더 좋음
    - CPU 사양에는 크게 민감하지 않은 편이지만, **무거운 집계나 인덱싱 수행 시 CPU 성능이 중요**해짐
3. 디스크
   - **SSD** 권장
   - 어쩔 수 없이 하드 디스크를 사용할 경우 RPM이 빠른 제품 추천
   - 네트워크 저장소는 비추!
4. 하드웨어 통일
   - 되도록 **각 노드들의 하드웨어 성능을 통일**하는 것이 중요
   - 하드웨어 혼합 사용 시, 핫/웜/콜드 노드끼리는 동일 인덱스를 공유하지 않게 하자.
5. 스냅샷
    - **용량 기준으로 선정하기**
    - 반드시 모든 노드에서 접근 가능하도록 네트워크 공유 드라이브 구성 필요

### 14.1.3. 엘라스틱서치 버전 선정

엘라스틱서치는 **특별한 상황이 아니라면 가장 최신 버전을 사용**하는 것이 좋습니다.
다만, 버전의 마지막 자리인 패치 버전이 0인 경우 (x.x.0) 다음 패치 버전을 기다리는 것이 좋습니다.
메이저나 마이너 버전이 올라간 직후의 버전이기 때문에 새로 추가된 기능들에 버그가 포함될 가능성이 높기 때문입니다.

## 14.2. 클러스터 구성

여러 노드들을 하나의 클러스터로 설정하기 위해서는 각 노드의 `elasticsearch.yml`에 다음과 같은 설정이 필요합니다.

```yaml
cluster.name: test
node.name: node-1
node.master: true
node.data: true
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 0.0.0.0
discovery.seed_hosts: ["10.1.1.1", "10.2.2.2", "10.3.3.3"]
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]
```

각 설정에 대해 정리하면 다음과 같습니다.

|              설정              | 설명                                                                                                        |
|:----------------------------:|:----------------------------------------------------------------------------------------------------------|
|         cluster.name         | 클러스터 이름 지정. **노드들을 같은 클러스터로 묶기 위해서는 반드시 클러스터명 통일 필요**. 다른 클러스터와의 간섭 방지를 위해 고유한 명칭으로 지정해야 함                |
|          node.name           | 노드 이름 지정. 단일 클러스터 안에 **노드마다 다른 명칭 부여**                                                                    |
|         network.host         | 노드가 배포될 네트워크 호스트 지정. IPv4, IPv6 주소 외에도 `_local_`, `_site_`, `_global_` 값을 이용해 각각 로컬, 내부, 외부 네트워크 자동 지정 가능 |
|          http.port           | HTTP 통신에 사용할 포트 지정. default 9200                                                                          |
|        transport.port        | 트랜스포트 통신에 사용할 포트 지정. default 9300                                                                         |
|     discovery.seed_hosts     | 클러스터 구성을 위해 발견해야 하는 노드. 마스터 후보 노드들만 등록해두어도 충분함                                                            |
| cluster.initial_master_nodes | 클러스터 최초 구성 시 사용되는 설정. 초기 마스터 후보 기입 필요. 호스트 주소가 아닌 node.name을 기입해야 함                                       |

서로 다른 서버에서 구성하므로 `node.name`을 제외하고는 동일하게 작성해도 됩니다.
만약 동일 서버에서 노드를 구성 중이라면, `http.port`와 `transport.port`도 다르게 작성해야 합니다.
또한, **노드 롤(node.roles)은 특별히 설정하지 않았기에 모두 마스터 후보 노드이면서 데이터 노드 역할**을 합니다.

### 14.2.2. 개발 모드와 운영 모드

위에서 언급한대로 노드가 배포될 때 네트워크 호스트를 자동으로 지정할 수 있습니다.

```yaml
network.host: [_local_, _site_, _global_]
```

`_local_`은 로컬 네트워크, `_site_`는 내부 네트워크, `_global_`은 외부 네트워크를 자동으로 찾아주는 별칭입니다.
설정된 내부/외부 네트워크가 없을 경우 정상적으로 바인딩되지 않을 수 있으며, 명시적으로 바인딩할 IP나 네트워크 어댑터명 지정도 가능합니다.

### 14.2.3. 운영 모드 설정

운영 모드 설정과 관련된 내용은 생략하도록 하겠습니다.
비슷한 글로는 [003. CentOS에서 Elasticsearch 운영 환경 설정](/docs/elastic-stack-posting/003.Elasticsearch_Operating_Env_Setting_within_CentOS.md)을 참고하셔도 좋습니다.
자세한 설명을 원하신다면 책을 참고하시길 바랍니다.

## 14.3. 보안 기능 설정

엘라스틱서치의 보안 기능은 기본적인 **사용자 역할 기반 접근 제어**와 **노드 간 통신 암호화, HTTP 통신 암호화** 등을 포함합니다.

- 사용자 역할 기반 접근 제어 : 사용자 계정별로 역할을 할당해 수행 가능한 작업 종류 제한 (특정 인덱스 읽기/쓰기 권한 등 제한)
- 노드 간 통신 암호화, HTTP 통신 암호화 : 각 네트워크 구간에 대한 암호화 통신 지원을 통해 중간에서 패킷 염탐이나 탈취하는 데이터 유출 공격 방지 가능

6.8, 7.1 버전부터는 무료로 제공되는 베이직 라이선스에서도 보안 기능을 사용할 수 있게 되었으며, 다음과 같이 활성화할 수 있습니다.

```yaml
xpack.security.enabled: true
```

### 14.3.1. 인증서 생성

엘라스틱서치에서 자체적으로 제공하는 인증서 생성 도구인 `elasticsearch-certutil`을 사용하면 인증서를 생성할 수 있습니다.
이 인증서를 통해 `CA (certificate auhority)` 인증서를 생성합니다. 이 때, **CA 인증서는 단 하나만 생성**하며, 이를 이용해 각 노드별 인증서를 생성할 예정입니다.
노드 1에서 진행해주시면 됩니다.

먼저 아래 명령어를 통해 CA 인증서를 생성합니다. CA 인증서는 이름과 비밀번호만 설정하면 생성됩니다. 이름을 지정하지 않으면 `elastic-stack-ca.p12`라는 이름으로 생성됩니다.

```bash
bin/elasticsearch-certutil ca
```

그 다음 CA 인증서로부터 각 노드별 인증서와 Kibana 인증서를 생성합니다. CA 인증서와 마찬가지로 하나의 노드에서 필요한 만큼 노드별 인증서를 생성하면 됩니다.
CA 인증서와 동일하게 생성할 인증서명과 비밀번호만 기입하면 됩니다.

```bash
bin/elasticsearch-certutil cert --ca elastic-stack-ca.p12
```

생성된 인증서는 각 노드별 디렉터리와 키바나 디렉터리의 config 내에 추가하시면 됩니다.
참고로, **각 노드는 CA 인증서와 함께 노드별 인증서**를 가지고 있어야 하며, kibana는 CA 인증서가 필요하지 않습니다.

그리고 HTTP 암호화에 사용할 인증서도 생성해야 합니다. 이 역시 노드1에서 진행해주세요.

```bash
bin/elasticsearch-certutil http
```

생성 시 필요한 질문

```bash
Generate a CSR? [y/N] N
Use an exisiting CA? [y/N] y
CA Path: certs/elastic-stack-ca.p12
Password for elastic-stack-ca.p12: 
For how long should your certificate be valid? [5y]
Generate a certificate per node? [y/N] N
```

이 때, `Generate a CSR?` 이라고 하여 인증서 서명 요청(CSR)을 생성할지 여부를 물어보는 데, **직접 생성한 인증서를 사용하는 경우 N**을 선택하면 됩니다.
Y를 선택하면 인증 기관을 통해 발급받은 인증서가 필요합니다.

또한, CA 인증서를 사용할 것이므로  `Use an exisiting CA?`는 y로 입력합니다. 그리고 path는 노드의 config 디렉터리를 기준으로 상대 경로를 입력합니다.

인증서 유효 기간은 입력하지 않을 시 기본 설정인 5년으로 지정됩니다.
또한 엘라스틱서치 노드별 별도의 인증서를 생성할지 여부도 설정할 수 있습니다.
N을 누르면 하나의 공통 인증서를 사용하며, y를 입력하면 노드별로 인증서를 생성합니다.
이 때, 인증서에서 사용할 호스트 네임과 IP 입력이 필요합니다.

마지막으로 인증서의 비밀번호를 입력하면 인증서 생성이 완료됩니다.
이 때, zip 파일로 생성되며 node 파일인지, kibana 파일인지를 디렉터리로 구분하고 있기 때문에 디렉터리 확인 후, 노드별 인증서와 동일 위치에 두면 됩니다.

### 14.3.2. 노드 간 통신 암호화

생성한 인증서를 사용해 전송 계층 보안(TLS) 설정을 할 수 있습니다.

```yaml
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.keystore.path: certs/node1.p12
xpack.security.transport.ssl.truststore.path: certs/node1.p12
```

`verification_mode`는 인증서 검증 방식입니다.
- `full` : 인증서 생성 시 등록한 IP, 도메인까지 검증
- `certificate` : 기본적인 인증서 검증만 수행
- `none` : 인증서 검증 무시

비밀번호 같은 민감한 정보를 암호화해서 저장하고 싶다면 키스토어(keystore)를 사용하면 됩니다.
키스토어 생성은 노드 별로 생성해야 합니다.
아래 명령어를 사용해 키스토어를 생성할 수 있습니다.

```bash
bin/elasticsearch-keystore create -p
```

키스토어를 생성하였다면, elasticsearch.yml에서 등록한 keystore 인증서 비밀번호 등록도 필요합니다.

```bash
bin/elasticsearch-keystore add xpack.security.transport.ssl.keystore.secure_password
```

keystore 인증서와 마찬가지로 truststore 인증서도 비밀번호를 등록이 필요합니다.

```bash
bin/elasticsearch-keystore add xpack.security.transport.ssl.truststore.secure_password
```

### 14.3.3. HTTP 클라이언트 통신 암호화

엘라스틱서치는 **모든 외부 REST API 요청에 대한 암호화**를 제공합니다. 각 노드에 다음과 같은 설정을 추가하면 됩니다.

```yaml
xpack.security.http.ssl.enabled: true
xpack.security.http.ssl.keystore.path: certs/http.p12
```

아까 transport 관련 인증서를 등록했던 것과 마찬가지로 keystore 인증서 비밀번호를 등록합니다.
(노드 별로 진행해주세요.)

```bash
bin/elasticsearch-keystroe add xpack.security.http.ssl.keystore.secure_password
```

### 14.3.4. 클러스터 시작과 빌트인 사용자 설정

모든 설정을 완료했다면 이제 클러스터를 시작하면 됩니다.
실행이 정상적으로 되었다면, 마지막으로 **빌트인 사용자 비밀번호 초기화**를 해야 합니다.
이 작업은 하나의 노드에서만 실행하면 됩니다.

```bash
bin/elasticsearch-setup-passwords interactive
```

빌트인 사용자는 엘라스틱서치를 포함한 각 스택의 구성 요소들에 대한 최소 권한이 할당되어 있는 계정입니다.
각 계정에 대한 비밀번호 초기화를 완료했다면 다음 명령어를 통해 엘라스틱서치 API를 요청해봅시다.

```bash
curl -u elastic:<비밀번호> -k -I https://localhost:9200
```

- `-u username:password` : 사용자 인증 정보
- `-k` : 인증서 검증 무시
- `-I` : 응답 헤더만 확인하도록 설정

### 14.3.5. 키바나와 엘라스틱서치 간 통신 암호화

엘라스틱서치에서 SSL과 사용자 인증 등을 활성화했다면, Kibana에서도 설정 변경이 필요합니다.

```yaml
elasticsearch.username : "kibana_system"
elasticsearch.password : "비밀번호 입력해주세요."
elasticsearch.ssl.certificateAuthorities: ["/etc/kibana/config/certs/elasticsearch-ca.pem"]
elasticsearch.hosts : ["https://10.1.1.1:9200", "https://10.2.2.2"9200", "https://10.3.3.3:9200"]
```

엘라스틱서치에서 설정한 빌트인 사용자인 "kibana_system"으로 username을 설정하고, 초기화한 비밀번호를 입력해야 합니다.
그리고 certificateAuthorities에 엘라스틱서치와 통신하기 위한 CA 인증서를 설정하는 데, **절대 경로**로 입력해야 합니다.
그리고 host는 모두 http에서 https로 변경해야 합니다.

### 14.3.6. 키바나와 브라우저 간 통신 암호화

키바나에서 HTTPS 활성화를 위해서는 이전에 엘라스틱서치에서 생성한 자체 CA 인증서 기반으로 만든 kibana.p12 인증서를 사용하면 됩니다.

```yaml
server.ssl.enabled: true
server.ssl.keystore.path: "/etc/kibana/config/certs/kibana.p12"
```

그 다음 엘라스틱서치와 마찬가지로 키스토어를 생성합니다.

```bash
bin/kibana-keystore create
```

그 다음 인증서 비밀번호를 등록합니다

```bash
bin/kibana-keystore add server.ssl.keystore.password
```

사실 이렇게 생성하면 HTTPS 활성화를 할 수 있으나, 안전하지 않다는 표시가 뜹니다.
내부에서 사용하기에는 이슈가 없지만, 만약 이 문구를 원하지 않는다면 공인 인증서를 사용하는 방법도 있습니다.
(공인 인증서를 Kibana SSL에만 적용시킬 수도 있어요!)

::: 참고

14.4는 생략하였습니다. 해당 부분은 사용자 등록에 대한 내용이며 UI를 통해 간단하게 설정할 수 있기에 생략했습니다.
궁금하시다면 책을 참고하실 것을 추천드립니다.

:::


> 본 게시글은 [엘라스틱 스택 개발부터 운영까지](https://product.kyobobook.co.kr/detail/S000001932755) 도서를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 책을 읽어보실 것을 추천해 드립니다.
>

**추가로 참고한 내용**

- [002. Elasticsearch Cluster 설정하기](/docs/elastic-stack-posting/002.Elasticsearch_Cluster_Setting.md)
- [003. CentOS에서 Elasticsearch 운영 환경 설정](/docs/elastic-stack-posting/003.Elasticsearch_Operating_Env_Setting_within_CentOS.md)