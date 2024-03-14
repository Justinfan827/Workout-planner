'use client'

import { Button } from '@/components/ui/button'

type ErrorParams = {
  error: string
  error_code: string
  error_description: string
}

const nameList = ['Justin', 'Vinson', 'Wincy', 'Jenny', 'Jasmine', 'Jasper']

export default function SignInPage({
  searchParams,
}: {
  searchParams?: ErrorParams
}) {
  const onClickHandler = () => {
    alert('Hello wincy')
    console.log('\n\n\n')
    console.log('HELLO SIR')
    console.log('\n\n\n')
  }

  const handleOnClick = (name) => {
    alert(`Hello ${name}`)
  }

  return (
    <div className="m-4 bg-red-900 outline outline-yellow-300">
      <div className="mx-auto max-w-[500px] space-y-4 text-center">
        <h1 className="text-xl">Hello wincy to the frontend template!</h1>
        <p className="text-lg">
          This is a template for building frontend apps with Next.js,
          TailwindCSS, ShadCN UI components, and Supabase for auth
        </p>
        <Button variant="ghost" onClick={() => onClickHandler()}>
          {' '}
          This is a button
        </Button>

        <div className="flex justify-center gap-10 p-10">
          {nameList.map((name) => {
            return (
              <div key={name}>
                <div className="rounded-md bg-yellow-200 p-10 font-extrabold text-slate-900">
                  {name}
                  <Button onClick={() => handleOnClick(name)}>Click me</Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
