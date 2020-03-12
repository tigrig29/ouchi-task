import { firestore } from 'firebase'

export interface User {
  name: string
  email: string
  lastLoginAt: firestore.Timestamp
}

export interface Card {
  id: string
  title: string
  position: number
  denominator: number
  denominatorUnit:
    | 'second'
    | 'minute'
    | 'hour'
    | 'day'
    | 'week'
    | 'month'
    | 'year'
  tasks: Task[]
}

export interface Task {
  id: string
  title: string
  done: boolean
  updatedAt: firestore.Timestamp
}
