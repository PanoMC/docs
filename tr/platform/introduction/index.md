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

const learningPaths = [
  {
    title: "Try the Tutorial",
    text: "For individuals who would rather learn by doing."
  },
  {
    title: "Check out the Examples",
    text: "Discover common examples of core features and official plugins available for Parsek."
  }
]
</script>

# Pano Nedir?

**Pano**, tam kontrol ve sadelik isteyen **Minecraft sunucu sahipleri** için geliştirilmiş, **açık kaynaklı** ve **topluluk odaklı** bir **platformdur**.  
**Kotlin** ile geliştirilmiş ve **JVM** üzerinde çalışan Pano, **web sitenizi**, **sunucunuzu** ve **topluluğunuzu** tek bir yerde birleştirir.

Bir **platform**, sıradan bir yazılımdan fazlasıdır — bir temeldir.  
Pano, **eklentilerle** (addon) genişletilebilen, **temalarla** özelleştirilebilen ve oyun sunucunuza bağlanabilen bir altyapı sunar.  
Bu sayede kendi **sunucu-topluluk ekosisteminizi** oluşturmanız için ihtiyacınız olan her şeyi sağlar.

Tipik bir **web site scriptlerinden** farklı olarak, Pano öylece bir PHP web sunucuya atıp çalıştırabileceğiniz bir şey değildir.  
Pano, **Spigot** gibi tam teşekküllü bir **uygulamadır** ve bir `.jar` dosyası olarak dağıtılır.  
**JVM** üzerinde çalışır ve kurulumu tamamlamak için **aktif bir internet bağlantısı** gerektirir.  
Bu mimari, Pano’ya geleneksel web scriptlerine kıyasla çok daha yüksek **performans**, **esneklik** ve **güvenlik** kazandırır — onu bir **platform**, sadece birkaç dosyadan ibaret bir sistem olmaktan çıkarır.

Pano, oyun ile web arasında **derin bir entegrasyon** sağlamak için geliştirilmiştir — otomatik giriş, oyuncu istatistikleri ve oyun içi yönetim gibi özellikleri doğrudan web siteniz üzerinden mümkün kılar.

> Basit. Güçlü. Size ait. — İşte Pano.

[Kuruluma Başla →](../installation)

## ⚡ Temel Özellikler

Pano, Minecraft sunucu sahiplerine çevrimiçi varlıklarını kolayca oluşturup yönetebilmeleri için gereken her şeyi sunar:

- 🚀 **Hızlı ve Hafif** — Minimum kaynak kullanımıyla maksimum performans.
- 🧩 **Modüler ve Genişletilebilir** — Eklentiler ve temalar sayesinde Pano’yu kendi tarzınıza uyarlayın.
- 🛠️ **Kendinize Ait Özgürlük** — İstediğiniz yerde barındırın, tam kontrol sizde olsun.
- 🕹️ **Oyun Entegrasyonu** — Oyun sunucunuzu web sitenize bağlayın.
- 💡 **Modern Teknoloji Altyapısı** — Hız, kararlılık ve ölçeklenebilirlik için Kotlin ve Svelte gücüyle.

Topluluğa katılın ve Pano’nun Minecraft sunucu yönetimini nasıl yeniden tanımladığını keşfedin.  
[→ Discord Sunucumuza Katılın](https://discord.gg/6vVy72wgXT)

## 🪧 *Pano* İsmi Nereden Geliyor?

**Pano** ismi, Türkçe’de **“Pano”** kelimesinden gelir; *kontrol paneli* veya *gösterge paneli* anlamındadır.  
Bu isim, **her şeyi tek bir yerden yönetme fikrini** yansıtır — sunucunuzu, web sitenizi, oyuncularınızı ve topluluğunuzu.

Gerçek bir pano size nasıl tam kontrol sağlıyorsa, **Pano** da Minecraft sunucunuzun tüm yönlerini tek bir sade, genişletilebilir ve güçlü platformda bir araya getirir.

## 🧑‍💻 Ekibimiz

Harika ekibimizle tanışın.

<VPTeamMembers size="small" :members="members" />