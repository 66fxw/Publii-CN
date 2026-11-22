# -*- coding: utf-8 -*-
"""生成蓝底白字「闪核」图标全套尺寸。"""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = 'C:/Users/Admin/WorkBuddy AI/无头CMS/_icons_gen'
os.makedirs(OUT, exist_ok=True)

FONT = 'C:/Windows/Fonts/msyhbd.ttc'  # 微软雅黑粗体
BLUE1 = (34, 113, 177)   # #2271b1
BLUE2 = (19, 94, 150)    # #135e96
WHITE = (255, 255, 255)


def make_base(size=1024):
    """绘制主图：蓝色渐变圆角方 + 白色『闪核』竖排两字。"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 竖向渐变蓝底，圆角矩形
    radius = int(size * 0.20)
    for y in range(size):
        t = y / size
        r = int(BLUE1[0] * (1 - t) + BLUE2[0] * t)
        g = int(BLUE1[1] * (1 - t) + BLUE2[1] * t)
        b = int(BLUE1[2] * (1 - t) + BLUE2[2] * t)
        d.line([(0, y), (size, y)], fill=(r, g, b, 255))

    # 圆角遮罩
    mask = Image.new('L', (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    img.putalpha(mask)

    # 白色「闪核」竖排：上「闪」下「核」
    fontsize = int(size * 0.34)
    font = ImageFont.truetype(FONT, fontsize)
    for ch, cy in [('闪', 0.29), ('核', 0.71)]:
        bbox = d.textbbox((0, 0), ch, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        x = (size - w) / 2 - bbox[0]
        y = size * cy - h / 2 - bbox[1]
        d.text((x, y), ch, font=font, fill=WHITE + (255,))

    return img


def save_png(base, size, path):
    base.resize((size, size), Image.LANCZOS).save(path)


base = make_base(1024)
base.save(os.path.join(OUT, 'base-1024.png'))

# 各尺寸 PNG
for s in [1024, 512, 256, 128, 64, 48, 32, 16]:
    save_png(base, s, os.path.join(OUT, f'icon-{s}.png'))

# 多尺寸 ICO
ico_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
ico_imgs = [base.resize(s, Image.LANCZOS) for s in ico_sizes]
ico_imgs[0].save(os.path.join(OUT, 'icon.ico'), format='ICO', sizes=ico_sizes)

# ICNS（macOS）：用 PIL 的 icns 插件（若可用）
try:
    base.resize((1024, 1024), Image.LANCZOS).save(
        os.path.join(OUT, 'icon.icns'), format='ICNS')
    print('ICNS generated via PIL')
except Exception as e:
    print('PIL ICNS not available:', e)

# SVG（矢量文字版）
svg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="闪核 CMS">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2271b1"/>
      <stop offset="1" stop-color="#135e96"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="102" fill="url(#bg)"/>
  <text x="256" y="228" text-anchor="middle" dominant-baseline="central"
        font-family="Microsoft YaHei, PingFang SC, sans-serif" font-weight="700"
        font-size="176" fill="#ffffff">闪</text>
  <text x="256" y="384" text-anchor="middle" dominant-baseline="central"
        font-family="Microsoft YaHei, PingFang SC, sans-serif" font-weight="700"
        font-size="176" fill="#ffffff">核</text>
</svg>
'''
with open(os.path.join(OUT, 'icon.svg'), 'w', encoding='utf-8') as f:
    f.write(svg)

print('Generated files:')
for f in sorted(os.listdir(OUT)):
    print('  ', f, os.path.getsize(os.path.join(OUT, f)), 'B')
