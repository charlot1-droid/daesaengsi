"""해피엔딩 CG(cg-true-ending)의 노란 책 표지에 「새생활의 시작」을 그림에 직접 인쇄해 넣어요.
화면에서 글자를 겹쳐 얹으면 너무 또렷하고 납작해서, 표지의 빛·그늘을 머금도록 곱하기 합성 + 원근 변형 + 살짝 흐림.
사용: python3 tools/bake-cover.py <원본 png> <글꼴(Gowun Dodum woff/ttf)> public/art/cg/cg-true-ending.webp
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

src_path, font_path, out_path = sys.argv[1:4]
src = Image.open(src_path).convert('RGB')
src = src.resize((1920, round(src.height * 1920 / src.width)), Image.LANCZOS)
W, H = src.size
QUAD = [(30.7, 80.4), (42.0, 80.1), (44.2, 95.3), (29.1, 96.5)]  # 표지 네 모서리 (%, 왼쪽 위부터 시계 방향)
Q = [(x / 100 * W, y / 100 * H) for x, y in QUAD]

CW, CH = 1250, 1000
canvas = Image.new('L', (CW, CH), 0); d = ImageDraw.Draw(canvas)
big, small = ImageFont.truetype(font_path, 118), ImageFont.truetype(font_path, 86)
chars = list('새생활의 시작'); gap = 14
widths = [46 if ch == ' ' else (small if ch == '의' else big).getlength(ch) + gap for ch in chars]
x = (CW - (sum(widths) - gap)) / 2; base = CH * 0.44
for ch, w in zip(chars, widths):
    if ch != ' ':
        f = small if ch == '의' else big
        dy = -34 if ch == '생' else (14 if ch == '의' else 0)  # 실제 표지처럼 '생'은 위로, '의'는 작게
        d.text((x, base + dy), ch, font=f, fill=255, anchor='ls')
    x += w
canvas = canvas.filter(ImageFilter.GaussianBlur(1.6))

def coeffs(dst, srcpts):
    A, B = [], []
    for (x, y), (u, v) in zip(dst, srcpts):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); B.append(v)
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()

mask = canvas.transform((W, H), Image.PERSPECTIVE, coeffs(Q, [(0, 0), (CW, 0), (CW, CH), (0, CH)]), Image.BICUBIC)
a = np.asarray(mask.filter(ImageFilter.GaussianBlur(0.5))).astype(float) / 255 * 0.86
base_px = np.asarray(src).astype(float)
ink = np.array([58, 40, 34], float)
out = base_px * (1 - a[..., None]) + (base_px * ink / 255) * a[..., None]
Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(out_path, 'WEBP', quality=90)
print('saved', out_path)
