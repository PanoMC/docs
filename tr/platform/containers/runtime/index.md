# Konteyner Çalışma Ortamı

Pano'nun konteyner içindeki davranışı: yeniden başlatma ve güncellemeler, Java, bellek ve kullanıcılar.

> [!WARNING]
> **Henüz yayınlanmadı.** Konteyner modu konteyner imajlarıyla birlikte gelecek ve henüz hiçbir Pano
> sürümünde yok. Bkz. [Pano'yu Konteynerle Çalıştırma](../).

## Konteyner modu {#container-mode}

Konteyner dışında, panelden yapılan bir yeniden başlatma ya da güncelleme yeni ve bağımsız bir `java`
süreci başlatır, eskisi de kapanır. Konteynerde bu, konteyneri durdurur: ana süreç kapanınca konteyner
de biter.

Konteyner modunda Pano bunun yerine şunu yapar:

1. Yeni jar'ı `/data` içine hazırlar ve dosya adını `/data/.pano-jar` dosyasına yazar.
2. **75** çıkış koduyla kapanır.
3. İmajın başlatıcısı (`tini` altında PID 1 olarak çalışır) 75 çıkış kodunu görür ve `/data/.pano-jar`
   içinde adı yazan jar'ı başlatır. Konteyner çalışmaya devam eder.

Diğer tüm çıkış kodları konteyneri her zamanki gibi sonlandırır; yani yeniden başlatma politikanız
(örneğin `--restart unless-stopped`) çökmeleri yine yakalar. Pano Host, 75 çıkışını çökme değil planlı
bir yeniden başlatma olarak görür.

## `-bg` kullanmayın {#never-use-bg}

[`-bg`](../../installation/), Pano'nun kendisini bağımsız bir süreç olarak yeniden başlatıp kapanmasını
sağlar. Konteynerde bu kapanış konteyneri sonlandırır. İmajlar hiçbir zaman `-bg` vermez; siz de eklemeyin.

## Java sürümü {#java-version}

Pano **Java 11**'i hedefler; bu yüzden minimumu Java 11'dir ve her runtime ailesinde `jre11` bulunur.
Daha yeni Java sürümleri de çalışır; kullandığınız bir eklenti gerektiriyorsa yenisini seçin. Yerel
`pano-node` üzerindeki [yönetilen sunucular](../../server-management/managed-servers/) Java 17 veya daha yenisini ister.

Pano Host yeni bir instance'ı, Pano sürümünün ihtiyaç duyduğu minimum Java ile (jar'dan okunur)
başlatır ve daha yenisini seçmenize izin verir. Daha eskisi reddedilir.

## Alpine değil, glibc {#glibc-not-alpine}

İmajlar **glibc** tabanlıdır (Ubuntu üzerinde Eclipse Temurin). Argon2 şifre hashleme gibi Pano'nun bazı
yerel kütüphaneleri yalnızca glibc için derlenmiştir. **Alpine** gibi musl tabanlı bir imajda giriş
yapılamaz. Kendi imajınızı hazırlıyorsanız glibc tabanlı bir Java imajından başlayın.

## Bellek {#memory}

Java heap'i konteynerin bellek sınırına göre ayarlanır (`-XX:MaxRAMPercentage`), bu yüzden her zaman bir
sınır verin (`--memory`). Sınır JVM'i **ve** arayüzleri oluşturan Bun süreçlerini kapsar; Pano'nun belleği
nasıl kullandığı için [Bellek ve Limitler](../../configuration/memory/) sayfasına bakın. Pano Host heap'i
instance belleğinin yaklaşık %75'ine ayarlar.

İmajlar Bun ile gelir, bu yüzden Pano ilk açılışta onu indirmez.

## Root olmayan kullanıcı {#non-root}

İmajlar Pano'yu **root olmayan** bir kullanıcıyla çalıştırır ve ek yetki gerektirmez. Pano Host
instance'ları tüm yetkiler kaldırılmış, `no-new-privileges` açık, kök dosya sistemi salt okunur,
`/data` yazılabilir ve `/tmp` geçici olacak şekilde çalıştırır. `--user` ile çalıştırıyorsanız o
kullanıcının `/data`'ya yazabildiğinden emin olun.
