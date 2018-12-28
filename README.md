# Namastop

### Setup

Para configurar seu app Namastop em um Team do Slack, abra [https://api.slack.com/apps](https://api.slack.com/apps) e crie seu app. Selecione seu app, clique em `Add features and functionality`, selecione `Bots` e crie seu bot.olte uma página e clique novamente em `Add features and functionality` e selecione `Permissions`. Desça até `Scopes` e busque por `Bot` e `Commands. Salve as alterações. Na mesma página, copie`Bot User OAuth Access Token`.

Agora, abra seu terminal e siga os passos a seguir:

```
git clone https://github.com/flasd/namastop.git
...

cd namastop

npm install
...

cd functions

npm install
...

cd ..

// Substitua BotUserOAuthAccessToken pelo token copiado anteriormente
firebase functions:config:set slack.key="BotUserOAuthAccessToken"
...

// Crie um token aleatório em https://bit.ly/2QVtOkL e coloque-o no lugar de TheAccessToken
firebase functions:config:set cron.key="TheAccessToken"
...

npm run build
...

firebase deploy
```

Agora abra `http://cron-job.org`, crie uma conta e configure um CronJob para apontar para a url `https://namastop-app.firebaseapp.com/api/message?key=TheAccessToken`. (Lembre se substituir TheAccessToken pelo token criado anteriormente).

Pronto!

### Copyright & License

Copyright (c) 2019 [Marcel de Oliveira Coelho](https://github.com/flasd) sob a [Licença MIT](https://github.com/husscode/cpf-check/blob/master/LICENSE.md). Go Crazy. :rocket: