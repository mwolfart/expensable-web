import type { ActionArgs, MetaFunction, TypedResponse } from '@remix-run/node'
import { json } from '@remix-run/node'
import { createUser, getUserByEmail } from '~/models/user.server'
import { useTranslations } from 'use-intl'
import {
  Form,
  useActionData,
  useNavigate,
  useOutletContext,
} from '@remix-run/react'
import { useEffect, useReducer, useState } from 'react'
import { AuthContext } from '../__auth'
import { cxFormInput, cxWithGrowFadeMd, getYupErrors } from '~/utils'
import { useErrorMessages } from '~/hooks'
import { ErrorCodes, userSchema } from '~/utils/schemas'
import { timeout } from '~/utils/timeout'

type FormErrors = {
  email?: string
  name?: string
  password?: string
}

const errorsReducer = (state: FormErrors, action: FormErrors) => ({
  ...state,
  ...action,
})

export async function action({
  request,
}: ActionArgs): Promise<
  TypedResponse<{ errors?: FormErrors; success?: boolean }>
> {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const passwordConfirmation = formData.get('passwordConfirmation') as string
  const name = formData.get('name') as string
  // const redirectTo = safeRedirect(formData.get('redirectTo'), '/')

  try {
    await userSchema.validate({ email, password, name }, { abortEarly: false })
  } catch (e: any) {
    const errors = getYupErrors(e)
    console.log(errors)
    return json({ errors }, { status: 400 })
  }

  if (passwordConfirmation !== password) {
    return json(
      { errors: { password: ErrorCodes.PASSWORD_MISMATCH } },
      { status: 400 },
    )
  }

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return json(
      { errors: { email: ErrorCodes.DUPLICATE_USER } },
      { status: 400 },
    )
  }

  try {
    await createUser(email, password, name)
  } catch (_) {
    return json({ success: false }, { status: 500 })
  }
  return json({ success: true }, { status: 400 })

  // return createUserSession({
  //   request,
  //   userId: user.id,
  //   remember: false,
  //   redirectTo,
  // })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Sign Up',
  }
}

export default function CreateUser() {
  const t = useTranslations()
  const navigate = useNavigate()
  const [transition] = useOutletContext<AuthContext>()
  const actionData = useActionData<typeof action>()
  const { errorToString } = useErrorMessages()
  const [showConfirmation, setConfirmation] = useState(false)

  const initialErrors = {
    email: '',
    name: '',
    password: '',
    duplicate: '',
  }

  const [userErrors, updateUserErrors] = useReducer(
    errorsReducer,
    initialErrors,
  )

  useEffect(() => {
    const parseAction = async () => {
      if (actionData?.errors) {
        updateUserErrors({
          email: errorToString(actionData.errors.email),
          name: errorToString(actionData.errors.name),
          password: errorToString(actionData.errors.password),
        })
      } else if (actionData?.success) {
        setConfirmation(true)
        await timeout(5000)
        setConfirmation(false)
      }
    }
    parseAction()
  }, [actionData])

  const onGoToLogin = async () => {
    await transition()
    navigate('/login')
  }

  return (
    <Form method="post" className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold">{t('auth.create-account')}</h2>
        <p>{t('auth.enter-data')}</p>
      </div>
      <input
        type="email"
        name="email"
        placeholder={userErrors.email || t('common.email')}
        className={cxFormInput({ hasError: Boolean(userErrors.email) })}
        onChange={() => updateUserErrors({ email: '' })}
      />
      <input
        name="name"
        placeholder={userErrors.name || t('common.name')}
        className={cxFormInput({ hasError: Boolean(userErrors.name) })}
        onChange={() => updateUserErrors({ name: '' })}
      />
      <input
        type="password"
        name="password"
        placeholder={userErrors.password || t('common.password')}
        className={cxFormInput({ hasError: Boolean(userErrors.password) })}
        onChange={() => updateUserErrors({ password: '' })}
      />
      <input
        type="password"
        name="passwordConfirmation"
        placeholder={userErrors.password || t('common.password-check')}
        className={cxFormInput({ hasError: Boolean(userErrors.password) })}
        onChange={() => updateUserErrors({ password: '' })}
      />
      <p className={cxWithGrowFadeMd('', showConfirmation)}>
        {t('auth.account-created')}
      </p>
      <div className="flex flex-col gap-4">
        <button className="btn-primary btn" type="submit">
          {t('common.submit')}
        </button>
        <button className="btn-link btn" type="button" onClick={onGoToLogin}>
          {t('auth.already-have-account')}
        </button>
      </div>
    </Form>
  )
}
