import { firestore } from 'firebase'

export interface User {
  name: string
  email: string
  lastLoginAt: firestore.Timestamp
}

export interface Card {
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
}

export interface CardList {
  [key: string]: Card
}

export interface Task {
  parentCardId: string
  title: string
  position: number
  done: boolean
  updatedAt: firestore.Timestamp
}

export interface TaskList {
  [key: string]: Task
}
