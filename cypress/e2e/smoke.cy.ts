import { faker } from '@faker-js/faker'
import { i18n } from '../../app/constants'

describe('smoke tests', () => {
  afterEach(() => {
    cy.cleanupUser()
  })

  it('should allow you to register and login', () => {
    const account = {
      email: `${faker.internet.userName()}@example.com`,
      name: faker.person.fullName(),
      password: faker.internet.password(),
    }

    cy.visit('/')
    cy.location('pathname').should('eq', '/login')

    cy.findByRole('button', { name: i18n.en.auth['create-account'] }).click()
    cy.location('pathname').should('eq', '/create-user')
    cy.get('input[name="email"]').type(account.email)
    cy.get('input[name="name"]').type(account.name)
    cy.get('input[name="password"]').type(account.password)
    cy.get('button[type="submit"]').click()
    // TODO continue

    cy.get('input[type="email"]').type(loginForm.email)
    cy.get('input[type="password"]').type(loginForm.password)
    cy.get('button[type="submit"]').click()

    cy.location('pathname').should('eq', '/')
    cy.findByRole('button', { name: i18n.en.common.logout }).click()
    cy.location('pathname').should('eq', '/login')
  })

  it('should allow you to make a note', () => {
    const testNote = {
      title: faker.lorem.words(1),
      body: faker.lorem.sentences(1),
    }
    cy.login()

    cy.visitAndCheck('/')

    cy.findByRole('link', { name: /notes/i }).click()
    cy.findByText('No notes yet')

    cy.findByRole('link', { name: /\+ new note/i }).click()

    cy.findByRole('textbox', { name: /title/i }).type(testNote.title)
    cy.findByRole('textbox', { name: /body/i }).type(testNote.body)
    cy.findByRole('button', { name: /save/i }).click()

    cy.findByRole('button', { name: /delete/i }).click()

    cy.findByText('No notes yet')
  })
})
