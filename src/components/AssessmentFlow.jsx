import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function AssessmentFlow({ onComplete, initialHabits }) {
  const [step, setStep] = useState(1);
  const [habits, setHabits] = useState(initialHabits || {
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
  });

  const totalSteps = 6;

  const handleSliderChange = (key, val) => {
    setHabits(prev => ({ ...prev, [key]: Number(val) }));
  };

  const handleSelectChange = (key, val) => {
    setHabits(prev => ({ ...prev, [key]: val }));
  };

  const handleToggleChange = (key) => {
    setHabits(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      onComplete(habits);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="assessment-container" style={{ minHeight: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Progress header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>STEP {step} OF {totalSteps}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
            {step === 1 && 'Transportation'}
            {step === 2 && 'Diet & Meals'}
            {step === 3 && 'Home Energy'}
            {step === 4 && 'Shopping Habits'}
            {step === 5 && 'Waste & Recycling'}
            {step === 6 && 'Lifestyle & Work'}
          </span>
        </div>
        <div className="assessment-progress-bar">
          <div className="assessment-progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>

        {/* Step Content */}
        <div className="question-card">
          {/* STEP 1: TRANSPORT */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>How do you commute?</h2>
              <p style={{ marginBottom: '20px' }}>Select approximate weekly distances traveled by transport mode.</p>
              
              <div className="slider-container">
                <div className="slider-header">
                  <label htmlFor="slider-car" id="label-slider-car">🚗 Car Commute</label>
                  <span id="val-slider-car" className="slider-value">{habits.car} km/week</span>
                </div>
                <input 
                  id="slider-car"
                  type="range" min="0" max="300" step="10"
                  value={habits.car} onChange={e => handleSliderChange('car', e.target.value)} 
                  className="custom-range"
                  aria-describedby="val-slider-car"
                />
              </div>

              <div className="slider-container">
                <div className="slider-header">
                  <label htmlFor="slider-bike" id="label-slider-bike">🏍️ Motorcycle / Bike</label>
                  <span id="val-slider-bike" className="slider-value">{habits.bike} km/week</span>
                </div>
                <input 
                  id="slider-bike"
                  type="range" min="0" max="150" step="5"
                  value={habits.bike} onChange={e => handleSliderChange('bike', e.target.value)} 
                  className="custom-range"
                  aria-describedby="val-slider-bike"
                />
              </div>

              <div className="slider-container">
                <div className="slider-header">
                  <label htmlFor="slider-metro" id="label-slider-metro">🚇 Metro / Train</label>
                  <span id="val-slider-metro" className="slider-value">{habits.metro} km/week</span>
                </div>
                <input 
                  id="slider-metro"
                  type="range" min="0" max="200" step="10"
                  value={habits.metro} onChange={e => handleSliderChange('metro', e.target.value)} 
                  className="custom-range"
                  aria-describedby="val-slider-metro"
                />
              </div>

              <div className="slider-container">
                <div className="slider-header">
                  <label htmlFor="slider-bus" id="label-slider-bus">🚌 Bus Travel</label>
                  <span id="val-slider-bus" className="slider-value">{habits.bus} km/week</span>
                </div>
                <input 
                  id="slider-bus"
                  type="range" min="0" max="150" step="5"
                  value={habits.bus} onChange={e => handleSliderChange('bus', e.target.value)} 
                  className="custom-range"
                  aria-describedby="val-slider-bus"
                />
              </div>

              <div className="slider-container">
                <div className="slider-header">
                  <label htmlFor="slider-cab" id="label-slider-cab">🚕 Cabs / Ride-Shares</label>
                  <span id="val-slider-cab" className="slider-value">{habits.cab} km/week</span>
                </div>
                <input 
                  id="slider-cab"
                  type="range" min="0" max="100" step="5"
                  value={habits.cab} onChange={e => handleSliderChange('cab', e.target.value)} 
                  className="custom-range"
                  aria-describedby="val-slider-cab"
                />
              </div>

              <div className="slider-container">
                <div className="slider-header">
                  <label htmlFor="slider-flights" id="label-slider-flights">✈️ Flights Taken</label>
                  <span id="val-slider-flights" className="slider-value">{habits.flights} hours/year</span>
                </div>
                <input 
                  id="slider-flights"
                  type="range" min="0" max="80" step="2"
                  value={habits.flights} onChange={e => handleSliderChange('flights', e.target.value)} 
                  className="custom-range"
                  aria-describedby="val-slider-flights"
                />
              </div>
            </div>
          )}

          {/* STEP 2: DIET */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>What are your eating habits?</h2>
              <p style={{ marginBottom: '20px' }}>Diet is a heavy driver of global greenhouse gas emissions.</p>

              <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Your Diet Type:</h4>
              <div className="option-grid" style={{ gridTemplateCols: '1fr', gap: '8px', marginBottom: '24px' }}>
                <div 
                  className={`option-button ${habits.diet === 'vegan' ? 'option-button-selected' : ''}`}
                  onClick={() => handleSelectChange('diet', 'vegan')}
                  style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '14px', gap: '16px' }}
                >
                  <span className="option-icon" style={{ margin: 0 }}>🌱</span>
                  <div style={{ textAlign: 'left' }}>
                    <div className="option-label">Plant-Based / Veg</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vegetarian, Vegan, or mostly plant meals. Low carbon.</div>
                  </div>
                </div>

                <div 
                  className={`option-button ${habits.diet === 'mixed' ? 'option-button-selected' : ''}`}
                  onClick={() => handleSelectChange('diet', 'mixed')}
                  style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '14px', gap: '16px' }}
                >
                  <span className="option-icon" style={{ margin: 0 }}>🥗</span>
                  <div style={{ textAlign: 'left' }}>
                    <div className="option-label">Balanced / Mixed</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Moderate meat, poultry, seafood, dairy, and vegetables.</div>
                  </div>
                </div>

                <div 
                  className={`option-button ${habits.diet === 'high_meat' ? 'option-button-selected' : ''}`}
                  onClick={() => handleSelectChange('diet', 'high_meat')}
                  style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '14px', gap: '16px' }}
                >
                  <span className="option-icon" style={{ margin: 0 }}>🥩</span>
                  <div style={{ textAlign: 'left' }}>
                    <div className="option-label">High Meat Consumption</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Regular red meat (beef, pork, lamb) daily. High footprint.</div>
                  </div>
                </div>
              </div>

              <div className="slider-container">
                <div className="slider-header">
                  <label htmlFor="slider-food-delivery" id="label-slider-food-delivery">🛵 Food Deliveries (Zomato/Swiggy/Uber)</label>
                  <span id="val-slider-food-delivery" className="slider-value">{habits.food_delivery} orders/week</span>
                </div>
                <input 
                  id="slider-food-delivery"
                  type="range" min="0" max="15" step="1"
                  value={habits.food_delivery} onChange={e => handleSliderChange('food_delivery', e.target.value)} 
                  className="custom-range"
                  aria-describedby="val-slider-food-delivery"
                />
                <p style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--text-muted)' }}>
                  Delivery packaging and bike transit generate micro-emissions.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: HOME ENERGY */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Home energy & heating</h2>
              <p style={{ marginBottom: '20px' }}>Your home electrical profile impacts energy grid demands.</p>

              <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Monthly Electricity Usage:</h4>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['low', 'medium', 'high'].map(lvl => (
                  <button
                    key={lvl}
                    className={`btn ${habits.electricity === lvl ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, textTransform: 'capitalize', fontSize: '0.85rem', padding: '10px' }}
                    onClick={() => handleSelectChange('electricity', lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="slider-container">
                <div className="slider-header">
                  <label htmlFor="slider-ac-usage" id="label-slider-ac-usage">❄️ Air Conditioning (AC) Usage</label>
                  <span id="val-slider-ac-usage" className="slider-value">{habits.ac_usage} hours/day</span>
                </div>
                <input 
                  id="slider-ac-usage"
                  type="range" min="0" max="24" step="1"
                  value={habits.ac_usage} onChange={e => handleSliderChange('ac_usage', e.target.value)} 
                  className="custom-range"
                  aria-describedby="val-slider-ac-usage"
                />
              </div>

              <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Appliance Habits:</h4>
              <div className="option-grid" style={{ gridTemplateColumns: '1fr', gap: '8px' }}>
                {[
                  { id: 'efficient', icon: '⚡', title: 'Eco Smart', desc: '5-star energy devices, standby disabled, LEDs.' },
                  { id: 'standard', icon: '🔌', title: 'Standard', desc: 'Average appliances, occasionally left on standby.' },
                  { id: 'wasteful', icon: '🔴', title: 'Power Heavy', desc: 'Multiple devices active 24/7, high standby drain.' }
                ].map(item => (
                  <div
                    key={item.id}
                    className={`option-button ${habits.appliances === item.id ? 'option-button-selected' : ''}`}
                    onClick={() => handleSelectChange('appliances', item.id)}
                    style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '12px', gap: '12px' }}
                  >
                    <span className="option-icon" style={{ margin: 0, fontSize: '1.5rem' }}>{item.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div className="option-label" style={{ fontSize: '0.85rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: SHOPPING */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Shopping & Fashion</h2>
              <p style={{ marginBottom: '20px' }}>Manufacturing clothes and consumer tech results in heavy industrial output.</p>

              <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Online Shopping frequency:</h4>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['rarely', 'monthly', 'weekly'].map(freq => (
                  <button
                    key={freq}
                    className={`btn ${habits.online_freq === freq ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, textTransform: 'capitalize', fontSize: '0.85rem', padding: '10px' }}
                    onClick={() => handleSelectChange('online_freq', freq)}
                  >
                    {freq}
                  </button>
                ))}
              </div>

              <div className="slider-container">
                <div className="slider-header">
                  <label htmlFor="slider-fast-fashion" id="label-slider-fast-fashion">👕 Fast Fashion Clothes bought</label>
                  <span id="val-slider-fast-fashion" className="slider-value">{habits.fast_fashion} items/month</span>
                </div>
                <input 
                  id="slider-fast-fashion"
                  type="range" min="0" max="10" step="1"
                  value={habits.fast_fashion} onChange={e => handleSliderChange('fast_fashion', e.target.value)} 
                  className="custom-range"
                  aria-describedby="val-slider-fast-fashion"
                />
              </div>

              <div className="slider-container">
                <div className="slider-header">
                  <label htmlFor="slider-electronics" id="label-slider-electronics">📱 New Electronics purchased</label>
                  <span id="val-slider-electronics" className="slider-value">{habits.electronics} devices/year</span>
                </div>
                <input 
                  id="slider-electronics"
                  type="range" min="0" max="6" step="1"
                  value={habits.electronics} onChange={e => handleSliderChange('electronics', e.target.value)} 
                  className="custom-range"
                  aria-describedby="val-slider-electronics"
                />
                <p style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--text-muted)' }}>
                  Includes smartphones, tablets, laptops, gaming systems.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: WASTE */}
          {step === 5 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Waste & Recycling</h2>
              <p style={{ marginBottom: '20px' }}>How you dispose of refuse changes how much lands in methane-heavy landfills.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
                {[
                  { id: 'recycling', icon: '♻️', label: 'I regularly recycle plastics, metals, paper' },
                  { id: 'reuse', icon: '🛍️', label: 'I bring reusable bags and coffee cups' },
                  { id: 'separation', icon: '🗑️', label: 'I separate wet (organic) and dry waste' }
                ].map(item => (
                  <div 
                    key={item.id} 
                    className={`card ${habits[item.id] ? 'option-button-selected' : ''}`}
                    onClick={() => handleToggleChange(item.id)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px', 
                      cursor: 'pointer',
                      padding: '16px',
                      margin: 0,
                      borderWidth: habits[item.id] ? '2px' : '1px',
                      borderColor: habits[item.id] ? 'var(--primary)' : 'var(--border)'
                    }}
                  >
                    <span style={{ fontSize: '1.75rem' }}>{item.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', flex: 1 }}>{item.label}</span>
                    <div className={`mission-checkbox ${habits[item.id] ? 'mission-checked' : ''}`} style={{ marginTop: 0 }}>
                      {habits[item.id] && '✓'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: LIFESTYLE & WORK */}
          {step === 6 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Lifestyle & Work</h2>
              <p style={{ marginBottom: '20px' }}>Finalize your routine profile for commuter discounts and baseline averages.</p>

              <div className="slider-container">
                <div className="slider-header">
                  <label htmlFor="slider-wfh-days" id="label-slider-wfh-days">🏠 Work From Home (WFH)</label>
                  <span id="val-slider-wfh-days" className="slider-value">{habits.wfh_days} days/week</span>
                </div>
                <input 
                  id="slider-wfh-days"
                  type="range" min="0" max="5" step="1"
                  value={habits.wfh_days} onChange={e => handleSliderChange('wfh_days', e.target.value)} 
                  className="custom-range"
                  aria-describedby="val-slider-wfh-days"
                />
                <p style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--text-muted)' }}>
                  WFH days apply a reduction percentage to your transportation footprint.
                </p>
              </div>

              <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', marginTop: '20px' }}>Overall leisure/travel profile:</h4>
              <p style={{ fontSize: '0.75rem', marginBottom: '12px' }}>This accounts for weekend trips, leisure driving, and dining out.</p>
              
              <div className="option-grid" style={{ gridTemplateCols: '1fr', gap: '8px' }}>
                {[
                  { id: 'low', label: 'Low Footprint', desc: 'Rarely travel for leisure, stay local, shop minimal.' },
                  { id: 'medium', label: 'Moderate Lifestyle', desc: 'Occasional weekend road trips, moderate shopping.' },
                  { id: 'high', label: 'Active Lifestyle', desc: 'Frequent long-distance trips, luxury shopping, active dining.' }
                ].map(lvl => (
                  <div
                    key={lvl.id}
                    className={`option-button ${habits.travel_freq === lvl.id ? 'option-button-selected' : ''}`}
                    onClick={() => handleSelectChange('travel_freq', lvl.id)}
                    style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px' }}
                  >
                    <div className="option-label" style={{ fontSize: '0.85rem' }}>{lvl.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'left' }}>{lvl.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Nav Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
        {step > 1 && (
          <button className="btn btn-secondary" onClick={prevStep} style={{ flex: '0.4' }}>
            <ArrowLeft size={18} /> Back
          </button>
        )}
        <button className="btn btn-primary" onClick={nextStep} style={{ flex: 1 }}>
          {step === totalSteps ? 'Calculate Footprint' : 'Next'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
