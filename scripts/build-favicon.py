"""Generate public/favicon.svg and public/favicon.ico from one pixel grid."""
import pathlib, struct, zlib

GRID = """
......####......
....########....
...##########...
.##############.
################
################
.##############.
..############..
....########....
................
....ooo.........
....ooo.........
....ooo.........
................
oo..............
oo..............
""".strip().splitlines()

BUBBLE = (0xff, 0x2e, 0x97)  # --neon-magenta
TRAIL = (0xb0, 0x6f, 0xff)   # --purple, as in HeroArt's first palette pair
COLOURS = {'#': BUBBLE, 'o': TRAIL}

assert len(GRID) == 16 and all(len(r) == 16 for r in GRID), [len(r) for r in GRID]

# ---- SVG: merge horizontal runs so a glyph costs a handful of nodes, not 256 ----
def runs(ch):
    for y, row in enumerate(GRID):
        x = 0
        while x < len(row):
            if row[x] == ch:
                w = 0
                while x + w < len(row) and row[x + w] == ch:
                    w += 1
                yield x, y, w
                x += w
            else:
                x += 1

rects = []
for ch, (r, g, b) in COLOURS.items():
    for x, y, w in runs(ch):
        rects.append(f'  <rect x="{x}" y="{y}" width="{w}" height="1" fill="#{r:02x}{g:02x}{b:02x}"/>')

art = '\n'.join('       ' + row for row in GRID)
svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">\n'
    "  <!-- Hand-drawn pixel art, one cell per unit: '#' bubble, 'o' trail, '.' empty.\n"
    "       Edit the picture below, then regenerate both icons with\n"
    "       scripts/build-favicon.py (runs of pixels merge into one <rect> each).\n"
    f'{art}\n  -->\n' + '\n'.join(rects) + '\n</svg>\n'
)
pathlib.Path('public/favicon.svg').write_text(svg)

# ---- ICO: 16x16 and 32x32 PNGs, for the browsers that still ask for it ----
def png(scale):
    n = 16 * scale
    raw = bytearray()
    for y in range(n):
        raw.append(0)  # filter: none
        for x in range(n):
            cell = GRID[y // scale][x // scale]
            if cell in COLOURS:
                raw += bytes(COLOURS[cell]) + b'\xff'
            else:
                raw += b'\x00\x00\x00\x00'  # transparent, so any tab colour shows through

    def chunk(tag, data):
        return (struct.pack('>I', len(data)) + tag + data
                + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff))

    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', struct.pack('>IIBBBBB', n, n, 8, 6, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(bytes(raw), 9))
            + chunk(b'IEND', b''))

images = [(16, png(1)), (32, png(2))]
header = struct.pack('<HHH', 0, 1, len(images))
offset = len(header) + 16 * len(images)
entries, blobs = b'', b''
for size, data in images:
    entries += struct.pack('<BBBBHHII', size, size, 0, 0, 1, 32, len(data), offset)
    blobs += data
    offset += len(data)
pathlib.Path('public/favicon.ico').write_bytes(header + entries + blobs)

print('svg', len(svg), 'bytes ·', len(rects), 'rects')
print('ico', len(header + entries + blobs), 'bytes (16px + 32px)')
