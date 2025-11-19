"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

interface DownloadReportButtonProps {
  results: any;
  chatId: string;
}

export function DownloadReportButton({ results, chatId }: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Use browser's print functionality to generate PDF
      // Create a new window with formatted content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to download the PDF');
        setIsGenerating(false);
        return;
      }

      // Build HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Analysis Report - ${chatId}</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            h1 {
              color: #1a1a1a;
              font-size: 28px;
              margin-bottom: 8px;
              page-break-after: avoid;
            }
            h2 {
              color: #2563eb;
              font-size: 20px;
              margin-top: 32px;
              margin-bottom: 12px;
              page-break-after: avoid;
            }
            h3 {
              color: #4b5563;
              font-size: 16px;
              margin-top: 24px;
              margin-bottom: 8px;
            }
            p {
              margin-bottom: 16px;
              text-align: justify;
            }
            .summary {
              background: #f3f4f6;
              padding: 20px;
              border-left: 4px solid #2563eb;
              margin: 24px 0;
              font-size: 16px;
            }
            .stat-box {
              display: inline-block;
              margin: 8px 16px 8px 0;
              padding: 8px 12px;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
            }
            .stat-label {
              font-size: 11px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .stat-value {
              font-size: 18px;
              font-weight: bold;
              color: #1a1a1a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 14px;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              background: #f9fafb;
              font-weight: 600;
              color: #374151;
            }
            .section {
              page-break-inside: avoid;
              margin-bottom: 32px;
            }
            .meta {
              color: #6b7280;
              font-size: 12px;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>Causal Analysis Report</h1>
          <p class="meta">Analysis ID: ${chatId} | Generated: ${new Date().toLocaleString()}</p>
          
          <div class="summary">
            <strong>Executive Summary:</strong><br>
            ${results.summary || 'No summary available'}
          </div>

          ${results.narrative_report ? `
            <h2>Research Design & Strategy</h2>
            <div class="section">
              ${results.narrative_report.research_summary.split('\n\n').map((p: string) => `<p>${p}</p>`).join('')}
            </div>

            <h2>Data Overview</h2>
            <div class="section">
              ${results.narrative_report.data_overview.split('\n\n').map((p: string) => `<p>${p}</p>`).join('')}
            </div>

            <h2>Main Findings</h2>
            <div class="section">
              ${results.narrative_report.main_findings_narrative.split('\n\n').map((p: string) => `<p>${p}</p>`).join('')}
            </div>

            <h2>Validity & Credibility Assessment</h2>
            <div class="section">
              ${results.narrative_report.validity_assessment.split('\n\n').map((p: string) => `<p>${p}</p>`).join('')}
            </div>

            <h2>Practical Implications</h2>
            <div class="section">
              ${results.narrative_report.practical_implications.split('\n\n').map((p: string) => `<p>${p}</p>`).join('')}
            </div>
          ` : ''}

          ${results.main_results ? `
            <h2>Statistical Results</h2>
            <div class="section">
              <h3>Main Treatment Effect</h3>
              <div class="stat-box">
                <div class="stat-label">Effect Estimate</div>
                <div class="stat-value">${results.main_results.treatment_effect}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Std. Error</div>
                <div class="stat-value">${results.main_results.std_error}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">P-value</div>
                <div class="stat-value">${results.main_results.p_value}</div>
              </div>
              <p><strong>Method:</strong> ${results.main_results.method}</p>
              <p><strong>Sample:</strong> ${results.main_results.n_treated} treated units, ${results.main_results.n_control} control units</p>
            </div>

            ${results.pre_trends ? `
              <div class="section">
                <h3>Parallel Trends Test</h3>
                <p><strong>Result:</strong> ${results.pre_trends.result}</p>
                <p><strong>Test Statistic:</strong> ${results.pre_trends.test_statistic}</p>
                <p><strong>P-value:</strong> ${results.pre_trends.p_value}</p>
                <p>${results.pre_trends.interpretation}</p>
              </div>
            ` : ''}

            ${results.balance_table && results.balance_table.length > 0 ? `
              <div class="section">
                <h3>Covariate Balance</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Covariate</th>
                      <th>Treated Mean</th>
                      <th>Control Mean</th>
                      <th>Difference</th>
                      <th>Std. Diff</th>
                      <th>P-value</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${results.balance_table.map((row: any) => `
                      <tr>
                        <td>${row.covariate}</td>
                        <td>${row.treated_mean}</td>
                        <td>${row.control_mean}</td>
                        <td>${row.difference}</td>
                        <td>${row.standardized_diff}</td>
                        <td>${row.p_value}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}
          ` : ''}

          <div class="meta no-print">
            <p>This report was automatically generated by Causality.</p>
            <p>For questions or more information, refer to the online analysis at the link above.</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      setTimeout(() => {
        printWindow.print();
        setIsGenerating(false);
      }, 500);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generatePDF} 
      disabled={isGenerating}
      variant="default"
      size="sm"
    >
      <Download className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generating...' : 'Download Report (PDF)'}
    </Button>
  );
}
