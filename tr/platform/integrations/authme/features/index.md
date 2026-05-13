# AuthMe Özellikleri

## Desteklenen Özellikler

Pano aşağıdaki AuthMe komutlarını ve özelliklerini destekler:

- `/register <şifre> <şifreTekrar>` — Yeni hesap kaydı
- `/login <şifre>` — Hesaba giriş
- `/logout` — Hesaptan çıkış
- `/changepassword <eskiŞifre> <yeniŞifre>` — Hesap şifresini değiştirme
- `/authme forceLogin <oyuncu>` — Oyuncuyu zorla giriş yaptır (yönetici)
- `/authme register <oyuncu> <şifre>` — Oyuncu kaydı (yönetici)
- `/authme reload` — AuthMe yapılandırmasını yeniden yükle
- `/authme changepassword <oyuncu> <yeniŞifre>` — Bir oyuncunun şifresini değiştirme (yönetici)

Pano bu komutları dinler ve eylemleri web sitesi veritabanınızla senkronize eder.
## Desteklenmeyen Özellikler

Entegrasyon sınırlamaları nedeniyle, aşağıdaki AuthMe komutları ve özellikleri **desteklenmez**:

- `/unregister` — Kayıt silme Pano'nun paneli veya web sitesi üzerinden yapılmalıdır
- `/authme unregister <oyuncu>` — Yukarıdakiyle aynı
- `/email` — E-posta yönetimi Pano tarafından yapılır
- `/totp` — İki faktörlü kimlik doğrulama desteklenmez

Bir oyuncu desteklenmeyen bir komutu kullanmaya çalışırsa, bunun yerine web sitesini kullanması bildirilir.

> **Önerilen:** Karışıklığı önlemek ve sorunsuz bir deneyim sağlamak için, bir izin eklentisi veya AuthMe'nin kendi komut yapılandırması kullanarak **bu desteklenmeyen komutlara erişimi devre dışı bırakmanız önerilir**. Bu şekilde oyuncular yalnızca Pano uyumlu özelliklere erişebilir.

### En İyi Uygulama: Oyuncuları Web Sitenize Yönlendirin

Daha da iyi bir kullanıcı deneyimi ve gelişmiş güvenlik için, **oyun içi kaydı tamamen devre dışı bırakmayı veya kısıtlamayı** düşünün:

**Nasıl uygulanır:**
1. İzinler veya AuthMe yapılandırması kullanarak `/register` komutunu devre dışı bırakın
2. AuthMe'yi yalnızca zaten kayıtlı oyuncuların katılmasına izin verecek şekilde ayarlayın
3. Yeni oyuncuları kaydolmak için **web sitenize yönlendiren** bir sunucu mesajı yapılandırın

**Bu yaklaşım neden daha iyidir:**

- **Gelişmiş Güvenlik** — Web kaydı, e-posta doğrulama, CAPTCHA ve diğer güvenlik önlemlerine olanak tanır
- **Daha İyi UX** — Oyuncular uygun formlar, şifre güçlendirme göstergeleri ve net talimatlarla hesap oluşturabilir
- **Merkezi Yönetim** — Tüm kayıtlar Pano'nun web sitesi üzerinden gerçekleşir, moderasyonu kolaylaştırır
- **Profesyonel Görünüm** — Sunucunuza daha cilalı, modern bir his verir
- **Ek Özellikler** — Kayıt sırasında kullanım şartları, gizlilik politikası kabulü ve diğer gereksinimleri ekleyebilirsiniz

**Örnek AuthMe Yapılandırması:**

```yaml
settings:
  registration:
    enabled: false  # Oyun içi kaydı devre dışı bırak
  
restrictions:
  allowCommands:
    - /login
    # /register izin verilen komutlardan kaldırıldı
```

Ardından oyuncuları web sitenize yönlendiren bir kick veya katılım mesajı yapılandırın: `"Lütfen https://sunucunuz.com/register adresinden kaydolun"`
## Diğer Web Scriptleriyle Karşılaştırma

Karmaşık yapılandırma ve manuel senkronizasyon gerektiren geleneksel web scriptlerin aksine, **Pano'nun AuthMeReloaded entegrasyonu sorunsuzdur**:

| Özellik | Geleneksel Scriptler | Pano |
|---------|---------------------|------|
| **Kurulum Karmaşıklığı** | Yüksek — manuel veritabanı kurulumu, yapılandırma düzenleme ve PHP scriptleri gerektirir | Düşük — sadece onay kutusunu etkinleştirin |
| **Senkronizasyon** | Manuel veya cron tabanlı | WebSocket üzerinden gerçek zamanlı |
| **Şifre Hash'leme** | Genellikle uyumsuz veya güvensiz | Yerel CUSTOM hash desteği |
| **Komut Desteği** | Sınırlı veya yok | Tam komut ve etkinlik desteği |
| **Otomatik Yapılandırma** | Manuel | Yedekleme ile otomatik |

Pano ile her şey çalışır. Manuel veritabanı düzenleme yok, karmaşık yapılandırma yok — sadece tak ve çalıştır.
