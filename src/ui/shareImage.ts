/**
 * "Share image" export: draws the result card onto a canvas (no DOM capture
 * library) and downloads it as a PNG.
 */

export interface ShareLine {
  label: string;
  value: string;
}

export interface ShareCardData {
  title: string;
  /** The big number, e.g. "74–8" or "Ava 4–2 Ben". */
  headline: string;
  subtitle: string;
  /** Roster lines: label = slot/team, value = player. */
  lines: ShareLine[];
  /** Argument-starters: top "why" bullets rendered under the roster. */
  extra?: string[];
  footer: string;
}

export function downloadShareImage(data: ShareCardData, filename = 'hardwood-gm-result.png'): void {
  const W = 900;
  const headerH = 240;
  const lineH = 42;
  const extra = (data.extra ?? []).map((t) => (t.length > 92 ? `${t.slice(0, 89)}…` : t));
  const H = headerH + data.lines.length * lineH + extra.length * 30 + (extra.length > 0 ? 26 : 0) + 110;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext('2d');
  if (!c) return;

  // Background: dark court-ish gradient + accent stripe.
  const bg = c.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#10151b');
  bg.addColorStop(1, '#1a1208');
  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);
  c.fillStyle = '#f5a623';
  c.fillRect(0, 0, W, 8);

  c.textBaseline = 'top';

  // Title.
  c.fillStyle = '#93a1ad';
  c.font = '600 26px -apple-system, "Segoe UI", Roboto, sans-serif';
  c.fillText(data.title, 48, 44);

  // Headline.
  c.fillStyle = '#f5a623';
  c.font = '800 84px -apple-system, "Segoe UI", Roboto, sans-serif';
  c.fillText(data.headline, 44, 86);

  // Subtitle.
  c.fillStyle = '#cfd8df';
  c.font = '400 22px -apple-system, "Segoe UI", Roboto, sans-serif';
  c.fillText(data.subtitle, 48, 186);

  // Roster lines.
  let y = headerH;
  for (const line of data.lines) {
    c.fillStyle = '#f5a623';
    c.font = '700 20px -apple-system, "Segoe UI", Roboto, sans-serif';
    c.fillText(line.label, 48, y);
    c.fillStyle = '#e8edf2';
    c.font = '400 22px -apple-system, "Segoe UI", Roboto, sans-serif';
    c.fillText(line.value, 150, y - 2);
    y += lineH;
  }

  // "Why" bullets.
  if (extra.length > 0) {
    y += 14;
    c.fillStyle = '#cfd8df';
    c.font = 'italic 400 19px -apple-system, "Segoe UI", Roboto, sans-serif';
    for (const line of extra) {
      c.fillText(`• ${line}`, 48, y);
      y += 30;
    }
  }

  // Footer.
  c.strokeStyle = '#2b343c';
  c.beginPath();
  c.moveTo(48, y + 18);
  c.lineTo(W - 48, y + 18);
  c.stroke();
  c.fillStyle = '#93a1ad';
  c.font = '400 18px -apple-system, "Segoe UI", Roboto, sans-serif';
  c.fillText(data.footer, 48, y + 36);

  const a = document.createElement('a');
  a.download = filename;
  a.href = canvas.toDataURL('image/png');
  a.click();
}
