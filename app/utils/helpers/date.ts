export const formatDate = (date: Date) =>
  date.toISOString().substring(0, 10).split('-').reverse().join('/')

export const isDateValid = (value?: string) => {
  return typeof value === 'string' && !isNaN(Date.parse(value))
}

export const getMonthName = (month: number) => {
  switch (month) {
    case 0:
      return 'january'
    case 1:
      return 'february'
    case 2:
      return 'march'
    case 3:
      return 'april'
    case 4:
      return 'may'
    case 5:
      return 'june'
    case 6:
      return 'july'
    case 7:
      return 'august'
    case 8:
      return 'september'
    case 9:
      return 'october'
    case 10:
      return 'november'
    case 11:
      return 'december'
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

export const buildMonthYearExpenseCorrelation = (
  totalAmount: number,
  { month, year }: { month: number; year: number },
) => {
  const period = new Date()
  period.setMonth(month)
  period.setFullYear(year)
  return {
    period: `${getMonthName(period.getMonth())} ${period.getFullYear()}`,
    total: totalAmount ? parseFloat(totalAmount.toFixed(2)) : 0,
  }
}
