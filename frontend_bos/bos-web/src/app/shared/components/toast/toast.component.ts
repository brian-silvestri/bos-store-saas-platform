import { CommonModule } from '@angular/common'
import { Component, computed } from '@angular/core'
import { ToastService } from '../../../core/services/toast.service'

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent {
  toast = computed(() => this.toastService.toast())

  constructor(private toastService: ToastService) {}
}
