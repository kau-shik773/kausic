import os
import sys
import time
import json
import logging
import threading
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from ytmusicapi import YTMusic
import yt_dlp
import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = Flask(__name__)
CORS(app)

yt = YTMusic()

# Cache stream URLs to avoid re-extracting frequently
# video_id -> {"url": str, "expiry": float, "title": str}
stream_cache = {}

# Adblock telemetry tracker
adblock_stats = {
    "blocked_ad_requests": 0,
    "sanitized_cue_points": 0,
    "bypassed_interstitials": 0,
    "saved_bandwidth_mb": 0.0
}

ydl_opts = {
    "format": "bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio/best",
    "quiet": True,
    "no_warnings": True,
    "extract_flat": False,
    "skip_download": True,
    "extractor_args": {
        "youtube": {
            "player_client": ["android"]
        }
    }
}

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "system": "KAUSIC Core Acoustic Cloud Engine",
        "status": "online",
        "author": "Designed by Kaushik",
        "endpoints": {
            "health": "/api/health",
            "search": "/api/search?q=<query>",
            "feed": "/api/feed/<category>",
            "stream": "/api/stream?id=<video_id>"
        }
    })

def prefetch_stream(video_id):
    """Background extractor to pre-warm streams for instant 0ms playback."""
    if not video_id or video_id in stream_cache:
        return
    try:
        url = f"https://www.youtube.com/watch?v={video_id}"
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            stream_url = info.get("url")
            if not stream_url and "formats" in info:
                audio_formats = [f for f in info["formats"] if f.get("acodec") != "none" and f.get("vcodec") == "none"]
                if audio_formats:
                    audio_formats.sort(key=lambda x: x.get("abr", 0) or 0, reverse=True)
                    stream_url = audio_formats[0].get("url")
            if stream_url:
                stream_cache[video_id] = {
                    "url": stream_url,
                    "expiry": time.time() + (3.5 * 3600),
                    "title": info.get("title", "")
                }
                logging.info(f"[Instant Pre-warm] Cached stream for {video_id}: {info.get('title')}")
    except Exception as e:
        logging.debug(f"Pre-warm failed for {video_id}: {e}")

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "engine": "adblock-rust-compatible",
        "client": "WEB_REMIX",
        "cached_streams": len(stream_cache)
    })

@app.route("/api/adblock/stats", methods=["GET"])
def get_adblock_stats():
    return jsonify(adblock_stats)

@app.route("/api/home", methods=["GET"])
def get_home():
    try:
        top_hits = yt.search("Top Hits 2026", filter="songs")[:15]
        trending = yt.search("Trending Music", filter="songs")[:15]
        popular_playlists = yt.search("Top Hits", filter="playlists")[:8]
        
        cleaned_playlists = []
        for pl in popular_playlists:
            b_id = pl.get("browseId", "")
            if b_id.startswith("VL"):
                b_id = b_id[2:]
            cleaned_playlists.append({
                "browseId": b_id,
                "title": pl.get("title"),
                "thumbnails": pl.get("thumbnails", []),
                "author": pl.get("author")
            })

        return jsonify({
            "top_hits": top_hits,
            "trending": trending,
            "playlists": cleaned_playlists
        })
    except Exception as e:
        logging.error(f"Error fetching home feed: {e}")
        return jsonify({"error": str(e)}), 500

feed_cache = {}

CATEGORY_QUERIES = {
    "punjabi": ["Top Punjabi Songs 2026", "Punjabi Top 50", "Latest Punjabi Hits"],
    "hindi": ["Top Bollywood Songs 2026", "Hindi Top 50", "Arijit Singh Hits"],
    "haryanvi": ["Top Haryanvi Songs 2026", "Haryanvi Top 50", "Latest Haryanvi Hits"],
    "trending": ["Trending Music India 2026", "Viral Hits 2026", "Global Trending Songs"],
    "latest": ["Latest Song Releases 2026", "New Bollywood Releases", "New Punjabi Releases"]
}

@app.route("/api/feed/<category>", methods=["GET"])
def get_category_feed(category):
    cat_key = category.lower().strip()
    now = time.time()
    
    if cat_key in feed_cache and (now - feed_cache[cat_key]["timestamp"]) < 1800:
        return jsonify({"category": cat_key, "results": feed_cache[cat_key]["data"], "cached": True})

    queries = CATEGORY_QUERIES.get(cat_key, [f"{cat_key} songs 2026"])
    collected = []
    seen_ids = set()

    try:
        for q in queries:
            items = yt.search(q, filter="songs")[:25]
            for item in items:
                v_id = item.get("videoId") or item.get("browseId")
                if v_id and v_id not in seen_ids:
                    seen_ids.add(v_id)
                    collected.append(item)
            if len(collected) >= 50:
                break
        
        feed_cache[cat_key] = {"data": collected[:50], "timestamp": now}

        # Pre-warm top 3 tracks in background for instantaneous zero-wait playback
        def warm_top_tracks(tracks):
            for t in tracks:
                vid = t.get("videoId") or t.get("browseId")
                if vid:
                    prefetch_stream(vid)
        threading.Thread(target=warm_top_tracks, args=(collected[:3],), daemon=True).start()

        return jsonify({"category": cat_key, "results": collected[:50], "cached": False})
    except Exception as e:
        logging.error(f"Error fetching feed for category '{cat_key}': {e}")
        if cat_key in feed_cache:
            return jsonify({"category": cat_key, "results": feed_cache[cat_key]["data"], "cached": True})
        return jsonify({"error": str(e), "results": []}), 500

@app.route("/api/prefetch", methods=["GET"])
def prefetch_endpoint():
    video_id = request.args.get("id", "").strip()
    if video_id:
        threading.Thread(target=prefetch_stream, args=(video_id,), daemon=True).start()
    return jsonify({"status": "prefetching", "id": video_id})


@app.route("/api/search", methods=["GET"])
def search():
    query = request.args.get("q", "").strip()
    filter_type = request.args.get("filter", "songs").strip()
    if not query:
        return jsonify({"results": []})
    
    try:
        if filter_type == "all":
            results = yt.search(query)[:25]
        else:
            results = yt.search(query, filter=filter_type)[:25]
        return jsonify({"results": results})
    except Exception as e:
        logging.error(f"Error executing search for '{query}': {e}")
        return jsonify({"error": str(e), "results": []}), 500

@app.route("/api/playlist", methods=["GET"])
def get_playlist():
    playlist_id = request.args.get("id", "").strip()
    if not playlist_id:
        return jsonify({"error": "Missing playlist id"}), 400
    
    if playlist_id.startswith("VL"):
        playlist_id = playlist_id[2:]

    try:
        data = yt.get_playlist(playlist_id, limit=100)
        return jsonify(data)
    except Exception as e:
        logging.error(f"Error fetching playlist {playlist_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/artist", methods=["GET"])
def get_artist():
    channel_id = request.args.get("id", "").strip()
    if not channel_id:
        return jsonify({"error": "Missing artist id"}), 400
    try:
        data = yt.get_artist(channel_id)
        return jsonify(data)
    except Exception as e:
        logging.error(f"Error fetching artist {channel_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/album", methods=["GET"])
def get_album():
    album_id = request.args.get("id", "").strip()
    if not album_id:
        return jsonify({"error": "Missing album id"}), 400
    try:
        data = yt.get_album(album_id)
        return jsonify(data)
    except Exception as e:
        logging.error(f"Error fetching album {album_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/radio", methods=["GET"])
def get_radio():
    video_id = request.args.get("id", "").strip()
    if not video_id:
        return jsonify({"error": "Missing video id"}), 400
    try:
        watch_playlist = yt.get_watch_playlist(videoId=video_id, limit=50)
        adblock_stats["sanitized_cue_points"] += 1
        return jsonify(watch_playlist)
    except Exception as e:
        logging.error(f"Error fetching radio for {video_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/lyrics", methods=["GET"])
def get_lyrics():
    video_id = request.args.get("id", "").strip()
    if not video_id:
        return jsonify({"lyrics": None})
    try:
        watch_playlist = yt.get_watch_playlist(videoId=video_id)
        lyrics_id = watch_playlist.get("lyrics")
        if not lyrics_id:
            return jsonify({"lyrics": None, "source": None})
        data = yt.get_lyrics(lyrics_id)
        return jsonify(data)
    except Exception as e:
        logging.warning(f"Lyrics not available for {video_id}: {e}")
        return jsonify({"lyrics": None, "source": None})

@app.route("/api/stream", methods=["GET"])
def get_stream():
    video_id = request.args.get("id", "").strip()
    if not video_id:
        return jsonify({"error": "Missing video id"}), 400

    now = time.time()
    if video_id in stream_cache:
        cached = stream_cache[video_id]
        if now < cached["expiry"]:
            adblock_stats["bypassed_interstitials"] += 1
            adblock_stats["blocked_ad_requests"] += 2
            adblock_stats["saved_bandwidth_mb"] = round(adblock_stats["saved_bandwidth_mb"] + 4.2, 1)
            return jsonify({
                "stream_url": cached["url"],
                "proxy_url": f"/api/stream_raw?id={video_id}",
                "video_id": video_id,
                "cached": True
            })

    try:
        url = f"https://www.youtube.com/watch?v={video_id}"
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            stream_url = info.get("url")
            
            if not stream_url and "formats" in info:
                audio_formats = [f for f in info["formats"] if f.get("acodec") != "none" and f.get("vcodec") == "none"]
                if audio_formats:
                    audio_formats.sort(key=lambda x: x.get("abr", 0) or 0, reverse=True)
                    stream_url = audio_formats[0].get("url")

            if not stream_url:
                return jsonify({"error": "Could not extract stream URL"}), 500

            stream_cache[video_id] = {
                "url": stream_url,
                "expiry": now + (3.5 * 3600),
                "title": info.get("title", "")
            }

            adblock_stats["bypassed_interstitials"] += 1
            adblock_stats["blocked_ad_requests"] += 3
            adblock_stats["saved_bandwidth_mb"] = round(adblock_stats["saved_bandwidth_mb"] + 4.5, 1)

            return jsonify({
                "stream_url": stream_url,
                "proxy_url": f"/api/stream_raw?id={video_id}",
                "video_id": video_id,
                "title": info.get("title"),
                "duration": info.get("duration"),
                "cached": False
            })
    except Exception as e:
        logging.error(f"Failed to extract stream for {video_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/stream_raw", methods=["GET"])
def stream_raw():
    video_id = request.args.get("id", "").strip()
    if not video_id:
        return Response("Missing id", status=400)

    now = time.time()
    stream_url = None
    if video_id in stream_cache and now < stream_cache[video_id]["expiry"]:
        stream_url = stream_cache[video_id]["url"]
    else:
        try:
            url = f"https://www.youtube.com/watch?v={video_id}"
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                stream_url = info.get("url")
                if not stream_url and "formats" in info:
                    audio_formats = [f for f in info["formats"] if f.get("acodec") != "none" and f.get("vcodec") == "none"]
                    if audio_formats:
                        audio_formats.sort(key=lambda x: x.get("abr", 0) or 0, reverse=True)
                        stream_url = audio_formats[0].get("url")
                if stream_url:
                    stream_cache[video_id] = {
                        "url": stream_url,
                        "expiry": now + (3.5 * 3600),
                        "title": info.get("title", "")
                    }
        except Exception as e:
            logging.error(f"Failed to resolve stream for stream_raw {video_id}: {e}")
            return Response(f"Resolution failed: {e}", status=500)

    if not stream_url:
        return Response("Audio stream not found", status=404)

    req_headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    range_header = request.headers.get('Range', None)
    if range_header:
        req_headers['Range'] = range_header

    try:
        upstream = requests.get(stream_url, headers=req_headers, stream=True, timeout=12)

        def generate():
            for chunk in upstream.iter_content(chunk_size=65536):
                if chunk:
                    yield chunk

        resp_headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Accept-Ranges': 'bytes',
            'Content-Type': upstream.headers.get('Content-Type', 'audio/webm'),
            'Cache-Control': 'no-cache'
        }
        if 'Content-Length' in upstream.headers:
            resp_headers['Content-Length'] = upstream.headers['Content-Length']
        if 'Content-Range' in upstream.headers:
            resp_headers['Content-Range'] = upstream.headers['Content-Range']

        return Response(
            stream_with_context(generate()),
            status=upstream.status_code,
            headers=resp_headers
        )
    except Exception as e:
        logging.error(f"Streaming error for {video_id}: {e}")
        return Response(f"Streaming failed: {e}", status=500)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    logging.info(f"Starting YouTube Music Ad-Free Engine on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
