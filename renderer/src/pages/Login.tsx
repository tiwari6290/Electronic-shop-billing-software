import { useState } from "react"

type LoginForm = {
  email: string
  password: string
}

const Login = () => {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: ""
  })

  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.email || !form.password) {
      setError("Email and password are required")
      return
    }

    setError(null)
    console.log("Login data:", form)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl bg-red/90 p-8 shadow-2xl backdrop-blur"
      >
        <h2 className="text-center text-3xl font-bold text-gray-800">
          Welcome Back 👋
        </h2>
        <p className="text-center text-sm text-grey-500">
          Login to continue
        </p>

        {error && (
          <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-grey-600">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg active:scale-100"
        >
          Login
        </button>

        <div className="text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <span className="cursor-pointer font-medium text-indigo-600 hover:underline">
            Sign up
          </span>
        </div>
      </form>
    </div>
  )
}

export default Login
