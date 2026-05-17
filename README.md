# Era — AI Powered Logistics Optimization

Lojistik operasyonlarındaki stok ve rota darboğazlarını AI ile tespit edip optimize eden web uygulaması.

**Tema:** A1 Verimlilik + B2 Kamuda Aı Dönüşümü + C1-C2 + D4 Zaman Serisi + D5 Anomali

## Proje Yapısı

```
├── backend/          # FastAPI API
│   ├── main.py
│   ├── routers/
│   ├── services/
│   └── storage.py
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── pages/    # Landing + Dashboard
        └── components/
```

## Kurulum

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python main.py
```

API: http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Uygulama: http://localhost:5173 (API proxy: `/api` → `localhost:8000`)

## Kullanım

1. Ana sayfada ürünü tanıyın
2. **Dashboard**'a gidin
3. JSON yükleyin veya **Örnek Veri Kullan**'a tıklayın
4. AI önerilerini inceleyin ve **Uygula** ile aksiyon alın

## API

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/upload-data` | POST | JSON dosya yükle |
| `/analyze?operation_id=` | POST | AI analizi |
| `/apply` | POST | Öneri uygula |
| `/sample-data` | GET | Örnek veri |
| `/health` | GET | Health check |

## Örnek JSON

```json
{
  "stock": [
    { "product_id": "P1", "warehouse": "W1", "qty": 100, "daily_demand": 5 }
  ],
  "routes": [
    { "route_id": "R1", "stops": 8, "distance_km": 120, "avg_time_hours": 4.5 }
  ],
  "company_rules": {
    "min_stock_days": 3,
    "max_stock_days": 14,
    "target_delivery_hours": 3.5
  }
}
```
