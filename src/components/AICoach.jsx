import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, Check, Plus, Calculator, Terminal } from 'lucide-react';
import { getAIResponse, getCoachInsights, calculateFootprint } from '../utils/carbonCalculations';

const getUniqueId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

export default function AICoach({ habits, onAddMission }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [addedActions, setAddedActions] = useState({});
  const [expandedTraceId, setExpandedTraceId] = useState(null);

  const messagesEndRef = useRef(null);
  const insights = getCoachInsights(habits);
  const footprint = calculateFootprint(habits);

  // Initialize with introductory advice based on user habits
  useEffect(() => {
    const typingTimer = setTimeout(() => {
      setIsTyping(true);
    }, 0);
    const timer = setTimeout(() => {
      const initialResponse = getAIResponse(habits, '');
      setMessages([
        {
          id: 'm-init',
          sender: 'ai',
          text: initialResponse.reply,
          actions: initialResponse.actions || [],
          reasoningTrace: initialResponse.reasoningTrace
        }
      ]);
      setIsTyping(false);
    }, 600);
    return () => {
      clearTimeout(typingTimer);
      clearTimeout(timer);
    };
  }, [habits]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: getUniqueId('u'),
      sender: 'user',
      text: text
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = getAIResponse(habits, text);
      const aiMsg = {
        id: getUniqueId('ai'),
        sender: 'ai',
        text: response.reply,
        actions: response.actions || [],
        reasoningTrace: response.reasoningTrace
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleAddAction = (actionText, actionId) => {
    let carbonSaved = 3.5;
    let xp = 40;
    let moneySaved = 100;

    const co2Match = actionText.match(/saves?\s+([\d.]+)\s*kg/i);
    const xpMatch = actionText.match(/\+(\d+)\s*XP/i);
    const moneyMatch = actionText.match(/saves?\s*₹?(\d+)/i);

    if (co2Match) carbonSaved = parseFloat(co2Match[1]);
    if (xpMatch) xp = parseInt(xpMatch[1]);
    if (moneyMatch) moneySaved = parseInt(moneyMatch[1]);

    const title = actionText.split(':')[0].trim().substring(0, 30);

    onAddMission({
      title: title.length > 0 ? title : "Eco Challenge",
      desc: actionText,
      xp,
      carbonSaved,
      moneySaved,
      category: 'coach'
    });

    setAddedActions(prev => ({ ...prev, [actionId]: true }));
  };

  const quickQuestions = [
    "What is my biggest problem?",
    "What should I change first?",
    "What is the easiest improvement?",
    "How can a student reduce emissions?",
    "Show me a 30-day plan",
    "How much money can I save?"
  ];

  // Calculate potential savings based on best adjustments
  const estYearlyCashSaved = Math.round(
    (habits.food_delivery > 1 ? 1.5 * 180 * 52 : 0) +
    (habits.car > 40 ? habits.car * 0.2 * 6 * 52 : 0) +
    (habits.ac_usage > 3 ? 1 * 1.38 * 8 * 365 : 0)
  ) || 4500;

  const estYearlyCo2Saved = Math.round(
    (habits.food_delivery > 1 ? 1.5 * 0.5 * 52 : 0) +
    (habits.car > 40 ? habits.car * 0.2 * 0.15 * 52 : 0) +
    (habits.ac_usage > 3 ? 1 * 1.1 * 365 : 0)
  ) || 120;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ai-blue)' }}>
          <span style={{ position: 'relative', display: 'inline-flex', height: '12px', width: '12px', marginRight: '6px' }}>
            <span className="ai-ping" style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: 'var(--accent-green)', opacity: 0.75 }}></span>
            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '12px', width: '12px', backgroundColor: 'var(--success)' }}></span>
          </span>
          <MessageSquare style={{ color: 'var(--ai-blue)' }} /> Your Personal Climate AI
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Futuristic Climate Intelligence Platform. Consult your personal AI on carbon reduction paths.
        </p>
      </div>

      {/* Desktop Responsive Layout container */}
      <div className="coach-desktop-container">
        
        {/* LEFT COLUMN: Chat Panel History & Input */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '620px', 
          backgroundColor: 'var(--surface-card)', 
          border: '1px solid var(--ai-blue)', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: 'var(--shadow-ai)',
          transition: 'var(--transition)'
        }}>
          {/* Chat Messages */}
          <div className="chat-messages" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '6px' }}>
                <div className={`message-bubble ${msg.sender === 'ai' ? 'message-ai' : 'message-user'}`}>
                  <div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', lineHeight: 1.5 }}>{msg.text}</div>
                </div>

                {/* Render reasoning trace if available */}
                {msg.sender === 'ai' && msg.reasoningTrace && (
                  <div style={{ maxWidth: '85%', marginBottom: '8px' }}>
                    <button 
                      onClick={() => setExpandedTraceId(expandedTraceId === msg.id ? null : msg.id)}
                      style={{
                        background: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--surface-hover)',
                        border: '1px solid var(--border)',
                        transition: 'var(--transition)'
                      }}
                    >
                      <Terminal size={12} /> {expandedTraceId === msg.id ? "Hide AI Reasoning Trace" : "🔍 View AI Reasoning Trace"}
                    </button>

                    {expandedTraceId === msg.id && (
                      <div className="reasoning-trace-console" style={{
                        marginTop: '8px',
                        padding: '12px 14px',
                        backgroundColor: '#0F172A',
                        border: '1px solid rgba(82, 183, 136, 0.4)',
                        borderRadius: '10px',
                        fontFamily: 'Consolas, monaco, monospace',
                        fontSize: '0.7rem',
                        color: '#34D399',
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)',
                        animation: 'fadeIn 0.25s ease-out',
                        lineHeight: 1.45
                      }}>
                        {/* INPUTS SECTION */}
                        <div style={{ marginBottom: '8px', borderBottom: '1px dashed rgba(52, 211, 153, 0.2)', paddingBottom: '6px' }}>
                          <span style={{ color: '#F43F5E', fontWeight: 'bold' }}>&gt; INPUTS_EXTRACTED:</span>
                          <div style={{ paddingLeft: '10px', color: '#94A3B8' }}>
                            • Query Intent: "{msg.reasoningTrace.inputs.intentExtracted}"<br />
                            • Context Parameters: car={msg.reasoningTrace.inputs.contextHabits.carKmWeekly}km/wk | diet={msg.reasoningTrace.inputs.contextHabits.dietType} | deliveries={msg.reasoningTrace.inputs.contextHabits.deliveryCountWeekly}/wk | AC={msg.reasoningTrace.inputs.contextHabits.acHoursDaily}hrs/day | separating={msg.reasoningTrace.inputs.contextHabits.wasteSortingActive ? "YES" : "NO"}
                          </div>
                        </div>

                        {/* ANALYSIS SECTION */}
                        <div style={{ marginBottom: '8px', borderBottom: '1px dashed rgba(52, 211, 153, 0.2)', paddingBottom: '6px' }}>
                          <span style={{ color: '#FB923C', fontWeight: 'bold' }}>&gt; DIAGNOSTICS_ANALYSIS:</span>
                          <div style={{ paddingLeft: '10px', color: '#94A3B8' }}>
                            • Total Annual Footprint: {msg.reasoningTrace.analysis.totalEmissionsTons} metric tons CO₂e ({msg.reasoningTrace.analysis.totalEmissionsKg} kg)<br />
                            • Primary Emitter: {msg.reasoningTrace.analysis.highestContributor} ({msg.reasoningTrace.analysis.categoryPercent}% weight share)
                          </div>
                        </div>

                        {/* PRIORITIZATION SECTION */}
                        <div style={{ marginBottom: '8px', borderBottom: '1px dashed rgba(52, 211, 153, 0.2)', paddingBottom: '6px' }}>
                          <span style={{ color: '#60A5FA', fontWeight: 'bold' }}>&gt; SCENARIO_PRIORITIZATION (Priority Score Model):</span>
                          <table style={{ width: '100%', margin: '4px 0', fontSize: '0.65rem', borderCollapse: 'collapse', color: '#94A3B8' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid rgba(52, 211, 153, 0.15)', color: '#38BDF8' }}>
                                <th style={{ textAlign: 'left', padding: '2px 0' }}>Pathway</th>
                                <th style={{ textAlign: 'center' }}>Imp</th>
                                <th style={{ textAlign: 'center' }}>Diff</th>
                                <th style={{ textAlign: 'center' }}>Cost</th>
                                <th style={{ textAlign: 'center' }}>Conf</th>
                                <th style={{ textAlign: 'right' }}>Priority</th>
                              </tr>
                            </thead>
                            <tbody>
                              {msg.reasoningTrace.prioritization.map((p, idx) => (
                                <tr key={idx} style={{ color: idx === 0 ? '#34D399' : '#94A3B8' }}>
                                  <td style={{ padding: '2px 0' }}>{p.pathway}</td>
                                  <td style={{ textAlign: 'center' }}>{p.impactScore}</td>
                                  <td style={{ textAlign: 'center' }}>{p.difficultyScore}</td>
                                  <td style={{ textAlign: 'center' }}>{p.costScore}</td>
                                  <td style={{ textAlign: 'center' }}>{p.confidenceScore}</td>
                                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{p.priorityIndex}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <span style={{ fontSize: '0.58rem', color: '#64748B', display: 'block', marginTop: '2px' }}>
                            * Priority = (Impact × 0.5) + (Confidence × 0.2) + ((10 - Difficulty) × 0.2) + ((10 - Cost) × 0.1)
                          </span>
                        </div>

                        {/* DECISION SECTION */}
                        <div style={{ marginBottom: '8px', borderBottom: '1px dashed rgba(52, 211, 153, 0.2)', paddingBottom: '6px' }}>
                          <span style={{ color: '#A78BFA', fontWeight: 'bold' }}>&gt; DECISION_LOG:</span>
                          <div style={{ paddingLeft: '10px', color: '#94A3B8' }}>
                            • Selected Decision: {msg.reasoningTrace.decision.selectedPathway}<br />
                            • Decision Rationale: {msg.reasoningTrace.decision.rationale}<br />
                            • Alternatives Evaluated: {msg.reasoningTrace.decision.alternativeEvaluated}
                          </div>
                        </div>

                        {/* EXPLANATION SECTION */}
                        <div style={{ marginBottom: '8px', borderBottom: '1px dashed rgba(52, 211, 153, 0.2)', paddingBottom: '6px' }}>
                          <span style={{ color: '#F472B6', fontWeight: 'bold' }}>&gt; MATH_EXPLANATION:</span>
                          <div style={{ paddingLeft: '10px', color: '#94A3B8' }}>
                            • Offset Impact: -{msg.reasoningTrace.explanation.co2SavedKg} kg CO₂/yr (+{msg.reasoningTrace.explanation.scoreGainPoints} score gain points)<br />
                            • Monetary Offset: ₹{msg.reasoningTrace.explanation.moneySavedRs.toLocaleString()}/yr saved
                          </div>
                        </div>

                        {/* FUTURE IMPACT SECTION */}
                        <div>
                          <span style={{ color: '#2DD4BF', fontWeight: 'bold' }}>&gt; FUTURE_IMPACT_PROJECTIONS (5-Year Compound Outlook):</span>
                          <div style={{ paddingLeft: '10px', color: '#94A3B8' }}>
                            • Cumulative carbon prevented: {msg.reasoningTrace.futureImpact.fiveYearCo2DivertedTons} tons CO₂e<br />
                            • Total utility cash saved: ₹{msg.reasoningTrace.futureImpact.fiveYearRupeesSaved}<br />
                            • Environmental equivalence: {msg.reasoningTrace.futureImpact.treesPlantedEquivalent} community trees planted
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Render actions as clickable cards if generated by AI */}
                {msg.sender === 'ai' && msg.actions && msg.actions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '4px 0 12px 0', maxWidth: '85%' }}>
                    {msg.actions.map((act) => {
                      const isAdded = addedActions[act.id];
                      return (
                        <div 
                          key={act.id} 
                          className="message-action-card"
                          style={{ 
                            borderColor: isAdded ? 'var(--border)' : 'var(--primary)',
                            opacity: isAdded ? 0.75 : 1,
                            padding: '10px',
                            background: 'var(--surface-card)',
                            borderRadius: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '10px',
                            borderWidth: '1px',
                            borderStyle: 'solid'
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{act.text}</span>
                          <button 
                            onClick={() => !isAdded && handleAddAction(act.text, act.id)}
                            style={{
                              backgroundColor: isAdded ? 'var(--border)' : 'var(--primary)',
                              border: 'none',
                              borderRadius: '6px',
                              width: '28px',
                              height: '28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isAdded ? 'var(--text-muted)' : '#FFFFFF',
                              cursor: isAdded ? 'default' : 'pointer',
                              flexShrink: 0
                            }}
                            title={isAdded ? "Added to missions" : "Add to missions"}
                          >
                            {isAdded ? <Check size={14} /> : <Plus size={14} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message-bubble message-ai" style={{ display: 'flex', gap: '4px', padding: '12px 20px', width: '60px' }}>
                <span className="dot-typing" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block', animation: 'float 1s infinite' }}></span>
                <span className="dot-typing" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block', animation: 'float 1s infinite 0.2s' }}></span>
                <span className="dot-typing" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block', animation: 'float 1s infinite 0.4s' }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions chips */}
          <div className="chat-suggestions" style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface-hover)' }}>
            {quickQuestions.map((q, idx) => (
              <button 
                key={idx} 
                className="suggestion-chip"
                onClick={() => handleSendMessage(q)}
                style={{ 
                  fontSize: '0.72rem', 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  backgroundColor: 'var(--surface-card)', 
                  color: 'var(--text-primary)', 
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                💡 {q}
              </button>
            ))}
          </div>

          {/* Message input */}
          <div className="chat-input-row" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <input
              type="text"
              className="chat-input"
              placeholder="Ask your climate companion..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputVal)}
            />
            <button 
              className="btn btn-primary"
              style={{ width: '45px', height: '45px', padding: 0, borderRadius: '12px' }}
              onClick={() => handleSendMessage(inputVal)}
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Diagnostics Sidebar Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* AI Diagnostics Card */}
          <div className="card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            borderLeft: '4px solid var(--ai-blue)', 
            background: 'linear-gradient(135deg, rgba(29, 53, 87, 0.06) 0%, rgba(69, 123, 157, 0.02) 100%)', 
            margin: 0,
            boxShadow: 'var(--shadow-md)'
          }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ai-blue)' }}>
              <Sparkles size={14} /> AI Companion Diagnostics
            </h3>
            <div style={{ margin: '6px 0' }}>
              <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Highest Footprint Area</span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--error)' }}>
                {insights.sourceName} ({insights.sourcePercent}%)
              </div>
            </div>
            <div style={{ margin: '4px 0' }}>
              <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Best Quick Action</span>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                {insights.bestAction}
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '6px' }}>
              {insights.explanation}
            </p>
          </div>

          {/* User Footprint Summary */}
          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px' }}>User Footprint Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Transportation', value: footprint.transportation, color: 'var(--secondary)', icon: '🚗' },
                { label: 'Diet & Food', value: footprint.food, color: 'var(--primary)', icon: '🥗' },
                { label: 'Home Energy', value: footprint.energy, color: 'var(--accent)', icon: '⚡' },
                { label: 'Shopping', value: footprint.shopping, color: '#ec4899', icon: '🛍️' }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span>{item.icon} {item.label}</span>
                  <span style={{ fontWeight: 700 }}>{(item.value / 1000).toFixed(1)} t CO₂e / yr</span>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Calculator Card */}
          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calculator size={16} style={{ color: 'var(--primary)' }} /> Projected Savings Calculator
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Weekly savings:</span>
                <span style={{ fontWeight: 800, color: 'var(--success)' }}>₹{Math.round(estYearlyCashSaved / 52)} / {Math.round(estYearlyCo2Saved / 52)} kg CO₂</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly savings:</span>
                <span style={{ fontWeight: 800, color: 'var(--success)' }}>₹{Math.round(estYearlyCashSaved / 12)} / {Math.round(estYearlyCo2Saved / 12)} kg CO₂</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', borderTop: '1px dashed var(--border)', paddingTop: '8px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Yearly target:</span>
                <span style={{ fontWeight: 900, color: 'var(--success)' }}>₹{estYearlyCashSaved.toLocaleString()} / {estYearlyCo2Saved} kg CO₂</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
