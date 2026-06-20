import { describe, it, expect } from 'vitest';
import { getScoredRecommendations, getAIResponse } from './carbonCalculations';

const testHabits = {
  walking: 10,
  cycling: 5,
  bus: 15,
  metro: 20,
  car: 80,
  bike: 20,
  cab: 15,
  flights: 10,
  diet: 'mixed',
  food_delivery: 3,
  electricity: 'medium',
  ac_usage: 6,
  appliances: 'standard',
  online_freq: 'monthly',
  fast_fashion: 2,
  electronics: 2,
  recycling: false,
  reuse: true,
  separation: false,
  wfh_days: 2,
  travel_freq: 'medium'
};

describe('AI Recommendation Engine & Reasoning Trace', () => {

  it('should compute recommendation priority score according to formula', () => {
    const recs = getScoredRecommendations(testHabits);
    expect(recs.length).toBeGreaterThan(0);

    recs.forEach(rec => {
      // Priority = (Impact × 0.5) + (Confidence × 0.2) + ((10 - Difficulty) × 0.2) + ((10 - Cost) × 0.1)
      const expectedPriority = Number(
        (
          rec.impact * 0.5 + 
          rec.confidence * 0.2 + 
          (10 - rec.difficulty) * 0.2 + 
          (10 - rec.cost) * 0.1
        ).toFixed(1)
      );
      
      expect(rec.priority).toBe(expectedPriority);
    });
  });

  it('should sort recommendations in descending order of priority score', () => {
    const recs = getScoredRecommendations(testHabits);
    for (let i = 0; i < recs.length - 1; i++) {
      expect(recs[i].priority).toBeGreaterThanOrEqual(recs[i + 1].priority);
    }
  });

  it('should generate structured reasoning trace for standard question intents', () => {
    const intents = [
      { q: 'What is my biggest problem?', intent: 'Emission Source Query' },
      { q: 'What should I change first?', intent: 'Starting Point Query' },
      { q: 'What is the easiest improvement?', intent: 'Easiest Action Query' },
      { q: 'How can a student reduce emissions?', intent: 'Student/Campus Query' },
      { q: 'Show me a 30-day plan', intent: 'Timeline Planner Query' },
      { q: 'How much money can I save?', intent: 'Financial Savings Query' },
      { q: 'hello coach', intent: 'Welcome Diagnostics' }
    ];

    intents.forEach(({ q, intent }) => {
      const response = getAIResponse(testHabits, q);
      expect(response).toHaveProperty('reply');
      expect(response).toHaveProperty('actions');
      expect(response).toHaveProperty('reasoningTrace');

      const trace = response.reasoningTrace;
      // Validate schema trace structure
      expect(trace).toHaveProperty('inputs');
      expect(trace.inputs.intentExtracted).toBe(intent);
      expect(trace.inputs.contextHabits.carKmWeekly).toBe(testHabits.car);
      expect(trace.inputs.contextHabits.acHoursDaily).toBe(testHabits.ac_usage);

      expect(trace).toHaveProperty('analysis');
      expect(trace.analysis.totalEmissionsKg).toBeGreaterThan(0);
      expect(trace.analysis.highestContributor).toBeDefined();

      expect(trace).toHaveProperty('prioritization');
      expect(trace.prioritization.length).toBeGreaterThan(0);
      expect(trace.prioritization[0]).toHaveProperty('priorityIndex');

      expect(trace).toHaveProperty('decision');
      expect(trace.decision.selectedPathway).toBeDefined();
      expect(trace.decision.rationale).toBeDefined();

      expect(trace).toHaveProperty('explanation');
      expect(trace.explanation.co2SavedKg).toBeGreaterThan(0);
      expect(trace.explanation.moneySavedRs).toBeGreaterThan(0);
      expect(trace.explanation.calculationFormula).toBe(
        "Priority Score = (Impact × 0.5) + (Confidence × 0.2) + ((10 - Difficulty) × 0.2) + ((10 - Cost) × 0.1)"
      );

      expect(trace).toHaveProperty('futureImpact');
      expect(trace.futureImpact.fiveYearCo2DivertedTons).toBeDefined();
      expect(trace.futureImpact.fiveYearRupeesSaved).toBeDefined();
    });
  });

  it('should generate trace correctly when shopping is the highest emitter', () => {
    const shoppingHabits = {
      walking: 0, cycling: 0, bus: 0, metro: 0, car: 0, bike: 0, cab: 0, flights: 0,
      diet: 'vegan', food_delivery: 0, electricity: 'low', ac_usage: 0, appliances: 'efficient',
      online_freq: 'weekly', fast_fashion: 10, electronics: 5, recycling: true, reuse: true, separation: true,
      wfh_days: 5, travel_freq: 'low'
    };
    const response = getAIResponse(shoppingHabits, 'What is my biggest problem?');
    expect(response.reply).toContain('Shopping & Fashion');
    expect(response.reasoningTrace.analysis.highestContributor).toBe('Shopping & Fashion');
  });

  it('should run diet optimization correctly for high_meat diet', () => {
    const highMeatHabits = {
      walking: 0, cycling: 0, bus: 0, metro: 0, car: 0, bike: 0, cab: 0, flights: 0,
      diet: 'high_meat', food_delivery: 0, electricity: 'low', ac_usage: 0, appliances: 'efficient',
      online_freq: 'rarely', fast_fashion: 0, electronics: 0, recycling: true, reuse: true, separation: true,
      wfh_days: 5, travel_freq: 'low'
    };
    const recs = getScoredRecommendations(highMeatHabits);
    const dietRec = recs.find(r => r.id === 'rec-diet');
    expect(dietRec.title).toBe('Dietary Optimization to Mixed');
  });

  it('should generate trace correctly when transportation is the highest emitter', () => {
    const transportHabits = {
      walking: 0, cycling: 0, bus: 0, metro: 0, car: 500, bike: 0, cab: 0, flights: 0,
      diet: 'vegan', food_delivery: 0, electricity: 'low', ac_usage: 0, appliances: 'efficient',
      online_freq: 'rarely', fast_fashion: 0, electronics: 0, recycling: true, reuse: true, separation: true,
      wfh_days: 0, travel_freq: 'low'
    };
    const response = getAIResponse(transportHabits, 'What is my biggest problem?');
    expect(response.reply).toContain('Transportation');
    expect(response.reasoningTrace.analysis.highestContributor).toBe('Transportation');
  });

  it('should generate trace correctly when food is the highest emitter', () => {
    const foodHabits = {
      walking: 0, cycling: 0, bus: 0, metro: 0, car: 0, bike: 0, cab: 0, flights: 0,
      diet: 'high_meat', food_delivery: 10, electricity: 'low', ac_usage: 0, appliances: 'efficient',
      online_freq: 'rarely', fast_fashion: 0, electronics: 0, recycling: true, reuse: true, separation: true,
      wfh_days: 5, travel_freq: 'low'
    };
    const response = getAIResponse(foodHabits, 'What is my biggest problem?');
    expect(response.reply).toContain('Food & Diet');
    expect(response.reasoningTrace.analysis.highestContributor).toBe('Food & Diet');
  });

});
