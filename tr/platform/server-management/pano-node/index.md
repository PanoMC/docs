# pano-node ve Pano Agent

`pano-node`, bir makinede yönetilen sunucuları çalıştıran arka plan sürecidir. Her zaman ayrı bir süreç
olarak çalışır; bu yüzden Pano'yu yeniden başlatmak ya da güncellemek oyun sunucularını asla kapatmaz.
Pano'nun kendi makinesinde onu Pano sizin için çalıştırır (**Yerel** düğüm); bu sayfa onu kendiniz
çalıştırmak içindir.

## Kurulum {#installing}

Sürümünün her zaman uyması için onu kendi Pano'nuzdan indirin — her
[Pano sürümüne](https://github.com/PanoMC/Pano/releases) de eklenir. **Java 17 veya daha yenisini**
ister.

```bash
curl -fsSL https://panel.example.com/api/node/pano-node.jar -o pano-node.jar

# İlk başlatma: Düğümler → Düğüm ekle → Elle ekranındaki kodla eşleştirin
java -jar pano-node.jar --pano https://panel.example.com --code 123456 --data ./node-data

# Bundan sonraki her başlatma
java -jar pano-node.jar --data ./node-data
```

| Parametre | Değişken | |
| --- | --- | --- |
| `--pano <url>` | `PANO_URL` | Pano'nuzun adresi |
| `--code <code>` | `PANO_PAIR_CODE` | Eşleştirme kodu |
| `--data <dir>` | `PANO_NODE_DATA` | Veri klasörü (varsayılan `./node-data`) |
| `--name <name>` | `PANO_NODE_NAME` | Düğümün paneldeki adı |
| `--runtime DOCKER` | `PANO_NODE_RUNTIME` | Her sunucuyu kendi Docker konteynerinde çalıştır |
| `--port-range <a-b>` | `PANO_NODE_PORT_RANGE` | Sunucularının portları (varsayılan `25565-25600`) |
| `--service install` | | Bir systemd / launchd / Windows servis dosyası yaz ve çık |

**Konteynerde:** imaj `ghcr.io/panomc/pano-node`'dur. **`/data`** altına bir birim bağlayın (yoksa her
şey konteynerle birlikte kaybolur), `PANO_NODE_PORT_RANGE` ile aynı portları dışarı açın ve
`--restart unless-stopped` gibi bir yeniden başlatma politikası kullanın.

## Veri ve yapılandırma {#data-and-configuration}

Her şey veri klasöründe yaşar: `config.conf`, `servers/`, `backups/`, `java/` ve birkaç önbellek. Bir
klasörü aynı anda yalnızca bir arka plan süreci kullanabilir.

```jsonc
platform {
  url = "https://panel.example.com"
  token = "<secret>"
  encryption-key = "<secret>"
}
node {
  stop-servers-on-exit = false
  java-auto-download = true
  tool-auto-download = true
}
```

- **Token ve anahtarlar sırdır.** Dosyayı asla kopyalamayın ya da paylaşmayın. Sızdıysa düğümü
  panelden silin ve yeniden eşleştirin.
- `stop-servers-on-exit = false`, arka plan süreci yeniden başlarken sunucuları çalışır tutar.
- Eksik Java sürümleri `java/` altına, Spigot derlemek için küçük bir `git` de `tools/` altına
  indirilir. Bunu önlemek için iki `auto-download` anahtarını `false` yapın.
- Dosyayı yalnızca arka plan süreci dururken düzenleyin.

## Güncelleme ve kaldırma {#updating-and-removing}

- **Güncelleme:** Düğümler sayfası **Güncelleme var** gösterir. Arka plan süreci yeni jar'ı indirir,
  doğrular ve birkaç saniye içinde yeniden başlar; sunucuları çalışmaya devam eder. Windows'ta yeni
  jar'ı elle üzerine kopyalayın.
- **Kaldırma:** **Düğümler → Sil**, düğümün adını ve parolanızı sorduktan sonra düğümdeki her
  sunucuyu, yedeği ve indirilen Java'yı siler. Çevrimdışı bir düğüm yalnızca unutturulabilir;
  dosyaları kalır.

| Çıkış kodu | Anlamı |
| --- | --- |
| **75** | Güncelleme hazırlandı — yeniden başlatın |
| **76** | Bu klasörü zaten başka bir arka plan süreci kullanıyor |
| **78** | Pano'dan kaldırıldı — yeniden başlatmayın |

## Pano Agent {#pano-agent}

Pano Agent, zaten çalıştırdığınız bir sunucuyu **olduğu yerde** Pano'ya devreder: `pano-agent.jar`
dosyasını sunucunun klasörüne koyun ve **sunucu jar'ı yerine** onu başlatın. Agent sunucuyu başlatır,
konsolunu terminalinizde tutar ve gerisini Pano'nun yönetmesini sağlar. Hiçbir şey taşınmaz.

**Sunucu ekle → Pano Agent ile bağla**, indirmeyi ve hazır bir komutu gösterir:

```bash
cd /home/mc/survival
curl -fLo pano-agent.jar 'https://panel.example.com/api/node/pano-agent.jar'

# Sunucuyu durdurun, ardından penceredeki komutu bir kez çalıştırın (kod bir kez ve 1 dakika geçerlidir)
java -jar pano-agent.jar --pano 'https://panel.example.com' --code k7m2x9qa4tj3n8wp

# Bundan sonraki her başlatma
java -jar pano-agent.jar
```

- İlk çalıştırma sunucu jar'ını, belleği ve Java argümanlarını sorar; **Enter**, başlatma betiğinizden
  okuduğu varsayılanları korur. Pterodactyl gibi bir hosting panelinde sunucu jar'ını
  `pano-agent.jar` yapın ve soruları web konsolunda yanıtlayın.
- `stop` yazmak yalnızca sunucuyu durdurur; Pano onu yeniden başlatabilsin diye agent çalışmaya devam
  eder. <kbd>Ctrl</kbd>+<kbd>C</kbd> ikisini de durdurur.
- Agent verisini `.pano-agent/` içinde tutar — yeni bir sunucu için klasörü kopyalarken onu dışarıda
  bırakın.
- Sunucuyu durdurmadan kendini günceller. Kaldırmak için sunucuyu Pano'dan kaldırın, ardından sunucu
  jar'ını yine doğrudan başlatın.

## Güvenlik {#security}

- Düğüm Pano'ya yalnızca **dışarı doğru** bağlanır; üzerinde hiçbir şeyin açılması gerekmez.
- Her ileti AES-256-GCM ile şifrelenir — başka bir makinedeki düğüm için yine de **HTTPS** kullanın.
- Kodla eşleşen bir düğümün panelde onaylanması gerekir.
- Dosya erişimi her sunucunun kendi klasörünün içinde kalır ve sunucular bir kabuk olmadan başlatılır.
