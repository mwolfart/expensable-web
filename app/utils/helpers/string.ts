export const formatCurrency = (amount: number) => {
  const currency = 'R$'
  return `${currency} ${amount.toFixed(2)}`
}

export const truncStr = (longStr: string, size?: number) => {
  const chosenSize = size || 10
  return longStr.length > chosenSize
    ? `${longStr.substring(0, chosenSize - 2)}...`
    : longStr
}
