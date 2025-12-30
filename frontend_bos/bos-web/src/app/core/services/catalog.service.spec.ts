import { TestBed } from '@angular/core/testing'
import { CatalogService } from './catalog.service'

describe('CatalogService', () => {
  let service: CatalogService

  beforeEach(() => {
    localStorage.clear()
    TestBed.configureTestingModule({})
    service = TestBed.inject(CatalogService)
  })

  it('adds a product and registers its category', () => {
    const initialCount = service.getProducts()().length
    service.addProduct({
      name: 'New',
      price: 100,
      category: 'Snacks',
      isPromotion: false,
    })

    const products = service.getProducts()()
    const categories = service.getCategories()()
    expect(products.length).toBe(initialCount + 1)
    expect(categories).toContain('Snacks')
  })

  it('renames category and updates products', () => {
    service.addProduct({
      name: 'Test',
      price: 50,
      category: 'CatA',
      isPromotion: false,
    })

    service.updateCategory('CatA', 'CatB')

    const product = service.getProducts()().find(p => p.name === 'Test')
    expect(product?.category).toBe('CatB')
    expect(service.getCategories()()).toContain('CatB')
    expect(service.getCategories()()).not.toContain('CatA')
  })

  it('moves products to default category when deleting', () => {
    service.addProduct({
      name: 'Move',
      price: 10,
      category: 'Temporal',
      isPromotion: false,
    })

    service.deleteCategory('Temporal')

    const product = service.getProducts()().find(p => p.name === 'Move')
    expect(product?.category).toBe('Uncategorized')
    expect(service.getCategories()()).toContain('Uncategorized')
  })
})
