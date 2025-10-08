---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Pano Docs"
  tagline: "Open-source advanced server management and web platform made for Minecraft."
  actions:
    - theme: brand
      text: → Getting Started
      link: /platform/introduction
    - theme: alt
      text: Website ↗
      link: https://panomc.com

features:
  - icon: 🚀
    title: Installation
    details: Get started in just 5 minutes.
    link: /platform/installation/
  - icon: ⚙️
    title: Configuration
    details: Quickly adjust anything you want.
    link: /platform/configuration/
  - icon: 🛠️
    title: Addons
    details: Enhance Pano’s power even further.
    link: /platform/addons/
  - icon: 🎨
    title: Themes
    details: Make Pano match your style.
    link: /platform/themes/
  - icon: 💡
    title: Frequently Asked Questions (FAQ)
    details: Got a question in mind?
    link: /platform/FAQ/
  - icon: 🧩
    title: Addon Development
    details: Build your own features.
    link: /addon/getting-started/
  - icon: ✨
    title: Theme Development
    details: Create your own design.
    link: /theme/getting-started/
  - icon: 🪧
    title: Contribute
    details: Everything about improving Pano.
    link: /contribution/getting-started/

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