# Память и лимиты ресурсов

Pano рассчитан на работу при скромном бюджете — полный экземпляр (JVM **плюс** запускаемые им UI-процессы) ориентируется на **~1 ГБ ОЗУ**, не считая базы данных, которая работает как отдельный сервис.

## Как Pano использует память

Работающий экземпляр состоит из независимых процессов ОС:

1. **Ядро Pano (JVM)** — основной процесс `Pano.jar`. Ограничивается флагами JVM (`-Xmx`, …), заданными **при запуске**.
2. **UI-процессы (Bun)** — Pano запускает по одному небольшому процессу [Bun](https://bun.sh) на каждый обслуживаемый UI: `setup-ui`, `panel-ui` и **активную тему**. Это stateless SSR-рендереры (берут данные у бэкенда и рендерят HTML), поэтому остаются небольшими.
3. **База данных** — **отдельное** приложение (MariaDB/MySQL). Ограничивайте её отдельно.

> **Итого ОЗУ ≈ JVM (`-Xmx` + metaspace + direct + накладные расходы) + Σ каждого UI-процесса.**
> Это отдельные процессы: флаги JVM **не** ограничивают Bun-UI, а лимит UI **не** ограничивает JVM. Настраивайте оба.

## Ограничение ядра Pano (JVM)

Размер кучи фиксируется **при запуске** и не может уменьшаться во время работы, поэтому ограничьте её (и внекучные области) при запуске Pano.

### `JAVA_TOOL_OPTIONS` (рекомендуется)

JVM читает эту переменную окружения автоматически — команда запуска остаётся прежней:

```bash
export JAVA_TOOL_OPTIONS="-Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
java -jar Pano.jar
```

### Флаги в командной строке

```bash
java -Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError -jar Pano.jar
```

| Флаг | Назначение |
| --- | --- |
| `-Xmx512m` | Максимальная куча — главный рычаг. |
| `-XX:MaxMetaspaceSize=256m` | Ограничивает метаданные классов. |
| `-XX:MaxDirectMemorySize=64m` | Ограничивает внекучные буферы Netty/Vert.x. |
| `-XX:+UseSerialGC` | GC с наименьшими накладными расходами для малых куч. |
| `-XX:+ExitOnOutOfMemoryError` | Завершиться (чтобы супервизор перезапустил) вместо зависания при OOM. |

### Docker

```dockerfile
ENV JAVA_OPTS="-Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar Pano.jar"]
```

Ограничьте весь контейнер, чтобы JVM **и** Bun-UI делили один жёсткий потолок:

```bash
docker run --memory=1g --memory-swap=1g your-pano-image
```

### systemd (хост Linux)

```ini
[Service]
Environment="JAVA_TOOL_OPTIONS=-Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
ExecStart=/usr/bin/java -jar /opt/pano/Pano.jar
# Жёстко ограничить весь сервис (JVM + запускаемые UI):
MemoryMax=1G
MemorySwapMax=0
```

## Ограничение UI-процессов (setup-ui, panel-ui, тема)

Для запускаемых Bun-UI нет переносимого жёсткого лимита на процесс (cgroup только в Linux, Windows Job Objects только в Windows, в macOS нет ни того, ни другого), поэтому **Pano ограничивает их сам** — одинаково на каждой платформе, где он работает (Linux, macOS, Windows, Android):

- Запускает Bun в режиме низкого потребления памяти (`--smol`).
- Встроенный watchdog периодически считывает резидентную память каждого UI-процесса и **перезапускает** тот, что превышает лимит. Перезапуск использует тот же внутренний порт, поэтому маршрутизация не затрагивается; UI stateless, так что это безопасно.

Задайте потолок на UI в конфигурации (см. [Конфигурация сервера](../server/)):

```jsonc
server {
  ui-max-memory-mb = 200   # макс. МБ на UI-процесс; 0 отключает лимит
}
```

- По умолчанию **200 МБ** на UI.
- С `--smol` UI обычно держатся значительно ниже — лимит это страховка от утечки или сбоя.
- `0` отключает принудительное ограничение.

## Пример бюджета ~1 ГБ

База данных в другом месте; отдайте JVM большую долю и оставьте место для одного-двух обычно работающих UI (panel-ui + активная тема):

```bash
# Ядро Pano (JVM)
export JAVA_TOOL_OPTIONS="-Xms128m -Xmx448m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
java -jar Pano.jar
```

```jsonc
// конфигурация — держите каждый UI небольшим
server {
  ui-max-memory-mb = 200
}
```

Грубый расчёт: JVM ≈ 448 МБ кучи + ~250 МБ накладных ≈ **~700 МБ**, плюс 2 × ~120 МБ UI ≈ **~240 МБ** → **~940 МБ**, уверенно ниже 1 ГБ. Подстройте `-Xmx` и `ui-max-memory-mb` под свой трафик.

> База данных отдельна — задайте ей собственный лимит (например, отдельный контейнер со своим `--memory`).
