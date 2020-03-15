export interface User {
  name: string
  email: string
  lastLoginAt: Date
}

export interface Card {
  title: string
  position: number
  denominator: number
  denominatorUnit: 'day' | 'week' | 'month' | 'year'
  lastResetAt: Date
}

export interface CardList {
  [key: string]: Card
}

export interface Task {
  parentCardId: string
  title: string
  position: number
  done: boolean
  updatedAt: Date
}

export interface TaskList {
  [key: string]: Task
}
