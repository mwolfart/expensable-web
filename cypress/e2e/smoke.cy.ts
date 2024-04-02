import { faker } from '@faker-js/faker'
import * as i18n from '../../public/locales/en/common.json'

describe('smoke tests', () => {
  // afterEach(() => {
  //   cy.cleanupUser()
  // })

  it('should allow you to register and login', () => {
    const account = {
      email: `${faker.internet.userName()}@example.com`,
      name: faker.person.fullName(),
      password: faker.internet.password({
        prefix: 'aA2#',
      }),
    }

    cy.intercept('POST', /\/create-user.*/, (req) => {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          error: null,
        },
      })
    }).as('createUser')

    cy.visit('/')
    cy.location('pathname').should('eq', '/login')
    // Wait page load
    cy.wait(1000)

    cy.findByRole('button', { name: i18n.auth['create-account'] }).click()
    cy.location('pathname').should('eq', '/create-user')
    cy.get('input[name="email"]').type(account.email)
    cy.get('input[name="name"]').type(account.name)
    cy.get('input[name="password"]').type(account.password)
    cy.get('input[name="passwordConfirmation"]').type(account.password)
    cy.get('button[type="submit"]').click()

    cy.wait('@createUser').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200)
      expect(interception.response?.body?.success).to.equal(true)

      cy.findByRole('button', {
        name: i18n.auth['already-have-account'],
      }).click()
      cy.location('pathname').should('eq', '/login')
    })
  })

  // it('should allow you to make a note', () => {
  //   const testNote = {
  //     title: faker.lorem.words(1),
  //     body: faker.lorem.sentences(1),
  //   }
  //   cy.login()

  //   cy.visitAndCheck('/')

  //   cy.findByRole('link', { name: /notes/i }).click()
  //   cy.findByText('No notes yet')

  //   cy.findByRole('link', { name: /\+ new note/i }).click()

  //   cy.findByRole('textbox', { name: /title/i }).type(testNote.title)
  //   cy.findByRole('textbox', { name: /body/i }).type(testNote.body)
  //   cy.findByRole('button', { name: /save/i }).click()

  //   cy.findByRole('button', { name: /delete/i }).click()

  //   cy.findByText('No notes yet')
  // })
})
