import { Check, Dumbbell } from 'lucide-react'

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import { useState } from 'react'

export function Search({ selectedResult, onSelectResult }) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSelectResult = (res: string) => {
    onSelectResult(res)
    setSearchQuery('')
  }
  return (
    <Command
      shouldFilter={false}
      className="h-auto rounded-lg border border-b-0 shadow-md"
    >
      <CommandInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        placeholder="Search for an exercise"
      />

      <SearchResults
        query={searchQuery}
        selectedResult={selectedResult}
        onSelectResult={handleSelectResult}
      />
    </Command>
  )
}

interface SearchProps {
  selectedResult?: string
  onSelectResult: (product: string) => void
}
interface SearchResultsProps {
  query: string
  selectedResult: SearchProps['selectedResult']
  onSelectResult: SearchProps['onSelectResult']
}
function SearchResults({
  query,
  selectedResult,
  onSelectResult,
}: SearchResultsProps) {
  const debouncedSearchQuery = useDebounce(query, 500)

  const enabled = !!debouncedSearchQuery

  const {
    data,
    isLoading: isLoadingOrig,
    isError,
  } = useQuery<SearchResponse>({
    queryKey: ['search', debouncedSearchQuery],
    queryFn: () => fetchExercisesByName(debouncedSearchQuery),
    enabled,
  })

  // To get around this https://github.com/TanStack/query/issues/3584
  const isLoading = enabled && isLoadingOrig

  if (!enabled) return null

  return (
    <CommandList>
      {/* TODO: these should have proper loading aria */}
      {isLoading && <div className="p-4 text-sm">Searching...</div>}
      {!isError && !isLoading && !data?.data.length && (
        <div className="p-4 text-sm">No products found</div>
      )}
      {isError && <div className="p-4 text-sm">Something went wrong</div>}

      {data?.data.map(({ name, ...rest }) => {
        console.log(data.data)
        return (
          <CommandItem
            key={name}
            onSelect={() => onSelectResult(name)}
            value={name}
          >
            {selectedResult?.toLowerCase() === name?.toLowerCase() ? (
              <Check className={'mr-2 h-4 w-4'} />
            ) : (
              <Dumbbell className={'mr-2 h-4 w-4'} />
            )}
            {name}
          </CommandItem>
        )
      })}
    </CommandList>
  )
}

interface SearchResponse {
  data: Exercise[]
}

interface Exercise {
  name: string
  category: string
  equipment: string
}

async function fetchExercisesByName(
  debouncedSearchTerm: string
): Promise<SearchResponse> {
  const res = await fetch(
    `http://localhost:3000/api/workout?q=${debouncedSearchTerm}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  const data = await res.json()
  console.log('returning data', data)
  return data
}
