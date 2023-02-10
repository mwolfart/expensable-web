export type NewUser = {
  email: string
  name: string
  password: string
  passwordCheck: string
}

export const newUserReducer = (state: NewUser, action: Partial<NewUser>) => ({
  ...state,
  ...action,
})
