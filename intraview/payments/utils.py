# Create: src/utils/invoice_generator.py
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.pdfgen import canvas
from django.conf import settings
from datetime import datetime
import io

def generate_payment_invoice_pdf(payment_order):
    """Generate professional PDF invoice for payment."""
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    
    # Content elements
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor=colors.darkblue,
        alignment=1  # Center
    )
    
    # 1️⃣ HEADER
    story.append(Paragraph("INTRAVIEW", title_style))
    story.append(Paragraph("Token Purchase Invoice", styles['Heading2']))
    story.append(Spacer(1, 12))
    
    # 2️⃣ COMPANY INFO
    company_info = [
        ['IntraView Technologies', 'support@intraview.app'],
        ['GSTIN: 29ABCDE1234F1Z5', '+91-XXXXXXXXXX'],
        [f'Invoice Date: {datetime.now().strftime("%d %B %Y")}', ''],
    ]
    company_table = Table(company_info, colWidths=[6*cm, 6*cm])
    company_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(company_table)
    story.append(Spacer(1, 20))
    
    # 3️⃣ BILL TO
    bill_to_data = [
        ['Bill To:', payment_order.user.email],
        ['Order ID:', payment_order.internal_order_id],
    ]
    bill_table = Table(bill_to_data, colWidths=[4*cm, 8*cm])
    bill_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.lightgrey),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.black),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 11),
    ]))
    story.append(bill_table)
    story.append(Spacer(1, 20))
    
    # 4️⃣ ITEMS TABLE
    items_data = [
        ['Description', 'Qty', 'Rate', 'Amount (₹)'],
        [
            f'{payment_order.token_pack.name} ({payment_order.token_pack.tokens} tokens)',
            '1',
            f'₹{payment_order.amount_inr:,}',
            f'₹{payment_order.amount_inr:,}'
        ],
        ['', '', 'Total', f'₹{payment_order.amount_inr:,}'],
    ]
    items_table = Table(items_data, colWidths=[7*cm, 1.5*cm, 2*cm, 2.5*cm])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.darkblue),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 11),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (2,1), (-1,-1), 'RIGHT'),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 30))
    
    # 5️⃣ FOOTER
    footer_text = """
    <b>Thank you for choosing IntraView!</b><br/><br/>
    Your tokens have been credited to your wallet.<br/>
    This is a computer-generated invoice. No signature required.<br/><br/>
    <i>Questions? Contact support@intraview.app</i>
    """
    story.append(Paragraph(footer_text, styles['Normal']))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    return buffer.getvalue()
