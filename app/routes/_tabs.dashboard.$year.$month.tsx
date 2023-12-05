import { json, type LoaderFunctionArgs } from '@remix-run/server-runtime'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { useTranslations } from 'use-intl'
import { TotalPerCategoriesChart } from '~/presentation/components/charts/chart-totals-per-categories'
import { TotalPerMonthsChart } from '~/presentation/components/charts/chart-totals-per-months'
import { DashboardIntervalSelect } from '~/presentation/components/dashboard-interval-select'
import {
  getUserExpensesInNumOfMonths,
  getUserTotalsPerCategoryInMonthYear,
} from '~/infra/models/expenses.server'
import { getLoggedUserId } from '~/infra/session.server'
import { IoArrowBack, IoArrowForward } from 'react-icons/io5'

const MIN_YEAR = 2003
const MAX_YEAR = 2053

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await getLoggedUserId(request)
  const month =
    typeof params.month === 'string'
      ? parseInt(params.month)
      : new Date().getMonth()
  const year =
    typeof params.year === 'string'
      ? parseInt(params.year)
      : new Date().getFullYear()

  if (userId) {
    const startDate = new Date()
    startDate.setFullYear(year, month - 3, 1)
    startDate.setHours(0, 0, 0, 0)
    const totalsPerMonthIntervalPromise = getUserExpensesInNumOfMonths(
      userId,
      startDate,
      6,
    )
    const totalsPerCategoryPromise = getUserTotalsPerCategoryInMonthYear(
      month,
      year,
      userId,
    )
    const totalsPerMonthInterval = await totalsPerMonthIntervalPromise
    const totalsPerCategory = await totalsPerCategoryPromise
    return json({
      totalsPerMonthInterval,
      totalsPerCategory,
    })
  }
  return json({
    totalsPerMonthInterval: [],
    totalsPerCategory: [],
  })
}

export default function Dashboard() {
  const t = useTranslations()
  const navigate = useNavigate()
  const { totalsPerMonthInterval, totalsPerCategory } =
    useLoaderData<typeof loader>()
  const params = useParams()
  const year = params.year ? parseInt(params.year) : new Date().getFullYear()
  const month = params.month ? parseInt(params.month) : new Date().getMonth()

  const onChangeInterval = (newMonth: number, newYear: number) => {
    if (newMonth < 0) {
      navigate(`/dashboard/${newYear - 1}/11`)
    } else if (newMonth > 11) {
      navigate(`/dashboard/${newYear + 1}/0`)
    } else {
      navigate(`/dashboard/${newYear}/${newMonth}`)
    }
  }

  const chartClasses =
    'w-[90%] lg:w-[50%] xl:w-[33%] 2xl:w-[25%] flex flex-col aspect-square text-center items-center'

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex gap-4 py-4 px-8 items-center">
        <h5>{t('dashboard.viewing-data-for')}</h5>
        <DashboardIntervalSelect
          onChangeInterval={onChangeInterval}
          year={year}
          month={month}
        />
        <button
          className="btn btn-primary btn"
          onClick={() => onChangeInterval(month - 1, year)}
          disabled={month === 0 && year <= MIN_YEAR}
          aria-label={t('common.previous-month')}
        >
          <IoArrowBack size={24} />
        </button>
        <button
          className="btn btn-primary btn"
          onClick={() => onChangeInterval(month + 1, year)}
          disabled={month === 11 && year >= MAX_YEAR}
          aria-label={t('common.next-month')}
        >
          <IoArrowForward size={24} />
        </button>
      </div>
      <div className="flex flex-wrap w-full h-auto p-4">
        <div className={chartClasses}>
          <h6 className="pb-4 font-bold">
            {t('dashboard.expenses-during-months')}
          </h6>
          <TotalPerMonthsChart data={totalsPerMonthInterval} />
        </div>
        <div className={chartClasses}>
          <h6 className="pb-4 font-bold">
            {t('dashboard.categories-this-month')}
          </h6>
          <TotalPerCategoriesChart data={totalsPerCategory} />
        </div>
      </div>
    </div>
  )
}
