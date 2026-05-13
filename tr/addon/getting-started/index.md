# Başlangıç

## Gereksinimler
Geliştirmeye başlamadan önce aşağıdakilere sahip olduğunuzdan emin olun:

- **Teknik Bilgi**:
    -   Backend geliştirmesi için temel düzeyde **Kotlin** veya **Java** bilgisi.
    -   Frontend geliştirmesi için temel düzeyde **HTML, CSS, JavaScript** veya **Svelte** bilgisi.
- **Pano Kurulumu**: Yerel olarak kurulmuş ve çalışan bir Pano örneğine sahip olmanız gerekir.
- **Geliştirici Modu**: **Panel > Platform** ayarlarına gidin ve **Geliştirici Modu**'nu (Development Mode) etkinleştirin. Arayüz değişikliklerini görebilmek için bu kesinlikle gereklidir.

Burası, Pano platformu için eklenti geliştirmek için bilmeniz gereken temel bilgileri içerir. Bir Pano eklentisi, Kotlin backend ve Svelte frontend'den oluşur.

## Kurulum

Hızlı bir başlangıç yapmanıza yardımcı olmak için **[Pano Boilerplate Plugin](https://github.com/PanoMC/pano-boilerplate-plugin)** hazırladık. Bu depo, hem backend hem de frontend için önceden yapılandırılmış bir yapı içerir.

### 1. Boilerplate'i Klonlayın
Arayüz değişikliklerinin canlı yeniden yüklenmesini (live reloading) etkinleştirmek için projenizi kurulu Pano örneğinizin `plugins` dizinine klonlamanız **gerekir**.

1.  Pano kurulum dizinize gidin (örneğin, `Pano/plugins`).
2.  Depoyu klonlayın:
    ```bash
    git clone https://github.com/PanoMC/pano-boilerplate-plugin.git eklenti-adiniz
    ```

2.  **Yeniden Adlandırma ve Ayarlama**: Projeyi açın ve tüm `pano-boilerplate-plugin` referanslarını kendi eklenti kimliğinizle değiştirin.
    *   `gradle.properties` (manifest) dosyasını güncelleyin.
    *   Paket dizinlerinin adını değiştirin.
    *   Ana sınıftaki temel tanımları güncelleyin.

## Sırada Ne Var?

Pano eklenti geliştirme, frontend ve backend için ayrı iş akışlarını içerir. Daha fazla bilgi edinmek için aşağıdaki ayrıntılı rehberlere göz atın:

*   [Genel Mimari](../architecture) - Genel yapı, standartlar ve PF4J entegrasyonu hakkında bilgi edinin.
*   [Arayüz Geliştirme (Frontend)](../frontend) - Svelte ve Pano SDK kullanarak nasıl arayüz oluşturacağınızı öğrenin.
*   [Backend Geliştirme](../backend) - Kotlin backend, veritabanı modelleri ve API konularına derinlemesine dalın.
*   [Çeviriler (i18n)](../localization) - Eklentinizi nasıl çok dilli hale getireceğinizi öğrenin.