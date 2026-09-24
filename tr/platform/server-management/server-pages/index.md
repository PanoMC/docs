# Sunucu Sayfaları

Her sunucunun panel kenar çubuğunda **Sunucu** altında şu sayfaları vardır. Her sayfa kendi iznini
ister — bkz. [İzinler ve Uyarılar](../permissions/).

## Konsol {#console}

- **Son 500 satırla** açılır; **Daha eski satırları yükle** sunucunun günlük dosyalarından daha
  gerisini okur. Yönetilen bir sunucunun geçmişi sunucu dururken bile okunabilir, bağlı bir
  sunucununki yalnızca çevrimiçiyken.
- **Bul**, sunucunun sakladığı bütün günlük dosyalarında arar (en fazla 5.000 sonuç).
- <kbd>Enter</kbd> bir komut gönderir, <kbd>↑</kbd> / <kbd>↓</kbd> geçmişinizde gezinir. Her komut
  gönderenin adıyla gösterilir — `[Pano:admin] > say hello` — ve 10 saniyede en fazla 10 komut
  gönderilebilir. Durdurulmuş bir yönetilen sunucu komut almaz.
- Çıktı düz metindir. Saniyede 500 satırdan fazla yazdıran bir sunucunun fazla satırları düşürülür ve
  işaretlenir.
- Eklentinin `config.conf` dosyasında `console.enabled = false`, o sunucu için konsol yakalamayı
  kapatır.

## Oyuncular {#players}

Canlı oyuncu listesi: ad, UUID, ping, oyun modu ve OP / beyaz liste rozetleri; **atma**, **mesaj**,
**OP**, **oyun modu**, **beyaz liste** ve **yasaklama** işlemleriyle. Pano komutları panele yazılan
metinden değil, her zaman kayıtlı kullanıcı adından kendisi oluşturur.

- **Yasaklama:** Pano hesabı olan bir oyuncuya bir Pano yasağı uygulanır — hesabın siteden çıkışı
  yapılır ve ban entegrasyonu olan her sunucu oyuncuyu reddeder (bkz.
  [Ban Yönetimi](../../integrations/ban-management/)). Diğer herkes sunucunun kendi ban listesine
  eklenir.
- Proxy'lerde OP ve oyun modu yoktur.
- Eklenti yoksa düğüm bunun yerine sunucuya ping atar: kesin oyuncu sayısı, en fazla 12 ad.

## Güç {#power}

| | Bağlı sunucu | Yönetilen sunucu |
| --- | --- | --- |
| **Başlat** | — | Var |
| **Durdur** | Eklenti sunucuyu kapatır; onu yeniden başlatan bir şey olmaz | Durdurma komutu, sonra sonlandırma, en sonunda öldürme |
| **Yeniden Başlat** | Yalnızca Paper / Spigot'un `restart-script` ayarıyla | Durdurma, ardından başlatma |
| **Sonlandır** | — | Var — hiçbir şey kaydedilmez |

Yönetilen bir sunucuda **Pano ile başlat** ve **Çökünce yeniden başlat** (giderek uzayan aralıklarla,
en fazla 10 dakika) seçilebilir. Bir düğümü yeniden başlatmak ya da güncellemek sunucularını
durdurmaz: çalışmaya devam ederler ve *sahiplenildi* rozetiyle görünürler. Sahiplenilen bir sunucu
komutları eklenti üzerinden alır ve çöktükten sonra otomatik olarak yeniden başlatılmaz.

## Metrikler {#metrics}

Eklenti her 10 saniyede bir TPS, MSPT, JVM belleği, CPU ve oyuncu sayısını gönderir; grafik son bir
saatten 30 güne kadarını kapsar. Düğüm buna sürecin CPU ve belleğini, makinenin de CPU, RAM ve diskini
ekler. Proxy'ler TPS ya da MSPT bildirmez, Spigot da MSPT bildirmez.

## Eklentiler ve modlar {#plugins-and-mods}

- **Yüklü**, sunucunun yüklediklerini ve klasöründeki jar'ları listeler; yeni olanlar **Yüklenmedi**
  olarak görünür. Her jar'ın bir açma / kapatma anahtarı vardır: yönetilen sunucuda düğüm jar'ı
  `.jar.disabled` olarak yeniden adlandırır ve değişiklik bir sonraki başlatmada geçerli olur (o
  zamana kadar **Yeniden başlatma gerekiyor** görünür); düğümü olmayan bağlı sunucu bunu oyun içinde
  yapar, yalnızca Paper, Spigot, Folia ve Purpur'da. Pano eklentisi kapatılamaz.
- **Yükle**, `.jar` dosyalarını (her biri en fazla 256 MB) `plugins/` klasörüne, modlu sunucularda
  `mods/` klasörüne ekler.
- **Keşfet** en çok indirilen eklentilerle açılır; **Modrinth**, **Hangar** ve **CurseForge**'da bu
  sunucunun yükleyicisine ve sürümüne göre süzülmüş olarak arar ve her sonuca **Uyumlu** ya da
  **Uymayabilir** rozeti koyar. CurseForge için
  [`plugin-sources`](../../configuration/#eklenti-kaynakları-plugin-sources) altında kendi anahtarınız
  gerekir.
- **Güncellemeler:** Pano üzerinden kurulan eklentiler kaynaklarını ve **Güncelleme var** rozetini
  gösterir; **Tümünü güncelle** hepsini birden günceller. **Kaynakları bul**, diğer jar'ları
  sağlamalarından tanır (Modrinth ve CurseForge). Sunucunun **Otomatik güncelleme denetimi** kapalı
  değilse günlük bir denetim *Eklenti güncellemeleri* uyarısı çıkarır.

## Dosyalar {#files}

Sunucunun klasörü için bir dosya yöneticisi: gezinme, düzenleme (256 KB'a kadar dosyalar), medya
önizleme, oluşturma, yeniden adlandırma, silme, `.zip` çıkarma, izinleri değiştirme, yükleme (1 GB'a
kadar) ve dosyaları ya da bütün klasörleri zip olarak indirme. Kimlik bilgisi taşıyan dosyalar
gizlenir ve klasörün dışındaki hiçbir şeye ulaşılamaz.

## Yedekler {#backups}

- **Tam** tek bir `.zip` yazar; **Snapshot** yalnızca sonuncusundan bu yana değişeni saklar. **Her
  şey**, **Sadece dünyalar** ya da **Özel** yollar seçin; **Hariç tut** için de desenler verin.
- Çalışan bir sunucu önce diske kaydedilir; böylece yedek tutarlı olur.
- **Geri yükle**, sunucunun durdurulmuş olmasını ve parolanızı ister. Mevcut dünyalar önce bir
  `pre-restore-…` yedeğine kaydedilir. Yalnızca eklenti varsa geri yükleme bir sonraki açılışta
  gerçekleşir.
- Varsayılan olarak en yeni 10 tam yedek ve 24 snapshot tutulur. **Sabitlenmiş** yedekler asla
  silinmez.

> Yedekler düğümde (ya da sunucunun yanında) durur. Yönetilen bir sunucuyu ya da düğümünü silmek
> yedeklerini de siler — saklamak istediklerinizi indirin.

## Zamanlanmış görevler {#schedules}

Zamanlanmış bir görev; bir cron ifadesi, bir saat dilimi ve bir görev listesidir: **Yeniden başlat** /
**Durdur**, bir **Komut** ya da bir **Yedek**. Oyuncular bir durdurma ya da yeniden başlatmadan önce
uyarılır (varsayılan 5 dakika). **Şimdi çalıştır** onu hemen çalıştırır. Zamanlanmış görevleri düğüm
çalıştırır; böylece Pano yeniden başlarken de çalışmaya devam ederler. Düğüm yoksa onları eklenti
çalıştırır.
