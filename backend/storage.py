import json
import os
from datetime import datetime
from typing import Any
import aiosqlite

DB_PATH = os.path.join(os.path.dirname(__file__), "era.db")

class OperationStore:
    def __init__(self) -> None:
        pass

    async def init_db(self) -> None:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS operations (
                    operation_id TEXT PRIMARY KEY,
                    payload TEXT NOT NULL,
                    suggestions TEXT,
                    insights TEXT,
                    meta TEXT
                )
            """)
            await db.commit()

    async def create(self, payload: dict) -> str:
        operation_id = f"op_{datetime.now().timestamp()}"
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                "INSERT INTO operations (operation_id, payload) VALUES (?, ?)",
                (operation_id, json.dumps(payload)),
            )
            await db.commit()
        return operation_id

    async def get(self, operation_id: str) -> dict | None:
        async with aiosqlite.connect(DB_PATH) as db:
            async with db.execute(
                "SELECT payload FROM operations WHERE operation_id = ?",
                (operation_id,),
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    return json.loads(row[0])
        return None

    async def set_analysis(
        self,
        operation_id: str,
        suggestions: list[dict],
        insights: dict,
        meta: dict,
    ) -> None:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                "UPDATE operations SET suggestions = ?, insights = ?, meta = ? WHERE operation_id = ?",
                (json.dumps(suggestions), json.dumps(insights), json.dumps(meta), operation_id),
            )
            await db.commit()

    async def get_insights(self, operation_id: str) -> dict:
        async with aiosqlite.connect(DB_PATH) as db:
            async with db.execute(
                "SELECT insights FROM operations WHERE operation_id = ?",
                (operation_id,),
            ) as cursor:
                row = await cursor.fetchone()
                if row and row[0]:
                    return json.loads(row[0])
        return {}

    async def get_meta(self, operation_id: str) -> dict:
        async with aiosqlite.connect(DB_PATH) as db:
            async with db.execute(
                "SELECT meta FROM operations WHERE operation_id = ?",
                (operation_id,),
            ) as cursor:
                row = await cursor.fetchone()
                if row and row[0]:
                    return json.loads(row[0])
        return {}

    async def get_suggestions(self, operation_id: str) -> list[dict]:
        async with aiosqlite.connect(DB_PATH) as db:
            async with db.execute(
                "SELECT suggestions FROM operations WHERE operation_id = ?",
                (operation_id,),
            ) as cursor:
                row = await cursor.fetchone()
                if row and row[0]:
                    return json.loads(row[0])
        return []

    async def mark_applied(self, operation_id: str, suggestion_id: Any) -> bool:
        suggestions = await self.get_suggestions(operation_id)
        target = None
        for s in suggestions:
            if str(s.get("id")) == str(suggestion_id):
                target = s
                break
        if not target:
            return False
        
        target["applied"] = True
        
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                "UPDATE operations SET suggestions = ? WHERE operation_id = ?",
                (json.dumps(suggestions), operation_id),
            )
            await db.commit()
        return True

    async def stats(self, operation_id: str) -> dict:
        suggestions = await self.get_suggestions(operation_id)
        applied = sum(1 for s in suggestions if s.get("applied") is True)
        return {
            "total": len(suggestions),
            "applied": applied,
            "pending": len(suggestions) - applied,
        }

store = OperationStore()
