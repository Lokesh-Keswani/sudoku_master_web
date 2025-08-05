import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SolvingReport, PDFReportOptions } from '../types/solutionReport';
import { getTechniqueById } from '../data/enhancedTechniques';

export class PDFGenerator {
  private doc: jsPDF;
  private options: PDFReportOptions;
  private report: SolvingReport;
  private currentY: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;

  constructor(report: SolvingReport, options: Partial<PDFReportOptions> = {}) {
    this.report = report;
    this.options = {
      includeTechniqueDetails: true,
      includeVisualDiagrams: true,
      includeStatistics: true,
      includeBadges: true,
      ...options
    };
    
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  public async generatePDF(): Promise<Blob> {
    try {
      this.addHeader();
      this.addPuzzleDetails();
      
      if (this.options.includeStatistics) {
        this.addStatistics();
      }
      
      if (this.options.includeBadges) {
        this.addBadges();
      }
      
      this.addSolutionSteps();
      
      if (this.options.includeTechniqueDetails) {
        this.addTechniqueDetails();
      }
      
      this.addFooter();
      
      return this.doc.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  private addHeader(): void {
    // Title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    
    const title = this.options.customTitle || 'Sudoku Solution Report';
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.text(title, (this.pageWidth - titleWidth) / 2, this.currentY);
    this.currentY += 15;

    // Subtitle
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(127, 140, 141);
    
    const subtitle = this.options.customSubtitle || 
      `Generated on ${new Date(this.report.timestamp).toLocaleDateString()} at ${new Date(this.report.timestamp).toLocaleTimeString()}`;
    const subtitleWidth = this.doc.getTextWidth(subtitle);
    this.doc.text(subtitle, (this.pageWidth - subtitleWidth) / 2, this.currentY);
    this.currentY += 20;

    // Divider line
    this.doc.setDrawColor(189, 195, 199);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 15;
  }

  private addPuzzleDetails(): void {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Puzzle Details', this.margin, this.currentY);
    this.currentY += 10;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(52, 73, 94);

    const details = [
      `Difficulty: ${this.report.difficulty.charAt(0).toUpperCase() + this.report.difficulty.slice(1)}`,
      `Solving Time: ${this.formatTime(this.report.solvingTime)}`,
      `Total Steps: ${this.report.steps.length}`,
      `Hints Used: ${this.report.hintsUsed}`,
      `Techniques Used: ${this.report.techniquesUsed.length}`
    ];

    details.forEach(detail => {
      this.doc.text(detail, this.margin + 5, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;
  }

  private addStatistics(): void {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Solving Statistics', this.margin, this.currentY);
    this.currentY += 10;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(52, 73, 94);

    const stats = [
      `Total Score: ${this.report.totalScore}`,
      `Average Score per Step: ${(this.report.totalScore / this.report.steps.length).toFixed(1)}`,
      `Most Used Technique: ${this.getMostUsedTechnique()}`,
      `Difficulty Distribution: ${this.getDifficultyDistribution()}`
    ];

    stats.forEach(stat => {
      this.doc.text(stat, this.margin + 5, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;
  }

  private addBadges(): void {
    if (this.report.badges.length === 0) return;

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Achievements', this.margin, this.currentY);
    this.currentY += 10;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(52, 73, 94);

    const badgeDescriptions = this.getBadgeDescriptions();
    badgeDescriptions.forEach(badge => {
      this.doc.text(`🏆 ${badge}`, this.margin + 5, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;
  }

  private addSolutionSteps(): void {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Step-by-Step Solution', this.margin, this.currentY);
    this.currentY += 10;

    this.report.steps.forEach((step, index) => {
      if (this.currentY > this.pageHeight - 50) {
        this.doc.addPage();
        this.currentY = 20;
      }

      this.addStep(step, index + 1);
    });
  }

  private addStep(step: any, stepNumber: number): void {
    // Step header
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(41, 128, 185);
    this.doc.text(`Step ${stepNumber}: ${step.technique}`, this.margin, this.currentY);
    this.currentY += 8;

    // Step details
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(52, 73, 94);

    const details = [
      `Position: Row ${step.row + 1}, Column ${step.col + 1}`,
      `Value: ${step.value}`,
      `Difficulty: ${step.difficulty}`,
      `Score: ${step.score}`
    ];

    details.forEach(detail => {
      this.doc.text(detail, this.margin + 5, this.currentY);
      this.currentY += 5;
    });

    // Explanation
    this.doc.text('Explanation:', this.margin + 5, this.currentY);
    this.currentY += 5;
    
    const explanation = this.wrapText(step.explanation, this.pageWidth - 2 * this.margin - 10);
    explanation.forEach(line => {
      this.doc.text(line, this.margin + 10, this.currentY);
      this.currentY += 5;
    });

    // Visual grid if enabled
    if (this.options.includeVisualDiagrams) {
      this.addGridVisualization(step);
    }

    this.currentY += 10;
  }

  private addGridVisualization(step: any): void {
    const gridSize = 30;
    const startX = this.pageWidth - this.margin - gridSize;
    const startY = this.currentY;

    // Draw grid
    this.doc.setDrawColor(189, 195, 199);
    this.doc.setLineWidth(0.5);

    // Draw cells
    for (let i = 0; i <= 9; i++) {
      const pos = (i * gridSize) / 9;
      const lineWidth = (i % 3 === 0) ? 1 : 0.5;
      this.doc.setLineWidth(lineWidth);
      
      // Vertical lines
      this.doc.line(startX + pos, startY, startX + pos, startY + gridSize);
      // Horizontal lines
      this.doc.line(startX, startY + pos, startX + gridSize, startY + pos);
    }

    // Fill in numbers
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = step.gridState[row][col];
        if (value !== 0) {
          const x = startX + (col * gridSize) / 9 + 1;
          const y = startY + (row * gridSize) / 9 + 3;
          
          // Highlight the current step
          if (row === step.row && col === step.col) {
            this.doc.setFillColor(46, 204, 113);
            this.doc.rect(x - 1, y - 2, 2, 2, 'F');
          }
          
          this.doc.text(value.toString(), x, y);
        }
      }
    }

    this.currentY += gridSize + 5;
  }

  private addTechniqueDetails(): void {
    this.doc.addPage();
    this.currentY = 20;

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Technique Details', this.margin, this.currentY);
    this.currentY += 15;

    const uniqueTechniques = this.report.steps.map(step => step.techniqueId).filter((item, index, array) => array.indexOf(item) === index);
    
    uniqueTechniques.forEach(techniqueId => {
      const technique = getTechniqueById(techniqueId);
      if (!technique) return;

      if (this.currentY > this.pageHeight - 100) {
        this.doc.addPage();
        this.currentY = 20;
      }

      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(41, 128, 185);
      this.doc.text(technique.name, this.margin, this.currentY);
      this.currentY += 8;

      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(52, 73, 94);

      const description = this.wrapText(technique.fullDescription, this.pageWidth - 2 * this.margin);
      description.forEach(line => {
        this.doc.text(line, this.margin + 5, this.currentY);
        this.currentY += 5;
      });

      this.doc.text(`Example: ${technique.example}`, this.margin + 5, this.currentY);
      this.currentY += 8;

      this.doc.text(`Learn more: ${technique.hodokuUrl}`, this.margin + 5, this.currentY);
      this.currentY += 12;
    });
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 20;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(127, 140, 141);
    
    const footerText = 'Generated by Sudoku Master - Advanced Solution Report Module';
    const footerWidth = this.doc.getTextWidth(footerText);
    this.doc.text(footerText, (this.pageWidth - footerWidth) / 2, footerY);
  }

  private formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private getMostUsedTechnique(): string {
    const techniqueCounts: { [key: string]: number } = {};
    this.report.steps.forEach(step => {
      techniqueCounts[step.techniqueId] = (techniqueCounts[step.techniqueId] || 0) + 1;
    });

    const mostUsed = Object.entries(techniqueCounts).reduce((a, b) => 
      techniqueCounts[a[0]] > techniqueCounts[b[0]] ? a : b
    );

    const technique = getTechniqueById(mostUsed[0]);
    return technique ? technique.name : mostUsed[0];
  }

  private getDifficultyDistribution(): string {
    const distribution: { [key: string]: number } = {};
    this.report.steps.forEach(step => {
      distribution[step.difficulty] = (distribution[step.difficulty] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([difficulty, count]) => `${difficulty}: ${count}`)
      .join(', ');
  }

  private getBadgeDescriptions(): string[] {
    const badgeMap: { [key: string]: string } = {
      'speed-demon': 'Speed Demon - Solved in under 5 minutes',
      'quick-solver': 'Quick Solver - Solved in under 10 minutes',
      'advanced-logic': 'Advanced Logic - Used advanced techniques',
      'expert-solver': 'Expert Solver - Used multiple expert techniques',
      'no-hints': 'No Hints - Solved without any hints',
      'minimal-hints': 'Minimal Hints - Used very few hints',
      'challenge-master': 'Challenge Master - Conquered expert difficulty'
    };

    return this.report.badges.map(badge => badgeMap[badge] || badge);
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = this.doc.getTextWidth(testLine);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}

export const generatePDFReport = async (
  report: SolvingReport,
  options: Partial<PDFReportOptions> = {}
): Promise<Blob> => {
  const generator = new PDFGenerator(report, options);
  return await generator.generatePDF();
};

export const downloadPDF = async (
  report: SolvingReport,
  options: Partial<PDFReportOptions> = {},
  filename?: string
): Promise<void> => {
  try {
    const blob = await generatePDFReport(report, options);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `sudoku-report-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}; 