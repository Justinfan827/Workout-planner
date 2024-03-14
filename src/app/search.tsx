'use client'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@uidotdev/usehooks'
import { Dumbbell, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

export function SearchFunction() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 200)

  const handleChange = (searchString: string) => {
    setSearchTerm(searchString)
  }
  useEffect(() => {
    const searchExercises = async () => {
      setIsSearching(true)
      if (!debouncedSearchTerm) {
        setIsSearching(false)
        return
      }
      const res = await fetchExercises(debouncedSearchTerm)
      setResults(res?.data || [])
      setIsSearching(false)
    }

    searchExercises()
  }, [debouncedSearchTerm])
  return (
    <div className="">
      <div className="flex items-center px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <Input
          placeholder="Search exercises"
          value={searchTerm}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>

      <div className="p-2">
        {isSearching && <div>Searching...</div>}
        {results &&
          results.slice(0, 5).map((result) => {
            const key = result?.item?.name
            return (
              <div
                className="flex items-center p-2 hover:bg-slate-900"
                key={key}
              >
                <Dumbbell className="mr-2 h-4 w-4" />
                <span>{key}</span>
              </div>
            )
          })}
      </div>
    </div>
  )
}
async function fetchExercises(debouncedSearchTerm: string) {
  const res = await fetch(
    `http://localhost:3000/api/workout?q=${debouncedSearchTerm}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  const data = await res.json()
  return data
}
