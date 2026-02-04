"""PDF Export Service for Project Analysis"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.platypus import Image as RLImage
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from io import BytesIO
from datetime import datetime
from typing import Dict, List, Any


class PDFExporter:
    """Generate structured PDF reports for project analysis"""
    
    def __init__(self):
        self.buffer = BytesIO()
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            spaceBefore=20,
            fontName='Helvetica-Bold',
            borderWidth=2,
            borderColor=colors.HexColor('#3b82f6'),
            borderPadding=5,
            backColor=colors.HexColor('#eff6ff')
        ))
        
        # Subsection style
        self.styles.add(ParagraphStyle(
            name='SubSection',
            parent=self.styles['Heading3'],
            fontSize=13,
            textColor=colors.HexColor('#374151'),
            spaceAfter=8,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Body text
        self.styles.add(ParagraphStyle(
            name='BodyText',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#1f2937'),
            spaceAfter=6,
            alignment=TA_JUSTIFY
        ))
        
        # Metadata style
        self.styles.add(ParagraphStyle(
            name='Metadata',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#6b7280'),
            spaceAfter=4
        ))
    
    def generate_report(self, export_data: Dict[str, Any]) -> BytesIO:
        """Generate complete PDF report"""
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=1*inch,
            bottomMargin=0.75*inch
        )
        
        # Build document content
        story = []
        
        # Title Page
        story.extend(self._create_title_page(export_data['metadata']))
        story.append(PageBreak())
        
        # Table of Contents
        story.extend(self._create_toc())
        story.append(PageBreak())
        
        # Problem Definition
        story.extend(self._create_problem_section(export_data['problem'], export_data['metadata']))
        story.append(PageBreak())
        
        # Solution Analysis
        story.extend(self._create_solution_section(export_data['solution'], export_data['metadata']))
        
        # Build PDF
        doc.build(story)
        self.buffer.seek(0)
        return self.buffer
    
    def _create_title_page(self, metadata: Dict) -> List:
        """Create title page"""
        elements = []
        
        # Add spacing from top
        elements.append(Spacer(1, 2*inch))
        
        # Main title
        title = Paragraph(
            "PROJECT ANALYSIS REPORT",
            self.styles['CustomTitle']
        )
        elements.append(title)
        elements.append(Spacer(1, 0.3*inch))
        
        # Project name
        project_name = Paragraph(
            f"<b>{metadata['projectName']}</b>",
            ParagraphStyle(
                'ProjectName',
                parent=self.styles['Normal'],
                fontSize=18,
                textColor=colors.HexColor('#374151'),
                alignment=TA_CENTER,
                spaceAfter=20
            )
        )
        elements.append(project_name)
        elements.append(Spacer(1, 0.5*inch))
        
        # Metadata box
        metadata_data = [
            ['Project ID:', metadata['projectId']],
            ['Method:', metadata['method']],
            ['Time Unit:', metadata['timeUnit']],
            ['Export Date:', datetime.fromisoformat(metadata['exportDate']).strftime('%B %d, %Y at %H:%M:%S')],
            ['Created:', datetime.fromisoformat(metadata['createdAt']).strftime('%B %d, %Y')],
        ]
        
        metadata_table = Table(metadata_data, colWidths=[2*inch, 4*inch])
        metadata_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1f2937')),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(metadata_table)
        
        return elements
    
    def _create_toc(self) -> List:
        """Create table of contents"""
        elements = []
        
        elements.append(Paragraph("TABLE OF CONTENTS", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        toc_items = [
            "1. Problem Definition",
            "   1.1 Project Overview",
            "   1.2 Activities",
            "   1.3 Analysis Objectives",
            "2. Solution Analysis",
            "   2.1 Project Summary",
            "   2.2 Critical Path",
            "   2.3 Activity Schedule",
            "   2.4 Statistical Analysis",
            "   2.5 Crashing Analysis (if available)",
        ]
        
        for item in toc_items:
            p = Paragraph(item, self.styles['BodyText'])
            elements.append(p)
        
        return elements
    
    def _create_problem_section(self, problem: Dict, metadata: Dict) -> List:
        """Create problem definition section"""
        elements = []
        
        # Section header
        elements.append(Paragraph("1. PROBLEM DEFINITION", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.15*inch))
        
        # Overview
        elements.append(Paragraph("1.1 Project Overview", self.styles['SubSection']))
        overview_text = f"""
        This project analysis uses the <b>{metadata['method']}</b> method to schedule and optimize 
        project activities. The analysis determines the critical path, calculates activity slack times,
        and provides insights for project management decisions. Time measurements are in <b>{metadata['timeUnit']}</b>.
        """
        elements.append(Paragraph(overview_text, self.styles['BodyText']))
        elements.append(Spacer(1, 0.1*inch))
        
        # Activities
        elements.append(Paragraph("1.2 Project Activities", self.styles['SubSection']))
        elements.append(Spacer(1, 0.1*inch))
        
        # Activities table
        if metadata['method'] == 'CPM':
            headers = [['ID', 'Name', 'Predecessors', 'Duration', 'Cost', 'Crash Time', 'Crash Cost']]
            data = headers + [
                [
                    activity['activityId'],
                    activity['name'][:30],
                    activity['predecessors'] if activity['predecessors'] != 'None' else '-',
                    f"{activity['duration']:.1f}" if activity['duration'] else '-',
                    f"${activity['cost']:.0f}" if activity['cost'] else '-',
                    f"{activity['crashTime']:.1f}" if activity['crashTime'] else '-',
                    f"${activity['crashCost']:.0f}" if activity['crashCost'] else '-'
                ]
                for activity in problem['activities']
            ]
            col_widths = [0.6*inch, 1.8*inch, 1*inch, 0.9*inch, 0.8*inch, 0.9*inch, 0.9*inch]
        else:  # PERT
            headers = [['ID', 'Name', 'Predecessors', 'Optimistic', 'Most Likely', 'Pessimistic']]
            data = headers + [
                [
                    activity['activityId'],
                    activity['name'][:35],
                    activity['predecessors'] if activity['predecessors'] != 'None' else '-',
                    f"{activity['optimistic']:.1f}" if activity['optimistic'] else '-',
                    f"{activity['mostLikely']:.1f}" if activity['mostLikely'] else '-',
                    f"{activity['pessimistic']:.1f}" if activity['pessimistic'] else '-'
                ]
                for activity in problem['activities']
            ]
            col_widths = [0.6*inch, 2.2*inch, 1.2*inch, 1*inch, 1*inch, 1*inch]
        
        activity_table = Table(data, colWidths=col_widths, repeatRows=1)
        activity_table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            
            # Body styling
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1f2937')),
            ('ALIGN', (0, 1), (0, -1), 'CENTER'),
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),
            ('ALIGN', (2, 1), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#1e40af')),
            
            # Alternating rows
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
        ]))
        elements.append(activity_table)
        elements.append(Spacer(1, 0.15*inch))
        
        # Objectives
        elements.append(Paragraph("1.3 Analysis Objectives", self.styles['SubSection']))
        for objective in problem['objectives']:
            bullet = Paragraph(f"• {objective}", self.styles['BodyText'])
            elements.append(bullet)
        
        return elements
    
    def _create_solution_section(self, solution: Dict, metadata: Dict) -> List:
        """Create solution analysis section"""
        elements = []
        
        # Section header
        elements.append(Paragraph("2. SOLUTION ANALYSIS", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.15*inch))
        
        # Project Summary
        elements.append(Paragraph("2.1 Project Summary", self.styles['SubSection']))
        
        summary_data = [
            ['Metric', 'Value'],
            ['Project Duration', f"{solution['projectDuration']:.2f} {metadata['timeUnit']}"],
            ['Total Activities', str(solution['totalActivities'])],
            ['Critical Activities', str(solution['criticalActivitiesCount'])],
            ['Critical Path Length', str(solution['analysis']['criticalPathLength'])],
        ]
        
        if solution['projectVariance']:
            summary_data.append(['Project Variance', f"{solution['projectVariance']:.2f}"])
            summary_data.append(['Standard Deviation', f"{solution['analysis']['standardDeviation']:.2f}"])
        
        summary_table = Table(summary_data, colWidths=[3*inch, 3*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            
            ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1f2937')),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('ALIGN', (1, 1), (1, -1), 'CENTER'),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db')),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 0.2*inch))
        
        # Critical Path
        elements.append(Paragraph("2.2 Critical Path", self.styles['SubSection']))
        critical_path_text = " → ".join(solution['criticalPath'])
        
        cp_box = Paragraph(
            f"<b>{critical_path_text}</b>",
            ParagraphStyle(
                'CriticalPath',
                parent=self.styles['BodyText'],
                fontSize=11,
                textColor=colors.HexColor('#dc2626'),
                alignment=TA_CENTER,
                backColor=colors.HexColor('#fee2e2'),
                borderColor=colors.HexColor('#dc2626'),
                borderWidth=1,
                borderPadding=10,
                fontName='Helvetica-Bold'
            )
        )
        elements.append(cp_box)
        elements.append(Spacer(1, 0.2*inch))
        
        # Activity Schedule
        elements.append(Paragraph("2.3 Activity Schedule", self.styles['SubSection']))
        elements.append(Spacer(1, 0.1*inch))
        
        schedule_headers = [['Activity', 'ES', 'EF', 'LS', 'LF', 'Slack', 'Status']]
        schedule_data = schedule_headers + [
            [
                activity['activityId'],
                f"{activity['ES']:.1f}",
                f"{activity['EF']:.1f}",
                f"{activity['LS']:.1f}",
                f"{activity['LF']:.1f}",
                f"{activity['slack']:.1f}",
                'CRITICAL' if activity['isCritical'] else 'Normal'
            ]
            for activity in sorted(solution['activities'], key=lambda x: x['ES'])
        ]
        
        schedule_table = Table(schedule_data, colWidths=[1*inch, 0.7*inch, 0.7*inch, 0.7*inch, 0.7*inch, 0.8*inch, 1*inch], repeatRows=1)
        
        # Build style commands for schedule table
        style_commands = [
            # Header
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            
            # Body
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1f2937')),
            ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#1e40af')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            
            # Alternating rows
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
        ]
        
        # Highlight critical activities
        for i, activity in enumerate(sorted(solution['activities'], key=lambda x: x['ES']), start=1):
            if activity['isCritical']:
                style_commands.extend([
                    ('BACKGROUND', (0, i), (-1, i), colors.HexColor('#fee2e2')),
                    ('TEXTCOLOR', (6, i), (6, i), colors.HexColor('#dc2626')),
                    ('FONTNAME', (6, i), (6, i), 'Helvetica-Bold'),
                ])
        
        schedule_table.setStyle(TableStyle(style_commands))
        elements.append(schedule_table)
        elements.append(Spacer(1, 0.2*inch))
        
        # Statistical Analysis (for PERT)
        if solution['projectVariance']:
            elements.append(Paragraph("2.4 Statistical Analysis", self.styles['SubSection']))
            stats_text = f"""
            <b>Variance:</b> {solution['projectVariance']:.3f}<br/>
            <b>Standard Deviation:</b> {solution['analysis']['standardDeviation']:.3f}<br/>
            <b>Interpretation:</b> The project duration has a variance of {solution['projectVariance']:.2f}, 
            indicating the level of uncertainty in the project timeline. The standard deviation of 
            {solution['analysis']['standardDeviation']:.2f} {metadata['timeUnit']} suggests the expected 
            variation from the mean project duration.
            """
            elements.append(Paragraph(stats_text, self.styles['BodyText']))
            elements.append(Spacer(1, 0.1*inch))
        
        # Crashing Analysis
        if 'crashing' in solution and solution['crashing']:
            elements.append(PageBreak())
            elements.append(Paragraph("2.5 Crashing Analysis", self.styles['SubSection']))
            elements.append(Paragraph(
                "Cost-time tradeoff analysis showing optimal crashing strategies:",
                self.styles['BodyText']
            ))
            elements.append(Spacer(1, 0.1*inch))
            
            if 'options' in solution['crashing']:
                crash_headers = [['Activity', 'Normal Time', 'Crash Time', 'Cost Increase', 'Cost Slope']]
                crash_data = crash_headers + [
                    [
                        opt['activityId'],
                        f"{opt['normalTime']:.1f}",
                        f"{opt['crashTime']:.1f}",
                        f"${opt['costIncrease']:.0f}",
                        f"${opt['costSlope']:.0f}"
                    ]
                    for opt in solution['crashing']['options'][:10]  # Limit to 10 options
                ]
                
                crash_table = Table(crash_data, colWidths=[1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch])
                crash_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#059669')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 9),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (-1, -1), 8),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0fdf4')]),
                    ('TOPPADDING', (0, 0), (-1, -1), 6),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ]))
                elements.append(crash_table)
        
        return elements


def generate_pdf_export(export_data: Dict[str, Any]) -> BytesIO:
    """Generate PDF export from analysis data"""
    exporter = PDFExporter()
    return exporter.generate_report(export_data)
