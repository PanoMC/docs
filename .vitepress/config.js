import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Pano Docs",
  description: "Documentation for usage of Pano, addons and themes",

  lastUpdated: true,
  ignoreDeadLinks: true,

  head: [
    [
      "link",
      { rel: "icon", href: "/docs/docs/img/logo.svg", type: "image/svg+xml" },
    ],
  ],

  themeConfig: {
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
              { text: "Configuration", link: "/platform/configuration/" },
              {
                text: "Integrations",
                link: "/platform/integrations/",
                collapsed: true,
                items: [
                  { text: "AuthMeReloaded", link: "/platform/integrations/authme/" },
                  { text: "LuckPerms", link: "/platform/integrations/luckperms/" },
                  { text: "Ban Management", link: "/platform/integrations/ban-management/" },
                ]
              },
              { text: "Addons", link: "/platform/addons/" },
              { text: "Themes", link: "/platform/themes/" },
              { text: "Advanced", link: "/platform/advanced/" },
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
            items: [
              {
                text: "Getting Started",
                link: "/integration/getting-started/",
              },
            ],
          },
          {
            text: "Addon Development",
            items: [
              {
                text: "Getting Started",
                link: "/addon/getting-started/",
              },
            ],
          },
          {
            text: "Theme Development",
            items: [
              {
                text: "Getting Started",
                link: "/theme/getting-started/",
              },
            ],
          },
          {
            text: "Contribution",
            items: [
              { text: "Getting Started", link: "/contribution/getting-started/" },
              { text: "Backend Development", link: "/contribution/backend" },
              { text: "Frontend Development", link: "/contribution/frontend" },
              { text: "MC Plugin Development", link: "/contribution/mc-plugin" },
              { text: "Translations", link: "/contribution/translations" },
              { text: "Community", link: "/contribution/community" },
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
              { text: "Ayarlar", link: "/tr/platform/configuration/" },
              {
                text: "Entegrasyonlar",
                link: "/tr/platform/integrations/",
                collapsed: true,
                items: [
                  { text: "AuthMeReloaded", link: "/tr/platform/integrations/authme/" },
                  { text: "LuckPerms", link: "/tr/platform/integrations/luckperms/" },
                  { text: "Ban Management", link: "/tr/platform/integrations/ban-management/" },
                ]
              },
              { text: "Eklentiler", link: "/tr/platform/addons/" },
              { text: "Temalar", link: "/tr/platform/themes/" },
              { text: "Gelişmiş", link: "/tr/platform/advanced/" },
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
            items: [
              {
                text: "Başlangıç",
                link: "/tr/integration/getting-started/",
              },
            ],
          },
          {
            text: "Eklenti Geliştirme",
            items: [
              {
                text: "Başlangıç",
                link: "/tr/addon/getting-started/",
              },
            ],
          },
          {
            text: "Tema Geliştirme",
            items: [
              {
                text: "Başlangıç",
                link: "/tr/theme/getting-started/",
              },
            ],
          },
          {
            text: "Katkıda Bulun",
            items: [
              { text: "Başlangıç", link: "/contribution/getting-started/" },
              { text: "Backend Geliştirme", link: "/contribution/backend" },
              { text: "Frontend Geliştirme", link: "/contribution/frontend" },
              { text: "MC Plugin Geliştirme", link: "/contribution/mc-plugin" },
              { text: "Çeviriler", link: "/contribution/translations" },
              { text: "Topluluk", link: "/contribution/community" },
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
              { text: "Конфигурация", link: "/ru/platform/configuration/" },
              {
                text: "Интеграции",
                link: "/ru/platform/integrations/",
                collapsed: true,
                items: [
                  { text: "AuthMeReloaded", link: "/ru/platform/integrations/authme/" },
                  { text: "LuckPerms", link: "/ru/platform/integrations/luckperms/" },
                  { text: "Ban Management", link: "/ru/platform/integrations/ban-management/" },
                ]
              },
              { text: "Аддоны", link: "/ru/platform/addons/" },
              { text: "Темы", link: "/ru/platform/themes/" },
              { text: "Дополнительно", link: "/ru/platform/advanced/" },
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
            items: [
              {
                text: "Начало работы",
                link: "/ru/integration/getting-started/",
              },
            ],
          },
          {
            text: "Разработка аддонов",
            items: [
              {
                text: "Начало работы",
                link: "/ru/addon/getting-started/",
              },
            ],
          },
          {
            text: "Разработка тем",
            items: [
              {
                text: "Начало работы",
                link: "/ru/theme/getting-started/",
              },
            ],
          },
          {
            text: "Помощь проекту",
            items: [
              { text: "Начало работы", link: "/contribution/getting-started/" },
              { text: "Разработка бэкенда", link: "/contribution/backend" },
              { text: "Разработка фронтенда", link: "/contribution/frontend" },
              { text: "Разработка плагина MC", link: "/contribution/mc-plugin" },
              { text: "Переводы", link: "/contribution/translations" },
              { text: "Сообщество", link: "/contribution/community" },
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
