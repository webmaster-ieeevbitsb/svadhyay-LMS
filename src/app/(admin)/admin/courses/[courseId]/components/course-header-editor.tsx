"use client";

import { useState } from "react";
import { updateCourse, deleteCourse } from "@/app/actions/courses";
import { Edit2, Save, Trash2, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CourseHeaderEditor({ 
  courseId, 
  initialTitle, 
  initialDescription,
  initialThumbnail,
  initialMetadata
}: { 
  courseId: string;
  initialTitle: string;
  initialDescription: string | null;
  initialThumbnail: string | null;
  initialMetadata: {
    overview?: string;
    goals_list?: string;
    duration_text?: string;
  } | null;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialThumbnail || "");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialThumbnail);
  const [metadata, setMetadata] = useState(initialMetadata || { overview: "", goals_list: "", duration_text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      
      if (thumbnailFile) {
        formData.append("thumbnail_image", thumbnailFile);
      } else {
        formData.append("thumbnail_url", thumbnailUrl);
      }

      formData.append("overview", metadata.overview || "");
      formData.append("goals_list", metadata.goals_list || "");
      formData.append("duration_text", metadata.duration_text || "");
      
      const result = await updateCourse(courseId, formData);
      if (result?.error) {
        alert(result.error);
      } else {
        setIsEditing(false);
        router.refresh();
      }
    } catch (err: any) {
      alert("Failed to update course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCourse(courseId);
      router.push("/admin/courses");
    } catch (err) {
      alert("Deletion failed. Please try again.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isEditing) {
    return (
      <div className="glass p-8 border-l-4 border-l-blue-500 rounded-lg flex flex-col gap-6 shadow-2xl relative z-20 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
           <div className="md:col-span-2">
             <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Course Title</label>
             <input
               type="text"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white font-black italic tracking-tighter uppercase text-2xl focus:outline-none focus:border-blue-500 transition-colors"
             />
           </div>
           
           <div className="md:col-span-2">
             <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Course Branding (Thumbnail)</label>
             <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-48 h-32 relative rounded-2xl overflow-hidden border-2 border-dashed border-white/10 bg-white/[0.02] hover:border-blue-500/50 transition-all group flex items-center justify-center">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-600">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-[8px] font-black uppercase tracking-widest">No Image selected</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          alert("File too large. Max size: 10MB");
                          return;
                        }
                        setThumbnailFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                
                <div className="flex-1 space-y-2 w-full">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                    Upload a high-resolution cover image. <br/>
                    <span className="text-blue-500">Recommended: 16:9 aspect ratio.</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      placeholder="Or paste external URL..."
                      value={thumbnailUrl}
                      onChange={(e) => {
                        setThumbnailUrl(e.target.value);
                        setPreviewUrl(e.target.value);
                        setThumbnailFile(null);
                      }}
                      className="flex-1 bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-[10px] text-zinc-400 focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                    />
                    {previewUrl && (
                      <button 
                        onClick={() => {
                          setPreviewUrl(null);
                          setThumbnailFile(null);
                          setThumbnailUrl("");
                        }}
                        className="text-[10px] font-bold text-red-500/50 hover:text-red-500 uppercase tracking-widest px-2"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
             </div>
           </div>

           <div>
             <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Brief Excerpt/Subtitle</label>
             <textarea
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               rows={3}
               className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-zinc-300 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
             />
           </div>

           <div>
             <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Total Duration (e.g. 2.5 to 3 hours)</label>
             <input
               type="text"
               value={metadata.duration_text || ""}
               onChange={(e) => setMetadata({ ...metadata, duration_text: e.target.value })}
               className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
               placeholder="2.5 to 3 hours"
             />
           </div>

           <div className="md:col-span-2">
             <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Full Course Overview (Paragraph)</label>
             <textarea
               value={metadata.overview || ""}
               onChange={(e) => setMetadata({ ...metadata, overview: e.target.value })}
               rows={5}
               className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-zinc-300 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
               placeholder="Generative AI is a class of AI models..."
             />
           </div>

           <div className="md:col-span-2">
             <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Course Goals (One bullet per line)</label>
             <textarea
               value={metadata.goals_list || ""}
               onChange={(e) => setMetadata({ ...metadata, goals_list: e.target.value })}
               rows={4}
               className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-zinc-300 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
               placeholder="understand basic ideas&#10;build clear mental model"
             />
           </div>
        </div>
        <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-6">
           <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
             Cancel
           </button>
           <button onClick={handleSave} disabled={isLoading} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center space-x-2 transition-colors">
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             <span>Save Architecture</span>
           </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass p-8 border-l-4 border-l-blue-500 rounded-lg flex flex-col md:flex-row items-center gap-8 group relative overflow-hidden transition-all shadow-xl">
        {initialThumbnail && (
          <div className="w-32 h-32 relative rounded-2xl overflow-hidden border border-white/10 shrink-0">
            <img src={initialThumbnail} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 pr-24 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white drop-shadow-lg">
              {initialTitle}
            </h1>
            {initialMetadata?.duration_text && (
              <span className="text-[10px] font-bold px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-md uppercase tracking-widest">
                {initialMetadata.duration_text}
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm max-w-3xl whitespace-pre-wrap leading-relaxed italic">
            {initialDescription || "No excerpt provided."}
          </p>
        </div>
        
        <div className="absolute top-8 right-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button 
            onClick={() => setIsEditing(true)}
            className="p-3 bg-black/50 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 rounded-lg text-zinc-400 hover:text-white transition-all shadow-lg backdrop-blur-md"
            title="Edit Infrastructure"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="p-3 bg-black/50 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 rounded-lg text-zinc-400 hover:text-red-500 transition-all shadow-lg backdrop-blur-md"
            title="Delete Curriculum"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ⚠️ TACTICAL DELETE CONFIRMATION */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#0a0a0f] border border-red-500/30 rounded-[2.5rem] p-10 max-w-lg w-full shadow-[0_0_80px_rgba(239,68,68,0.2)]">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                 <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-2xl font-black italic tracking-tighter uppercase text-white text-center mb-2">Delete Entire Course?</h4>
              <p className="text-zinc-500 text-xs text-center font-bold mb-8 uppercase tracking-[0.2em] leading-relaxed">
                 Warning: This action will permanently wipe <span className="text-white">"{initialTitle}"</span> and all associated Modules/Quizzes. This is irreversible.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setShowDeleteModal(false)}
                   disabled={isDeleting}
                   className="px-6 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/10 transition-all disabled:opacity-50"
                 >
                    Abort
                 </button>
                 <button 
                   onClick={handleDelete}
                   disabled={isDeleting}
                   className="px-6 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isDeleting ? "WIPING DATA..." : "Confirm Wipe"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
