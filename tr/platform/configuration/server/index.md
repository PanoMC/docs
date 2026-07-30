# Sunucu Yapılandırması

## Sunucu Ayarları

```jsonc
server {
  host = "0.0.0.0"
  http-port = 80
  https-port = 443
  ssl-mode = "DISABLED" # "DISABLED", "LETS_ENCRYPT", "MANUAL"
  redirect-https = false
  ssl-cert = null # Ham sertifika içeriği (MANUAL ise)
  ssl-key = null  # Ham özel anahtar içeriği (MANUAL ise)
  ui-max-memory-mb = 200 # Spawn edilen her UI runtime'ı için maksimum MB; 0 kapatır
  trusted-proxies = [] # e.g. ["127.0.0.1", "10.0.0.5"] — proxies allowed to set X-Forwarded-For
}
```

- `host`: `0.0.0.0` paneli dış ağlara açık hale getirir; `127.0.0.1` erişimi yalnızca yerel ile sınırlandırır.
- `http-port`: HTTP trafiği için varsayılan port (genellikle **80**).
- `https-port`: HTTPS trafiği için varsayılan port (genellikle **443**).
- `ssl-mode`:
    - `DISABLED`: HTTPS sunucusu başlatılmaz.
    - `LETS_ENCRYPT`: Otomatik olarak bir SSL sertifikası almaya ve yapılandırmaya çalışır. **Not:** Bunun çalışması için geçerli bir `website-url` yapılandırılmalı, **http-port** `80` ve **https-port** `443` olarak ayarlanmalıdır.
    - `MANUAL`: Kendi sertifikanızı ve anahtar dize bilgilerinizi doğrudan `ssl-cert` ve `ssl-key` üzerinden sağlamanıza olanak tanır.
- `redirect-https`: `true` olarak ayarlanırsa, tüm HTTP trafiği otomatik olarak HTTPS'ye yönlendirilir.
- `ui-max-memory-mb`: Spawn edilen **her** UI runtime'ı (setup-ui, panel-ui, aktif tema) için bellek tavanı (MB); Pano aşan UI'ı yeniden başlatır. Varsayılan **200**, `0` kapatır. Bkz. [Bellek ve Limitler](../memory/).
- `trusted-proxies`: `X-Forwarded-For` başlığını ayarlamasına izin verilen ters vekil (reverse proxy) IP adresleri. **Varsayılan olarak boştur**; bu durumda başlık yok sayılır ve her istek doğrudan bağlantı sayılır. Pano bir Nginx, Apache veya Cloudflare arkasındaysa doldurun; aksi halde ziyaretçiyi adresine göre tanıyan özellikler — örneğin [bakım modu](../../maintenance/) giriş yasakları — ziyaretçi yerine vekili görür.
- **Gelişmiş:** Karmaşık kurulumlar için hala bir **reverse proxy** (Nginx, Apache) veya Cloudflare kullanabilirsiniz.
## Ters Vekil Arkasında WebSocket Bağlantısını Canlı Tutma

**pano-mc-plugin** üzerinden bağlanan her Minecraft sunucusu, `GET /api/server/connection` adresine uzun
ömürlü bir WebSocket bağlantısı tutar. Pano bir ters vekil (reverse proxy) arkasındaysa (Nginx, Cloudflare,
bulut yük dengeleyici), boşta kalan bir WebSocket *vekilin kendi* boşta kalma zaman aşımı tarafından
kapatılır — Nginx'in `proxy_read_timeout` değeri varsayılan olarak **60 saniyedir** — bu, Pano veya
eklentinin bağlantıyı hiç bırakmayacağı sürenin çok altındadır. Eklentinin yeniden bağlanma mantığı bu
belirtiyi gizler (otomatik olarak yeniden bağlanır), ancak her yeniden bağlanmada tüm RSA/AES anahtar
değişimi baştan çalışır; yani sağlıklı görünen bir bağlantı aslında sessizce CPU harcar, kayıtları yeniden
bağlanma satırlarıyla doldurur ve uçuştaki bir mesajın kaybolabileceği kısa bir pencere açar.

Bunu önlemek için **her iki taraf da** ping gönderir — eklenti Pano'ya WebSocket **ping** çerçeveleri
gönderir, Pano da eklentiye kendi **ping** çerçevelerini gönderir; her biri bağımsız olarak ve kendi
zamanlamasında çalışır, taraflardan her biri diğerinin ping'ine WebSocket protokolü seviyesinde otomatik
olarak **pong** ile yanıt verir. Bu, mesaj şifreleme katmanının dışında kalan, protokol seviyesinde bir
canlı tutma mekanizmasıdır ve AES-256-GCM yüküne asla dokunmaz. İki yön, her biri kendi tarafına ait iki
*ayrı* yapılandırma tarafından kontrol edilir:

- **Eklentinin** ping'i — **eklentinin kendi** `config.conf` dosyasındaki iki ayar (Minecraft
  sunucusundaki Pano eklentisinin veri klasöründe — bu sayfanın başka yerinde gösterilen Pano'nun kendi
  yapılandırması değil):
    - `heartbeat-interval`: ping'ler arasındaki saniye sayısı. Varsayılan **25**.
    - `heartbeat-timeout`: bir yanıt için beklenecek saniye sayısı; bu süre dolarsa bağlantı ölü sayılır
      ve eklenti yeniden bağlanır. Varsayılan **75**.
    - Başlangıçta doğrulanır: `heartbeat-interval` `0`'dan büyük olmalıdır (üst sınırı yoktur);
      `heartbeat-timeout` ise hem aralığın iki katına hem de 10 saniyelik bir kapanış anlaşması payına
      yer bırakmalıdır — yani `heartbeat-timeout ≥ (2 × heartbeat-interval) + 10`. Sınırların dışında
      kalan bir çift eklentinin yüklenmesini engellemez — bir uyarı kaydedilir ve her iki değer için de
      varsayılan **25s** / **75s**'ye dönülür.
- **Pano'nun kendi** ping'i — Pano'nun kendi `config.conf` dosyasındaki `mc-server-connection` bloğu,
  bkz. [Minecraft Sunucu Bağlantısı](../#minecraft-sunucu-baglantısı):
    - `heartbeat-interval-seconds`: Pano'nun bağlı her Minecraft sunucusuna gönderdiği ping'ler
      arasındaki saniye sayısı. Varsayılan **25**.
    - `heartbeat-timeout-seconds`: bir pong gelmeden beklenecek saniye sayısı; bu süre dolarsa Pano
      bağlantıyı ölü sayar ve kapatır. Varsayılan **75**.
    - Başlangıçta doğrulanır: `heartbeat-interval-seconds` `0`'dan büyük ve en fazla **55** olmalıdır;
      `heartbeat-timeout-seconds` ise aralığın en az iki katı olmalıdır. Sınırların dışında kalan bir
      çift Pano'nun başlamasını engellemez — bir uyarı kaydedilir ve her iki değer için de varsayılan
      **25s** / **75s**'ye dönülür.

Heartbeat yalnızca vekilinizin kendi boşta kalma zaman aşımı, yukarıdaki iki aralıktan **kısa olanından**
uzunsa işe yarar. Pano'nun önünde Nginx çalıştırıyorsanız, zaman aşımını **yalnızca WebSocket
location'ında** artırın — bunu tüm `server` bloğunda artırmak, Nginx'in sıradan HTTP isteklerinde ne kadar
bekleyeceğini de değiştirir; bu genelde istenmez. Bu location içine `proxy_set_header` direktiflerinin
tamamını da tekrar yazın: aynı isimli bir direktif daha alt seviyede tekrar tanımlandığında, kalıtılan
tüm seti **eklemek yerine değiştirir**; yani yalnızca `Upgrade`/`Connection` ayarlayan bir location, üst
seviyede tanımlı `Host` / `X-Real-IP` / `X-Forwarded-For` ayarlarını sessizce düşürür — bu durumda Pano,
bağlı her Minecraft sunucusunun adresini gerçek adresi yerine vekilin kendi IP'si olarak kaydeder ve
sayfanın yukarısındaki `trusted-proxies` rehberliğini sessizce bozar:

```nginx
location /api/server/connection {
    # 8080'i kendi server.http-port değerinizle değiştirin (config.conf) — varsayılan olsa
    # bile burada 80 KULLANMAYIN: bu kurulumda Nginx'in kendisi 80 portunu dinliyor, bu yüzden
    # 127.0.0.1:80'e proxy yapmak Pano'ya değil, Nginx'in kendisine geri döner.
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_read_timeout 90s;
    proxy_send_timeout 90s;
    proxy_socket_keepalive on;
}
```

90 saniye, Nginx aksi halde boşta kalan bir soketi kapatmadan önce her iki taraftaki 25 saniyelik
varsayılan heartbeat'e bolca pay bırakır.

> Cloudflare ve çoğu bulut yük dengeleyici, vekillenen bağlantılarda aynı sınıftan bir boşta kalma zaman
> aşımı uygular — bkz.
> [Pano'yu Cloudflare Arkasında Kullanma](../../advanced/cloudflare/#cloudflare-ve-yuk-dengeleyicilerde-bosta-kalma-zaman-asımları).
## Başlatma, Arayüz ve Güncellemeler

```jsonc
init-ui = true
accept-plugin-auth = true
jwt-key = "<auto-generated-base64>"
update-period = "ONCE_PER_DAY" # "ONCE_PER_DAY" veya "ONCE_PER_WEEK" veya "ONCE_PER_MONTH"
release-channel = "RELEASE" # "ALPHA", "BETA", "RELEASE"
console-history-limit = 50
```

**Detaylar**

- `init-ui`: başlatma sırasında **kurulum sihirbazını, paneli ve tema çekirdeğini** başlatır.
- `accept-plugin-auth`: Pano MC eklentisinin bağlantısını etkinleştirir/devre dışı bırakır (varsayılan: `true`). **Sunucu Bağla** modalından yönetilebilir. Daha iyi güvenlik için kullanılmadığında devre dışı bırakın.
- `jwt-key`: otomatik oluşturulan **Base64 kimlik anahtarıdır** — **manuel değiştirmeyin**.
- `update-period`: güncelleme kontrol sıklığını belirler.
- `release-channel`: Pano'nun hangi güncelleme akışını izleyeceğini belirler:
    - `ALPHA`: Yeni özelliklere erken erişim. Hatalar ve bozucu değişiklikler riski yüksektir.
    - `BETA`: Alfa'dan daha düşük riskli, ancak yine de hata içerebilen yayın öncesi özellikler.
    - `RELEASE`: En kararlı sürüm. Güncellemeleri daha seyrek alır ancak maksimum güvenilirlik sağlar.
- `console-history-limit`: terminal ve GUI konsol geçmişinde saklanacak maksimum komut sayısını belirler (varsayılan: `50`). Geçmiş özelliğini devre dışı bırakmak için `0` olarak ayarlayın.
## Dosya Yükleme ve Yollar

```jsonc
file-uploads-folder = "file-uploads"

file-paths = {
  favicon {
    path = "uploads/favicon.png"
    hash = "<sha256-hash>"
  }
  websiteLogo {
    path = "uploads/logo.png"
    hash = "<sha256-hash>"
  }
}
```

**Notlar**

- **Panel → Ayarlar → Website** tarafından yönetilir.
- Her giriş, şunları içeren bir **FileInfo** nesnesidir:
    - `path`: Dosyanın göreli yolu.
    - `hash`: Pano tarafından dosya bütünlüğünü doğrulamak için kullanılan SHA-256 karması.
- Yalnızca iki giriş desteklenir: `favicon` ve `websiteLogo`.
- Bu alanlar **Pano tarafından otomatik olarak yönetilir** — manuel değişiklikler güncellemelerde veya ayar değişikliklerinde üzerine yazılır.
## Pano Servis URL’leri (Değiştirmeyin)

```jsonc
pano-api-url = "..."     # ortama göre otomatik ayarlanır
pano-website-url = "..."
```

- Pano tarafından otomatik olarak yönetilir.
- Bunları değiştirmek, Pano ekosistemiyle bağlantı sorunlarına yol açabilir.
## Kurulum İlerlemesi (Dahili)

```jsonc
setup {
  step = 0
}
```

**Kullanım**

- Kurulum ilerlemesini takip eder.
- Düzenlemeden önce **Pano’yu kapatın**.
- `step = 0`: kurulum sihirbazını yeniden başlatır.
- `step = 5`: kurulumu tamamlanmış olarak işaretler.
- Sadece destek ekibinin yönlendirmesiyle değiştirin; yanlış düzenleme kurulumu bozabilir.
