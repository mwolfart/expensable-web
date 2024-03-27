# Expensable

This is an online tool created to manage expenses and savings. The user can log all of their daily expenses, assign them to custom categories and view a monthly or periodic dashboard in order to keep track of financial goals.

The project was designed using Remix, Prisma, MongoDB and TailwindCSS. The main goals here were to A) replace a set of spreadsheets I was using to keep track of my expenses and B) learn Remix and acquire a little bit of experience with MongoDB.

The website is accessible through the URL https://expensable.vercel.app/

# Usage

In order to use the tool one can create an account through the basic auth form.
For demo purposes, you can also use the account of username `john.doe.93269020@mailinator.com` and password `Test123!`. This account should already contain some data for you to see.

The application consists of three basic data lists, with CRUD support, and a dashboard. Users can create varying expenses (individual items), fixed expenses, categories (to be used within expenses) and transactions (groups of expenses). The dashboard shows monthly graphs for the data inserted.

# Tasks - Mar/24
F: Feature
E: Extension
B: Bug
T: Testing
R: Refactor

- [ ] T 5 P1 Integration + E2E testing w/ Cypress
- [ ] T 2 P1 Further tests on transactions: items with installments, items without categories, delete individual expense after transaction create
- [ ] E 3 P1 Include fixed expenses on categories fetch for dashboard
- [ ] E 4 P2 Add loaders
- [ ] E 2 P2 Include current expense on upcoming expenses in fixed expenses tab
- [ ] B 4 P5 Fix hydration bugs with i18next

# Credits

Favicon - https://www.freepik.com/; https://www.flaticon.com/