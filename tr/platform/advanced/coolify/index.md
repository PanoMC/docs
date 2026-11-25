# Pano'yu Coolify ya da Traefik Arkasında Kullanma

[Coolify](https://coolify.io/) her siteyi kendi vekil sunucusu **Traefik v3** üzerinden geçirir. Traefik v3, gövdesinin
gelmesi **60 saniyeden** uzun süren her isteği keser (`respondingTimeouts.readTimeout`). Pano'nun kendisinde yüklemeler
için boyut ya da süre sınırı yoktur, bu yüzden takıldığınız sınır budur: 50 Mbit/sn'lik bir hatta 600 MB'lık bir sunucu
arşivi yaklaşık 100 saniye sürer ve yarıda kesilir, panel de yüklemenin kesildiğini söyler. İndirmeler etkilenmez.

## Okuma zaman aşımını yükseltin

Coolify'da **Servers → sunucunuz → Proxy** bölümünü açın, vekil sunucunun `command` listesine bu iki satırı ekleyin,
kaydedin ve vekil sunucuyu yeniden başlatın:

```yaml
command:
  # … mevcut satırlar kalır …
  - '--entrypoints.http.transport.respondingTimeouts.readTimeout=6h'
  - '--entrypoints.https.transport.respondingTimeouts.readTimeout=6h'
```

Vekil sunucuyu yeniden başlatmak o sunucudaki bütün siteleri birkaç saniyeliğine keser. Altı saat, yavaş hatlarda çok
gigabaytlık yüklemeleri karşılar; hareket etmeyen bir aktarımı Pano yine de beş dakika veri gelmeyince sonlandırır.

Traefik'i elle yapılandırıyorsanız aynı değeri, Pano'nun sunulduğu giriş noktasında statik yapılandırmaya yazın:

```yaml
entryPoints:
  websecure:
    transport:
      respondingTimeouts:
        readTimeout: 6h
```

## Yardım ve Destek

- [SSS sayfasını](../../FAQ/) ziyaret edin
- [Discord topluluğumuzda](https://discord.gg/6vVy72wgXT) sorun
- [GitHub](https://github.com/PanoMC/Pano/issues) üzerinde bir konu açın
