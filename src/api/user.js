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
