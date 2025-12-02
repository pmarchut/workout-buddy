import { useState } from "react"
import { useWorkoutsContext } from "../hooks/useWorkoutsContext"
import { useAuthContext } from "../hooks/useAuthContext"

function WorkoutForm() {
  const API_URL = import.meta.env.VITE_API_URL

  const { dispatch } = useWorkoutsContext()
  const {user} = useAuthContext()

  const [title, setTitle] = useState('')
  const [load, setLoad] = useState('')
  const [reps, setReps] = useState('')
  const [error, setError] = useState(null)
  const [emptyFields, setEmptyFields] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      setError('You must be logged in')
      return
    }

    const workout = { title, load, reps }

    const response = await fetch(`${API_URL}/api/workouts`, {
      method: 'POST',
      body: JSON.stringify(workout),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      }
    })
    const json = await response.json()

    if (!response.ok) {
        setError(json.error)
        setEmptyFields(json.emptyFields)
    }
    if (response.ok) {
        setTitle('')
        setLoad('')
        setReps('')
        setError(null)
        setEmptyFields([])
        console.log('new workout added', json)
        dispatch({type: 'CREATE_WORKOUT', payload: json})
    }
  }

  return (
    <form className="create" onSubmit={handleSubmit}>
        <h3>Add a New Workout</h3>

        <label htmlFor="title">Exercise Title:</label>
        <input
          id="title"
          type="text"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          className={emptyFields.includes('title') ? 'error' : ''}
        />

        <label htmlFor="load">Load (in kg):</label>
        <input
          id="load"
          type="number"
          onChange={(e) => setLoad(e.target.value)}
          value={load}
          className={emptyFields.includes('load') ? 'error' : ''}
        />

        <label htmlFor="reps">Reps:</label>
        <input
          id="reps"
          type="number"
          onChange={(e) => setReps(e.target.value)}
          value={reps}
          className={emptyFields.includes('reps') ? 'error' : ''}
        />

        <button>Add Workout</button>
        {error && <div className="error">{error}</div>}
    </form>
  )
}

export default WorkoutForm
