// Emission factors (in kg CO2e per unit)
export const EMISSION_FACTORS = {
  transport: {
    walking: 0,
    cycling: 0,
    bus: 0.08,    // per km
    metro: 0.03,  // per km
    car: 0.18,    // per km
    bike: 0.08,   // per km
    cab: 0.20,    // per km
    flights: 110  // per flight hour
  },
  food: {
    vegan: 1.5 * 365,      // yearly baseline
    mixed: 3.0 * 365,      // yearly baseline
    high_meat: 6.0 * 365,  // yearly baseline
    delivery: 0.5          // per delivery order
  },
  energy: {
    electricity: {
      low: 600,       // kg/year
      medium: 1800,   // kg/year
      high: 3600      // kg/year
    },
    ac: 1.1,          // kg per hour
    appliances: {
      efficient: 0.9,
      standard: 1.0,
      wasteful: 1.2
    }
  },
  shopping: {
    online: {
      rarely: 30,     // kg/year
      monthly: 150,   // kg/year
      weekly: 600     // kg/year
    },
    fashion: 15,      // kg per clothing item
    electronics: 150  // kg per device
  },
  waste: {
    baseline: 400,    // kg/year baseline
    recyclingDiscount: -120,
    reuseDiscount: -100,
    separationDiscount: -80
  },
  lifestyle: {
    travel: {
      low: 200,       // kg/year
      medium: 800,    // kg/year
      high: 2200      // kg/year
    }
  }
};

export const FINANCIAL_CONSTANTS = {
  food_delivery_cost: 180, // ₹ per order saved (meal markup + packaging + delivery fee)
  car_per_km_cost: 8,       // ₹ per km (fuel + maintenance)
  transit_per_km_cost: 2,   // ₹ per km (bus/metro)
  ac_per_hour_cost: 11.04,  // ₹ per hour (1.38 kW average * ₹8/kWh)
  electronics_cost: 15000,  // ₹ per device
  fast_fashion_cost: 1200   // ₹ per clothing item
};

// Default habits used as initial state
export const DEFAULT_HABITS = {
  // Transport (km per week)
  walking: 10,
  cycling: 5,
  bus: 15,
  metro: 20,
  car: 80,
  bike: 20,
  cab: 15,
  flights: 10, // hours per year

  // Food
  diet: 'mixed', // vegan, mixed, high_meat
  food_delivery: 3, // times per week

  // Energy
  electricity: 'medium', // low, medium, high
  ac_usage: 6, // hours per day
  appliances: 'standard', // efficient, standard, wasteful

  // Shopping
  online_freq: 'monthly', // rarely, monthly, weekly
  fast_fashion: 2, // items per month
  electronics: 2, // devices per year

  // Waste
  recycling: false,
  reuse: true,
  separation: false,

  // Lifestyle
  wfh_days: 2, // days per week
  travel_freq: 'medium' // low, medium, high
};

/**
 * Calculates carbon footprint based on habits.
 * Returns breakdown in kg CO2e per year and carbon health score.
 */
export function calculateFootprint(habits = DEFAULT_HABITS) {
  // Merge habits with defaults to prevent errors
  const h = { ...DEFAULT_HABITS, ...habits };

  // 1. Transportation
  // Commute distance reduction factor based on WFH days (10% reduction per WFH day, max 50%)
  const commuteModifier = Math.max(0.5, 1 - (h.wfh_days * 0.1));
  
  const transportCO2 = (
    (h.walking * EMISSION_FACTORS.transport.walking +
     h.cycling * EMISSION_FACTORS.transport.cycling +
     h.bus * EMISSION_FACTORS.transport.bus +
     h.metro * EMISSION_FACTORS.transport.metro +
     h.car * EMISSION_FACTORS.transport.car * commuteModifier +
     h.bike * EMISSION_FACTORS.transport.bike * commuteModifier +
     h.cab * EMISSION_FACTORS.transport.cab) * 52
  ) + (h.flights * EMISSION_FACTORS.transport.flights);

  // 2. Food
  const foodCO2 = 
    EMISSION_FACTORS.food[h.diet] + 
    (h.food_delivery * EMISSION_FACTORS.food.delivery * 52);

  // 3. Energy
  const rawEnergy = 
    EMISSION_FACTORS.energy.electricity[h.electricity] + 
    (h.ac_usage * EMISSION_FACTORS.energy.ac * 365);
  const energyCO2 = rawEnergy * EMISSION_FACTORS.energy.appliances[h.appliances];

  // 4. Shopping
  const shoppingCO2 = 
    EMISSION_FACTORS.shopping.online[h.online_freq] + 
    (h.fast_fashion * EMISSION_FACTORS.shopping.fashion * 12) + 
    (h.electronics * EMISSION_FACTORS.shopping.electronics);

  // 5. Waste
  let wasteCO2 = EMISSION_FACTORS.waste.baseline;
  if (h.recycling) wasteCO2 += EMISSION_FACTORS.waste.recyclingDiscount;
  if (h.reuse) wasteCO2 += EMISSION_FACTORS.waste.reuseDiscount;
  if (h.separation) wasteCO2 += EMISSION_FACTORS.waste.separationDiscount;
  wasteCO2 = Math.max(50, wasteCO2);

  // 6. Lifestyle (additional travel/commute base)
  const lifestyleCO2 = EMISSION_FACTORS.lifestyle.travel[h.travel_freq];

  const total = Math.round(transportCO2 + foodCO2 + energyCO2 + shoppingCO2 + wasteCO2 + lifestyleCO2);

  // Calculate Carbon Health Score (0-100)
  // Standard footprint comparison: 15 tons (15000 kg) is a very high score (worst), 1.5 tons (15000 * 0.1) is excellent.
  let score = Math.round(100 - (total / 18000) * 80);
  score = Math.max(10, Math.min(100, score));

  return {
    transportation: Math.round(transportCO2),
    food: Math.round(foodCO2),
    energy: Math.round(energyCO2),
    shopping: Math.round(shoppingCO2),
    waste: Math.round(wasteCO2),
    lifestyle: Math.round(lifestyleCO2),
    total,
    score
  };
}

/**
 * Returns user-friendly status, rating, and description for a given score.
 */
export function getScoreLevel(score) {
  if (score >= 90) {
    return {
      label: 'Excellent',
      color: 'var(--success)',
      desc: 'Superb! Your carbon footprint is incredibly low. You are living a climate-conscious lifestyle.'
    };
  } else if (score >= 70) {
    return {
      label: 'Good',
      color: 'var(--primary)',
      desc: 'Well done! You are beating the baseline averages. A few small tweaks can push you into the elite green zone.'
    };
  } else if (score >= 50) {
    return {
      label: 'Average',
      color: 'var(--warning)',
      desc: 'Your footprint is on par with average citizens. There are many easy opportunities for carbon reduction.'
    };
  } else {
    return {
      label: 'Needs Improvement',
      color: 'var(--error)',
      desc: 'Your carbon footprint is higher than recommended. Don\'t worry—Carbon Compass will help you make progressive steps.'
    };
  }
}

/**
 * Generates data for the 10-year Twin future simulation
 */
export function getTwinSimulation(habits = DEFAULT_HABITS) {
  const currentResult = calculateFootprint(habits);
  
  // Create improved habits structure
  const improvedHabits = {
    ...habits,
    car: Math.max(0, Math.round(habits.car * 0.3)), // switch 70% of car trips to public transit
    metro: habits.metro + Math.round(habits.car * 0.4),
    bus: habits.bus + Math.round(habits.car * 0.3),
    diet: habits.diet === 'high_meat' ? 'mixed' : habits.diet === 'mixed' ? 'vegan' : 'vegan',
    food_delivery: Math.max(0, habits.food_delivery - 2),
    ac_usage: Math.max(2, habits.ac_usage - 2), // reduce AC by 2 hrs
    appliances: 'efficient',
    fast_fashion: Math.max(0, habits.fast_fashion - 1),
    electronics: Math.max(1, habits.electronics - 1),
    recycling: true,
    reuse: true,
    separation: true
  };
  
  const improvedResult = calculateFootprint(improvedHabits);
  
  const currentPath = [];
  const improvedPath = [];
  
  for (let year = 1; year <= 10; year++) {
    // Current path assumes a slight increase in emissions over time due to typical consumption habits
    const curYearCO2 = (currentResult.total * (1 + (year - 1) * 0.01)) / 1000;
    currentPath.push({ year, co2: parseFloat(curYearCO2.toFixed(1)) });
    
    // Improved path assumes progressive improvement over the first 3 years and then stabilization
    const reductionFactor = Math.min(0.45, (year * 0.15)); // max 45% reduction achieved by year 3
    const impYearCO2 = (currentResult.total * (1 - reductionFactor)) / 1000;
    improvedPath.push({ year, co2: parseFloat(impYearCO2.toFixed(1)) });
  }

  return {
    currentTotal: parseFloat((currentResult.total / 1000).toFixed(1)),
    improvedTotal: parseFloat((improvedResult.total / 1000).toFixed(1)),
    currentPath,
    improvedPath,
    currentScore: currentResult.score,
    improvedScore: improvedResult.score
  };
}

/**
 * Level Calculator Helper for Levels 1-20
 */
export function calculateLevel(xp) {
  const xpPerLevel = 200;
  const maxLevel = 20;
  const level = Math.min(maxLevel, Math.floor(xp / xpPerLevel) + 1);
  const currentXPInLevel = xp % xpPerLevel;
  const progressPercent = (currentXPInLevel / xpPerLevel) * 100;
  
  const rewards = [
    "Climate Explorer Badge Unlock",
    "Carbon Twin Theme Customizer",
    "Smart AC Dial Customization",
    "Lobby Battles Access",
    "AI Avatar Accessories Pack",
    "Double XP Mission Boosters",
    "Advanced Scenario simulator tools",
    "Eco Ambassador Certificate",
    "VIP Climate Coach Queries",
    "Climate Crusader Badge Unlock",
    "Gold Profile Borders",
    "Custom Department Badges",
    "Private Friends Challenge Rooms",
    "Eco Warrior Badge Unlock",
    "Triple XP Event Passes",
    "Exclusive Dark Mode Themes",
    "Special Virtual Tree Seeds",
    "Eco-friendly discount vouchers",
    "Companion Leader Badge",
    "Climate Champion Trophy & Legendary Avatar"
  ];
  
  const nextReward = rewards[Math.min(rewards.length - 1, level - 1)] || "Legendary Sustainability Guild Badge";

  return {
    level,
    currentXPInLevel,
    xpNeeded: xpPerLevel,
    progressPercent,
    nextReward
  };
}

/**
 * AI Future Story Narrative Generator
 */
export function generateAIStories(habits, simulatedHabits, targetYear = 5) {
  const currentResult = calculateFootprint(habits);
  const simResult = calculateFootprint(simulatedHabits);
  
  const currentTons = (currentResult.total / 1000).toFixed(1);
  const simTons = (simResult.total / 1000).toFixed(1);
  const savedCO2 = Math.max(0, currentResult.total - simResult.total);
  const savedTonsCumulative = ((savedCO2 / 1000) * targetYear).toFixed(1);
  
  let transportFactor;
  if (habits.car > 80) {
    transportFactor = "with solo car commuting and occasional cab rides adding to fuel consumption";
  } else if (habits.flights > 8) {
    transportFactor = "driven significantly by flying hours and long-distance travel emissions";
  } else {
    transportFactor = "with moderate vehicle use and daily travel behaviors";
  }
  
  let foodFactor;
  if (habits.diet === 'high_meat') {
    foodFactor = "coupled with a meat-intensive diet which demands heavy agricultural and transport resources";
  } else if (habits.food_delivery > 3) {
    foodFactor = "compounded by frequent food delivery transit and excessive single-use plastic waste packaging";
  } else {
    foodFactor = "balanced with mixed dietary preferences and moderate delivery habits";
  }

  const currentStory = `In ${2026 + targetYear}, your current choices remain unchanged. Your annual carbon footprint continues at approximately ${currentTons} tons, driven largely by ${transportFactor} ${foodFactor}. Cumulative emissions over ${targetYear} years will exceed ${((currentResult.total / 1000) * targetYear).toFixed(1)} tons of CO₂, placing strain on local energy grids and contributing to the heat-island effect in your immediate neighborhood.`;

  const improvedStory = `By adopting practical adjustments, your carbon footprint decreases to ${simTons} tons annually. Over ${targetYear} years, this prevents more than ${savedTonsCumulative} tons of CO₂ emissions from entering the environment. Switching commutes to transit encourages cleaner urban air, and reducing delivery orders eliminates plastic and transit exhaust. Your climate twin thrives in a greener, healthier future.`;

  return {
    currentPath: currentStory,
    improvedPath: improvedStory
  };
}

/**
 * Coach Smart Insights Calculator
 */
export function getCoachInsights(habits = DEFAULT_HABITS) {
  const result = calculateFootprint(habits);
  const total = result.total;

  const categories = [
    { name: 'transportation', val: result.transportation, label: 'Transportation', icon: '🚗' },
    { name: 'food', val: result.food, label: 'Diet & Delivery', icon: '🥗' },
    { name: 'energy', val: result.energy, label: 'Home Energy', icon: '⚡' },
    { name: 'shopping', val: result.shopping, label: 'Shopping & Clothes', icon: '🛍️' },
    { name: 'waste', val: result.waste, valRaw: result.waste, label: 'Waste & Landfills', icon: '♻️' }
  ];
  categories.sort((a, b) => b.val - a.val);
  const highest = categories[0];
  const percent = total > 0 ? Math.round((highest.val / total) * 100) : 0;

  let bestAction;
  let expectedImpact;
  let financialSavings;
  let explanation;

  if (highest.name === 'transportation') {
    bestAction = `Reduce car travel from ${habits.car} km/wk to ${Math.round(habits.car * 0.4)} km/wk, shifting the remainder to Metro or Bus.`;
    const carbonSavedVal = Math.round((habits.car * 0.6 * 0.15) * 4.3); // save ~150g CO2 per km, 4.3 wks/mo
    expectedImpact = `Save ${carbonSavedVal} kg CO₂ monthly`;
    financialSavings = `Save ₹${Math.round(habits.car * 0.6 * (FINANCIAL_CONSTANTS.car_per_km_cost - FINANCIAL_CONSTANTS.transit_per_km_cost) * 4.3)} monthly in fuel and fare differences`;
    explanation = `Your high transportation demand is the primary driver of your emissions. Shifting short car commutes to walking/cycling, carpooling, or riding public transit will deliver your highest climate dividend.`;
  } else if (highest.name === 'food') {
    bestAction = `Reduce food delivery from ${habits.food_delivery} to 1 order/week, and swap one meat meal for plant-based dishes.`;
    const deliveryReduction = Math.max(1, habits.food_delivery - 1);
    const carbonSavedVal = Math.round((deliveryReduction * 0.5 + 5.2) * 4.3);
    expectedImpact = `Save ${carbonSavedVal} kg CO₂ monthly`;
    financialSavings = `Save ₹${Math.round(deliveryReduction * FINANCIAL_CONSTANTS.food_delivery_cost * 4.3)} monthly on delivery fees and restaurant markups`;
    explanation = `Food production and packaging transit carry a significant footprint. Swapping red meat for plant-based alternatives just one day a week and cooking at home cuts down delivery bike transit emissions and plastic waste.`;
  } else if (highest.name === 'energy') {
    bestAction = `Set AC temperature to 25°C or above, and reduce AC run time by 2 hours daily.`;
    const carbonSavedVal = Math.round(2 * 1.1 * 30);
    expectedImpact = `Save ${carbonSavedVal} kg CO₂ monthly`;
    financialSavings = `Save ₹${Math.round(2 * FINANCIAL_CONSTANTS.ac_per_hour_cost * 30)} monthly in utility electricity bills`;
    explanation = `Home electrical appliances, especially older AC compressors, draw high amounts of grid electricity. Standard cooling habits and leaving devices on standby compound emissions quickly.`;
  } else if (highest.name === 'shopping') {
    bestAction = `Reduce clothes buying from ${habits.fast_fashion}/mo to 0-1 items, and buy certified refurbished electronics.`;
    const itemsSaved = Math.max(1, habits.fast_fashion - 1);
    const carbonSavedVal = Math.round(itemsSaved * 15 + 20);
    expectedImpact = `Save ${carbonSavedVal} kg CO₂ monthly`;
    financialSavings = `Save ₹${Math.round(itemsSaved * FINANCIAL_CONSTANTS.fast_fashion_cost)} monthly on apparel shopping`;
    explanation = `Manufacturing clothing and consumer electronic systems relies heavily on fossil-fuel industrial heat. Buying thrifted, renting, or repairing devices is a great way to extend products' lifespans.`;
  } else {
    bestAction = `Implement thorough recycling and wet/dry waste separation.`;
    expectedImpact = `Save 22 kg CO₂ monthly`;
    financialSavings = `Eco-friendly bonus rewards`;
    explanation = `Landfills release highly warming methane gases when organic waste undergoes anaerobic decay. Keeping organic waste separate for composting eliminates this major methane pipeline.`;
  }

  return {
    sourceName: highest.label,
    sourcePercent: percent,
    bestAction,
    expectedImpact,
    financialSavings,
    explanation
  };
}

/**
 * FLAGSHIP FEATURE: Generate Best Future Scenario Generator
 */
export function generateBestFutureScenario(habits = DEFAULT_HABITS) {
  const currentResult = calculateFootprint(habits);

  // 1. Calculate Recommended Slider Targets (Personalized targets)
  // Reduce food delivery: -30% (rounded)
  const deliveryAdjustment = Math.max(0, Math.min(habits.food_delivery, Math.round(habits.food_delivery * 0.3)));
  
  // Move car trips to public transport: -20% (shifted)
  const transitShift = habits.car > 0 ? 20 : 0;
  
  // Reduce AC usage: -1 hour/day (or -2 if usage is very high)
  const acAdjustment = habits.ac_usage > 0 ? Math.max(1, Math.min(habits.ac_usage, habits.ac_usage > 8 ? 2 : 1)) : 0;
  
  // Buy fewer electronics: -1 per year
  const electronicsAdjustment = habits.electronics > 0 ? 1 : 0;

  // 2. Generate Top 3 Actions List
  const topActions = [];

  // Determine top contributing actions
  if (habits.food_delivery > 1) {
    topActions.push({
      title: "Reduce Food Delivery frequency",
      impact: "High",
      co2Saved: Math.round(1.5 * 0.5 * 52), // 1.5 orders fewer/wk
      moneySaved: Math.round(1.5 * FINANCIAL_CONSTANTS.food_delivery_cost * 52),
      desc: "Cook fresh meals at home instead of ordering online."
    });
  }
  if (habits.car > 30) {
    topActions.push({
      title: "Use Public Transit twice weekly",
      impact: "High",
      co2Saved: Math.round(habits.car * 0.2 * 0.15 * 52), // 20% shift
      moneySaved: Math.round(habits.car * 0.2 * (FINANCIAL_CONSTANTS.car_per_km_cost - FINANCIAL_CONSTANTS.transit_per_km_cost) * 52),
      desc: "Swap solo car commutes with metro or shuttle transits."
    });
  }
  if (habits.ac_usage > 3) {
    topActions.push({
      title: "Reduce AC usage by 1 hour",
      impact: "Medium",
      co2Saved: Math.round(1 * 1.1 * 365), // 1 hour AC/day
      moneySaved: Math.round(1 * FINANCIAL_CONSTANTS.ac_per_hour_cost * 365),
      desc: "Turn off the AC one hour earlier and use a fan instead."
    });
  }
  if (habits.electronics > 0 && topActions.length < 3) {
    topActions.push({
      title: "Rent or Thrift Electronics",
      impact: "Medium",
      co2Saved: 150, // 1 device saved
      moneySaved: FINANCIAL_CONSTANTS.electronics_cost,
      desc: "Buy certified refurbished smartphones and gadgets."
    });
  }
  if (habits.fast_fashion > 0 && topActions.length < 3) {
    topActions.push({
      title: "Wear Clothes Longer",
      impact: "Low",
      co2Saved: Math.round(habits.fast_fashion * 0.4 * 15 * 12),
      moneySaved: Math.round(habits.fast_fashion * 0.4 * FINANCIAL_CONSTANTS.fast_fashion_cost * 12),
      desc: "Extend wardrobe cycles by thrift shopping."
    });
  }
  // Ensure we always have 3 actions
  while (topActions.length < 3) {
    topActions.push({
      title: "Sort and separate waste",
      impact: "Low",
      co2Saved: 80,
      moneySaved: 500,
      desc: "Keep dry plastics separate from organic food compost."
    });
  }

  // 3. Create Future Impact Story
  let actionsText;
  if (deliveryAdjustment > 0 && transitShift > 0 && acAdjustment > 0) {
    actionsText = "reducing delivery frequency, using public transport more often, and optimizing home energy use";
  } else if (transitShift > 0 && acAdjustment > 0) {
    actionsText = "moving some daily car drives to public transit and shortening daily AC runtimes";
  } else if (deliveryAdjustment > 0 && acAdjustment > 0) {
    actionsText = "curbing restaurant deliveries and tweaking thermostat heating/cooling usage";
  } else {
    actionsText = "adjusting daily electrical device runtimes and practicing smart green shopping choices";
  }

  const simulatedHabits = {
    ...habits,
    food_delivery: Math.max(0, habits.food_delivery - deliveryAdjustment),
    car: Math.max(0, Math.round(habits.car * (1 - transitShift / 100))),
    bus: habits.bus + Math.round(habits.car * (transitShift / 100) * 0.5),
    metro: habits.metro + Math.round(habits.car * (transitShift / 100) * 0.5),
    ac_usage: Math.max(0, habits.ac_usage - acAdjustment),
    electronics: Math.max(0, habits.electronics - electronicsAdjustment)
  };

  const simulatedResult = calculateFootprint(simulatedHabits);
  const carbonSavedPct = Math.round(((currentResult.total - simulatedResult.total) / (currentResult.total || 1)) * 100);
  const carbonSavedTons5Yr = (((currentResult.total - simulatedResult.total) / 1000) * 5).toFixed(1);

  const story = `By ${actionsText}, your annual carbon footprint could fall by nearly ${carbonSavedPct}%. Over five years, this prevents approximately ${carbonSavedTons5Yr} tons of CO₂ emissions, saves thousands of rupees in expenses, and creates a significantly lower environmental impact without requiring major lifestyle sacrifices. Your twin represents a green, thriving future.`;

  return {
    deliveryAdjustment,
    transitShift,
    acAdjustment,
    electronicsAdjustment,
    story,
    topActions: topActions.slice(0, 3)
  };
}

/**
 * Weekly missions data
 */
export const MOCK_MISSIONS = [
  {
    id: 'm1',
    title: 'Meatless Monday',
    desc: 'Go completely vegetarian or vegan for one full day.',
    xp: 50,
    carbonSaved: 5.2, // kg CO2
    moneySaved: 120, // ₹ saved
    category: 'food',
    completed: false
  },
  {
    id: 'm2',
    title: 'Commute Clean',
    desc: 'Swap one single-occupancy car trip with a walk, cycle, or metro ride.',
    xp: 80,
    carbonSaved: 8.5,
    moneySaved: 200,
    category: 'transportation',
    completed: false
  },
  {
    id: 'm3',
    title: 'AC Eco-Mode',
    desc: 'Keep your air conditioner at 25°C (77°F) or above today.',
    xp: 40,
    carbonSaved: 3.1,
    moneySaved: 80,
    category: 'energy',
    completed: false
  },
  {
    id: 'm4',
    title: 'Zero Delivery Challenge',
    desc: 'Cook home meals all day instead of ordering food delivery.',
    xp: 60,
    carbonSaved: 4.5,
    moneySaved: 250,
    category: 'food',
    completed: false
  },
  {
    id: 'm5',
    title: 'Unplug Standby',
    desc: 'Unplug all chargers, TVs, and appliances before going to sleep.',
    xp: 30,
    carbonSaved: 1.2,
    moneySaved: 20,
    category: 'energy',
    completed: false
  }
];

/**
 * Badges mock library
 */
export const MOCK_BADGES = [
  {
    id: 'b1',
    title: 'First Check-in',
    desc: 'Began your green footprint tracking journey.',
    icon: '🧭',
    unlocked: true,
    unlockedAt: 'June 15, 2026'
  },
  {
    id: 'b2',
    title: 'Climate Explorer',
    desc: 'Consulted the AI coach and explored carbon simulator paths.',
    icon: '🌍',
    unlocked: false
  },
  {
    id: 'b3',
    title: 'Eco Warrior',
    desc: 'Earned over 350 total XP and completed 5 eco missions.',
    icon: '⚔️',
    unlocked: false
  },
  {
    id: 'b4',
    title: 'Transport Saver',
    desc: 'Completed a transportation reduction mission.',
    icon: '🚇',
    unlocked: false
  },
  {
    id: 'b5',
    title: 'Energy Reducer',
    desc: 'Completed an energy saving mission or set AC to Eco.',
    icon: '⚡',
    unlocked: false
  },
  {
    id: 'b6',
    title: 'Waste Fighter',
    desc: 'Unlocked all waste recycling check-ins in the assessment.',
    icon: '♻️',
    unlocked: false
  },
  {
    id: 'b7',
    title: 'Climate Champion',
    desc: 'Achieve Level 4 in Carbon Compass.',
    icon: '🏆',
    unlocked: false
  }
];

/**
 * Team/Community mock data
 */
export const MOCK_COMMUNITY = {
  teams: [
    { id: 't1', name: 'Hostel A Eco-Riders', members: 42, carbonSaved: 1240, missionsCompleted: 18, improvement: 24.5, activeChallenge: true },
    { id: 't2', name: 'Hostel B Solar Guild', members: 38, carbonSaved: 1195, missionsCompleted: 15, improvement: 18.2, activeChallenge: true },
    { id: 't3', name: 'CS Department Green', members: 87, carbonSaved: 2850, missionsCompleted: 35, improvement: 14.2, activeChallenge: false },
    { id: 't4', name: 'EE Department Voltage', members: 79, carbonSaved: 2310, missionsCompleted: 28, improvement: 11.5, activeChallenge: false }
  ],
  sharedMissions: [
    { id: 'sm1', title: 'Plant 100 Virtual Trees', target: 100, current: 67, rewardXP: 250 },
    { id: 'sm2', title: 'Switch Off 1,000 hrs of AC', target: 1000, current: 420, rewardXP: 400 }
  ]
};

export const MOCK_LEADERBOARD = [
  { name: 'Sonia Green', rank: 1, reduction: 24.5, streak: 12, xp: 950, isUser: false },
  { name: 'Rahul V', rank: 2, reduction: 18.2, streak: 8, xp: 720, isUser: false },
  { name: 'Tanya Sen (You)', rank: 3, reduction: 14.2, streak: 5, xp: 480, isUser: true },
  { name: 'Amit Sharma', rank: 4, reduction: 11.5, streak: 3, xp: 350, isUser: false },
  { name: 'Nikhil Roy', rank: 5, reduction: 8.7, streak: 2, xp: 210, isUser: false }
];

export function getAIResponse(habits = DEFAULT_HABITS, question = '') {
  const result = calculateFootprint(habits);
  const totalTons = (result.total / 1000).toFixed(1);
  const categories = [
    { name: 'transportation', val: result.transportation, label: 'Transportation' },
    { name: 'food', val: result.food, label: 'Food & Diet' },
    { name: 'energy', val: result.energy, label: 'Home Energy' },
    { name: 'shopping', val: result.shopping, label: 'Shopping & Fashion' }
  ];
  categories.sort((a, b) => b.val - a.val);
  const highest = categories[0];

  const q = question.toLowerCase().trim();
  const scoredRecs = getScoredRecommendations(habits);
  const topRec = scoredRecs[0];

  const makeReasoningTrace = (decisionTitle, chosenRec, alternativeRecs, intentSelected) => {
    return {
      inputs: {
        query: question || "Initial System Check-in",
        intentExtracted: intentSelected,
        contextHabits: {
          carKmWeekly: habits.car,
          dietType: habits.diet,
          deliveryCountWeekly: habits.food_delivery,
          acHoursDaily: habits.ac_usage,
          applianceRating: habits.appliances,
          wasteSortingActive: habits.separation
        }
      },
      analysis: {
        totalEmissionsKg: result.total,
        totalEmissionsTons: parseFloat(totalTons),
        categoryEmissions: {
          transportation: result.transportation,
          food: result.food,
          energy: result.energy,
          shopping: result.shopping,
          waste: result.waste
        },
        highestContributor: highest.label,
        categoryPercent: Math.round((highest.val / (result.total || 1)) * 100)
      },
      prioritization: scoredRecs.map(r => ({
        pathway: r.title,
        impactScore: r.impact,
        difficultyScore: r.difficulty,
        costScore: r.cost,
        confidenceScore: r.confidence,
        priorityIndex: r.priority
      })),
      decision: {
        selectedPathway: decisionTitle,
        rationale: chosenRec ? chosenRec.reason : "Addressing highest emission source first.",
        alternativeEvaluated: alternativeRecs ? alternativeRecs.map(a => a.title).join(', ') : "None"
      },
      explanation: {
        co2SavedKg: chosenRec ? chosenRec.co2Saved : 150,
        moneySavedRs: chosenRec ? chosenRec.moneySaved : 1200,
        scoreGainPoints: chosenRec ? chosenRec.scoreGain : 5,
        calculationFormula: "Priority Score = (Impact × 0.5) + (Confidence × 0.2) + ((10 - Difficulty) × 0.2) + ((10 - Cost) × 0.1)"
      },
      futureImpact: {
        fiveYearCo2DivertedTons: chosenRec ? ((chosenRec.co2Saved / 1000) * 5).toFixed(1) : "0.8",
        fiveYearRupeesSaved: chosenRec ? (chosenRec.moneySaved * 5).toLocaleString() : "6,000",
        treesPlantedEquivalent: chosenRec ? Math.round(chosenRec.co2Saved / 22) : 7
      }
    };
  };

  // 1. "What is my biggest problem?"
  if (q.includes('biggest problem') || q.includes('highest emission') || q.includes('biggest source')) {
    let specificDetail;
    let actions;

    if (highest.name === 'transportation') {
      specificDetail = `Your highest emissions come from **Transportation** (${(result.transportation / 1000).toFixed(1)} tons/year). This is driven by your car commutes of ${habits.car} km/week.`;
      actions = [
        'Commute Clean: Replace 2 car commutes per week with Metro or Cycling (+80 XP, saves 8.5 kg CO₂, saves ₹200)',
        'Carpool: Team up with coworkers for weekly commutes (+40 XP, saves 4 kg CO₂)'
      ];
    } else if (highest.name === 'food') {
      specificDetail = `Your primary emitter is **Food & Diet** (${(result.food / 1000).toFixed(1)} tons/year). Ordering delivery ${habits.food_delivery} times/week and a ${habits.diet} diet contribute to this.`;
      actions = [
        'Meatless Monday: Swap meat dinners for delicious plant-based foods (+50 XP, saves 5.2 kg CO₂, saves ₹120)',
        'Skip Delivery Order: Cook at home instead of ordering food delivery (+60 XP, saves 4.5 kg CO₂, saves ₹250)'
      ];
    } else if (highest.name === 'energy') {
      specificDetail = `Your biggest driver is **Home Energy** (${(result.energy / 1000).toFixed(1)} tons/year). Keeping AC running for ${habits.ac_usage} hours/day is the main electricity consumer.`;
      actions = [
        'AC Eco-Mode: Keep AC at 25°C or above today (+40 XP, saves 3.1 kg CO₂, saves ₹80)',
        'Unplug Standby: Turn off standby items before sleeping (+30 XP, saves 1.2 kg CO₂, saves ₹20)'
      ];
    } else {
      specificDetail = `Your biggest contributor is **Shopping & Clothes** (${(result.shopping / 1000).toFixed(1)} tons/year) due to purchasing ${habits.fast_fashion} fashion items/month and ${habits.electronics} electronics/year.`;
      actions = [
        'Thrift Shop: Choose a refurbished device or thrift item over new (+80 XP, saves 20 kg CO₂)',
        'Wear Longer: Extend the life of clothes for another 6 months (+40 XP, saves 8 kg CO₂)'
      ];
    }

    const matchedRec = scoredRecs.find(r => r.category === highest.name) || topRec;

    return {
      reply: `🌿 Let's take a look: **${highest.label}** is indeed your largest emission category, accounting for a notable share of your ${totalTons} tons annual footprint. ${specificDetail}\n\nTo make a quick impact, here is what I recommend starting with:`,
      actions: actions.map((a, i) => ({ id: `act-prob-${i}`, text: a })),
      reasoningTrace: makeReasoningTrace(matchedRec ? matchedRec.title : "Identify Highest Contributor", matchedRec, scoredRecs.filter(r => r.id !== matchedRec?.id), "Emission Source Query")
    };
  }

  // 2. "What should I change first?"
  if (q.includes('change first') || q.includes('first steps') || q.includes('where to start')) {
    const acRec = scoredRecs.find(r => r.id === 'rec-ac') || topRec;
    return {
      reply: "👋 Start small to build lasting habits! Here are three easy, high-impact changes you can make this week. Each one unlocks XP, helps you level up, and creates immediate carbon reductions:\n\n1. **AC Adjustment**: Set your AC to 25°C (77°F). It runs much more efficiently and lowers your power bill.\n2. **Ditch One Delivery**: Swapping one delivery order for a home-cooked meal cuts down delivery courier transit and single-use packaging waste.\n3. **Active Commute**: Swap one short driving trip with a brisk walk, cycle, or metro ride. It's great for your health too!",
      actions: [
        { id: 'act-first-1', text: 'Turn off the AC 1 hour earlier than usual today. (Saves 1.1 kg CO₂, +30 XP)' },
        { id: 'act-first-2', text: 'Go meat-free for dinner tonight. Try a vegetarian meal. (Saves 2.5 kg CO₂, +40 XP)' }
      ],
      reasoningTrace: makeReasoningTrace("Quick Win Selection", acRec, scoredRecs.filter(r => r.id !== acRec?.id), "Starting Point Query")
    };
  }

  // 3. "What is the easiest improvement?"
  if (q.includes('easiest') || q.includes('low effort') || q.includes('simple change')) {
    const easyRec = scoredRecs.find(r => r.id === 'rec-waste') || scoredRecs.find(r => r.difficulty <= 3) || topRec;
    return {
      reply: "💡 The easiest improvements require almost zero lifestyle adjustments but still prevent carbon emissions:\n\n* **Power Strips & Standby**: Unplugging chargers and electronics when not in use stops 'phantom energy' drain. Standing devices contribute up to 10% of household electricity bills.\n* **Reusable Bags & Cups**: Bringing your own cloth bag when shopping or a thermos to a cafe prevents plastic manufacturing emissions.\n* **Composting & Sorting**: Separating food waste from dry recyclables ensures organic matter doesn't end up in landfill releases of methane gas.",
      actions: [
        { id: 'act-easy-1', text: 'Unplug standby chargers before going to sleep. (Saves 1.2 kg CO₂, +30 XP)' },
        { id: 'act-easy-2', text: 'Bring your own reusable bag to the grocery store today. (Saves 0.5 kg CO₂, +20 XP)' }
      ],
      reasoningTrace: makeReasoningTrace("Low Difficulty Path Selection", easyRec, scoredRecs.filter(r => r.id !== easyRec?.id), "Easiest Action Query")
    };
  }

  // 4. "How can a student reduce emissions?"
  if (q.includes('student') || q.includes('campus') || q.includes('hostel')) {
    const studentRec = scoredRecs.find(r => r.id === 'rec-transit') || scoredRecs.find(r => r.category === 'transportation') || topRec;
    return {
      reply: "🎓 Students on campus have unique, highly effective ways to reduce carbon, save money, and build community:\n\n* **Transit Choice**: Avail of metro passes, campus shuttle buses, and share cycles instead of calling single cabs.\n* **Shared Appliance Efficiency**: In hostels, share fridge space and coordinate AC usage times with roommates rather than running multiple systems.\n* **Digital Notebooks**: Rent textbooks or go paperless. Read digital PDF materials to reduce timber harvesting.\n* **Hostel Eco-Battles**: Check out the **Community tab**! Engage in hostel-wide challenges to see which block saves the most carbon through collective actions.",
      actions: [
        { id: 'act-stud-1', text: 'Ride a campus cycle or walk to your lectures all day. (Saves 1.8 kg CO₂, +40 XP)' },
        { id: 'act-stud-2', text: 'Coordinate with roommates to turn off the hostel room AC for 2 hours. (Saves 2.2 kg CO₂, +50 XP)' }
      ],
      reasoningTrace: makeReasoningTrace("Student Context Optimization", studentRec, scoredRecs.filter(r => r.id !== studentRec?.id), "Student/Campus Query")
    };
  }

  // 5. "Show me a 30-day plan"
  if (q.includes('30-day plan') || q.includes('30 day') || q.includes('calendar') || q.includes('plan')) {
    return {
      reply: "📅 Here is your **30-Day AI Companion Action Plan** broken into structured weekly steps:\n\n* **Days 1–7 (Home Energy Check)**: Optimize your AC settings to 25°C, unplug standby chargers at night, and replace one incandescent light bulb with an LED.\n* **Days 8–15 (Dietary Tweak)**: Complete 'Meatless Monday' and skip two restaurant delivery orders by preparing food at home.\n* **Days 16–22 (Transit Shift)**: Carpool once, walk or cycle for all trips under 2 km, and swap two cab rides for the metro.\n* **Days 23–30 (Conscious Consumption)**: Refrain from fast-fashion purchases, implement strict waste separation, and invite two friends to compete on the leaderboards.\n\nTake it day-by-day and watch your Carbon Health Score climb!",
      actions: [
        { id: 'act-plan-1', text: 'Start Day 1 of the 30-Day Plan: Set AC to 25°C. (Saves 3.1 kg CO₂, +40 XP)' },
        { id: 'act-plan-2', text: 'Start Day 8: Skip one delivery order this week. (Saves 4.5 kg CO₂, +60 XP)' }
      ],
      reasoningTrace: makeReasoningTrace("30-Day Phase Sequencer", topRec, scoredRecs.slice(1), "Timeline Planner Query")
    };
  }

  // 6. "How much money can I save?"
  if (q.includes('money') || q.includes('save cash') || q.includes('financial') || q.includes('savings')) {
    const deliveryCash = habits.food_delivery * FINANCIAL_CONSTANTS.food_delivery_cost * 52;
    const carCash = Math.round(habits.car * (FINANCIAL_CONSTANTS.car_per_km_cost - FINANCIAL_CONSTANTS.transit_per_km_cost) * 52);
    const acCash = Math.round(habits.ac_usage * FINANCIAL_CONSTANTS.ac_per_hour_cost * 365 * 0.2);
    const totalCash = deliveryCash + carCash + acCash;

    const moneyRec = scoredRecs.sort((a,b) => b.moneySaved - a.moneySaved)[0] || topRec;

    return {
      reply: `💰 Going green is incredibly budget-friendly! Based on your current habits, implementing a 30% reduction can save you approximately **₹${totalCash.toLocaleString()}/year**:\n\n* **Food & Deliveries**: Reducing deliveries by 2 orders/wk saves **₹${Math.round(2 * FINANCIAL_CONSTANTS.food_delivery_cost * 52).toLocaleString()}/year** in markups, packaging taxes, and delivery fees.\n* **Commuting**: Swapping half of your car trips (${Math.round(habits.car * 0.5)} km/wk) for transit saves **₹${Math.round(habits.car * 0.5 * (FINANCIAL_CONSTANTS.car_per_km_cost - FINANCIAL_CONSTANTS.transit_per_km_cost) * 52).toLocaleString()}/year** in petrol and vehicle maintenance.\n* **Electricity bills**: Shortening AC running time by 2 hrs/day saves **₹${Math.round(2 * FINANCIAL_CONSTANTS.ac_per_hour_cost * 365).toLocaleString()}/year**.\n\nSustainability is the ultimate financial smart habit!`,
      actions: [
        { id: 'act-money-1', text: 'Skip one food delivery order this week. (Saves ₹250, +60 XP)' },
        { id: 'act-money-2', text: 'Switch AC to Eco Mode to lower electricity bills. (Saves ₹80/day, +40 XP)' }
      ],
      reasoningTrace: makeReasoningTrace("Financial Optimization Pathway", moneyRec, scoredRecs.filter(r => r.id !== moneyRec?.id), "Financial Savings Query")
    };
  }

  // Default query responder
  return {
    reply: `👋 Hello! I am your AI Climate Companion. Based on your inputs, your annual carbon footprint is **${totalTons} metric tons** per year. \n\nMy analysis shows that your highest emission category is **${highest.label}**. \n\nHow would you like to proceed? Select one of the suggested questions below, or ask me directly about actions to reduce your footprint!`,
    actions: [
      { id: 'act-def-1', text: 'What is my biggest problem?' },
      { id: 'act-def-2', text: 'Show me a 30-day plan' }
    ],
    reasoningTrace: makeReasoningTrace("General Diagnostics Run", topRec, scoredRecs.slice(1), "Welcome Diagnostics")
  };
}

export function getScoredRecommendations(habits = DEFAULT_HABITS) {
  const footprint = calculateFootprint(habits);
  const total = footprint.total || 1;
  const commuteModifier = Math.max(0.5, 1 - (habits.wfh_days * 0.1));
  const appliancesMultiplier = habits.appliances === 'efficient' ? 0.9 : habits.appliances === 'wasteful' ? 1.2 : 1.0;

  const actions = [];

  // 1. Reduce AC usage
  const acCo2Saved = habits.ac_usage > 0 ? (2 * 1.1 * 365 * appliancesMultiplier) : 0;
  if (acCo2Saved > 0) {
    const impact = Math.min(10, Number((acCo2Saved / 100).toFixed(1)));
    const difficulty = 3;
    const cost = 2;
    const confidence = 10;
    actions.push({
      id: 'rec-ac',
      title: 'Reduce AC Runtime',
      desc: 'Set AC to 25°C or above and reduce daily usage by 2 hours.',
      category: 'energy',
      co2Saved: Math.round(acCo2Saved),
      moneySaved: Math.round(2 * FINANCIAL_CONSTANTS.ac_per_hour_cost * 365),
      impact,
      difficulty,
      cost,
      confidence,
      reason: 'Home Energy is highly intensive and AC compressor cycles consume significant electrical loads. Shortening runtimes is the fastest way to drop household emissions.',
      currentSituation: `Home Energy contributes ${Math.round((footprint.energy / total) * 100)}% of your emissions, with AC usage contributing ${Math.round(((habits.ac_usage * 1.1 * 365 * appliancesMultiplier) / (footprint.energy || 1)) * 100)}% of that category.`,
      scoreGain: Math.max(1, Math.round((acCo2Saved / 18000) * 80))
    });
  }

  // 2. Shift commute to public transit
  const transitCo2Saved = habits.car > 0 
    ? (habits.car * 0.3 * (EMISSION_FACTORS.transport.car * commuteModifier - EMISSION_FACTORS.transport.metro) * 52) 
    : 0;
  if (transitCo2Saved > 0) {
    const impact = Math.min(10, Number((transitCo2Saved / 40).toFixed(1)));
    const difficulty = 5;
    const cost = 1;
    const confidence = 9;
    actions.push({
      id: 'rec-transit',
      title: 'Shift Commute to Public Transit',
      desc: 'Swap 30% of solo car commuting with metro or bus rides.',
      category: 'transportation',
      co2Saved: Math.round(transitCo2Saved),
      moneySaved: Math.round(habits.car * 0.3 * (FINANCIAL_CONSTANTS.car_per_km_cost - FINANCIAL_CONSTANTS.transit_per_km_cost) * 52),
      impact,
      difficulty,
      cost,
      confidence,
      reason: 'Internal combustion engines are highly carbon-inefficient compared to electrified urban transit systems. Shifting commuter mileage reduces direct exhaust tailpipe emissions.',
      currentSituation: `Transportation contributes ${Math.round((footprint.transportation / total) * 100)}% of your footprint, with solo car driving being the leading vehicle driver.`,
      scoreGain: Math.max(1, Math.round((transitCo2Saved / 18000) * 80))
    });
  }

  // 3. Reduce food delivery
  const deliveryCo2Saved = habits.food_delivery > 0 ? (Math.min(habits.food_delivery, 2) * EMISSION_FACTORS.food.delivery * 52) : 0;
  if (deliveryCo2Saved > 0) {
    const impact = Math.min(10, Number((deliveryCo2Saved / 10).toFixed(1)));
    const difficulty = 2;
    const cost = 1;
    const confidence = 10;
    actions.push({
      id: 'rec-delivery',
      title: 'Reduce Food Delivery',
      desc: 'Prepare meals at home instead of ordering online to save transit packaging.',
      category: 'food',
      co2Saved: Math.round(deliveryCo2Saved),
      moneySaved: Math.round(Math.min(habits.food_delivery, 2) * FINANCIAL_CONSTANTS.food_delivery_cost * 52),
      impact,
      difficulty,
      cost,
      confidence,
      reason: 'Restaurant deliveries rely heavily on single-use containers and delivery courier travel. Home cooking completely eliminates packaging overhead and localized logistics footprint.',
      currentSituation: `Diet & Food contributes ${Math.round((footprint.food / total) * 100)}% of your emissions, with delivery transit accounting for ${Math.round(((habits.food_delivery * EMISSION_FACTORS.food.delivery * 52) / (footprint.food || 1)) * 100)}% of food-related emissions.`,
      scoreGain: Math.max(1, Math.round((deliveryCo2Saved / 18000) * 80))
    });
  }

  // 4. Waste segregation
  const wasteCo2Saved = !habits.separation ? Math.abs(EMISSION_FACTORS.waste.separationDiscount) : 0;
  if (wasteCo2Saved > 0) {
    const impact = 2.0;
    const difficulty = 3;
    const cost = 1;
    const confidence = 10;
    actions.push({
      id: 'rec-waste',
      title: 'Waste Segregation',
      desc: 'Separate organic wet waste from dry recyclables to prevent methane release.',
      category: 'waste',
      co2Saved: Math.round(wasteCo2Saved),
      moneySaved: 500,
      impact,
      difficulty,
      cost,
      confidence,
      reason: 'Landfills generate highly potent methane gases when organic waste decays in anaerobic conditions. Separation enables clean composting and recycling processing.',
      currentSituation: `Waste contributes ${Math.round((footprint.waste / total) * 100)}% of your footprint. Sorting habit is currently inactive, sending all household waste to open landfills.`,
      scoreGain: Math.max(1, Math.round((wasteCo2Saved / 18000) * 80))
    });
  }

  // 5. Sustainable shopping
  const fashionCo2Saved = habits.fast_fashion > 0 ? (habits.fast_fashion * 0.5 * EMISSION_FACTORS.shopping.fashion * 12) : 0;
  if (fashionCo2Saved > 0) {
    const impact = Math.min(10, Number((fashionCo2Saved / 25).toFixed(1)));
    const difficulty = 4;
    const cost = 2;
    const confidence = 8;
    actions.push({
      id: 'rec-shopping',
      title: 'Sustainable Shopping Choices',
      desc: 'Extend clothing lifecycles and buy fewer fast-fashion apparel items.',
      category: 'shopping',
      co2Saved: Math.round(fashionCo2Saved),
      moneySaved: Math.round(habits.fast_fashion * 0.5 * FINANCIAL_CONSTANTS.fast_fashion_cost * 12),
      impact,
      difficulty,
      cost,
      confidence,
      reason: 'Fast fashion production is deeply fossil-fuel intensive, requiring massive agricultural resources and industrial processing energy. Thrifting directly slows manufacturing demand.',
      currentSituation: `Shopping contributes ${Math.round((footprint.shopping / total) * 100)}% of your footprint, with apparel purchases accounting for ${Math.round(((habits.fast_fashion * EMISSION_FACTORS.shopping.fashion * 12) / (footprint.shopping || 1)) * 100)}% of it.`,
      scoreGain: Math.max(1, Math.round((fashionCo2Saved / 18000) * 80))
    });
  }

  // 6. Diet optimization
  let dietCo2Saved = 0;
  let nextDiet = 'vegan';
  if (habits.diet === 'high_meat') {
    dietCo2Saved = (EMISSION_FACTORS.food.high_meat - EMISSION_FACTORS.food.mixed);
    nextDiet = 'mixed';
  } else if (habits.diet === 'mixed') {
    dietCo2Saved = (EMISSION_FACTORS.food.mixed - EMISSION_FACTORS.food.vegan);
    nextDiet = 'vegan';
  }
  if (dietCo2Saved > 0) {
    const impact = Math.min(10, Number((dietCo2Saved / 120).toFixed(1)));
    const difficulty = 6;
    const cost = 3;
    const confidence = 10;
    actions.push({
      id: 'rec-diet',
      title: `Dietary Optimization to ${nextDiet.charAt(0).toUpperCase() + nextDiet.slice(1)}`,
      desc: `Transition your diet from ${habits.diet} to ${nextDiet} to cut agricultural supply chain emissions.`,
      category: 'food',
      co2Saved: Math.round(dietCo2Saved),
      moneySaved: habits.diet === 'high_meat' ? 2000 : 1000,
      impact,
      difficulty,
      cost,
      confidence,
      reason: 'Animal agricultural processes are responsible for massive land footprint, deforestation, and high methane emissions. Plant-based calories are significantly lower carbon intensity.',
      currentSituation: `Diet & Food contributes ${Math.round((footprint.food / total) * 100)}% of your overall footprint, heavily driven by your current ${habits.diet} dietary intake.`,
      scoreGain: Math.max(1, Math.round((dietCo2Saved / 18000) * 80))
    });
  }

  // Calculate Priority Score for each
  const scored = actions.map(act => {
    const priority = (act.impact * 0.5) + (act.confidence * 0.2) + ((10 - act.difficulty) * 0.2) + ((10 - act.cost) * 0.1);
    return {
      ...act,
      priority: Number(priority.toFixed(1))
    };
  });

  // Sort descending
  scored.sort((a, b) => b.priority - a.priority);

  return scored;
}
