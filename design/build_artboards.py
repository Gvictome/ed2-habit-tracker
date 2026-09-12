"""Emit the Streakly design-canvas artboards.

Values are lifted from the running app: slate-950/900/800 surfaces, emerald-500
accent, the sky/violet/amber/rose habit palette, 14px base type, max-w-3xl column.
"""
import json
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# Tailwind v4 tokens the app already uses, resolved to hex.
BG = "#020617"        # slate-950
PANEL = "rgba(15,23,43,0.6)"   # slate-900/60
LINE = "#1d293d"      # slate-800
LINE2 = "#314158"     # slate-700
MUTE3 = "#45556c"     # slate-600
MUTE2 = "#62748e"     # slate-500
MUTE = "#90a1b9"      # slate-400
TEXT = "#cad5e2"      # slate-300
WHITE = "#ffffff"
EM = "#00bc7d"        # emerald-500
EM_LT = "#00d492"     # emerald-400
EM_DK = "#002c22"     # emerald-950
SKY = "#00a6f4"
SKY_DK = "#021b2b"
VIO = "#8e51ff"
VIO_DK = "#1a0533"
ROSE = "#ff2056"

FONTS = ("https://fonts.googleapis.com/css2?"
         "family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap")

CHECK = ('<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" '
         'stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round">'
         '<path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>')

FLAME = ('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="{c}" '
         'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
         '<path d="M12 3c0 4-4 5-4 9a4 4 0 0 0 8 0c0-1.5-.8-2.7-1.6-3.7"></path></svg>')


def shell(width, min_height, body):
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="{FONTS}">
  <style>
    body {{ margin: 0; font-family: Manrope, system-ui, sans-serif; background: {BG}; }}
    a {{ color: {EM_LT}; }} a:hover {{ color: #5ee9b5; }}
    .num {{ font-family: 'Space Grotesk', system-ui, sans-serif; font-variant-numeric: tabular-nums; }}
  </style>
</helmet>
<div style="width: {width}px; min-height: {min_height}px; background: {BG}; color: #f1f5f9;">
{body}
</div>
</x-dc>
</body>
</html>
"""


def header(pad="40px", email="gio@streakly.app"):
    return f"""
  <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px {pad}; border-bottom: 1px solid {LINE}; background: rgba(15,23,43,0.4);">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 10px; background: {EM};">
        {CHECK.format(s=17, c=EM_DK, w=3.5)}
      </span>
      <span class="num" style="font-size: 17px; font-weight: 700; letter-spacing: -0.01em;">Streakly</span>
    </div>
    <div style="display: flex; align-items: center; gap: 14px;">
      <span style="font-size: 13px; color: {MUTE2};">{email}</span>
      <button style="font-family: inherit; font-size: 13px; font-weight: 500; color: {TEXT}; background: transparent; border: 1px solid {LINE2}; border-radius: 9px; padding: 6px 12px; cursor: pointer;">Log out</button>
    </div>
  </div>"""


def ring(done, total, size=92, stroke=9):
    r = size / 2 - stroke / 2 - 1
    circ = 2 * 3.141592653589793 * r
    offset = circ * (1 - done / total)
    c = size / 2
    return f"""
      <div style="position: relative; width: {size}px; height: {size}px; flex-shrink: 0;">
        <svg width="{size}" height="{size}" viewBox="0 0 {size} {size}">
          <circle cx="{c}" cy="{c}" r="{r:.1f}" fill="none" stroke="{LINE}" stroke-width="{stroke}"></circle>
          <circle cx="{c}" cy="{c}" r="{r:.1f}" fill="none" stroke="{EM}" stroke-width="{stroke}" stroke-linecap="round" stroke-dasharray="{circ:.2f}" stroke-dashoffset="{offset:.2f}" transform="rotate(-90 {c} {c})"></circle>
        </svg>
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <span class="num" style="font-size: {int(size * 0.27)}px; font-weight: 700; line-height: 1; color: {WHITE};">{done}/{total}</span>
          <span style="font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: {MUTE2}; margin-top: 3px;">done</span>
        </div>
      </div>"""


def today_row(name, note, color, dark, streak, done):
    """One check-off row. 44px circular target, per the mobile hit-target floor."""
    if done:
        target = (f'<button style="display: flex; align-items: center; justify-content: center; '
                  f'width: 44px; height: 44px; flex-shrink: 0; border-radius: 50%; border: none; '
                  f'background: {color}; cursor: pointer;">{CHECK.format(s=21, c=dark, w=3.5)}</button>')
        border = LINE
    else:
        target = (f'<button style="display: flex; align-items: center; justify-content: center; '
                  f'width: 44px; height: 44px; flex-shrink: 0; border-radius: 50%; border: 2px solid {MUTE3}; '
                  f'background: transparent; cursor: pointer;">{CHECK.format(s=21, c=MUTE3, w=3)}</button>')
        border = LINE2
    rgb = tuple(int(color[i:i + 2], 16) for i in (1, 3, 5))
    tint = f"rgba({rgb[0]},{rgb[1]},{rgb[2]},0.12)"
    return f"""
      <div style="display: flex; align-items: center; gap: 16px; padding: 13px 18px; border: 1px solid {border}; border-radius: 16px; background: {PANEL};">
        {target}
        <div style="display: flex; flex-direction: column; gap: 2px; flex-grow: 1; min-width: 0;">
          <span style="font-size: 16px; font-weight: 600; color: {WHITE};">{name}</span>
          <span style="font-size: 13px; color: {MUTE2};">{note}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 999px; background: {tint};">
          {FLAME.format(c=color)}
          <span class="num" style="font-size: 13px; font-weight: 600; color: {color};">{streak}</span>
        </div>
      </div>"""


def day_cell(label, color=None, dark=None, today=False, size=30):
    ring_ = f" outline: 2px solid {TEXT}; outline-offset: 2px;" if today else ""
    if color:
        style = f"background: {color}; font-weight: 600; color: {dark};"
    else:
        style = f"border: 1px solid {LINE}; color: {MUTE3};"
    return (f'<span class="num" style="display: flex; align-items: center; justify-content: center; '
            f'width: {size}px; height: {size}px; border-radius: 9px; font-size: 11px; {style}{ring_}">{label}</span>')


def week_row(name, color, dark, pattern, hit, target, last=False):
    """pattern: list of bools, oldest first; labels are the month days 5..11."""
    cells = "".join(
        day_cell(str(5 + i), color if on else None, dark, today=(i == 6))
        for i, on in enumerate(pattern)
    )
    rule = "" if last else f'\n        <div style="height: 1px; background: {LINE};"></div>'
    return f"""
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: center;">
          <div style="display: flex; align-items: center; gap: 9px; min-width: 0;">
            <span style="width: 8px; height: 8px; flex-shrink: 0; border-radius: 50%; background: {color};"></span>
            <span style="font-size: 14px; font-weight: 500; color: {TEXT};">{name}</span>
            <span class="num" style="font-size: 12px; color: {MUTE3};">{hit} / {target} target</span>
          </div>
          <div style="display: flex; gap: 6px;">{cells}</div>
        </div>{rule}"""


# --------------------------------------------------------------- Main (Today) ---
main_body = header() + f"""
  <div style="display: flex; flex-direction: column; gap: 28px; padding: 32px 40px 40px;">

    <div style="display: flex; align-items: center; gap: 26px; padding: 22px 26px; border: 1px solid {LINE}; border-radius: 20px; background: {PANEL};">
      {ring(2, 3)}
      <div style="display: flex; flex-direction: column; gap: 7px; flex-grow: 1;">
        <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: {EM_LT};">Today</span>
        <h1 class="num" style="margin: 0; font-size: 27px; font-weight: 700; letter-spacing: -0.02em; color: {WHITE};">Friday, September 11</h1>
        <p style="margin: 0; font-size: 14px; color: {MUTE};">One habit left. Your longest run is <span style="color: {TEXT}; font-weight: 600;">12 days</span> on Morning run.</p>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; align-items: baseline; justify-content: space-between;">
        <h2 style="margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: {MUTE2};">Check off today</h2>
        <button style="font-family: inherit; font-size: 13px; font-weight: 600; color: {EM_DK}; background: {EM}; border: none; border-radius: 10px; padding: 8px 15px; cursor: pointer;">New habit</button>
      </div>
      {today_row("Morning run", "Three miles before class", SKY, SKY_DK, 12, True)}
      {today_row("Read 20 minutes", "Before bed, no phone", VIO, VIO_DK, 4, False)}
      {today_row("Meditate", "Ten minutes, morning", EM, EM_DK, 2, True)}
    </div>

    <div style="display: flex; flex-direction: column; gap: 12px;">
      <h2 style="margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: {MUTE2};">Last 7 days</h2>
      <div style="display: flex; flex-direction: column; gap: 10px; padding: 18px 20px; border: 1px solid {LINE}; border-radius: 18px; background: {PANEL};">
        {week_row("Morning run", SKY, SKY_DK, [False, True, True, True, True, True, True], 6, 5)}
        {week_row("Read 20 minutes", VIO, VIO_DK, [False, False, True, True, True, True, False], 4, 7)}
        {week_row("Meditate", EM, EM_DK, [False, False, False, False, False, True, True], 2, 5, last=True)}
      </div>
    </div>

  </div>"""

# ------------------------------------------------------------------------ Auth ---
auth_body = f"""
  <div style="display: flex; align-items: center; justify-content: center; min-height: 720px; padding: 40px;">
    <div style="width: 380px;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 14px; margin-bottom: 30px;">
        <span style="display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 16px; background: {EM};">
          {CHECK.format(s=27, c=EM_DK, w=3.5)}
        </span>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
          <h1 class="num" style="margin: 0; font-size: 30px; font-weight: 700; letter-spacing: -0.02em; color: {WHITE};">Streakly</h1>
          <p style="margin: 0; font-size: 14px; color: {MUTE};">Do the thing. Keep the streak.</p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px; padding: 26px; border: 1px solid {LINE}; border-radius: 20px; background: {PANEL};">
        <div style="display: flex; gap: 4px; padding: 4px; border-radius: 12px; background: {BG};">
          <span style="flex-grow: 1; text-align: center; padding: 7px; border-radius: 9px; background: {LINE}; font-size: 13px; font-weight: 600; color: {WHITE};">Log in</span>
          <span style="flex-grow: 1; text-align: center; padding: 7px; border-radius: 9px; font-size: 13px; font-weight: 500; color: {MUTE2};">Register</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="font-size: 12px; font-weight: 600; color: {MUTE};">Email</label>
          <div style="padding: 11px 13px; border: 1px solid {LINE2}; border-radius: 11px; background: {BG}; font-size: 14px; color: {WHITE};">gio@streakly.app</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="font-size: 12px; font-weight: 600; color: {MUTE};">Password</label>
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 11px 13px; border: 1px solid {EM}; border-radius: 11px; background: {BG}; font-size: 14px; color: {MUTE};">
            <span style="letter-spacing: 0.18em; color: {TEXT};">&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;</span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="{MUTE2}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </div>
        </div>

        <button style="font-family: inherit; margin-top: 4px; padding: 12px; border: none; border-radius: 11px; background: {EM}; font-size: 14px; font-weight: 700; color: {EM_DK}; cursor: pointer;">Log in</button>
      </div>

      <p style="margin: 18px 0 0; text-align: center; font-size: 13px; color: {MUTE2};">No account yet? <a href="#" style="font-weight: 600; text-decoration: none;">Create one</a></p>
    </div>
  </div>"""

# ---------------------------------------------------------------- Habit detail ---
detail_cells = "".join(
    day_cell(str(d), SKY if on else None, SKY_DK, today=(d == 11), size=38)
    for d, on in zip(range(5, 12), [False, True, True, True, True, True, True])
)

grid_weeks = []
history = [
    [1, 1, 0, 1, 1, 1, 0],
    [1, 1, 1, 1, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
]
for week in history:
    row = "".join(
        f'<span style="width: 20px; height: 20px; border-radius: 6px; background: {SKY if on else LINE};"></span>'
        for on in week
    )
    grid_weeks.append(f'<div style="display: flex; gap: 6px;">{row}</div>')
grid_block = "\n        ".join(grid_weeks)

detail_body = header() + f"""
  <div style="display: flex; flex-direction: column; gap: 22px; padding: 28px 40px 40px;">

    <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: {MUTE2};">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="{MUTE2}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>
      <span>Today</span>
    </div>

    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 20px;">
      <div style="display: flex; flex-direction: column; gap: 7px;">
        <div style="display: flex; align-items: center; gap: 11px;">
          <span style="width: 11px; height: 11px; border-radius: 50%; background: {SKY};"></span>
          <h1 class="num" style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; color: {WHITE};">Morning run</h1>
        </div>
        <p style="margin: 0; font-size: 14px; color: {MUTE};">Three miles before class</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <button style="font-family: inherit; font-size: 13px; font-weight: 500; color: {TEXT}; background: transparent; border: 1px solid {LINE2}; border-radius: 10px; padding: 8px 14px; cursor: pointer;">Edit</button>
        <button style="font-family: inherit; font-size: 13px; font-weight: 500; color: {ROSE}; background: transparent; border: 1px solid rgba(255,32,86,0.35); border-radius: 10px; padding: 8px 14px; cursor: pointer;">Delete</button>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;">
      <div style="display: flex; flex-direction: column; gap: 5px; padding: 16px 18px; border: 1px solid {LINE}; border-radius: 16px; background: {PANEL};">
        <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: {MUTE2};">Current streak</span>
        <span class="num" style="font-size: 28px; font-weight: 700; line-height: 1.1; color: {SKY};">12 days</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px; padding: 16px 18px; border: 1px solid {LINE}; border-radius: 16px; background: {PANEL};">
        <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: {MUTE2};">Best streak</span>
        <span class="num" style="font-size: 28px; font-weight: 700; line-height: 1.1; color: {WHITE};">18 days</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px; padding: 16px 18px; border: 1px solid {LINE}; border-radius: 16px; background: {PANEL};">
        <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: {MUTE2};">This week</span>
        <span class="num" style="font-size: 28px; font-weight: 700; line-height: 1.1; color: {WHITE};">6 <span style="font-size: 17px; font-weight: 500; color: {MUTE3};">/ 5</span></span>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 13px; padding: 20px 22px; border: 1px solid {LINE}; border-radius: 18px; background: {PANEL};">
      <h2 style="margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: {MUTE2};">This week</h2>
      <div style="display: flex; gap: 8px;">{detail_cells}</div>
      <p style="margin: 0; font-size: 13px; color: {MUTE3};">Tap any day to add or remove a check-in.</p>
    </div>

    <div style="display: flex; flex-direction: column; gap: 13px; padding: 20px 22px; border: 1px solid {LINE}; border-radius: 18px; background: {PANEL};">
      <div style="display: flex; align-items: baseline; justify-content: space-between;">
        <h2 style="margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: {MUTE2};">Last four weeks</h2>
        <span class="num" style="font-size: 12px; color: {MUTE3};">24 of 28 days</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        {grid_block}
      </div>
    </div>

  </div>"""

# ----------------------------------------------------------------- Empty state ---
empty_body = header() + f"""
  <div style="display: flex; flex-direction: column; gap: 26px; padding: 32px 40px 40px;">
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: {EM_LT};">Today</span>
      <h1 class="num" style="margin: 0; font-size: 27px; font-weight: 700; letter-spacing: -0.02em; color: {WHITE};">Friday, September 11</h1>
    </div>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 7px; padding: 56px 40px; border: 1px dashed {LINE2}; border-radius: 20px;">
      <div style="display: flex; gap: 8px; margin-bottom: 14px;">
        <span style="width: 34px; height: 34px; border-radius: 10px; border: 1px solid {LINE};"></span>
        <span style="width: 34px; height: 34px; border-radius: 10px; border: 1px solid {LINE};"></span>
        <span style="width: 34px; height: 34px; border-radius: 10px; background: rgba(0,188,125,0.25);"></span>
        <span style="width: 34px; height: 34px; border-radius: 10px; background: rgba(0,188,125,0.55);"></span>
        <span style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 10px; background: {EM};">{CHECK.format(s=18, c=EM_DK, w=3.5)}</span>
      </div>
      <h2 class="num" style="margin: 0; font-size: 21px; font-weight: 700; color: {WHITE};">Start your first streak</h2>
      <p style="margin: 0; max-width: 340px; text-align: center; font-size: 14px; line-height: 1.5; color: {MUTE};">Pick one thing you want to do consistently. Check it off today and the streak starts counting.</p>
      <button style="font-family: inherit; margin-top: 16px; padding: 11px 20px; border: none; border-radius: 11px; background: {EM}; font-size: 14px; font-weight: 700; color: {EM_DK}; cursor: pointer;">Add a habit</button>
    </div>
  </div>"""

# ---------------------------------------------------------------------- Mobile ---
mobile_cells = "".join(
    day_cell(str(d), SKY if on else None, SKY_DK, today=(d == 11), size=34)
    for d, on in zip(range(5, 12), [False, True, True, True, True, True, True])
)

mobile_body = f"""
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 12px;">
    <div style="display: flex; align-items: center; gap: 9px;">
      <span style="display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 9px; background: {EM};">{CHECK.format(s=16, c=EM_DK, w=3.5)}</span>
      <span class="num" style="font-size: 16px; font-weight: 700;">Streakly</span>
    </div>
    <span style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; border: 1px solid {LINE2}; font-size: 12px; font-weight: 600; color: {TEXT};">G</span>
  </div>

  <div style="display: flex; flex-direction: column; gap: 20px; padding: 8px 20px 28px;">

    <div style="display: flex; align-items: center; gap: 18px; padding: 18px 20px; border: 1px solid {LINE}; border-radius: 18px; background: {PANEL};">
      {ring(2, 3, size=70, stroke=8)}
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: {EM_LT};">Today</span>
        <span class="num" style="font-size: 19px; font-weight: 700; letter-spacing: -0.01em; color: {WHITE};">Fri, Sept 11</span>
        <span style="font-size: 12px; color: {MUTE};">One habit left</span>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 10px;">
      {today_row("Morning run", "Three miles", SKY, SKY_DK, 12, True)}
      {today_row("Read 20 minutes", "Before bed", VIO, VIO_DK, 4, False)}
      {today_row("Meditate", "Ten minutes", EM, EM_DK, 2, True)}
    </div>

    <div style="display: flex; flex-direction: column; gap: 11px; padding: 16px 18px; border: 1px solid {LINE}; border-radius: 18px; background: {PANEL};">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: {SKY};"></span>
        <span style="font-size: 13px; font-weight: 500; color: {TEXT};">Morning run</span>
      </div>
      <div style="display: flex; gap: 5px;">{mobile_cells}</div>
    </div>

    <button style="font-family: inherit; padding: 13px; border: none; border-radius: 13px; background: {EM}; font-size: 14px; font-weight: 700; color: {EM_DK}; cursor: pointer;">New habit</button>
  </div>"""

FILES = {
    "Main.dc.html": shell(900, 880, main_body),
    "Auth.dc.html": shell(880, 720, auth_body),
    "HabitDetail.dc.html": shell(900, 800, detail_body),
    "EmptyState.dc.html": shell(900, 560, empty_body),
    "Mobile.dc.html": shell(390, 844, mobile_body),
}

CANVAS = {
    "artboards": [
        {"file": "Auth.dc.html", "x": 0, "y": 0, "w": 880, "h": 720},
        {"file": "Main.dc.html", "x": 960, "y": 0, "w": 900, "h": 880, "title": "Today"},
        {"file": "Mobile.dc.html", "x": 1940, "y": 0, "w": 390, "h": 844, "title": "Today (phone)"},
        {"file": "HabitDetail.dc.html", "x": 0, "y": 1000, "w": 900, "h": 800, "title": "Habit detail"},
        {"file": "EmptyState.dc.html", "x": 980, "y": 1000, "w": 900, "h": 560, "title": "Empty state"},
    ],
    "annotations": [
        {"id": "note-today", "x": 960, "y": -160, "w": 420,
         "text": "The change: the dashboard opens on TODAY.\nOne 44px tap per habit, a ring showing the day's progress, and the 7-day grids demoted to history below."},
        {"id": "note-detail", "x": 0, "y": 1860, "w": 380,
         "text": "Habit detail is new: streak stats, an editable week, and a four-week grid so progress is visible at a glance."},
    ],
    "launch": {"view": "canvas"},
}

if __name__ == "__main__":
    for name, content in FILES.items():
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh:
            fh.write(content)
        print(f"{name:22} {len(content):>6} bytes")
    with open(os.path.join(OUT, "canvas.json"), "w", encoding="utf-8") as fh:
        json.dump(CANVAS, fh, indent=2)
    print("canvas.json written")
