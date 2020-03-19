import { firestore } from 'firebase'

export interface FireUser {
  name: string
  email: string
  lastLoginAt: firestore.Timestamp
}

export interface FireTaskList {
  title: string
  position: number
  denominator: number
  denominatorUnit: string
  lastResetAt: firestore.Timestamp
}

export interface FireTaskLists {
  [key: string]: FireTaskList
}

export interface FireTask {
  title: string
  position: number
  done: boolean
  updatedAt: firestore.Timestamp
}

export interface FireTasks {
  [key: string]: FireTask
}
