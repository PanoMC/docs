# Pano'yu Cloudflare Arkasında Kullanma

Pano kurulumunuza gelen trafiği **Cloudflare** üzerinden yönlendiriyorsanız birkaç ayar yapmanız gerekir — aksi takdirde kurulum sihirbazı bittikten hemen sonra sonsuz yönlendirme döngüsü, `521`/`525`/`526` hataları veya "bu sayfa düzgün yönlendirilemiyor" mesajlarıyla karşılaşabilirsiniz.

Bu rehberde, alan adınızı Cloudflare'e eklediğiniz ve Pano'yu çalıştıran sunucuya bir `A` (ya da `AAAA`) kaydı yönlendirip proxy'yi (turuncu bulut) **etkinleştirdiğiniz** varsayılmaktadır.

## SSL/TLS modu Flexible olmalı

Pano varsayılan olarak **80** numaralı port üzerinde düz HTTP servis eder ve origin tarafında TLS sonlandırması **yapmaz**. Cloudflare'in şifreleme modu **Full** veya **Full (strict)** olarak ayarlanırsa, Cloudflare origin'inize HTTPS üzerinden ulaşmaya çalışır — fakat Pano bu portu dinlemediği için istek başarısız olur.

Şifreleme modunu **Flexible** olarak ayarlayın:

1. [Cloudflare panelini](https://dash.cloudflare.com/) açın ve sitenizi seçin.
2. **SSL/TLS → Overview** bölümüne gidin (yeni panellerde: **SSL/TLS → Configuration**).
3. Şifreleme modunu **Flexible** olarak seçin.

Flexible modunda:

- Tarayıcı ⇄ Cloudflare arası şifrelidir (HTTPS).
- Cloudflare ⇄ Pano arası **80**'inci port üzerinden düz HTTP'dir.

> [!WARNING]
> Flexible modu, Cloudflare ile sunucunuz arasındaki trafiğin **şifrelenmediği** anlamına gelir. Sunucunuz herkese açık bir ağdaysa ve hassas veri işliyorsa, bunun yerine origin'de TLS sonlandırması yapın (örneğin Let's Encrypt sertifikalı bir Nginx ya da Caddy reverse proxy ile) ve **Full (strict)** modunu kullanın. Bkz. [Üretim Kurulumu](../../configuration/production/).

## `website-url` değerini `https://` ile yapılandırın

Pano'nun kendisi HTTP üzerinden çalışsa da kullanıcılar sitenize Cloudflare üzerinden HTTPS ile erişir. `website-url` değerinizin bunu yansıttığından emin olun — aksi halde parola sıfırlama / doğrulama e-postaları `http://` linkleri içerecek, yönlendirme döngüleri oluşabilecek ve tarayıcılar mixed content'i güvensiz olarak işaretleyebilecektir.

`config.conf` dosyasını düzenleyin:

```jsonc
website-url = "https://alanadiniz.com"
```

Değişikliği kaydedin ve **Pano'yu yeniden başlatın**.

## Önerilen Cloudflare ayarları

**SSL/TLS → Edge Certificates** altında:

- **Always Use HTTPS:** **Açık** — `http://` ile gelen istekleri Cloudflare kenarında doğrudan `https://`'e yönlendirir.
- **Automatic HTTPS Rewrites:** **Açık** — Cloudflare üzerinden sunulan sayfalardaki karışık içerikli `http://` linklerini otomatik olarak yeniden yazar.

**Rules → Page Rules** (yeni panellerde **Cache Rules**) bölümünde: agresif önbellekleme açıyorsanız yönetici paneli ve API yollarını hariç tutun; böylece dinamik yanıtlar asla önbellekten servis edilmez.

## Doğrulama

Ayarları uyguladıktan sonra:

1. Değişikliklerin yayılması için Cloudflare'e bir-iki dakika süre verin.
2. Alan adınızı bir gizli/incognito tarayıcı sekmesinde açın.
3. Geçerli bir Cloudflare HTTPS sertifikası görmelisiniz.
4. Pano, yönlendirme döngüsü olmadan açılmalı ve parola sıfırlama e-postaları `https://` linkleri içermelidir.

## Flexible modunu ne zaman kullanmamalı?

Gerçek uçtan uca şifreleme gerekiyorsa (kullanıcı verisi işleyen üretim kurulumları için önerilir) Flexible kullanmayın. Bunun yerine:

1. Pano'nun önüne geçerli bir TLS sertifikalı (Let's Encrypt iş görür) bir reverse proxy (Nginx, Caddy, Traefik) yerleştirin.
2. Cloudflare şifreleme modunu **Full (strict)** olarak ayarlayın.
3. `config.conf` içinde `website-url = "https://..."` değerini koruyun.

Böylece Cloudflare ⇄ Origin arası da şifrelenir ve sertifika doğrulaması yapılır.

## Cloudflare ve Yük Dengeleyicilerde Boşta Kalma Zaman Aşımları

[Ters Vekil Arkasında WebSocket Bağlantısını Canlı Tutma](../../configuration/server/#ters-vekil-arkasında-websocket-baglantısını-canlı-tutma)
sayfasında anlatılan 60 saniyelik boşta kalma zaman aşımı yalnızca Nginx'e özgü bir sorun değildir.
Cloudflare'in proxy'si ve çoğu bulut yük dengeleyici (AWS ALB/NLB, GCP vb.) de boşta kalan vekillenen
bağlantıları kendi zaman aşımlarından sonra kapatır ve bunu kendi Nginx'inizdeki `proxy_read_timeout` gibi
ayarlayamazsınız. Pano'nun heartbeat'i (eklentinin kendi `config.conf` dosyasındaki `heartbeat-interval` /
`heartbeat-timeout`, varsayılan **25s** / **75s**) tam olarak bu yüzden var: bağlantı, bunlardan hiçbirini
tetikleyecek kadar boşta kalmaz — Cloudflare tarafında herhangi bir şey değiştirmenize gerek yoktur.

Bağlı bir Minecraft sunucusunun bağlantısı Cloudflare veya bir yük dengeleyici arkasında hâlâ periyodik
olarak düşüyorsa:

- Eklentinin `config.conf` dosyasındaki `heartbeat-interval` değerinin, yoldaki en kısa boşta kalma zaman
  aşımına yakın (veya onu aşacak) bir değere çıkarılmadığından emin olun.
- Eklenti ile Pano arasında **birden fazla sıçrama** olup olmadığını kontrol edin — ek bir yük dengeleyici,
  bir CDN veya dahili bir ters vekil, her biri kendi boşta kalma zaman aşımını uygular ve yalnızca en kısa
  olanı önemlidir.
- Cloudflare'in **arkasında** ayrıca Nginx (veya başka bir ters vekil) çalışıyorsa, onun da zaman aşımının
  artırıldığından emin olun — bkz.
  [Ters Vekil Arkasında WebSocket Bağlantısını Canlı Tutma](../../configuration/server/#ters-vekil-arkasında-websocket-baglantısını-canlı-tutma).

## Yardım ve Destek

- [SSS sayfasını](../../FAQ/) ziyaret edin
- [Discord topluluğumuza](https://discord.gg/6vVy72wgXT) sorun
- [GitHub](https://github.com/PanoMC/Pano/issues) üzerinde issue açın
