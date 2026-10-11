# LuckPerms Entegrasyonu

**LuckPerms**, Minecraft sunucuları için en gelişmiş, hızlı ve güvenli izin (permissions) eklentisidir. Pano, LuckPerms ile derin, çift yönlü bir entegrasyon sağlayarak sunucunuzun tüm izin yapısını doğrudan web panelinden yönetmenize olanak tanır.

Geleneksel kurulumların aksine, Pano sadece verileri görüntülemekle kalmaz, LuckPerms için **merkezi bir yönetim merkezi** olarak görev yapar.

## LuckPerms Entegrasyonu Nedir?

Pano'nun LuckPerms entegrasyonu, sunucunuzun **Gruplarını**, **Tracklerini** ve **İzin Nodlarını** gerçek zamanlı olarak senkronize eder. Pano Panelinde yapılan değişiklikler anında oyuna yansıtılır ve oyun içinde (LuckPerms komutları veya diğer eklentiler aracılığıyla) yapılan değişiklikler otomatik olarak Pano'ya aktarılır.

## Özellikler

- **Tam Çift Yönlü Senkronizasyon** — Oyun ve Web arasında gerçek zamanlı senkronizasyon.
- **Grup Yönetimi** — Panelden gruplar oluşturun, düzenleyin ve silin.
- **Track Desteği** — Terfi ve tenzil yollarını (Trackler) sorunsuz yönetin.
- **İzin Nod Düzenleyici** — Gruplar ve kullanıcılar için izin nodları ekleyin veya kaldırın.
- **Metadata Desteği** — **Prefixler**, **Suffixler**, **Görüntülenen İsimler** ve **Ağırlıklar** için tam destek.
- **Context Farkındalığı** — LuckPerms contextleri (sunucu, dünya vb.) için destek.
- **Geçici İzinler** — Süresi otomatik olarak dolan izinleri yönetin (Expiry desteği).
- **Yönetilen Durumlar** — Pano, manuel oyun içi değişikliklerle çakışmadan varlıkları güvenli bir şekilde yönetmek için işaretçiler (`pano-managed`) kullanır.

## Gereksinimler

1. Minecraft sunucunuzda (Spigot, Paper, Folia vb.) **LuckPerms** (v5.0+) kurulu olmalıdır.
2. **Pano MC Eklentisi** kurulu ve Pano örneğinize bağlı olmalıdır.
3. Pano ayarlarınızda **İzin Entegrasyonu** etkin olmalıdır.

## Kurulum Rehberi

### Adım 1: LuckPerms'i Kurun
LuckPerms'in Minecraft sunucunuzda kurulu ve çalışıyor olduğundan emin olun.
- [LuckPerms İndir →](https://luckperms.net/download)

### Adım 2: Entegrasyonu Etkinleştirin
1. **Pano Yönetici Panelinize** giriş yapın.
2. **Panel → Sunucu Ayarları → Oyun Entegrasyonu** bölümüne gidin.
3. **İzin Entegrasyonu** anahtarını etkinleştirin.
4. **Kaydet**'e tıklayın.

### Adım 3: Senkronizasyonu Bekleyin
Etkinleştirildiğinde, Pano MC Eklentisi LuckPerms'i otomatik olarak tespit edecektir.
- Mevcut LuckPerms verilerinizi Pano'ya çekmek için ilk senkronizasyonu gerçekleştirecektir.
- Daha sonra gelecekteki değişiklikleri dinlemek için LuckPerms Event Bus'a kanca atacaktır.

## Pano-Özel İzinler

> [!IMPORTANT]
> Pano Paneli aracılığıyla bir izin nodu eklediğinizde, bu node otomatik olarak bir **`pano: true`** context'i içerir. Bu, izin nodunun Pano platformuna özel olduğunu ve **oyuna yansıtılmadığını** gösterir.
>
> Bu özellik, Minecraft sunucunuzun dahili izinlerini karıştırmadan veya oyun içinde çakışmalara neden olmadan web'e özel izinleri (panel erişim seviyeleri veya belirli web sitesi özellikleri gibi) yönetmenize olanak tanır.

## Senkronizasyon Nasıl Çalışır?

### Pano'dan Oyuna (Gelen)
Pano Panelinin **İzinler** bölümünde değişiklikleri kaydettiğinizde:
1. Pano, Pano MC Eklentisine bir anlık görüntü (snapshot) güncellemesi gönderir.
2. Eklenti bu değişiklikleri LuckPerms'e anında uygular.
3. Gruplar ve Trackler güncellenir ve nodlar senkronize edilir.


### Oyun'dan Pano'ya (Giden)
Oyun içinde bir izin değişikliği gerçekleştiğinde (örneğin `/lp user ... permission set ...` kullanarak):
1. LuckPerms bir olay (event) tetikler.
2. Pano MC Eklentisi bu olayı yakalar ve toplu değişiklikleri işlemek için kısa bir bekleme süresi (debounce) bekler.
3. Eklenti, mevcut izinler durumunuzun yeni bir anlık görüntüsünü Pano'ya gönderir.

## Güvenlik ve Çakışma Yönetimi

Pano, manuel LuckPerms kullanımıyla birlikte çalışacak şekilde tasarlanmıştır:
- **Yönetilen İşaretçiler:** Pano, yönettiği varlıklara bir `meta.pano-managed.true` nodu ekler.
- **Silme Koruması:** Senkronizasyon sırasında Pano, manuel olarak oluşturulmuş sunucu verilerinizi yanlışlıkla silmemek için hangi grupları ve trackleri yönetmesi gerektiğini dikkatlice belirler.
- **Doğrulama:** Pano, transferler sırasında veri bütünlüğünü sağlamak için her nodun hash değerini doğrular.

## Sorun Giderme

### Entegrasyon Yüklenmiyor
- LuckPerms'in kurulu olup olmadığını kontrol edin (oyun içinde `/plugins` yazın).
- Sunucu konsolunuzda `[Pano] Permission integration is enabled, loading...` mesajını arayın.
- Panelde **İzin Entegrasyonu** anahtarının AÇIK olduğundan emin olun.

### Senkronizasyon Gecikmesi
- Pano, ağ yoğunluğunu önlemek için giden senkronizasyonlarda kısa bir bekleme süresi (yaklaşık 1.5 saniye) kullanır.
- Değişiklikler görünmüyorsa, **Pano MC Eklentisi**nin bağlı olup olmadığını kontrol edin (Panel → Sunucular).

## Yardıma mı İhtiyacınız Var?
Sorunlarla karşılaşırsanız veya geri bildiriminiz varsa:
- [**Discord topluluğumuzu**](https://discord.gg/6vVy72wgXT) ziyaret edin.
- [**GitHub**](https://github.com/PanoMC/pano-mc-plugin/issues) üzerinde bir sorun açın.

> LuckPerms entegrasyonu, karmaşık sunucu izinlerini yönetmeyi bir düğmeye tıklamak kadar kolay hale getirir.
