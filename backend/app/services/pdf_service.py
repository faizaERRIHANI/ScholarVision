"""
ScholarVision — Génération PDF Bulletins Scolaires (ReportLab)
ERRIHANI Faiza — ENSET Média 2025/2026
"""
from __future__ import annotations
import io, os, zipfile
from pathlib import Path
from typing import Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas as rl_canvas

NAVY       = colors.HexColor("#0B1437")
BLUE       = colors.HexColor("#1A56DB")
BLUE_LIGHT = colors.HexColor("#EFF6FF")
GOLD       = colors.HexColor("#F59E0B")
EMERALD    = colors.HexColor("#10B981")
EMERALD_BG = colors.HexColor("#ECFDF5")
ROSE       = colors.HexColor("#F43F5E")
ROSE_BG    = colors.HexColor("#FFF1F2")
ORANGE     = colors.HexColor("#F97316")
ORANGE_BG  = colors.HexColor("#FFF7ED")
CYAN       = colors.HexColor("#06B6D4")
CYAN_BG    = colors.HexColor("#ECFEFF")
GRAY_LIGHT = colors.HexColor("#F8FAFC")
GRAY_MID   = colors.HexColor("#E2E8F0")
GRAY_DARK  = colors.HexColor("#64748B")
WHITE      = colors.white
BLACK      = colors.black
PAGE_W, PAGE_H = A4
MARGIN = 1.8 * cm

def _mention_colors(mention):
    return {"Très Bien":(EMERALD_BG,EMERALD),"Bien":(BLUE_LIGHT,BLUE),
            "Assez Bien":(CYAN_BG,CYAN),"Passable":(ORANGE_BG,ORANGE),
            "Insuffisant":(ROSE_BG,ROSE)}.get(mention,(GRAY_LIGHT,GRAY_DARK))


class BulletinPDFGenerator:

    def __init__(self, upload_dir="./uploads/bulletins"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def generate_bulletin(self, bulletin_data: dict, output_path: str | None = None) -> str:
        student = bulletin_data["student"]
        semester = bulletin_data["semester"]
        if output_path is None:
            output_path = str(self.upload_dir / f"{student['student_number']}_T{semester}.pdf")
        c = rl_canvas.Canvas(output_path, pagesize=A4)
        self._draw_page(c, bulletin_data)
        c.save()
        return output_path

    def generate_zip_bytes(self, bulletins_data: list[dict]) -> bytes:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            for data in bulletins_data:
                s = data["student"]; sem = data["semester"]
                pdf_buf = io.BytesIO()
                c = rl_canvas.Canvas(pdf_buf, pagesize=A4)
                self._draw_page(c, data); c.save(); pdf_buf.seek(0)
                zf.writestr(f"{s['last_name']}_{s['first_name']}_T{sem}.pdf", pdf_buf.getvalue())
        zip_buffer.seek(0)
        return zip_buffer.getvalue()

    def _draw_page(self, c, data):
        w, h = PAGE_W, PAGE_H
        student = data["student"]; school = data["school"]; semester = data["semester"]
        # En-tête navy
        header_h = 3.2 * cm
        c.setFillColor(NAVY)
        c.rect(0, h - header_h, w, header_h, fill=1, stroke=0)
        lx, ly, ls = MARGIN, h - header_h + 0.3*cm, 2.4*cm
        c.setFillColor(GOLD)
        c.circle(lx + ls/2, ly + ls/2, ls/2, fill=1, stroke=0)
        c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(lx + ls/2, ly + ls/2 - 5, "EDU")
        c.setFillColor(WHITE); c.setFont("Helvetica-Bold", 13)
        c.drawString(lx + ls + 0.5*cm, h - 1.4*cm, school["name"])
        c.setFont("Helvetica", 9)
        c.drawString(lx + ls + 0.5*cm, h - 1.9*cm, school["address"])
        c.drawString(lx + ls + 0.5*cm, h - 2.3*cm, f"Tél : {school['phone']}")
        c.setFont("Helvetica-Bold", 10)
        c.drawRightString(w - MARGIN, h - 1.4*cm, f"Année {school['academic_year']}")
        c.setFont("Helvetica", 9)
        c.drawRightString(w - MARGIN, h - 1.9*cm, f"Trimestre {semester}")
        y = h - header_h - 0.5*cm
        # Titre
        c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(w/2, y - 0.6*cm, f"BULLETIN SCOLAIRE — Trimestre {semester}")
        y -= 1.4*cm
        # Infos élève
        ib_h = 2.8*cm
        c.setFillColor(BLUE_LIGHT)
        c.roundRect(MARGIN, y - ib_h, w - 2*MARGIN, ib_h, 5, fill=1, stroke=0)
        c.setStrokeColor(BLUE); c.setLineWidth(0.5)
        c.roundRect(MARGIN, y - ib_h, w - 2*MARGIN, ib_h, 5, fill=0, stroke=1)
        pw, ph = 1.8*cm, 2.4*cm
        px, py = w - MARGIN - pw - 0.3*cm, y - ib_h + 0.2*cm
        c.setFillColor(NAVY)
        c.roundRect(px, py, pw, ph, 4, fill=1, stroke=0)
        initials = f"{student['first_name'][0]}{student['last_name'][0]}".upper()
        c.setFillColor(WHITE); c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(px + pw/2, py + ph/2 - 6, initials)
        tx = MARGIN + 0.4*cm
        c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 11)
        c.drawString(tx, y - 0.7*cm, f"Élève : {student['last_name'].upper()} {student['first_name']}")
        c.setFont("Helvetica", 10)
        c.drawString(tx, y - 1.2*cm, f"Classe : {student['class_name']}   |   Niveau : {student['level']}")
        c.drawString(tx, y - 1.7*cm, f"N° Élève : {student['student_number']}")
        y -= ib_h + 0.5*cm
        y = self._draw_grades_table(c, data, y)
        y -= 0.4*cm
        y = self._draw_summary(c, data, y)
        y -= 0.4*cm
        y = self._draw_absences(c, data, y)
        y -= 0.4*cm
        y = self._draw_bar_chart(c, data, y)
        y -= 0.4*cm
        y = self._draw_appreciation(c, data, y)
        y -= 0.4*cm
        self._draw_signatures(c, data, y)
        self._draw_footer(c, data)

    def _draw_grades_table(self, c, data, y_start):
        subjects = data.get("subjects", [])
        if not subjects:
            c.setFont("Helvetica-Oblique", 10); c.setFillColor(GRAY_DARK)
            c.drawCentredString(PAGE_W/2, y_start - 0.8*cm, "Aucune note enregistrée.")
            return y_start - 1.2*cm
        col_widths = [5.5*cm, 1.5*cm, 5.0*cm, 2.0*cm, 2.5*cm]
        table_w = sum(col_widths); table_x = (PAGE_W - table_w) / 2
        header_h = 0.7*cm
        c.setFillColor(NAVY)
        c.rect(table_x, y_start - header_h, table_w, header_h, fill=1, stroke=0)
        c.setFillColor(WHITE); c.setFont("Helvetica-Bold", 9)
        headers = ["MATIÈRE","COEFF","NOTES OBTENUES","MOYENNE","APPRÉC."]
        x = table_x
        for hdr, cw in zip(headers, col_widths):
            c.drawCentredString(x + cw/2, y_start - header_h + 0.18*cm, hdr); x += cw
        y = y_start - header_h; row_h = 0.65*cm
        for idx, subj in enumerate(subjects):
            c.setFillColor(GRAY_LIGHT if idx % 2 == 0 else WHITE)
            c.rect(table_x, y - row_h, table_w, row_h, fill=1, stroke=0)
            c.setStrokeColor(GRAY_MID); c.setLineWidth(0.3)
            c.line(table_x, y - row_h, table_x + table_w, y - row_h)
            c.setFillColor(BLACK); c.setFont("Helvetica-Bold", 9)
            c.drawString(table_x + 0.2*cm, y - row_h + 0.18*cm, subj["name"])
            c.setFont("Helvetica", 9)
            c.drawCentredString(table_x + col_widths[0] + col_widths[1]/2, y - row_h + 0.18*cm, str(int(subj["coefficient"])))
            notes_str = "  /  ".join(f"{g['score']:.1f}" for g in subj.get("grades", []))
            if len(notes_str) > 35: notes_str = notes_str[:32] + "…"
            c.drawString(table_x + col_widths[0] + col_widths[1] + 0.2*cm, y - row_h + 0.18*cm, notes_str)
            avg = subj.get("average", 0.0)
            c.setFillColor(EMERALD if avg >= 10 else ROSE); c.setFont("Helvetica-Bold", 10)
            c.drawCentredString(table_x + col_widths[0] + col_widths[1] + col_widths[2] + col_widths[3]/2, y - row_h + 0.16*cm, f"{avg:.2f}")
            appr_color = EMERALD if avg >= 14 else (ORANGE if avg >= 10 else ROSE)
            c.setFillColor(appr_color); c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(table_x + sum(col_widths[:4]) + col_widths[4]/2, y - row_h + 0.18*cm, subj.get("appreciation",""))
            y -= row_h
        c.setStrokeColor(NAVY); c.setLineWidth(0.8)
        c.rect(table_x, y, table_w, y_start - header_h - y, fill=0, stroke=1)
        return y

    def _draw_summary(self, c, data, y_start):
        avg = data.get("general_average", 0.0); rank = data.get("rank", 1)
        total = data.get("total_students", 1); class_avg = data.get("class_average", 0.0)
        mention = data.get("mention", "Passable"); bg_m, fg_m = _mention_colors(mention)
        box_h = 2.0*cm; bx = MARGIN; bw = PAGE_W - 2*MARGIN
        c.setFillColor(GRAY_LIGHT)
        c.roundRect(bx, y_start - box_h, bw, box_h, 5, fill=1, stroke=0)
        c.setStrokeColor(GRAY_MID); c.setLineWidth(0.5)
        c.roundRect(bx, y_start - box_h, bw, box_h, 5, fill=0, stroke=1)
        c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 10)
        c.drawString(bx + 0.5*cm, y_start - 0.7*cm, "MOYENNE GÉNÉRALE :")
        c.setFillColor(EMERALD if avg >= 10 else ROSE); c.setFont("Helvetica-Bold", 16)
        c.drawString(bx + 4.5*cm, y_start - 0.8*cm, f"{avg:.2f} / 20")
        c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 10)
        c.drawString(bx + 0.5*cm, y_start - 1.5*cm, "RANG :")
        c.setFont("Helvetica", 10); c.drawString(bx + 2.2*cm, y_start - 1.5*cm, f"{rank}e / {total} élèves")
        c.setFont("Helvetica", 9); c.setFillColor(GRAY_DARK)
        c.drawString(bx + 6.0*cm, y_start - 1.5*cm, f"(Moy. classe : {class_avg:.2f})")
        mx = PAGE_W - MARGIN - 5.5*cm; my = y_start - box_h + 0.25*cm; mw = 5.0*cm; mh = 1.5*cm
        c.setFillColor(bg_m); c.roundRect(mx, my, mw, mh, 6, fill=1, stroke=0)
        c.setStrokeColor(fg_m); c.setLineWidth(1.5); c.roundRect(mx, my, mw, mh, 6, fill=0, stroke=1)
        c.setFillColor(fg_m); c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(mx + mw/2, my + mh/2 - 4, mention.upper())
        return y_start - box_h

    def _draw_absences(self, c, data, y_start):
        ab = data.get("absences", {}); total = ab.get("total", 0)
        box_h = 1.1*cm; bx = MARGIN; bw = PAGE_W - 2*MARGIN
        c.setFillColor(ORANGE_BG if total > 3 else GRAY_LIGHT)
        c.roundRect(bx, y_start - box_h, bw, box_h, 4, fill=1, stroke=0)
        c.setStrokeColor(ORANGE if total > 3 else GRAY_MID); c.setLineWidth(0.5)
        c.roundRect(bx, y_start - box_h, bw, box_h, 4, fill=0, stroke=1)
        c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 9)
        c.drawString(bx + 0.4*cm, y_start - 0.65*cm, "ABSENCES :")
        c.setFont("Helvetica", 9)
        c.drawString(bx + 2.5*cm, y_start - 0.65*cm,
            f"{total} demi-journée(s) — {ab.get('justified',0)} justifiée(s) — {ab.get('not_justified',0)} non justifiée(s) — Retards : {ab.get('late',0)}")
        return y_start - box_h

    def _draw_bar_chart(self, c, data, y_start):
        subjects = data.get("subjects", [])
        if not subjects: return y_start
        chart_h = 2.5*cm; cx = MARGIN; cw = PAGE_W - 2*MARGIN
        bar_h = chart_h - 0.8*cm; bar_y = y_start - chart_h + 0.6*cm
        n = len(subjects); bar_w = min(1.2*cm, (cw - (n+1)*0.15*cm)/n)
        gap = (cw - n*bar_w) / (n+1)
        c.setFont("Helvetica-Bold", 8); c.setFillColor(NAVY)
        c.drawString(cx, y_start - 0.4*cm, "Profil des moyennes :")
        c.setFillColor(GRAY_LIGHT)
        c.roundRect(cx, y_start - chart_h, cw, chart_h - 0.5*cm, 4, fill=1, stroke=0)
        for ref in [10, 16]:
            ry = bar_y + (ref/20)*bar_h
            c.setStrokeColor(GRAY_MID); c.setLineWidth(0.3); c.setDash([2,3])
            c.line(cx + 0.1*cm, ry, cx + cw - 0.1*cm, ry)
            c.setDash([]); c.setFont("Helvetica", 6); c.setFillColor(GRAY_DARK)
            c.drawString(cx + 0.1*cm, ry + 0.05*cm, str(ref))
        for i, subj in enumerate(subjects):
            avg = subj.get("average", 0.0)
            bx2 = cx + gap + i*(bar_w + gap)
            bfh = max(0.05*cm, (avg/20)*bar_h)
            bar_color = EMERALD if avg >= 14 else (BLUE if avg >= 10 else ROSE)
            c.setFillColor(bar_color)
            c.roundRect(bx2, bar_y, bar_w, bfh, 2, fill=1, stroke=0)
            label = subj.get("code", subj["name"][:5])
            c.setFont("Helvetica", 5.5); c.setFillColor(NAVY)
            c.drawCentredString(bx2 + bar_w/2, bar_y - 0.35*cm, label)
            c.setFont("Helvetica-Bold", 6); c.setFillColor(bar_color)
            c.drawCentredString(bx2 + bar_w/2, bar_y + bfh + 0.05*cm, f"{avg:.1f}")
        return y_start - chart_h

    def _draw_appreciation(self, c, data, y_start):
        appreciation = data.get("appreciation_general", "")
        conseil = data.get("conseil_class_date", "")
        box_h = 1.5*cm; bx = MARGIN; bw = PAGE_W - 2*MARGIN
        c.setFillColor(BLUE_LIGHT)
        c.roundRect(bx, y_start - box_h, bw, box_h, 4, fill=1, stroke=0)
        c.setStrokeColor(BLUE); c.setLineWidth(0.5)
        c.roundRect(bx, y_start - box_h, bw, box_h, 4, fill=0, stroke=1)
        c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 9)
        c.drawString(bx + 0.4*cm, y_start - 0.5*cm, "APPRÉCIATION GÉNÉRALE :")
        c.setFont("Helvetica", 9)
        c.drawString(bx + 0.4*cm, y_start - 1.0*cm, appreciation)
        c.setFont("Helvetica-Oblique", 8); c.setFillColor(GRAY_DARK)
        c.drawRightString(bx + bw - 0.4*cm, y_start - 1.0*cm, conseil)
        return y_start - box_h

    def _draw_signatures(self, c, data, y_start):
        school = data.get("school", {}); sig_y = max(y_start - 2.0*cm, MARGIN + 1.5*cm)
        c.setStrokeColor(GRAY_MID); c.setLineWidth(0.5)
        c.roundRect(MARGIN, sig_y, 5.0*cm, 1.8*cm, 4, fill=0, stroke=1)
        c.setFont("Helvetica-Bold", 8); c.setFillColor(NAVY)
        c.drawCentredString(MARGIN + 2.5*cm, sig_y + 1.3*cm, "CACHET DE L'ÉTABLISSEMENT")
        c.setFont("Helvetica", 7); c.setFillColor(GRAY_DARK)
        c.drawCentredString(MARGIN + 2.5*cm, sig_y + 0.9*cm, school.get("name",""))
        sx = PAGE_W - MARGIN - 5.0*cm
        c.roundRect(sx, sig_y, 5.0*cm, 1.8*cm, 4, fill=0, stroke=1)
        c.setFont("Helvetica-Bold", 8); c.setFillColor(NAVY)
        c.drawCentredString(sx + 2.5*cm, sig_y + 1.3*cm, "SIGNATURE DU DIRECTEUR")
        c.setFont("Helvetica", 7); c.setFillColor(GRAY_DARK)
        c.drawCentredString(sx + 2.5*cm, sig_y + 0.6*cm, school.get("directeur",""))
        from datetime import date as dt
        c.setFont("Helvetica", 9); c.setFillColor(NAVY)
        c.drawCentredString(PAGE_W/2, sig_y + 0.9*cm, f"Fès, le {dt.today().strftime('%d/%m/%Y')}")

    def _draw_footer(self, c, data):
        c.setFont("Helvetica", 7); c.setFillColor(GRAY_DARK)
        c.drawCentredString(PAGE_W/2, 0.6*cm, f"ScholarVision — Généré le {data.get('generated_at','')[:10]} — Document officiel")
        c.setStrokeColor(GRAY_MID); c.setLineWidth(0.3)
        c.line(MARGIN, 1.0*cm, PAGE_W - MARGIN, 1.0*cm)
