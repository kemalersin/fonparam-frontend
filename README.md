# FonParam Frontend

FonParam, Türkiye'deki yatırım fonlarını karşılaştırmanızı ve analiz etmenizi sağlayan bir web uygulamasıdır.

## Özellikler

- Yatırım fonlarını detaylı arama ve filtreleme
- Portföy yönetim şirketleri hakkında kapsamlı bilgiler
- Fonların karşılaştırmalı analizi
- Favori fonları kaydetme ve takip etme
- Özelleştirilebilir yatırım senaryoları ile getiri hesaplama
- Aylık bazda detaylı performans analizi

## Kurulum

1. Repoyu klonlayın:
```bash
git clone git@github.com:kemalersin/fonparam-frontend.git
cd fonparam-frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Örnek env dosyasını kopyalayıp düzenleyin:
```bash
cp .env.development .env.local
```

4. Uygulamayı başlatın:
```bash
# Geliştirme modu
npm run dev

# Prodüksiyon modu
npm run build
npm run preview
```

## Teknolojiler

- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router
- React Query
- Axios
- Headless UI
- Heroicons

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
