import mondaySdk from 'monday-sdk-js'

const API_TOKEN = import.meta.env.VITE_MONDAY_API_TOKEN
const VITE_ENV = import.meta.env.VITE_ENV

export const monday =
  VITE_ENV === 'development' ? mondaySdk({ apiToken: API_TOKEN }) : mondaySdk()

monday.setApiVersion('2023-10')
