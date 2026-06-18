import os
import json
from openai import AsyncOpenAI
from typing import Dict, Any, List

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=self.api_key,
        )
        self.model = "openai/gpt-4o-mini"

    async def translate_text(self, text: str) -> str:
        prompt = f"""
        Translate the following text to clear, precise English.
        If the text is Romanized Hindi ("Hinglish") or any other regional language, understand its context and translate its meaning to English.
        If it is already in English, simply return the original text, fixing any obvious typos.
        Return ONLY the translated English text, without any additional commentary.
        
        Text: {text}
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error translating text: {e}")
            return text

    async def extract_claim(self, text: str) -> Dict[str, Any]:
        prompt = f"""
        You are an expert Fact-Checking Intelligence Analyst. Your task is to process raw text from social media and extract the core "Atomic Claim."

        RULES:
        1. Extract exactly ONE primary claim that can be verified with evidence.
        2. Identify the language and script (e.g., Hindi-Latin, Marathi-Devanagari).
        3. Extract specific entities (Names, Places, Organizations).
        4. If the text is Romanized regional language (e.g., "Hinglish"), summarize it in clear English for search optimization.

        OUTPUT FORMAT (JSON ONLY):
        {{
          "detected_language": "string",
          "atomic_claim": "string",
          "search_queries": ["query 1", "query 2"],
          "entities": ["entity 1", "entity 2"],
          "is_opinion": boolean
        }}
        
        Text: {text}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"Error extracting claim: {e}")
            return {
                "detected_language": "Unknown",
                "atomic_claim": text,
                "search_queries": [text],
                "entities": [],
                "is_opinion": False
            }

    async def synthesize_evidence(self, claim: str, search_results: List[Dict[str, str]]) -> Dict[str, Any]:
        context = "\n".join([f"Source ({res.get('url')}): {res.get('content')}" for res in search_results])
        
        prompt = f"""
        Analyze the following claim against the provided search evidence.
        
        Claim: {claim}
        
        Evidence:
        {context}
        
        Determine if the claim is TRUE, LIKELY TRUE, MIXED, LIKELY FALSE, FALSE, or UNVERIFIABLE.
        Return ONLY a JSON object with this structure:
        {{
            "verdict": "string",
            "confidence": 0.0 to 1.0,
            "reasoning": "Detailed explanation based on evidence",
            "threat_tactic": "string (e.g. Maximize Exposure or None)",
            "threat_technique": "string (e.g. Bot Amplification or None)"
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"Error synthesizing evidence: {e}")
            return {
                "verdict": "UNVERIFIABLE", 
                "confidence": 0.0, 
                "reasoning": "Could not process evidence.",
                "threat_tactic": "None",
                "threat_technique": "None"
            }
