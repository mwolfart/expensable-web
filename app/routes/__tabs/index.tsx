import type { LoaderArgs } from '@remix-run/server-runtime'
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
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { getUserExpenseTotalByMonthYear } from '~/models/expenses.server'
import { getUserId } from '~/session.server'
import { getMonthName } from '~/utils'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  if (userId) {
    const currentMonthYear = {
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    }
    const previousMonthYears = [...Array(6).keys()]
      .map((i) => {
        const subtractedMonth = currentMonthYear.month - i
        const month =
          subtractedMonth < 0 ? 11 - (1 + subtractedMonth) : subtractedMonth
        const year =
          subtractedMonth < 0
            ? currentMonthYear.year - 1
            : currentMonthYear.year
        return {
          month,
          year,
        }
      })
      .reverse()
    const totalsPerMonthYearPromises = previousMonthYears.map((monthYear) =>
      getUserExpenseTotalByMonthYear(userId, monthYear.month, monthYear.year),
    )
    const totalsPerMonthRaw = await Promise.all(totalsPerMonthYearPromises)
    const totalsPerMonth = totalsPerMonthRaw.map(({ _sum }, i) => {
      const period = new Date()
      period.setMonth(previousMonthYears[i].month)
      period.setFullYear(previousMonthYears[i].year)
      return {
        period: `${getMonthName(period.getMonth())} ${period.getFullYear()}`,
        total: _sum.amountEffective
          ? parseFloat(_sum.amountEffective.toFixed(2))
          : 0,
      }
    })
    return typedjson({ totalsPerMonth })
  }
  return typedjson({ totalsPerMonth: [] })
}

export default function Dashboard() {
  const { totalsPerMonth } = useTypedLoaderData<typeof loader>()
  // Transactions in the past month
  // Category with the most amount in current month
  // Category with the most amount in last month
  return (
    <div className="h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={300}
          data={totalsPerMonth}
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
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            name="Total amount"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
