import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Pano Docs",
  description: "Documentation for usage of Pano, addons and themes",

  lastUpdated: true,
  ignoreDeadLinks: true,
  vite: {
    server: {
      allowedHosts: ["f285-130-162-246-99.ngrok-free.app"]
    }
  },

  head: [
    [
      "link",
      { rel: "icon", href: "/docs/docs/img/logo.svg", type: "image/svg+xml" },
    ],
  ],

  themeConfig: {
    logo: "/docs/img/logo-nav.svg",
    siteTitle: "Docs",

    socialLinks: [
      { icon: "github", link: "https://github.com/panomc/pano" },
      { icon: "discord", link: "https://discord.gg/GZvaK3wpHF" },
    ],

    footer: {
      copyright: `Copyright © ${new Date().getFullYear()} Pano`,
    },

    search: {
      provider: "local",
    },
  },

  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        sidebar: [
          {
            text: "Platform",
            items: [
              {
                text: "Getting Started",
                link: "/platform/introduction/",
              },
              { text: "Installation", link: "/platform/installation/" },
              {
                text: "Configuration",
                link: "/platform/configuration/",
                collapsed: true,
                items: [
                  { text: "Services", link: "/platform/configuration/services/" },
                  { text: "Server", link: "/platform/configuration/server/" },
                  { text: "Production", link: "/platform/configuration/production/" },
                  { text: "Memory & Limits", link: "/platform/configuration/memory/" },
                ],
              },
              {
                text: "Integrations",
                link: "/platform/integrations/",
                collapsed: true,
                items: [
                  {
                    text: "AuthMeReloaded",
                    link: "/platform/integrations/authme/",
                    collapsed: true,
                    items: [
                      { text: "Features", link: "/platform/integrations/authme/features/" },
                      { text: "Troubleshooting", link: "/platform/integrations/authme/troubleshooting/" },
                    ],
                  },
                  { text: "LuckPerms", link: "/platform/integrations/luckperms/" },
                  { text: "Ban Management", link: "/platform/integrations/ban-management/" },
                ]
              },
              { text: "Addons", link: "/platform/addons/" },
              { text: "Themes", link: "/platform/themes/" },
              {
                text: "Advanced",
                link: "/platform/advanced/",
                collapsed: true,
                items: [
                  { text: "Cloudflare", link: "/platform/advanced/cloudflare/" },
                ],
              },
              { text: "FAQ", link: "/platform/FAQ/" },
            ],
          },
          {
            text: "Official Plugins",
            collapsed: true,
            items: [
              { text: "Announcement", link: "/plugins/announcement/" },
              { text: "Slider", link: "/plugins/slider/" },
              { text: "Pages", link: "/plugins/pages/" },
              { text: "Comments", link: "/plugins/comments/" },
              { text: "FAQ", link: "/plugins/faq/" },
              { text: "Bans", link: "/plugins/bans/" },
            ],
          },
          {
            text: "Integration Development",
            collapsed: true,
            items: [
              { text: "Getting Started", link: "/integration/getting-started/" },
              { text: "Core API Concepts", link: "/integration/core-concepts/" },
              { text: "Creating a Plugin", link: "/integration/creating-plugin/" },
              { text: "Extending Backend", link: "/integration/extending-backend/" },
              { text: "Testing & Examples", link: "/integration/testing/" },
              { text: "API Reference", link: "/integration/api-reference/" },
            ],
          },
          {
            text: "Addon Development",
            collapsed: true,
            items: [
              {
                text: "Getting Started",
                link: "/addon/getting-started/",
              },
              {
                text: "Architecture",
                link: "/addon/architecture/",
              },
              {
                text: "Manifest Configuration",
                link: "/addon/manifest/",
              },
              {
                text: "Backend Development",
                link: "/addon/backend/",
              },
              {
                text: "Backend API Reference",
                link: "/addon/backend-reference/",
              },
              {
                text: "Frontend Development",
                link: "/addon/frontend/",
              },
              {
                text: "Frontend API Reference",
                link: "/addon/api-reference/",
              },
              {
                text: "Localization",
                link: "/addon/localization/",
              },
              {
                text: "Building & Publishing",
                link: "/addon/publishing/",
              },
              {
                text: "Premium & Licensing",
                link: "/addon/premium/",
              },
            ],
          },
          {
            text: "Theme Development",
            collapsed: true,
            items: [
              {
                text: "Getting Started",
                link: "/theme/getting-started/",
              },
              {
                text: "Theme Structure",
                link: "/theme/structure/",
              },
              {
                text: "Colors & Styling",
                link: "/theme/customization/",
              },
              {
                text: "Changing Page Designs",
                link: "/theme/views/",
              },
              {
                text: "Localization",
                link: "/theme/localization/",
              },
              {
                text: "Building & Packaging",
                link: "/theme/packaging/",
              },
              {
                text: "Publishing & Premium",
                link: "/theme/publishing/",
              },
            ],
          },
          {
            text: "Contribution",
            collapsed: true,
            items: [
              { text: "Getting Started", link: "/contribution/getting-started/" },
              { text: "Backend Development", link: "/contribution/backend/" },
              { text: "Frontend Development", link: "/contribution/frontend/" },
              { text: "MC Plugin Development", link: "/contribution/mc-plugin/" },
              { text: "Translations", link: "/contribution/translations/" },
              { text: "Community", link: "/contribution/community/" },
            ],
          },
          {
            text: "Handbook",
            items: [
              {
                text: "Build Your First Theme",
                link: "/handbook/theme/",
                collapsed: true,
                items: [
                  { text: "Setup", link: "/handbook/theme/setup/" },
                  { text: "Design & Styling", link: "/handbook/theme/design/" },
                  { text: "Reshaping Pages", link: "/handbook/theme/pages/" },
                  { text: "Translations", link: "/handbook/theme/translate/" },
                  { text: "Ship It", link: "/handbook/theme/ship/" },
                ],
              },
            ],
          },
        ],
        editLink: {
          pattern: "https://github.com/PanoMC/docs/edit/main/:path",
          text: "Edit this page on GitHub",
        },
      },
    },
    tr: {
      title: "Pano Dokümanı",
      label: "Türkçe",
      lang: "tr",
      link: "/tr/",
      themeConfig: {
        sidebar: [
          {
            text: "Platform",
            items: [
              {
                text: "Başlangıç",
                link: "/tr/platform/introduction/",
              },
              { text: "Kurulum", link: "/tr/platform/installation/" },
              {
                text: "Ayarlar",
                link: "/tr/platform/configuration/",
                collapsed: true,
                items: [
                  { text: "Servisler", link: "/tr/platform/configuration/services/" },
                  { text: "Sunucu", link: "/tr/platform/configuration/server/" },
                  { text: "Üretim", link: "/tr/platform/configuration/production/" },
                  { text: "Bellek ve Limitler", link: "/tr/platform/configuration/memory/" },
                ],
              },
              {
                text: "Entegrasyonlar",
                link: "/tr/platform/integrations/",
                collapsed: true,
                items: [
                  {
                    text: "AuthMeReloaded",
                    link: "/tr/platform/integrations/authme/",
                    collapsed: true,
                    items: [
                      { text: "Özellikler", link: "/tr/platform/integrations/authme/features/" },
                      { text: "Sorun Giderme", link: "/tr/platform/integrations/authme/troubleshooting/" },
                    ],
                  },
                  { text: "LuckPerms", link: "/tr/platform/integrations/luckperms/" },
                  { text: "Ban Management", link: "/tr/platform/integrations/ban-management/" },
                ]
              },
              { text: "Eklentiler", link: "/tr/platform/addons/" },
              { text: "Temalar", link: "/tr/platform/themes/" },
              {
                text: "Gelişmiş",
                link: "/tr/platform/advanced/",
                collapsed: true,
                items: [
                  { text: "Cloudflare", link: "/tr/platform/advanced/cloudflare/" },
                ],
              },
              { text: "SSS", link: "/tr/platform/FAQ/" },
            ],
          },
          {
            text: "Resmi Eklentiler",
            collapsed: true,
            items: [
              { text: "Announcement", link: "/tr/plugins/announcement/" },
              { text: "Slider", link: "/tr/plugins/slider/" },
              { text: "Pages", link: "/tr/plugins/pages/" },
              { text: "Comments", link: "/tr/plugins/comments/" },
              { text: "FAQ", link: "/tr/plugins/faq/" },
              { text: "Bans", link: "/tr/plugins/bans/" },
            ],
          },
          {
            text: "Entegrasyon Geliştirme",
            collapsed: true,
            items: [
              { text: "Başlangıç", link: "/tr/integration/getting-started/" },
              { text: "Temel API Kavramları", link: "/tr/integration/core-concepts/" },
              { text: "Eklenti Oluşturma", link: "/tr/integration/creating-plugin/" },
              { text: "Backend'i Genişletme", link: "/tr/integration/extending-backend/" },
              { text: "Test ve Örnekler", link: "/tr/integration/testing/" },
              { text: "API Referansı", link: "/tr/integration/api-reference/" },
            ],
          },
          {
            text: "Eklenti Geliştirme",
            collapsed: true,
            items: [
              {
                text: "Başlangıç",
                link: "/tr/addon/getting-started/",
              },
              {
                text: "Mimari",
                link: "/tr/addon/architecture/",
              },
              {
                text: "Manifesto Yapılandırması",
                link: "/tr/addon/manifest/",
              },
              {
                text: "Backend Geliştirme",
                link: "/tr/addon/backend/",
              },
              {
                text: "Backend API Referansı",
                link: "/tr/addon/backend-reference/",
              },
              {
                text: "Arayüz Geliştirme",
                link: "/tr/addon/frontend/",
              },
              {
                text: "Arayüz API Referansı",
                link: "/tr/addon/api-reference/",
              },
              {
                text: "Çeviriler",
                link: "/tr/addon/localization/",
              },
              {
                text: "Derleme ve Yayınlama",
                link: "/tr/addon/publishing/",
              },
              {
                text: "Premium Eklentiler",
                link: "/tr/addon/premium/",
              },
            ],
          },
          {
            text: "Tema Geliştirme",
            collapsed: true,
            items: [
              {
                text: "Başlangıç",
                link: "/tr/theme/getting-started/",
              },
              {
                text: "Tema Yapısı",
                link: "/tr/theme/structure/",
              },
              {
                text: "Renkler ve Stiller",
                link: "/tr/theme/customization/",
              },
              {
                text: "Sayfa Tasarımlarını Değiştirme",
                link: "/tr/theme/views/",
              },
              {
                text: "Çeviriler",
                link: "/tr/theme/localization/",
              },
              {
                text: "Derleme ve Paketleme",
                link: "/tr/theme/packaging/",
              },
              {
                text: "Yayınlama ve Premium",
                link: "/tr/theme/publishing/",
              },
            ],
          },
          {
            text: "Katkıda Bulun",
            collapsed: true,
            items: [
              { text: "Başlangıç", link: "/tr/contribution/getting-started/" },
              { text: "Backend Geliştirme", link: "/tr/contribution/backend/" },
              { text: "Frontend Geliştirme", link: "/tr/contribution/frontend/" },
              { text: "MC Plugin Geliştirme", link: "/tr/contribution/mc-plugin/" },
              { text: "Çeviriler", link: "/tr/contribution/translations/" },
              { text: "Topluluk", link: "/tr/contribution/community/" },
            ],
          },
          {
            text: "El Kitabı",
            items: [
              {
                text: "İlk Temanı Yap",
                link: "/tr/handbook/theme/",
                collapsed: true,
                items: [
                  { text: "Kurulum", link: "/tr/handbook/theme/setup/" },
                  { text: "Tasarım ve Stiller", link: "/tr/handbook/theme/design/" },
                  { text: "Sayfaları Yeniden Şekillendir", link: "/tr/handbook/theme/pages/" },
                  { text: "Çeviriler", link: "/tr/handbook/theme/translate/" },
                  { text: "Yayına Çıkar", link: "/tr/handbook/theme/ship/" },
                ],
              },
            ],
          },
        ],
        editLink: {
          pattern: "https://github.com/PanoMC/pano/edit/main/:path",
          text: "Bu sayfayı GitHub'da düzenle",
        },
      },
    },
    ru: {
      title: "Документация Pano",
      label: "Русский",
      lang: "ru",
      link: "/ru/",
      themeConfig: {
        sidebar: [
          {
            text: "Платформа",
            items: [
              {
                text: "Начало работы",
                link: "/ru/platform/introduction/",
              },
              { text: "Установка", link: "/ru/platform/installation/" },
              {
                text: "Конфигурация",
                link: "/ru/platform/configuration/",
                collapsed: true,
                items: [
                  { text: "Сервисы", link: "/ru/platform/configuration/services/" },
                  { text: "Сервер", link: "/ru/platform/configuration/server/" },
                  { text: "Production", link: "/ru/platform/configuration/production/" },
                  { text: "Память и лимиты", link: "/ru/platform/configuration/memory/" },
                ],
              },
              {
                text: "Интеграции",
                link: "/ru/platform/integrations/",
                collapsed: true,
                items: [
                  {
                    text: "AuthMeReloaded",
                    link: "/ru/platform/integrations/authme/",
                    collapsed: true,
                    items: [
                      { text: "Возможности", link: "/ru/platform/integrations/authme/features/" },
                      { text: "Устранение неполадок", link: "/ru/platform/integrations/authme/troubleshooting/" },
                    ],
                  },
                  { text: "LuckPerms", link: "/ru/platform/integrations/luckperms/" },
                  { text: "Ban Management", link: "/ru/platform/integrations/ban-management/" },
                ]
              },
              { text: "Аддоны", link: "/ru/platform/addons/" },
              { text: "Темы", link: "/ru/platform/themes/" },
              {
                text: "Дополнительно",
                link: "/ru/platform/advanced/",
                collapsed: true,
                items: [
                  { text: "Cloudflare", link: "/ru/platform/advanced/cloudflare/" },
                ],
              },
              { text: "FAQ", link: "/ru/platform/FAQ/" },
            ],
          },
          {
            text: "Официальные плагины",
            collapsed: true,
            items: [
              { text: "Announcement", link: "/ru/plugins/announcement/" },
              { text: "Slider", link: "/ru/plugins/slider/" },
              { text: "Pages", link: "/ru/plugins/pages/" },
              { text: "Comments", link: "/ru/plugins/comments/" },
              { text: "FAQ", link: "/ru/plugins/faq/" },
              { text: "Bans", link: "/ru/plugins/bans/" },
            ],
          },
          {
            text: "Разработка интеграций",
            collapsed: true,
            items: [
              { text: "Начало работы", link: "/ru/integration/getting-started/" },
              { text: "Основные концепции API", link: "/ru/integration/core-concepts/" },
              { text: "Создание плагина", link: "/ru/integration/creating-plugin/" },
              { text: "Расширение бэкенда", link: "/ru/integration/extending-backend/" },
              { text: "Тестирование и примеры", link: "/ru/integration/testing/" },
              { text: "Справочник API", link: "/ru/integration/api-reference/" },
            ],
          },
          {
            text: "Разработка аддонов",
            collapsed: true,
            items: [
              {
                text: "Начало работы",
                link: "/ru/addon/getting-started/",
              },
              {
                text: "Архитектура",
                link: "/ru/addon/architecture/",
              },
              {
                text: "Конфигурация манифеста",
                link: "/ru/addon/manifest/",
              },
              {
                text: "Разработка бэкенда",
                link: "/ru/addon/backend/",
              },
              {
                text: "Справочник Backend API",
                link: "/ru/addon/backend-reference/",
              },
              {
                text: "Разработка фронтенда",
                link: "/ru/addon/frontend/",
              },
              {
                text: "Справочник API фронтенда",
                link: "/ru/addon/api-reference/",
              },
              {
                text: "Локализация",
                link: "/ru/addon/localization/",
              },
              {
                text: "Сборка и публикация",
                link: "/ru/addon/publishing/",
              },
              {
                text: "Премиум-аддоны",
                link: "/ru/addon/premium/",
              },
            ],
          },
          {
            text: "Разработка тем",
            collapsed: true,
            items: [
              {
                text: "Начало работы",
                link: "/ru/theme/getting-started/",
              },
              {
                text: "Структура темы",
                link: "/ru/theme/structure/",
              },
              {
                text: "Цвета и стили",
                link: "/ru/theme/customization/",
              },
              {
                text: "Изменение дизайна страниц",
                link: "/ru/theme/views/",
              },
              {
                text: "Локализация",
                link: "/ru/theme/localization/",
              },
              {
                text: "Сборка и упаковка",
                link: "/ru/theme/packaging/",
              },
              {
                text: "Публикация и Premium",
                link: "/ru/theme/publishing/",
              },
            ],
          },
          {
            text: "Помощь проекту",
            collapsed: true,
            items: [
              { text: "Начало работы", link: "/ru/contribution/getting-started/" },
              { text: "Разработка бэкенда", link: "/ru/contribution/backend/" },
              { text: "Разработка фронтенда", link: "/ru/contribution/frontend/" },
              { text: "Разработка плагина MC", link: "/ru/contribution/mc-plugin/" },
              { text: "Переводы", link: "/ru/contribution/translations/" },
              { text: "Сообщество", link: "/ru/contribution/community/" },
            ],
          },
          {
            text: "Руководство",
            items: [
              {
                text: "Создайте свою первую тему",
                link: "/ru/handbook/theme/",
                collapsed: true,
                items: [
                  { text: "Подготовка", link: "/ru/handbook/theme/setup/" },
                  { text: "Дизайн и стили", link: "/ru/handbook/theme/design/" },
                  { text: "Изменение страниц", link: "/ru/handbook/theme/pages/" },
                  { text: "Переводы", link: "/ru/handbook/theme/translate/" },
                  { text: "Выпуск", link: "/ru/handbook/theme/ship/" },
                ],
              },
            ],
          },
        ],
        editLink: {
          pattern: "https://github.com/PanoMC/pano/edit/main/:path",
          text: "Редактировать эту страницу на GitHub",
        },
      },
    },
  },

  base: "/docs/",
  cleanUrls: true,
});
