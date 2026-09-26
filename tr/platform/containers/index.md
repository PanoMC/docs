# Pano'yu Konteynerle Çalıştırma

Pano, [Pano Host](https://panomc.com/host)'un her Pano Instance'ı çalıştırdığı şekilde bir konteynerde
çalışabilir. Bu sayfa imajları ve hızlı başlangıcı anlatır. [Yapılandırma](configuration/) ortam
değişkenlerini ve `/data` birimini, [Çalışma Ortamı](runtime/) ise konteyner modunu, Java'yı ve belleği
açıklar.

> [!WARNING]
> **Henüz yayınlanmadı.** Konteyner imajları ve konteyner modu hâlâ geliştiriliyor ve henüz hiçbir Pano
> sürümünde yok. Bu sayfalardaki imaj adları ve davranışlar mevcut plana göredir, yayından önce
> değişebilir. O zamana kadar Pano'yu [`.jar`](../installation/) ile kurun.

## İmajlar

Pano'nun CI'ı GitHub Container Registry'ye iki imaj ailesi yayınlar:

| İmaj | İçerik | Ne zaman kullanılır |
| --- | --- | --- |
| `ghcr.io/panomc/pano:<version>` | Java çalışma ortamı **ve** o Pano sürümü | Docker ile hazır çalışan bir Pano istiyorsanız |
| `ghcr.io/panomc/pano-runtime:jre<N>` | Java `N` ve bir başlatıcı, Pano **yok** | Pano jar'ını ve arayüzlerini kendi biriminizde tutuyorsanız |

- `<version>`, [GitHub Releases](https://github.com/PanoMC/Pano/releases)'taki gibi bir Pano sürümüdür.
- `<N>` bir Java sürümüdür. Runtime ailesinde Pano'nun minimumu olan `jre11` **her zaman** bulunur,
  yanında daha yeni Java sürümleri de vardır. Bkz. [Java sürümü](runtime/#java-version).
- Runtime imajları **çoklu mimarilidir** (amd64 ve arm64), **root olmayan** bir kullanıcıyla çalışır ve
  **glibc** tabanlıdır. Bkz. [Çalışma Ortamı](runtime/).

`pano-runtime` ile Pano sürümü (jar + arayüzler) imajda değil, `/data` biriminde durur. Pano sürümünü
değiştirmek `/data` içindeki dosyaları değiştirmek demektir; panelden yapılan güncellemeler de `/data`'ya
yazılır, yani konteyner yeniden başlasa da kalır. Pano Host da bu şekilde çalışır.

## Hızlı başlangıç

1. Pano'nun verileri için bir klasör oluşturun ve içine bir Pano jar'ı koyun:

   ```bash
   mkdir pano && cd pano
   # Pano-<version>.jar dosyasını https://panomc.com/download adresinden bu klasöre indirin
   echo "Pano-<version>.jar" > .pano-jar
   ```

   `.pano-jar`, başlatılacak jar'ın **dosya adını** tutar. Bkz. [Konteyner modu](runtime/#container-mode).

2. Runtime imajını, klasör `/data`'ya bağlı olacak şekilde başlatın:

   ```bash
   docker run -d --name pano \
     --user "$(id -u):$(id -g)" \
     --memory 1g \
     -v "$PWD":/data \
     -p 80:<http-port> \
     ghcr.io/panomc/pano-runtime:jre11
   ```

   - `--user`, klasördeki dosyaların sizin olarak kalmasını sağlar; konteynerin root'a hiç ihtiyacı yoktur.
   - `--memory` aynı zamanda Java heap'ini de belirler. Bkz. [Bellek](runtime/#memory).
   - `<http-port>`, [`config.conf`](../configuration/) içindeki `server.http-port` değeridir.

3. `http://<sunucu-ip-adresiniz>/` adresini açın ve [Kurulum Sihirbazı](../installation/)'nı izleyin.

Pano'nun yine bir **MySQL veya MariaDB** veritabanına ihtiyacı vardır. Onu ayrı bir konteyner ya da
servis olarak çalıştırın; adresini sihirbazda ya da [ortam değişkenleriyle](configuration/#environment-variables)
Pano'ya verin.

## Bilmekte fayda var

- Konteynerde Pano'yu **asla** `-bg` ile başlatmayın. Bkz. [`-bg` kullanmayın](runtime/#never-use-bg).
- Konteyner çalışırken `config.conf` dosyasını **düzenlemeyin**. Bkz. [config.conf](configuration/#config-conf).
- Konteyneri `docker stop` ile durdurun; Pano düzgünce kapanır ve yapılandırmasını kaydeder.

## Başkaları için Pano barındırma

Pano Host, her Pano Instance için aynı imajlarla ve [Yapılandırma](configuration/) sayfasındaki ortam
değişkenleriyle bir konteyner çalıştırır.
