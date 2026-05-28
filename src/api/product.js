import request from '@/utils/request'

// ===== 分类（移到 /categories） =====

export function getCategoryTree() {
  return request.get('/categories')
}

export function addCategory(data) {
  return request.post('/categories', data)
}

export function updateCategory(id, data) {
  return request.put(`/categories/${id}`, data)
}

export function deleteCategory(id) {
  return request.delete(`/categories/${id}`)
}

// ===== 公共商品查询 =====

export function getProductDetail(id) {
  return request.get(`/products/${id}`)
}

export function getProductList(params) {
  return request.get('/products', { params })
}

export function getHotProducts() {
  return request.get('/products/hot')
}

// ===== 卖家（移到 /seller/products） =====

export function getMyProducts(params) {
  return request.get('/seller/products/mine', { params })
}

export function addProduct(data) {
  return request.post('/seller/products', data)
}

export function updateProduct(id, data) {
  return request.put(`/seller/products/${id}`, data)
}

export function deleteProduct(id) {
  return request.delete(`/seller/products/${id}`)
}

// ===== 管理员（移到 /admin/products） =====

export function getPendingProducts(params) {
  return request.get('/admin/products/pending', { params })
}

export function reviewProduct(id, approved) {
  return request.patch(`/admin/products/${id}/review`, { approved })
}

// ===== 图片上传 =====

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/products/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
