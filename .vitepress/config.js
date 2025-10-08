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
              { text: "Addons", link: "/platform/addons/" },
              { text: "Themes", link: "/platform/themes/" },
              { text: "Advanced", link: "/platform/advanced/" },
              { text: "FAQ", link: "/platform/FAQ/" },
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
              {
                text: "Getting Started",
                link: "/contribution/getting-started/",
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
              { text: "Ayarlar", link: "/tr/platform/configuration/" },
              { text: "Eklentiler", link: "/tr/platform/addons/" },
              { text: "Temalar", link: "/tr/platform/themes/" },
              { text: "Gelişmiş", link: "/tr/platform/advanced/" },
              { text: "SSS", link: "/tr/platform/FAQ/" },
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
              {
                text: "Getting Started",
                link: "/tr/contribution/getting-started/",
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
  },

  base: "/docs/",
  cleanUrls: true,
});
