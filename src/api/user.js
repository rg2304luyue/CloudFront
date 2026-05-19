import request from '@/utils/request'

export function getUserInfo() {
  return request.get('/user/info')
}

export function updateUserInfo(params) {
  return request.put('/user/info', null, { params })
}

export function getAddressList() {
  return request.get('/user/address')
}

export function getAddressById(addressId) {
  return request.get(`/user/address/${addressId}`)
}

export function addAddress(data) {
  return request.post('/user/address', data)
}

export function updateAddress(data) {
  return request.put('/user/address', data)
}

export function deleteAddress(addressId) {
  return request.delete(`/user/address/${addressId}`)
}

export function getUserList() {
  return request.get('/user/admin/list')
}

export function resetPassword(targetUserId, newPassword) {
  return request.put('/user/admin/reset-password', null, { params: { targetUserId, newPassword } })
}

export function applySeller() {
  return request.post('/user/apply-seller')
}

export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/user/avatar/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function getApplications() {
  return request.get('/user/admin/applications')
}

export function processApplication(id, approved) {
  return request.put(`/user/admin/applications/${id}`, null, { params: { approved } })
}
