import json

from fastapi import APIRouter, File, HTTPException, UploadFile

from config import NVIDIA_API_KEY, NVIDIA_MODEL
from schemas import ApplyRequest
from pydantic import BaseModel
from services.ai_service import analyze_operations, ask_copilot
from storage import store

router = APIRouter(prefix="", tags=["operations"])

REQUIRED_FIELDS = ("stock", "routes", "company_rules")


@router.get("/ai-status")
def ai_status():
    return {
        "configured": bool(NVIDIA_API_KEY),
        "model": NVIDIA_MODEL if NVIDIA_API_KEY else None,
        "provider": "nvidia" if NVIDIA_API_KEY else None,
    }


@router.post("/upload-data")
async def upload_data(file: UploadFile = File(...)):
    try:
        content = await file.read()
        data = json.loads(content)

        if not all(k in data for k in REQUIRED_FIELDS):
            raise ValueError("Missing required fields: stock, routes, company_rules")

        operation_id = await store.create(data)
        stock_count = len(data["stock"])
        route_count = len(data["routes"])

        return {
            "status": "success",
            "operation_id": operation_id,
            "message": f"Veriler yüklendi. {stock_count} ürün, {route_count} rota.",
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Geçersiz JSON dosyası")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/analyze")
async def analyze(operation_id: str):
    data = await store.get(operation_id)
    if not data:
        raise HTTPException(status_code=404, detail="Operation not found")

    try:
        result = await analyze_operations(data)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    meta = {
        "source": result.source,
        "model": result.model,
        "usage": result.usage,
        "api_calls": result.api_calls,
    }
    await store.set_analysis(operation_id, result.suggestions, result.insights, meta)

    response = {
        "status": "success",
        "operation_id": operation_id,
        "source": result.source,
        "model": result.model,
        "insights": result.insights,
        "suggestions": result.suggestions,
        "stats": await store.stats(operation_id),
        "usage": result.usage,
        "api_calls": result.api_calls,
        "billed": result.source == "ai",
        "raw_data": data,
    }
    if result.warning:
        response["warning"] = result.warning
    return response


@router.post("/apply")
async def apply_suggestion(body: ApplyRequest):
    if not await store.get(body.operation_id):
        raise HTTPException(status_code=404, detail="Operation not found")

    success = await store.mark_applied(body.operation_id, body.suggestion_id)
    if not success:
        raise HTTPException(status_code=404, detail="Suggestion not found")

    suggestions = await store.get_suggestions(body.operation_id)
    applied = next(s for s in suggestions if str(s.get("id")) == str(body.suggestion_id))

    return {
        "status": "success",
        "message": f"Öneri #{body.suggestion_id} uygulandı",
        "suggestion": applied,
    }


@router.get("/sample-data")
def sample_data():
    return {
        "stock": [
            {"product_id": "Tıbbi Malzeme", "warehouse": "İstanbul Merkez Depo", "qty": 12, "daily_demand": 5, "coords": {"x": 18, "y": 25}},
            {"product_id": "Elektronik Parça", "warehouse": "İzmir Dağıtım", "qty": 200, "daily_demand": 8, "coords": {"x": 10, "y": 55}},
            {"product_id": "Endüstriyel Yedek Parça", "warehouse": "Erzurum Doğu Depo", "qty": 5, "daily_demand": 3, "coords": {"x": 82, "y": 45}},
            {"product_id": "Tekstil Ürünleri", "warehouse": "Ankara Bölge Hub", "qty": 150, "daily_demand": 12, "coords": {"x": 45, "y": 42}},
            {"product_id": "Gıda Kolisi", "warehouse": "Samsun Kuzey Lojistik", "qty": 18, "daily_demand": 10, "coords": {"x": 58, "y": 20}},
            {"product_id": "Tarım Aletleri", "warehouse": "Adana Güney Lojistik", "qty": 90, "daily_demand": 8, "coords": {"x": 54, "y": 68}}
        ],
        "routes": [
            {
                "route_id": "R-IST-ANK", 
                "from_city": "İstanbul Merkez Depo", 
                "to_city": "Ankara Bölge Hub", 
                "from_coords": {"x": 18, "y": 25}, 
                "to_coords": {"x": 45, "y": 42}, 
                "stops": 8, 
                "distance_km": 450, 
                "avg_time_hours": 5.8
            },
            {
                "route_id": "R-IZM-IST", 
                "from_city": "İzmir Dağıtım", 
                "to_city": "İstanbul Merkez Depo", 
                "from_coords": {"x": 10, "y": 55}, 
                "to_coords": {"x": 18, "y": 25}, 
                "stops": 3, 
                "distance_km": 330, 
                "avg_time_hours": 3.2
            },
            {
                "route_id": "R-SAM-ANK", 
                "from_city": "Samsun Kuzey Lojistik", 
                "to_city": "Ankara Bölge Hub", 
                "from_coords": {"x": 58, "y": 20}, 
                "to_coords": {"x": 45, "y": 42}, 
                "stops": 4, 
                "distance_km": 420, 
                "avg_time_hours": 4.8
            },
            {
                "route_id": "R-AD-ANK", 
                "from_city": "Adana Güney Lojistik", 
                "to_city": "Ankara Bölge Hub", 
                "from_coords": {"x": 54, "y": 68}, 
                "to_coords": {"x": 45, "y": 42}, 
                "stops": 2, 
                "distance_km": 490, 
                "avg_time_hours": 3.4
            },
            {
                "route_id": "R-ERZ-ANK", 
                "from_city": "Erzurum Doğu Depo", 
                "to_city": "Ankara Bölge Hub", 
                "from_coords": {"x": 82, "y": 45}, 
                "to_coords": {"x": 45, "y": 42}, 
                "stops": 9, 
                "distance_km": 870, 
                "avg_time_hours": 10.5
            }
        ],
        "company_rules": {
            "min_stock_days": 3,
            "max_stock_days": 14,
            "target_delivery_hours": 3.5
        }
    }


@router.get("/stats/{operation_id}")
async def get_stats(operation_id: str):
    if not await store.get(operation_id):
        raise HTTPException(status_code=404, detail="Operation not found")
    return await store.stats(operation_id)


class AskRequest(BaseModel):
    operation_id: str
    query: str

@router.post("/ask")
async def ask_question(body: AskRequest):
    data = await store.get(body.operation_id)
    if not data:
        raise HTTPException(status_code=404, detail="Operation not found")
    
    answer = await ask_copilot(data, body.query)
    return {"answer": answer}
