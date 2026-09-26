# Запуск Pano в контейнерах

Pano может работать в контейнере — так же, как [Pano Host](https://panomc.com/host) запускает каждый
Pano Instance. На этой странице — образы и быстрый старт. [Конфигурация](configuration/) описывает
переменные окружения и том `/data`, [Среда выполнения](runtime/) — режим контейнера, Java и память.

> [!WARNING]
> **Ещё не выпущено.** Образы и режим контейнера пока в разработке и не входят ни в один релиз Pano.
> Названия образов и поведение на этих страницах соответствуют текущему плану и могут измениться до
> релиза. До тех пор устанавливайте Pano через [`.jar`](../installation/).

## Образы

CI Pano публикует в GitHub Container Registry два семейства образов:

| Образ | Содержит | Когда использовать |
| --- | --- | --- |
| `ghcr.io/panomc/pano:<version>` | Среду Java **и** этот релиз Pano | Нужен готовый к запуску Pano в Docker |
| `ghcr.io/panomc/pano-runtime:jre<N>` | Java `N` и лаунчер, **без** Pano | Jar и UI Pano хранятся в вашем собственном томе |

- `<version>` — версия релиза Pano, как на [GitHub Releases](https://github.com/PanoMC/Pano/releases).
- `<N>` — версия Java. В семействе runtime **всегда** есть минимальная для Pano `jre11` и более новые
  версии Java. См. [Версия Java](runtime/#java-version).
- Образы runtime **мультиархитектурные** (amd64 и arm64), работают от **непривилегированного**
  пользователя и собраны на базе **glibc**. См. [Среда выполнения](runtime/).

С `pano-runtime` релиз Pano (jar + UI) лежит в томе `/data`, а не в образе. Смена версии Pano — это
замена файлов в `/data`; обновления из панели тоже пишутся в `/data` и переживают перезапуск контейнера.
Pano Host работает именно так.

## Быстрый старт

1. Создайте папку для данных Pano и положите в неё jar Pano:

   ```bash
   mkdir pano && cd pano
   # скачайте Pano-<version>.jar с https://panomc.com/download в эту папку
   echo "Pano-<version>.jar" > .pano-jar
   ```

   `.pano-jar` содержит **имя файла** jar, который нужно запустить. См. [Режим контейнера](runtime/#container-mode).

2. Запустите образ runtime, смонтировав папку в `/data`:

   ```bash
   docker run -d --name pano \
     --user "$(id -u):$(id -g)" \
     --memory 1g \
     -v "$PWD":/data \
     -p 80:<http-port> \
     ghcr.io/panomc/pano-runtime:jre11
   ```

   - `--user` оставляет файлы в папке вашими; контейнеру никогда не нужен root.
   - `--memory` также задаёт размер heap Java. См. [Память](runtime/#memory).
   - `<http-port>` — значение `server.http-port` из [`config.conf`](../configuration/).

3. Откройте `http://<ip-вашего-сервера>/` и пройдите [мастер настройки](../installation/).

Pano по-прежнему нужна база данных **MySQL или MariaDB**. Запустите её отдельным контейнером или
сервисом и укажите её адрес в мастере или через [переменные окружения](configuration/#environment-variables).

## Полезно знать

- **Никогда** не запускайте Pano в контейнере с `-bg`. См. [Не используйте `-bg`](runtime/#never-use-bg).
- **Не** редактируйте `config.conf`, пока контейнер работает. См. [config.conf](configuration/#config-conf).
- Останавливайте контейнер через `docker stop`: Pano корректно завершится и сохранит конфигурацию.

## Хостинг Pano для других

Pano Host запускает по контейнеру на каждый Pano Instance — с теми же образами и переменными окружения,
описанными в разделе [Конфигурация](configuration/).
