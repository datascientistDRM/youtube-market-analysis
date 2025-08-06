# backend/app/api/chat.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from openai import OpenAIError
from httpx import HTTPError

from app.services.openai_service import generate_queries
from app.services.youtube_service import (
    get_top_channels,
    get_channels_video_metrics,
)

router = APIRouter()

### 1) LLM → queries
class QueryRequest(BaseModel):
    message: str

class QueriesResponse(BaseModel):
    queries: list[str]

@router.post("/generate-queries", response_model=QueriesResponse)
async def generate_queries_endpoint(req: QueryRequest):
    try:
        raw   = generate_queries(req.message)
        lines = [q.strip() for q in raw.splitlines() if q.strip()]
        return QueriesResponse(queries=lines)
    except OpenAIError as e:
        raise HTTPException(502, detail="LLM error: " + str(e))

### 2) queries → channels
class ChannelsResponse(BaseModel):
    id: str
    name: str
    subscriberCount: int

class GetChannelsRequest(BaseModel):
    queries: list[str]

class ChannelsListResponse(BaseModel):
    channels: list[ChannelsResponse]

@router.post("/get-channels", response_model=ChannelsListResponse)
async def get_channels_endpoint(req: GetChannelsRequest):
    try:
        chs = await get_top_channels(req.queries)
        return ChannelsListResponse(channels=chs)
    except HTTPError:
        raise HTTPException(502, "YouTube API error while fetching channels.")

### 3) channels → video data
class VideoMetricsRequest(BaseModel):
    channels: list[ChannelsResponse]

class VideoMetricsResponse(BaseModel):
    id: str
    name: str
    subscriberCount: int
    viewCount: int
    videoCount: int

class VideoMetricsListResponse(BaseModel):
    channels: list[VideoMetricsResponse]

@router.post("/get-video-data", response_model=VideoMetricsListResponse)
async def get_video_data_endpoint(req: VideoMetricsRequest):
    try:
        # publishedAfter = ISO string for 30 days ago
        published_after = (
            datetime.utcnow() - timedelta(days=30)
        ).strftime("%Y-%m-%dT%H:%M:%SZ")

        metrics = await get_channels_video_metrics(
            [ch.dict() for ch in req.channels], published_after
        )
        return VideoMetricsListResponse(channels=metrics)
    except HTTPError:
        raise HTTPException(502, "YouTube API error while fetching video data.")
