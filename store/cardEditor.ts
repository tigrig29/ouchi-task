import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { Card } from '~/types/firestore'
import { cardStore } from '~/utils/store-accessor'
import date from '~/assets/libs/date'

export interface CardEditorValues {
  title: Card['title']
  position: Card['position']
  denominator: string // input type="number" が string を返す
  denominatorUnit: Card['denominatorUnit']
  lastResetAt: string // date picker が 'yyyy-mm-dd' 形式の string を返す
}

const cardForAdd = (): CardEditorValues => {
  return {
    title: '',
    position: cardStore.currentMaxPosition + 1,
    denominator: '1',
    denominatorUnit: 'day',
    lastResetAt: date.pickUpDate(new Date(), '-')
  }
}

const cardForUpdate = (cardId: string): CardEditorValues => {
  const targetCard = cardStore.cardList[cardId]
  return {
    ...targetCard,
    denominator: targetCard.denominator.toString(),
    lastResetAt: date.pickUpDate(targetCard.lastResetAt, '-')
  }
}

@Module({ stateFactory: true, namespaced: true, name: 'cardEditor' })
export default class CardEditor extends VuexModule {
  id: string = ''
  values: CardEditorValues = {
    title: '',
    position: 0,
    denominator: '1',
    denominatorUnit: 'day',
    lastResetAt: '2020-01-01'
  }

  // =================================================
  // Edited values
  // =================================================

  get separatedLastResetDate(): {
    [N in 'year' | 'month' | 'day']: number
  } {
    const lastResetAt = this.values.lastResetAt
    if (!lastResetAt) return { year: 0, month: -1, day: 0 }
    else {
      const [year, month, day] = lastResetAt
        .split('-')
        .map((value) => parseInt(value))
      return { year, month: month - 1, day }
    }
  }

  // =================================================
  // Mutations
  // =================================================

  @Mutation
  private setId(cardId?: string) {
    this.id = cardId || ''
  }

  @Mutation
  private setValues(cardId?: string) {
    if (cardId) this.values = cardForUpdate(cardId)
    else this.values = cardForAdd()
  }

  @Mutation
  setValue(payload: Partial<CardEditorValues>) {
    const {
      title,
      position,
      denominator,
      denominatorUnit,
      lastResetAt
    } = payload
    if (title !== undefined) this.values.title = title
    if (position !== undefined) this.values.position = position
    if (denominator !== undefined) this.values.denominator = denominator
    if (denominatorUnit !== undefined)
      this.values.denominatorUnit = denominatorUnit
    if (lastResetAt !== undefined) this.values.lastResetAt = lastResetAt
  }

  // =================================================
  // Base actions
  // =================================================

  @Action
  init(cardId?: string) {
    this.setId(cardId)
    this.setValues(cardId)
  }
}
