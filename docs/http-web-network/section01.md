# 01. 인터넷 네트워크

## 1.1. 인터넷 통신

<img width="568" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/fa661de2-ca05-4fa1-bed7-150605a138ec">

클라이언트와 서버 사이에는 인터넷망이 있으며,
인터넷망은 광케이블, 인공위성 등 수많은 중간 노드로 구성될 수 있습니다.
이렇게 **복잡한 구조를 가진 인터넷망**에서 목적지 서버로 안전하게 데이터를 전달할 수 있는지 이해하려면
**IP**에 대해서 알아야 합니다.

## 1.2. IP (인터넷 프로토콜)
인터넷망에서 IP를 통해 통신을 하기 위해서는 IP 주소를 부여받아야 합니다.

<img width="460" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/9cd7a60b-ecb9-4fdd-9d07-c0079c328b80">

이러한 IP는 다음과 같은 **역할**을 합니다.

- 지정한 IP 주소(IP Address)에 데이터 전달
- 패킷(Packet)이라는 통신 단위로 데이터 전달

그렇다면 IP 패킷이 어떤 것인지 알아봅시다.

IP 패킷은 아래와 같이 전송 데이터와 이를 감싸는 출발지 IP, 목적지 IP 등으로 이루어져 있습니다.

<img width="187" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/1745afcd-f012-4353-91ce-48026da75f20">

**클라이언트**에서 출발지 IP와 목적지 IP, 데이터를 포함한 패킷을 구성하여 던지면,
각 노드에서는 정보를 기반으로 목적지 서버를 찾아 전달합니다.

<img width="550" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/16b4ecba-8146-459a-a11c-259df300eebf">

그러면 **목적지 서버**에서는 데이터를 잘 받았다는 표시의 패킷을 클라이언트로 전달합니다.

<img width="412" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/15563731-e8e6-4702-816b-2af602bcbc02">

이러한 IP는 다음과 같은 한계를 가집니다.

- 비연결성 : 패킷을 받을 대상이 없거나 서비스 불능 상태여도 패킷 전송<br/><img width="458" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/5d741849-01e8-4fee-b8ec-7bf257bad790">
- 비신뢰성
  - 패킷이 중간에 사라짐 ☞ 패킷 소실<br/><img width="510" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/c9a9eb06-6c46-4fd5-bd32-67d557141481">
  - 패킷이 순서대로 오지 않음<br/><img width="536" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/0da728bc-7bf9-4af5-b20e-a14a54276552">
- 프로그램 구분 : 같은 IP를 사용하는 서버에서 통신하는 애플리케이션이 둘 이상이면 구분하기 어려움

## 1.3. TCP, UDP

IP에서 발생하는 수많은 문제를 TCP가 해결해줍니다.

### 1.3.1. 인터넷 프로토콜 4계층
TCP에 대해 알아보기 전에 **인터넷 프로토콜 4계층**에 대한 개념을 간략하게 집고 넘어가도록 하겠습니다.

<img width="217" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/6bef1881-591e-4bc7-90cc-6754617546f5">

인터넷 프로토콜 4계층은 위 그림과 같이 제일 위에 애플리케이션 계층이 존재하고, 그 다음에 전송 계층과 인터넷 계층, 네트워크 인터페이스 계층이 순서대로 존재합니다.
이러한 계층을 바탕으로 IP 위에 TCP를 얹어서 IP의 문제를 해결한다고 보면 됩니다.

각 계층을 통해 데이터가 전송되는 흐름을 살펴보면 다음과 같습니다.

<img width="672" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/b0402b1a-b874-44c3-93f8-853e367d3caf">

1. 프로그램에서 Hello 라는 메시지를 생성합니다.
2. 이러한 HTTP 메시지는 SOCKET 라이브러리를 통해 전달됩니다.
3. HTTP 정보를 포함한 TCP 패킷이 생성됩니다.
4. TCP 정보를 포함한 IP 패킷이 생성됩니다.
5. LAN을 통과하면 인터넷을 통해 목적 서버로 전송됩니다.

### 1.3.2. TCP/IP 패킷 정보

TCP/IP 패킷은 아래와 같은 정보를 가지고 있습니다.

<img width="289" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/0498bb5b-a4cd-429b-9fce-f2560d1d9b7b">

이전에 설명드린 대로, **IP 패킷**은 출발지 IP, 목적지 IP 등의 내용을 가지고 있습니다.
**TCP 세그먼트**는 출발지/목적지에 대한 Port를 가지고 있어 어떠한 프로그램이 출발지/목적지인지 알 수 있습니다.
그 외에 전송 제어, 순서, 검증 정보 등에 대한 정보를 가지고 있습니다.

### 1.3.3.TCP 특징

TCP (Transmission Control Protocol)는 전송 제어 프로토콜로, 다음과 같은 특징을 가집니다.

- 연결 지향적 : TCP 3 way handshake (가상 연결)
- 데이터 전달 보증
- 순서 보장
- 신뢰할 수 있는 프로토콜
- 현재는 대부분 TCP 사용

좀 더 상세히 살펴보겠습니다.

#### 1.3.3.1. TCP 3 way handshake

3 way handshake 는 다음과 같은 과정을 거치며,  데이터를 주고 받을 양쪽 모두 준비가 되었다는 것을 보장합니다.

<img width="428" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/66363e2a-7668-45ee-9a32-c53323bf3840">

1. 클라이언트에서 서버로 SYN을 보내 접속을 요청합니다.
2. 서버는 접속 요청을 수락한다는 ACK와 SYN Flag를 클라이언트로 보냅니다.
3. 클라이언트에서 서버로 응답을 받았다는 의미에서 ACK를 보냅니다.
4. 클라이언트와 서버가 연결되어 데이터를 주고 받을 수 있게 됩니다.

TCP 연결이 되었다고 하는 것이 실제로 연결된 것이 아니라 **개념적으로 연결**되어 있는 것입니다.

#### 1.3.3.2. 데이터 전달 보증

<img width="425" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/513bf8b2-707f-4b0c-9fae-c46b2c2eb333">

클라이언트에서 서버로 데이터를 전송하면, 서버는 데이터를 잘 받았다는 사실을 클라이언트에게 알려줍니다. 이러한 점에서 데이터 전달이 보증된다고 표현합니다.

#### 1.3.3.3. 순서 보장

다음 그림과 같이 클라이언트에서 보낸 패킷 순서와 서버가 다르게 보내면, 클라이언트에 다시 보내달라고 요청하는 등으로 순서를 보장합니다.

<img width="453" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/0d63fa33-26c4-4236-83df-9d9495933f21">

물론, 실제로는 이것보다 더 효율적으로 구성되어 있으나 여기서는 간단하게 설명하기 위해 재요청 하는 방식으로 설명드렸습니다.

### 1.3.4. UDP 특징

UDP (User Datagram Protocol)은 사용자 데이터그램 프로토콜로, 기능이 거의 없어 하얀 도화지에 비유하며 다음과 같은 특징을 가집니다.

- 연결 지향 X (TCP 3 way handshake X)
- 데이터 전달 보증 X
- 순서 보장 X
- 데이터 전달 및 순서가 보장되지 않지만, 단순하고 빠름
- IP와 거의 비슷하나, Port와 체크섬 정도만 추가됨
- 애플리케이션에서 추가 작업이 필요함

참고로, HTTP3에서 UDP 기반의 `QUIC`라는 기술을 사용하고 있습니다.
QUIC는 TLS 1.3 기반으로 암호화된 세션과 함께 패킷을 보내면서 0-RTT 만에 신뢰성을 확보합니다.
또한, 혼잡 제어 및 재전송 기능을 제공하며 신뢰성을 확보합니다.

![image](https://github.com/Kim-SuBin/TIL/assets/46712693/1e89f9f8-a1d4-4fde-b2b3-457f40596657)

## 1.4. Port

Port는 **동일한 IP 내에 프로세스를 구분하는 것**입니다.

<img width="424" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/160532dc-8f67-4d63-a255-2ab7c4fe9120">

예를 들어, 하나의 기숙사가 IP라고 하고 기숙사 내에 있는 각 호실을 Port라고 생각하면 됩니다.

Port는 보통 `0 ~ 65535`까지 할당이 가능한데, `0 ~ 1023`은  잘 알려진 포트로 사용하지 않는 것이 좋습니다.
잘 알려져 있는 Port 몇 가지에 대해 정리해보았습니다.

- FTP : 20, 21
- TELNET : 23
- HTTP : 80
- HTTPS: 443

## 1.5. DNS

IP는 기억하기 어렵고, 변경될 수 있다는 단점을 가집니다.

<img width="364" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/5c22206a-071a-4331-a558-6c0d128806b3">

이러한 단점을 보완하기 위해 DNS (Domain Name System, 도메인 네임 시스템)을 사용합니다.
DNS는 **도메인 명을 IP 주소로 변환**합니다. 그렇기에 클라이언트는 도메인 명만 알고 있으면 됩니다.

<img width="362" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/f492f4ed-3bac-4bc7-84b3-1747f8e5cb00">

> 본 게시글은 [모든 개발자를 위한 HTTP 웹 기본 지식](https://www.inflearn.com/course/http-%EC%9B%B9-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/dashboard) 강의를 참고하여 작성되었습니다.
>
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.
>

추가로 참고한 내용
- <https://romromlog.tistory.com/entry/%EB%AA%A8%EB%93%A0-%EA%B0%9C%EB%B0%9C%EC%9E%90%EB%A5%BC-%EC%9C%84%ED%95%9C-HTTP-%EC%9B%B9-%EA%B8%B0%EB%B3%B8-%EC%A7%80%EC%8B%9D-1-%EC%9D%B8%ED%84%B0%EB%84%B7-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC>
- <https://bangu4.tistory.com/74>
- <https://mindnet.tistory.com/entry/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-%EC%89%BD%EA%B2%8C-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-22%ED%8E%B8-TCP-3-WayHandshake-4-WayHandshake>
- <https://www.inflearn.com/questions/744327/http3-udp%ED%86%B5%EC%8B%A0>