import { firestore } from 'firebase'
import { User, Card, Task } from '~/types/firestore'

type extendUser = User & { cards: extendCard[] }
type extendCard = Card & { tasks: Task[] }

interface OuchiTaskStore {
  users: extendUser[]
}

const sampleDate: firestore.Timestamp = {
  seconds: 9999,
  nanoseconds: 9999,
  isEqual: (): boolean => true,
  toDate: (): Date => new Date('2020/03/12 00:00:00'),
  toMillis: (): number => 9999,
  valueOf: (): string => '9999'
}

const sampleOuchiTaskStore: OuchiTaskStore = {
  users: [
    {
      name: 'TigRig',
      email: 'tigrig.crex@gmail.com',
      lastLoginAt: sampleDate,
      cards: [
        {
          id: '',
          title: 'サンプルカード',
          position: 0,
          denominator: 1,
          denominatorUnit: 'day',
          tasks: [
            {
              id: '',
              title: 'サンプルタスク',
              done: false,
              updatedAt: sampleDate
            }
          ]
        }
      ]
    }
  ]
}

export default sampleOuchiTaskStore
