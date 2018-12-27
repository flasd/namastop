# Namastop Functions

## Configuração

Antes de subir o projeto para o firebase, configure algumas variáveis de ambiente:

```
// Token do App do Slack
firebase functions:config:set slack.key="Bot User OAuth Access Token"

// Token para validar o cron
firebase functions:config:set cron.key="THE ACCESS TOKEN"
```