import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { RouterLink, RouterLinkActive, Router } from '@angular/router'

export interface SidebarLink {
  label: string
  route: string
  icon?: string
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-[var(--surface)] border-r border-[var(--neutral-border)] flex flex-col">
      <div class="p-4 border-b border-[var(--neutral-border)]">
        <p class="text-lg font-semibold text-[var(--neutral-text)]">{{ title }}</p>
        <p class="text-xs text-[var(--neutral-muted)]">{{ subtitle }}</p>
      </div>

      <nav class="flex-1 p-3 space-y-1 text-sm text-[var(--neutral-subtle)]">
        @for (link of links; track link.route) {
          <a [routerLink]="link.route" routerLinkActive="active-link" class="nav-link">
            <span>{{ link.label }}</span>
          </a>
        }
      </nav>

      <div class="p-4 border-t border-[var(--neutral-border)]">
        <div class="text-xs text-[var(--neutral-muted)] mb-2">
          {{ footerText }}
        </div>
        <button
          (click)="logout()"
          class="w-full px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .nav-link {
      display: block;
      padding: 10px 12px;
      border-radius: 10px;
      transition: background 0.2s;
    }

    .nav-link:hover {
      background: var(--neutral-surface-alt);
    }

    .active-link {
      background: var(--neutral-border);
      font-weight: 600;
    }
  `]
})
export class AdminSidebarComponent {
  @Input() title = 'BusinessOS'
  @Input() subtitle = 'Commerce'
  @Input() links: SidebarLink[] = []
  @Input() footerText = ''

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('authToken')
    this.router.navigate(['/login'])
  }
}
