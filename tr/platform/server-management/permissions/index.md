# İzinler ve Uyarılar

## İzinler {#permissions}

Diğer bütün izinler gibi **Panel → Yetkiler** bölümünden ayarlanır.

| İzin | Node | Neye izin verir |
| --- | --- | --- |
| Sunucuları Yönet | `pano.panel.manage.servers` | Sunucuları görme, bağlama ve kaldırma; genel bakış ve ayarlar |
| Sunucu Konsolunu Yönet | `pano.panel.manage.server.console` | Konsol ve komutlar |
| Sunucu Gücünü Yönet | `pano.panel.manage.server.power` | Başlatma, durdurma, yeniden başlatma, sonlandırma |
| Sunucu Oyuncularını Yönet | `pano.panel.manage.server.players` | Oyuncu listesi ve oyuncu işlemleri |
| Sunucu Eklentilerini Yönet | `pano.panel.manage.server.plugins` | Eklentiler ve modlar |
| Sunucu Dosyalarını Yönet | `pano.panel.manage.server.files` | Dosya yöneticisi |
| Sunucu Yedeklerini Yönet | `pano.panel.manage.server.backups` | Yedekler ve geri yüklemeler |
| Sunucu Zamanlamalarını Yönet | `pano.panel.manage.server.schedules` | Zamanlanmış görevler |
| Sunucu Başlatma Ayarlarını Yönet | `pano.panel.manage.server.startup` | Bellek, Java, port, JVM argümanları |
| Sunucu Oluştur | `pano.panel.create.servers` | Oluşturma, yeniden kurma, yazılım değiştirme |
| Düğümleri Yönet | `pano.panel.manage.nodes` | Düğüm ekleme, güncelleme, kaldırma |

**Yalnızca bir sunucu:** her `pano.panel.manage.server.*` izni **Hangi sunucular** listesiyle bazı
sunuculara daraltılabilir. Bütün sunucular için boş bırakın.

**Yasak komutlar:** bir konsol izni, asla gönderemeyeceği komutları taşıyabilir:

```jsonc
"denyCommands": ["op", "deop", "stop", "whitelist*"]
```

İlk sözcük karşılaştırılır, büyük/küçük harf fark etmez; `*` başlangıçla eşleşir. `*` iznine sahip
hesaplar asla engellenmez.

> Konsol erişimi operatör erişimidir — onu OP kadar dikkatli verin ve sunucu bazında daraltın.

Her sunucunun **Hareketler** sekmesi kimin ne yaptığını listeler: komutlar, güç ve oyuncu işlemleri,
eklenti ve dosya değişiklikleri, yedekler ve zamanlanmış görev çalışmaları. Pano'nun kendi yaptıkları
— bir çökme, bir zamanlanmış görev, otomatik bir güncelleme — **Sistem** olarak görünür. İşlemlerin kullanıcı ve
sunucu başına hız sınırı vardır — örneğin 10 saniyede 10 komut ve 10 dakikada 3 yedek.

## Uyarılar {#alerts}

| Uyarı | Ne zaman |
| --- | --- |
| **Sunucu çöktü** | Bir sunucu, kimse istemeden kapandı. |
| **Düğüm çevrimdışı** | Bir düğüm yanıt vermeyi bıraktı. |
| **Yedekleme başarısız** | Bir yedek tamamlanmadı. |
| **Disk doluyor** | Bir düğümün diski %90'dan fazla dolu. |
| **TPS düşük** | Bir sunucu 15 TPS'nin altında kaldı. |
| **Zamanlanmış görev başarısız** | Zamanlanmış bir çalışma hatayla bitti. |
| **Eklenti güncellemeleri** | Daha yeni eklenti derlemeleri var (günde bir denetlenir). |

Her uyarı, sunucuları yöneten herkes için bir panel bildirimi olur ve bir süre tekrarlanmaz.
**Ayarlar → Platform → Sunucu uyarıları** her türü açıp kapatır ve onu e-posta ile de gönderebilir.
Bir sunucunun kendi **Ayarlar → Uyarılar** kartı, sunucu uyarılarını yalnızca o sunucu için açıp
kapatabilir.
