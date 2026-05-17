import os
import pytest
import pytest_asyncio
from storage import OperationStore

# Use a custom test DB path for storage testing to avoid polluting actual database
TEST_DB_PATH = "test_era.db"

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db(monkeypatch):
    import storage
    monkeypatch.setattr(storage, "DB_PATH", TEST_DB_PATH)
    store = OperationStore()
    await store.init_db()
    yield store
    # Cleanup after tests
    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass

@pytest.mark.asyncio
async def test_create_and_get_operation(setup_test_db):
    store = setup_test_db
    payload = {
        "stock": [{"product_id": "P1", "qty": 10}],
        "routes": [{"route_id": "R1", "stops": 5}],
        "company_rules": {"min_stock_days": 3}
    }
    
    op_id = await store.create(payload)
    assert op_id.startswith("op_")
    
    retrieved = await store.get(op_id)
    assert retrieved == payload

@pytest.mark.asyncio
async def test_set_and_get_analysis(setup_test_db):
    store = setup_test_db
    payload = {"stock": [], "routes": [], "company_rules": {}}
    op_id = await store.create(payload)
    
    suggestions = [{"id": 1, "title": "Test Suggestion", "applied": False, "priority": "high"}]
    insights = {"risk_level": "high"}
    meta = {"source": "ai"}
    
    await store.set_analysis(op_id, suggestions, insights, meta)
    
    retrieved_insights = await store.get_insights(op_id)
    assert retrieved_insights == insights
    
    retrieved_suggestions = await store.get_suggestions(op_id)
    assert retrieved_suggestions == suggestions
    
    retrieved_meta = await store.get_meta(op_id)
    assert retrieved_meta == meta

@pytest.mark.asyncio
async def test_mark_applied_and_stats(setup_test_db):
    store = setup_test_db
    payload = {"stock": [], "routes": [], "company_rules": {}}
    op_id = await store.create(payload)
    
    suggestions = [
        {"id": "1", "title": "Test 1", "applied": False, "priority": "high"},
        {"id": "2", "title": "Test 2", "applied": False, "priority": "low"}
    ]
    await store.set_analysis(op_id, suggestions, {}, {})
    
    # Check stats before apply
    initial_stats = await store.stats(op_id)
    assert initial_stats == {"total": 2, "applied": 0, "pending": 2}
    
    # Mark applied
    success = await store.mark_applied(op_id, "1")
    assert success is True
    
    # Check stats after apply
    updated_stats = await store.stats(op_id)
    assert updated_stats == {"total": 2, "applied": 1, "pending": 1}
