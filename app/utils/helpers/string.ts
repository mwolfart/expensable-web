export const formatCurrency = (amount: number) => {
  const currency = 'R$'
  return `${currency} ${amount.toFixed(2)}`
}

export const trimStr = (longStr: string) =>
  longStr.length > 10 ? `${longStr.substring(0, 8)}...` : longStr
