<script setup>
import { VPTeamMembers } from 'vitepress/theme';
const members = [
  {
    avatar: 'https://minotar.net/avatar/kahverengi/64.png',
    name: 'Ahmet Enes Duruer (kahverengi)',
    title: 'Kurucu | Baş Geliştirici',
    links: [
      { icon: 'github', link: 'https://github.com/duruer' },
      { icon: 'discord', link: 'https://discord.com/users/kahverengi' },
    ]
  },
  {
    avatar: 'https://minotar.net/avatar/ultub/64.png',
    name: 'Selim Gökçek (ultub)',
    title: 'Kurucu | Tasarımcı',
    links: [
      { icon: 'github', link: 'https://github.com/slmgkck' },
      { icon: 'discord', link: 'https://discord.com/users/ultub' },
    ]
  }
];
</script>

# Pano Nedir?

Pano, **web siteni**, **sunucunu** ve **topluluğunu** tek bir yerde birleştiren, Minecraft sunucu sahipleri için geliştirilmiş **açık kaynaklı bir platformdur** — Kotlin ile yazıldı, JVM üzerinde çalışır ve tek bir `.jar` dosyası olarak gelir.

> Basit. Güçlü. Sana ait. — İşte Pano.

## Neden Pano?

- **Kendi sunucunda çalışır, açık kaynaktır.** İstediğin yerde barındır, tam kontrol sende kalır.
- **Genişletilebilir.** Eklentiler ve temalar ile Pano'yu sunucuna göre şekillendir.
- **Oyuna hazır.** Otomatik giriş, oyuncu istatistikleri ve oyun içi yönetim — kutudan çıkar çıkmaz.

## Hızlı Başla

- **[Pano'yu Kur →](../installation/)** — Beş dakikada çalışan bir Pano.
- **[Discord'a Katıl →](https://discord.gg/6vVy72wgXT)** — Soru sor, geri bildirim paylaş.

::: details Pano ismi nereden geliyor?
**Pano** kelimesi, Türkçe'de *gösterge paneli* veya *kontrol paneli* anlamına gelir — sunucunu, web siteni, oyuncularını ve topluluğunu yönettiğin tek bir merkez.
:::

::: details Lisans (GPLv3)
Pano çekirdek platformu **GNU General Public License v3.0 (GPLv3)** ile lisanslıdır — yazılımın temelini sonsuza kadar özgür ve açık tutan bir "copyleft" lisans.

- Pano'yu çalıştırabilir, inceleyebilir, paylaşabilir ve değiştirebilirsin.
- **Çekirdek** üzerine yaptığın değişiklikler de açık kaynak ve GPLv3 olmak zorunda.
- **Eklentiler ve temalar** istedikleri lisansı kullanabilir — özel veya ticari dahil.
- **Üçüncü taraf eklentiler** kendi lisans kurallarını takip eder.
:::

## Ekibimiz

Harika ekibimizle tanışın.

<VPTeamMembers size="small" :members="members" />
