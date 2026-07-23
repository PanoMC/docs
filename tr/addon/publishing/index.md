# Derleme ve Yayınlama

Bu sayfa sizi, makinenizde çalışan bir eklentiden, sunucu sahiplerinin kurabileceği bir eklentiye götürür. Bir yayın derlemesi yapacak, sürümlerin sizin için nasıl seçildiğini öğrenecek ve panomc.com'daki resmi Pano Pazar Yeri'nde yayınlayacaksınız — ücretsiz olarak veya (biraz daha bağlantıyla) ücretli bir eklenti olarak.

Buradaki "Yayınlama", eklentinizi bir **yayın jar'ına** (bir `.jar` — derlenmiş eklentinizin tamamını tutan tek, zip-benzeri dosya) dönüştürüp onu başkalarının erişebileceği yere koymak demektir.

Bu sayfadaki örnekler [Başlangıç](/tr/addon/getting-started/)'taki **Shoutbox** eklentisini kullanır — eklenti kimliği `pano-plugin-shoutbox` olan küçük bir eklenti. `shoutbox` veya `pano-plugin-shoutbox` gördüğünüz her yerde, kendi eklentinizin `pluginId`'sini koyun.

Eklentinizi henüz oluşturmadıysanız, [Başlangıç](/tr/addon/getting-started/) ve [Backend Geliştirme](/tr/addon/backend/) ile başlayın.

## Başlamadan önce

Bu dört şeye sahip olun. Sayfanın geri kalanı onları varsayar:

- **Eklentiniz zaten yerelde derleniyor** — eklentinizin klasöründe `./gradlew build` çalıştırmak hatasız bitiyor. Bitmiyorsa, önce [Başlangıç](/tr/addon/getting-started/) ve [Backend Geliştirme](/tr/addon/backend/)'ye geri dönün.
- **Eklentinizin kodu bir GitHub deposunda yaşıyor.**
- **O depo için GitHub Actions etkin** (yeni depolar için varsayılan olarak açıktır).
- **[panomc.com](https://panomc.com)'da ücretsiz bir hesabınız var.**

## İlk yayın kontrol listesi

Sayfanın geri kalanı her kısmı ayrıntılı olarak açıklar, ama işte tüm iş sırayla, böylece her zaman ne kaldığını bilirsiniz. Her adım tam açıklamasına bağlanır ve nasıl çalıştığını anlayacağınızla biter.

İşin çoğu tek seferlik bir kurulumdur (2–6. adımlar). Ondan sonra, her gelecekteki yayın yalnızca 7. adımdır — commit'leyin ve gönderin.

1. **Bir jar üretildiğini doğrulamak için bir kez yerelde derleyin.** → [Yayın derlemesi](#yayın-derlemesi). *`BUILD SUCCESSFUL`'ı ve `build/libs/`'te bir jar'ı gördüğünüzde tamamlanır.*
2. **panomc.com'da Pazar Yeri kaynağınızı oluşturun.** → [Kaynağı oluşturun](#_1-kaynagı-olusturun). *Eklentinizin panomc.com'da boş bir sürüm listesiyle bir sayfası olduğunda tamamlanır.*
3. **Bir API jetonu oluşturun** ve onu `PANO_PROD_TOKEN` adında bir depo gizli anahtarı olarak saklayın (`main` dalı için). → [Bir API jetonu oluşturun](#_2-bir-api-jetonu-olusturun). *Gizli anahtar depo ayarlarınızda listelendiğinde tamamlanır.*
4. **Bir `TOKEN_GITHUB` gizli anahtarı oluşturun** (bir GitHub Kişisel Erişim Jetonu). Bunu atlarsanız her yayın en ilk adımda başarısız olur. → [Gerekli: bir `TOKEN_GITHUB` gizli anahtarı](#gerekli-bir-token-github-gizli-anahtarı).
5. **Pano yayın eklentisiyle `.releaserc.json` ekleyin** ve içindeki yer tutucuları değiştirin. → [`.releaserc.json` adım adım](#releaserc-json-adım-adım).
6. **İş akışına, her iki işte de, bir kurulum adımı ekleyin**, böylece Pano yayın eklentisi kullanılabilir olur. Bunu atlarsanız yayın `Cannot find module @PanoMC/semantic-release-pano` ile başarısız olur. → [Pano eklentisi iş akışına kurulmalıdır](#pano-eklentisi-is-akısına-kurulmalıdır).
7. **Bir [conventional-commit](https://www.conventionalcommits.org/) mesajıyla commit'leyin ve `main`'e gönderin.** → [Gönderin ve yayınlanışını izleyin](#_3-gonderin-ve-yayınlanısını-izleyin). *Actions çalıştırması yeşil bir onay gösterdiğinde ve yeni sürüm kaynağınızda belirdiğinde tamamlanır.*

## Yayın derlemesi

Bir yayın derlemesi, Kotlin backend'inizi derler **ve** Svelte arayüzünü derleyip jar'a gömer (yani `.jar` — gönderdiğiniz tek, kendine yeten dosya). Bu, düz bir:

```bash
./gradlew build
```

Bunu eklentinizin kök klasöründen çalıştırın. Gradle, Kotlin tarafı için derleme aracıdır — `./gradlew build`'i JVM dünyasının `npm run build`'i, `./gradlew`'i ("Gradle sarıcı") sizin için doğru Gradle sürümünü çalıştıran projenizdeki bir betik olarak düşünün. Bir iki dakika sonra `BUILD SUCCESSFUL` görmelisiniz.

Çıktı şuraya iner:

```
build/libs/pano-plugin-shoutbox-<version>.jar
```

Yerelde `<version>` her zaman `local-build`'dir (böylece dosya `pano-plugin-shoutbox-local-build.jar`'dır). Artık o dosyayı `build/libs/` içinde görmelisiniz. Gerçek sürüm numaraları CI'dan gelir — **CI** (sürekli entegrasyon), her gönderdiğinizde GitHub'ın kendi sunucularında çalıştırdığı otomatik derlemedir. Aşağıdaki [Sürümleme](#surumleme)'ye bakın.

::: warning Yayın jar'ları arayüze ihtiyaç duyar
**Bir yayın için, her zaman düz bir `./gradlew build` çalıştırın — asla `-Pnoui` eklemeyin.** `-Pnoui` bayrağı Bun/rollup arayüz derlemesini atlar ve bu, iki farklı şekilde bozuk bir eklenti gönderebilir:

- **Arayüzü hiç derlemediyseniz:** jar **hiç arayüz olmadan** gönderilir — eklentiniz panel veya tema ekranı olmadan yüklenir.
- **Eski bir tam derleme geride bir `plugin-ui.zip` bıraktıysa:** jar sessizce o **eskimiş** arayüzü pişirir, böylece fark etmeden güncel olmayan bir arayüz gönderirsiniz.

Hiçbir eski arayüz zip'inin yeniden kullanılmadığından emin olmak istiyorsanız, `./gradlew clean build` çalıştırın (`clean` görevi önce önceki derleme çıktısını siler). `-Pnoui` yalnızca hızlı, yalnızca-backend geliştirme döngüsü içindir (bkz. [Başlangıç](/tr/addon/getting-started/#gelistirme-dongusu)).
:::

Jar tamamen kendine yeterlidir: Kotlin backend'i, gömülü arayüz paketi, yerelleştirmeler ve `logo.png`'nin hepsi içinde yaşar. Gönderilecek başka bir şey yoktur.

## Sürümleme

Her yayının bir sürüm numarası vardır (`1.0.0` gibi), böylece sunucular bir güncellemenin ne zaman kullanılabilir olduğunu bilir.

Sürümü elle **yükseltmezsiniz**. Sürümler, [Conventional Commits](https://www.conventionalcommits.org/)'i izlemesi gereken commit mesajlarınızdan kararlaştırılır — her commit'in `feat:` (yeni bir özellik), `fix:` (bir hata düzeltmesi) veya `chore:` (bakım) gibi bir kelimeyle başladığı basit bir biçim. Bu kelimeler hem sonraki sürüm numarasını hem de üretilen değişiklik günlüğünü sürer. `1.2.3` gibi bir sürümde, `1` **major** (ana), `2` **minor** (küçük) ve `3` **patch** (yama)'tır. Bir `feat:` minor sürümü yükseltir, bir `fix:` patch sürümü yükseltir ve bir `BREAKING CHANGE:` alt bilgili bir `feat:` major sürümü yükseltir.

Bu projede benzer gelen dört farklı ad, farklı şeyler ifade eder. Ayrık tutulacak tablo budur:

| Ad | Yaşadığı yer | Kim ayarlar | Ne anlama gelir |
|---|---|---|---|
| `version` | `gradle.properties` | CI, yayın zamanında | **Eklentinizin kendi sürümü** (`1.1.0` gibi). Çalışma kopyanızda `local-build` kalır; onu asla elle düzenlemeyin. |
| `pluginPanoVersion` | `gradle.properties` | Siz (onu `local-build`'de bırakın) | Jar manifestosuna kopyalanır. CI ona **dokunmaz**. |
| `pano-version` | jar'ın manifestosu | doğrudan `pluginPanoVersion`'dan gelir | Derlenmiş jar'ın içindeki `pluginPanoVersion`'ın pişmiş kopyası. |
| `panoVersion` | `.releaserc.json` | Siz | **Pazar Yeri** ilanınızda gösterilen Pano platform sürümü (aşağıdaki yapılandırma dosyasında ayarlanır). |

::: warning Sürümleri elle düzenlemeyin
`gradle.properties`'teki hem `version`'ı hem de `pluginPanoVersion`'ı `local-build`'de bırakın. Yayın zamanında CI, gerçek `version`'ı (`-Pversion` aracılığıyla — Gradle'ın komut satırından bir değer kabul etme yolu, `-Pversion=1.1.0`) commit geçmişinizden enjekte eder. Onu elle yükseltmek veya etiketi (semantic-release'in her yayın için oluşturduğu git etiketi) düzenlemek otomasyonu bozar. CI, `pluginPanoVersion`'ı **enjekte etmez**; manifestonun `pano-version` niteliği `local-build` kalır. *Pazar Yeri'nde duyurulan* Pano sürümü ayrı bir değerdir, `.releaserc.json`'daki `panoVersion` seçeneğiyle ayarlanır (aşağıda). Sürümü commit mesajlarınızın sürmesine izin verin. Ayrıntılar için [Manifesto Yapılandırması](/tr/addon/manifest/)'na bakın.
:::

## Yayın kanalları

Boilerplate, hangi dala gönderdiğinize göre kararlaştırılan iki yayın kanalı için kurulmuştur:

| Dal | Kanal | Sürüm şuna benzer |
|---|---|---|
| `dev` | Ön yayın | `1.1.0-dev.3` |
| `main` | Kararlı | `1.1.0` |

Bir **ön yayın** (prerelease), gerçek bir yayından önce deneyebileceğiniz bir test derlemesidir. `-dev.3` son eki "`1.1.0`'a giden yoldaki 3. dev derlemesi" demektir. Kararlı kanalı kuran sunucu sahipleri bunları asla görmez; bir ön yayın, bir yayını güvenle prova etmeniz içindir.

::: tip GitHub Actions nedir (önce bunu okuyun)
**GitHub Actions**, siz her gönderdiğinizde GitHub'ın kendi sunucularında betikler çalıştırır. Betik, deponuzdaki bir YAML dosyasıdır — burada `.github/workflows/release.yml`. Bir dosya bir veya daha fazla **iş** (job) içerir; her iş bir **adımlar** (step) listesidir; bir adım bir komut veya önceden oluşturulmuş bir eylem çalıştırır. O dosya, aşağıdaki her şeyi yapan şeydir: jar'ınızı derler ve onu yayınlar.
:::

`dev` veya `main`'e göndermek, `pano-boilerplate-plugin` ile `.github/workflows/release.yml`'de gelen GitHub Actions iş akışını tetikler. O iş akışı commit'lerinizden sonraki sürümü çözer, `./gradlew build` (gerçek bir arayüz derlemesi — `-Pnoui` değil) çalıştırır ve sonra **semantic-release** çalıştırır — commit mesajlarınızı okuyan, sonraki sürüm numarasına karar veren, değişiklik günlüğünü yazan ve yayını yayınlayan, hepsini otomatik olarak yapan bir araç.

**Pazar Yeri'nde yayınlamak için bir düzenleme gereklidir.** Kutudan çıktığı hâliyle boilerplate iş akışı, semantic-release'i Pano yayın eklentisi kurulu *olmadan* çalıştırır. Pazar Yeri'nde de yayınlamak için, iş akışına bir kurulum adımı eklemelisiniz — bu, aşağıdaki [Pano eklentisi iş akışına kurulmalıdır](#pano-eklentisi-is-akısına-kurulmalıdır) altında açıklanmıştır ve [kontrol listesinin](#ilk-yayın-kontrol-listesi) 6. adımıdır. O tek düzenleme ve beklediği gizli anahtarların ötesinde, normal bir eklenti için iş akışına dokunmazsınız.

O iş akışının en üstündeki tetikleyici basitçe şudur:

```yaml
on:
  push:
    branches: ['dev', 'main']
```

Bu zaten boilerplate'te var — onu değiştirmezsiniz. **`dev` veya `main`'e göndermenin tüm yayın tetikleyicisi olduğunu** bilmeniz için gösterilir: ayrı bir "yayınla" düğmesi yoktur.

## `.releaserc.json` adım adım

`.releaserc.json`, semantic-release'in yapılandırıldığı yerdir. Bu dosya, [sonraki bölümde](#resmi-pano-pazar-yeri-nde-yayınlama) oluşturduğunuz bir API jetonundan ve bir Pazar Yeri kaynağından bahseder — bu sorun değil. Dosyayı anlamak için bu adım adımı okuyun, kurun, sonra bunları sonra oluşturun.

Boilerplate, jar iliştirilmiş GitHub yayınını oluşturan bir `.releaserc.json` gönderir. Pazar Yeri'nde de yayınlamak için, `@PanoMC/semantic-release-pano` eklentisini eklersiniz.

Buradaki üç ad da "release" kelimesini içerir — onları ayrı tutun:

- **`semantic-release`** — aracın kendisi.
- **`@semantic-release/commit-analyzer`, `@semantic-release/release-notes-generator`, `@semantic-release/github`** — o araç için standart, hazır eklentiler.
- **`@PanoMC/semantic-release-pano`** — eklediğiniz tek Pano'ya özgü eklenti; Pazar Yeri yayınını yapar.

Aşağıdaki `plugins` listesinde, her girdi ya tek başına bir eklenti adıdır ya da bir `[name, options]` çiftidir — eklenti adı artı ayarları olan iki öğeli bir dizi. İşte Shoutbox için eksiksiz dosya — gerçek `pano-plugin-faq` yayın yapılandırmasından birebir uyarlandı:

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
Bu dosya çalışmadan önce, örnek değerleri kendinizinkiyle değiştirin:

- `YourName` (**2 yer** — her iki `repositoryUrl` satırı) → GitHub kullanıcı adınız veya kuruluşunuz.
- `pano-plugin-shoutbox` (**5 yer** — `file` yolu, her iki `resourceId` değeri ve her iki `repositoryUrl` satırının içinde) → kendi `pluginId`'niz.

`file` yolu `pluginId`'nizi **tam olarak** içermeli, yoksa yayın çok sonra kafa karıştırıcı bir "file not found" ile başarısız olur. Ve evet, `repositoryUrl` bilerek **iki kez** görünür (bir kez Pano eklenti seçeneklerinin içinde, bir kez en üst düzeyde) — depo URL'nizi **her ikisinde de** ayarlayın.
:::

Alan alan:

| Alan | Ne yapar |
|---|---|
| `commit-analyzer` ve `release-notes-generator` | `plugins`'teki ilk iki girdi. Standart semantic-release eklentileri — onları tam olarak olduğu gibi bırakın. |
| `@semantic-release/github` `assets` | `build/libs/*.jar`'ınızı (ve `LICENSE`'ı) GitHub yayınına iliştirir. **Eklentileri bu sırada tutun — GitHub eklentisi Pano eklentisinden önce çalışmalıdır**, böylece `useGitHubLink` ona ihtiyaç duyduğunda jar zaten iliştirilmiş olur. (`"label": false` yalnızca her dosyanın kendi adını indirme etiketi olarak tutar — onu bırakın.) |
| `file` | Derlenmiş jar'a yol. `${version}`, yayın sürümüyle değiştirilir. |
| `panoVersion` | Eklentinizin derlendiği ve test edildiği Pano platform sürümü (örneğin `1.0.0`) — bu, Pazar Yeri ilanınızda gösterilen değerdir. Eklentinizin kendi sürümü **değildir**. |
| `useGitHubLink` | `true` = jar'ı yeniden yükleme; bunun yerine Pazar Yeri'ni GitHub yayınına zaten iliştirilmiş jar'a (artı SHA-256 hash'ine — indirmenin doğrulanabilmesi için bir parmak izi) yönlendir. Ücretsiz eklentiler için idealdir — yinelenen yükleme yok. Premium eklentiler bunun yerine jar'ı doğrudan yükler (premium: `useGitHubLink: false` ayarlayın; bkz. [Premium Eklentiler ve Lisanslama](/tr/addon/premium/)). |
| `configs[]` | Kanal başına bir girdi. Her biri, `branches` ile kapsamlandırılarak, **hangi Pazar Yeri'nde yayınlanacağını** ve **hangi jetonla** söyler. |
| `resourceId` | Pazar Yeri kaynağınız — eklentiler için bu, `pluginId`'nizdir (aşağıya bakın). |
| `panoUrl` | Pazar Yeri API'si: `dev` kanalı için `https://api-dev.panomc.com`, `main` için `https://api.panomc.com`. |
| `tokenVar` | API jetonunu tutan GitHub gizli anahtarının adı: dev için `PANO_TOKEN`, üretim için `PANO_PROD_TOKEN`. |
| `branches` | Bir yapılandırmayı tek bir kanala kısıtlar, böylece bir `dev` gönderimi asla üretim Pazar Yeri'ne dokunmaz (ve eksik bir `PANO_PROD_TOKEN` bir `dev` derlemesini başarısız kılmaz). |

::: tip Neden iki `configs` — ve "dev Pazar Yeri" nedir
`api-dev.panomc.com`, ayrı bir **sanal alan** (sandbox) Pazar Yeri'dir: kendi kaynakları, kendi jetonları ve kendi girişi vardır ve orada yayınladığınız hiçbir şey gerçek sunucu sahipleri tarafından asla görülmez. Dala göre bölmek, `dev` dalınızdan `api-dev.panomc.com`'da bir yayını prova edebileceğiniz, sonra tam olarak aynı kodu `main`'den gerçek `api.panomc.com`'a gönderebileceğiniz anlamına gelir.

**İlk eklentinizi yayınlıyorsanız, basit tutun: yalnızca `main`'e yayınlayın.** `dev` yapılandırma girdisini (ve `{ "name": "dev", "prerelease": true }` dalını) silin, yalnızca tek bir jetona, `PANO_PROD_TOKEN`'a ihtiyacınız olur. Bir prova kanalı isterseniz dev sanal alanını sonra ekleyin.
:::

### Pano eklentisi iş akışına kurulmalıdır

`@PanoMC/semantic-release-pano`, npm'e **yayınlanmamıştır** ve bir boilerplate bağımlılığı değildir, dolayısıyla onu `.releaserc.json`'da listelemek tek başına yeterli değildir — semantic-release *"Cannot find module @PanoMC/semantic-release-pano"* ile başarısız olur.

::: warning Bu, gereken tek iş akışı düzenlemesidir
Bu kurulum adımını `.github/workflows/release.yml`'deki **her iki işe** de eklemelisiniz — sürüm kuru-çalıştırma işi (`get-next-version`) ve yayın işi (`build-and-release`) — her işin `semantic-release` adımından **önce** yerleştirilmiş olarak:

```yaml
- run: npm install -D git+https://github.com/PanoMC/semantic-release-pano.git
```

(`-D` = onu bir geliştirme bağımlılığı olarak kur; `git+` URL'si eklentiyi npm'de olmadığı için doğrudan GitHub'dan kurar. Projenin geri kalanı Bun kullansa da bu tek adım `npm`/`npx` kullanır — bu burada beklenen bir durum.)

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

Aynısını kuru-çalıştırma işinde, `npx semantic-release --dry-run` adımından önce yapın. Yalnızca bir işe eklerseniz, çalıştırma diğerinde `Cannot find module @PanoMC/semantic-release-pano` ile başarısız olur — o hata, iki işten birini atladığınız anlamına gelir. Bu yapılandırmanın kopyalandığı `pano-plugin-faq` iş akışında tam olarak bu adım vardır.
:::

## Resmi Pano Pazar Yeri'nde yayınlama

[panomc.com](https://panomc.com)'daki Pazar Yeri, sunucu sahiplerinin eklentileri doğrudan panellerinden keşfedip kurduğu yerdir. Bir **kaynak** (resource), eklentinizin panomc.com'daki mağaza ilanıdır. Yayınlama üç adım alır: kaynağı oluşturun, bir API jetonu oluşturun, sonra otomasyonun sürümleri yüklemesine izin verin. (Ayrıca bir `TOKEN_GITHUB` gizli anahtarı da gereklidir — 2. adımdan sonraki kutuya bakın.)

### 1. Kaynağı oluşturun

1. **panomc.com**'da kaydolun (veya giriş yapın).
2. Profil alanınızdan, **Kaynak Oluştur**'u açın ve tür olarak **Plugin**'i seçin.
3. Bir kategori seçin, başlığı ve açıklamayı doldurun.
4. Fiyatlandırmayı seçin: **ücretsiz** veya **ücretli**. Yalnızca ücretsiz bir eklenti yayınlıyorsanız, **ücretsiz** seçin — bu sayfanın tamamı budur. **Ücretli** seçmek, [Premium Eklentiler ve Lisanslama](/tr/addon/premium/)'da ele alınan bir lisans adımı ekler.

Artık eklentinizin panomc.com'daki sayfasını **boş bir sürüm listesiyle** görmelisiniz — otomasyon, siz gönderdiğinizde onu doldurur.

::: tip Eklentinizin kaynak ID'si, eklenti ID'nizdir
Eklentinizin Pazar Yeri `resourceId`'si **tam olarak `pluginId`'nizdir** — Shoutbox için bu, `pano-plugin-shoutbox`'tur. Yukarıdaki `configs[]`'in rastgele bir ID değil, `"resourceId": "pano-plugin-shoutbox"` kullanmasının nedeni budur. (Temalar farklıdır — rastgele bir UUID kullanırlar — ama eklentiler kullanmaz.) `pluginId`, Pano'nun eklentinizin sisteme dokunduğu her yerde kullandığı tek kimliktir; tam liste [Manifesto Yapılandırması](/tr/addon/manifest/)'nda.
:::

### 2. Bir API jetonu oluşturun

1. panomc.com'da, **Profil → Ayarlar → API Jetonları**'nı açın ve **Oluştur**'a tıklayın.
2. Jetonu hemen kopyalayın — o, oluşturmadan hemen sonraki modalde **yalnızca bir kez** gösterilir.
3. GitHub deponuzda, **Settings → Secrets and variables → Actions**'a gidin ve jetonu, `tokenVar`'ınızla eşleşecek şekilde adlandırılmış bir **depo gizli anahtarı** (yalnızca Actions çalıştırmalarınızın okuyabildiği şifreli bir değer) olarak ekleyin:
   - `main` (üretim) kanalı için `PANO_PROD_TOKEN` — önce kurulacak olan.
   - `dev` kanalı için `PANO_TOKEN`, **yalnızca** dev sanal alan yapılandırmasını tuttuysanız. Bu, ayrı `api-dev.panomc.com` sanal alanında oluşturulan *farklı* bir jetondur — `PANO_PROD_TOKEN` ile aynı değer değildir.

Deponuzun **Settings → Secrets and variables → Actions** sayfası artık `PANO_PROD_TOKEN`'ı (ve `dev`'e yayınlıyorsanız `PANO_TOKEN`'ı da) listelemelidir.

::: warning Bir jetonu asla commit'lemeyin
API jetonu, kaynağınıza yayınlama hakları verir. Onu yalnızca bir GitHub gizli anahtarı (veya yerel bir ortam değişkeni) olarak saklayın. Onu asla `.releaserc.json`'a, bir commit'e veya depodaki herhangi bir dosyaya koymayın.
:::

### Gerekli: bir `TOKEN_GITHUB` gizli anahtarı

GitHub yayınının kendisi, boilerplate iş akışının (`secrets.TOKEN_GITHUB` olarak) birkaç yerde okuduğu ikinci bir gizli anahtara, `TOKEN_GITHUB`'a ihtiyaç duyar; buna sürüm kuru-çalıştırması da dâhil — hiçbir şey yayınlamadan sonraki sürümü hesaplayan prova işi. GitHub'ın yerleşik `GITHUB_TOKEN`'ı o adla **açığa çıkarılmaz**, dolayısıyla onu kendiniz oluşturmalısınız.

::: warning Bu olmadan, her yayın en ilk adımda başarısız olur
`TOKEN_GITHUB`'ı bir **Kişisel Erişim Jetonu (PAT)** olarak oluşturun — kendi GitHub hesabınız altında ürettiğiniz bir jeton:

1. GitHub'da, avatarınıza → **Settings → Developer settings → Personal access tokens**'a gidin.
2. **`repo`** kapsamına sahip bir **classic** jeton oluşturun (semantic-release yayınları oluşturmak ve etiketleri göndermek için buna ihtiyaç duyar).
3. Onu kopyalayın, sonra deponuzda **Settings → Secrets and variables → Actions** altında tam olarak **`TOKEN_GITHUB`** adında bir gizli anahtar olarak ekleyin.

Deponuzun gizli anahtar listesi artık `TOKEN_GITHUB`'ı göstermelidir.
:::

::: tip Bunun yerine GitHub'ın yerleşik jetonunu mu tercih edersiniz?
Bir PAT oluşturmak istemiyorsanız, iş akışını `secrets.TOKEN_GITHUB` yerine `secrets.GITHUB_TOKEN`'ı (GitHub'ın otomatik çalıştırma-başına jetonu) okuyacak şekilde düzenleyebilirsiniz. Yukarıdaki PAT yolu boilerplate'in varsayılanıdır ve iş akışı düzenlemesi gerektirmez, dolayısıyla önerilen yol odur.
:::

### 3. Gönderin ve yayınlanışını izleyin

Kaynak oluşturulmuş, gereken her iki gizli anahtar eklenmiş ve `.releaserc.json` (artı iş akışı kurulum adımı) yerinde olarak, yayınlama yalnızca bir [conventional-commit](https://www.conventionalcommits.org/) mesajıyla bir commit ve bir gönderimdir:

```bash
git push origin main    # or dev, if you kept the dev sandbox
```

Şimdi deponuzun **Actions** sekmesini açın. İş akışının adını taşıyan bir çalıştırma (**Pano Plugin Build**) bir dakika içinde belirmeli. Bitmesi genellikle birkaç dakika sürer.

- **Yeşil onay** = yayınlandı. Kaynağınızı panomc.com'da açın — yeni sürüm listelenmiş olmalı ve sunucu sahipleri güncellemeyi panellerinde **Panel → Eklentiler** altında görecek.
- **Kırmızı X** = bir şey başarısız oldu. Hatayı okumak için başarısız olan adıma tıklayın. En yaygın ikisi:
  - `Cannot find module @PanoMC/semantic-release-pano` — iki işten birinde kurulum adımını atladınız (6. adım / [kurulum uyarısı](#pano-eklentisi-is-akısına-kurulmalıdır)).
  - En ilk adımda bir kimlik doğrulama hatası — eksik veya yanlış bir `TOKEN_GITHUB` gizli anahtarı (yukarıdaki [`TOKEN_GITHUB` kutusu](#gerekli-bir-token-github-gizli-anahtarı)).

## Manuel dağıtım

Pazar Yeri'ni kullanmak zorunda değilsiniz. Yayın jar'ı tamamen kendine yeterli olduğundan, herkes onu doğrudan kurabilir:

- Jar'ı bir GitHub yayınına iliştirin ve bağlantıyı paylaşın veya
- `.jar`'ı bir sunucu sahibine **Panel → Eklentiler → Yükle** aracılığıyla yüklemesi için verin.

Kullanıcının gördüğü fark: Pazar Yeri'nden indirilen eklentiler **doğrulanmış** (verified) olarak işaretlenir, elle yüklenen jar'lar değildir. Herkese açık bir eklenti için Pazar Yeri şiddetle tercih edilir — size güncelleme dağıtımını, bir mağaza sayfasını ve doğrulanmış rozetini ücretsiz verir.

## Premium ilanlar

Eklentinizi satmak, aynı yayın akışı, artı derleme zamanı bir lisans anahtarı ve kodunuza pişirilmiş bir çalışma zamanı lisans kontrolü aracılığıyla çalışır. Tam anlatım — anahtarı derleme zamanında gömme, çalışma zamanı kontrolünü ekleme ve onu CI'ya bağlama — **[Premium Eklentiler ve Lisanslama](/tr/addon/premium/)**'da yaşar. Doğrudan bu sayfanın üzerine inşa eder.

## Sırada ne var

- **[Manifesto Yapılandırması](/tr/addon/manifest/)** — CI'nın yayın zamanında enjekte ettiği `gradle.properties` alanları.
- **[Çeviriler](/tr/addon/localization/)** — yayınlamadan önce eklentinizi birden fazla dilde gönderin.
