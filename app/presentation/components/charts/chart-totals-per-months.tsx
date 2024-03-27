import { useTranslation } from 'react-i18next'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  data: { period: string; total: number }[]
}

export function TotalPerMonthsChart({ data }: Props) {
  const { t } = useTranslation()
  const dataWithTranslatedMonths = data.map(({ period, total }) => {
    const monthYear = period.split(' ')
    return {
      period: [t(`common.month.${monthYear[0]}`), monthYear[1]].join(' '),
      total,
    }
  })
  return (
    <ResponsiveContainer width="90%" height="90%">
      <LineChart
        width={500}
        height={300}
        data={dataWithTranslatedMonths}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip
          formatter={(value) => {
            if (typeof value === 'number') {
              return `R$ ${value.toFixed(2)}`
            }
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="total"
          name={t('dashboard.amount-of-expenses')}
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
