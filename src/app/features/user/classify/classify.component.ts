import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DisbursementService } from '../../../core/services/disbursement.service';

interface ClassificationRule {
  id: string;
  name: string;
  description: string;
  classification: string;
  keywords: string[];
  amountRange?: {
    min?: number;
    max?: number;
  };
  department?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface ClassificationSuggestion {
  classification: string;
  confidence: number;
  reason: string;
  matchedRules: string[];
}

interface DisbursementEntry {
  id: string;
  payee: string;
  amount: number;
  description: string;
  department: string;
  fundSource: string;
  currentClassification?: string;
  suggestedClassification?: ClassificationSuggestion;
}

@Component({
  selector: 'app-classify',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './classify.component.html',
  styleUrls: ['./classify.component.css']
})
export class ClassifyComponent implements OnInit {
  canEdit = false;
  canManageRules = false;
  
  // Classification types
  classifications = [
    {
      code: 'PS',
      name: 'Personal Services',
      description: 'Salaries, wages, and other compensation for government personnel',
      color: '#1976d2',
      examples: ['Salaries', 'Overtime pay', 'Allowances', 'Benefits']
    },
    {
      code: 'MOOE',
      name: 'Maintenance and Other Operating Expenses',
      description: 'Day-to-day operational expenses excluding personnel services',
      color: '#7b1fa2',
      examples: ['Office supplies', 'Utilities', 'Travel expenses', 'Communications']
    },
    {
      code: 'CO',
      name: 'Capital Outlay',
      description: 'Expenditures for acquisition of assets and infrastructure',
      color: '#388e3c',
      examples: ['Equipment', 'Infrastructure', 'Vehicles', 'Buildings']
    },
    {
      code: 'TR',
      name: 'Transfer',
      description: 'Fund transfers to other agencies or programs',
      color: '#f57c00',
      examples: ['Subsidies', 'Grants', 'Inter-agency transfers', 'Program funding']
    }
  ];
  
  // Classification rules
  classificationRules: ClassificationRule[] = [];
  
  // Entries to classify
  entriesToClassify: DisbursementEntry[] = [];
  selectedEntry: DisbursementEntry | null = null;
  
  // Auto-classification
  isAutoClassifying = false;
  autoClassificationResults: any[] = [];
  
  // Manual classification
  manualClassification = {
    entryId: '',
    classification: '',
    reason: '',
    confidence: 100
  };
  
  // Rule management
  showRuleForm = false;
  newRule: Partial<ClassificationRule> = {
    name: '',
    description: '',
    classification: '',
    keywords: [],
    isActive: true
  };
  keywordInput = '';
  
  // Statistics
  classificationStats = {
    total: 0,
    classified: 0,
    unclassified: 0,
    byType: {} as { [key: string]: number }
  };

  constructor(
    private authService: AuthService,
    private disbursementService: DisbursementService
  ) {}

  ngOnInit() {
    this.loadUserPermissions();
    this.loadClassificationRules();
    this.loadEntriesToClassify();
    this.calculateStatistics();
  }

  private loadUserPermissions(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.canEdit = user?.permission === 'ENCODER' || false;
      this.canManageRules = user?.permission === 'ENCODER' || false;
    }
  }

  private loadClassificationRules() {
    // Mock data - replace with actual service call
    this.classificationRules = [
      {
        id: '1',
        name: 'Salary Payments',
        description: 'Automatic classification for salary-related payments',
        classification: 'PS',
        keywords: ['salary', 'wage', 'pay', 'compensation', 'allowance'],
        isActive: true,
        createdBy: 'admin@gov.ph',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Office Supplies',
        description: 'Classification for office supplies and materials',
        classification: 'MOOE',
        keywords: ['supplies', 'materials', 'stationery', 'paper', 'ink'],
        amountRange: { max: 50000 },
        isActive: true,
        createdBy: 'admin@gov.ph',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'Equipment Purchase',
        description: 'Classification for equipment and asset purchases',
        classification: 'CO',
        keywords: ['equipment', 'computer', 'furniture', 'vehicle', 'machinery'],
        amountRange: { min: 15000 },
        isActive: true,
        createdBy: 'admin@gov.ph',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private loadEntriesToClassify() {
    // Mock data - replace with actual service call
    this.entriesToClassify = [
      {
        id: '1',
        payee: 'John Doe',
        amount: 45000,
        description: 'Monthly salary payment for January 2024',
        department: 'Human Resources',
        fundSource: 'Payroll Fund'
      },
      {
        id: '2',
        payee: 'Office Supplies Inc.',
        amount: 25000,
        description: 'Office supplies and stationery materials',
        department: 'Finance Department',
        fundSource: 'General Fund'
      },
      {
        id: '3',
        payee: 'Tech Solutions Corp.',
        amount: 150000,
        description: 'Computer equipment for IT department',
        department: 'Information Technology',
        fundSource: 'Infrastructure Fund'
      }
    ];
    
    // Generate suggestions for each entry
    this.entriesToClassify.forEach(entry => {
      entry.suggestedClassification = this.generateClassificationSuggestion(entry);
    });
  }

  private generateClassificationSuggestion(entry: DisbursementEntry): ClassificationSuggestion {
    const description = entry.description.toLowerCase();
    const payee = entry.payee.toLowerCase();
    const amount = entry.amount;
    
    let bestMatch: ClassificationSuggestion = {
      classification: 'MOOE',
      confidence: 30,
      reason: 'Default classification',
      matchedRules: []
    };
    
    // Check against classification rules
    for (const rule of this.classificationRules) {
      if (!rule.isActive) continue;
      
      let score = 0;
      const matchedKeywords: string[] = [];
      
      // Check keywords
      for (const keyword of rule.keywords) {
        if (description.includes(keyword.toLowerCase()) || payee.includes(keyword.toLowerCase())) {
          score += 20;
          matchedKeywords.push(keyword);
        }
      }
      
      // Check amount range
      if (rule.amountRange) {
        if (rule.amountRange.min && amount >= rule.amountRange.min) score += 10;
        if (rule.amountRange.max && amount <= rule.amountRange.max) score += 10;
      }
      
      // Check department
      if (rule.department && entry.department === rule.department) {
        score += 15;
      }
      
      if (score > bestMatch.confidence) {
        bestMatch = {
          classification: rule.classification,
          confidence: Math.min(score, 95),
          reason: `Matched rule: ${rule.name}`,
          matchedRules: [rule.name]
        };
      }
    }
    
    return bestMatch;
  }

  private calculateStatistics() {
    this.classificationStats.total = this.entriesToClassify.length;
    this.classificationStats.classified = this.entriesToClassify.filter(e => e.currentClassification).length;
    this.classificationStats.unclassified = this.classificationStats.total - this.classificationStats.classified;
    
    // Count by type
    this.classificationStats.byType = {};
    this.entriesToClassify.forEach(entry => {
      if (entry.currentClassification) {
        this.classificationStats.byType[entry.currentClassification] = 
          (this.classificationStats.byType[entry.currentClassification] || 0) + 1;
      }
    });
  }

  selectEntry(entry: DisbursementEntry) {
    this.selectedEntry = entry;
    this.manualClassification = {
      entryId: entry.id,
      classification: entry.suggestedClassification?.classification || '',
      reason: entry.suggestedClassification?.reason || '',
      confidence: entry.suggestedClassification?.confidence || 50
    };
  }

  applyClassification() {
    if (!this.selectedEntry || !this.manualClassification.classification) return;
    
    this.selectedEntry.currentClassification = this.manualClassification.classification;
    this.selectedEntry = null;
    this.calculateStatistics();
    
    // TODO: Save to backend
    console.log('Applied classification:', this.manualClassification);
  }

  applySuggestion(entry: DisbursementEntry) {
    if (!entry.suggestedClassification) return;
    
    entry.currentClassification = entry.suggestedClassification.classification;
    this.calculateStatistics();
    
    // TODO: Save to backend
    console.log('Applied suggestion for entry:', entry.id);
  }

  autoClassifyAll() {
    this.isAutoClassifying = true;
    
    // Simulate auto-classification process
    setTimeout(() => {
      this.entriesToClassify.forEach(entry => {
        if (!entry.currentClassification && entry.suggestedClassification) {
          if (entry.suggestedClassification.confidence >= 70) {
            entry.currentClassification = entry.suggestedClassification.classification;
          }
        }
      });
      
      this.calculateStatistics();
      this.isAutoClassifying = false;
    }, 2000);
  }

  // Rule management methods
  showAddRuleForm() {
    this.showRuleForm = true;
    this.newRule = {
      name: '',
      description: '',
      classification: '',
      keywords: [],
      isActive: true
    };
    this.keywordInput = '';
  }

  addKeyword() {
    if (this.keywordInput.trim() && !this.newRule.keywords?.includes(this.keywordInput.trim())) {
      this.newRule.keywords = [...(this.newRule.keywords || []), this.keywordInput.trim()];
      this.keywordInput = '';
    }
  }

  removeKeyword(keyword: string) {
    this.newRule.keywords = this.newRule.keywords?.filter(k => k !== keyword) || [];
  }

  saveRule() {
    if (!this.newRule.name || !this.newRule.classification) return;
    
    const rule: ClassificationRule = {
      id: Date.now().toString(),
      name: this.newRule.name,
      description: this.newRule.description || '',
      classification: this.newRule.classification,
      keywords: this.newRule.keywords || [],
      amountRange: this.newRule.amountRange,
      department: this.newRule.department,
      isActive: true,
      createdBy: 'current-user@gov.ph',
      createdAt: new Date().toISOString()
    };
    
    this.classificationRules.push(rule);
    this.showRuleForm = false;
    
    // Regenerate suggestions with new rule
    this.entriesToClassify.forEach(entry => {
      entry.suggestedClassification = this.generateClassificationSuggestion(entry);
    });
    
    // TODO: Save to backend
    console.log('Saved new rule:', rule);
  }

  toggleRule(rule: ClassificationRule) {
    rule.isActive = !rule.isActive;
    
    // Regenerate suggestions
    this.entriesToClassify.forEach(entry => {
      entry.suggestedClassification = this.generateClassificationSuggestion(entry);
    });
    
    // TODO: Update in backend
    console.log('Toggled rule:', rule.id, rule.isActive);
  }

  deleteRule(rule: ClassificationRule) {
    if (confirm(`Are you sure you want to delete the rule "${rule.name}"?`)) {
      this.classificationRules = this.classificationRules.filter(r => r.id !== rule.id);
      
      // Regenerate suggestions
      this.entriesToClassify.forEach(entry => {
        entry.suggestedClassification = this.generateClassificationSuggestion(entry);
      });
      
      // TODO: Delete from backend
      console.log('Deleted rule:', rule.id);
    }
  }

  getClassificationInfo(code: string) {
    return this.classifications.find(c => c.code === code);
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return '#27ae60';
    if (confidence >= 60) return '#f39c12';
    return '#e74c3c';
  }

  getConfidenceText(confidence: number): string {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  }
}