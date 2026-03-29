import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../api';
import { FaRobot, FaBolt, FaCheckCircle, FaArrowRight, FaMicrophone, FaStop } from 'react-icons/fa';

export default function FoodForm({ onSubmit }) {
  const [rawText, setRawText] = useState('');
  const [nlpResult, setNlpResult] = useState(null);
  const [spoilageResult, setSpoilageResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [form, setForm] = useState({
    title: '', description: '', food_category: 'cooked',
    quantity_kg: 5, serves: 10, storage_type: 'room_temp',
    transport_mode: 'receiver_picks_up',
    latitude: 13.01 + Math.random() * 0.08,
    longitude: 80.18 + Math.random() * 0.08,
  });

  // Web Speech API setup
  const speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = () => {
    if (!speechSupported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    let finalTranscript = rawText;
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setRawText(finalTranscript + interim);
    };

    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setAnalyzing(true);
    try {
      const nlpRes = await aiAPI.categorize({ text: rawText });
      setNlpResult(nlpRes.data);

      const category = nlpRes.data.food_category || 'cooked';
      const qty = nlpRes.data.estimated_quantity_kg || 5;
      const autoTitle = rawText.substring(0, 60) + (rawText.length > 60 ? '...' : '');

      const spoilRes = await aiAPI.spoilage({
        food_category: category,
        storage_type: nlpRes.data.recommended_storage || 'room_temp',
        hours_since_preparation: 1,
        ambient_temperature: 32,
      });

      setForm(prev => ({
        ...prev,
        title: autoTitle,
        description: rawText,
        food_category: category,
        quantity_kg: qty,
        storage_type: nlpRes.data.recommended_storage || prev.storage_type,
        serves: nlpRes.data.estimated_serves || Math.max(1, Math.round(qty * 3)),
        // The donor just needs to confirm these, not re-enter them
      }));

      setSpoilageResult(spoilRes.data);
      setShowForm(true);
    } catch (err) {
      console.error(err);
    }
    setAnalyzing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      quantity_kg: parseFloat(form.quantity_kg),
      serves: parseInt(form.serves),
    });
    setRawText('');
    setNlpResult(null);
    setSpoilageResult(null);
    setShowForm(false);
  };

  return (
    <div>
      {/* NLP Hero Input */}
      <div className="card" style={{ borderColor: 'var(--border-hover)', background: 'linear-gradient(135deg, var(--bg-card), rgba(16,185,129,0.05))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <FaRobot style={{ color: 'var(--green-400)', fontSize: '1.3rem' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
            AI Food Analyzer
          </h3>
          <span className="badge badge-info" style={{ marginLeft: 'auto' }}>NLP + RandomForest</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Describe your surplus food in plain language — or use the mic 🎤. Our NLP engine auto-extracts category, quantity, and predicts spoilage risk.
        </p>
        <div style={{ position: 'relative' }}>
          <textarea
            className="form-control"
            rows="3"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder='e.g., "We have 20 rotis and 5 kg leftover dal from a wedding reception, plus some gulab jamun"'
            style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}
          />

          {/* Prominent Voice AI Button */}
          {speechSupported ? (
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: listening ? '2px solid transparent' : '1px solid var(--border-hover)',
                background: listening ? 'linear-gradient(45deg, #ef4444, #dc2626)' : 'var(--bg-surface)',
                color: listening ? 'white' : 'var(--text-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                cursor: 'pointer',
                animation: listening ? 'pulse-glow 1.5s infinite' : 'none',
                boxShadow: listening ? '0 0 15px rgba(239,68,68,0.4)' : 'none',
                transition: 'all 0.3s'
              }}
            >
              {listening ? <FaStop /> : <FaMicrophone style={{ color: 'var(--green-400)' }} />}
              {listening ? 'Listening... Tap to Stop' : 'Tap to Speak (Voice AI)'}
            </button>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              💡 Voice input available in Chrome. Use text input in other browsers.
            </div>
          )}
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleAnalyze}
          disabled={analyzing || !rawText.trim()}
          style={{ width: '100%', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
        >
          {analyzing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.2)',
                borderTopColor: '#ffffff',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span>Running NLP + Spoilage Pipeline...</span>
            </div>
          ) : (
            <><FaBolt /> Analyze with AI</>
          )}
        </button>
        {analyzing && (
          <div className="animate-in" style={{
            marginTop: '0.75rem', padding: '0.75rem 1rem',
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: '0.4rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
              <span style={{ color: '#4ade80' }}>✓</span>
              <span style={{ color: 'var(--text-secondary)' }}>TF-IDF keyword extraction...</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%',
                border: '2px solid rgba(74,222,128,0.3)',
                borderTopColor: '#4ade80',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ color: 'var(--text-muted)' }}>RandomForest spoilage prediction...</span>
            </div>
          </div>
        )}
      </div>

      {/* Example AI Output Preview — shown before first analysis */}
      {!nlpResult && !analyzing && (
        <div className="card mt-2" style={{ borderColor: 'var(--border)', opacity: 0.7, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '0.5rem', right: '0.75rem', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.05em', background: 'var(--bg-card)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
            EXAMPLE OUTPUT
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <FaRobot style={{ color: 'var(--green-400)' }} /> AI Analysis Preview
            <span style={{ fontFamily: 'var(--font-mono)', color: '#4ade80', marginLeft: 'auto', fontSize: '0.85rem' }}>87% conf</span>
          </h3>
          <div className="grid grid-3" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>CATEGORY</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--green-300)' }}>Cooked Indian</div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>EST. WEIGHT</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--green-300)' }}>8–12 kg</div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>SERVES</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--green-300)' }}>~32 people</div>
            </div>
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem' }}>
            <span style={{ color: '#fbbf24' }}>⚠️</span>
            <span style={{ color: 'var(--text-secondary)' }}>Spoilage alert: Redistribute within <strong style={{ color: '#fbbf24' }}>4 hours</strong></span>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-dim)' }}>3 nearby receivers pre-alerted</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>
            Type or speak your food description above to see real AI analysis →
          </p>
        </div>
      )}

      {/* NLP + Spoilage Results */}
      {nlpResult && (
        <div className="card mt-2 animate-in" style={{ borderColor: 'var(--green-600)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaRobot style={{ color: 'var(--green-400)' }} /> AI Detection Results
          </h3>
          <div className="grid grid-3" style={{ gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>FOOD TYPE</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--green-300)' }}>
                {nlpResult.food_category || 'Unknown'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>QUANTITY</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--green-300)' }}>
                ~{nlpResult.estimated_quantity_kg || '?'} kg
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>ITEMS DETECTED</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--green-300)' }}>
                {nlpResult.detected_items?.length || 0} items
              </div>
            </div>
          </div>
          
          {nlpResult.detected_items?.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {nlpResult.detected_items.map((item, i) => (
                <span key={i} className="badge badge-success">{item}</span>
              ))}
            </div>
          )}

          {/* Spoilage inline */}
          {spoilageResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>RISK LEVEL</div>
                  <span className={`badge ${spoilageResult.risk_level === 'low' ? 'badge-success' : spoilageResult.risk_level === 'medium' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem' }}>
                    {spoilageResult.risk_level === 'low' ? '✅' : spoilageResult.risk_level === 'medium' ? '⚠️' : '🚫'} {spoilageResult.risk_level?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CONFIDENCE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green-300)' }}>
                    {Math.round((spoilageResult.confidence || 0.85) * 100)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>WINDOW</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {spoilageResult.redistribute_within_hours}h remaining
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MODEL</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {spoilageResult.model_used || 'RandomForest'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pre-filled Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card mt-2 animate-in">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaCheckCircle style={{ color: 'var(--green-400)' }} /> Confirm & List
          </h3>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Title</label>
              <input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Category (AI-detected)</label>
              <select className="form-control" value={form.food_category} onChange={e => setForm({...form, food_category: e.target.value})}>
                <option value="cooked">🍛 Cooked</option>
                <option value="raw">🥩 Raw</option>
                <option value="packaged">📦 Packaged</option>
                <option value="dairy">🥛 Dairy</option>
                <option value="bakery">🍞 Bakery</option>
                <option value="fruits_vegetables">🥦 Fruits & Vegetables</option>
                <option value="beverages">🧃 Beverages</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity (kg)</label>
              <input className="form-control" type="number" step="0.5" min="0.5" value={form.quantity_kg} onChange={e => setForm({...form, quantity_kg: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Serves (people)</label>
              <input className="form-control" type="number" min="1" value={form.serves} onChange={e => setForm({...form, serves: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Storage</label>
              <select className="form-control" value={form.storage_type} onChange={e => setForm({...form, storage_type: e.target.value})}>
                <option value="room_temp">🌡️ Room Temperature</option>
                <option value="refrigerated">❄️ Refrigerated</option>
                <option value="frozen">🧊 Frozen</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transport</label>
              <select className="form-control" value={form.transport_mode} onChange={e => setForm({...form, transport_mode: e.target.value})}>
                <option value="receiver_picks_up">📍 Receiver picks up</option>
                <option value="donor_delivers">🚚 I will deliver</option>
                <option value="both">🤝 Either works</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg mt-2" style={{ width: '100%', justifyContent: 'center' }}>
            🍱 List This Food <FaArrowRight />
          </button>
        </form>
      )}
    </div>
  );
}
