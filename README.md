# Reddit Clone

## Description
A Nest.js API for Reddit Clone.

## Installation

```bash
$ npm install
```

## Environment variables
```bash
# Create .env and .env.test files according to .env.example
$ cp .env.example .env
$ cp .env.example .env.test
```
> `.env.test` is used for e2e tests.

## Database
```bash
# Create and run database
$ npm run db:dev:up

# Apply migrations
$ npx prisma migrate dev
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


## License

Nest is [MIT licensed](LICENSE).
