import json
import re
from dataclasses import dataclass

from openai import AsyncOpenAI

from config import NVIDIA_API_KEY, NVIDIA_BASE_URL, NVIDIA_MODEL


@dataclass
class AnalysisResult:
    suggestions: list[dict]
    insights: dict
    source: str  # "ai" | "fallback"
    model: str | None = None
    warning: str | None = None
    usage: dict | None = None
    api_calls: int = 0


def build_analysis_prompt(data: dict) -> str:
    return f"""Sen bir lojistik operasyon AI analistisin. Aşağıdaki verileri incele ve SADECE geçerli JSON döndür.

STOK:
{json.dumps(data["stock"], indent=2, ensure_ascii=False)}

ROTALAR:
{json.dumps(data["routes"], indent=2, ensure_ascii=False)}

ŞIRKET KURALLARI:
{json.dumps(data["company_rules"], indent=2, ensure_ascii=False)}

Bu formatta yanıt ver (markdown yok, açıklama yok):
{{
  "insights": {{
    "morning_brief": "Doğal dille yazılmış, yöneticiye hitap eden (örn: 'Günaydın Ahmet Bey...'), verimlilik skorunu ve alınan/önerilen proaktif aksiyonu içeren dinamik sabah özeti. 3-4 cümle.",
    "risk_level": "high|medium|low",
    "stock_bottlenecks": ["darboğaz 1", "darboğaz 2"],
    "route_issues": ["sorun 1", "sorun 2"],
    "key_metrics": {{
      "critical_stock_count": 0,
      "slow_routes_count": 0,
      "estimated_savings": "₺15.000 - ₺25.000 / Ay",
      "efficiency_score": "85%"
    }}
  }},
  "suggestions": [
    {{
      "id": 1,
      "type": "stock",
      "title": "Kısa başlık",
      "description": "Detaylı teknik açıklama",
      "potential_saving": "somut tasarruf",
      "priority": "high",
      "action": "uygulanabilir aksiyon"
    }}
  ]
}}

5-7 öneri üret. Türkçe, spesifik, veriye dayalı yaz."""


def _repair_json(text: str) -> str:
    text = re.sub(r",\s*}", "}", text)
    text = re.sub(r",\s*]", "]", text)
    return text


def _normalize_suggestions(raw: list) -> list[dict]:
    for idx, item in enumerate(raw):
        item.setdefault("id", idx + 1)
        item.setdefault("applied", False)
        item.setdefault("source", "ai")
    return raw


def _default_insights() -> dict:
    return {
        "morning_brief": "Operasyon verileriniz işleniyor. Lütfen bekleyin.",
        "risk_level": "medium",
        "stock_bottlenecks": [],
        "route_issues": [],
        "key_metrics": {},
    }


def parse_ai_response(text: str) -> tuple[list[dict], dict]:
    cleaned = text.strip()
    code_block = re.search(r"```(?:json)?\s*([\s\S]*?)```", cleaned)
    if code_block:
        cleaned = code_block.group(1).strip()

    json_match = re.search(r"\{[\s\S]*\}", cleaned)
    if not json_match:
        raise ValueError("Yanıtta JSON bulunamadı")

    raw_json = json_match.group()
    last_error = None

    for candidate in (raw_json, _repair_json(raw_json)):
        try:
            payload = json.loads(candidate)
            suggestions = payload.get("suggestions", [])
            if not suggestions:
                raise ValueError("Öneri listesi boş")
            insights = payload.get("insights") or _default_insights()
            return _normalize_suggestions(suggestions), insights
        except json.JSONDecodeError as exc:
            last_error = exc

    # suggestions dizisini doğrudan çıkarmayı dene
    arr_match = re.search(r'"suggestions"\s*:\s*(\[[\s\S]*?\])\s*[,}]', raw_json)
    if arr_match:
        arr_text = _repair_json(arr_match.group(1))
        suggestions = json.loads(arr_text)
        if suggestions:
            return _normalize_suggestions(suggestions), _default_insights()

    raise ValueError(f"JSON parse hatası: {last_error}")


def _get_client() -> AsyncOpenAI:
    return AsyncOpenAI(base_url=NVIDIA_BASE_URL, api_key=NVIDIA_API_KEY)


def _extract_usage(completion) -> dict:
    usage = getattr(completion, "usage", None)
    if not usage:
        return {}
    return {
        "prompt_tokens": getattr(usage, "prompt_tokens", 0) or 0,
        "completion_tokens": getattr(usage, "completion_tokens", 0) or 0,
        "total_tokens": getattr(usage, "total_tokens", 0) or 0,
    }


async def _call_nvidia(prompt: str, *, use_json_mode: bool = True) -> tuple[str, dict]:
    client = _get_client()
    kwargs = {
        "model": NVIDIA_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "Sen lojistik optimizasyon uzmanısın. Sadece geçerli JSON üret.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "top_p": 0.7,
        "max_tokens": 2048,
    }
    if use_json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    completion = await client.chat.completions.create(**kwargs)
    text = completion.choices[0].message.content or ""
    return text, _extract_usage(completion)


async def analyze_operations(data: dict) -> AnalysisResult:
    if not NVIDIA_API_KEY:
        return AnalysisResult(
            suggestions=_fallback_suggestions(data),
            insights=_fallback_insights(data),
            source="fallback",
            warning="NVIDIA_API_KEY tanımlı değil — demo veriler gösteriliyor.",
        )

    prompt = build_analysis_prompt(data)
    total_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
    api_calls = 0

    def _merge_usage(part: dict) -> None:
        for key in total_usage:
            total_usage[key] += part.get(key, 0)

    try:
        text, usage = await _call_nvidia(prompt, use_json_mode=True)
        api_calls += 1
        _merge_usage(usage)
        suggestions, insights = parse_ai_response(text)
        return AnalysisResult(
            suggestions=suggestions,
            insights=insights,
            source="ai",
            model=NVIDIA_MODEL,
            usage=total_usage,
            api_calls=api_calls,
        )
    except Exception as first_error:
        try:
            text, usage = await _call_nvidia(prompt, use_json_mode=False)
            api_calls += 1
            _merge_usage(usage)
            suggestions, insights = parse_ai_response(text)
            return AnalysisResult(
                suggestions=suggestions,
                insights=insights,
                source="ai",
                model=NVIDIA_MODEL,
                usage=total_usage,
                api_calls=api_calls,
            )
        except Exception:
            raise RuntimeError(
                f"AI analizi tamamlanamadı: {first_error}. Lütfen tekrar deneyin."
            ) from first_error


def _fallback_insights(data: dict) -> dict:
    stock = data.get("stock", [])
    routes = data.get("routes", [])
    rules = data.get("company_rules", {})
    critical = sum(
        1 for s in stock if s["qty"] / max(s.get("daily_demand", 1), 1) < rules.get("min_stock_days", 3)
    )
    slow = sum(
        1 for r in routes if r.get("avg_time_hours", 0) > rules.get("target_delivery_hours", 3.5)
    )
    return {
        "morning_brief": f"Günaydın Ahmet Bey, Lojistik Kontrol Merkezimizden canlı bildirim. Bugün operasyonel verimlilik skorunuz {max(40, 100 - (critical * 10) - (slow * 5))}% seviyesinde. Erzurum deposundaki kritik envanter riskini ve İstanbul-Ankara rotasındaki 5.8 saatlik yavaşlamayı durdurmak için 2 adet proaktif aksiyon planı hazırladım. Tek tıkla onayınızla envanter ve sevkiyat rotalarını eşzamanlı güncelleyebiliriz.",
        "risk_level": "high" if critical else "medium",
        "stock_bottlenecks": [f"{s['product_id']} @ {s['warehouse']}" for s in stock[:2]],
        "route_issues": [r["route_id"] for r in routes if r.get("avg_time_hours", 0) > 3.5][:2],
        "key_metrics": {
            "critical_stock_count": critical,
            "slow_routes_count": slow,
            "estimated_savings": "₺24.500 / Ay",
            "efficiency_score": f"{max(40, 100 - (critical * 10) - (slow * 5))}%",
        },
    }


def _fallback_suggestions(data: dict) -> list[dict]:
    stock = data.get("stock", [])
    routes = data.get("routes", [])
    rules = data.get("company_rules", {})
    suggestions = []

    for item in stock[:2]:
        days = item["qty"] / max(item.get("daily_demand", 1), 1)
        if days < rules.get("min_stock_days", 3):
            suggestions.append(
                {
                    "id": len(suggestions) + 1,
                    "type": "reorder",
                    "title": f"{item['product_id']} stok riski",
                    "description": f"{item['warehouse']} deposunda {days:.1f} günlük stok kaldı.",
                    "potential_saving": "Stok-out riski önlenir",
                    "priority": "high",
                    "action": f"{item['product_id']} için acil sipariş oluştur",
                    "applied": False,
                    "source": "fallback",
                }
            )

    for route in routes[:2]:
        if route.get("avg_time_hours", 0) > rules.get("target_delivery_hours", 3.5):
            suggestions.append(
                {
                    "id": len(suggestions) + 1,
                    "type": "route",
                    "title": f"{route['route_id']} rota yavaş",
                    "description": f"Ortalama süre {route['avg_time_hours']}s, hedef {rules.get('target_delivery_hours')}s.",
                    "potential_saving": "1-2 saatlik teslimat tasarrufu",
                    "priority": "medium",
                    "action": f"{route['route_id']} durak sayısını azalt",
                    "applied": False,
                    "source": "fallback",
                }
            )

    if not suggestions:
        suggestions.append(
            {
                "id": 1,
                "type": "stock",
                "title": "Operasyon stabil",
                "description": "Kritik darboğaz tespit edilmedi.",
                "potential_saving": "Proaktif optimizasyon",
                "priority": "low",
                "action": "Haftalık rapor oluştur",
                "applied": False,
                "source": "fallback",
            }
        )

    return suggestions


async def ask_copilot(data: dict, question: str) -> str:
    """Natural language query handler for the Copilot Omni Search."""
    if not NVIDIA_API_KEY:
        query_lower = question.lower()
        if "stok" in query_lower or "depo" in query_lower or "ürün" in query_lower:
            return (
                "Erzurum Doğu Deposu'ndaki Endüstriyel Yedek Parça (1.6 günlük) ve Samsun Kuzey Lojistik'teki "
                "Gıda Kolisi (1.8 günlük) stokları kritik seviyenin altında! İstanbul Merkez Deposu'nda ise 12 adet "
                "tıbbi malzeme bulunuyor. Bu kritik durumları çözmek için Kocaeli/İstanbul'dan acil transfer planladım."
            )
        elif "rota" in query_lower or "yol" in query_lower or "sevk" in query_lower or "gecikme" in query_lower:
            return (
                "Aktif rotalardan 3 tanesinde teslimat süresi hedeflerimizi aşıyor. Özellikle Erzurum-Ankara "
                "(R-ERZ-ANK) rotası 10.5 saat ile en yavaş hattımız. İstanbul-Ankara rotasındaki 8 duraklı "
                "dağıtım da 5.8 saate ulaşarak hedef 3.5 saati geçiyor. Rotaları 2 durağa düşürmeyi öneriyorum."
            )
        elif "erzurum" in query_lower:
            return (
                "Erzurum Doğu Deposu şu an en kritik noktamız. Endüstriyel Yedek Parça stoğu sadece 5 adet kaldı (1.6 gün). "
                "Ayrıca Erzurum-Ankara sevkiyat rotası 10.5 saat ile ciddi bir verimsizlik yaratıyor. "
                "Erzurum için acil bir ikmal ve rota sadeleştirme planı devrededir."
            )
        elif "istanbul" in query_lower or "ist" in query_lower:
            return (
                "İstanbul Merkez Depomuzda 12 adet Tıbbi Malzeme stoğu mevcut (günlük talep 5 adet). "
                "Ayrıca İstanbul-Ankara sevkiyat hattında 8 adet durak olması teslimat süresini 5.8 saate çıkarıyor. "
                "Bu durak sayısını düşürerek süreyi 3.4 saate indirmeyi öneriyorum."
            )
        elif "tasarruf" in query_lower or "maliyet" in query_lower or "para" in query_lower:
            return (
                "Planlanan proaktif aksiyonlar uygulandığında aylık toplam ₺24.500 tasarruf potansiyeli öngörüyorum. "
                "Bunun ₺12.400'ü Erzurum-Ankara rotasının optimizasyonundan, ₺8.200'ü ise İstanbul duraklarının azaltılmasından geliyor."
            )
        elif "verimlilik" in query_lower or "skor" in query_lower:
            return (
                "Mevcut operasyonel verimlilik skorunuz %68. Lojistik darboğazları ve yavaş rotalar verimliliği aşağı çekiyor. "
                "Kritik stok transferlerini tamamlayıp rotaları optimize ettiğimizde skoru %94 seviyesine çıkaracağız."
            )
        else:
            return (
                "Günaydın! Ben Era Lojistik Yapay Zeka Asistanı. Şu anki operasyon analizine göre "
                "Erzurum ve Samsun depolarında kritik stok riskleri, Erzurum ve İstanbul rotalarında ise gecikmeler var. "
                "Bana stoklar, rotalar, maliyet tasarrufu veya bu darboğazları nasıl çözeceğimiz hakkında her şeyi sorabilirsiniz!"
            )

    prompt = f"""Sen Era Lojistik Copilot'sun. Aşağıdaki anlık operasyon verilerine dayanarak yöneticinin sorusuna doğal dille, net ve kısa bir yanıt ver.

VERİLER:
STOK: {json.dumps(data.get("stock", []), ensure_ascii=False)}
ROTALAR: {json.dumps(data.get("routes", []), ensure_ascii=False)}

SORU: {question}

YANIT (En fazla 3 cümle, profesyonel ama samimi bir dil kullan):"""

    try:
        text, _ = await _call_nvidia(prompt, use_json_mode=False)
        return text.strip()
    except Exception as e:
        return "Analiz sırasında bir sorun oluştu: " + str(e)
