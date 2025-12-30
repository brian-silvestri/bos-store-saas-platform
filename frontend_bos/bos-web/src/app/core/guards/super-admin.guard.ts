import { inject } from '@angular/core'
import { Router, type CanActivateFn } from '@angular/router'

export const superAdminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)
  const token = localStorage.getItem('authToken')

  if (!token) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } })
    return false
  }

  // Decode JWT to check role
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

    if (role === 'SuperAdmin') {
      return true
    } else {
      // Si es Admin normal, redirigir al admin normal
      router.navigate(['/admin'])
      return false
    }
  } catch (error) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } })
    return false
  }
}
