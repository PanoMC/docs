# Tek Komutla Kurulum

Tek bir komut, Pano'yu çevresindeki her şeyle birlikte kurar: Pano sürümü, Pano'ya özel bir Java çalışma
ortamı, çökme sonrası Pano'yu yeniden başlatan bir başlatıcı, sistemle birlikte açılmasını sağlayan bir
servis ve `pano` komutu. Pano'nun yazdığı her şey tek bir klasörde kalır.

## Çalıştırma {#run}

::: code-group

```bash [Linux / macOS]
curl -fsSL https://panomc.com/install | bash
```

```powershell [Windows]
powershell -c "irm https://panomc.com/install.ps1 | iex"
```

:::

`curl` yok mu? `wget -qO- https://panomc.com/install | bash` kullanın. Linux ve macOS'ta `curl` veya `wget`
ile `tar` gerekir. [İndirme sayfası](https://panomc.com/downloads) komutu sizin için hazırlar.

Kurulum önce dili sorar (İngilizce, Türkçe veya Rusça), ardından seçenekler ekranını gösterir:
**Yukarı / Aşağı** ile gezinir, **Enter** ile bir satırı değiştirir ya da kurulumu başlatır, **q** ile
çıkarsınız. `-y` verildiğinde ya da terminal olmadığında hiçbir şey sormaz; varsayılanlar ve verdiğiniz
seçeneklerle kurar.

Kurulum bitince `http://localhost:8088` (veya `http://<sunucu-ip-adresiniz>:8088`) adresini açın ve
[Kurulum Sihirbazı](../setup/)'nı izleyin.

## Seçenekler {#options}

Seçenekler `bash -s --` ifadesinden sonra yazılır; Windows'ta betik bir script block olarak çalışır:

```bash
curl -fsSL https://panomc.com/install | bash -s -- --mariadb --version 1.0.0
```

```powershell
powershell -c "& ([scriptblock]::Create((irm https://panomc.com/install.ps1))) -MariaDB -Version 1.0.0"
```

| Linux / macOS | Windows | Ne yapar |
| --- | --- | --- |
| `--mariadb` | `-MariaDB` | MariaDB'yi kurar, Pano için `pano` veritabanını ve kullanıcısını oluşturur |
| `--docker` | — | Pano ve MariaDB'yi konteyner olarak çalıştırır. Bkz. [Docker modu](#docker) |
| `--gui` | `-Gui` | Pano'yu arka planda gizli çalıştırmak yerine penceresiyle çalıştırır |
| `--version <sürüm>` | `-Version` | Bu sürümü kurar. Varsayılan: en yeni sürüm |
| `--channel <kanal>` | `-Channel` | Bir kanalın en yeni sürümü: `release`, `beta` veya `alpha` |
| `--system`, `--user` | `-System`, `-User` | Tüm sistem için ya da yalnızca geçerli kullanıcı için kurar |
| `--dir <klasör>`, `--here` | `-Dir`, `-Here` | Bu klasöre ya da bulunduğunuz klasöre kurar |
| `--port <port>` | `-Port` | Pano'nun dinlediği port. Varsayılan: `8088` |
| `--java <sürüm>` | `-Java` | Pano'nun çalışacağı Java: `11` (varsayılan), `17`, `21` veya `25` |
| `--system-java` | — | Bu Java'yı Pano'nun klasörü yerine paket yöneticisiyle sisteme kurar |
| `--memory <miktar>` | `-Memory` | Pano'nun Java'sının kullanabileceği en fazla bellek, MB veya GB (`1024`, `2g`). Varsayılan `1g`, en az `512` |
| `--no-restart` | `-NoRestart` | Çökme sonrası Pano'yu yeniden başlatmaz |
| `--no-autostart` | `-NoAutostart` | Sistem açıldığında Pano'yu başlatmaz |
| `--lang <en\|tr\|ru>` | `-Lang` | Kurulumun dili |
| `-y`, `--yes` | `-Yes` | Hiçbir şey sormaz |
| `-h`, `--help` | `-Help` | Seçenekleri gösterir |

- **Sürüm:** `--version` veya `--channel` verilmezse en yeni kararlı sürüm kurulur; kararlı sürüm yoksa
  en yeni beta, o da yoksa en yeni alpha. İndirilen dosya SHA-256 ile doğrulanır.
- **Kapsam:** root / yönetici olarak çalıştırıldığında tüm sistem için, aksi halde geçerli kullanıcı için
  kurar. Sistem kurulumu `sudo` ister (Windows: yönetici yetkisi).
- **Bellek:** 1 GB'ın altında Pano çalışır, ancak belleği yetmeyebilir.

## Neler kurulur {#what-it-installs}

| | Geçerli kullanıcı | Tüm sistem |
| --- | --- | --- |
| Linux / macOS'ta klasör | `~/pano` | `/opt/pano` |
| Windows'ta klasör | `%USERPROFILE%\Pano` | `C:\Pano` (sistem sürücüsü) |
| Linux / macOS'ta `pano` komutu | `~/.local/bin/pano` | `/usr/local/bin/pano` |

Klasörün içinde: `Pano-<sürüm>.jar`, `runtime/jre` içinde Java çalışma ortamı, `bin/` içinde başlatıcı ve
`pano` komutu, ayar dosyası `pano.env` ve Pano'nun kendi oluşturduğu her şey (`config.conf`, `plugins/`,
`themes/`, `logs/`, …).

- **Servis:** Linux'ta `pano` adlı bir systemd birimi, macOS'ta `com.panomc.pano` adlı bir launchd işi,
  Windows'ta `Pano` adlı bir zamanlanmış görev. systemd olmayan Linux'ta servis kurulmaz: yeniden
  başlatmadan sonra Pano'yu `pano start` ile kendiniz başlatın. Linux'ta `--gui` ile servis yerine
  uygulamalar menüsüne bir kısayol eklenir.
- **Çökmeler:** başlatıcı, çökme sonrası Pano'yu 5 dakika içinde en fazla 5 kez yeniden başlatır; sizin
  istediğiniz bir durdurmadan sonra asla başlatmaz. Panelden yapılan yeniden başlatma ve güncellemeler de
  onun üzerinden geçer.
- **`--mariadb`:** Linux'ta sistemin paket yöneticisini, macOS'ta Homebrew'u, Windows'ta `winget`'i
  kullanır. Şifre `pano.env` dosyasına yazılır ve Kurulum Sihirbazı'nın veritabanı adımı önceden
  doldurulur. MariaDB kurulamazsa Pano yine de kurulur ve sihirbaz veritabanını sorar.
- **`pano.env`:** `PANO_MEMORY` ve `PANO_JVM_ARGS` her başlangıçta okunur. Port ve veritabanı yalnızca
  ilk başlangıçta `config.conf` dosyasına kopyalanır; sonradan panelden değiştirin.
- **Güncelleme:** kurulumu aynı klasörde yeniden çalıştırın. Pano güncellenir, verileriniz korunur.

## Docker modu {#docker}

`--docker` (Linux ve macOS; compose eklentili Docker gerekir) yalnızca iki konteyner kurar: Pano ve
MariaDB. Kurulum klasörüne (varsayılan `~/pano`) `compose.yaml` ve `.env` dosyalarını (veritabanı şifresi,
imaj etiketi, port, bellek sınırı) yazar, imajları indirir ve başlatır. Java, servis ve `pano` komutu
kurulmaz: o klasörde `docker compose ps`, `logs -f`, `stop` veya `up -d` komutlarını, verileriyle birlikte
kaldırmak için `docker compose down -v` komutunu kullanın. Bkz. [Docker ile Kurulum](../../containers/).

## `pano` komutu {#pano-command}

| Komut | Ne yapar |
| --- | --- |
| `pano start`, `pano stop`, `pano restart` | Pano'yu başlatır, durdurur veya yeniden başlatır |
| `pano status` | Çalışıyor mu? |
| `pano logs` | Kayıtları canlı izler |
| `pano dir` | Kurulum klasörünü yazdırır |
| `pano uninstall` | Pano'yu kaldırır |

Windows'ta önce yeni bir terminal açın. Kurulum, komutun klasörünün `PATH` içinde olmadığını söylerse
bunun yerine `<klasör>/bin/pano` yolunu kullanın.

## Kaldırma {#uninstall}

`pano uninstall` programı, Java çalışma ortamını, servisi ve `pano` komutunu kaldırır;
**verilerinizi korur** (ayarlar, eklentiler, temalar, yüklenen dosyalar). Verileri de silmek için
`--purge` (Windows: `-Purge`) ekleyin. MariaDB ve `pano` veritabanı hiçbir zaman kaldırılmaz.
