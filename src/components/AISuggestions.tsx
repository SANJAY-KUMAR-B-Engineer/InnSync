/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  Lightbulb, 
  ArrowRight, 
  Radio, 
  Mic, 
  MicOff, 
  Volume2, 
  Wrench,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  HelpCircle
} from "lucide-react";

interface AISuggestionsProps {
  onAddTicket: (ticket: any) => Promise<void>;
}

export default function AISuggestions({
  onAddTicket
}: AISuggestionsProps) {
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [aiModel, setAiModel] = React.useState("");

  // Speech simulation states
  const [isRecording, setIsRecording] = React.useState(false);
  const [voiceTranscript, setVoiceTranscript] = React.useState("");
  const [parsingVoice, setParsingVoice] = React.useState(false);
  const [parsedTicket, setParsedTicket] = React.useState<any | null>(null);

  const fetchAISuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch("/api/gemini/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setAiModel(data.aiModel || "gemini-3.5-flash");
    } catch (err) {
      console.error("Failed fetching suggestions: ", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  React.useEffect(() => {
    fetchAISuggestions();
  }, []);

  const simulateSpeechNote = (textPreset: string) => {
    setIsRecording(true);
    setVoiceTranscript("");
    setParsedTicket(null);
    
    // Simulate speech-to-text typing effect
    let currentIdx = 0;
    const interval = setInterval(() => {
      setVoiceTranscript(prev => prev + textPreset[currentIdx]);
      currentIdx++;
      if (currentIdx >= textPreset.length) {
        clearInterval(interval);
        setIsRecording(false);
      }
    }, 40);
  };

  const parseTranscriptWithGemini = async () => {
    if (!voiceTranscript) return;
    setParsingVoice(true);
    try {
      const response = await fetch("/api/gemini/parse-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: voiceTranscript })
      });
      const data = await response.json();
      setParsedTicket(data.parsed);
    } catch (err) {
      console.error("AI Parser failed: ", err);
    } finally {
      setParsingVoice(false);
    }
  };

  const dispatchParsedTicket = async () => {
    if (!parsedTicket) return;
    try {
      await onAddTicket({
        system: parsedTicket.system,
        roomNumber: parsedTicket.roomNumber,
        issue: parsedTicket.issue,
        priority: parsedTicket.priority,
        assignedTechnician: parsedTicket.assignedTechnician
      });
      alert(`SUCCESS: Structured ticket dispatched for System: ${parsedTicket.system} / Room: ${parsedTicket.roomNumber || "Common Sector"}`);
      setParsedTicket(null);
      setVoiceTranscript("");
    } catch (err) {
      console.error(err);
    }
  };

  const preloadedVoiceScripts = [
    "AC in deluxe room 105 is clicking loudly and blowing warm air again",
    "Water has puddle forming behind elevator B shafts. Emergency leak!",
    "WiFi signal repeatedly disconnecting on Floor 3 corridor access point",
  ];

  return (
    <div id="ai-view-root" className="space-y-6 max-w-5xl mx-auto font-sans text-zinc-950">
      
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-250 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-purple-950 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-600" />
            <span>Aura AI Advisor Operations Console</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">GEMINI GENERATIVE SUMMARIES • NATURAL LANGUAGE PARSING • REAL-TIME INTELLIGENCE</p>
        </div>

        <button
          onClick={fetchAISuggestions}
          disabled={loadingSuggestions}
          className="flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition"
        >
          {loadingSuggestions ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Querying Gemini Models...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate Operations Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Main double column split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column (Column span 3): Operations Advisor Insights */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-150">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-purple-600 animate-pulse" />
                <span>Executive AI Recommendations</span>
              </h3>
              <span className="text-[9px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded leading-none uppercase">
                Model: {aiModel}
              </span>
            </div>

            {loadingSuggestions ? (
              <div className="space-y-4 py-8">
                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-600 animate-spin">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div className="text-center text-xs text-zinc-500 font-mono">
                  Compiling room datasets, occupancy profiles, and sensor logs...
                </div>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-12 text-center text-zinc-400">
                <p className="text-xs">No active suggestions compiled currently.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((s, idx) => (
                  <div key={idx} className="p-4 bg-purple-50/40 border border-purple-100 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase ${
                        s.priority === "High" ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {s.priority} Priority
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono uppercase font-semibold">
                        Impact: {s.impact}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-purple-950 font-sans">{s.insight}</h4>
                    
                    <div className="p-3 bg-white border border-purple-100/60 rounded-lg text-xs text-zinc-700 font-sans leading-relaxed">
                      💡 <b className="text-purple-900 font-extrabold">Action Plan:</b> {s.recom}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Column span 2): Voice Note Uploader simulator */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-950 text-white rounded-xl p-5 border border-zinc-850 space-y-4 shadow-md">
            <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-purple-400 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              <span>Spoken Issue Recorder (Vocal OCR)</span>
            </span>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Simulate a frontdesk spoken report or housekeeper walkie-talkie transcription. Gemini compiles the text immediately and structures a physical ticket:
            </p>

            {/* Simulated preset buttons */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold">Incorporate Mock Vocal Inputs:</span>
              {preloadedVoiceScripts.map((script, idx) => (
                <button
                  key={idx}
                  onClick={() => simulateSpeechNote(script)}
                  disabled={isRecording}
                  className="w-full text-left p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10px] text-zinc-350 truncate hover:text-white transition cursor-pointer"
                >
                  🎧 "{script}"
                </button>
              ))}
            </div>

            {/* Vocal visualizer wave if recording */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 h-8 pt-1">
                {[1,2,3,4,5,6,5,4,3,2,1].map((val, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-purple-500 rounded-full animate-pulse" 
                    style={{ height: `${val * 15}%`, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            )}

            {/* Transcript text zone */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">TRANSCRIPT TEXT PREVIEW</label>
              <textarea
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                placeholder="Text transcript from spoken walkie-talkie audio feed..."
                className="w-full text-xs p-3 bg-zinc-900 border border-zinc-850 rounded-lg text-zinc-200 outline-none resize-none"
                rows={3}
              />
            </div>

            {/* Compiler trigger */}
            <button
              onClick={parseTranscriptWithGemini}
              disabled={parsingVoice || !voiceTranscript}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/40 text-white font-semibold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{parsingVoice ? "AI Structuring Ticket..." : "Analyze Transcript \& Compile Ticket"}</span>
            </button>

            {/* Display parsed result and dispatch lever */}
            {parsedTicket && (
              <div className="p-4 bg-zinc-900 border border-purple-800/40 rounded-xl space-y-3">
                <span className="text-[10px] font-mono text-purple-400 block font-bold uppercase">PARSED WORK ticket</span>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-zinc-850 pb-1 text-zinc-400">
                    <span>Target system:</span>
                    <span className="font-mono font-bold text-white">{parsedTicket.system}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-850 pb-1 text-zinc-400">
                    <span>Allocated Room:</span>
                    <span className="text-white font-semibold">Room {parsedTicket.roomNumber || "Common"}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-850 pb-1 text-zinc-400">
                    <span>Suggested Prio:</span>
                    <span className="text-white font-semibold">{parsedTicket.priority}</span>
                  </div>
                  <div className="space-y-1 pt-1">
                    <span className="text-zinc-500 block">Identified Problem:</span>
                    <p className="text-zinc-200 text-xs italic">"{parsedTicket.issue}"</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={dispatchParsedTicket}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg cursor-pointer text-center"
                >
                  Approve & Dispatch Technician ({parsedTicket.assignedTechnician})
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
