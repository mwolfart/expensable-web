export const formatDate = (date: Date) =>
  date.toISOString().substring(0, 10).split('-').reverse().join('/')

export const getMonthName = (month: number) => {
  switch (month) {
    case 0:
      return 'January'
    case 1:
      return 'February'
    case 2:
      return 'Marcho'
    case 3:
      return 'April'
    case 4:
      return 'May'
    case 5:
      return 'June'
    case 6:
      return 'July'
    case 7:
      return 'August'
    case 8:
      return 'September'
    case 9:
      return 'October'
    case 10:
      return 'November'
    case 11:
      return 'December'
  }
}

export const getUpcomingMonthYears = (startDate: Date, amount?: number) => {
  const startMonthYear = {
    month: startDate.getMonth(),
    year: startDate.getFullYear(),
  }
  const upcomingMonthYears = [...Array(amount || 6).keys()].map((i) => {
    const addedMonth = startMonthYear.month + i + 1
    const month = addedMonth > 11 ? addedMonth - 12 : addedMonth
    const year = addedMonth > 11 ? startMonthYear.year + 1 : startMonthYear.year
    return {
      month,
      year,
    }
  })
  return upcomingMonthYears
}

export const getIntervalForMonthYear = (month: number, year: number) => {
  const currentDate = new Date()
  currentDate.setFullYear(year, month, 1)
  currentDate.setHours(0, 0, 0, 0)
  const startDate = new Date(currentDate)
  currentDate.setMonth(currentDate.getMonth() + 1, 0)
  const endDate = new Date(currentDate)
  return {
    startDate,
    endDate,
  }
}
