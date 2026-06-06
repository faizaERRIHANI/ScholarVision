from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class KPICard(BaseModel):
    label: str
    value: float | int | str
    trend: Optional[float] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class ActivityItem(BaseModel):
    id: str
    type: str
    message: str
    timestamp: datetime
    icon: Optional[str] = None

class ActivityFeed(BaseModel):
    items: List[ActivityItem]
    total: int

class ChartDataPoint(BaseModel):
    label: str
    value: float
    secondary_value: Optional[float] = None
