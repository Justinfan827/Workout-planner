import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { type Metadata } from 'next'

import { Separator } from '@/components/ui/separator'
import { SearchFunction } from './search'

import ExerciseEditor from '@/components/ExerciseEditor'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
}

type ErrorParams = {
  error: string
  error_code: string
  error_description: string
}

export default async function RootPage({
  searchParams,
}: {
  searchParams?: ErrorParams
}) {
  return (
    <div className="m-4">
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <ResizablePanelGroup
          direction="horizontal"
          className=" rounded-lg border"
        >
          <ResizablePanel defaultSize={30}>
            <div className="flex h-[400px] items-start justify-center p-6">
              <SearchFunction />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={70}>
            <ResizablePanel defaultSize={25}>
              <div className="h-full p-6">
                <Separator />
                <ExerciseEditor />
              </div>
            </ResizablePanel>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
