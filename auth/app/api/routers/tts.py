"""
TTS proxy — fetches audio from Google Translate TTS server-side and streams
it back to the browser.  Running on the backend eliminates all CORS issues
and works regardless of whether the user's browser/OS has a Kannada voice.

Endpoint: GET /tts?text=<word>&lang=<en|kn>
Returns:  audio/mpeg  (MP3 stream)
"""

import requests
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import Response

router = APIRouter(prefix="/tts", tags=["tts"])

ALLOWED_LANGS = {"en", "kn"}

# Browser-like User-Agent — Google rejects bot-like requests
_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)


@router.get("", summary="Text-to-speech proxy (en / kn)")
def speak(
    text: str = Query(..., max_length=200),
    lang: str = Query("en"),
):
    if lang not in ALLOWED_LANGS:
        raise HTTPException(status_code=400, detail=f"lang must be one of {ALLOWED_LANGS}")

    url = (
        "https://translate.googleapis.com/translate_tts"
        f"?ie=UTF-8&q={requests.utils.quote(text)}&tl={lang}&client=gtx&ttsspeed=1"
    )

    try:
        resp = requests.get(url, headers={"User-Agent": _UA}, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"TTS upstream error: {exc}")

    return Response(
        content=resp.content,
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "public, max-age=86400",   # cache audio 24 h
            "Content-Length": str(len(resp.content)),
        },
    )
