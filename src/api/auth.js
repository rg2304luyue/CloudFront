import request from '@/utils/request'

export function login(username, password) {
  return request.post('/auth/login', null, { params: { username, password } })
}

export function register(username, password, nickname) {
  return request.post('/auth/register', null, { params: { username, password, nickname } })
}
