"use client";

import { useState } from "react";
import { Loader2, Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { updateModuleContent } from "@/app/actions/builder";
import { ModuleContent } from "@/types/database";
import { RichTextarea } from "@/app/(admin)/components/rich-textarea";

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
      drop_downs: [...sc.drop_downs, { 
        title: "New Concept", 
        what_it_is: "", 
        why_it_matters: "", 
        example: "", 
        common_mistake: "", 
        try_it: "",
        video_url: "",
        custom_sections: []
      }]
    });
  };

  const addCustomSection = (dropdownIndex: number) => {
    const newDDs = [...sc.drop_downs];
    newDDs[dropdownIndex].custom_sections = [
      ...(newDDs[dropdownIndex].custom_sections || []),
      { heading: "New Subheading", content: "" }
    ];
    updateSC({ drop_downs: newDDs });
  };

  const updateCustomSection = (dropdownIndex: number, sectionIndex: number, field: "heading" | "content", value: string) => {
    const newDDs = [...sc.drop_downs];
    if (newDDs[dropdownIndex].custom_sections) {
      newDDs[dropdownIndex].custom_sections![sectionIndex][field] = value;
      updateSC({ drop_downs: newDDs });
    }
  };

  const removeCustomSection = (dropdownIndex: number, sectionIndex: number) => {
    const newDDs = [...sc.drop_downs];
    newDDs[dropdownIndex].custom_sections = newDDs[dropdownIndex].custom_sections?.filter((_, i) => i !== sectionIndex);
    updateSC({ drop_downs: newDDs });
  };

  const removeDropdown = (index: number) => {
    updateSC({
      drop_downs: sc.drop_downs.filter((_, i) => i !== index)
    });
  };

  const updateDropdown = (index: number, field: keyof Omit<ModuleContent["drop_downs"][0], "custom_sections">, value: string) => {
    const newDDs = [...sc.drop_downs];
    (newDDs[index] as any)[field] = value;
    updateSC({ drop_downs: newDDs });
  };

  const removeQuiz = () => {
    updateSC({ mini_quiz: { title: "Mini Quiz", questions: [] } });
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
                <div className="md:col-span-2">
                  <RichTextarea 
                    label="Module Objective (Multiline)"
                    value={sc.module_objective || ""}
                    onChange={(val: string) => updateSC({ module_objective: val })}
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

              <RichTextarea 
                label="Module Intro Text"
                value={sc.intro_text || ""}
                onChange={(val: string) => updateSC({ intro_text: val })}
                placeholder="This module builds the foundation..."
              />

              <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center justify-between">
                    <span>Master Video URL (YouTube Embed format)</span>
                    {data.video_url && <span className="text-blue-400">Scanner Active</span>}
                  </label>
                  <div className="flex gap-4 items-start">
                    <input 
                      value={data.video_url}
                      onChange={(e) => setData({ ...data, video_url: e.target.value })}
                      className="flex-1 bg-black/50 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-xs rounded shadow-inner"
                      placeholder="https://www.youtube.com/embed/..."
                    />
                    {data.video_url && (
                      <div className="w-32 h-[42px] rounded border border-white/10 overflow-hidden relative flex-shrink-0 bg-black/40 animate-in fade-in zoom-in duration-300">
                        {data.video_url.includes('youtube.com') || data.video_url.includes('youtu.be') ? (
                          <img 
                            src={`https://img.youtube.com/vi/${data.video_url.split(/embed\/|v=|v\/|youtu.be\//)[1]?.split(/[?&]/)[0]}/mqdefault.jpg`} 
                            alt="preview" 
                            className="w-full h-full object-cover opacity-75 hover:opacity-100 transition-opacity"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[8px] font-black tracking-widest uppercase text-blue-500/50">Video Link</span>
                          </div>
                        )}
                        <div className="absolute inset-0 pointer-events-none border border-white/5" />
                      </div>
                    )}
                  </div>
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
              <h3 className="text-sm font-bold uppercase text-zinc-500 tracking-widest">Conceptual Sub-modules</h3>
              <button type="button" onClick={addDropdown} className="text-blue-500 hover:text-blue-400 text-xs flex items-center gap-1.5 uppercase font-bold tracking-widest">
                <Plus className="w-4 h-4" /> Add Sub-module
              </button>
            </div>
           
           <div className="space-y-6">
              {sc.drop_downs.map((dd, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4 relative group">
                  <button type="button" onClick={() => removeDropdown(idx)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input 
                    value={dd.title}
                    onChange={(e) => updateDropdown(idx, "title", e.target.value)}
                    className="bg-transparent text-lg font-bold text-white focus:outline-none border-b border-white/10 focus:border-blue-500 w-full pb-2"
                    placeholder="Sub-module Title (e.g., AI vs ML vs DL)"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RichTextarea label="What it is" value={dd.what_it_is} onChange={(val: string) => updateDropdown(idx, "what_it_is", val)} />
                    <RichTextarea label="Why it matters" value={dd.why_it_matters} onChange={(val: string) => updateDropdown(idx, "why_it_matters", val)} />
                    <RichTextarea label="Example" value={dd.example} onChange={(val: string) => updateDropdown(idx, "example", val)} />
                    <RichTextarea label="Common Mistake" value={dd.common_mistake} onChange={(val: string) => updateDropdown(idx, "common_mistake", val)} />
                    <div className="md:col-span-2">
                       <RichTextarea label="Try It" value={dd.try_it} onChange={(val: string) => updateDropdown(idx, "try_it", val)} />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Sub-module Video URL (Optional)</label>
                       <input 
                         value={dd.video_url || ""}
                         onChange={(e) => updateDropdown(idx, "video_url", e.target.value)}
                         className="w-full bg-black/50 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-xs rounded"
                         placeholder="https://www.youtube.com/embed/..."
                       />
                    </div>


                    {/* Custom Sections */}
                    {dd.custom_sections?.map((section, sIdx) => (
                      <div key={sIdx} className="md:col-span-2 bg-black/20 p-4 rounded-xl border border-white/5 space-y-4 relative group/section">
                        <button type="button" onClick={() => removeCustomSection(idx, sIdx)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover/section:opacity-100 transition-opacity">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <input 
                          value={section.heading}
                          onChange={e => updateCustomSection(idx, sIdx, "heading", e.target.value)}
                          className="bg-transparent text-sm font-bold text-blue-400 focus:outline-none border-b border-white/5 w-full pb-1"
                          placeholder="Custom Subheading..."
                        />
                        <RichTextarea value={section.content} onChange={(val: string) => updateCustomSection(idx, sIdx, "content", val)} className="mt-2" />
                      </div>
                    ))}
                    
                    <div className="md:col-span-2 pt-2">
                      <button 
                        type="button"
                        onClick={() => addCustomSection(idx)}
                        className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-blue-400 flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Custom Subheading & Para
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {sc.drop_downs.length === 0 && (
                <div className="text-center p-8 border border-dashed border-white/10 rounded-lg text-zinc-600 text-xs">No sub-modules added.</div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <RichTextarea 
                   label="Instructions / Tasks" 
                   value={sc.activity_block?.instructions || ""} 
                   onChange={(val: string) => updateSC({ activity_block: { ...sc.activity_block, instructions: val } as any })} 
                   placeholder="Give tasks..."
                 />
                 <RichTextarea 
                   label="Expected Outcome" 
                   value={sc.activity_block?.outcome_expected || ""} 
                   onChange={(val: string) => updateSC({ activity_block: { ...sc.activity_block, outcome_expected: val } as any })} 
                   placeholder="Learners should understand that..."
                 />
               </div>
           </div>
        </section>

         <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
               <h3 className="text-sm font-bold uppercase text-zinc-500 tracking-widest">Mini Quiz</h3>
               {(sc.mini_quiz?.questions?.length ?? 0) > 0 && (
                 <button type="button" onClick={removeQuiz} className="text-red-500/50 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5">
                    <Trash2 className="w-3 h-3" /> Terminate Assessment
                 </button>
               )}
            </div>
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
                    <button type="button" onClick={() => {
                        const questions = sc.mini_quiz?.questions || [];
                        const newQ = questions.filter((_, i) => i !== idx);
                        updateSC({ mini_quiz: { title: sc.mini_quiz?.title || "Mini Quiz", questions: newQ } });
                    }} className="text-red-500 opacity-50 hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button 
                  type="button"
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
