export default {
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
  pickUpDate(date: Date, monthSeparator: string = '/') {
    return this.format(date, monthSeparator).split(' ')[0]
  },
  pickUpTime(date: Date, timeSeparator: string = ':') {
    return this.format(date, timeSeparator).split(' ')[1]
  }
}
