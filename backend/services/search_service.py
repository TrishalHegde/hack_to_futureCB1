import os
import aiohttp
import asyncio
from typing import Dict, Any

class SearchService:
    def __init__(self):
        self.tavily_api_key = os.getenv("TAVILY_API_KEY")
        self.serper_api_key = os.getenv("SERPER_API_KEY")

    async def search_tavily(self, claim: str) -> Dict[str, Any]:
        if not self.tavily_api_key:
            return {"results": []}
            
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": self.tavily_api_key,
            "query": f"{claim} news fact-check",
            "search_depth": "basic",
            "include_answer": False,
            "max_results": 3
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        return await response.json()
            except Exception as e:
                print(f"Tavily search failed: {e}")
        return {"results": []}

    async def search_serper(self, claim: str) -> Dict[str, Any]:
        if not self.serper_api_key:
            return {"organic": []}
            
        url = "https://google.serper.dev/search"
        payload = {
            "q": f"{claim} site:twitter.com OR site:reddit.com",
            "num": 3
        }
        headers = {
            'X-API-KEY': self.serper_api_key,
            'Content-Type': 'application/json'
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status == 200:
                        return await response.json()
            except Exception as e:
                print(f"Serper search failed: {e}")
        return {"organic": []}

    async def parallel_search(self, claim: str):
        tavily_task = self.search_tavily(claim)
        serper_task = self.search_serper(claim)
        
        tavily_res, serper_res = await asyncio.gather(tavily_task, serper_task)
        
        results = []
        
        for item in tavily_res.get("results", []):
            results.append({
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "content": item.get("content", "")
            })
            
        for item in serper_res.get("organic", []):
            results.append({
                "title": item.get("title", ""),
                "url": item.get("link", ""),
                "content": item.get("snippet", "")
            })
            
        return results
