import { goto } from '$app/navigation'

export function load (ctx) { // login with token
  const token = ctx.url.searchParams.get('token')
  if (!token) return
  window.localStorage.token = token
  goto('/home')
}
