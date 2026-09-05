import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "ArogyaGrid — Architecture & Technical Whitepaper")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_text)
        self.drawString(54, 36, "ArogyaGrid Platform • Built for India's 150,000+ PHC Network • Confidential")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()

def generate_pdf():
    pdf_filename = "ArogyaGrid_Comprehensive_Architecture_Document.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#059669")   # Emerald
    secondary_color = colors.HexColor("#0f766e") # Teal
    dark_slate = colors.HexColor("#0f172a")
    text_slate = colors.HexColor("#334155")
    card_bg = colors.HexColor("#f8fafc")
    border_color = colors.HexColor("#e2e8f0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=dark_slate,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=dark_slate,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=secondary_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=text_slate,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=text_slate,
        leftIndent=12,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b")
    )

    story = []

    # Title & Header
    story.append(Paragraph("ArogyaGrid 🏥🇮🇳", title_style))
    story.append(Paragraph("Offline-First, Resilient & Federated AI Healthcare Supply Chain Platform for India's PHC Network", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceBefore=2, spaceAfter=14))

    # Executive Overview Callout
    callout_data = [[
        Paragraph(
            "<b>EXECUTIVE SUMMARY:</b> ArogyaGrid is an offline-capable, privacy-preserving, and federated AI healthcare orchestration platform engineered for India's 150,000+ Primary Health Centres (PHCs). It provides real-time tri-resource tracking, automated stockout early warnings, dynamic ICU/Oxygen bed admissions, duty rosters, cross-district rebalancing, and state-level Federated Machine Learning adhering strictly to India's DPDP Act 2023.",
            callout_style
        )
    ]]
    callout_table = Table(callout_data, colWidths=[504])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#ecfdf5")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#a7f3d0")),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('ROUNDEDCORNERS', [6, 6, 6, 6])
    ]))
    story.append(callout_table)
    story.append(Spacer(1, 14))

    # 1. Core Architectural Invariants
    story.append(Paragraph("1. Core Architectural Pillars & Invariants", h1_style))
    
    story.append(Paragraph("<b>A. Tri-Resource Scope:</b> Synchronizes all three critical assets that govern PHC operational readiness:", body_style))
    story.append(Paragraph("• <b>Essential Medicines & Vaccines:</b> Live inventory counts, daily burn rate ($BurnRate$), batch numbers, expiry dates, and cold-chain compliance.", bullet_style))
    story.append(Paragraph("• <b>Dynamic Bed Matrix:</b> Real-time capacity and 1-click clinical admit/discharge across 4 tiers: <code>GENERAL</code>, <code>OXYGEN</code>, <code>ICU</code>, and <code>PEDIATRIC</code>.", bullet_style))
    story.append(Paragraph("• <b>Medical Personnel Attendance:</b> Shift check-ins and active duty verification for Medical Officers, Specialists, Staff Nurses, and Pharmacists.", bullet_style))
    
    story.append(Paragraph("<b>B. Transaction Idempotency (Zero Double-Counting):</b> Every intake transaction generates a unique client-side <code>transaction_uuid</code>. Duplicate requests from flaky rural networks are acknowledged with HTTP 200 without duplicate count increments.", body_style))

    story.append(Paragraph("<b>C. Privacy-Preserving Federated AI (DPDP Act 2023 Compliant):</b> Zero raw patient health records or facility logs cross state borders. State nodes (Bihar, Jharkhand, Odisha, West Bengal, Assam) train local models. The central coordinator computes Federated Averaging (<code>FedAvg</code>) with Laplace Differential Privacy noise (ε = 1.0).", body_style))

    story.append(Paragraph("<b>D. Resilient Offline-First Architecture:</b> Operates seamlessly during grid power cuts. Outgoing transactions queue in IndexedDB and automatically replay to <code>/api/v1/telemetry/intake</code> upon reconnection.", body_style))

    story.append(Paragraph("<b>E. Multi-Criteria Cross-District Emergency Logistics:</b> Automatic stockout warnings when Days-to-Stockout ($DTS < 3$). Generates automated rebalance proposals between donor and recipient PHCs while enforcing a <b>30-day donor safety reserve invariant</b>.", body_style))

    story.append(Paragraph("<b>F. Frontline Vernacular Hindi Voice Intake:</b> Web Speech API and local/Gemini NLP parser allow frontline workers to speak dispensing logs in Hindi/English (e.g. <i>'50 Paracetamol aur 20 ORS diye'</i>).", body_style))

    story.append(Spacer(1, 10))

    # 2. Role-Based Access Control (RBAC) Table
    story.append(Paragraph("2. Role-Based Access Control (RBAC) Matrix", h1_style))
    rbac_data = [
        ["Role", "Designated User", "Access Scope & Console Capabilities"],
        ["National Admin", "admin@arogyagrid.gov.in\n(National AI Director)", "National essential drug formulary, custom medicine provisioning across all PHCs, nationwide Federated Learning trigger, and system audit logs."],
        ["District Officer", "district.ranchi@arogyagrid.gov.in\n(Ranchi District Officer)", "Interactive GIS Command Triage Map (Green/Yellow/Red pins), critical stockout escalation alerts, and cross-district escrow transfer approvals."],
        ["Medical Officer", "doctor.ranchi@arogyagrid.gov.in\n(Dr. Priya Sharma)", "Facility-scoped Clinical Console, real-time ICU/Oxygen patient admit/discharge controls, and medical staff duty roster."],
        ["PHC Staff", "phc.ranchi01@arogyagrid.gov.in\n(Sadar PHC Frontline)", "Frontline touch kiosk, 1-click Hindi voice intake, daily dispensing forms, and IndexedDB offline queue synchronization."]
    ]
    
    rbac_table = Table(rbac_data, colWidths=[90, 140, 274])
    rbac_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 1), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg])
    ]))
    story.append(rbac_table)
    story.append(Spacer(1, 14))

    # Page Break for clean multi-page layout
    story.append(PageBreak())

    # 3. Microservice Architecture & Technology Stack
    story.append(Paragraph("3. Microservice Architecture & Technology Stack", h1_style))
    
    tech_data = [
        ["Subsystem", "Technologies", "Role & Key Responsibilities"],
        ["Frontend Web/PWA", "React 18, Vite, Tailwind CSS,\nLucide Icons, Leaflet GIS", "Role-based dashboards, interactive triage maps, Web Speech API mic input, and IndexedDB offline transaction queue."],
        ["Backend Orchestrator", "Node.js 20, Express, Socket.io,\nJWT, Dual-Mode SQL", "REST Gateway (Port 5000), real-time WebSocket alerts, idempotency verification, and dual-mode PostgreSQL/embedded storage."],
        ["Python ML Microservice", "Python 3.11, FastAPI, Uvicorn,\nScikit-learn, NumPy", "RandomForest stockout Days-to-Stockout (DTS) regressor, FedAvg coordinator with Laplace DP noise (ε=1.0), and logistics optimizer."],
        ["MCP Tool Server", "Model Context Protocol SDK,\nStdio / SSE JSON-RPC 2.0", "Exposes typed health operations (get_phc_inventory_status, simulate_stockout_risk, propose_resource_transfer) to LLMs."],
        ["Database Tier", "PostgreSQL 16 / Embedded\nIn-Memory Resilient Store", "Dual-mode persistence: zero-dependency in-memory store for instant local demos, with seamless PostgreSQL connection in production."]
    ]
    
    tech_table = Table(tech_data, colWidths=[110, 140, 254])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), secondary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 1), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg])
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 14))

    # 4. The New Developer Stack Standards
    story.append(Paragraph("4. 'The New Developer Stack' Compliance", h1_style))
    story.append(Paragraph("ArogyaGrid strictly implements the open-source AI-native developer specification:", body_style))
    story.append(Paragraph("• <b>AGENTS.md:</b> Root system identity, core role invariants, privacy rules, and SOP directory layout.", bullet_style))
    story.append(Paragraph("• <b>specs/ OpenAPI & AsyncAPI:</b> Formal contracts for REST APIs (<code>openapi-telemetry.yaml</code>) and real-time events (<code>asyncapi-events.yaml</code>).", bullet_style))
    story.append(Paragraph("• <b>skills/ SOPs:</b> Reusable agent procedures for <code>supply-forecasting</code>, <code>disaster-rebalance</code>, and <code>federated-node-audit</code>.", bullet_style))
    story.append(Paragraph("• <b>llms.txt:</b> Machine-readable architectural index for LLM pair programmers.", bullet_style))
    story.append(Paragraph("• <b>mcp_server/:</b> Model Context Protocol server exposing typed health ops tools for automated copilot interactions.", bullet_style))
    story.append(Spacer(1, 10))

    # 5. Quick-Start & 1-Command Launch
    story.append(Paragraph("5. Execution & Deployment Guide", h1_style))
    
    exec_data = [
        ["Deployment Method", "Command", "Description"],
        ["Single Terminal Local Launch", "npm run dev", "Starts both Express Backend (:5000) and React Frontend (:3000) concurrently in a single terminal."],
        ["Full Multi-Service Launch", "npm run dev:all", "Runs Backend (:5000), Frontend (:3000), and Python ML Service (:8000) together."],
        ["Docker 1-Command Launch", "docker compose up --build -d", "Spins up all 5 isolated containers (postgres, backend, ml_service, mcp_server, frontend)."]
    ]
    
    exec_table = Table(exec_data, colWidths=[130, 160, 214])
    exec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), dark_slate),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 1), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg])
    ]))
    story.append(exec_table)
    story.append(Spacer(1, 14))

    # 6. 3-Minute Hackathon Winning Demo Flow
    story.append(Paragraph("6. 3-Minute Hackathon Presentation Cheatsheet", h1_style))
    story.append(Paragraph("<b>Step 1: The Problem (15s):</b> Highlight that 150,000 rural PHCs face unexpected stockouts during monsoon/epidemic spikes, but raw health data cannot legally cross state lines.", bullet_style))
    story.append(Paragraph("<b>Step 2: PHC Staff Kiosk (45s):</b> Demonstrate offline-first touch kiosk, Hindi voice intake (बोलकर दर्ज करें), and IndexedDB sync after a simulated power cut.", bullet_style))
    story.append(Paragraph("<b>Step 3: District Officer & Doctor (60s):</b> Show the GIS Command Map with red alert pins, 1-click escrow transfer approval from a donor PHC, and live ICU/Oxygen bed admission/discharge.", bullet_style))
    story.append(Paragraph("<b>Step 4: National Admin & Federated AI (60s):</b> Trigger a nationwide <code>FedAvg</code> training round across 5 state hospital nodes with Differential Privacy (ε=1.0) complying with the DPDP Act 2023.", bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {pdf_filename}")

if __name__ == '__main__':
    generate_pdf()
