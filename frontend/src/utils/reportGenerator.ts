import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SkillRatings, AIAnalysis } from '../store/aiCoachStore';

export interface TrainingReportData {
  playerName: string;
  reportDate: string;
  totalHoursTrained: number;
  streak: number;
  totalDrillsCompleted: number;
  skillRatings: SkillRatings;
  analysis: AIAnalysis;
  performanceStats: {
    averageSuccessRate: number;
    mostPlayedCategory: string;
    improvementTrend: 'improving' | 'declining' | 'stable';
  };
}

export interface ReportOptions {
  includeCharts?: boolean;
  includeSuggestions?: boolean;
  customTitle?: string;
}

// Motivational quotes for reports
const motivationalQuotes = [
  "Every expert was once a beginner. Keep practicing!",
  "The only way to get better is to practice consistently.",
  "Your brain is like a muscle - the more you use it, the stronger it gets.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The difference between ordinary and extraordinary is that little extra.",
  "Practice makes progress, not perfect. Keep going!",
  "Your potential is limitless. Keep challenging yourself!",
  "Every puzzle solved is a step toward mastery.",
  "The journey of a thousand miles begins with a single step.",
  "Consistency is the key to unlocking your potential."
];

// Tips based on performance
const getPerformanceTip = (overallRating: number, weakestArea: string): string => {
  if (overallRating < 40) {
    return "Start with easier puzzles to build confidence and fundamental skills.";
  } else if (overallRating < 60) {
    return "Focus on mastering basic techniques before moving to advanced ones.";
  } else if (overallRating < 80) {
    return "You're doing great! Try combining multiple techniques in complex puzzles.";
  } else {
    return "Excellent work! Challenge yourself with expert-level puzzles and speed competitions.";
  }
};

export class TrainingReportGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private addTitle(text: string, fontSize: number = 24, color: string = '#1f2937'): void {
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(color);
    this.doc.setFont('helvetica', 'bold');
    
    const textWidth = this.doc.getTextWidth(text);
    const x = (this.pageWidth - textWidth) / 2;
    
    this.doc.text(text, x, this.currentY);
    this.currentY += fontSize * 0.8;
  }

  private addSubtitle(text: string, fontSize: number = 16, color: string = '#374151'): void {
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(color);
    this.doc.setFont('helvetica', 'bold');
    
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += fontSize * 0.8;
  }

  private addText(text: string, fontSize: number = 12, color: string = '#4b5563'): void {
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(color);
    this.doc.setFont('helvetica', 'normal');
    
    // Handle text wrapping
    const maxWidth = this.pageWidth - (2 * this.margin);
    const lines = this.doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage();
        this.currentY = 20;
      }
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += fontSize * 0.5;
    });
    
    this.currentY += 5;
  }

  private addSectionBreak(): void {
    this.currentY += 10;
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 15;
  }

  private addSkillChart(skillRatings: SkillRatings): Promise<void> {
    return new Promise((resolve) => {
      // Create a temporary canvas element for the chart
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve();
        return;
      }

      // Draw radar chart
      const centerX = 300;
      const centerY = 200;
      const radius = 150;
      const skills = Object.keys(skillRatings);
      const angleStep = (2 * Math.PI) / skills.length;

      // Draw background circles
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw skill lines
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      skills.forEach((_, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      });

      // Draw skill ratings
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      skills.forEach((skill, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const rating = skillRatings[skill as keyof SkillRatings];
        const distance = (rating / 100) * radius;
        const x = centerX + distance * Math.cos(angle);
        const y = centerY + distance * Math.sin(angle);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Add skill labels
      ctx.fillStyle = '#374151';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      skills.forEach((skill, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const labelRadius = radius + 20;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY + labelRadius * Math.sin(angle);
        
        const label = skill.replace(/([A-Z])/g, ' $1').trim();
        ctx.fillText(label, x, y);
      });

      // Convert canvas to image and add to PDF
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            const imgWidth = 120;
            const imgHeight = (img.height * imgWidth) / img.width;
            const imgX = (this.pageWidth - imgWidth) / 2;
            
            if (this.currentY + imgHeight > this.pageHeight - 30) {
              this.doc.addPage();
              this.currentY = 20;
            }
            
            this.doc.addImage(img, 'PNG', imgX, this.currentY, imgWidth, imgHeight);
            this.currentY += imgHeight + 10;
            URL.revokeObjectURL(url);
            resolve();
          };
          img.src = url;
        } else {
          resolve();
        }
      });
    });
  }

  private addStrengthsAndWeaknesses(analysis: AIAnalysis, skillRatings: SkillRatings): void {
    this.addSubtitle('Strengths & Weaknesses', 14);
    
    // Strengths
    this.addText(`🏆 Strongest Area: ${analysis.strongestArea.replace(/([A-Z])/g, ' $1').trim()}`, 12, '#059669');
    this.addText(`Rating: ${skillRatings[analysis.strongestArea as keyof SkillRatings]}%`, 10, '#059669');
    
    // Weaknesses
    this.addText(`⚠️ Weakest Area: ${analysis.weakestArea.replace(/([A-Z])/g, ' $1').trim()}`, 12, '#dc2626');
    this.addText(`Rating: ${skillRatings[analysis.weakestArea as keyof SkillRatings]}%`, 10, '#dc2626');
    
    this.currentY += 10;
  }

  private addPersonalizedSuggestions(analysis: AIAnalysis): void {
    this.addSubtitle('Personalized Suggestions', 14);
    
    analysis.suggestions.forEach((suggestion, index) => {
      this.addText(`${index + 1}. ${suggestion}`, 11);
    });
    
    this.currentY += 5;
    
    this.addSubtitle('Recommended Drills', 12);
    analysis.recommendedDrills.forEach((drill, index) => {
      this.addText(`• ${drill}`, 10);
    });
  }

  private addMotivationalSection(overallRating: number, weakestArea: string): void {
    this.addSectionBreak();
    
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    const tip = getPerformanceTip(overallRating, weakestArea);
    
    this.addSubtitle('💪 Motivation & Tips', 14);
    this.addText(`"${quote}"`, 11, '#7c3aed');
    this.addText(`💡 Tip: ${tip}`, 11, '#059669');
  }

  async generateReport(data: TrainingReportData, options: ReportOptions = {}): Promise<jsPDF> {
    // Reset document
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.currentY = 20;
    
    // Header
    this.addTitle(options.customTitle || 'Sudoku Training Report', 24, '#1f2937');
    this.addText(`Generated for: ${data.playerName}`, 12, '#6b7280');
    this.addText(`Report Date: ${data.reportDate}`, 12, '#6b7280');
    
    this.addSectionBreak();
    
    // Training Summary
    this.addSubtitle('📊 Training Summary', 16);
    this.addText(`Total Hours Trained: ${(data.totalHoursTrained / 3600000).toFixed(1)} hours`);
    this.addText(`Current Streak: ${data.streak} days`);
    this.addText(`Total Drills Completed: ${data.totalDrillsCompleted}`);
    this.addText(`Average Success Rate: ${data.performanceStats.averageSuccessRate}%`);
    this.addText(`Most Played Category: ${data.performanceStats.mostPlayedCategory}`);
    this.addText(`Improvement Trend: ${data.performanceStats.improvementTrend}`);
    
    this.addSectionBreak();
    
    // Skill Chart
    if (options.includeCharts !== false) {
      this.addSubtitle('📈 Skill Assessment', 16);
      await this.addSkillChart(data.skillRatings);
    }
    
    // Strengths and Weaknesses
    this.addStrengthsAndWeaknesses(data.analysis, data.skillRatings);
    
    // Personalized Suggestions
    if (options.includeSuggestions !== false) {
      this.addPersonalizedSuggestions(data.analysis);
    }
    
    // Motivational Section
    this.addMotivationalSection(data.analysis.overallRating, data.analysis.weakestArea);
    
    // Footer
    this.addSectionBreak();
    this.addText('Keep practicing and improving! Your AI Coach will continue to provide personalized recommendations based on your progress.', 10, '#6b7280');
    
    return this.doc;
  }

  async downloadReport(data: TrainingReportData, options: ReportOptions = {}): Promise<void> {
    const doc = await this.generateReport(data, options);
    const filename = `Sudoku_Training_Report_${data.playerName}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }

  async getReportAsBlob(data: TrainingReportData, options: ReportOptions = {}): Promise<Blob> {
    const doc = await this.generateReport(data, options);
    return doc.output('blob');
  }
}

// Convenience function for quick report generation
export const generateTrainingReport = async (
  data: TrainingReportData,
  options: ReportOptions = {}
): Promise<void> => {
  const generator = new TrainingReportGenerator();
  await generator.downloadReport(data, options);
};

// Function to capture chart as image for PDF embedding
export const captureChartAsImage = async (chartElement: HTMLElement): Promise<string> => {
  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing chart:', error);
    return '';
  }
}; 