# Derleme ve Yayınlama

## 📦 Eklentiyi Derleme

Eklentinizi bir Pano sunucusuna kurulabilir bir JAR dosyasına dönüştürmek için:

1.  Terminali proje dizininde açın.
2.  Derleme komutunu çalıştırın:
    ```bash
    ./gradlew build
    ```
3.  Derlenen eklenti şu konumda olacaktır:
    `build/libs/your-plugin-id-version.jar`

::: tip
Pano tarafından sağlanmayan harici bağımlılıklar kullanıyorsanız, bunları paketlemek için `shadowJar` görevini kullandığınızdan emin olun.
:::

## 🚀 Yayınlama

### Sürümleme
Derlemeden önce `gradle.properties` dosyanızda doğru sürüm numarasının olduğundan emin olun.

### Dağıtım
Şu anda Pano eklentileri şu yollarla dağıtılmaktadır:
- GitHub Sürümleri (Releases)
- Resmi Pano Mağazası

GitHub'da yayınlamak için:
1.  Commit'inizi etiketleyin (tag).
2.  Yeni bir Release oluşturun.
3.  `build/libs` klasöründeki JAR dosyasını yükleyin.

## 🤖 Otomasyon

Derleme ve dağıtım sürecinizi **GitHub Actions** kullanarak otomatikleştirebilirsiniz.

### GitHub Actions
[Pano Boilerplate Plugin](https://github.com/PanoMC/pano-boilerplate-plugin), önceden yapılandırılmış bir `.github/workflows/release.yml` dosyası ile birlikte gelir. Bu iş akışı, eklentinizi otomatik olarak derler ve bir sürüm oluşturur.

### Pano Deploy API Token
Pano Mağazasına dağıtımı otomatikleştirmek için bir Pano Deploy API Token'a ihtiyacınız vardır.

1.  **Pano Web Sitesine** giriş yapın.
2.  **Profil -> Ayarlar -> API Tokenları** bölümüne gidin.
3.  Yeni bir token oluşturmak için **Oluştur**'a tıklayın.

::: warning ÖNEMLİ
API token'ı, oluşturulduktan hemen sonra açılan modalda sadece **bir kez** gösterilecektir.
**Bu token'ı GitHub Secrets** veya ortam değişkenleri (environment variables) gibi güvenli bir yerde saklayın. Asla herkese açık bir depoya (repository) göndermeyin.
:::

### Semantic Releases
Dağıtım, **Semantic Releases** kullanılarak gerçekleştirilir. `.releaserc.json` yapılandırmasının dağıtım için nasıl ayarlanacağına dair gerçek bir örnek için [Pano Plugin Pages](https://github.com/PanoMC/pano-plugin-pages) deposunu inceleyebilirsiniz.

Örnek yapılandırma, Pano'ya yükleme işlemini gerçekleştirmek için `@PanoMC/semantic-release-pano` eklentisini kullanır.
