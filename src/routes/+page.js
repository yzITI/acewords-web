import { goto } from '$app/navigation'

export function load (ctx) { // login with token
  const token = ctx.url.searchParams.get('token')
  if (token) window.localStorage.token = token
  if (window.localStorage.token) goto('/home')
}
