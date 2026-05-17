from pydantic import BaseModel

from typing import Union

class ApplyRequest(BaseModel):
    operation_id: str
    suggestion_id: Union[int, str]
