# Разработка с агентом

Как поручить ИИ-агенту плагин, тему или headless-сайт для Pano. Схема каждый раз одна: начните с официальной заготовки, дайте агенту прочитать руководство для агентов, просите по одной вещи за раз, запускайте проверки, проверяйте вручную.

## Руководство для агентов

Правила Pano для агентов лежат в папке `agent-guide/`: короткий `README.md`, который направляет по задаче («создание нового плагина», «смена вида без правки разметки», «headless-фронтенд»...), и по одному небольшому файлу на задачу. Файлы `AGENTS.md` и `CLAUDE.md` в корне репозитория говорят агенту сначала прочитать этот README, а затем только файл своей задачи.

| Репозиторий | Есть ли в нём руководство |
|---|---|
| [`PanoMC/pano-starter-sveltekit`](https://github.com/PanoMC/pano-starter-sveltekit) (стартовый шаблон headless) | да, и `client-gen new` копирует его в ваш проект |
| [`PanoMC/pano-boilerplate-plugin`](https://github.com/PanoMC/pano-boilerplate-plugin) (шаблон плагина) | да, вместе с `design/` для страниц панели |
| [`PanoMC/vanilla-theme`](https://github.com/PanoMC/vanilla-theme) (тема по умолчанию) | да |
| [`PanoMC/sdk`](https://github.com/PanoMC/sdk) | источник руководства |

Команды создания плагина и темы не записывают эти файлы в новый проект. Скопируйте их один раз:

```sh
git clone --depth 1 https://github.com/PanoMC/pano-boilerplate-plugin /tmp/pano-boilerplate
cp -r /tmp/pano-boilerplate/agent-guide /tmp/pano-boilerplate/design my-plugin/    # a plugin
cp -r /tmp/pano-boilerplate/agent-guide my-theme/                                  # a theme
```

После этого начинайте запросы словами «Сначала прочитай `agent-guide/README.md`» или запишите эту фразу в свой `AGENTS.md`.

## Плагин {#plugin}

Начните, как описано в разделе [Начало работы с аддоном](../../addon/getting-started/): Pano работает локально, режим разработки включён:

```sh
cd <your-pano>/plugins && bunx @panomc/plugin-kit new my-plugin
cd my-plugin && bun run dev
```

Примеры запросов:

```text
Сначала прочитай agent-guide/README.md. Добавь страницу сайта по адресу /my-plugin/rules со
списком правил сервера. Храни правила в собственной таблице плагина и добавь эндпоинт,
который их отдаёт.
```

```text
Сначала прочитай agent-guide/README.md. Добавь страницу панели, где администратор может
добавлять, изменять и удалять правила; защити её правом этого плагина. Следуй design/README.md.
```

```text
Перенеси все тексты этого плагина в src/main/resources/locales/ и добавь русский перевод.
```

Проверьте результат: `bun run check` (или `bunx pano-plugin check --strict`), затем `./gradlew build`. Чтобы увидеть изменения в Kotlin, нужны `./gradlew build -Pnoui` и перезапуск Pano.

## Тема {#theme}

Начните, как описано в разделе [Начало работы с темой](../../theme/getting-started/):

```sh
bunx @panomc/theme-core new my-theme
cd my-theme && bun install && bun run dev:ui
```

Примеры запросов:

```text
Сначала прочитай agent-guide/README.md. Сделай эту тему тёмной с зелёным акцентом.
Меняй только src/styles/tokens.scss и src/styles/style.scss; не делай eject ни одного view.
```

```text
Сначала прочитай agent-guide/README.md. Замени главную страницу лендингом: блок с адресом
сервера, затем три последние записи. Сохрани все слоты плагинов.
```

```text
Измени вид карточки товара плагина market под эту тему. Выбери самый дешёвый шаг,
который работает, и скажи, какой именно ты выбрал.
```

Проверьте результат: `bunx @panomc/theme-core check --strict`, `bun run build`, и откройте `<адрес вашего Pano>/__pano/views`, чтобы увидеть каждый view с примерами данных.

## Headless-фронтенд {#headless-front-end}

Начните, как описано в разделе [Быстрый старт фронтенда (headless)](../../integration/headless/). В этой заготовке уже есть `AGENTS.md`, `CLAUDE.md` и `agent-guide/`:

```sh
bunx @panomc/client-gen new my-site --url http://localhost:8088
cd my-site && bun run dev
```

Примеры запросов:

```text
Сначала прочитай AGENTS.md. Добавь страницу /servers со списком серверов Minecraft этого Pano
и числом игроков онлайн. Используй сгенерированный клиент в src/lib/pano и не правь его.
```

```text
Запусти bun run pano:pull, затем добавь страницу магазина на операциях плагина market.
```

Проверьте результат: `bun run check`, `bun test`, `bun run build`. `bun run package` собирает zip, который загружается как «Загруженный мной сайт».

## Проверьте вручную перед релизом

- **Запустите.** Зелёная проверка ещё не значит, что плагин или тема работают. Откройте страницу в Pano с включённым режимом разработки, в том числе на ширине телефона.
- **Прочитайте diff.** Ищите правки в сгенерированных папках (в теме `src/routes/`, `src/lib/`, `lang/`; в плагине `src/main/resources/plugin-ui/`; в headless-сайте `src/lib/pano/`), файлы TypeScript и изменённую версию `svelte`. Руководство запрещает всё это.
- **Плагины:** права на каждом эндпоинте панели, проверка входных данных и то, что плагин пишет только в свои таблицы. `pluginId` нельзя менять после первого релиза.
- **Секреты:** в коде и в коммите не должно быть ключа фронтенда, лицензионного ключа или пароля.
- **Версии и релизы:** агент не должен поднимать версию, ставить тег или делать push. Релизы получаются из ваших сообщений коммитов: см. [Сборка и публикация](../../addon/publishing/) и [Публикация и Premium](../../theme/publishing/).
