import type { LoaderArgs } from '@remix-run/server-runtime'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { useTranslations } from 'use-intl'
import { TotalPerPreviousMonthsChart } from '~/components/charts/chart-previous-months'
import {
  getUserExpensesInPreviousMonths,
  getUserExpensesInUpcomingMonths,
} from '~/models/expenses.server'
import { getUserId } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  if (userId) {
    const totalsPerPreviousMonthsPromise = getUserExpensesInPreviousMonths(
      userId,
      6,
    )
    const totalsPerUpcomingMonthsPromise = getUserExpensesInUpcomingMonths(
      userId,
      6,
    )
    const totalsPerPreviousMonths = await totalsPerPreviousMonthsPromise
    const totalsPerUpcomingMonths = await totalsPerUpcomingMonthsPromise
    return typedjson({ totalsPerPreviousMonths, totalsPerUpcomingMonths })
  }
  return typedjson({ totalsPerPreviousMonths: [], totalsPerUpcomingMonths: [] })
}

export default function Dashboard() {
  const { totalsPerPreviousMonths, totalsPerUpcomingMonths } =
    useTypedLoaderData<typeof loader>()
  const t = useTranslations()
  // Category with the most amount in current month
  // Category with the most amount in last month
  return (
    <div className="flex flex-wrap w-full h-auto p-4">
      <div className="w-[600px] h-[400px] text-center">
        <h4 className="pb-4">{t('dashboard.previous-months')}</h4>
        <TotalPerPreviousMonthsChart data={totalsPerPreviousMonths} />
      </div>
      <div className="w-[600px] h-[400px] text-center">
        <h4 className="pb-4">{t('dashboard.upcoming-months')}</h4>
        <TotalPerPreviousMonthsChart data={totalsPerUpcomingMonths} />
      </div>
    </div>
  )
}
