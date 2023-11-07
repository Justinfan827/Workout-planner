import { isDev } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  if (isDev()) {
    return NextResponse.json({
      git_sha: 'dev',
    })
  }
  return NextResponse.json({
    git_sha: process.env.VERCEL_GIT_COMMIT_SHA,
  })
}
