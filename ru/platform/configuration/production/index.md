# Подготовка к production

## Контрольный список для продакшена

- `development-mode = false`
- Порт **80 (TCP)** открыт и доступен
- HTTPS включен (через Pano SSL или Reverse Proxy) и открыт порт **443 (TCP)**
- Безопасный и приватный `jwt-key`
- Настроены корректные учетные данные SMTP
- Префикс базы данных не менялся после установки
- Установлен правильный ID темы или используется Vanilla Theme по умолчанию
- Регулярное резервное копирование базы данных и загруженных файлов
## Пример минимальной конфигурации

```jsonc
development-mode = false
locale = "ru"

website-name = "Мой потрясающий сервер"
website-description = "Survival • Ивенты • Дружное сообщество"
support-email = "support@myserver.com"

server-ip-address = "mc.myserver.com"
server-game-version = "1.20.x"

database {
  host = "127.0.0.1:3306"
  name = "pano_prod"
  username = "pano_user"
  password = ""
  prefix = "pano_"
}

current-theme = "vanilla-theme"

email {
  enabled = true
  sender = "Pano <no-reply@myserver.com>"
  hostname = "smtp.myserver.com"
  port = 465
  username = "no-reply@myserver.com"
  password = "ЗАМЕНИТЕ_МЕНЯ"
  ssl = true
}

server {
  host = "0.0.0.0"
  port = 80
}
```
## После редактирования

- Сохраните файл и **перезапустите Pano** после редактирования.
- Избегайте изменения автоматически генерируемых полей (например, `jwt-key`, `config-version`).
- Проверьте наличие синтаксических ошибок, если запуск не удался.
- Всегда делайте резервную копию перед обновлением или переустановкой.

> Нужна помощь? Посетите FAQ, присоединяйтесь к нашему [сообществу Discord](https://discord.gg/6vVy72wgXT) или сообщайте о проблемах на [GitHub](https://github.com/PanoMC/Pano/issues).
