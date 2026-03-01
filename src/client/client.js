import axios from 'axios'
import config from '../config/default'
import firebase from '../firebase'

const client = axios.create({
  baseURL: process.env.VUE_APP_API_URL
  // baseURL: "http://localhost:5000",
})

const getHeaders = (token) => {
  return {
    Authorization: `Bearer ${token}`
  }
}

const getSchools = async (value) => {
  const { data } = await client.get('/schools', { params: { school: value } })
  return data
}

const createRegistration = async (registration) => {
  const token = await firebase.getIdToken()
  const { data } = await client.post('/registration', registration, {
    headers: getHeaders(token)
  })
  return data
}

const getRegistration = async (registrationId) => {
  const token = await firebase.getIdToken()
  const { data } = await client.get('/registration', {
    params: { registrationId },
    headers: getHeaders(token)
  })
  return data
}

const hasRegistration = async () => {
  const token = await firebase.getIdToken()
  const { data } = await client.get('/has-registration', {
    headers: getHeaders(token)
  })
  return data.hasRegistration
}

const createUser = async (user) => {
  const token = await firebase.getIdToken()
  const { status } = await client.post(
    '/user',
    { ...user },
    { headers: getHeaders(token) }
  )
  return status
}

const getUser = async (content) => {
  const token = await firebase.getIdToken()
  const path = content === 'full' ? '/user?full=true' : 'user'
  const { data } = await client.get(path, { headers: getHeaders(token) })
  return data.user
}

const updateUser = async (email, user) => {
  const token = await firebase.getIdToken()
  const { status } = await client.put(
    '/user',
    { email, ...user },
    { headers: getHeaders(token) }
  )
  return status
}

const deleteUser = async () => {
  const token = await firebase.getIdToken()
  const { status } = await client.delete('/user', {
    headers: getHeaders(token)
  })
  return status
}

export default {
  getSchools,
  createRegistration,
  getRegistration,
  hasRegistration,
  createUser,
  getUser,
  updateUser,
  deleteUser
}
