# FonParam
## 📊 Yatırım Fonu Karşılaştırma ve Analiz Platformu

Yatırım fonlarını karşılaştırmanızı ve analiz etmenizi sağlayan modern bir web uygulaması.

## 🚀 Özellikler

- 📈 Yatırım fonlarını listeleme ve filtreleme
- 🔍 Fon detaylarını görüntüleme
- ⭐️ Favori fonları yönetme
- 🔄 Fon karşılaştırma
- 🌓 Karanlık/Aydınlık tema desteği
- 📱 Responsive tasarım

## 🛠 Teknolojiler

- ⚛️ React (TypeScript)
- 🎨 Tailwind CSS
- ⚡️ Vite
- 💾 IndexedDB
- 📦 Heroicons

## 🏗 Proje Yapısı

```
src/
├── components/      # Yeniden kullanılabilir bileşenler
├── contexts/        # React context'leri
├── pages/           # Sayfa bileşenleri
├── services/        # API ve yerel veri yönetimi
├── hooks/           # Özel React hook'ları
└── utils/           # Yardımcı fonksiyonlar
```

## 💻 Veri Yönetimi

### API Entegrasyonu
- 🔄 Özel hook'lar ile API çağrıları
- 📊 Veri dönüşümleri ve formatlama
- ⚡️ Optimizasyon ve önbelleğe alma

### Yerel Veri Depolama
- 💾 IndexedDB ile favori fonları saklama
- 🔄 Otomatik senkronizasyon
- 🏷 Etiketleme ve kategorilendirme

## ⚡️ Performans Özellikleri

- 🔍 Debounced arama ile anlık filtreleme
- 📄 Sayfalama ile optimize veri yükleme
- 🚀 Lazy loading ile gecikmeli yükleme
- 💾 IndexedDB ile yerel önbelleğe alma

## 🎨 UX/UI Özellikleri

### Tema Desteği
- 🌞 Aydınlık tema
- 🌚 Karanlık tema
- 🔄 Sistem teması ile otomatik senkronizasyon

### Bildirimler ve Geri Bildirim
- 📬 Toast bildirimleri
- ⏳ Yükleme durumu göstergeleri
- ❌ Hata mesajları

### Responsive Tasarım
- 📱 Mobil uyumlu arayüz
- 💻 Masaüstü optimizasyonu
- 📊 Responsive tablolar

## 🚀 Başlangıç

### Gereksinimler
- Node.js 18 veya üzeri
- npm veya yarn

### Kurulum

```bash
# Depoyu klonla
git clone https://github.com/kemalersin/fonparam-frontend.git

# Proje dizinine git
cd fonparam-frontend

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

## 🌐 Tarayıcı Desteği

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 📜 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.
