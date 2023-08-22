export const ssr = false // globally disabled SSR

function decodeToken (token) {
  let input = token?.split('.')[1]
  if (!input) return {}
  input = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = input.length % 4
  if (pad) input += new Array(5 - pad).join('=')
  return JSON.parse(decodeURIComponent(atob(input).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')))
}

// auto login with localStorage
export function load () {
  const token = window.localStorage.token
  if (!token) return {}
  const payload = decodeToken(token)
  if (!payload.id || payload.iat < Date.now() - 7 * 86400e3) {
    window.localStorage.removeItem('token')
    return {}
  }
  return { user: { ...payload, token } }
}
