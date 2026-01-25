---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Pano Docs"
  tagline: "Продвинутая веб-платформа и система управления сервером с открытым исходным кодом, созданная для Minecraft."
  actions:
    - theme: brand
      text: → Начало работы
      link: /ru/platform/introduction
    - theme: alt
      text: Website ↗
      link: https://panomc.com

features:
  - icon: 🚀
    title: Установка
    details: Начните всего за 5 минут.
    link: /ru/platform/installation/
  - icon: ⚙️
    title: Конфигурация
    details: Быстро настройте всё, что захотите.
    link: /ru/platform/configuration/
  - icon: 🛠️
    title: Аддоны
    details: Расширьте возможности Pano еще больше.
    link: /ru/platform/addons/
  - icon: 🎨
    title: Темы
    details: Настройте Pano под свой стиль.
    link: /ru/platform/themes/
  - icon: 💡
    title: Часто задаваемые вопросы (FAQ)
    details: У вас есть вопрос?
    link: /ru/platform/FAQ/
  - icon: 🧩
    title: Разработка аддонов
    details: Создавайте свои собственные функции.
    link: /ru/addon/getting-started/
  - icon: ✨
    title: Разработка тем
    details: Создайте свой собственный дизайн.
    link: /ru/theme/getting-started/
  - icon: 🪧
    title: Помощь проекту
    details: Всё об улучшении Pano.
    link: /ru/contribution/getting-started/

---

<style>
    :root {
      --vp-home-hero-name-color: transparent;
      --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
    
      --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
      --vp-home-hero-image-filter: blur(44px);
      .VPImage {
        width:50px;
      }
    }
    
    @media (min-width: 640px) {
      :root {
        --vp-home-hero-image-filter: blur(56px);
      }
    }
    
    @media (min-width: 960px) {
      :root {
        --vp-home-hero-image-filter: blur(68px);
      }
    }
</style>
