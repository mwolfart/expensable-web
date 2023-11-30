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
  return (
    <ResponsiveContainer width="100%" height="100%">
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
        <Tooltip />
        <Legend />
        <Bar dataKey="total" fill="white" legendType="none">
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={barColors[index % 10]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
