import { CommonModule } from '@angular/common'
import { Component, computed } from '@angular/core'
import { ConfirmService } from '../../../core/services/confirm.service'

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  state = computed(() => this.confirm.state())

  constructor(private confirm: ConfirmService) {}

  accept() {
    this.confirm.accept()
  }

  cancel() {
    this.confirm.cancel()
  }
}
