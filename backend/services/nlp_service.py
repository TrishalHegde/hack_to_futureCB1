from langdetect import detect
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate
import re

class NLPService:
    @staticmethod
    def detect_script(text: str) -> str:
        try:
            lang = detect(text)
            return lang
        except:
            return "en"

    @staticmethod
    def normalize_text(text: str) -> str:
        # Strip PII (very basic example for phone/email)
        text = re.sub(r'[\w\.-]+@[\w\.-]+', '[EMAIL]', text)
        text = re.sub(r'\b\d{10}\b', '[PHONE]', text)
        
        lang = NLPService.detect_script(text)
        
        # If Latin script but might be romanized Hindi/Marathi
        # For this MVP, if it looks like Roman Hindi/Marathi, we can attempt transliteration
        # Here we just use a heuristic: if we want to force transliterate roman to devanagari
        # Actually langdetect might detect 'hi' or 'mr' even if it's romanized, or 'en'.
        # We will keep it simple: if it's pure ascii, we could leave it or transliterate.
        # Let's assume for MVP we check if it's romanized by looking at ascii characters
        # and maybe just let the LLM handle meaning. The TRD says "Convert Romanized Hindi/Marathi to native Devanagari"
        if text.isascii() and lang != 'en':
            # This is a naive transliteration for MVP
            text = transliterate(text, sanscript.ITRANS, sanscript.DEVANAGARI)
            
        return text
