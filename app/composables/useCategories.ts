// composables/useCategories.ts
// جلب الفئات من API مرة واحدة وتخزينها

interface Category {
  id: number
  name_ar: string
  slug: string
  description_ar: string
  icon: string
  color: string
  image: string | null
  order: number
  is_active: boolean
  show_on_menu: boolean
  posts_count: number
}

interface ApiResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

const API_BASE = 'https://89.167.10.171.nip.io'

// --- Fallback Data ---
const fallbackCategories: Category[] = [
  {
    id: 6,
    name_ar: 'عن مصر',
    slug: 'عن-مصر',
    description_ar: 'أخبار عن مصر',
    icon: '',
    color: '#417690',
    image: null,
    order: 0,
    is_active: true,
    show_on_menu: true,
    posts_count: 1,
  },
]

export const useCategories = () => {
  const categories = useState<Category[]>('categories', () => [])
  const loading = useState<boolean>('categories-loading', () => false)
  const error = useState<string | null>('categories-error', () => null)
  const fetched = useState<boolean>('categories-fetched', () => false)

  const fetchCategories = async () => {
    // لو جلبنا قبل، ما نعيد
    if (fetched.value && categories.value.length > 0) return

    loading.value = true
    error.value = null

    try {
      const data = await $fetch<ApiResponse<Category>>(
        `${API_BASE}/api/blog/blog-categories/`,
        { retry: 1, timeout: 8000 }
      )

      const filtered = data.results.filter((c) => c.show_on_menu && c.is_active)
      categories.value = filtered.length > 0 ? filtered : fallbackCategories
      fetched.value = true
    } catch (err) {
      console.warn('Failed to fetch categories, using fallback')
      categories.value = fallbackCategories
      error.value = 'فشل الاتصال بالخادم'
      fetched.value = true
    } finally {
      loading.value = false
    }
  }

  return {
    categories: readonly(categories),
    loading: readonly(loading),
    error: readonly(error),
    fetchCategories,
  }
}