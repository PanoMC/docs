# Instance'ları İşletme

Instance'lar çalıştıktan sonraki günlük işler: güncellemeler, yedekler, çökmeler ve loglar.

> [!WARNING]
> **Henüz yayınlanmadı.** Konteyner modu ve `.panoarc` arşiv biçimi henüz hiçbir Pano sürümünde yok.
> Bkz. [Başkaları için Pano Instance Barındırma](../).

## Güncelleme ve geri alma {#updates-and-rollback}

Bir instance'ın sürümü iki yolla değişebilir:

- **Sizin tarafınızdan**: konteyneri durdurun, yeni jar'ı ve arayüzleri (sha256 kontrollü) `/data`
  içine koyun, geri almak için öncekileri saklayın, `/data/.pano-jar` dosyasını güncelleyin, başlatın.
- **Pano'nun kendi panelinden**: [konteyner modunda](../../containers/runtime/#container-mode) Pano yeni
  jar'ı `/data` içine hazırlar, `.pano-jar` dosyasını günceller ve **75** koduyla çıkar. Başlatıcı yeni
  jar'ı çalıştırır, konteyner çalışmaya devam eder.

75 çıkış kodunu çökme olarak değil, her zaman planlı bir yeniden başlatma olarak değerlendirin.

Geri almak için `.pano-jar` dosyasını önceki jar'a yönlendirin ve yeniden başlatın. Daha yeni bir sürüm
açıldığında Pano veritabanını ileriye taşır; bu yüzden veritabanı değişikliklerini geri almanın güvenli
yolu bir yedeği geri yüklemektir.

## Yedekler {#backups}

Her instance'ı düzenli olarak yedekleyin ve yedekleri **sunucunun dışında** saklayın. Pano Host her gün
S3 depolamaya yedek alır ve pakete göre 3, 7 ya da 30 gün saklar.

Bir Pano Instance yedeği tek bir **`.panoarc`** arşividir. Aynı biçim yedekler, dışa aktarmalar, içe
aktarmalar, sunucular arası taşımalar ve [Pano Backup](https://panomc.com/host) için kullanılır. İçinde
şunları tutan bir zip'tir:

| Girdi | İçerik |
| --- | --- |
| `db/dump.sql.gz` | instance veritabanının mantıksal dökümü (yalnızca tablolar ve veriler) |
| `app/config.conf` | instance'ın yapılandırması |
| `app/plugins/`, `app/themes/` | kurulu eklentiler ve temalar |
| `app/file-uploads/`, `app/maintenance/` | yüklemeler ve bakım modu dosyaları |
| `manifest.json` | son girdi: Pano sürümü, veritabanı şema sürümleri ve dosya başına bir hash |

Pano jar'ı, `libraries/`, paketli arayüzler ve `logs/` arşivde **yoktur**; manifest bunun yerine Pano
sürümünü kaydeder. Sembolik bağlantılar atlanır.

Arşiv **AES-256-GCM** ile şifrelenebilir: ya sizin sakladığınız, instance başına rastgele bir anahtarla
ya da sahibin parolasından (Argon2id) türetilen bir anahtarla. Kaybedilen bir parola kurtarılamaz.

### Geri yükleme

1. Arşivi instance'ın disk kotası dışındaki bir hazırlık klasörüne indirin, şifresini çözün ve
   manifest'teki her hash'i kontrol edin.
2. Mevcut durumun bir güvenlik yedeğini alın.
3. Instance'ı durdurun. Pano sürümünün en az arşivin sürümü olduğundan emin olun: arşivden daha eski bir
   Pano'ya geri yükleme reddedilir.
4. Instance veritabanının **tablolarını** silin ve dökümü instance'ın kendi (iç) kullanıcısıyla içe
   aktarın.
5. `app/` dosyalarını değiştirin ve hedef sunucuya ait ayarları yeniden yazın: veritabanı adresi ve
   kimlik bilgileri, portlar ve TLS, SMTP.
6. Instance'ı başlatın. Daha yeni bir Pano verileri açılışta taşır.

## Çökmeler {#crashes}

Çöken instance'ları otomatik olarak yeniden başlatın, ama sonsuza kadar değil. Pano Host **10 dakikada
3'ten fazla** çöken bir instance'ı durdurur, sahibine ve bir yöneticiye bildirir, bellek yetmediyse daha
büyük bir paket önerir.

## Loglar {#logs}

Gürültülü bir instance diski dolduramasın diye Docker'ın boyut sınırlı döndürmeli `local` log sürücüsünü
kullanın. Pano Host instance loglarını sunucuda 14 gün saklar ve instance'ın yönetim sayfasında komut
girilebilen bir konsolla canlı gösterir.

## Ya da Pano Host yapsın {#pano-host}

[Pano Host](https://panomc.com/host) bu kurulumun tamamını sizin için çalıştırır: her Pano Instance
kendi konteynerini, veritabanını, yedeklerini, `*.panomc.site` alt alan adını, ücretsiz SSL'ini ve
e-posta relay'ini alır; hepsi panomc.com üzerinden yönetilir.
