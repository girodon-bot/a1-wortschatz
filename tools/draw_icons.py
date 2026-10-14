"""Собственные иконки в стиле Phosphor duotone (viewBox 256, линия 16, заливка 20%).
Запуск: python3 tools/draw_icons.py → vendor/custom/*.svg
"""
import os
OUT = os.path.join(os.path.dirname(__file__), '..', 'vendor', 'custom')
S = 'fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"'
F = 'fill="currentColor" opacity="0.2"'
H = 'fill="currentColor" opacity="0.45"'   # выделенная часть


def P(d, fill=None):
    """контур + (опционально) заливка того же пути"""
    out = ''
    if fill:
        out += f'<path d="{d}" {fill}/>'
    return out + f'<path d="{d}" {S}/>'


def C(cx, cy, r, fill=None, sw=16):
    out = ''
    if fill:
        out += f'<circle cx="{cx}" cy="{cy}" r="{r}" {fill}/>'
    st = S.replace('stroke-width="16"', f'stroke-width="{sw}"')
    return out + f'<circle cx="{cx}" cy="{cy}" r="{r}" {st}/>'


def dot(cx, cy, r=8):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="currentColor"/>'


ICONS = {}

# ---------- еда ----------
ICONS['apple'] = P('M128 84C100 64 52 72 52 124C52 176 88 216 112 216C120 216 124 210 128 210C132 210 136 216 144 216C168 216 204 176 204 124C204 72 156 64 128 84Z', F) \
    + P('M128 84C128 68 134 54 146 44') + P('M138 62C150 44 172 40 186 46C178 62 156 70 138 62Z', F)
ICONS['banana'] = P('M70 66L88 62C94 128 132 170 196 168C206 168 212 182 202 190C118 228 50 160 70 66Z', F) + P('M70 66L64 44')
ICONS['pear'] = P('M128 64C110 64 106 86 106 104C106 124 62 138 62 178C62 206 94 222 128 222C162 222 194 206 194 178C194 138 150 124 150 104C150 86 146 64 128 64Z', F) \
    + P('M128 64L132 40') + P('M138 54C150 36 170 34 182 42C172 56 154 60 138 54Z', F)
ICONS['butter'] = P('M60 132L100 100H196V160L156 192H60Z', F) + P('M60 132H156L196 100') + P('M156 132V192') + P('M32 208H224')
ICONS['meat'] = P('M84 60C44 68 32 124 54 164C78 208 152 218 198 190C230 170 226 120 198 104C176 92 164 72 132 62C114 56 98 56 84 60Z', F) \
    + C(98, 118, 18) + P('M182 170C160 186 126 190 98 178')
ICONS['drumstick'] = P('M120 140C90 112 102 52 152 44C198 36 230 82 210 122C196 148 152 168 120 140Z', F) \
    + P('M120 140L80 180') + C(64, 172, 14) + C(86, 196, 14)
ICONS['potato'] = P('M62 104C60 62 116 50 152 62C198 78 222 116 208 160C196 202 138 214 102 198C64 182 64 140 62 104Z', F) \
    + dot(110, 106) + dot(160, 126) + dot(126, 166) + dot(176, 172, 6)
ICONS['milk'] = P('M80 100L104 60H152L176 100V216H80Z') + f'<path d="M80 140H176V216H80Z" {F}/>' \
    + P('M80 100H176') + P('M112 36H144V60H112Z') + P('M80 140H176')
ICONS['fries'] = P('M94 124L86 52') + P('M114 124L112 40') + P('M138 124L142 44') + P('M162 124L174 56') \
    + P('M70 120H186L170 216H86Z', F)
ICONS['salt'] = P('M88 108C88 82 104 64 128 64C152 64 168 82 168 108V200C168 210 160 216 150 216H106C96 216 88 210 88 200Z', F) \
    + P('M88 108H168') + dot(114, 88, 7) + dot(142, 88, 7) + dot(128, 76, 7)
ICONS['ham'] = P('M48 128C48 84 92 56 136 60C184 64 212 96 208 136C204 180 160 204 120 200C76 196 48 168 48 128Z') \
    + f'<path d="M76 128C76 100 104 84 136 88C168 92 184 112 180 136C176 164 148 176 120 172C92 168 76 152 76 128Z" {H}/>' \
    + P('M108 116C120 126 136 128 150 120')
ICONS['tomato'] = C(128, 144, 72, F) + P('M128 72L108 54') + P('M128 72L148 54') + P('M128 72L100 82') + P('M128 72L156 82') + P('M128 72V46')

# ---------- тело (выделенная часть) ----------
def body(hl):
    out = ''
    head, torso = (128, 52, 24), 'M98 92H158L150 160H106Z'
    arms = ['M98 98L70 156', 'M158 98L186 156']
    legs = ['M114 160L106 222', 'M142 160L150 222']
    hi = 'stroke="currentColor" stroke-width="40" stroke-linecap="round" opacity="0.35" fill="none"'
    if hl == 'arm':
        out += f'<path d="{arms[1]}" {hi}/>'
    if hl == 'leg':
        out += f'<path d="{legs[1]}" {hi}/>'
    out += C(*head, H if hl == 'head' else None)
    out += P(torso, H if hl == 'belly' else None)
    for a in arms + legs:
        out += P(a)
    return out


ICONS['body-arm'] = body('arm')
ICONS['body-leg'] = body('leg')
ICONS['body-belly'] = body('belly')
ICONS['body-head'] = body('head')
ICONS['mouth'] = P('M44 128C78 92 110 100 128 110C146 100 178 92 212 128C178 172 78 172 44 128Z', F) + P('M44 128C96 138 160 138 212 128')
ICONS['hair'] = C(128, 146, 56) + f'<path d="M66 150C56 76 118 44 162 60C200 74 206 118 194 150C178 118 142 108 106 116C88 120 74 132 66 150Z" {H}/>' \
    + P('M66 150C56 76 118 44 162 60C200 74 206 118 194 150C178 118 142 108 106 116C88 120 74 132 66 150Z') \
    + dot(108, 152, 7) + dot(148, 152, 7)

# ---------- люди ----------
def person(x, top, s=1.0, female=False, old=False, hl=False, cane=False, bun=False):
    """человечек: x — центр, top — макушка, s — масштаб; hl — заливка (выделен)"""
    r = 17 * s
    hy = top + r
    n = hy + r + 6 * s                      # шея
    fill = H if hl else None
    out = C(round(x, 1), round(hy, 1), round(r, 1), fill)
    if bun:
        out += C(round(x, 1), round(top - 4 * s, 1), round(7 * s, 1), fill, sw=12)
    if female:
        d = f'M{x-16*s:.0f} {n:.0f}H{x+16*s:.0f}L{x+32*s:.0f} {n+70*s:.0f}H{x-32*s:.0f}Z'
        leg0 = n + 70 * s
    else:
        d = f'M{x-24*s:.0f} {n:.0f}H{x+24*s:.0f}V{n+62*s:.0f}H{x-24*s:.0f}Z'
        leg0 = n + 62 * s
    out += P(d, fill)
    leg1 = top + 150 * s
    out += P(f'M{x-10*s:.0f} {leg0:.0f}V{leg1:.0f}') + P(f'M{x+10*s:.0f} {leg0:.0f}V{leg1:.0f}')
    out += P(f'M{x-(16 if female else 24)*s:.0f} {n+4*s:.0f}L{x-38*s:.0f} {n+52*s:.0f}')
    if cane:
        out += P(f'M{x+(16 if female else 24)*s:.0f} {n+4*s:.0f}L{x+40*s:.0f} {n+44*s:.0f}') \
            + P(f'M{x+40*s:.0f} {n+30*s:.0f}V{leg1:.0f}') + P(f'M{x+40*s:.0f} {n+30*s:.0f}C{x+40*s:.0f} {n+16*s:.0f} {x+56*s:.0f} {n+16*s:.0f} {x+56*s:.0f} {n+28*s:.0f}')
    else:
        out += P(f'M{x+(16 if female else 24)*s:.0f} {n+4*s:.0f}L{x+38*s:.0f} {n+52*s:.0f}')
    return out


def heart(cx, cy, s=1.0, fill=F):
    d = (f'M{cx:.0f} {cy+18*s:.0f}C{cx-30*s:.0f} {cy:.0f} {cx-26*s:.0f} {cy-24*s:.0f} {cx-10*s:.0f} {cy-22*s:.0f}'
         f'C{cx-2*s:.0f} {cy-21*s:.0f} {cx:.0f} {cy-14*s:.0f} {cx:.0f} {cy-12*s:.0f}'
         f'C{cx:.0f} {cy-14*s:.0f} {cx+2*s:.0f} {cy-21*s:.0f} {cx+10*s:.0f} {cy-22*s:.0f}'
         f'C{cx+26*s:.0f} {cy-24*s:.0f} {cx+30*s:.0f} {cy:.0f} {cx:.0f} {cy+18*s:.0f}Z')
    return P(d, fill)


A, K = 1.12, 0.72      # масштаб взрослого и ребёнка
ICONS['fam-father'] = person(90, 40, A, hl=True) + person(186, 104, K)
ICONS['fam-mother'] = person(90, 40, A, female=True, hl=True) + person(186, 104, K)
ICONS['fam-son'] = person(90, 40, A) + person(186, 104, K, hl=True)
ICONS['fam-daughter'] = person(90, 40, A, female=True) + person(186, 104, K, female=True, hl=True)
ICONS['fam-brother'] = person(84, 76, 0.9, hl=True) + person(172, 76, 0.9, female=True)
ICONS['fam-sister'] = person(84, 76, 0.9) + person(172, 76, 0.9, female=True, hl=True)
ICONS['fam-siblings'] = person(84, 76, 0.9, hl=True) + person(172, 76, 0.9, female=True, hl=True)
ICONS['fam-grandpa'] = person(112, 40, A, hl=True, cane=True)
ICONS['fam-grandma'] = person(112, 44, A, female=True, hl=True, cane=True, bun=True)
ICONS['fam-grandparents'] = person(76, 44, 1.0, hl=True, cane=True) + person(180, 50, 1.0, female=True, hl=True, bun=True)
ICONS['fam-boy'] = person(128, 52, 1.1, hl=True)
ICONS['fam-girl'] = person(128, 52, 1.1, female=True, hl=True) \
    + P('M108 66L90 84') + P('M148 66L166 84')
ICONS['fam-husband'] = person(78, 44, A, hl=True) + person(178, 44, A, female=True) + heart(128, 40, 0.8)
ICONS['fam-wife'] = person(78, 44, A) + person(178, 44, A, female=True, hl=True) + heart(128, 40, 0.8)
ICONS['fam-partner'] = person(78, 44, A, hl=True) + person(178, 44, A, female=True, hl=True) + heart(128, 40, 0.8, H)
ICONS['fam-teen'] = person(128, 44, 1.15, hl=True) + P('M102 66C102 30 154 30 154 66')
ICONS['rings'] = C(100, 140, 52, F) + C(156, 140, 52)

# ---------- календарь ----------
def cal_frame():
    return P('M40 60H216V208H40Z') + P('M40 96H216') + P('M84 40V72') + P('M172 40V72')


def week(on):
    out = cal_frame()
    w, gap, x0 = 16, 6, 54
    for i in range(7):
        x = x0 + i * (w + gap)
        if i in on:
            out += f'<rect x="{x}" y="124" width="{w}" height="48" rx="4" fill="currentColor"/>'
        else:
            out += f'<rect x="{x}" y="124" width="{w}" height="48" rx="4" fill="none" stroke="currentColor" stroke-width="7" opacity="0.55"/>'
    return out


for i, n in enumerate(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']):
    ICONS['week-' + n] = week({i})
ICONS['week-workdays'] = week({0, 1, 2, 3, 4})
ICONS['week-weekend'] = week({5, 6})


def month(m):
    out = cal_frame()
    w, h, gx, gy, x0, y0 = 28, 20, 10, 10, 57, 114
    for i in range(12):
        r, c = divmod(i, 4)
        x, y = x0 + c * (w + gx), y0 + r * (h + gy)
        if i == m:
            out += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="currentColor"/>'
        else:
            out += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="none" stroke="currentColor" stroke-width="7" opacity="0.55"/>'
    return out


for i in range(12):
    ICONS[f'month-{i+1:02d}'] = month(i)


def sunpos(side):
    import math
    a = math.radians(135 if side == 'am' else 45)
    sx, sy = 128 + 84 * math.cos(a), 184 - 84 * math.sin(a)
    out = f'<path d="M44 184A84 84 0 0 1 212 184" fill="none" stroke="currentColor" stroke-width="8" stroke-dasharray="2 18" stroke-linecap="round"/>'
    out += P('M24 184H232') + C(round(sx), round(sy), 26, H)
    return out


ICONS['sun-am'] = sunpos('am')
ICONS['sun-pm'] = sunpos('pm')

# ---------- предметы и места ----------
ICONS['balcony'] = P('M100 140V56H156V140', F) + P('M36 140H220') + P('M36 208H220') \
    + ''.join(P(f'M{x} 140V208') for x in range(52, 221, 28))
ICONS['counter-window'] = P('M56 48H200V164H56Z', F) + C(128, 100, 18) + P('M94 164C94 134 162 134 162 164') + P('M32 164H224') + P('M48 164V216') + P('M208 164V216')
ICONS['seller'] = C(128, 70, 24) + P('M82 150C82 108 174 108 174 150') + P('M36 150H220V212H36Z', F) + P('M164 172H196')
ICONS['corner'] = P('M72 40V184H216') + C(72, 184, 22, H)
ICONS['customs'] = P('M56 220V88') + P('M40 220H72') + P('M56 100H220V128H56Z', F) + P('M96 100L80 128') + P('M136 100L120 128') + P('M176 100L160 128') + P('M216 100L200 128')
ICONS['vending'] = P('M64 32H192V224H64Z') + P('M84 56H148V152H84Z', F) + P('M84 88H148') + P('M84 120H148') \
    + dot(170, 72, 7) + dot(170, 96, 7) + dot(170, 120, 7) + P('M84 180H172V200H84Z')
ICONS['half-board'] = C(128, 128, 88) + C(128, 128, 56) + f'<path d="M72 128A56 56 0 0 1 184 128Z" {H}/>'
ICONS['room'] = f'<path d="M48 48H208V208H48Z" {F}/>' + P('M152 208H208V48H48V208H104') + P('M104 208V160') + P('M104 160A48 48 0 0 1 152 208')

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, body_ in ICONS.items():
        with open(os.path.join(OUT, name + '.svg'), 'w') as f:
            f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">{body_}</svg>')
    print(len(ICONS), 'icons ->', os.path.abspath(OUT))
