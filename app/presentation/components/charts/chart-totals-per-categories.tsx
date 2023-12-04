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
} from 'recharts'
import { useTranslations } from 'use-intl'

type Props = {
  data: { categoryName: string; total: number }[]
}

const barColors = [
  '#6c7eba',
  '#6cbab0',
  '#6cbd70',
  '#c9b475',
  '#bd774f',
  '#c93838',
]

export function TotalPerCategoriesChart({ data }: Props) {
  const t = useTranslations()
  return (
    <ResponsiveContainer width="90%" height="90%">
      {data?.length > 0 ? (
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="categoryName" />
          <YAxis />
          <Tooltip
            formatter={(value) => {
              if (typeof value === 'number') {
                return `R$ ${value.toFixed(2)}`
              }
            }}
          />
          <Legend />
          <Bar dataKey="total" fill="#475569" legendType="none" name="Total">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={barColors[index % 10]} />
            ))}
          </Bar>
        </BarChart>
      ) : (
        <div className="h-full p-8">
          <div className="h-full flex items-center border border-primary rounded-xl text-primary p-16">
            {t('dashboard.no-data')}
          </div>
        </div>
      )}
    </ResponsiveContainer>
  )
}
