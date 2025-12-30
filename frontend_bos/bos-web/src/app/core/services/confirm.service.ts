import { Injectable, signal } from '@angular/core'

interface ConfirmState {
  message: string
  resolve: (value: boolean) => void
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  state = signal<ConfirmState | null>(null)

  confirm(message: string) {
    return new Promise<boolean>(resolve => {
      this.state.set({ message, resolve })
    })
  }

  accept() {
    const current = this.state()
    if (current) {
      current.resolve(true)
      this.state.set(null)
    }
  }

  cancel() {
    const current = this.state()
    if (current) {
      current.resolve(false)
      this.state.set(null)
    }
  }
}
