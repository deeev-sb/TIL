# 03. Next.js 손에 익히기

날씨 앱을 만들어보면서 Next.js를 손에 익혀보는 실습을 진행해보도록 하겠습니다.
강의에서는 `node v18.17.0`을 사용하였으나, 여기서는 `node v19.4.0`을 사용하려고 합니다.

## 3.1. 프로젝트 생성

먼저 `npx`를 이용해서 프로젝트를 생성하도록 하겠습니다. 프로젝트 이름은 `weather-app`이라고 설정하였습니다.

```bash
npx create-next-app weather-app
```

위 명령어를 실행하면 몇 가지 질문을 하는데, 다음과 같이 응답하시면 됩니다.

<img width="633" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/c9d1bddc-f6da-47c8-99be-c19fa0bbc85d">

이렇게 설정하면 프로젝트에 필요한 기본적인 패키지를 일괄 설치해줍니다.

`weather-app`으로 이동하여 `package.json`을 열어보면 프로젝트를 어떻게 실행시켜야 하는지 알 수 있습니다.

```json
{
  "name": "weather-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  // ....
}
```

`npm`을 사용하고 있으므로, `npm run dev`라고 명령어를 입력하여 실행해봅시다.
그 다음 `http://localhost:3000` 으로 접속하면 다음과 같은 Next.js에서 미리 만들어 둔 페이지가 화면에 표출됩니다.

<img width="624" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/d0c275dd-db4c-4208-b1a4-c5fb611aeecc">

프로젝트 코드를 살펴보면 `app` 디렉터리 내에 이미 파일이 생성되어 있는 것을 확인할 수 있습니다.
해당 내용을 변경하며 날씨 앱을 만들어보도록 하겠습니다.

<img width="190" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/e52d0907-aa4a-44c3-bee2-8f6aeaa75ed5">

## 3.2 페이지 구성하기

먼저 사용하지 않을 파일을 지워줍니다.

<img width="152" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/070e36c6-4234-4ee6-b89f-8e8c5b799afe">

그 다음 `page.tsx` 내용을 아래와 같이 수정합니다.

```typescript jsx
export default function Home() {
    return (
        <>
            <h1>Home</h1>
            <ul>
                <li>서울</li>
                <li>뉴욕</li>
                <li>런던</li>
            </ul>
        </>
    );
}
```

`<li></li>` 내용을 클릭하면 상세 페이지로 넘어갈 수 있게 구성을 해보도록 하겠습니다.
이 때, 하나의 페이지 내에서 선택한 지역에 따라 다르게 표시할 수 있도록 `Dynamic Routes`를 활용하려고 합니다.

`app` 디렉터리 내에 `[location]` 이라는 이름으로 디렉터리를 생성합니다. 그리고 `page.tsx`를 다음과 같이 구성해줍니다.

```typescript jsx
type Props = {
  params: {
    location: string
  }
}

export default function Detail({params}: Props) {
  let name = ''
  switch (params.location){
    case 'seoul': name = '서울'; break;
    case 'new-york': name = '뉴욕'; break;
    case 'london': name = '런던'; break;
  }
  return (
    <>
      <h1>{name}의 3일 예보</h1>
    </>
  );
}
```

그러면 어떻게 접속하는지에 따라 페이지의 내용이 바뀌게 됩니다.

|                                              http://localhost:3000/seoul 접속                                              |                                             http://localhsot:3000/new-york 접속                                             |
|:------------------------------------------------------------------------------------------------------------------------:|:------------------------------------------------------------------------------------------------------------------------:|
| <img width="324" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/16167c62-753b-4129-ab5b-df7d0fbd171c"> | <img width="324" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/e1e33ca6-39ce-4e6c-b81a-ed7dc1801cc1"> |

## 3.3. 페이지 이동하기

단순 페이지 이동이므로 `Link` 태그를 사용하여 이동을 할 수 있게 구성하도록 하겠습니다.
`Link` 태그는 `a` 태그와 같은 형식으로 사용하면 됩니다.

```typescript jsx
import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <ul>
        <li><Link href="/seoul">서울</Link></li>
        <li><Link href="/new-york">뉴욕</Link></li>
        <li><Link href="/london">런던</Link></li>
      </ul>
    </>
  );
}
```

그리고 상세 페이지에서는 홈으로 이동할 때는 버튼을 사용하도록 구성하겠습니다.
이벤트를 통한 이동은 `useRouter`를 사용해 구현하면 됩니다.
`useRouter`를 사용할 때는, `use client`를 사용해 클라이언트 컴포넌트 선언을 해야 정상 동작합니다.
뿐만 아니라, `useRouter`는 `next/navigation`에서 import 받아 사용해야 합니다.

```typescript jsx
'use client'

import {useRouter} from "next/navigation";

type Props = {
  params: {
    location: string
  }
}

export default function Detail({params}: Props) {
  let name = ''

  const router = useRouter();
  const handleClick = () => {
    router.push('/')
  }

  // ...
  return (
    <>
      <h1>{name}의 3일 예보</h1>
      <button onClick={handleClick}>Home</button>
    </>
  );
}
```

그런데 이렇게 만들면 상세 페이지가 클라이언트 컴포넌트가 됩니다. Next.js 공식문서에서는 클라이언트 컴포넌트가 트리의 끝(`leaf`)에 위치해야 한다고 되어 있습니다.

<img width="449" alt="image" src="https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Fterminology-component-tree.png&w=3840&q=75&dpl=dpl_C4eFQ3UMNdmnjK2STReJ5KTwdjDo">

그러므로 Button 기능을 분리하고, 상세 페이지 자체는 서버 컴포넌트가 되도록 리팩토링을 해보겠습니다.
이 때, 경로로 인식되지 않도록 하기 위해 `app` 디렉터리 밖에 생성해야 합니다.

<img width="193" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/80fd78f8-73dd-4533-b85d-bffcaf01eee5">

기존의 버튼 기능을 분리해줍니다.

```typescript jsx
'use client'

import {useRouter} from "next/navigation";

export default function HomeButton() {
    const router = useRouter();
    const handleClick = () => {
        router.push('/')
    }

    return <button onClick={handleClick}>Home</button>
}
```

그리고 상세 페이지에서는 버튼과 관련된 내용을 모두 삭제하고, `HomeButton` 컴포넌트를 받아와 수행하도록 변경합니다.

```typescript jsx
import HomeButton from "@/component/HomeButton";

// ...

export default function Detail({params}: Props) {
    // ...
    return (
        <>
            <h1>{name}의 3일 예보</h1>
            <HomeButton/>
        </>
    );
}
```

## 3.4. 스타일 적용하기

`app` 디렉터리 내에 `style.module.css`를 생성합니다. 그 다음 아래와 같이 입력을 해줍니다.

```css
.list {
  list-style: none;
  padding: 0;
}
```

해당 내용을 메인 페이지에 적용해보도록 하겠습니다. css를 적용할 때는 `className`으로 지정하면 됩니다.

```typescript jsx
import Link from "next/link";
import style from './style.module.css'

export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <ul className={style.list}>
        <li><Link href="/seoul">서울</Link></li>
        <li><Link href="/new-york">뉴욕</Link></li>
        <li><Link href="/london">런던</Link></li>
      </ul>
    </>
  );
}
```

그러면 페이지의 리스트의 스타일이 변경되는 것을 확인할 수 있습니다.

|                                                          AS-IS                                                           |                                                          TO-BE                                                           |
|:------------------------------------------------------------------------------------------------------------------------:|:------------------------------------------------------------------------------------------------------------------------:|
| <img width="201" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/59cb7929-39e8-46f9-862c-ba182a177500"> | <img width="206" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/efc065a8-ea43-4e17-a407-18b1b4916439"> |

이렇게 적용하는 것은 해당 페이지 내에만 적용되는 지역 스타일입니다. 이번에는 전역 스타일로 생성해보도록 하겠습니다.

`app` 디렉터리 내에 `global.css`라는 이름으로 파일을 생성하고 아래와 같이 작성합니다.

```css
button {
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    background-color: cornflowerblue;
}
```

전역으로 적용하기 위해 `layout.tsx` 내에 아래와 같이 import 해줍니다.

```typescript jsx
import './global.css';
```

그러면 상세 페이지의 버튼 스타일이 변경되는 것을 확인할 수 있습니다.

|                                                          AS-IS                                                           |                                                          TO-BE                                                           |
|:------------------------------------------------------------------------------------------------------------------------:|:------------------------------------------------------------------------------------------------------------------------:|
| <img width="233" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/913ee5a5-c70d-43c9-8899-3fbbd2d43d40"> | <img width="229" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/27185f08-0e01-4545-a0d3-c4f3fabe365e"> |

## 3.5. fetch 사용하기

<https://www.weatherapi.com/>에서 제공되는 API를 사용해서 fetch를 사용해보도록 하겠습니다.
<https://www.weatherapi.com/> 설정 관련 내용은 강의를 참고해주세요.

`fetch`는 Javascript 내장 API로 비동기 통신 네트워크를 가능하게 하는 기술입니다.
비동기 호출은 콜백 함수를 포함하는데, 콜백 함수 대신 동기적인 코드처럼 사용할 수 있게 해주는 것이 `async/await` 입니다.
이 두 가지를 사용해서 날씨 API를 사용하면 다음과 같은 형식으로 구성할 수 있습니다.

`src` 디렉터리 바로 아래 `utils` 디렉터리를 생성하고 `getCurrent.tsx`를 만들어 아래 내용을 입력해줍니다.

```typescript jsx
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

export const getCurrentWeather = async (location: string) => {
  const res = await fetch(`http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&aqi=no`)

  return res.json();
}
```

그 다음 `getCurrentWeather` 함수 기능을 메인 페이지에서 불러와 사용할 수 있도록 코드를 수정해줍시다.

```typescript jsx
// ...
import {getCurrentWeather} from "@/utils/getCurrentWeather";

export default async function Home() {
    const res = await getCurrentWeather(`seoul`)

    return (
        <>
            <h1>Home</h1>
            <ul className={style.list}>
                <li><Link href="/seoul">서울</Link></li>
                <span>{res.current.condition.text}</span>
                <li><Link href="/new-york">뉴욕</Link></li>
                <li><Link href="/london">런던</Link></li>
            </ul>
        </>
    );
}
```

이대로 작성하면 타입을 추론하기 어려우므로 타입을 선언해주도록 하겠습니다.
타입은 Weather API 응답 결과를 https://transform.tools/json-to-typescript 사이트에서 변환하여 그대로 복사/붙여넣기 하면 됩니다.
내용이 너무 많으므로 일부 생략하도록 하겠습니다.

선언한 타입을 적용하려면 `asyncy ()` 뒤에 `: Promise<Response>`를 추가해야 합니다.

```typescript jsx
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

interface Response {
    location: Location
    current: Current
}

// ...

export const getCurrentWeather = async (location: string): Promise<Response> => {
    const res = await fetch(`http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&aqi=no`)

    return res.json();
}
```

이와 유사한 형식으로 `Forecast`를 호출하는 함수인 `getForecast.tsx`로 구성합니다.
이 때, 3일 간의 데이터를 불러올 수 있도록 설정합니다. 해당 내용은 여기서는 생략하도록 하겠습니다. 강의를 참고해주세요.

`getForecast`는 다음과 같이 상세 페이지에서 호출하여 사용합니다. 

```typescript jsx
import {getForecast} from "@/utils/getForecast";
// ...

export default async function Detail({params}: Props) {
  let name = ''

  const res = await getForecast(params.location);

  // ...
  return (
    <>
      <h1>{name}의 3일 예보</h1>
        <HomeButton/>
        <ul>
          {res.forecast.forecastday.map(day => (
            <li key={day.date}>
              {day.date} / {day.day.avgtemp_c}
          </li>
            )
        )}
      </ul>
    </>
  );
}
```

## 3.6. fetch 캐시 해제하기

Next.js에서는 fetch의 결과 값을 자동으로 캐싱합니다. 실제로 캐시된 데이터를 불러오는지 확인해보도록 하겠습니다.
그 전에 날씨 데이터가 30분마다 갱신되므로 Time API를 사용해 시간을 출력하는 코드를 추가해야 합니다. component 디렉터리에 추가해주세요.

```typescript jsx
export const getTime = async (zone: string): Promise<Response> => {
  const res = await fetch(`http://timeapi.io/api/Time/current/zone?timeZone=${zone}`)

  if (!res.ok) throw new Error('시간 정보를 가져올 수 없습니다.')

  return res.json();
}
```

시간 데이터를 화면에서 표출할 수 있게 아래 코드도 추가해줍니다.

```typescript jsx
// ...
import {getTime} from "@/utils/getTime";

export default async function Home() {
  const res = await getCurrentWeather(`seoul`)
  const time = await getTime(res.location.tz_id)

  return (
    <>
      <h1>Home</h1>
      <p>{time.dateTime}</p>
      {/* ... */}
    </>
  );
}
```

실제로 화면에 띄운 다음, 재실행해보면 시간이 그대로 고정되어 있는 것을 확인할 수 있습니다.

<img width="264" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/3f02d840-fa32-4ffa-8bfb-455f55ab9cad">

이제 캐시를 비우는 기능을 구현해보도록 하겠습니다.
먼저 `app > api > revalidate > route.tsx`에 다음과 같은 GET API를 생성합니다.

```typescript jsx
import {NextRequest, NextResponse} from "next/server";
import {revalidateTag} from "next/cache";

export async function GET(req: NextRequest) {
  const tag = req.nextUrl.searchParams.get('tag')
  if (!tag) throw new Error('태그는 필수입니다.')

  revalidateTag(tag)
  return NextResponse.json({ message: '재검증에 성공하였습니다', tag})
}
```

그 다음 해당 API를 불러서 사용하는 Button Component를 생성합니다.

```typescript jsx
'use client'

type Props = {
  tag: string
}

export default function RevalidateButton({tag}: Props) {

  const handleClick = async () => {
    const res = await fetch('/api/revalidate?tag=' + tag)
    console.log(res)
  }

  return <button onClick={handleClick}>캐시 비우기</button>
}
```

`getTime` 함수에서도 tag를 사용하도록 코드를 수정합니다.

```typescript jsx
const res = await fetch(`http://timeapi.io/api/Time/current/zone?timeZone=${zone}`,
    {next: {tags: ['time']}})
```

마지막으로 해당 버튼을 화면에 추가합니다.

```typescript jsx
//...
export default async function Home() {
  const res = await getCurrentWeather(`seoul`)
  const time = await getTime(res.location.tz_id)

  return (
    <>
      <h1>Home</h1>
      <p>{time.dateTime}</p>
      <RevalidateButton tag={'time'}/>
    {/* ... */}
    </>
  );
}
```

캐시 비우기 버튼을 클릭한 다음 새로고침하면, 시간이 변경되는 것을 직접 확인할 수 있습니다.

<img width="286" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/cc9fab6c-7ba8-44c1-80e7-4ddd4348ed2a">


## 3.7. error, loading 페이지 생성

이번에는 error 처리를 해보도록 하겠습니다.
다음과 같이 `API_KEY`에 `00`이라는 문자를 추가하고, `res.ok`가 아닌 경우 즉 정상 응답이 아닌 경우 에러를 반환하도록 처리하였습니다.

```typescript jsx
const API_KEY = process.env.NEXT_PUBLIC_API_KEY + '00'
// ...
export const getCurrentWeather = async (location: string): Promise<Response> => {
  const res = await fetch(`http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&aqi=no`)

  if (!res.ok) {
    throw new Error('날씨 정보를 가져올 수 없습니다')
  }

  return res.json();
}
```

이렇게 하면 아래와 같은 형식으로 에러를 표출하는 것을 확인할 수 있습니다.

<img width="548" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/7c995064-77de-4aa4-8eb9-b618c4a4b1a6">

내부 소스가 웹 페이지에 그대로 노출되므로, `error` 발생 시 표출되는 페이지를 따로 생성하도록 하겠습니다.

`app` 디렉터리 아래 `error.tsx`를 생성하고 다음과 같이 에러에 대해 간단하게 보여주는 페이지를 구성합니다.
이 error 파일은 Next.js에서 제공되는 특수한 파일이며, 에러 발생 시 연결되도록 자동 설정되어 있습니다. 

```typescript jsx
'use client'

import {useEffect} from "react";

type Props = {
  error: Error;
  reset: () => void
}
export default function Error({error, reset}: Props) {
  useEffect(() => {
    console.error('-------', error.message)
  }, [])
  return <>
    <h1>에러 페이지</h1>
    <p>{error.message}</p>
    <button onClick={() => reset()}>
      새로고침
    </button>
  </>
}
```

코드를 수정한 다음 웹 페이지를 확인해보면, 더 이상 내부 코드가 아닌 아래와 같은 페이지를 보여주게 됩니다.

<img width="251" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/7e110f4f-28b2-4b94-98e1-7302776bdfb3">

`error` 뿐만 아니라 `loading`도 기본적으로 제공해줍니다. `loading`도 `error`와 동일한 위치에 생성해주면 됩니다.
그러면 로딩 중일 때는 화면에 `로딩 중`이라는 문구가 표시됩니다.

```typescript jsx
export default function Loading() {
  return <>로딩 중</>
}
```

`error`와 `loading` 파일과 같은 특수 파일은 `app` 바로 아래 생성하였으므로, **`root segment` 하위 모든 세그먼트에 적용**됩니다.
만약 하위 세그먼트에 따로 `error`나 `loading`과 같은 특수 파일을 생성한다면, 그 파일이 적용됩니다.

먼저 상세 페이지에서 에러가 발생하도록 다음과 같은 error 처리 코드를 추가합니다.

```typescript jsx
export const getForecast = async (location: string): Promise<Response> => {
  const res = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=3&aqi=no&alerts=no`)
    
   // 추가한 코드
  if (!res.ok) throw new Error('3일 예보 정보를 가져올 수 없습니다.')

  return res.json();
}
```

그리고 일부러 API_KEY를 다르게 보내면 다음과 같이 `app` 디렉터리 내에 있는 에러 페이지 형식을 그대로 사용하는 것을 확인할 수 있습니다.

<img width="264" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/a5922278-1168-41e0-a58a-2f0a72907835">

해당 페이지에서는 에러가 발생하면 메인 페이지로 돌아갈 수 있게 에러 페이지를 새로 구성해보려고 합니다.
`[location]` 디렉터리 내에 `error.tsx`라는 이름의 파일을 아래 내용으로 생성합니다.

```typescript jsx
'use client'

import {useEffect} from "react";
import HomeButton from "@/component/HomeButton";

type Props = {
  error: Error;
  reset: () => void
}
export default function Error({error, reset}: Props) {
  useEffect(() => {
    console.error('-------', error.message)
  }, [])
  return <>
    <h1>에러 페이지</h1>
    <p>{error.message}</p>
    <HomeButton/>
  </>
}
```

그러면 다음과 같이 화면에 새로고침 버튼이 아닌 Home 버튼이 표시되는 것을 확인할 수 있습니다.

<img width="280" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/fafc98d6-0f4f-45f7-aca8-6490504818df">

이를 통해 하위 세그먼트 내에 `error` 페이지와 같은 특수 페이지를 생성하는 경우에만 적용됨을 알 수 있습니다.

## 3.8. 메타 데이터

개발자 모드로 현재 웹에 설정되어 있는 메타데이터 정보를 보면,`title`은 `Create Next App`이라고 되어 있고
`description`은 `Generated by create next app`이라고 되어있는 것을 확인할 수 있습니다.

<img width="751" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/4f065fdc-398e-49e1-aecc-bfba7480e964">

이 정보는 `app` 디렉터리의 `layout.tsx`에 입력되어 있는 내용입니다.
layout에 있는 메타데이터 정보를 다음과 같이 수정해봅시다.

```typescript jsx
export const metadata: Metadata = {
  title: "Weather App",
  description: "날씨를 알려드립니다.",
};
```

그러면 메타데이터가 변경되는 것을 확인할 수 있습니다.

<img width="750" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/691bcc96-8cc2-4083-9f5b-e1ee3b57cd34">

이렇게 작성된 메타데이터는 **정적 메타데이터**입니다. 단순히 입력된 내용을 그대로 반환하는 것입니다.

그렇다면 **동적 메타데이터**는 어떻게 작성할까요? 동적메타데이터 `generateMetadata`를 사용하면 됩니다.
상세 페이지 내에 동적 메타데이터 생성 함수를 추가해봅시다.

```typescript jsx
export function generateMetadata({params}: Props) {
  return {
    title: `Weather App - ${params.location}`,
    description: `${params.location} 날씨를 알려드립니다.`
  }
}
```

그 다음 페이지에 접속하면, 페이지마다 다른 메타데이터를 가지는 것을 확인할 수 있습니다.

<img width="748" alt="image" src="https://github.com/deeev-sb/TIL/assets/46712693/00c02deb-bcd3-4ce1-9ddd-dee9d1375340">


> 본 게시글은 [손에 익는 Next.js - 공식 문서 훑어보기](https://www.inflearn.com/course/%EC%86%90%EC%97%90-%EC%9D%B5%EB%8A%94-nextjs-part1#) 강의를 참고하여 작성되었습니다.
>
> 상세한 내용이 궁금하시다면 강의 수강을 추천해 드립니다.

**추가로 참고한 내용**

- <https://nextjs.org/docs/app/building-your-application/routing>
- <https://www.weatherapi.com/>
- <https://transform.tools/json-to-typescript>
- <https://babycoder05.tistory.com/entry/Promise-Fetch-Async-Await-%EC%97%90-%EB%8C%80%ED%95%B4-%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90>
- <https://rocketengine.tistory.com/entry/NextJS-13-Routing-Error-Handling%EC%97%90%EB%9F%AC%EC%B2%98%EB%A6%AC>
- <https://timeapi.io/swagger/index.html>

