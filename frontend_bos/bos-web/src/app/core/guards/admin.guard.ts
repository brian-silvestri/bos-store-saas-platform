import { inject } from '@angular/core'
import { Router, type CanActivateFn } from '@angular/router'

export const adminGuard: CanActivateFn = (route, state) => {
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

    if (role === 'Admin') {
      return true
    } else if (role === 'SuperAdmin') {
      // Si es SuperAdmin, redirigir al panel de SuperAdmin
      router.navigate(['/super-admin'])
      return false
    } else {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } })
      return false
    }
  } catch (error) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } })
    return false
  }
}
