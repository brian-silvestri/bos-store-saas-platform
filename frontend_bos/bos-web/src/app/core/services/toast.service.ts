import { Injectable, signal } from '@angular/core'

type ToastType = 'success' | 'error'

export interface ToastMessage {
  message: string
  type: ToastType
  count: number
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast = signal<ToastMessage | null>(null)
  private timer: any

  show(message: string, type: ToastType = 'success') {
    const current = this.toast()
    if (current && current.message === message && current.type === type) {
      this.toast.set({ ...current, count: current.count + 1 })
    } else {
      this.toast.set({ message, type, count: 1 })
    }

    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => this.toast.set(null), 2000)
  }

  showSuccess(message: string) {
    this.show(message, 'success')
  }

  showError(message: string) {
    this.show(message, 'error')
  }
}
