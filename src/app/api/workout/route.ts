import Fuse from 'fuse.js'
import { NextRequest, NextResponse } from 'next/server'

const fuseOptions = {
  // isCaseSensitive: false,
  // includeScore: false,
  // shouldSort: true,
  // includeMatches: false,
  // findAllMatches: false,
  // minMatchCharLength: 1,
  // location: 0,
  // threshold: 0.6,
  // distance: 100,
  // useExtendedSearch: false,
  // ignoreLocation: false,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
  keys: ['name'],
}

const exercises = [
  { name: 'Bench Press', category: 'Upper Body', equipment: 'Barbell' },
  { name: 'Squat', category: 'Lower Body', equipment: 'Barbell' },
  { name: 'Deadlift', category: 'Full Body', equipment: 'Barbell' },
  { name: 'Pull-ups', category: 'Upper Body', equipment: 'Bodyweight' },
  { name: 'Push-ups', category: 'Upper Body', equipment: 'Bodyweight' },
  { name: 'Lunges', category: 'Lower Body', equipment: 'Dumbbells' },
  {
    name: 'Lat Pulldown',
    category: 'Upper Body',
    equipment: 'Cable Machine',
  },
  { name: 'Leg Press', category: 'Lower Body', equipment: 'Machine' },
  { name: 'Chest Fly', category: 'Upper Body', equipment: 'Dumbbells' },
  { name: 'Shoulder Press', category: 'Upper Body', equipment: 'Dumbbells' },
  { name: 'Plank', category: 'Core', equipment: 'Bodyweight' },
  { name: 'Russian Twists', category: 'Core', equipment: 'Medicine Ball' },
  { name: 'Tricep Dips', category: 'Upper Body', equipment: 'Parallel Bars' },
  { name: 'Hammer Curls', category: 'Arms', equipment: 'Dumbbells' },
  { name: 'Seated Row', category: 'Upper Body', equipment: 'Cable Machine' },
  { name: 'Leg Curls', category: 'Lower Body', equipment: 'Machine' },
  { name: 'Calf Raises', category: 'Lower Body', equipment: 'Machine' },
  { name: 'Ab Rollouts', category: 'Core', equipment: 'Ab Roller' },
  { name: 'Box Jumps', category: 'Full Body', equipment: 'Box' },
  { name: 'Barbell Curl', category: 'Arms', equipment: 'Barbell' },
  {
    name: 'Incline Bench Press',
    category: 'Upper Body',
    equipment: 'Barbell',
  },
  { name: 'Front Squat', category: 'Lower Body', equipment: 'Barbell' },
  { name: 'Romanian Deadlift', category: 'Lower Body', equipment: 'Barbell' },
  { name: 'Chin-ups', category: 'Upper Body', equipment: 'Bodyweight' },
  { name: 'Dumbbell Rows', category: 'Upper Body', equipment: 'Dumbbells' },
  { name: 'Tricep Kickbacks', category: 'Arms', equipment: 'Dumbbells' },
  { name: 'Side Plank', category: 'Core', equipment: 'Bodyweight' },
  { name: 'Hanging Leg Raises', category: 'Core', equipment: 'Hanging Bar' },
  { name: 'Lateral Raises', category: 'Upper Body', equipment: 'Dumbbells' },
  { name: 'Pec Deck Machine', category: 'Upper Body', equipment: 'Machine' },
  { name: 'Hack Squat', category: 'Lower Body', equipment: 'Machine' },
  { name: 'Tricep Pushdown', category: 'Arms', equipment: 'Cable Machine' },
  { name: 'Preacher Curl', category: 'Arms', equipment: 'Barbell' },
  { name: 'Reverse Lunges', category: 'Lower Body', equipment: 'Dumbbells' },
  {
    name: 'Plank with Shoulder Taps',
    category: 'Core',
    equipment: 'Bodyweight',
  },
  { name: 'Mountain Climbers', category: 'Core', equipment: 'Bodyweight' },
  {
    name: 'Single-Leg Romanian Deadlift',
    category: 'Lower Body',
    equipment: 'Dumbbell',
  },
  { name: 'Bent Over Rows', category: 'Upper Body', equipment: 'Barbell' },
  { name: 'Face Pulls', category: 'Upper Body', equipment: 'Cable Machine' },
  { name: 'Goblet Squat', category: 'Lower Body', equipment: 'Dumbbell' },
  { name: 'Dumbbell Press', category: 'Upper Body', equipment: 'Dumbbells' },
  { name: 'Hamstring Curl', category: 'Lower Body', equipment: 'Machine' },
  {
    name: 'Seated Shoulder Press',
    category: 'Upper Body',
    equipment: 'Machine',
  },
  { name: 'Reverse Flyes', category: 'Upper Body', equipment: 'Dumbbells' },
  {
    name: 'Medicine Ball Slams',
    category: 'Full Body',
    equipment: 'Medicine Ball',
  },
  {
    name: 'Decline Bench Press',
    category: 'Upper Body',
    equipment: 'Barbell',
  },
  { name: 'Step-Ups', category: 'Lower Body', equipment: 'Box' },
  { name: 'Cable Crunches', category: 'Core', equipment: 'Cable Machine' },
  { name: 'Cable Bicep Curl', category: 'Arms', equipment: 'Cable Machine' },
  { name: 'Reverse Crunches', category: 'Core', equipment: 'Bodyweight' },
  { name: 'Jump Rope', category: 'Cardio', equipment: 'Jump Rope' },
  { name: 'Burpees', category: 'Full Body', equipment: 'Bodyweight' },
  {
    name: 'Kettlebell Swings',
    category: 'Full Body',
    equipment: 'Kettlebell',
  },
  { name: 'Seated Leg Press', category: 'Lower Body', equipment: 'Machine' },
  { name: 'Dumbbell Lunges', category: 'Lower Body', equipment: 'Dumbbells' },
  { name: 'T-Bar Row', category: 'Upper Body', equipment: 'T-Bar Machine' },
  { name: 'Plank to Push-up', category: 'Core', equipment: 'Bodyweight' },
  { name: 'Woodchoppers', category: 'Core', equipment: 'Cable Machine' },
  {
    name: 'Standing Calf Raises',
    category: 'Lower Body',
    equipment: 'Machine',
  },
  {
    name: 'Bent Over Dumbbell Rows',
    category: 'Upper Body',
    equipment: 'Dumbbells',
  },
  { name: 'Leg Extensions', category: 'Lower Body', equipment: 'Machine' },
  { name: 'EZ Bar Curl', category: 'Arms', equipment: 'EZ Bar' },
  { name: 'Pullover', category: 'Upper Body', equipment: 'Dumbbell' },
]
const fuse = new Fuse(exercises, fuseOptions)
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const q = requestUrl.searchParams.get('q') || ''
  const results = fuse.search(q)

  return NextResponse.json({
    data: results,
  })
}
