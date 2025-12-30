import { Injectable, inject } from '@angular/core'
import { STORE_CONFIG_MOCK } from '../mocks/store-config.mock'
import { ThemeKey, THEME_PALETTES } from './theme-palettes'
import { ApiService } from './api.service'
import { Observable, tap, catchError, of } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class StoreConfigService {
  private apiService = inject(ApiService)
  config = STORE_CONFIG_MOCK
  private storageKey = 'bos.store.config'

  private isThemeKey = (key: string | undefined): key is ThemeKey =>
    !!key && Object.prototype.hasOwnProperty.call(THEME_PALETTES, key)

  constructor() {
    this.loadConfigFromAPI()
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorage)
    }
  }

  get availableThemes() {
    return Object.entries(THEME_PALETTES).map(([key, value]) => ({
      key: key as ThemeKey,
      label: value.label,
      primaryColor: value.primaryColor,
      secondaryColor: value.secondaryColor,
    }))
  }

  saveConfig(): Observable<void> {
    return this.apiService.updateStoreConfig(this.config).pipe(
      tap(() => {
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.config))
          this.applyBranding()
        } catch {
          // Ignore storage failures (private mode, disabled storage).
        }
      }),
      catchError((error) => {
        console.error('Error saving config to API:', error)
        // Fallback to localStorage only
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.config))
          this.applyBranding()
        } catch {
          // Ignore storage failures
        }
        throw error
      })
    )
  }

  applyBranding(themeKey?: ThemeKey) {
    const paletteKey = themeKey ?? (this.isThemeKey(this.config.themeKey) ? this.config.themeKey : 'classic')
    const palette = THEME_PALETTES[paletteKey]

    const primary = this.config.primaryColor || palette.primaryColor
    const secondary = this.config.secondaryColor || palette.secondaryColor

    document.documentElement.style.setProperty('--primary', primary)
    document.documentElement.style.setProperty('--secondary', secondary)
    document.documentElement.style.setProperty('--primary-border', palette.primaryBorderColor)
    document.documentElement.style.setProperty('--bg', palette.bgColor)
    document.documentElement.style.setProperty('--surface', palette.surfaceColor)
    document.documentElement.style.setProperty('--surface-muted', palette.surfaceMutedColor)
    document.documentElement.style.setProperty('--surface-soft', palette.surfaceSoftColor)
    document.documentElement.style.setProperty('--surface-soft-alt', palette.surfaceSoftAltColor)
    document.documentElement.style.setProperty('--border', palette.borderColor)
    document.documentElement.style.setProperty('--border-strong', palette.borderStrongColor)
    document.documentElement.style.setProperty('--text', palette.textColor)
    document.documentElement.style.setProperty('--text-strong', palette.textStrongColor)
    document.documentElement.style.setProperty('--text-muted', palette.textMutedColor)
    document.documentElement.style.setProperty('--text-subtle', palette.textSubtleColor)
    document.documentElement.style.setProperty('--accent', palette.accentColor)
    document.documentElement.style.setProperty('--badge', palette.badgeColor)
    document.documentElement.style.setProperty('--neutral-surface', palette.neutralSurfaceColor)
    document.documentElement.style.setProperty('--neutral-surface-alt', palette.neutralSurfaceAltColor)
    document.documentElement.style.setProperty('--neutral-border', palette.neutralBorderColor)
    document.documentElement.style.setProperty('--neutral-border-strong', palette.neutralBorderStrongColor)
    document.documentElement.style.setProperty('--neutral-text', palette.neutralTextColor)
    document.documentElement.style.setProperty('--neutral-muted', palette.neutralMutedColor)
    document.documentElement.style.setProperty('--neutral-subtle', palette.neutralSubtleColor)
  }

  previewTheme(themeKey: ThemeKey) {
    const palette = THEME_PALETTES[themeKey]
    this.config.themeKey = themeKey
    this.config.primaryColor = palette.primaryColor
    this.config.secondaryColor = palette.secondaryColor
    this.applyBranding(themeKey)
  }

  setTheme(themeKey: ThemeKey) {
    const palette = THEME_PALETTES[themeKey]
    this.config.themeKey = themeKey
    this.config.primaryColor = palette.primaryColor
    this.config.secondaryColor = palette.secondaryColor
    this.applyBranding(themeKey)
    this.saveConfig()
  }

  get currencySymbol() {
    return this.config.currency === 'ARS' ? '$' : 'USD'
  }

  private loadConfigFromAPI() {
    this.apiService.getStoreConfig().subscribe({
      next: (config) => {
        this.config = { ...this.config, ...config }
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.config))
        } catch {
          // Ignore storage failures
        }
        this.applyBranding()
      },
      error: (error) => {
        console.warn('Failed to load config from API, using localStorage fallback:', error)
        this.loadConfig()
        this.applyBranding()
      }
    })
  }

  private loadConfig() {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<typeof this.config>
      this.config = { ...this.config, ...parsed }
    } catch {
      // Ignore invalid or unavailable stored config.
    }
  }

  private handleStorage = (event: StorageEvent) => {
    if (event.key !== this.storageKey) return
    this.loadConfig()
    this.applyBranding()
  }
}
