#!/usr/bin/env python3
"""
Marketing asset generator for Lach Eat & Smile Kitchen.
Re-run any time (e.g. after the site is deployed) with:
    python3 generate_assets.py https://your-real-domain.com
"""
import sys, os
import qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

SITE_URL = sys.argv[1] if len(sys.argv) > 1 else "https://lach-eat-smile.vercel.app"

HERE = os.path.dirname(os.path.abspath(__file__))
MEDIA = os.path.join(HERE, "..", "app", "public", "media")
OUT = HERE

# Brand palette
FOREST = "#142e1f"
LEAF = "#1f4d33"
OLIVE = "#7c7a28"
OLIVE_LIGHT = "#a3a14a"
CREAM = "#faf6ec"
SAND = "#f1ead8"
FLAME = "#e4762b"

DISPLAY = "/usr/share/fonts/opentype/urw-base35/URWBookman-Demi.otf"
BODY = "/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf"
BODY_BOLD = "/usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf"

def F(path, size):
    return ImageFont.truetype(path, size)

def logo(height):
    im = Image.open(os.path.join(MEDIA, "logo.png")).convert("RGBA")
    w = int(im.width * height / im.height)
    return im.resize((w, height), Image.LANCZOS)

def photo(name, size, radius=0):
    im = Image.open(os.path.join(MEDIA, name)).convert("RGB")
    im = ImageOps.fit(im, size, Image.LANCZOS)
    if radius:
        mask = Image.new("L", size, 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, *size], radius, fill=255)
        out = Image.new("RGBA", size)
        out.paste(im, (0, 0), mask)
        return out
    return im.convert("RGBA")

def circle_photo(name, d):
    im = Image.open(os.path.join(MEDIA, name)).convert("RGB")
    im = ImageOps.fit(im, (d, d), Image.LANCZOS)
    mask = Image.new("L", (d, d), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, d, d], fill=255)
    out = Image.new("RGBA", (d, d))
    out.paste(im, (0, 0), mask)
    return out

def make_qr(url, box=18):
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=box, border=2)
    q.add_data(url)
    q.make(fit=True)
    return q.make_image(fill_color=FOREST, back_color=CREAM).convert("RGBA")

def center_text(d, xy, text, font, fill, anchor="mm"):
    d.text(xy, text, font=font, fill=fill, anchor=anchor)

def shadow_card(base, box, radius, fill=CREAM):
    x0, y0, x1, y1 = box
    sh = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([x0 + 8, y0 + 14, x1 + 8, y1 + 14], radius, fill=(0, 0, 0, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(sh)
    ImageDraw.Draw(base).rounded_rectangle(box, radius, fill=fill)

# ────────────────────────── 1. QR FLYER (A5, 300dpi) ──────────────────────────
def qr_flyer():
    W, H = 1748, 2480
    im = Image.new("RGBA", (W, H), CREAM)
    d = ImageDraw.Draw(im)

    # top forest band
    d.rectangle([0, 0, W, 560], fill=FOREST)
    d.rectangle([0, 560, W, 580], fill=OLIVE)

    lg = logo(210)
    card_w, card_h = lg.width + 120, 300
    shadow_card(im, ((W - card_w)//2, 130, (W + card_w)//2, 130 + card_h), 40)
    im.alpha_composite(lg, ((W - lg.width)//2, 130 + (card_h - lg.height)//2))
    d = ImageDraw.Draw(im)

    center_text(d, (W//2, 760), "Scan. Order. Smile.", F(DISPLAY, 150), FOREST)
    center_text(d, (W//2, 900), "Fresh Naija comfort food — order online in seconds",
                F(BODY, 62), LEAF)

    # QR card
    qr = make_qr(SITE_URL).resize((900, 900), Image.LANCZOS)
    qx, qy = (W - 1020)//2, 1000
    shadow_card(im, (qx, qy, qx + 1020, qy + 1020), 60)
    im.alpha_composite(qr, (qx + 60, qy + 60))
    d = ImageDraw.Draw(im)

    # url pill
    pill_w = 900
    d.rounded_rectangle([(W - pill_w)//2, 2085, (W + pill_w)//2, 2185], 50, fill=FLAME)
    center_text(d, (W//2, 2135), SITE_URL.replace("https://", ""), F(BODY_BOLD, 56), "white")

    # bottom strip: photos
    y0 = 2255
    ph_w = W // 4
    for i, name in enumerate(["efo-riro-1.jpg", "akara-1.jpg", "masa-poster.jpg", "mosa-poster.jpg"]):
        p = photo(name, (ph_w, H - y0))
        im.paste(p, (i * ph_w, y0))

    im.convert("RGB").save(os.path.join(OUT, "qr-flyer-a5.png"), dpi=(300, 300))
    print("qr-flyer-a5.png")

# ────────────────────────── 2. INSTAGRAM BANNER 1080×1080 ──────────────────────────
def ig_banner():
    S = 1080
    im = Image.new("RGBA", (S, S), FOREST)
    d = ImageDraw.Draw(im)

    # decorative rings
    for r, c in [(760, LEAF), (700, FOREST)]:
        d.ellipse([S - r - 60, -140, S + r - 60, r * 2 - 140], outline=c, width=3)

    p = circle_photo("efo-riro-1.jpg", 470)
    ring = Image.new("RGBA", (510, 510), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse([0, 0, 510, 510], fill=OLIVE_LIGHT)
    im.alpha_composite(ring, (S - 560, 120))
    im.alpha_composite(p, (S - 540, 140))

    p2 = circle_photo("akara-1.jpg", 300)
    ring2 = Image.new("RGBA", (330, 330), (0, 0, 0, 0))
    ImageDraw.Draw(ring2).ellipse([0, 0, 330, 330], fill=FLAME)
    im.alpha_composite(ring2, (S - 400, 560))
    im.alpha_composite(p2, (S - 385, 575))
    d = ImageDraw.Draw(im)

    # logo card
    lg = logo(120)
    shadow_card(im, (70, 80, 70 + lg.width + 70, 80 + 180), 30)
    im.alpha_composite(lg, (105, 80 + 30))
    d = ImageDraw.Draw(im)

    d.text((70, 380), "We're now", font=F(DISPLAY, 105), fill=CREAM)
    d.text((70, 495), "ONLINE!", font=F(DISPLAY, 150), fill=FLAME)
    d.text((70, 680), "Efo Riro · Akara · Masa · Mosa", font=F(BODY_BOLD, 44), fill=OLIVE_LIGHT)
    d.text((70, 745), "Order online, pay by transfer,", font=F(BODY, 42), fill="#e8e3d0")
    d.text((70, 800), "delivered fresh in Lekki.", font=F(BODY, 42), fill="#e8e3d0")

    d.rounded_rectangle([70, 900, 720, 1000], 50, fill=CREAM)
    center_text(d, (395, 950), SITE_URL.replace("https://", ""), F(BODY_BOLD, 44), FOREST)

    im.convert("RGB").save(os.path.join(OUT, "banner-instagram-1080.png"))
    print("banner-instagram-1080.png")

# ────────────────────────── 3. STORY BANNER 1080×1920 ──────────────────────────
def story_banner():
    W, H = 1080, 1920
    im = Image.new("RGBA", (W, H), CREAM)
    d = ImageDraw.Draw(im)

    # top photo with curve
    p = photo("efo-riro-1.jpg", (W, 780))
    im.paste(p, (0, 0))
    d.ellipse([-200, 640, W + 200, 920], fill=CREAM)

    lg = logo(150)
    im.alpha_composite(lg, ((W - lg.width)//2, 800))
    d = ImageDraw.Draw(im)

    center_text(d, (W//2, 1060), "Craving", F(DISPLAY, 110), FOREST)
    center_text(d, (W//2, 1180), "homemade?", F(DISPLAY, 130), FLAME)
    center_text(d, (W//2, 1310), "Hot, fresh & delivered to your door", F(BODY, 48), LEAF)

    qr = make_qr(SITE_URL).resize((360, 360), Image.LANCZOS)
    shadow_card(im, ((W - 420)//2, 1390, (W + 420)//2, 1810), 40)
    im.alpha_composite(qr, ((W - 360)//2, 1420))
    d = ImageDraw.Draw(im)
    center_text(d, (W//2, 1835), "Scan to order  ·  " + SITE_URL.replace("https://", ""),
                F(BODY_BOLD, 36), FOREST)

    im.convert("RGB").save(os.path.join(OUT, "banner-story-1080x1920.png"))
    print("banner-story-1080x1920.png")

# ────────────────────────── 4. AD — EFO RIRO 1080×1080 ──────────────────────────
def ad_efo():
    S = 1080
    im = Image.new("RGBA", (S, S), CREAM)
    p = photo("efo-riro-1.jpg", (S, S))
    im.paste(p, (0, 0))

    # dark gradient bottom
    grad = Image.new("L", (1, S), 0)
    for y in range(S):
        grad.putpixel((0, y), int(max(0, (y - S * 0.35)) / (S * 0.65) * 235))
    grad = grad.resize((S, S))
    dark = Image.new("RGBA", (S, S), FOREST)
    dark.putalpha(grad)
    im.alpha_composite(dark)
    d = ImageDraw.Draw(im)

    # price burst
    d.ellipse([790, 60, 1030, 300], fill=FLAME)
    center_text(d, (910, 155), "from", F(BODY_BOLD, 40), "white")
    center_text(d, (910, 210), "₦3,500", F(BODY_BOLD, 62), "white")

    lg = logo(95)
    shadow_card(im, (50, 50, 50 + lg.width + 60, 50 + 145), 26)
    im.alpha_composite(lg, (80, 50 + 25))
    d = ImageDraw.Draw(im)

    d.text((60, 660), "Efo Riro,", font=F(DISPLAY, 115), fill=CREAM)
    d.text((60, 785), "like Mama makes it.", font=F(DISPLAY, 78), fill=OLIVE_LIGHT)
    d.text((60, 900), "Cooked fresh when you order · Delivered in Lekki", font=F(BODY, 40), fill="#e8e3d0")

    d.rounded_rectangle([60, 970, 660, 1050], 40, fill=FLAME)
    center_text(d, (360, 1010), "Order now → " + SITE_URL.replace("https://", ""),
                F(BODY_BOLD, 36), "white")

    im.convert("RGB").save(os.path.join(OUT, "ad-efo-riro-1080.png"))
    print("ad-efo-riro-1080.png")

# ────────────────────────── 5. AD — AKARA 1080×1350 ──────────────────────────
def ad_akara():
    W, H = 1080, 1350
    im = Image.new("RGBA", (W, H), FOREST)
    d = ImageDraw.Draw(im)

    p = photo("akara-2.jpg", (W - 120, 760), radius=50)
    im.alpha_composite(p, (60, 60))
    d = ImageDraw.Draw(im)

    # sticker
    d.ellipse([820, 700, 1040, 920], fill=OLIVE)
    center_text(d, (930, 785), "10 pcs", F(BODY_BOLD, 44), CREAM)
    center_text(d, (930, 840), "₦1,500", F(BODY_BOLD, 52), "white")

    d.text((70, 880), "Weekend plans?", font=F(BODY_BOLD, 48), fill=OLIVE_LIGHT)
    d.text((60, 940), "Hot Akara,", font=F(DISPLAY, 110), fill=CREAM)
    d.text((60, 1060), "zero stress.", font=F(DISPLAY, 110), fill=FLAME)

    d.rounded_rectangle([60, 1215, 700, 1295], 40, fill=CREAM)
    center_text(d, (380, 1255), "Order at " + SITE_URL.replace("https://", ""),
                F(BODY_BOLD, 38), FOREST)

    lg = logo(80)
    card = Image.new("RGBA", (lg.width + 40, 110), CREAM)
    card_r = Image.new("RGBA", card.size, (0, 0, 0, 0))
    ImageDraw.Draw(card_r).rounded_rectangle([0, 0, *card.size], 22, fill=CREAM)
    card_r.alpha_composite(lg, (20, 15))
    im.alpha_composite(card_r, (W - card_r.width - 60, 1205))

    im.convert("RGB").save(os.path.join(OUT, "ad-akara-1080x1350.png"))
    print("ad-akara-1080x1350.png")

if __name__ == "__main__":
    qr_flyer()
    ig_banner()
    story_banner()
    ad_efo()
    ad_akara()
    print("All assets generated for", SITE_URL)
