export interface User {
  id: string
  email: string
  name?: string
  role: 'USER' | 'ADMIN'
  createdAt?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string | null
  children?: Category[]
  parent?: Category | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice?: number | null
  saleEndsAt?: string | null
  stock: number
  images: string[]
  categoryId: string
  category?: Category
  isActive: boolean
  createdAt: string
  avgRating?: number
  reviewCount?: number
}

export interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  comment?: string | null
  createdAt: string
  user?: { id: string; name?: string | null }
}

export interface ReviewsResponse {
  reviews: Review[]
  avgRating: number
  count: number
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  product: Product
}

export interface Cart {
  id: string
  userId?: string | null
  sessionId?: string | null
  items: CartItem[]
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  street: string
  city: string
  postalCode: string
  country: string
}

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product?: Pick<Product, 'id' | 'name' | 'slug' | 'images'>
}

export interface Order {
  id: string
  userId: string
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  total: number
  shippingAddress: ShippingAddress
  stripePaymentId?: string | null
  items: OrderItem[]
  createdAt: string
  user?: Pick<User, 'id' | 'email' | 'name'>
}

export interface ProductsResponse {
  items: Product[]
  total: number
  page: number
  totalPages: number
}
