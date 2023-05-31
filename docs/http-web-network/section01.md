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

### 인터넷 프로토콜 4계층
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

### TCP/IP 패킷 정보

TCP/IP 패킷은 아래와 같은 정보를 가지고 있습니다.

<img width="289" alt="image" src="https://github.com/Kim-SuBin/TIL/assets/46712693/0498bb5b-a4cd-429b-9fce-f2560d1d9b7b">

이전에 설명드린 대로, **IP 패킷**은 출발지 IP, 목적지 IP 등의 내용을 가지고 있습니다.
**TCP 세그먼트**는 출발지/목적지에 대한 Port를 가지고 있어 어떠한 프로그램이 출발지/목적지인지 알 수 있습니다.
그 외에 전송 제어, 순서, 검증 정보 등에 대한 정보를 가지고 있습니다.

### TCP 특징
- Transmission Control Protocol : 전송 제어 프로토콜
- 연결 지향적 : TCP 3 way handshake (가상 연결)
- 데이터 전달 보증
- 순서 보장
- 신뢰할 수 있는 프로토콜
- 현재는 대부분 TCP 사용

