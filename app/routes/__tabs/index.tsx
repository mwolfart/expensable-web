import type { LoaderArgs } from '@remix-run/server-runtime'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { useTranslations } from 'use-intl'
import { TotalPerCategoriesChart } from '~/components/charts/chart-totals-per-categories'
import { TotalPerMonthsChart } from '~/components/charts/chart-totals-per-months'
import {
  getUserExpensesInPreviousMonths,
  getUserExpensesInUpcomingMonths,
  getUserTotalsPerCategoryInCurrentMonth,
  // getUserTotalsPerCategoryInLastMonth,
} from '~/models/expenses.server'
import { getLoggedUserId } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
  const userId = await getLoggedUserId(request)
  if (userId) {
    const totalsPerPreviousMonthsPromise = getUserExpensesInPreviousMonths(
      userId,
      6,
    )
    const totalsPerUpcomingMonthsPromise = getUserExpensesInUpcomingMonths(
      userId,
      6,
    )
    const totalsPerCategoryCurrentMonthPromise =
      getUserTotalsPerCategoryInCurrentMonth(userId)
    const totalsPerCategoryLastMonth = [{}]
    // getUserTotalsPerCategoryInLastMonth(userId)
    const totalsPerPreviousMonths = await totalsPerPreviousMonthsPromise
    const totalsPerUpcomingMonths = await totalsPerUpcomingMonthsPromise
    const totalsPerCategoryCurrentMonth =
      await totalsPerCategoryCurrentMonthPromise
    return typedjson({
      totalsPerPreviousMonths,
      totalsPerUpcomingMonths,
      totalsPerCategoryCurrentMonth,
      totalsPerCategoryLastMonth,
    })
  }
  return typedjson({
    totalsPerPreviousMonths: [],
    totalsPerUpcomingMonths: [],
    totalsPerCategoryCurrentMonth: [],
    totalsPerCategoryLastMonth: [],
  })
}

export default function Dashboard() {
  const {
    totalsPerPreviousMonths,
    totalsPerUpcomingMonths,
    totalsPerCategoryCurrentMonth,
  } = useTypedLoaderData<typeof loader>()
  const t = useTranslations()
  const chartClasses =
    'w-[90%] lg:w-[50%] xl:w-[33%] 2xl:w-[25%] aspect-square text-center'
  return (
    <div className="flex flex-wrap w-full h-auto p-4">
      <div className={chartClasses}>
        <h4 className="pb-4">{t('dashboard.previous-months')}</h4>
        <TotalPerMonthsChart data={totalsPerPreviousMonths} />
      </div>
      <div className={chartClasses}>
        <h4 className="pb-4">{t('dashboard.upcoming-months')}</h4>
        <TotalPerMonthsChart data={totalsPerUpcomingMonths} />
      </div>
      <div className={chartClasses}>
        <h4 className="pb-4 text-md">{t('dashboard.categories-current')}</h4>
        <TotalPerCategoriesChart data={totalsPerCategoryCurrentMonth} />
      </div>
    </div>
  )
}
