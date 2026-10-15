# Pano'yu Yükleme

Bu rehberi takip ederek **Pano**’yu kurabilir ve birkaç dakika içinde çalışır hale getirebilirsiniz.

## Hızlı başlangıç {#quick-start}

Önerilen yol [tek komutla kurulumdur](installer/). Pano'yu, Pano'ya özel Java'yı, bir servisi ve `pano`
komutunu kurar:

::: code-group

```bash [Linux / macOS]
curl -fsSL https://panomc.com/install | bash
```

```powershell [Windows]
powershell -c "irm https://panomc.com/install.ps1 | iex"
```

:::

`--mariadb` (Windows: `-MariaDB`) eklerseniz Pano için bir veritabanı da kurar. Ardından
`http://localhost` adresini (ya da kurulumun yazdığı adresi) açın ve [Kurulum Sihirbazı](setup/)'nı izleyin.

## Yöntem seçimi {#methods}

| Yöntem | Kimler için | Sizin sağlamanız gereken |
| --- | --- | --- |
| [Tek komutla kurulum](installer/) (önerilen) | Çoğu sunucu ve kendi bilgisayarınız | Hiçbir şey; MariaDB isteğe bağlıdır (`--mariadb`) |
| [Docker](../containers/) | Zaten Docker çalıştıran sunucular | compose eklentili Docker |
| [Elle `.jar`](manual/) | Tam kontrol ya da yalnızca `.jar` çalıştıran bir panel | Java 11+, bir veritabanı, kendi başlatma betiğiniz |

Hiç sunucu işletmek istemiyor musunuz? [Pano Host](https://panomc.com/host) Pano'yu sizin için çalıştırır.

Üçü de aynı yerde biter: tarayıcınızdaki [Kurulum Sihirbazı](setup/).

## Gereksinimler {#requirements}

1. **Java 11 veya üzeri**
    - Yalnızca elle `.jar` kurulumu için: tek komutla kurulum kendi Java'sını indirir, Docker imajı da Java içerir.
    - [Yönetilen sunucular](../server-management/managed-servers/) için yerel `pano-node` aynı Java ile
      çalışır; ek bir şey gerekmez.

2. **MySQL 5.5+ veya MariaDB**
    - Verilerinizi saklamak için bir MySQL veya MariaDB veritabanı gereklidir.
    - Tek komutla kurulum `--mariadb` ile bir tane oluşturur; Docker Compose Pano'nun yanında bir tane başlatır.
    - Varsayılan tablo ön eki: `pano_` (kurulum sırasında değiştirilebilir).

3. **İnternet bağlantısı**
    - Kurulum sırasında gereklidir, çünkü Pano ilk başlangıçta arayüzünü ve bağımlılıklarını indirir.

4. **Açık bir port**
    - Tek komutla kurulum, Docker ve elle çalıştırılan `.jar` Pano'yu **80** portunda sunar.
      80 portu doluysa ya da Linux'ta yalnızca bir kullanıcı için kuruluyorsa (orada 80'i yalnızca sistem
      kurulumu kullanabilir) kurulum **8088**'e geçer.
    - **Opsiyonel:** Kurulumdan sonra SSL yapılandırırsanız, **443 (HTTPS)** portunun da açık olması gerekir.

5. **İşletim sistemi**
    - Tek komutla kurulum Linux, macOS ve Windows'ta çalışır. `.jar`, Java'nın çalıştığı her yerde çalışır.

## Kurulum sonrası {#after-installation}

- [Kurulum Sihirbazı](setup/)'nı tamamlayın ve [Minecraft sunucunuzu bağlayın](setup/#connect-minecraft).
- Gerekirse yapılandırma dosyasını düzenleyin: [Yapılandırma Rehberi →](../configuration/).

## Yardım ve Destek

Bir sorunla karşılaşırsanız:
- [SSS (Sıkça Sorulan Sorular)](../FAQ/) sayfasını ziyaret edin.
- [**Discord topluluğumuzda**](https://discord.gg/6vVy72wgXT) yardım isteyin.
- Ya da [GitHub Issues](https://github.com/PanoMC/Pano/issues) üzerinden bir hata raporu oluşturun.

> Birlikte Pano’yu daha iyi hale getiriyoruz.
