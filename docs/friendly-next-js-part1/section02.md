# 02. Next.js 기본 배우기

## 2.1. Next.js란 무엇인가

공식 문서에 따르면 *Next.js는 개발자가 웹 서비스를 만드는 데 필요한 도구를 제공하는 **React의 프레임워크*** 라고 소개합니다.
웹 서비스를 만들다보면 라우팅(Routing), 데이터 페칭(Data Fetching), 그리고 렌더링(Rendering) 같은 성능 최적화나 개발자 경험을 쉽게하여 생산성을 높이기 위한 부분을 Next.js가 다루고 있습니다.
즉, React가 화면을 그리는데 도움을 주는 라이브라리라면, Next.js는 화면을 그리는 것 외에 추가적인 부분들을 제공하는 것입니다,.
정리하면 React 개발에 필요한 선택을 최소화, 최적화하기 위한 프레임워크라고 보면 됩니다.

## 2.2. Next.js 13

Next.js는 디렉터리 구조에 따라 라우팅이 달라지는 파일 시스템 기반의 라우팅을 Pages Router라는 이름으로 지원했습니다.
Pages Router는 Next.js 13에 들어서며 App Router로 이름이 변경되었을 뿐만 아니라 더 고도화되었습니다.
App Router는 Hydration을 페이지 단위가 아닌 컴포넌트 단위로 지원하며, 이것을 Streaming이라고 부릅니다.
이 내용을 포함해 Next.js 13에 대해 자세하게 알아볼 예정입니다.

## 2.3. 서버 컴포넌트 (React Server Component, RSC)

App Router를 가능하게 만든 기술 중 하나인 서버 컴포넌트는 리액트 18에 도입된 기술로, Next.js에서는 서버 컴포넌트라고 부릅니다.
서버 컴포넌트는 **데이터 페칭, 보안, 캐싱**에 대한 성능상 이점이 있습니다. 또한, **JavaScript 번들 크기가 감소한다**는 장점도 있습니다.
그러나 **Hook과 EventListener를 사용할 수 없다**는 단점도 존재합니다. 이것을 사용하고 싶다면 클라이언트 컴포넌트를 사용해야 합니다.
그렇다면 클라이언트 컴포넌트 위주로 사용하면 되는가 싶을 수 있습니다.

Next.js 공식문서에서는 클라이언트 컴포넌트에서 사용되는 `use client`를 최대한 마지막에 사용하길 권하고 있습니다.
이게 무슨 의미냐면, 아래와 같은 구조로 디렉터리가 구성되어 있을 때 가장 마지막에 있는 Leaf 부분의 컴포넌트에 `use client`를 사용하라는 것입니다.

<img width="449" alt="image" src="https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Fterminology-component-tree.png&w=3840&q=75&dpl=dpl_C4eFQ3UMNdmnjK2STReJ5KTwdjDo">

## 2.4. 라우팅 (Routing)

Next.js에서는 파일 시스템 기반의 라우팅을 지원하고 있기 때문에
**폴더의 이름을 따라서 URL Path를 정의할 수 있다**고 이해하면 됩니다.
예를 들어 다음과 같은 구조로 컴포넌트가 저장되어 있을 때, 각 폴더명은 URL Path에 사용됩니다.

<img width="449" alt="image" src="https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Froute-segments-to-path-segments.png&w=3840&q=75&dpl=dpl_C4eFQ3UMNdmnjK2STReJ5KTwdjDo">

이렇게 **경로의 이름으로 사용되는 폴더는 segment**라고 합니다.
dashboard 폴더는 dashboard segment가 되고, app 폴더는 root segment라고 부릅니다.

Next.js에서는 다음과 같이 특수한 상황에 동작하는 파일이 있습니다.
- `layout.js`
- `template.js`
- `error.js` (React error boundary)
- `loading.js` (React suspense boundary)
- `not-found.js` (React error boundary)
- `page.js` or nested `layout.js`

이렇게 특수한 파일명을 다음 그림의 좌측과 같이 구성하면, 실제로는 우측과 같은 hierarchy 구조로 코드를 생성합니다.

<img width="449" alt="image" src="https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Fnested-file-conventions-component-hierarchy.png&w=3840&q=75&dpl=dpl_C4eFQ3UMNdmnjK2STReJ5KTwdjDo">

뿐만 아니라 **동적으로 변할 수 있는 URL Path**를 지원하며, 이를 `Dynamic Routes`라고 부릅니다.
예를 들어 `app/blog/[id]/page.tsx`과 같은 형식으로 app 아래 blog segment가 있고 그 안에 `[id] segment`가 존재한다면,
이 `[id] segment`를 `Dynamic Routes`라고 부릅니다.

`app/blog/[id]/page.tsx`가 다음과 같은 형태로 구성되어 있다면, id가 변경됨에 따라 UI를 새로 그려줍니다.
또한 URL도 id에 영향을 받습니다. 만약 id가 20이면, 실제 URL은 `http://ex.com/blog/20` 이 되는 것입니다.

```typescript jsx
export default function Page({ parmas }: { params: { id: String } }) {
    return <div>My Post: {params.id}</div>
}
```

## 2.5. 페이지 간 이동

Next.js에서 지원하는 페이지 간 이동에 대해 알아보겠습니다.

### 2.5.1. Link 컴포넌트 사용

Link 컴포넌트는 HTML a 태그 확장형이라고 보면 되고, 다음과 같이 a 태그를 쓰듯이 사용할 수 있습니다.

```typescript jsx
import Link from 'next/link'
 
export default function Page() {
  return <Link href="/dashboard">Dashboard</Link>
}
```

### 2.5.2. useRouter 사용하기

이벤트로 인한 이동 시에는 `useRouter`를 사용하면 되며, **클라이언트 컴포넌트로 선언**해야 합니다.
Next.js 공식 문서에서는 특별한 이벤트가 겂을 때는 `Link` 사용을 권장합니다.

```typescript jsx
'use client'
 
import { useRouter } from 'next/navigation'
 
export default function Page() {
  const router = useRouter()
 
  return (
    <button type="button" onClick={() => router.push('/dashboard')}>
      Dashboard
    </button>
  )
}
```

## 2.6. 데이터 페칭(Data Fetching)

Next.js에서는 Web API에서 제공되는 fetch API의 확장된 버전을 제공합니다.
Next.js에서의 `fetch`는 각각의 페치 요청에 대한 캐싱(Caching)과 재검증(Revalidating) 동작을 설정할 수 있습니다.

### 2.6.1. fetch

어떻게 사용하는지 컴포넌트르 기준으로 살펴보겠습니다.
아래 코드를 보면 `getData` 함수에서 fetch API를 통해 데이터를 호출하여 반환하는 것을 확인할 수 있습니다.
이 getData는 Page라는 이름의 서버 컴포넌트에서 호출해 사용합니다.

```typescript jsx
async function getData() {
  const res = await fetch('https://api.example.com/...')
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }
 
  return res.json()
}
 
export default async function Page() {
  const data = await getData()
 
  return <main></main>
}
```

### 2.6.2. 데이터 캐싱

데이터 캐싱은 다음과 같은 형식으로 작성하여 사용합니다.

```typescript jsx
// 'force-cache' is the default, and can be omitted
fetch('https://...', { cache: 'force-cache' })
```

기본적으로 Next.js는 성능을 향상하고 비용을 줄이기 위해 가능한 많은 캐싱을 합니다.
아래 다이어그램은 기본 캐싱 동작으로, 빌드 시 경로가 정적으로 렌더링될 때와 정적 경로를 처음 방문했을 때에 대해 보여줍니다.

<img width="600" alt="image" src="https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Fcaching-overview.png&w=3840&q=75&dpl=dpl_C4eFQ3UMNdmnjK2STReJ5KTwdjDo">

캐싱 동작은 경로가 정적 또는 동적으로 렌더링되는지, 데이터가 캐시되는지 아닌지, 요청이 초기 방문인지 후속 탐색으 일부인지에 따라 달라집니다.

### 2.6.3. 데이터 재검증

데이터를 재검증 하는 방법은 다음과 같이 두 가지입니다.

1. 시간 기반 재검증 : 특정 시간까지만 캐시를 살려두는 전략
2. 온디맨드 재검증 : 수요가 있을 때만 검증

각각 사용하는 방법에 대해 알아보겠습니다.

먼저 **시간 기반 재검증**은 다음과 같이 Fetch 함수에 URL을 던져주고, 뒤에 `next`라는 옵션 객체를 만들어 revalidate로 제한 시간을 보냅니다.

```typescript jsx
// Revalidate at most every hour
fetch('https://...', { next: { revalidate: 3600 } })
```

시간 기반 재검증은 다음과 같은 방식으로 동작합니다.

<img width="600" alt="image" src="https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Ftime-based-revalidation.png&w=3840&q=75&dpl=dpl_C4eFQ3UMNdmnjK2STReJ5KTwdjDo">

1. 최초 호출에 대한 데이터를 가져오며, 해당 데이터를 캐싱
2. 제한된 시간 내에 호출 시, 이미 저장되어 있던 캐시 데이터를 그대로 반환
3. 제한된 시간 이후 호출 시, 시간이 지났음을 확인하지만 기존의 캐시 데이터를 그대로 반환. 그 다음 캐시 데이터를 최신 데이터로 변경

그 다음으로 **온디맨드 재검증**에 대해 알아보겠습니다.
온디맨드 재검증은 path 기반 검증과 tag 기반 검증이 있습니다.
이 중 tag 기반 검증만 살펴보도록 하겠습니다.
tag 기반 검증은 다음과 같이 `next` 객체 내에 tag 값을 넘겨줍니다. 이를 통해 캐시에 대한 태그 값을 지정할 수 있습니다.

```typescript jsx
// Cache data with a tag
fetch(`https://...`, { next: { tags: ['collection'] } })
```

태그로 지정된 캐시 데이터를 최신 데이터로 변경하기 위해서는 캐시 정리도 필요합니다.
캐시를 정리하기 위해서는 다음과 같이 `revalidateTag`를 호출하면 됩니다.

```typescript jsx
// Revalidate entries with a specific tag
revalidateTag('collection')
```

## 2.7. 메타데이터 (Metadata)

메타데이터는 **페이지를 설명하는 데이터**이며, Next.js에서는 정적 또는 동적으로 메타 데이터를 정의합니다.

### 2.7.1. 정적 메타데이터

정적 메타데이터를 정의하려면 다음과 같이 `metadata`라는 객체를 만들고 `Metadata` 타입으로 지정하여 정보를 저장합니다.

```typescript jsx
import type { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: '...',
  description: '...',
}
 
export default function Page() {}
```

### 2.7.2. 동적 메타데이터

동적 메타데이터는 `generageMetadata` 라는 함수를 통해 메타데이터를 정의할 수 있습니다.
다음 코드와 같이 fetch api를 통해 호출한 데이터를 이용해 메타데이터를 동적으로 구성합니다.

```typescript jsx
import type { Metadata, ResolvingMetadata } from 'next'
 
type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}
 
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id
 
  // fetch data
  const product = await fetch(`https://.../${id}`).then((res) => res.json())
 
  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || []
 
  return {
    title: product.title,
    openGraph: {
      images: ['/some-specific-page-image.jpg', ...previousImages],
    },
  }
}
 
export default function Page({ params, searchParams }: Props) {}
```


> 본 게시글은 [손에 익는 Next.js - 공식 문서 훑어보기](https://www.inflearn.com/course/%EC%86%90%EC%97%90-%EC%9D%B5%EB%8A%94-nextjs-part1#) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.

**추가로 참고한 내용**

- <https://nextjs.org/docs/app/building-your-application/routing>
- <https://nextjs.org/docs/app/api-reference/components/link>
- <https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating>
- <https://nextjs.org/docs/app/building-your-application/caching>
