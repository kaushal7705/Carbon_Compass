import { describe, it, expect } from 'vitest';
import { 
  calculateFootprint, 
  getScoreLevel, 
  getTwinSimulation, 
  calculateLevel, 
  generateAIStories, 
  getCoachInsights, 
  generateBestFutureScenario 
} from './carbonCalculations';

const zeroHabits = {
  walking: 0,
  cycling: 0,
  bus: 0,
  metro: 0,
  car: 0,
  bike: 0,
  cab: 0,
  flights: 0,
  diet: 'vegan',
  food_delivery: 0,
  electricity: 'low',
  ac_usage: 0,
  appliances: 'efficient',
  online_freq: 'rarely',
  fast_fashion: 0,
  electronics: 0,
  recycling: true,
  reuse: true,
  separation: true,
  wfh_days: 5,
  travel_freq: 'low'
};

const extremeHabits = {
  walking: 0,
  cycling: 0,
  bus: 200,
  metro: 300,
  car: 1000,
  bike: 500,
  cab: 200,
  flights: 100,
  diet: 'high_meat',
  food_delivery: 21,
  electricity: 'high',
  ac_usage: 24,
  appliances: 'wasteful',
  online_freq: 'weekly',
  fast_fashion: 20,
  electronics: 15,
  recycling: false,
  reuse: false,
  separation: false,
  wfh_days: 0,
  travel_freq: 'high'
};

describe('Carbon Footprint Calculator', () => {
  
  it('should calculate footprint correctly for default habits', () => {
    const result = calculateFootprint();
    expect(result).toHaveProperty('total');
    expect(result.total).toBeGreaterThan(0);
    expect(result).toHaveProperty('score');
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('should calculate footprint correctly for zero/minimal habits', () => {
    const result = calculateFootprint(zeroHabits);
    expect(result.total).toBeLessThan(1500); // Minimum baseline is ~1418 kg CO2e
    expect(result.score).toBeGreaterThanOrEqual(90); // Excellent score
  });

  it('should calculate footprint correctly for extreme habits', () => {
    const result = calculateFootprint(extremeHabits);
    expect(result.total).toBeGreaterThan(15000); // Extremely high emissions
    expect(result.score).toBe(10); // Minimum clamped score
  });

  it('should verify score level ratings and colors', () => {
    const excellent = getScoreLevel(95);
    expect(excellent.label).toBe('Excellent');
    expect(excellent.color).toBe('var(--success)');

    const good = getScoreLevel(80);
    expect(good.label).toBe('Good');

    const average = getScoreLevel(60);
    expect(average.label).toBe('Average');

    const needsImp = getScoreLevel(40);
    expect(needsImp.label).toBe('Needs Improvement');
  });

  it('should calculate gamified user levels correctly', () => {
    // Level 1: 0 XP
    const lvl1 = calculateLevel(0);
    expect(lvl1.level).toBe(1);
    expect(lvl1.progressPercent).toBe(0);

    // Level 2: 350 XP (since level up requires 200 XP, 350 XP should be level 2, with 150/200 progress)
    const lvl2 = calculateLevel(350);
    expect(lvl2.level).toBe(2);
    expect(lvl2.progressPercent).toBe(75);

    // Level 3: 400 XP
    const lvl3 = calculateLevel(400);
    expect(lvl3.level).toBe(3);
    expect(lvl3.progressPercent).toBe(0);

    // Level 20: 4500 XP (max level 20)
    const lvlMax = calculateLevel(4500);
    expect(lvlMax.level).toBe(20);
  });

  it('should generate future twin simulation paths over 10 years', () => {
    const sim = getTwinSimulation();
    expect(sim.currentPath).toHaveLength(10);
    expect(sim.improvedPath).toHaveLength(10);
    expect(sim.currentPath[0].year).toBe(1);
    expect(sim.currentPath[9].year).toBe(10);
    expect(sim.currentTotal).toBeGreaterThanOrEqual(sim.improvedTotal);
  });

  it('should generate twin narrative stories', () => {
    const simHabits = { ...zeroHabits, car: 10 };
    const stories = generateAIStories(zeroHabits, simHabits, 5);
    expect(stories).toHaveProperty('currentPath');
    expect(stories).toHaveProperty('improvedPath');
    expect(stories.currentPath).toContain('years');
    expect(stories.improvedPath).toContain('tons of CO₂');
  });

  it('should get proper coach insights based on highest category emissions', () => {
    // 1. High energy habits
    const energyHabits = { ...zeroHabits, ac_usage: 12, electricity: 'high' };
    const energyInsights = getCoachInsights(energyHabits);
    expect(energyInsights.sourceName).toBe('Home Energy');
    expect(energyInsights.bestAction).toContain('AC');

    // 2. High transport habits
    const transportHabits = { ...zeroHabits, car: 200 };
    const transportInsights = getCoachInsights(transportHabits);
    expect(transportInsights.sourceName).toBe('Transportation');
    expect(transportInsights.bestAction).toContain('car');

    // 3. High food habits
    const foodHabits = { ...zeroHabits, food_delivery: 7, diet: 'high_meat' };
    const foodInsights = getCoachInsights(foodHabits);
    expect(foodInsights.sourceName).toBe('Diet & Delivery');
    expect(foodInsights.bestAction).toContain('delivery');

    // 4. High shopping habits
    const shoppingHabits = { ...zeroHabits, fast_fashion: 10, electronics: 5 };
    const shoppingInsights = getCoachInsights(shoppingHabits);
    expect(shoppingInsights.sourceName).toBe('Shopping & Clothes');
    expect(shoppingInsights.bestAction).toContain('clothes');

  });

  it('should generate best future scenarios with targets and top 3 actions', () => {
    const scenario = generateBestFutureScenario();
    expect(scenario).toHaveProperty('story');
    expect(scenario.topActions).toHaveLength(3);
    expect(scenario.topActions[0]).toHaveProperty('title');
    expect(scenario.topActions[0]).toHaveProperty('co2Saved');
    expect(scenario.topActions[0]).toHaveProperty('moneySaved');
  });

});
