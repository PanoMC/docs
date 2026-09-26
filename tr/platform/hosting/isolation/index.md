# Instance'ları İzole Etme

Bir sunucudaki instance'lar farklı kişilere aitse, herhangi birinin kötü niyetli olabileceğini
varsayın. Pano Host'un uyduğu kural: **instance'a asla güvenme.** Faturalandırdığınız ya da
uyguladığınız her şey — trafik, CPU, bellek, disk, e-posta, sürüm, çalışma süresi — instance'ın
dışından ölçülür.

> [!WARNING]
> **Henüz yayınlanmadı.** Bkz. [Başkaları için Pano Instance Barındırma](../).

## Konteyner sıkılaştırma {#container-hardening}

Her instance konteynerini şunlarla çalıştırın:

- kendi root olmayan kullanıcı kimliği (`--user`) ve Docker **user namespace remapping**
  (`userns-remap`, daemon genelinde);
- `--cap-drop=ALL` ve `--security-opt no-new-privileges`;
- varsayılan **seccomp** profili ve **AppArmor**;
- `--pids-limit`, bellek sınırı ve CPU sınırı;
- **salt okunur kök dosya sistemi**; yalnızca `/data` yazılabilir, `/tmp` için tmpfs;
- boyut sınırlı döndürmeli `local` log sürücüsü.

Docker soketini ya da herhangi bir host yolunu asla bir instance'a bağlamayın; tek istisna `/data`
olarak bağlanan kendi veri klasörüdür. Sahipler dosyaları bir web dosya yöneticisiyle yönetiyorsa bu
işlemleri host üzerinde root olarak değil, instance'ın kullanıcı kimliğiyle çalışan kısa ömürlü bir
yardımcı konteynerde yapın.

## Instance başına bir ağ {#networks}

Her instance için ayrı bir Docker bridge ağı oluşturun. Paylaşılan servisleri — reverse proxy,
veritabanı sunucusu, e-posta relay'i — tüm instance'ları tek bir ortak ağa koymak yerine **her
instance ağına ayrı ayrı** bağlayın. Böylece instance'lar birbirine ulaşamaz.

Yüzlerce instance için Docker'a küçük adres havuzları verin (`default-address-pools`, örneğin `/27`
alt ağlar), böylece tüm ağlar sığar.

## Veritabanı kullanıcıları {#database}

Tek bir MariaDB (veya MySQL) sunucusu çalıştırın ve her instance'a kendi veritabanını verin. Instance
başına iki kullanıcı oluşturun:

| Kullanıcı | Kullanan | Notlar |
| --- | --- | --- |
| iç (internal) | Pano Instance | `PANO_DB_*` ortam değişkenleriyle verilir |
| dış (external) | sahibi, dışarıdan | isteğe bağlı; TLS zorunlu, isteğe bağlı IP izin listesi, ayrı şifre sıfırlama |

Ayrı tutulmaları sayesinde şifresini değiştiren ya da izin listesini düzenleyen bir sahip çalışan
instance'ı asla bozmaz. Her kullanıcıya yalnızca kendi veritabanında yetki verin; gürültülü komşulara
karşı `MAX_USER_CONNECTIONS` ve sorgu süresi sınırları gibi kullanıcı başına limitler koyun.

## Giden trafik {#egress}

Pano Host her instance ağının giden trafiğini (nftables ile) filtreler:

- sunucunun kendi DNS çözümleyicisine ve TCP 80, 443, 465, 587'ye izin verir;
- instance'ların doğrudan spam gönderememesi için **TCP 25'i engeller**;
- bulut metadata adreslerini (`169.254.169.254`, `fd00:ec2::254`), diğer instance ağlarını ve sunucunun
  iç adreslerini engeller; instance'ın kendi veritabanı ve e-posta relay'i hariç;
- ek portları yalnızca sahibi isterse açar;
- olağan dışı giden trafiği yavaşlatır ve bir yöneticiyi uyarır.

## E-posta relay'i {#mail-relay}

25 numaralı port kapalıyken instance'lar e-postayı sizin çalıştırdığınız bir relay üzerinden gönderir:
her instance ağında bir SMTP servisi, Pano'ya `PANO_SMTP_*` olarak verilir. Her instance'a kendi relay
kimlik bilgilerini verin; böylece relay e-postayı instance başına sayar ve günlük sınırı uygular.
Sahipler isterse Pano'da kendi SMTP sunucularını ayarlayabilir.

## Kotalar dışarıdan ölçülür {#quotas}

Instance'a ne kadar kullandığını sormayın. Ölçün:

- **Disk**: Pano Host her instance'a katı kota olarak seyrek, loop ile bağlanan bir disk imajı verir.
  Instance'ın `/data` klasörü ve veritabanı dosyaları bunun üzerinde durur, veritabanı da sayılır.
- **Trafik**: reverse proxy'de sayın.
- **CPU ve bellek**: Docker sınırları koyun, kullanımı Docker'dan okuyun.
- **E-posta**: relay'de sayın.
- **Sürüm ve çalışma süresi**: `/data` içindeki jar'dan ve konteyner durumundan okuyun.
