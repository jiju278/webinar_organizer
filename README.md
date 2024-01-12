# Description of the project

- Feature: Organize a webinar
  - It should be organized at least 3 days before
  - The maximum number of participant is 1000 and the minimum is 1
- Feature: Change the number of seats. **Action reserved to the organiser**
  - The number of seats must be higher than before changing
  - The maximum number of seats is between 1 and 1000
- Feature: Change the date. **Action reserved to the organiser**
  - At least 3 days before
  - Send email to all the participants

# Installation

```bash
$ pnpm install
```

# Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

# Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
