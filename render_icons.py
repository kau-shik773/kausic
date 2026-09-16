import os
import math
from PIL import Image, ImageDraw

def render_music_system_icon(size):
    # Render at 4x for supersampling antialiasing
    scale = 4
    canvas_size = size * scale
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Padding and geometry
    pad = int(canvas_size * 0.06)
    box = [pad, pad, canvas_size - pad, canvas_size - pad]
    radius = int(canvas_size * 0.22)

    # 1. Base Speaker Cabinet (Obsidian brushed dark glass)
    draw.rounded_rectangle(box, radius=radius, fill=(12, 13, 18, 255), outline=(212, 175, 55, 230), width=int(scale * 3))

    # Inner bezel
    inset1 = int(canvas_size * 0.04)
    box_inner = [box[0] + inset1, box[1] + inset1, box[2] - inset1, box[3] - inset1]
    draw.rounded_rectangle(box_inner, radius=int(radius * 0.8), outline=(247, 231, 180, 100), width=int(scale * 1.5))

    cx = canvas_size / 2

    # 2. Tweeter (Top acoustic driver)
    t_cy = canvas_size * 0.35
    t_rad = canvas_size * 0.13
    draw.ellipse([cx - t_rad, t_cy - t_rad, cx + t_rad, t_cy + t_rad], fill=(20, 20, 26, 255), outline=(212, 175, 55, 240), width=int(scale * 2.5))
    # Tweeter inner dome
    t_dome = t_rad * 0.6
    draw.ellipse([cx - t_dome, t_cy - t_dome, cx + t_dome, t_cy + t_dome], fill=(212, 175, 55, 220), outline=(255, 240, 190, 255), width=int(scale * 1.5))

    # 3. Main Subwoofer (Bottom acoustic woofer cone)
    w_cy = canvas_size * 0.68
    w_rad = canvas_size * 0.24
    # Outer chassis rim
    draw.ellipse([cx - w_rad, w_cy - w_rad, cx + w_rad, w_cy + w_rad], fill=(16, 17, 22, 255), outline=(212, 175, 55, 255), width=int(scale * 3.5))

    # Concentric acoustic surround rings
    for step, alpha in [(0.85, 180), (0.7, 140), (0.55, 110)]:
        r = w_rad * step
        draw.ellipse([cx - r, w_cy - r, cx + r, w_cy + r], outline=(247, 231, 180, alpha), width=int(scale * 1.5))

    # Woofer Center 3D Dust Cap
    cap_rad = w_rad * 0.38
    draw.ellipse([cx - cap_rad, w_cy - cap_rad, cx + cap_rad, w_cy + cap_rad], fill=(212, 175, 55, 255), outline=(255, 250, 220, 255), width=int(scale * 2))

    # Dust cap highlight reflection
    hl_rad = cap_rad * 0.45
    draw.ellipse([cx - hl_rad * 0.5, w_cy - hl_rad * 0.8, cx + hl_rad * 0.5, w_cy - hl_rad * 0.2], fill=(255, 255, 255, 160))

    # 4. Corner Speaker Mounting Hex Screws
    screw_r = canvas_size * 0.02
    corners = [
        (box[0] + inset1 * 1.8, box[1] + inset1 * 1.8),
        (box[2] - inset1 * 1.8, box[1] + inset1 * 1.8),
        (box[0] + inset1 * 1.8, box[3] - inset1 * 1.8),
        (box[2] - inset1 * 1.8, box[3] - inset1 * 1.8)
    ]
    for sx, sy in corners:
        draw.ellipse([sx - screw_r, sy - screw_r, sx + screw_r, sy + screw_r], fill=(212, 175, 55, 220), outline=(255, 240, 180, 255), width=int(scale))

    # Downsample with high-quality Lanczos filter
    return img.resize((size, size), Image.Resampling.LANCZOS)

sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

base_res = r'frontend\android\app\src\main\res'
for folder, sz in sizes.items():
    folder_path = os.path.join(base_res, folder)
    if os.path.exists(folder_path):
        icon = render_music_system_icon(sz)
        icon.save(os.path.join(folder_path, 'ic_launcher.png'))
        icon.save(os.path.join(folder_path, 'ic_launcher_round.png'))
        icon.save(os.path.join(folder_path, 'ic_launcher_foreground.png'))
        print(f"Generated {folder}: {sz}x{sz}")

print("Successfully generated all 3D Music System launcher icons!")
