# Derleme ve Yayınlama

Bu sayfa sizi makinenizde çalışan bir eklentiden sunucu sahiplerinin kurabileceği bir eklentiye götürür. Bir yayın derlemesi yapacak, sürümlerin sizin için nasıl seçildiğini öğrenecek ve panomc.com'daki resmi Pano Pazar Yeri'nde yayınlayacaksınız — ücretsiz olarak veya (biraz daha bağlantıyla) ücretli bir eklenti olarak.

Buradaki "Yayınlama", eklentinizi bir **yayın jar'ına** (bir `.jar` — tüm derlenmiş eklentinizi tutan tek zip-benzeri dosya) dönüştürmek ve onu başkalarının alabileceği bir yere koymak anlamına gelir.

Bu sayfadaki örnekler [Başlangıç](/tr/addon/getting-started/)'taki **Shoutbox** eklentisini kullanır — plugin ID'si `pano-plugin-shoutbox` olan küçük bir eklenti. `shoutbox` veya `pano-plugin-shoutbox` gördüğünüz her yerde, kendi eklentinizin `pluginId`'sini koyun.

Eklentinizi henüz derlemediyseniz, [Başlangıç](/tr/addon/getting-started/) ve [Backend Geliştirme](/tr/addon/backend/) ile başlayın.

## Başlamadan önce

Bu dört şeyi hazır bulundurun. Sayfanın geri kalanı onları varsayar:

- **Eklentiniz zaten yerelde derleniyor** — eklentinizin klasöründe `./gradlew build` çalıştırmak hatasız bitiyor. Bitmiyor ise, önce [Başlangıç](/tr/addon/getting-started/) ve [Backend Geliştirme](/tr/addon/backend/)'ye geri dönün.
- **Eklentinizin kodu bir GitHub deposunda yaşıyor.**
- O depo için **GitHub Actions etkin** (yeni depolarda varsayılan olarak açıktır).
- **[panomc.com](https://panomc.com)'da ücretsiz bir hesabınız var.**

## İlk yayın kontrol listesi

Sayfanın geri kalanı her parçayı ayrıntılı açıklar, ama işte tüm iş sırayla, böylece ne kaldığını her zaman bilirsiniz. Her adım tam açıklamasına bağlanır ve nasıl çalıştığını anlayacağınızla biter.

İşin çoğu tek seferlik bir kurulumdur (2–6. adımlar). Ondan sonra, her gelecek yayın yalnızca 7. adımdır — commit'leyip gönderin.

1. **Bir jar üretildiğini doğrulamak için bir kez yerelde derleyin.** → [Yayın derlemesi](#yayın-derlemesi). *`BUILD SUCCESSFUL`'ı ve `build/libs/`'te bir jar'ı gördüğünüzde tamamlanır.*
2. **panomc.com'da Pazar Yeri kaynağınızı oluşturun.** → [Kaynağı oluşturun](#_1-kaynagı-olusturun). *Eklentinizin panomc.com'da boş bir sürüm listesiyle bir sayfası olduğunda tamamlanır.*
3. **Bir API jetonu oluşturun** ve onu `PANO_PROD_TOKEN` adında bir depo gizli anahtarı olarak saklayın (`main` dalı için). → [Bir API jetonu oluşturun](#_2-bir-api-jetonu-olusturun). *Gizli anahtar depo ayarlarınızda listelendiğinde tamamlanır.*
4. **Bir `TOKEN_GITHUB` gizli anahtarı oluşturun** (bir GitHub Kişisel Erişim Jetonu). Bunu atlarsanız her yayın en ilk adımda başarısız olur. → [Gerekli: bir `TOKEN_GITHUB` gizli anahtarı](#gerekli-bir-token-github-gizli-anahtarı).
5. **Pano yayın eklentisiyle `.releaserc.json` ekleyin** ve içindeki yer tutucuları değiştirin. → [`.releaserc.json` adım adım](#releaserc-json-adım-adım).
6. **İş akışına, her iki işte de, bir kurulum adımı ekleyin**, böylece Pano yayın eklentisi kullanılabilir olur. Bunu atlarsanız yayın `Cannot find module @PanoMC/semantic-release-pano` ile başarısız olur. → [Pano eklentisi iş akışına kurulmalıdır](#pano-eklentisi-is-akısına-kurulmalıdır).
7. **Bir [conventional-commit](https://www.conventionalcommits.org/) mesajıyla commit'leyin ve `main`'e gönderin.** → [Gönderin ve yayınlanışını izleyin](#_3-gonderin-ve-yayınlanısını-izleyin). *Actions çalıştırması yeşil bir onay gösterdiğinde ve yeni sürüm kaynağınızda belirdiğinde tamamlanır.*

## Yayın derlemesi

Bir yayın derlemesi Kotlin backend'inizi derler **ve** Svelte arayüzünü derleyip jar'a gömer (`.jar` — gönderdiğiniz tek, kendi kendine yeten dosya). Bu düz bir:

```bash
./gradlew build
```

Bunu eklentinizin kök klasöründen çalıştırın. Gradle, Kotlin tarafı için derleme aracıdır — `./gradlew build`'i JVM dünyasının `npm run build`'i, `./gradlew`'i ("Gradle wrapper") ise projenizde sizin için doğru Gradle sürümünü çalıştıran bir betik olarak düşünün. Bir iki dakika sonra `BUILD SUCCESSFUL` görmelisiniz.

Çıktı şuraya iner:

```
build/libs/pano-plugin-shoutbox-<version>.jar
```

Yerelde `<version>` her zaman `local-build`'dir (böylece dosya `pano-plugin-shoutbox-local-build.jar`'dır). Artık o dosyayı `build/libs/` içinde görmelisiniz. Gerçek sürüm numaraları CI'dan gelir — **CI** (sürekli entegrasyon), her gönderdiğinizde GitHub'ın kendi sunucularında çalıştırdığı otomatik derlemedir. Aşağıdaki [Sürümleme](#surumleme)'ye bakın.

::: warning Yayın jar'ları arayüze ihtiyaç duyar
**Bir yayın için, her zaman düz bir `./gradlew build` çalıştırın — asla `-Pnoui` eklemeyin.** `-Pnoui` bayrağı Bun/rollup arayüz derlemesini atlar ve bu, iki farklı şekilde bozuk bir eklenti gönderebilir:

- **Arayüzü hiç derlemediyseniz:** jar **hiç arayüz olmadan** gönderilir — eklentiniz panel veya tema ekranları olmadan yüklenir.
- **Eski bir tam derleme geride bir `plugin-ui.zip` bıraktıysa:** jar sessizce o **bayat** arayüzü gömer, böylece fark etmeden güncel olmayan bir arayüz gönderirsiniz.

Hiçbir eski arayüz zip'inin yeniden kullanılmadığından emin olmak istiyorsanız, `./gradlew clean build` çalıştırın (`clean` görevi önce önceki derleme çıktısını siler). `-Pnoui` yalnızca hızlı yalnızca-backend dev döngüsü içindir (bkz. [Başlangıç](/tr/addon/getting-started/#dev-dongusu)).
:::

Jar tamamen kendi kendine yeter: Kotlin backend, gömülü arayüz paketi, diller ve `logo.png` hepsi içinde yaşar. Gönderilecek başka bir şey yoktur.

## Sürümleme

Her yayının bir sürüm numarası vardır (`1.0.0` gibi), böylece sunucular bir güncellemenin ne zaman mevcut olduğunu bilir.

Sürümü elle **artırmazsınız**. Sürümler commit mesajlarınızdan kararlaştırılır, ki bunlar [Conventional Commits](https://www.conventionalcommits.org/)'i izlemelidir — her commit'in `feat:` (yeni bir özellik), `fix:` (bir hata düzeltmesi) veya `chore:` (idari işler) gibi bir kelimeyle başladığı basit bir format. Bu kelimeler hem sonraki sürüm numarasını hem de üretilen değişiklik günlüğünü sürer. `1.2.3` gibi bir sürümde, `1` **major**, `2` **minor** ve `3` **patch**'tir. Bir `feat:` minor sürümü artırır, bir `fix:` patch sürümünü artırır ve bir `BREAKING CHANGE:` alt bilgisi olan bir `feat:` major sürümü artırır.

Bu projede dört farklı ad benzer geliyor ama farklı şeyler ifade ediyor. Ayrı tutulması gereken tablo budur:

| Ad | Yaşadığı yer | Onu kim ayarlar | Ne anlama gelir |
|---|---|---|---|
| `version` | `gradle.properties` | CI, yayın zamanında | **Eklentinizin kendi sürümü** (`1.1.0` gibi). Çalışan kopyanızda `local-build` kalır; onu asla elle düzenlemeyin. |
| `pluginPanoVersion` | `gradle.properties` | Siz (onu `local-build`'de bırakın) | Jar manifestine kopyalanır. CI ona **dokunmaz**. |
| `pano-version` | jar'ın manifesti | doğrudan `pluginPanoVersion`'dan gelir | Yalnızca derlenen jar'ın içindeki `pluginPanoVersion`'ın gömülü kopyası. |
| `panoVersion` | `.releaserc.json` | Siz | **Pazar Yeri** ilanınızda gösterilen Pano platform sürümü (aşağıdaki yapılandırma dosyasında ayarlanır). |

::: warning Sürümleri elle düzenlemeyin
`gradle.properties`'teki hem `version`'ı hem de `pluginPanoVersion`'ı `local-build`'de bırakın. Yayın zamanında CI, commit geçmişinizden gerçek `version`'ı enjekte eder (`-Pversion` aracılığıyla — Gradle'ın komut satırından bir değeri kabul etme yolu, `-Pversion=1.1.0`). Onu elle artırmak veya etiketi (semantic-release'in her yayın için oluşturduğu git etiketi) düzenlemek otomasyonu bozar. CI `pluginPanoVersion`'ı enjekte **etmez**; manifestin `pano-version` özniteliği `local-build` kalır. *Pazar Yeri'nde duyurulan* Pano sürümü ayrı bir değerdir, `.releaserc.json`'daki `panoVersion` seçeneğiyle ayarlanır (aşağıda). Commit mesajlarınızın sürümü sürmesine izin verin. Ayrıntılar için [Manifest Yapılandırması](/tr/addon/manifest/)'na bakın.
:::

## Yayın kanalları

Boilerplate, hangi dala gönderdiğinizle kararlaştırılan iki yayın kanalı için kurulmuştur:

| Dal | Kanal | Sürüm şöyle görünür |
|---|---|---|
| `dev` | Ön-yayın | `1.1.0-dev.3` |
| `main` | Kararlı | `1.1.0` |

Bir **ön-yayın**, gerçek bir yayından önce deneyebileceğiniz bir test derlemesidir. `-dev.3` soneki "`1.1.0`'a giden yolda 3. dev derlemesi" anlamına gelir. Kararlı kanalı kuran sunucu sahipleri bunları asla görmez; bir ön-yayın, bir yayını güvenle prova etmeniz içindir.

::: tip GitHub Actions nedir (önce bunu okuyun)
**GitHub Actions**, her gönderdiğinizde GitHub'ın kendi sunucularında betikler çalıştırır. Betik, deponuzdaki bir YAML dosyasıdır — burada `.github/workflows/release.yml`. Bir dosya bir veya daha fazla **iş** içerir; her iş bir **adım** listesidir; bir adım bir komut veya önceden hazırlanmış bir action çalıştırır. Aşağıdaki her şeyi yapan o dosyadır: jar'ınızı derler ve yayınlar.
:::

`dev` veya `main`'e göndermek, `pano-boilerplate-plugin` ile gelen `.github/workflows/release.yml`'deki GitHub Actions iş akışını tetikler. O iş akışı commit'lerinizden sonraki sürümü belirler, `./gradlew build` (gerçek bir arayüz derlemesi — `-Pnoui` değil) çalıştırır ve sonra **semantic-release** çalıştırır — commit mesajlarınızı okuyan, sonraki sürüm numarasını kararlaştıran, değişiklik günlüğünü yazan ve yayını yayınlayan, hepsini otomatik yapan bir araç.

**Pazar Yeri'nde yayınlamak için bir düzenleme gereklidir.** Kutudan çıktığı hâliyle boilerplate iş akışı, semantic-release'i Pano yayın eklentisi kurulu *olmadan* çalıştırır. Pazar Yeri'nde de yayınlamak için, iş akışına bir kurulum adımı eklemelisiniz — bu, aşağıdaki [Pano eklentisi iş akışına kurulmalıdır](#pano-eklentisi-is-akısına-kurulmalıdır) altında açıklanmıştır ve [kontrol listesinin](#ilk-yayın-kontrol-listesi) 6. adımıdır. O tek düzenleme ve beklediği gizli anahtarların ötesinde, normal bir eklenti için iş akışına dokunmazsınız.

O iş akışının en üstündeki tetikleyici basitçe şudur:

```yaml
on:
  push:
    branches: ['dev', 'main']
```

Bu zaten boilerplate'te — onu değiştirmezsiniz. **`dev` veya `main`'e göndermenin tüm yayın tetikleyicisi olduğunu** bilesiniz diye gösterilmiştir: ayrı bir "yayınla" düğmesi yoktur.

## `.releaserc.json` adım adım

`.releaserc.json`, semantic-release'in yapılandırıldığı yerdir. Bu dosya, [sonraki bölümde](#resmi-pano-pazar-yeri-nde-yayınlama) oluşturduğunuz bir API jetonundan ve bir Pazar Yeri kaynağından bahseder — bu sorun değil. Dosyayı anlamak için bu adım adımı okuyun, kurun, sonra bunları sonra oluşturun.

Boilerplate, jar ekli GitHub yayınını oluşturan bir `.releaserc.json` gönderir. Pazar Yeri'nde de yayınlamak için, `@PanoMC/semantic-release-pano` eklentisini eklersiniz.

Buradaki üç ad "release" kelimesini içerir — onları ayrı tutun:

- **`semantic-release`** — aracın kendisi.
- **`@semantic-release/commit-analyzer`, `@semantic-release/release-notes-generator`, `@semantic-release/github`** — o araç için standart, hazır eklentiler.
- **`@PanoMC/semantic-release-pano`** — eklediğiniz, Pazar Yeri yayınını yapan tek Pano'ya özgü eklenti.

Aşağıdaki `plugins` listesinde, her girdi ya kendi başına bir eklenti adı ya da bir `[name, options]` çiftidir — eklenti adı artı ayarlarından oluşan iki öğeli bir dizi. İşte Shoutbox için eksiksiz dosya — gerçek `pano-plugin-faq` yayın yapılandırmasından 1:1 uyarlanmıştır:

```json
{
  "branches": [
    { "name": "dev", "prerelease": true },
    "main"
  ],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/github", {
      "assets": [
        { "path": "build/libs/*.jar", "label": false },
        { "path": "LICENSE", "label": false }
      ]
    }],
    ["@PanoMC/semantic-release-pano", {
      "file": "build/libs/pano-plugin-shoutbox-${version}.jar",
      "panoVersion": "1.0.0",
      "useGitHubLink": true,
      "repositoryUrl": "https://github.com/YourName/pano-plugin-shoutbox.git",
      "configs": [
        {
          "resourceId": "pano-plugin-shoutbox",
          "panoUrl": "https://api-dev.panomc.com",
          "tokenVar": "PANO_TOKEN",
          "branches": ["dev"]
        },
        {
          "resourceId": "pano-plugin-shoutbox",
          "panoUrl": "https://api.panomc.com",
          "tokenVar": "PANO_PROD_TOKEN",
          "branches": ["main"]
        }
      ]
    }]
  ],
  "repositoryUrl": "https://github.com/YourName/pano-plugin-shoutbox.git"
}
```

::: tip Bu yer tutucuları değiştirin
Bu dosya çalışmadan önce, örnek değerleri kendinizinkilerle değiştirin:

- `YourName` (**2 yer** — her iki `repositoryUrl` satırı) → GitHub kullanıcı adınız veya kuruluşunuz.
- `pano-plugin-shoutbox` (**5 yer** — `file` yolu, her iki `resourceId` değeri ve her iki `repositoryUrl` satırının içinde) → kendi `pluginId`'niz.

`file` yolu `pluginId`'nizi **tam olarak** içermelidir, yoksa yayın çok daha sonra kafa karıştırıcı bir "file not found" ile başarısız olur. Ve evet, `repositoryUrl` kasten **iki kez** görünür (bir kez Pano eklenti seçeneklerinin içinde, bir kez üst düzeyde) — depo URL'nizi **ikisinde de** ayarlayın.
:::

Alan alan:

| Alan | Ne yapar |
|---|---|
| `commit-analyzer` ve `release-notes-generator` | `plugins`'teki ilk iki girdi. Standart semantic-release eklentileri — onları tam olarak olduğu gibi bırakın. |
| `@semantic-release/github` `assets` | `build/libs/*.jar`'ınızı (ve `LICENSE`'ı) GitHub yayınına ekler. **Eklentileri bu sırada tutun — GitHub eklentisi Pano eklentisinden önce çalışmalıdır**, böylece `useGitHubLink` ona ihtiyaç duyduğunda jar zaten eklenmiştir. (`"label": false` yalnızca her dosyanın kendi adını indirme etiketi olarak tutar — onu bırakın.) |
| `file` | Derlenen jar'a yol. `${version}` yayın sürümüyle değiştirilir. |
| `panoVersion` | Eklentinizin derlendiği ve test edildiği Pano platform sürümü (örneğin `1.0.0`) — bu, Pazar Yeri ilanınızda gösterilen değerdir. Eklentinizin kendi sürümü **değildir**. |
| `useGitHubLink` | `true` = jar'ı yeniden yükleme; bunun yerine Pazar Yeri'ni GitHub yayınına zaten ekli jar'a yönlendir (artı SHA-256 hash'i — indirmenin doğrulanabilmesi için bir parmak izi). Ücretsiz eklentiler için ideal — çift yükleme yok. Premium eklentiler bunun yerine jar'ı doğrudan yükler (premium: `useGitHubLink: false` ayarlayın; bkz. [Premium Eklentiler ve Lisanslama](/tr/addon/premium/)). |
| `configs[]` | Kanal başına bir girdi. Her biri **hangi Pazar Yeri'nde yayınlanacağını** ve **hangi jetonla**, `branches` ile kapsamlanmış olarak söyler. |
| `resourceId` | Pazar Yeri kaynağınız — eklentiler için bu sizin `pluginId`'nizdir (aşağıya bakın). |
| `panoUrl` | Pazar Yeri API'si: `dev` kanalı için `https://api-dev.panomc.com`, `main` için `https://api.panomc.com`. |
| `tokenVar` | API jetonunu tutan GitHub gizli anahtarının adı: dev için `PANO_TOKEN`, üretim için `PANO_PROD_TOKEN`. |
| `branches` | Bir yapılandırmayı bir kanalla kısıtlar, böylece bir `dev` gönderisi asla üretim Pazar Yeri'ne dokunmaz (ve eksik bir `PANO_PROD_TOKEN` bir `dev` derlemesini başarısız kılmaz). |

::: tip Neden iki `configs` — ve "dev Pazar Yeri" nedir
`api-dev.panomc.com` ayrı bir **sandbox** Pazar Yeri'dir: kendi kaynakları, kendi jetonları ve kendi girişi vardır ve orada yayınladığınız hiçbir şey gerçek sunucu sahipleri tarafından asla görülmez. Dala göre bölmek, `dev` dalınızdan `api-dev.panomc.com`'da bir yayını prova edip sonra tam olarak aynı kodu `main`'den gerçek `api.panomc.com`'a gönderebileceğiniz anlamına gelir.

**İlk eklentinizi yayınlıyorsanız, basit tutun: yalnızca `main`'e yayınlayın.** `dev` yapılandırma girdisini (ve `{ "name": "dev", "prerelease": true }` dalını) silin ve yalnızca tek bir jetona, `PANO_PROD_TOKEN`, ihtiyacınız olur. Bir prova kanalı isterseniz dev sandbox'ı sonra ekleyin.
:::

### Pano eklentisi iş akışına kurulmalıdır

`@PanoMC/semantic-release-pano` npm'e **yayınlanmamıştır** ve bir boilerplate bağımlılığı değildir, bu yüzden onu `.releaserc.json`'da listelemek tek başına yeterli değildir — semantic-release *"Cannot find module @PanoMC/semantic-release-pano"* ile başarısız olur.

::: warning Bu, gereken tek iş akışı düzenlemesidir
Bu kurulum adımını `.github/workflows/release.yml`'deki **her iki işe de** eklemelisiniz — sürüm kuru-çalıştırma işi (`get-next-version`) ve yayın işi (`build-and-release`) — her işin `semantic-release` adımından **önce** yerleştirilmiş olarak:

```yaml
- run: npm install -D git+https://github.com/PanoMC/semantic-release-pano.git
```

(`-D` = onu bir dev bağımlılığı olarak kur; `git+` URL'si eklenti npm'de olmadığı için onu doğrudan GitHub'dan kurar. Bu tek adım, projenin geri kalanı Bun kullansa bile `npm`/`npx` kullanır — bu burada beklenendir.)

Örneğin, yayın işinde mevcut `Release` adımından hemen önce gider:

```yaml
      # add this line...
      - run: npm install -D git+https://github.com/PanoMC/semantic-release-pano.git

      # ...before the step already in the file:
      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.TOKEN_GITHUB }}
        run: npx semantic-release@24.2.6
```

Aynısını kuru-çalıştırma işinde, onun `npx semantic-release --dry-run` adımından önce yapın. Onu yalnızca bir işe eklerseniz, çalıştırma diğerinde `Cannot find module @PanoMC/semantic-release-pano` ile başarısız olur — o hata iki işten birini kaçırdığınız anlamına gelir. Bu yapılandırmanın kopyalandığı `pano-plugin-faq` iş akışı tam olarak bu adıma sahiptir.
:::

## Resmi Pano Pazar Yeri'nde yayınlama

[panomc.com](https://panomc.com)'daki Pazar Yeri, sunucu sahiplerinin eklentileri doğrudan panellerinden keşfedip kurduğu yerdir. Bir **kaynak**, eklentinizin panomc.com'daki mağaza ilanıdır. Yayınlama üç adım alır: kaynağı oluşturun, bir API jetonu oluşturun, sonra otomasyonun sürümleri yüklemesine izin verin. (Bir `TOKEN_GITHUB` gizli anahtarı da gereklidir — 2. adımdan sonraki kutuya bakın.)

### 1. Kaynağı oluşturun

1. **panomc.com**'da kaydolun (veya giriş yapın).
2. Profil alanınızdan, **Kaynak Oluştur**'u açın ve **Plugin** türünü seçin.
3. Bir kategori seçin, başlığı ve açıklamayı doldurun.
4. Fiyatlandırmayı seçin: **ücretsiz** veya **ücretli**. Yalnızca ücretsiz bir eklenti yayınlıyorsanız, **ücretsiz** seçin — bu, bu sayfanın tamamıdır. **Ücretli** seçmek, [Premium Eklentiler ve Lisanslama](/tr/addon/premium/)'da kapsanan bir lisans adımı ekler.

Artık eklentinizin panomc.com'daki sayfasını **boş bir sürüm listesiyle** görmelisiniz — gönderdiğinizde otomasyon onu doldurur.

::: tip Eklentinizin kaynak ID'si plugin ID'nizdir
Eklentinizin Pazar Yeri `resourceId`'si **tam olarak sizin `pluginId`'nizdir** — Shoutbox için bu `pano-plugin-shoutbox`'tır. Yukarıdaki `configs[]`'in rastgele bir ID değil, `"resourceId": "pano-plugin-shoutbox"` kullanmasının nedeni budur. (Temalar farklıdır — rastgele bir UUID kullanırlar — ama eklentiler kullanmaz.) `pluginId`, Pano'nun eklentinizin sisteme dokunduğu her yerde kullandığı tek kimliktir: veri-dizini adı, izin-düğümü öneki, arayüz URL segmenti ve Pazar Yeri kaynağı. Tam liste [Manifest Yapılandırması](/tr/addon/manifest/)'ndadır.
:::

### 2. Bir API jetonu oluşturun

1. panomc.com'da, **Profil → Ayarlar → API Jetonları**'nı açın ve **Oluştur**'a tıklayın.
2. Jetonu hemen kopyalayın — oluşturmadan hemen sonraki modalda **yalnızca bir kez** gösterilir.
3. GitHub deponuzda, **Settings → Secrets and variables → Actions**'a gidin ve jetonu `tokenVar`'ınızla eşleşecek şekilde adlandırılmış bir **depo gizli anahtarı** (yalnızca Actions çalıştırmalarınızın okuyabileceği şifreli bir değer) olarak ekleyin:
   - `main` (üretim) kanalı için `PANO_PROD_TOKEN` — önce kurulacak olan.
   - `dev` kanalı için `PANO_TOKEN`, **yalnızca** dev sandbox yapılandırmasını tuttuysanız. Bu, ayrı `api-dev.panomc.com` sandbox'ında oluşturulan *farklı* bir jetondur — `PANO_PROD_TOKEN` ile aynı değer değildir.

Deponuzun **Settings → Secrets and variables → Actions** sayfası artık `PANO_PROD_TOKEN`'ı (ve `dev`'e yayınlıyorsanız `PANO_TOKEN`'ı da) listelemeli.

::: warning Bir jetonu asla commit'lemeyin
API jetonu kaynağınıza yayın hakları verir. Onu yalnızca bir GitHub gizli anahtarı (veya yerel bir ortam değişkeni) olarak saklayın. Onu asla `.releaserc.json`'a, bir commit'e veya depodaki herhangi bir dosyaya koymayın.
:::

### Gerekli: bir `TOKEN_GITHUB` gizli anahtarı

GitHub yayınının kendisi ikinci bir gizli anahtara, `TOKEN_GITHUB`, ihtiyaç duyar; boilerplate iş akışı onu (`secrets.TOKEN_GITHUB` olarak) birçok yerde okur, sürüm kuru-çalıştırması dahil — hiçbir şey yayınlamadan sonraki sürümü hesaplayan prova işi. GitHub'ın yerleşik `GITHUB_TOKEN`'ı o ad altında açığa çıkarılmaz, bu yüzden kendiniz oluşturmalısınız.

::: warning Bu olmadan, her yayın en ilk adımda başarısız olur
`TOKEN_GITHUB`'ı bir **Kişisel Erişim Jetonu (PAT)** olarak oluşturun — kendi GitHub hesabınız altında ürettiğiniz bir jeton:

1. GitHub'da, avatarınıza gidin → **Settings → Developer settings → Personal access tokens**.
2. **`repo`** kapsamıyla bir **classic** jeton oluşturun (semantic-release yayınlar oluşturmak ve etiketler göndermek için ona ihtiyaç duyar).
3. Onu kopyalayın, sonra deponuzda **Settings → Secrets and variables → Actions** altında tam olarak **`TOKEN_GITHUB`** adında bir gizli anahtar olarak ekleyin.

Deponuzun gizli anahtarlar listesi artık `TOKEN_GITHUB`'ı göstermeli.
:::

::: tip Bunun yerine GitHub'ın yerleşik jetonunu mu tercih edersiniz?
Bir PAT oluşturmayı tercih etmezseniz, iş akışını `secrets.TOKEN_GITHUB` yerine `secrets.GITHUB_TOKEN`'ı (GitHub'ın otomatik çalıştırma-başına jetonu) okuyacak şekilde düzenleyebilirsiniz. Yukarıdaki PAT yolu boilerplate'in varsayılanıdır ve iş akışı düzenlemesi gerektirmez, bu yüzden önerilen yoldur.
:::

### 3. Gönderin ve yayınlanışını izleyin

Kaynak oluşturulmuş, her iki gerekli gizli anahtar eklenmiş ve `.releaserc.json` (artı iş akışı kurulum adımı) yerinde olduğunda, yayınlama yalnızca bir [conventional-commit](https://www.conventionalcommits.org/) mesajıyla bir commit ve bir gönderidir:

```bash
git push origin main    # or dev, if you kept the dev sandbox
```

Şimdi deponuzun **Actions** sekmesini açın. İş akışının adını taşıyan bir çalıştırma (**Pano Plugin Build**) bir dakika içinde belirmeli. Bitmesi genellikle birkaç dakika alır.

- **Yeşil onay** = yayınlandı. Kaynağınızı panomc.com'da açın — yeni sürüm listelenmeli ve sunucu sahipleri güncellemeyi panellerinde **Panel → Eklentiler** altında görecek.
- **Kırmızı X** = bir şey başarısız oldu. Hatayı okumak için başarısız adıma tıklayın. En yaygın iki tanesi:
  - `Cannot find module @PanoMC/semantic-release-pano` — iki işten birinde kurulum adımını atladınız (6. adım / [kurulum uyarısı](#pano-eklentisi-is-akısına-kurulmalıdır)).
  - En ilk adımda bir kimlik doğrulama hatası — eksik veya yanlış bir `TOKEN_GITHUB` gizli anahtarı (yukarıdaki [`TOKEN_GITHUB` kutusu](#gerekli-bir-token-github-gizli-anahtarı)).

## Manuel dağıtım

Pazar Yeri'ni kullanmak zorunda değilsiniz. Yayın jar'ı tamamen kendi kendine yettiği için, herkes onu doğrudan kurabilir:

- Jar'ı bir GitHub yayınına ekleyip bağlantıyı paylaşın veya
- `.jar`'ı bir sunucu sahibine **Panel → Eklentiler → Yükle** aracılığıyla yüklemesi için verin.

Kullanıcının gördüğü fark: Pazar Yeri'nden indirilen eklentiler **doğrulanmış** olarak işaretlenir, manuel olarak yüklenen jar'lar değil. Herkese açık bir eklenti için Pazar Yeri kesinlikle tercih edilir — size güncelleme teslimi, bir mağaza sayfası ve doğrulanmış rozeti ücretsiz verir.

## Premium ilanlar

Eklentinizi satmak aynı yayın akışıyla, artı bir derleme-zamanı lisans anahtarı ve kodunuza gömülü bir çalışma-zamanı lisans kontrolüyle çalışır. Tam adım adım kılavuz — anahtarı derleme zamanında gömme, çalışma-zamanı kontrolünü ekleme ve onu CI'a bağlama — **[Premium Eklentiler ve Lisanslama](/tr/addon/premium/)**'da yaşar. Doğrudan bu sayfanın üzerine inşa eder; kullandığı ekstra lisans bayrakları (`-PlicenseServer`, `-PpanoLicensePublicKey` ve `PANO_LICENSE_PUBLIC_KEY` ortam değişkeni) ayrıca [Manifest Yapılandırması](/tr/addon/manifest/) altında özetlenmiştir.

## Sırada ne var

- **[Manifest Yapılandırması](/tr/addon/manifest/)** — CI'ın yayın zamanında enjekte ettiği `gradle.properties` alanları.
- **[Çeviriler](/tr/addon/localization/)** — yayınlamadan önce eklentinizi birden fazla dilde gönderin.
