# Konteyner Çalışma Ortamı

Pano'nun konteyner içindeki davranışı: yeniden başlatma, güncelleme, runtime imajı, Java, bellek ve kullanıcılar.

## Konteyner modu {#container-mode}

Konteyner dışında, panelden yapılan bir yeniden başlatma ya da güncelleme yeni ve bağımsız bir `java`
süreci başlatır, eskisi de kapanır. Konteynerde bu, konteyneri durdurur: ana süreç kapanınca konteyner
de biter. Konteyner modunda Pano bunun yerine şunu yapar:

1. Yeni jar'ı `/data` içine hazırlar ve dosya adını `/data/.pano-jar` dosyasına yazar.
2. **75** çıkış koduyla kapanır.
3. İmajın `tini` altında çalışan başlatıcısı 75 çıkış kodunu görür ve `/data/.pano-jar` içinde adı
   yazan jar'ı başlatır. Konteyner çalışmaya devam eder.

Diğer tüm çıkış kodları konteyneri her zamanki gibi sonlandırır; yani yeniden başlatma politikanız
(örneğin `--restart unless-stopped`) çökmeleri yine yakalar.

## Güncelleme {#upgrading}

Daha yeni bir imaj çekin ve konteyneri yeniden oluşturun. [Compose](../#compose) ile:

```bash
docker compose pull && docker compose up -d
```

- **Kanal etiketleri** (`latest`, `beta`, `alpha`) her sürümle ilerler; çekmek yeterlidir.
- **Sürüm etiketleri** hiç değişmez: `.env` içinde `PANO_TAG=<version>` ayarlayın (ya da `docker run` içindeki etiketi değiştirin).

Açılışta imajın `pano-seed` adımı, imajın jar'ını `/data` içine **yalnızca imaj en son kurduğundan
farklı bir sürüm taşıyorsa** kopyalar. Yani:

- **Panelden** yapılan bir güncelleme, imajı değiştirene kadar konteyner yeniden başlatmalarında korunur.
- İmajı değiştirmek her zaman imajın sürümünü kurar, daha yeni bir panel güncellemesinin üzerine bile.

Daha eski bir etikete dönmek eski jar'ı kurar, ancak **veritabanı geri alınmaz**. Her güncellemeden önce
`/data`'yı ve veritabanını yedekleyin.

## `-bg` kullanmayın {#never-use-bg}

[`-bg`](../../installation/), Pano'nun kendisini bağımsız bir süreç olarak yeniden başlatıp kapanmasını
sağlar. Konteynerde bu kapanış konteyneri sonlandırır. İmajlar hiçbir zaman `-bg` vermez; siz de eklemeyin.

## Runtime imajı (ileri düzey) {#runtime-image}

`ghcr.io/panomc/pano:runtime-jre<N>` Java `N`'i, Bun'ı ve başlatıcıyı içerir, ancak Pano
sürümü **içermez**. Jar `/data` içinde durur ve `.pano-jar` onun adını tutar. Pano Host her instance'ı
bu şekilde çalıştırır.

```bash
mkdir pano && cd pano
# Pano-<version>.jar dosyasını https://panomc.com/download adresinden bu klasöre indirin
echo "Pano-<version>.jar" > .pano-jar
docker run -d --name pano --user "$(id -u):$(id -g)" --memory 1g \
  -v "$PWD":/data -p 8088:8088 ghcr.io/panomc/pano:runtime-jre11
```

Hiçbir şey otomatik kurulmaz: Pano sürümünü jar'ı ve `.pano-jar`'ı değiştirerek değiştirirsiniz. `<N>`
11, 17, 21 ya da 25'tir; `runtime-jre<N>-<version>` bir sürümle gelen derlemeyi sabitler.

## Java sürümü {#java-version}

Pano **Java 11**'i hedefler; bu yüzden minimumu Java 11'dir ve tam imaj onu kullanır. Kullandığınız bir
eklenti gerektiriyorsa daha yeni bir `runtime-jre<N>` seçin. Yerel `pano-node` üzerindeki
[yönetilen sunucular](../../server-management/managed-servers/) Java 17 veya daha yenisini ister.

İmajlar **glibc** tabanlıdır (Ubuntu üzerinde Eclipse Temurin). Argon2 şifre hashleme gibi Pano'nun bazı
yerel kütüphaneleri yalnızca glibc için derlenmiştir; **Alpine** gibi musl tabanlı bir imajda giriş
yapılamaz. Kendi imajınızı hazırlıyorsanız glibc tabanlı bir Java imajından başlayın.

## Bellek {#memory}

Java heap'i konteynerin bellek sınırına göre ayarlanır (varsayılan `-XX:MaxRAMPercentage=75`), bu yüzden
bir sınır verin (`--memory` ya da Compose'da `mem_limit`). Sınır JVM'i **ve** arayüzleri oluşturan Bun
süreçlerini kapsar; bkz. [Bellek ve Limitler](../../configuration/memory/). `PANO_JVM_ARGS` varsayılan
Java seçeneklerinin yerini alır.

## Root olmayan kullanıcı {#non-root}

İmajlar Pano'yu uid **10000** ile çalıştırır ve ek yetki gerektirmez. Pano Host instance'ları tüm yetkiler
kaldırılmış, `no-new-privileges` açık, kök dosya sistemi salt okunur, `/data` yazılabilir ve `/tmp`
geçici olacak şekilde çalıştırır. `--user` ile çalıştırıyorsanız o kullanıcının `/data`'ya yazabildiğinden
emin olun.
