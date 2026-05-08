import os
import base64
import io
from groq import Groq

# Strict extraction system prompt — NEVER evaluates truth, ONLY extracts the claim as-is
_EXTRACT_SYSTEM = """You are a claim extraction tool. Your ONLY job is to rephrase the core news claim being made in the content into a short, neutral, declarative sentence.

STRICT RULES:
- Do NOT fact-check, evaluate, or say whether the claim is true or false.
- Do NOT add phrases like "it is false that..." or "there is no evidence that..."
- Do NOT add your own opinion or knowledge.
- Return the claim EXACTLY as it is being asserted in the content, reworded as a simple news statement.
- Maximum 1-2 sentences.
- If the content says "Modi is dead", you return: "Prime Minister Narendra Modi has died."
- If the content says "WhatsApp is being banned", you return: "WhatsApp is being banned in India."
- Never refuse. Always return the claim as stated."""

_EXTRACT_IMAGE_PROMPT = """Look at this image and find the main news claim or headline being asserted.

STRICT RULES:
- Do NOT fact-check or say whether it is true or false.
- Do NOT add phrases like "it is false that..." or "there is no evidence that..."  
- Simply rephrase what the image is CLAIMING as a short declarative sentence.
- Return ONLY 1-2 sentences. No preamble. No explanation.
- Example: If image says "MODI DEAD", return: "Prime Minister Narendra Modi has died."
- Example: If image says "WhatsApp banned", return: "WhatsApp has been banned in India."
"""


class MediaService:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def _image_to_base64(self, file_bytes: bytes, mime_type: str) -> str:
        return base64.b64encode(file_bytes).decode("utf-8")

    async def extract_claim_from_image(self, file_bytes: bytes, mime_type: str) -> str:
        """
        Uses Groq vision (llama-4-scout) to extract the raw claim being made
        in the image WITHOUT evaluating truth/falsity.
        """
        b64 = self._image_to_base64(file_bytes, mime_type)

        response = self.client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{b64}"}
                        },
                        {
                            "type": "text",
                            "text": _EXTRACT_IMAGE_PROMPT
                        }
                    ]
                }
            ],
            max_tokens=100,
            temperature=0.0,
        )

        return response.choices[0].message.content.strip()

    async def extract_claim_from_audio(self, file_bytes: bytes, filename: str) -> str:
        """
        Uses Groq Whisper to transcribe audio, then extracts the raw claim
        WITHOUT evaluating whether it is true or false.
        """
        # Step 1: Transcribe
        transcription = self.client.audio.transcriptions.create(
            file=(filename, io.BytesIO(file_bytes)),
            model="whisper-large-v3",
            response_format="text",
            language="en",
        )
        transcript_text = transcription if isinstance(transcription, str) else transcription.text

        # Step 2: Extract claim — strictly no fact-checking
        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": _EXTRACT_SYSTEM},
                {"role": "user", "content": f"Content: {transcript_text}"}
            ],
            max_tokens=80,
            temperature=0.0,
        )

        return response.choices[0].message.content.strip()

    async def extract_claim_from_video(self, file_bytes: bytes, filename: str) -> str:
        """
        Transcribes video audio via Whisper, then extracts the raw claim
        WITHOUT evaluating whether it is true or false.
        """
        try:
            transcription = self.client.audio.transcriptions.create(
                file=(filename, io.BytesIO(file_bytes)),
                model="whisper-large-v3",
                response_format="text",
            )
            transcript_text = transcription if isinstance(transcription, str) else transcription.text

            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": _EXTRACT_SYSTEM},
                    {"role": "user", "content": f"Content: {transcript_text}"}
                ],
                max_tokens=80,
                temperature=0.0,
            )
            return response.choices[0].message.content.strip()

        except Exception as e:
            return f"Video processing failed: {str(e)}"
