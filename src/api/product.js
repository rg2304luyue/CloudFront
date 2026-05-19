import request from '@/utils/request'

export function getCategoryTree() {
  return request.get('/product/category')
}

export function addCategory(data) {
  return request.post('/product/category', data)
}

export function updateCategory(data) {
  return request.put('/product/category', data)
}

export function deleteCategory(id) {
  return request.delete(`/product/category/${id}`)
}

export function getProductDetail(id) {
  return request.get(`/product/detail/${id}`)
}

export function getProductList(params) {
  return request.get('/product/list', { params })
}

export function getMyProducts(params) {
  return request.get('/product/my-list', { params })
}

export function addProduct(data) {
  return request.post('/product', data)
}

export function updateProduct(data) {
  return request.put('/product', data)
}

export function deleteProduct(id) {
  return request.delete(`/product/${id}`)
}
