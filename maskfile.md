# Tasks

## install

```bash
yarn install
```

## serve

```bash
yarn serve
```

## deploy

```bash
yarn build
apex deploy \
  -s clientId=$clientId \
  -s clientSecret=$clientSecret \
  -s verificationToken=$verificationToken \
  -s clientSigningSecret=$clientSigningSecret \
  -s botToken=$botToken \
  bot
```

## invoke

```bash
apex invoke hello
```
