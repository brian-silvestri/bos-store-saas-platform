import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CatalogService } from '../../../core/services/catalog.service'
import { ConfirmService } from '../../../core/services/confirm.service'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.page.html',
})
export class AdminCategoriesPage {
  private catalog = inject(CatalogService)
  private confirm = inject(ConfirmService)

  categories = this.catalog.getCategories()
  products = this.catalog.getProducts()
  formName = ''
  editingName: string | null = null

  saveCategory() {
    const name = this.formName.trim()
    if (!name) return
    if (this.editingName) {
      this.catalog.updateCategory(this.editingName, name)
    } else {
      this.catalog.addCategory(name)
    }
    this.resetForm()
  }

  editCategory(name: string) {
    this.editingName = name
    this.formName = name
  }

  async deleteCategory(name: string) {
    const ok = await this.confirm.confirm(`Delete category "${name}"?`)
    if (!ok) return
    this.catalog.deleteCategory(name)
    if (this.editingName === name) {
      this.resetForm()
    }
  }

  resetForm() {
    this.formName = ''
    this.editingName = null
  }

  productCount(name: string) {
    return this.products().filter(p => p.category === name).length
  }
}
