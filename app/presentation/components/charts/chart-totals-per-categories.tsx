import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Text,
} from 'recharts'
import { useTranslations } from 'use-intl'

type Props = {
  data: { categoryName: string; total: number }[]
  currency?: boolean
  vertical?: boolean
}

type TickProps = {
  x: number
  y: number
  payload: {
    value: string
  }
}

const barColors = [
  '#1f78b4',
  '#33a02c',
  '#e31a1c',
  '#ff7f00',
  '#6a3d9a',
  '#b15928',
  '#a6cee3',
  '#b2df8a',
  '#fb9a99',
  '#fdbf6f',
  '#cab2d6',
  '#ffff99',
  '#636363',
  '#525252',
  '#d9d9d9',
  '#969696',
  '#bdbdbd',
  '#74c476',
  '#8c564b',
  '#c7c7c7',
]

const tickFormatter = (value: string) => {
  if (value.length < 10) {
    return value
  }
  return `${value.substring(0, 10)}...`
}

const CustomYAxisTick = ({ x, y, payload }: TickProps) => {
  if (payload && payload.value) {
    return (
      <Text width={75} x={x} y={y} textAnchor="end" verticalAnchor="middle">
        {payload.value}
      </Text>
    )
  }
  return null
}

export function TotalPerCategoriesChart({ data, currency, vertical }: Props) {
  const t = useTranslations()
  return (
    <ResponsiveContainer width="90%" height="90%">
      {data?.length > 0 ? (
        <BarChart
          width={500}
          height={300}
          data={data}
          layout={vertical ? 'vertical' : 'horizontal'}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {vertical ? (
            <>
              <XAxis hide axisLine={false} type="number" />
              <YAxis
                type="category"
                width={150}
                dataKey="categoryName"
                tickFormatter={tickFormatter}
                tick={(props) => <CustomYAxisTick {...props} />}
              />
            </>
          ) : (
            <>
              <XAxis dataKey="categoryName" />
              <YAxis />
            </>
          )}
          <Tooltip
            formatter={(value) => {
              if (typeof value === 'number' && currency) {
                return `R$ ${value.toFixed(2)}`
              }
              return value
            }}
          />
          <Legend />
          <Bar dataKey="total" fill="#475569" legendType="none" name="Total">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={barColors[index % 20]} />
            ))}
          </Bar>
        </BarChart>
      ) : (
        <div className="h-full p-8">
          <div className="h-full flex items-center justify-center border border-primary rounded-xl text-primary p-16">
            {t('dashboard.no-data')}
          </div>
        </div>
      )}
    </ResponsiveContainer>
  )
}
