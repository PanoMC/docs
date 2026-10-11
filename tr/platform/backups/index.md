# Yedekler

> Panelinizdeki **Yedekler** sayfasında bulunur. Pano Backup için bağlı bir Pano hesabı gerekir
> (**Panel → Ayarlar → Platform** ya da kurulum sihirbazının hesap adımı).

Bir yedek, Pano'nuzu size ait yapan her şeyi içerir: veritabanı, ayarlar, eklentiler, temalar ve yüklenen
dosyalar. Pano yedekleri iki yerde tutar: **kendi sunucunuzda** ve Pano hesabınızla gelen bulut depolama
olan **Pano Backup**'ta.

## Pano Backup {#pano-backup}

Pano Backup yedeklerinizi sunucunuzun dışında saklar; böylece bozulan bir disk ya da kaybedilen bir sunucu
yedekleri de götürmez.

- **Herkese ücretsiz.** Her hesabın **1 GB** ücretsiz depolama alanı vardır. Daha büyük bir depolama paketi
  Pano web sitesinden seçilebilir. Alan, hesaba bağlı tüm Pano'lar arasında paylaşılır.
- **İlk günden günlük.** Kurulum sihirbazının hesap adımında **Ücretsiz Pano Backup ile günlük yedek al**
  seçeneği çıkar. İşaretlerseniz Pano, kurulduğu günden itibaren her gün yedek alır. Zaten kurduysanız Yedekler
  sayfasında **Yedekleme ayarları**'nı açın, **Pano Backup zamanlaması**'nı **Günlük** (ya da Haftalık) yapıp saati seçin.
- **Sayı ve süre sınırı yok.** Yedekler siz silene ya da alan dolana kadar saklanır. Pano eski yedekleri
  kendiliğinden silmez.
- **Hemen yedekle.** **Pano Backup'a yedekle** düğmesi istediğiniz an bir yedek başlatır.

### Yedek türü {#backup-type}

**Yedekleme ayarları → Yedek türü** bölümünden Pano Backup'ın nasıl çalışacağını seçersiniz:

| Tür | Ne yapar |
| --- | --- |
| **Kayıt Noktası** (varsayılan) | Sonuncusundan bu yana yalnızca değişenleri gönderir; günlük yedekler çok az yer kaplar. Her Kayıt Noktası yine de tek başına geri yüklenebilir. |
| **Tam arşiv** | Her seferinde sitenin tamamını gönderir. Daha çok yer kaplar ve kendi parolanızla korunabilir (**Şifreleme parolası**). Bu parolayı kaybederseniz o arşivler bir daha açılamaz. |

Kayıt Noktaları kendi parolanızla korunmaz.

### Alan dolduğunda {#storage-full}

Alan dolmaya yaklaştığında ve dolduğunda **e-posta ve bildirimle** uyarılırsınız. Alan dolunca yeni yedekler
reddedilir; reddedilen bir yedek geride hiçbir şey bırakmaz. İhtiyacınız olmayan yedekleri silin ya da daha
büyük bir paket seçin.

## Geri yükleme {#restoring}

Yedekler sayfasında bir yedeğin yanındaki **Geri Yükle**'ye basın. Pano sırasıyla:

1. **mevcut parolanızı** ister,
2. [bakım moduna](../maintenance/) geçer,
3. önce mevcut durumun bir **güvenlik yedeğini** alır,
4. veritabanını, ayarları, eklentileri, temaları ve yüklenen dosyaları yedektekilerle değiştirir,
5. yeniden başlar. Bir şey ters giderse güvenlik yedeği geri getirilir.

Hesabınızın tamamlanmış her Kayıt Noktası, başka bir Pano'nuzda alınmış olsa bile, bu şekilde geri yüklenebilir.
Geri yükleme Pano'daki mevcut veriyi değiştirir, dikkatli kullanın.

## Silme ve indirme {#download}

- **Sil**, bir yedeği Pano Backup'tan kalıcı olarak kaldırır. Diğer yedekler olduğu gibi kalır.
- Bir kopya panelden (satırın menüsünden) ya da Pano web sitesindeki hesabınızın **Pano Backup** sayfasından **indirilebilir**. Bu sayfa tüm
  yedeklerinizi, her birinin hangi Pano'ya ait olduğuyla birlikte tek bir listede gösterir; buradan indirebilir
  ya da silebilirsiniz. Bir Kayıt Noktası sizin için paketlenir ve tek bir **`.panoarc`** dosyası olarak gelir.
- `.panoarc` dosyası, tam arşivin kullandığı tek dosyalık yedekle aynıdır. İstediğiniz yerde saklayın;
  Yedekler sayfasındaki **Dosyadan geri yükle** ile ya da yeni bir Pano'nun kurulum sihirbazındaki
  **Yedek dosyasından geri yükle** ile geri yükleyin.

Tarayıcınız büyük bir yedeği kaydedemiyorsa Pano'nun panelinden geri yükleyin.

## Kendi sunucunuzdaki yedekler {#local}

**Yedek oluştur**, yedeği kendi sunucunuza yazar. Bunları da zamanlayabilirsiniz (**Yerel yedek zamanlaması**);
zamanlanmışlardan yalnızca en yenileri tutulur, elle aldığınız yedekler ise asla otomatik silinmez. Yerel yedekler
kendi parolanızla şifrelenebilir. Arşiv biçimi [Instance'ları İşletme](../hosting/operations/#backups) sayfasında anlatılır.
