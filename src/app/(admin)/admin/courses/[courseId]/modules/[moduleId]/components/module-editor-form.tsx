"use client";

import { useState } from "react";
import { Loader2, Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { updateModuleContent } from "@/app/actions/builder";
import { ModuleContent } from "@/types/database";

interface ModuleData {
  title: string;
  content_text: string;
  video_url: string;
  structured_content: ModuleContent | null;
}

const DEFAULT_STRUCTURED_CONTENT: ModuleContent = {
  module_objective: "",
  intro_text: "",
  duration_minutes: "",
  video_title: "",
  video_description: "",
  drop_downs: [],
  activity_block: { title: "", instructions: "", outcome_expected: "" },
  mini_quiz: { title: "Mini Quiz", questions: [] },
  references: [],
};

export default function ModuleEditorForm({ 
  courseId,
  moduleId, 
  initialData 
}: { 
  courseId: string;
  moduleId: string; 
  initialData: ModuleData;
}) {
  const [data, setData] = useState<ModuleData>({
    ...initialData,
    structured_content: initialData.structured_content || DEFAULT_STRUCTURED_CONTENT
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const sc = data.structured_content as ModuleContent;

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    
    // Call server action securely
    const res = await updateModuleContent(courseId, moduleId, data);
    
    if (res?.error) {
      setMessage(`❌ Error: ${res.error}`);
    } else {
      setMessage("✅ Module Architecture Saved Successfully");
      setTimeout(() => setMessage(""), 3000);
    }
    
    setIsSaving(false);
  };

  const updateSC = (update: Partial<ModuleContent>) => {
    setData(prev => ({
      ...prev,
      structured_content: { ...(prev.structured_content as ModuleContent), ...update }
    }));
  };

  const addDropdown = () => {
    updateSC({
      drop_downs: [...sc.drop_downs, { title: "New Concept", what_it_is: "", why_it_matters: "", example: "", common_mistake: "", try_it: "" }]
    });
  };

  const removeDropdown = (index: number) => {
    updateSC({
      drop_downs: sc.drop_downs.filter((_, i) => i !== index)
    });
  };

  const updateDropdown = (index: number, field: keyof ModuleContent["drop_downs"][0], value: string) => {
    const newDDs = [...sc.drop_downs];
    newDDs[index][field] = value;
    updateSC({ drop_downs: newDDs });
  };

  const addReference = () => {
    updateSC({ references: [...(sc.references || []), { title: "Link Title", url: "https://" }] });
  };

  const updateReference = (index: number, field: "title" | "url", value: string) => {
    const newRefs = [...sc.references];
    newRefs[index][field] = value;
    updateSC({ references: newRefs });
  };

  const removeReference = (index: number) => {
    updateSC({ references: sc.references.filter((_, i) => i !== index) });
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-900 border border-white/10 rounded-xl overflow-y-auto shadow-2xl custom-scrollbar relative">
      <div className="sticky top-0 bg-zinc-950 p-4 border-b border-white/10 flex items-center justify-between shadow-sm z-50">
        <input 
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="bg-transparent text-xl font-bold uppercase tracking-widest text-white focus:outline-none w-full max-w-[50%]"
          placeholder="Module Title..."
        />
        <div className="flex items-center space-x-4">
          {message && <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">{message}</span>}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] tracking-[0.2em] rounded flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Commit Content</span>
          </button>
        </div>
      </div>

      <div className="p-8 space-y-12 pb-32">
        {/* Core Settings */}
        <section className="space-y-4">
           <h3 className="text-sm font-bold uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2">Core Identity & Video</h3>
           <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Module Objective (One-line)</label>
                  <input 
                    value={sc.module_objective || ""}
                    onChange={(e) => updateSC({ module_objective: e.target.value })}
                    className="w-full bg-zinc-950/50 border border-white/10 p-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm rounded"
                    placeholder="Build mental clarity about..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Duration (e.g. 30 to 35 minutes)</label>
                  <input 
                    value={sc.duration_minutes || ""}
                    onChange={(e) => updateSC({ duration_minutes: e.target.value })}
                    className="w-full bg-zinc-950/50 border border-white/10 p-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm rounded"
                    placeholder="30 to 35 minutes"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Module Intro Text</label>
                <textarea 
                  value={sc.intro_text || ""}
                  onChange={(e) => updateSC({ intro_text: e.target.value })}
                  className="w-full bg-zinc-950/50 border border-white/10 p-4 text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[100px] text-sm rounded"
                  placeholder="This module builds the foundation..."
                />
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Master Video URL (YouTube Embed format)</label>
                  <input 
                    value={data.video_url}
                    onChange={(e) => setData({ ...data, video_url: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-xs rounded"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Video Title</label>
                    <input 
                      value={sc.video_title || ""}
                      onChange={(e) => updateSC({ video_title: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm rounded"
                      placeholder="AI, Machine Learning..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Video Description</label>
                    <input 
                      value={sc.video_description || ""}
                      onChange={(e) => updateSC({ video_description: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm rounded"
                      placeholder="Use this as the opening video..."
                    />
                  </div>
                </div>
              </div>
           </div>
        </section>

        {/* Dropdowns (Accordions) */}
        <section className="space-y-4">
           <div className="flex items-center justify-between border-b border-white/5 pb-2">
             <h3 className="text-sm font-bold uppercase text-zinc-500 tracking-widest">Concept Dropdowns</h3>
             <button onClick={addDropdown} className="text-blue-500 hover:text-blue-400 text-xs flex items-center gap-1 uppercase font-bold tracking-widest">
               <Plus className="w-4 h-4" /> Add Dropdown
             </button>
           </div>
           
           <div className="space-y-6">
              {sc.drop_downs.map((dd, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4 relative group">
                  <button onClick={() => removeDropdown(idx)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input 
                    value={dd.title}
                    onChange={(e) => updateDropdown(idx, "title", e.target.value)}
                    className="bg-transparent text-lg font-bold text-white focus:outline-none border-b border-white/10 focus:border-blue-500 w-full pb-2"
                    placeholder="Dropdown Title (e.g., AI vs ML vs DL)"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase text-zinc-500 block mb-1">What it is</label>
                      <textarea value={dd.what_it_is} onChange={e => updateDropdown(idx, "what_it_is", e.target.value)} className="w-full bg-black/30 border border-white/5 p-2 text-xs text-zinc-300 rounded h-24" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-zinc-500 block mb-1">Why it matters</label>
                      <textarea value={dd.why_it_matters} onChange={e => updateDropdown(idx, "why_it_matters", e.target.value)} className="w-full bg-black/30 border border-white/5 p-2 text-xs text-zinc-300 rounded h-24" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-zinc-500 block mb-1">Example</label>
                      <textarea value={dd.example} onChange={e => updateDropdown(idx, "example", e.target.value)} className="w-full bg-black/30 border border-white/5 p-2 text-xs text-zinc-300 rounded h-24" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-zinc-500 block mb-1">Common Mistake</label>
                      <textarea value={dd.common_mistake} onChange={e => updateDropdown(idx, "common_mistake", e.target.value)} className="w-full bg-black/30 border border-white/5 p-2 text-xs text-zinc-300 rounded h-24" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase text-zinc-500 block mb-1">Try It</label>
                      <textarea value={dd.try_it} onChange={e => updateDropdown(idx, "try_it", e.target.value)} className="w-full bg-black/30 border border-white/5 p-2 text-xs text-zinc-300 rounded h-16" />
                    </div>
                  </div>
                </div>
              ))}
              {sc.drop_downs.length === 0 && (
                <div className="text-center p-8 border border-dashed border-white/10 rounded-lg text-zinc-600 text-xs">No dropdowns added.</div>
              )}
           </div>
        </section>

        {/* Activity Block */}
        <section className="space-y-4">
           <h3 className="text-sm font-bold uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2">Activity Block</h3>
           <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-6 space-y-4">
              <input 
                value={sc.activity_block?.title || ""}
                onChange={(e) => updateSC({ activity_block: { ...sc.activity_block, title: e.target.value } as any })}
                className="bg-transparent text-lg font-bold text-white focus:outline-none border-b border-white/10 focus:border-blue-500 w-full pb-2"
                placeholder="Activity Title..."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">Instructions / Tasks</label>
                  <textarea 
                    value={sc.activity_block?.instructions || ""} 
                    onChange={e => updateSC({ activity_block: { ...sc.activity_block, instructions: e.target.value } as any })} 
                    className="w-full bg-black/30 border border-white/5 p-3 text-xs text-zinc-300 rounded h-32" 
                    placeholder="Give tasks..."
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">Expected Outcome</label>
                  <textarea 
                    value={sc.activity_block?.outcome_expected || ""} 
                    onChange={e => updateSC({ activity_block: { ...sc.activity_block, outcome_expected: e.target.value } as any })} 
                    className="w-full bg-black/30 border border-white/5 p-3 text-xs text-zinc-300 rounded h-32" 
                    placeholder="Learners should understand that..."
                  />
                </div>
              </div>
           </div>
        </section>

        {/* Mini Quiz */}
        <section className="space-y-4">
           <h3 className="text-sm font-bold uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2">Mini Quiz</h3>
           <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-6 space-y-4">
              <div className="space-y-3">
                {(sc.mini_quiz?.questions || []).map((q, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-black/40 p-3 rounded border border-white/5">
                    <input 
                      value={q.question_text}
                      onChange={e => {
                        const newQ = [...(sc.mini_quiz?.questions || [])];
                        newQ[idx].question_text = e.target.value;
                        updateSC({ mini_quiz: { ...sc.mini_quiz!, questions: newQ } });
                      }}
                      className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                      placeholder="Question..."
                    />
                    <select 
                      value={q.correct_answer ? "true" : "false"}
                      onChange={e => {
                        const newQ = [...(sc.mini_quiz?.questions || [])];
                        newQ[idx].correct_answer = e.target.value === "true";
                        updateSC({ mini_quiz: { ...sc.mini_quiz!, questions: newQ } });
                      }}
                      className="bg-zinc-800 text-white text-xs p-2 rounded outline-none"
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                    <button onClick={() => {
                        const newQ = sc.mini_quiz!.questions.filter((_, i) => i !== idx);
                        updateSC({ mini_quiz: { ...sc.mini_quiz!, questions: newQ } });
                    }} className="text-red-500 opacity-50 hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={() => {
                     const q = sc.mini_quiz?.questions || [];
                     updateSC({ mini_quiz: { ...sc.mini_quiz!, questions: [...q, { question_text: "", correct_answer: true }] } });
                  }}
                  className="px-4 py-2 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase rounded hover:bg-yellow-500/20 transition-colors"
                >
                  + Add T/F Question
                </button>
              </div>
           </div>
        </section>

        {/* References */}
        <section className="space-y-4">
           <h3 className="text-sm font-bold uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2">References / Further Reading</h3>
           <div className="space-y-2">
              {sc.references.map((ref, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input value={ref.title} onChange={e => updateReference(idx, "title", e.target.value)} placeholder="Title" className="w-1/3 bg-zinc-950/50 border border-white/10 px-3 py-2 text-white outline-none rounded text-xs" />
                  <input value={ref.url} onChange={e => updateReference(idx, "url", e.target.value)} placeholder="https://" className="w-1/2 bg-zinc-950/50 border border-white/10 px-3 py-2 text-white outline-none rounded text-xs" />
                  <button onClick={() => removeReference(idx)} className="text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button 
                  onClick={addReference}
                  className="px-4 py-2 bg-white/5 text-white text-xs font-bold uppercase rounded hover:bg-white/10 transition-colors"
                >
                  + Add Link
              </button>
           </div>
        </section>

      </div>
    </div>
  );
}
