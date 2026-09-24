# Sunucu Yönetimi

Pano, Minecraft sunucularınızı panelden yönetir: konsol, oyuncular, eklentiler, dosyalar, yedekler,
zamanlanmış görevler ve güç. Pano'nun içinde yerleşiktir — Pano tarafında kurulacak hiçbir şey yoktur.

**Sunucu yönetimi** ve **Her ikisi** [kullanım modlarında](../configuration/#genel-ayarlar) kullanılabilir.
**Web sitesi** modunda kapalıdır; eklentiyle sunucu bağlamak yine çalışır, zaten eşleşmiş düğümler de
siz geri geçene kadar sunucularını çalıştırmaya devam eder.

> ⚠️ Sunucu yönetimi önce **alpha** kanalında, uyumlu `pano-mc-plugin` ve `pano-node` sürümleriyle
> birlikte yayınlanır. Kararlı bir kurulumda henüz bulunmayabilir.

## Sunucu Pano'ya nasıl bağlanır {#linked-and-managed-servers}

Bir sunucu Pano ile **Pano eklentisi**, bir **düğüm** ya da ikisi birden üzerinden konuşur:

| | Pano eklentisi | Düğüm |
| --- | --- | --- |
| Nedir | Sunucunun içindeki [Pano MC Eklentisi](../integrations/) | Sunucunun sürecini çalıştıran [`pano-node`](pano-node/) arka plan süreci |
| Ne bilir | TPS, MSPT, gerçek oyuncu listesi, yüklenmiş eklentiler | Süreci, dosyalarını ve günlüklerini — sunucu dururken bile |
| Yalnızca o yapabilir | TPS ve MSPT ölçmek, her oyuncuyu listelemek | Sunucuyu başlatmak ve sonlandırmak, sunucu oluşturmak ve silmek |

- **Bağlı** bir sunucuda yalnızca eklenti vardır: onu siz çalıştırırsınız, Pano onunla konuşur.
- **Yönetilen** bir sunucu bir [düğüm](managed-servers/) üzerinde çalışır. Pano ona eklentiyi de
  kurar; yani ikisine birden sahiptir.

Her özelliği, onu yapabilen taraf üstlenir. İkisi de yapamıyorsa sayfa yine açılır; kontrolleri kapalı
olur ve neyin eksik olduğunu söyleyen bir uyarı çıkar — eklentiyi kurun ya da güncelleyin, sunucuyu
başlatın ya da düğümü yeniden çevrimiçi yapın.

## Sunucu bağlama {#linking-a-server}

1. Platformunuza uygun [Pano MC Plugin](https://github.com/PanoMC/pano-mc-plugin/releases) jar
   dosyasını sunucunun `plugins/` (ya da `mods/`) klasörüne koyun ve sunucuyu yeniden başlatın.
2. Panelde üst çubuktaki **sunucu seçiciyi** açın → **Sunucu ekle** → **Pano eklentisiyle bağla**,
   ardından gösterdiği komutu sunucu konsolunda çalıştırın:

   ```
   /pano connect <platform-address> <platform-code>
   ```

   Kod her 30 saniyede bir yenilenir.
3. Açılan pencerede isteği kabul edin.

`/pano status` (`pano.admin` izni) bağlantıyı sunucu tarafından gösterir: Pano adresi, bağlı olup
olmadığı ve ne kadar süredir bağlı olduğu, gecikme, son heartbeat, Pano'nun açtığı entegrasyonlar ve
eklenti sürümü.

**Sunucu ekle**'nin iki seçeneği daha vardır: bir düğüm üzerinde **Yeni sunucu oluştur** — bkz.
[Yönetilen Sunucular](managed-servers/) — ve zaten çalıştırdığınız bir sunucuyu yerinden taşımadan
Pano'ya devreden **Pano Agent ile bağla** — bkz. [Pano Agent](pano-node/#pano-agent).

## Desteklenen platformlar {#supported-platforms}

| | Paper · Folia · Purpur | Spigot | Velocity · BungeeCord | Fabric |
| --- | --- | --- | --- | --- |
| Konsol, atma, mesaj | Var | Var | Var | Var |
| Yeniden başlatma | Var | Var | — | — |
| TPS / MSPT | Var | Yalnızca TPS | — | Var |
| OP, oyun modu | Var | Var | — | Var |
| Eklentiyi oyun içinde açma / kapatma | Var | Var | — | — |

Vanilla'nın eklentisi olmadığından yalnızca yönetilen sunucu olarak çalışır; konsol ve güç düğümden
gelir. Fabric modu Minecraft 26.1 veya üstünü ister. Forge ve NeoForge henüz katalogda değil. Eklentinin **protokol 2** konuşması gerekir: daha eski
bir eklenti yine bağlanır, ama siz onu güncelleyene kadar sayfaları kapalı kalır.

## Panelde yol bulma {#finding-your-way}

- Panel kenar çubuğundaki **Sunucu**, seçili sunucunun sayfalarını listeler — bkz.
  [Sunucu Sayfaları](server-pages/).
- Üst çubuktaki **sunucu seçici** sunucuyu değiştirir, arama yapar ve **Sunucu ekle**'yi sunar.
  Kırmızı **!**, çöken ya da eklentisi, düğümü veya Pano Agent'ı bu Pano için eski kalan sunucuyu
  işaretler.
- Yanındaki **düğüm simgesi** Düğümler sayfasını açar (**Düğümleri Yönet** izni gerekir).

## Pano'yu web sitesi olmadan kullanma {#using-pano-without-a-website}

Kurulum sihirbazında ya da sonradan **Ayarlar → Platform → Tercihler** altında **Sunucu Yönetimi**'ni
seçin ([`usage-mode`](../configuration/#genel-ayarlar) anahtarı). Pano bu durumda tema başlatmaz,
**Yazılar**, **Talepler** ve **Görünüm** kapatılır (mevcut yazılar ve talepler korunur) ve herkese açık
adresler panele yönlendirilir.

- Oturum kapalıyken her panel adresi, panelin kendi **giriş formunu** o adreste gösterir; giriş
  yaptıktan sonra aynı sayfada kalırsınız. `/panel/login` de çalışır.
- Orada yalnızca **panel erişimi** olan hesaplar giriş yapabilir.
  [Auth Guard](../../plugins/auth-guard/) istediğinde iki adımlı doğrulama da çalışır.
- Çıkış yapmak sayfayı yeniler ve formu yeniden gösterir.
- **Ayarlar → Web sitesi** yalnızca **Panel adı**'nı gösterir; web sitesine özgü alanlar gizlenir.

## Yardım gerekiyor mu? {#need-help}

- [SSS sayfasına](../FAQ/) göz atın
- [Discord topluluğumuzda](https://discord.gg/6vVy72wgXT) sorun
- [GitHub](https://github.com/PanoMC/Pano/issues) üzerinden bir issue açın
