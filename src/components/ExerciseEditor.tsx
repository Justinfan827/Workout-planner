'use client'

import { Icons } from '@/components/Icons'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  details: z.array(
    z.object({
      id: z.string(),
      weight: z.number(),
      reps: z.number(),
      rest: z.number(),
    })
  ),
  note: z.string(),
})

const workoutFormSchema = z.object({
  workoutName: z.string(),
  exercises: z.array(exerciseSchema),
})

export default function WorkoutEditor() {
  const { toast } = useToast()
  // 1. Define your form.
  const form = useForm<z.infer<typeof workoutFormSchema>>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      workoutName: '',
      exercises: [],
    },
  })

  const [sets, setSets] = useState([
    {
      id: uuidv4(),
      weight: 0,
      reps: 0,
      rest: 0,
    },
  ])

  const {
    fields: exerciseFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'exercises',
  })

  const onSubmit = (data: z.infer<typeof workoutFormSchema>) => {
    // toast data
    toast({
      title: 'Form submitted',
      description: JSON.stringify(data, null, 2),
    })
  }

  const state = form.watch()
  return (
    <div className="m-4 mx-auto max-w-2xl ">
      <div className="mt-2 rounded-md bg-black py-4">
        <div className="no-scrollbar mx-auto max-h-[400px] max-w-[450px]  overflow-auto bg-black p-4 text-white">
          <pre className="text-left">{JSON.stringify(state, null, 2)}</pre>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="workoutName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Workout Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Workout Name"
                    className="text-xl font-semibold placeholder:font-thin"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* workout block */}
          {exerciseFields.map((exercise, exerciseIndex) => {
            return (
              <div
                key={exercise.id}
                className=" rounded-lg border-2 border-solid p-4 shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center justify-between space-x-3">
                    <FormField
                      control={form.control}
                      name={`exercises.${exerciseIndex}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">
                            Workout Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Exercise Name"
                              className="text-xl font-semibold placeholder:font-thin"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Icons.ellipsisVertical className="h-6 w-6 text-card-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          remove(exerciseIndex)
                        }}
                        className="text-red-500"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="overflow-x-auto">
                  <NestedSetInput
                    nestIndex={exerciseIndex}
                    control={form.control}
                    register={form.register}
                  />
                </div>
                <div className="mt-4">
                  <Textarea placeholder="Add a note for this exercise" />
                </div>
              </div>
            )
          })}
          {/* end workout block */}
          <div className="mt-6 flex space-x-4">
            <Button
              onClick={() => {
                append({ id: uuidv4(), name: '', details: [], note: '' })
              }}
              type="button"
              className="flex flex-grow items-center space-x-1 "
              variant="default"
            >
              <Icons.plus className="" />
              <span>Add Exercise</span>
            </Button>
            <Button
              type="button"
              className="flex flex-grow items-center space-x-1 "
              variant="secondary"
            >
              <Icons.plus className="" />
              <span>Add Section</span>
            </Button>
          </div>
          <Button type="submit">Create Workout</Button>
        </form>
      </Form>
    </div>
  )
}
function NestedSetInput({
  nestIndex,
  control,
  register,
}: {
  nestIndex: number
  control: any
  register: any
}) {
  const { fields, remove, append } = useFieldArray({
    control,
    name: `exercises[${nestIndex}].details`,
  })
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Set</TableHead>
            <TableHead>Weight (kg)</TableHead>
            <TableHead>Reps</TableHead>
            <TableHead>Rest</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, setIndex) => {
            return (
              <TableRow key={field.id}>
                <TableCell>{setIndex + 1}</TableCell>
                <TableCell>
                  <FormField
                    control={control}
                    name={`exercises[${nestIndex}].details[${setIndex}].weight`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Workout Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={control}
                    name={`exercises[${nestIndex}].details[${setIndex}].reps`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Workout Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={control}
                    name={`exercises[${nestIndex}].details[${setIndex}].rest`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Workout Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={() => remove(setIndex)} variant="ghost">
                    <Icons.xCircle className="text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="each-side" />
          <label className="text-sm font-medium" htmlFor="each-side">
            Each Side
          </label>
        </div>
        <Button
          type="button"
          onClick={() => {
            append({ id: uuidv4(), weight: 0, reps: 0, rest: 0 })
          }}
          className="space-x-2 "
          variant="ghost"
        >
          <Icons.plus className="h-6 w-6 " />
          <span>Add Set</span>
        </Button>
      </div>
    </div>
  )
}
