import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="px-6 py-3 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
              {{ getUserInitials() }}
            </div>
            <div class="text-left">
              <p class="text-sm font-semibold text-gray-800">{{ userName }}</p>
              <p class="text-xs text-gray-500">{{ userRole }}</p>
            </div>
          </div>
          <button
            (click)="logout()"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  `,
})
export class AdminHeaderComponent {
  private router = inject(Router)

  userName = ''
  userRole = ''

  constructor() {
    this.loadUserInfo()
  }

  private loadUserInfo() {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      // Decode JWT token
      const payload = JSON.parse(atob(token.split('.')[1]))
      // Get username from email or unique_name
      const email = payload['email'] || payload['unique_name'] || payload['name'] || 'User'

      // Extract username from email (part before @)
      if (email.includes('@')) {
        this.userName = email.split('@')[0]
      } else {
        this.userName = email
      }

      this.userRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Admin'
    } catch (error) {
      console.error('Error loading user info:', error)
    }
  }

  getUserInitials(): string {
    if (!this.userName) return 'U'

    // If it's a name with spaces, get first letter of first two words
    const words = this.userName.split(' ')
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    }

    // Get first two letters if available
    if (this.userName.length >= 2) {
      return this.userName.substring(0, 2).toUpperCase()
    }

    // Otherwise just get the first letter
    return this.userName.charAt(0).toUpperCase()
  }

  logout() {
    localStorage.removeItem('authToken')
    this.router.navigate(['/login'])
  }
}
