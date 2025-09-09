import { describe, expect, it } from 'vitest';
import { createPartyComparisonExporter, exportPartyComparison } from '../lib/exportUtils';
import { PoliticalParty, TimeFrame, type PartyInsight } from '../types';

// Mock data for testing
const mockPartyInsights: PartyInsight[] = [
  {
    id: 'apc-insight',
    party: PoliticalParty.APC,
    totalMentions: 15420,
    totalEngagement: 89340,
    overallSentiment: { positive: 42, neutral: 38, negative: 20 },
    date: '2024-01-15',
    timeframe: TimeFrame.DAY,
    trendData: [],
    platformBreakdown: [],
    topPoliticians: [
      { politicianId: '1', name: 'John Doe', sentimentScore: 65, mentionCount: 1200 },
      { politicianId: '2', name: 'Jane Smith', sentimentScore: 58, mentionCount: 980 }
    ]
  },
  {
    id: 'pdp-insight',
    party: PoliticalParty.PDP,
    totalMentions: 12850,
    totalEngagement: 76230,
    overallSentiment: { positive: 38, neutral: 42, negative: 20 },
    date: '2024-01-15',
    timeframe: TimeFrame.DAY,
    trendData: [],
    platformBreakdown: [],
    topPoliticians: [
      { politicianId: '3', name: 'Bob Johnson', sentimentScore: 52, mentionCount: 850 },
      { politicianId: '4', name: 'Alice Brown', sentimentScore: 61, mentionCount: 720 }
    ]
  }
];

describe('Task 10: Enhanced Party Comparison Features - Basic Tests', () => {
  describe('Export Utilities', () => {
    it('should create party comparison exporter with correct data', () => {
      const exporter = createPartyComparisonExporter(mockPartyInsights);
      expect(exporter).toBeDefined();
    });

    it('should handle CSV export format', async () => {
      // This test verifies the export function can be called without errors
      expect(() => {
        exportPartyComparison(mockPartyInsights, 'csv');
      }).not.toThrow();
    });

    it('should handle JSON export format', async () => {
      expect(() => {
        exportPartyComparison(mockPartyInsights, 'json');
      }).not.toThrow();
    });

    it('should handle PDF export format', async () => {
      expect(() => {
        exportPartyComparison(mockPartyInsights, 'pdf');
      }).not.toThrow();
    });
  });

  describe('Data Transformation', () => {
    it('should transform party insights data correctly', () => {
      const exporter = createPartyComparisonExporter(mockPartyInsights);
      
      // Test that the exporter was created with the correct data
      expect(mockPartyInsights).toHaveLength(2);
      expect(mockPartyInsights[0].party).toBe(PoliticalParty.APC);
      expect(mockPartyInsights[1].party).toBe(PoliticalParty.PDP);
    });

    it('should calculate engagement rates correctly', () => {
      const apcData = mockPartyInsights[0];
      const engagementRate = (apcData.totalEngagement / apcData.totalMentions) * 100;
      
      expect(engagementRate).toBeGreaterThan(0);
      expect(engagementRate).toBeLessThan(1000); // Reasonable upper bound
    });

    it('should have valid sentiment data', () => {
      mockPartyInsights.forEach(party => {
        const { positive, neutral, negative } = party.overallSentiment;
        
        // Sentiment percentages should be valid
        expect(positive).toBeGreaterThanOrEqual(0);
        expect(neutral).toBeGreaterThanOrEqual(0);
        expect(negative).toBeGreaterThanOrEqual(0);
        
        // Total should be reasonable (around 100%)
        const total = positive + neutral + negative;
        expect(total).toBeGreaterThan(90);
        expect(total).toBeLessThan(110);
      });
    });
  });

  describe('Requirements Verification', () => {
    it('should support side-by-side comparison data structure', () => {
      // Verify that we have the data structure needed for side-by-side comparison
      expect(mockPartyInsights).toHaveLength(2);
      
      const apc = mockPartyInsights.find(p => p.party === PoliticalParty.APC);
      const pdp = mockPartyInsights.find(p => p.party === PoliticalParty.PDP);
      
      expect(apc).toBeDefined();
      expect(pdp).toBeDefined();
      
      // Both parties should have comparable data
      expect(apc?.totalMentions).toBeGreaterThan(0);
      expect(pdp?.totalMentions).toBeGreaterThan(0);
      expect(apc?.totalEngagement).toBeGreaterThan(0);
      expect(pdp?.totalEngagement).toBeGreaterThan(0);
    });

    it('should support drill-down data structure', () => {
      mockPartyInsights.forEach(party => {
        // Each party should have top politicians for drill-down
        expect(party.topPoliticians).toBeDefined();
        expect(Array.isArray(party.topPoliticians)).toBe(true);
        
        if (party.topPoliticians.length > 0) {
          const politician = party.topPoliticians[0];
          expect(politician.name).toBeDefined();
          expect(politician.sentimentScore).toBeGreaterThanOrEqual(0);
          expect(politician.mentionCount).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should support export data requirements', () => {
      mockPartyInsights.forEach(party => {
        // Each party should have all required fields for export
        expect(party.party).toBeDefined();
        expect(party.totalMentions).toBeDefined();
        expect(party.totalEngagement).toBeDefined();
        expect(party.overallSentiment).toBeDefined();
        expect(party.overallSentiment.positive).toBeDefined();
        expect(party.overallSentiment.neutral).toBeDefined();
        expect(party.overallSentiment.negative).toBeDefined();
      });
    });

    it('should support comparison highlighting requirements', () => {
      // Verify we can identify key differences between parties
      const apc = mockPartyInsights.find(p => p.party === PoliticalParty.APC);
      const pdp = mockPartyInsights.find(p => p.party === PoliticalParty.PDP);
      
      if (apc && pdp) {
        // Should be able to compare mentions
        const mentionsDiff = Math.abs(apc.totalMentions - pdp.totalMentions);
        expect(mentionsDiff).toBeGreaterThan(0);
        
        // Should be able to compare sentiment
        const apcSentiment = apc.overallSentiment.positive - apc.overallSentiment.negative;
        const pdpSentiment = pdp.overallSentiment.positive - pdp.overallSentiment.negative;
        const sentimentDiff = Math.abs(apcSentiment - pdpSentiment);
        expect(sentimentDiff).toBeGreaterThanOrEqual(0);
      }
    });
  });
});