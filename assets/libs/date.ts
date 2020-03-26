import { VuexTaskList } from '~/store/taskListStore'

export default {
  // =================================================
  // Formatter ( Date -> string )
  // =================================================
  /**
   * Date インスタンスをフォーマットした文字列で返す
   * @param date 対象の Date インスタンス
   * @param monthSeparator 日付の区切り記号（デフォルト： '/' ）
   * @param timeSeparator 時刻の区切り記号（デフォルト： ':' ）
   */
  format(
    date: Date,
    monthSeparator: string = '/',
    timeSeparator: string = ':'
  ) {
    return (
      date.getFullYear() +
      monthSeparator +
      (date.getMonth() + 1) +
      monthSeparator +
      date.getDate() +
      ' ' +
      date.getHours() +
      timeSeparator +
      date.getMinutes() +
      timeSeparator +
      date.getSeconds()
    )
  },
  /**
   * Date インスタンスのうち、日付の部分のみフォーマットした文字列で返す
   * @param date 対象の Date インスタンス
   * @param monthSeparator 日付の区切り記号（デフォルト： '-' ）
   */
  pickUpDate(date: Date, monthSeparator: string = '-') {
    return this.format(date, monthSeparator).split(' ')[0]
  },
  /**
   * Date インスタンスのうち、時刻の部分のみフォーマットした文字列で返す
   * @param date 対象の Date インスタンス
   * @param timeSeparator 時刻の区切り記号（デフォルト： ':' ）
   */
  pickUpTime(date: Date, timeSeparator: string = ':') {
    return this.format(date, timeSeparator).split(' ')[1]
  },

  // =================================================
  // Reverse formatter ( string -> Date )
  // =================================================
  /**
   * 日付文字列を Date インスタンスに変換する
   * @param date 対象の日付文字列
   * @param monthSeparator 日付の区切り記号（デフォルト： '-' ）
   */
  reversePickUpDate(date: string, monthSeparator: string = '-') {
    const [year, month, day]: number[] = date
      .split(monthSeparator)
      .map((value) => parseInt(value))
    return new Date(year, month - 1, day)
  },

  // =================================================
  // Control date values
  // =================================================

  /**
   * Date インスタンスから、年、月、日の数値を取得する（月は 0 ~ 11）
   * @param date 対象の Date インスタンス
   */
  getDateValues(date: Date) {
    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear()
    }
  },

  /**
   * 日付の加算処理
   * @param baseDate 加算対象の Date インスタンス
   * @param unit 加算単位（年、月、日……）
   * @param value 加算する値
   */
  addDateValues(
    baseDate: Date,
    unit: VuexTaskList['denominatorUnit'],
    value: number
  ) {
    const date: Date = new Date(baseDate)
    const { day, month, year } = this.getDateValues(date)
    switch (unit) {
      case 'day':
        date.setDate(day + value)
        break
      case 'week':
        date.setDate(day + value * 7)
        break
      case 'month':
        date.setMonth(month + value)
        break
      case 'year':
        date.setFullYear(year + value)
        break
    }
    return date
  }
}
