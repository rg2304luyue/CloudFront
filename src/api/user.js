import request from '@/utils/request'

// ===== 当前用户 =====

export function getUserInfo() {
  return request.get('/users/me')
}

export function updateUserInfo(data) {
  return request.patch('/users/me', data)
}

// ===== 地址 =====

export function getAddressList() {
  return request.get('/users/me/addresses')
}

export function getAddressById(addressId) {
  return request.get(`/users/me/addresses/${addressId}`)
}

export function addAddress(data) {
  return request.post('/users/me/addresses', data)
}

export function updateAddress(addressId, data) {
  return request.put(`/users/me/addresses/${addressId}`, data)
}

export function deleteAddress(addressId) {
  return request.delete(`/users/me/addresses/${addressId}`)
}

// ===== 卖家申请 =====

export function applySeller() {
  return request.post('/users/me/apply-seller')
}

// ===== 头像 =====

export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// ===== 管理员（URL 移到了 /admin 下） ====

export function getUserList() {
  return request.get('/admin/users')
}

export function resetPassword(targetUserId, newPassword) {
  return request.put(`/admin/users/${targetUserId}/password`, { newPassword })
}

export function getApplications() {
  return request.get('/admin/applications')
}

export function processApplication(id, approved) {
  return request.patch(`/admin/applications/${id}`, { approved })
}
