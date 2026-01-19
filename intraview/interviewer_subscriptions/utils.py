from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.pdfgen import canvas
from django.conf import settings
from datetime import datetime
import io








def generate_interviewer_invoice_pdf(payment_order):
    """Generate PDF for interviewer subscription payment."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm)
    story = []
    styles = getSampleStyleSheet()
    
    # Header
    story.append(Paragraph("INTRAVIEW", styles['Title']))
    story.append(Paragraph("Interviewer Subscription Invoice", styles['Heading2']))
    story.append(Spacer(1, 20))
    
    # Company Info + Invoice Details
    data = [
        ['IntraView Technologies', f'Invoice #{payment_order.internal_order_id}'],
        ['support@intraview.app', payment_order.updated_at.strftime('%d %b %Y')],
        ['GSTIN: 29ABCDE1234F1Z5', 'Status: Succeeded'],
    ]
    table = Table(data, colWidths=[6*cm, 6*cm])
    table.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'LEFT')]))
    story.append(table)
    
    # Bill To
    bill_data = [
        ['Bill To:', payment_order.user.email],
        ['Interviewer Plan:', payment_order.plan.name],
        ['Order ID:', payment_order.internal_order_id],
    ]
    bill_table = Table(bill_data, colWidths=[4*cm, 8*cm])
    bill_table.setStyle(TableStyle([('BACKGROUND', (0,0), (0,0), colors.lightgrey)]))
    story.append(bill_table)
    
    # Items
    items_data = [
        ['Description', 'Qty', 'Rate', 'Amount'],
        [f'{payment_order.plan.name} - Monthly', '1', f'₹{payment_order.amount_inr:,}', f'₹{payment_order.amount_inr:,}'],
        ['', '', 'Total', f'₹{payment_order.amount_inr:,}'],
    ]
    items_table = Table(items_data, colWidths=[6*cm, 2*cm, 2.5*cm, 2.5*cm])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.darkblue),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
    ]))
    story.append(items_table)
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
