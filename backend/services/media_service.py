import os
import base64
import io
from groq import Groq

class MediaService:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def _image_to_base64(self, file_bytes: bytes, mime_type: str) -> str:
        return base64.b64encode(file_bytes).decode("utf-8")

    async def extract_claim_from_image(self, file_bytes: bytes, mime_type: str) -> str:
        """
        Uses Groq vision (llama-4-scout) to extract ONLY the main news claim
        from an uploaded image such as a meme or viral screenshot.
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
                            "image_url": {
                                "url": f"data:{mime_type};base64,{b64}"
                            }
                        },
                        {
                            "type": "text",
                            "text": (
                                "Look at this image carefully. "
                                "Extract ONLY the main factual claim or news headline from the text in this image. "
                                "Do NOT include any explanations, source names, hashtags, or opinions. "
                                "Return ONLY 1-2 sentences that represent the core verifiable claim being made. "
                                "If there are multiple claims, pick the most significant one. "
                                "Example format: 'The government has mandated that WhatsApp must be linked to an active SIM card.'"
                            )
                        }
                    ]
                }
            ],
            max_tokens=150,
            temperature=0.1,
        )

        return response.choices[0].message.content.strip()

    async def extract_claim_from_audio(self, file_bytes: bytes, filename: str) -> str:
        """
        Uses Groq Whisper to transcribe audio and then extracts the main claim.
        """
        # Step 1: Transcribe with Whisper
        transcription = self.client.audio.transcriptions.create(
            file=(filename, io.BytesIO(file_bytes)),
            model="whisper-large-v3",
            response_format="text",
            language="en",
        )

        transcript_text = transcription if isinstance(transcription, str) else transcription.text

        # Step 2: Extract main claim from transcript
        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert at extracting core factual claims from spoken content. "
                        "Extract ONLY the single most important verifiable news claim. "
                        "Return 1-2 sentences maximum. No preambles, no explanations."
                    )
                },
                {
                    "role": "user",
                    "content": f"Transcript: {transcript_text}"
                }
            ],
            max_tokens=120,
            temperature=0.1,
        )

        main_claim = response.choices[0].message.content.strip()
        return main_claim

    async def extract_claim_from_video(self, file_bytes: bytes, filename: str) -> str:
        """
        For video, we extract the audio track and process via Whisper.
        Falls back to a descriptive message if extraction fails.
        """
        # Groq Whisper can handle mp4/webm audio streams directly
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
                    {
                        "role": "system",
                        "content": (
                            "Extract ONLY the single most important verifiable news claim from this video transcript. "
                            "Return 1-2 sentences maximum. No preambles."
                        )
                    },
                    {"role": "user", "content": transcript_text}
                ],
                max_tokens=120,
                temperature=0.1,
            )
            return response.choices[0].message.content.strip()

        except Exception as e:
            return f"Video processing failed: {str(e)}"
