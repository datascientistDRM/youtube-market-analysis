# backend/app/services/youtube_service.py
import os, asyncio
from datetime import datetime, timedelta
from httpx import AsyncClient, Limits, HTTPError
from typing import List, Dict

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
SEARCH_URL      = "https://www.googleapis.com/youtube/v3/search"
CHANNELS_URL    = "https://www.googleapis.com/youtube/v3/channels"
VIDEOS_URL      = "https://www.googleapis.com/youtube/v3/videos"

MAX_SEARCH_RESULTS   = 5    # how many channels per LLM query
MAX_PAGE_SIZE        = 50   # YouTube max per-page

async def fetch_search_results(client: AsyncClient, query: str) -> List[str]:
    params = {
        "part":       "snippet",
        "q":          query,
        "type":       "channel",
        "maxResults": MAX_SEARCH_RESULTS,
        "key":        YOUTUBE_API_KEY,
    }
    r = await client.get(SEARCH_URL, params=params)
    r.raise_for_status()
    data = r.json()
    return [
        item["id"]["channelId"]
        for item in data.get("items", [])
        if item.get("id", {}).get("channelId")
    ]

async def fetch_channel_details(
    client: AsyncClient,
    channel_ids: List[str],
) -> List[Dict]:
    out = []
    # batch up to 50 ids per call
    for i in range(0, len(channel_ids), MAX_PAGE_SIZE):
        batch = channel_ids[i : i + MAX_PAGE_SIZE]
        params = {
            "part": "snippet,statistics",
            "id":   ",".join(batch),
            "key":  YOUTUBE_API_KEY,
        }
        r = await client.get(CHANNELS_URL, params=params)
        r.raise_for_status()
        data = r.json()
        for it in data.get("items", []):
            subs = int(it.get("statistics", {}).get("subscriberCount", 0))
            if subs >= 50_000:
                out.append({
                    "id":              it["id"],
                    "name":            it["snippet"]["title"],
                    "subscriberCount": subs,
                })
    return out

async def get_top_channels(queries: List[str]) -> List[Dict]:
    limits = Limits(max_connections=10, max_keepalive_connections=5)
    async with AsyncClient(limits=limits, timeout=10.0) as client:
        # 1) search all queries in parallel
        tasks = [fetch_search_results(client, q) for q in queries]
        search_results = await asyncio.gather(*tasks, return_exceptions=True)

        # 2) flatten & dedupe
        ids = {cid for res in search_results if not isinstance(res, Exception) for cid in res}
        if not ids:
            return []

        # 3) fetch channel details & filter
        return await fetch_channel_details(client, list(ids))

# —— Now: video‐data over last 30 days —— #

async def fetch_video_ids_for_channel(
    client: AsyncClient, channel_id: str, published_after: str
) -> List[str]:
    video_ids = []
    params = {
        "part":           "id",
        "channelId":      channel_id,
        "publishedAfter": published_after,
        "maxResults":     MAX_PAGE_SIZE,
        "type":           "video",
        "order":          "date",
        "key":            YOUTUBE_API_KEY,
    }
    token = None
    while True:
        if token:
            params["pageToken"] = token
        r = await client.get(SEARCH_URL, params=params)
        r.raise_for_status()
        data = r.json()
        for it in data.get("items", []):
            vid = it.get("id", {}).get("videoId")
            if vid:
                video_ids.append(vid)
        token = data.get("nextPageToken")
        if not token:
            break
    return video_ids

async def fetch_videos_statistics(
    client: AsyncClient, video_ids: List[str]
) -> List[int]:
    views = []
    for i in range(0, len(video_ids), MAX_PAGE_SIZE):
        batch = video_ids[i : i + MAX_PAGE_SIZE]
        params = {
            "part": "statistics",
            "id":   ",".join(batch),
            "key":  YOUTUBE_API_KEY,
        }
        r = await client.get(VIDEOS_URL, params=params)
        r.raise_for_status()
        data = r.json()
        for it in data.get("items", []):
            v = int(it.get("statistics", {}).get("viewCount", 0))
            views.append(v)
    return views

async def get_video_metrics_for_channel(
    client: AsyncClient, channel: Dict, published_after: str
) -> Dict:
    vids = await fetch_video_ids_for_channel(client, channel["id"], published_after)
    if not vids:
        return {**channel, "viewCount": 0, "videoCount": 0}

    stats = await fetch_videos_statistics(client, vids)
    return {
        **channel,
        "viewCount":  sum(stats),
        "videoCount": len(stats),
    }

async def get_channels_video_metrics(
    channels: List[Dict], published_after: str
) -> List[Dict]:
    limits = Limits(max_connections=5, max_keepalive_connections=2)
    async with AsyncClient(limits=limits, timeout=20.0) as client:
        tasks = [
            get_video_metrics_for_channel(client, ch, published_after)
            for ch in channels
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
    return [r for r in results if not isinstance(r, Exception)]
