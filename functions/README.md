# Namastop Functions

## Configuração

Antes de subir o projeto para o firebase, configure algumas variáveis de ambiente:

```
// Token do App do Slack
firebase functions:config:set slack.key="Bot User OAuth Access Token"

// Token para validar o cron
firebase functions:config:set cron.key="THEACCESSTOKEN"
```

Abra `http://cron-job.org`, crie uma conta e configure um job para apontar para a url `https://namastop-app.firebaseapp.com/api/message?key=THEACCESSTOKEN`. Pronto!

