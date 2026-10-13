# Elle Kurulum (.jar)

Pano `.jar` dosyasını, tıpkı **Spigot** veya **Paper** gibi kendiniz çalıştırın. **Java 11 veya üzeri** ile bir
MySQL / MariaDB veritabanını siz sağlarsınız ve Pano'yu çalışır halde siz tutarsınız. Sizin yerinize yapılsın
ister misiniz? [Tek komutla kurulumu](../installer/) veya [Docker](../../containers/)'ı kullanın.

## Pano’yu İndirme

Pano’nun en son sürümünü resmi web sitesinden indirebilirsiniz:

- [En Son Sürümü İndir →](https://panomc.com/downloads)
- Daha eski sürümler için [GitHub Releases](https://github.com/PanoMC/Pano/releases) sayfasını ziyaret edin.

Pano, **`.jar`** dosyası olarak dağıtılır — tıpkı **Spigot** veya **Paper** gibi.  
İndirdikten sonra dosyayı uygun bir klasöre (örneğin `/pano`) kaydedin.

> [!NOTE]
> Pano'yu ilk kez çalıştırdığınızda, gerekli dosyaları çıkaracak, dizinleri (örneğin `plugins/` ve `themes/`) oluşturacak ve gerekli bağımlılıkları veya çalışma zamanlarını indirecektir. Kendi özel klasöründe çalıştırılması şiddetle tavsiye edilir.

## Pano’yu Çalıştırma

Pano’yu başlatmak için terminali (veya komut istemini) açın ve şu komutu girin:

```bash
java -jar Pano-<version>.jar
```

Eğer sisteminizde bir masaüstü ortamı varsa, **Pano otomatik olarak GUI (grafik arayüz)** ile açılacaktır.  
Aksi halde, **konsol modu** ile devam eder.

### GUI Davranışı

- `.jar` dosyasına **çift tıklamak**, GUI’yi otomatik olarak başlatmayı dener.
- Konsol modunda çalıştırmak isterseniz şu komutu kullanabilirsiniz:

  ```bash
  java -jar Pano-<version>.jar -nogui
  ```

- GUI’nin içinde, yalnızca **Pano komutlarını** çalıştırabileceğiniz küçük bir konsol yer alır.

GUI başlatılamazsa (örneğin, masaüstü ortamı olmayan bir sunucuda), konsol modu otomatik olarak devam eder.

### Arkaplan Modu (`-bg`) {#background-mode-bg}

Pano'yu bir terminal veya SSH oturumundan başlattığınızda, o oturumu kapattığınızda süreç de kapanır. **`-bg`** bayrağıyla Pano'yu başlatan terminalden ayırarak süreci tek başına çalışmaya devam ettirebilirsiniz:

```bash
java -jar Pano-<version>.jar -bg
```

`-bg` verildiğinde, başlatıcı süreç kendisini ayrı (detached) bir alt süreç olarak yeniden başlatır ve çıkar. Bu alt süreçte standart çıktı/hata akışları yutulur — çalışma sırasındaki loglar için `logs/` klasörüne bakın.

`-bg` ile `-nogui` **birbirinden bağımsızdır**:

| Bayraklar | GUI | Terminalden ayrık |
| --- | --- | --- |
| _(hiçbiri)_ | Evet | Hayır |
| `-nogui` | Hayır | Hayır |
| `-bg` | Evet | Evet |
| `-bg -nogui` | Hayır | Evet |

> [!TIP]
> Panelden bir platform güncellemesi veya yeniden başlatma tetiklediğinizde, platform şu anda **terminale bağlı** çalışıyorsa onay penceresinde "Arka plan modunda yeniden başlat" anahtarı görünür. Bu seçeneği işaretlerseniz yeni süreç terminalden ayrılır — örneğin SSH oturumunu hemen kapatmak istiyorsanız kullanışlıdır.

> [!NOTE]
> `-bg` ile başlatılan süreçte etkileşimli stdin olmadığı için JLine konsol okuyucusu başlatılmaz. Komutları panel arayüzünden, ya da `-nogui` verilmediyse yerleşik GUI konsolundan girebilirsiniz.

## Sonraki adım

`http://<sunucu-ip-adresiniz>/` adresini açın (`.jar` varsayılan olarak **80** numaralı portu dinler;
`config.conf` içindeki [`http-port`](../../configuration/server/) ile değiştirebilirsiniz) ve
[Kurulum Sihirbazı](../setup/)'nı izleyin.
