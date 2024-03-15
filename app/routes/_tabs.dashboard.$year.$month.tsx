import { defer, json, type LoaderFunctionArgs } from '@remix-run/server-runtime'
import {
  Await,
  useLoaderData,
  useNavigate,
  useParams,
  useRevalidator,
} from '@remix-run/react'
import { useTranslations } from 'use-intl'
import { TotalPerCategoriesChart } from '~/presentation/components/charts/chart-totals-per-categories'
import { TotalPerMonthsChart } from '~/presentation/components/charts/chart-totals-per-months'
import { DashboardIntervalSelect } from '~/presentation/components/feature/dashboard/dashboard-interval-select'
import {
  getUserExpensesInNumOfMonths,
  getUserInstallmentsPerCategoryInMonthYear,
  getUserTotalsPerCategoryInMonthYear,
} from '~/infra/models/expenses.server'
import { getLoggedUserId } from '~/infra/session.server'
import { IoArrowBack, IoArrowForward } from 'react-icons/io5'
import { Suspense, useContext } from 'react'
import { BeatLoader } from 'react-spinners'
import { CategoryContext } from '~/presentation/providers/category'

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
    const installmentsPerCategoryPromise =
      getUserInstallmentsPerCategoryInMonthYear(month, year, userId)
    const totalsPerAllCategoriesPromise = getUserTotalsPerCategoryInMonthYear(
      month,
      year,
      userId,
      -1,
    )

    return defer({
      totalsPerMonthInterval: totalsPerMonthIntervalPromise,
      totalsPerCategory: totalsPerCategoryPromise,
      installmentsPerCategory: installmentsPerCategoryPromise,
      totalsPerAllCategories: totalsPerAllCategoriesPromise,
    })
  }
  return json({
    totalsPerMonthInterval: null,
    totalsPerCategory: null,
    installmentsPerCategory: null,
    totalsPerAllCategories: null,
  })
}

export default function Dashboard() {
  const t = useTranslations()
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const {
    totalsPerMonthInterval,
    totalsPerCategory,
    installmentsPerCategory,
    totalsPerAllCategories,
  } = useLoaderData<typeof loader>()
  const params = useParams()
  const year = params.year ? parseInt(params.year) : new Date().getFullYear()
  const month = params.month ? parseInt(params.month) : new Date().getMonth()

  const { list: categories } = useContext(CategoryContext)

  const onChangeInterval = (newMonth: number, newYear: number) => {
    if (newMonth < 0) {
      navigate(`/dashboard/${newYear - 1}/11`)
    } else if (newMonth > 11) {
      navigate(`/dashboard/${newYear + 1}/0`)
    } else {
      navigate(`/dashboard/${newYear}/${newMonth}`)
    }
    revalidator.revalidate()
  }

  const chartClasses =
    'w-[90%] lg:w-[50%] xl:w-[33%] 2xl:w-[25%] flex flex-col aspect-square text-center items-center'

  const errorElement = (
    <div className="w-full h-full border rounded-xl border-error text-error font-semibold justify-center flex items-center">
      Error loading data
    </div>
  )

  const loaderElement = (
    <div className="w-full h-full border rounded-xl justify-center flex items-center">
      <BeatLoader />
    </div>
  )

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="grid gap-4 py-4 px-8 items-center grid-cols-1 sm:grid-cols-2 md:grid-cols-4-shrink">
        <h5 className="whitespace-nowrap">{t('dashboard.viewing-data-for')}</h5>
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
          <span className="block md:hidden">{t('common.previous')}</span>
        </button>
        <button
          className="btn btn-primary btn"
          onClick={() => onChangeInterval(month + 1, year)}
          disabled={month === 11 && year >= MAX_YEAR}
          aria-label={t('common.next-month')}
        >
          <IoArrowForward size={24} />
          <span className="block md:hidden">{t('common.next')}</span>
        </button>
      </div>
      <div className="flex flex-wrap w-full h-auto p-4 justify-center md:justify-start">
        <div className={chartClasses}>
          <h6 className="pb-4 font-bold">
            {t('dashboard.expenses-during-months')}
          </h6>
          <Suspense fallback={loaderElement}>
            <Await resolve={totalsPerMonthInterval} errorElement={errorElement}>
              {(data) => <TotalPerMonthsChart data={data ?? []} />}
            </Await>
          </Suspense>
        </div>
        {categories.length > 0 && (
          <div className={chartClasses}>
            <h6 className="pb-4 font-bold">
              {t('dashboard.categories-this-month')}
            </h6>
            <Suspense fallback={loaderElement}>
              <Await resolve={totalsPerCategory} errorElement={errorElement}>
                {(data) => (
                  <TotalPerCategoriesChart data={data ?? []} currency />
                )}
              </Await>
            </Suspense>
          </div>
        )}
        {categories.length > 0 && (
          <div className={chartClasses}>
            <h6 className="pb-4 font-bold">
              {t('dashboard.categories-installments-this-month')}
            </h6>
            <Suspense fallback={loaderElement}>
              <Await
                resolve={installmentsPerCategory}
                errorElement={errorElement}
              >
                {(data) => <TotalPerCategoriesChart data={data ?? []} />}
              </Await>
            </Suspense>
          </div>
        )}
      </div>
      {categories.length > 0 && (
        <div className="flex flex-col gap-4 w-full px-8 pb-8">
          <h4>{t('dashboard.total-amount-per-categories')}</h4>
          <div className="w-full aspect-square md:aspect-4/1">
            <Suspense fallback={loaderElement}>
              <Await
                resolve={totalsPerAllCategories}
                errorElement={errorElement}
              >
                {(data) => (
                  <>
                    <div className="h-full hidden md:block">
                      <TotalPerCategoriesChart data={data ?? []} currency />
                    </div>
                    <div className="h-full block md:hidden">
                      <TotalPerCategoriesChart
                        data={data ?? []}
                        currency
                        vertical
                      />
                    </div>
                  </>
                )}
              </Await>
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}
