import { CommonModule } from '@angular/common'
import { Component, signal, OnInit } from '@angular/core'

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-public.page.html',
})
export class AdminPublicPage implements OnInit {
  tenantId = signal<string>('')
  storefrontUrl = signal<string>('')

  ngOnInit() {
    // Get tenant ID from localStorage
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.tenantId) {
          this.tenantId.set(user.tenantId)
          const baseUrl = window.location.origin
          // Subdomain is same as tenantId (lowercased)
          const slug = user.tenantId.toLowerCase()
          this.storefrontUrl.set(`${baseUrl}/store/${slug}`)
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e)
      }
    }
  }

  copyUrl() {
    navigator.clipboard.writeText(this.storefrontUrl())
    alert('URL copied to clipboard!')
  }
}
