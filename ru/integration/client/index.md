# Типизированный клиент

`@panomc/client` это небольшой JavaScript-клиент без зависимостей. Его функции генерируются из документов OpenAPI вашего Pano, то есть соответствуют установленным плагинам. Типы JSDoc, TypeScript не нужен.

## Скачайте

Из папки проекта:

```sh
bunx @panomc/client-gen pull --url http://localhost:8088 --out src/lib/pano
```

`pull` читает `/api/v1/openapi.json` и список пакетов плагинов, затем пишет:

```
src/lib/pano/core/                 по функции на операцию ядра
src/lib/pano/plugins/market/       то же для каждого активного плагина
src/lib/pano/plugins/index.json    плагин, версия и хеши
```

Добавьте `--plugin pano-plugin-name` для плагина без пакета UI. Ключ не нужен: всё, что читает `pull`, публично. Если Pano не отвечает, сообщение называет URL, который пробовали.

## Используйте

```js
import { createClient } from '@panomc/client';
import { getPosts } from './lib/pano/core/index.js';

const client = createClient({ baseUrl: 'http://localhost:8088' });

const result = await getPosts(client, { query: { page: 1, pageSize: 5 } });
if (result.ok) console.log(result.data.items);
else console.log(result.error.code);
```

- `baseUrl` это то, что стоит перед `/api/v1`: адрес Pano или префикс прокси, например `/pano`.
- Вызов никогда не бросает исключение при проблеме HTTP или сети. Он возвращает `{ ok: true, status, data }` или `{ ok: false, status, error }`. Сбой сети это `status: 0` и `error.code: 'NETWORK_ERROR'`.
- Нужны исключения? Оберните: `unwrap(result)` возвращает `data` или бросает `PanoApiError` с `code`, `status` и `fields`.
- Имена функций это `operationId` со строчной первой буквой: `GetPosts` становится `getPosts`.

## Параметры

| Параметр | Назначение |
|---|---|
| `frontendKey` | Только сервер. Отправляется как `X-Pano-Frontend-Key`. |
| `sessionToken` | Строка или функция. Отправляется как `Authorization: Bearer`. |
| `clientIp` | Адрес посетителя; отправляется только с ключом. |
| `locale` | Отправляется как `Accept-Language`. |
| `credentials` | `include` в браузере (cookie-сессия), в остальных случаях `omit`. |
| `csrf` | Для cookie-сессий по умолчанию `auto`: клиент получает и отправляет токен и один раз повторяет при `INVALID_CSRF_TOKEN`. Для Bearer `off`. |
| `onUnauthorized` | Вызывается при `401`. |

Сервер с ключом:

```js
const client = createClient({
  baseUrl: process.env.API_URL.replace(/\/api\/?$/, ''),
  frontendKey: process.env.PANO_FRONTEND_KEY,
  sessionToken: sessionFromCookie,
  clientIp: visitorIp
});
```

## Плагин без OpenAPI

Вызывайте любой путь вручную:

```js
await client.request({ method: 'GET', path: '/api/plugins/pano-plugin-x/things' });
```

## Держите в актуальном состоянии

Обновите Pano или плагин, затем посмотрите, что изменилось:

```sh
bunx @panomc/client-gen check --url http://localhost:8088 --dir src/lib/pano
```

Команда завершается с кодом 1 и перечисляет удалённые или изменённые операции. Для обновления снова выполните `pull`. Чтобы сгенерировать из сохранённого файла без запущенного Pano:

```sh
bunx @panomc/client-gen generate --input pano-openapi.json --out src/lib/pano/core
```

Устаревшие операции помечены `@deprecated`, поэтому редактор показывает их зачёркнутыми.
