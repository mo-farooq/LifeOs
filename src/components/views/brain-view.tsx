"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Plus, 
  Trash2, 
  FileText, 
  Lightbulb, 
  Users, 
  BookOpen, 
  Save, 
  Tag, 
  FilePlus, 
  Layers
} from "lucide-react";
import { BrainNote } from "@/types";

interface BrainViewProps {
  notes: BrainNote[];
  updateNotes: (notes: BrainNote[]) => void;
  activeDate: string;
}

export default function BrainView({ notes, updateNotes, activeDate }: BrainViewProps) {
  // Navigation & filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | BrainNote["category"]>("all");

  // Selected note state (null means creating a new note)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Note editor states
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<BrainNote["category"]>("notes");
  const [editContent, setEditContent] = useState("");
  const [editTagsString, setEditTagsString] = useState("");

  const handleSelectNote = (note: BrainNote) => {
    setSelectedNoteId(note.id);
    setEditTitle(note.title);
    setEditCategory(note.category);
    setEditContent(note.content);
    setEditTagsString(note.tags.join(", "));
  };

  const handleNewNoteWorkspace = () => {
    setSelectedNoteId(null);
    setEditTitle("");
    setEditCategory("notes");
    setEditContent("");
    setEditTagsString("");
  };

  const handleSaveNote = () => {
    if (!editTitle.trim() || !editContent.trim()) return;

    const parsedTags = editTagsString
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    if (selectedNoteId) {
      // Edit existing note
      const updated = notes.map((n) => 
        n.id === selectedNoteId 
          ? { 
              ...n, 
              title: editTitle.trim(), 
              category: editCategory, 
              content: editContent.trim(), 
              tags: parsedTags 
            } 
          : n
      );
      updateNotes(updated);
    } else {
      // Create new note
      const newNote: BrainNote = {
        id: "note_" + Date.now(),
        title: editTitle.trim(),
        category: editCategory,
        content: editContent.trim(),
        date: activeDate,
        tags: parsedTags
      };
      updateNotes([newNote, ...notes]);
      setSelectedNoteId(newNote.id);
    }
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    updateNotes(updated);
    if (selectedNoteId === id) {
      handleNewNoteWorkspace();
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesCategory = activeCategory === "all" || note.category === activeCategory;
    const matchesQuery = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const getCategoryIcon = (category: BrainNote["category"]) => {
    switch (category) {
      case "notes": return <FileText className="h-3.5 w-3.5" />;
      case "ideas": return <Lightbulb className="h-3.5 w-3.5" />;
      case "meetings": return <Users className="h-3.5 w-3.5" />;
      case "books": return <BookOpen className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-4 text-zinc-200">
      <style jsx global>{`
        @keyframes pageFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-page-fade {
          animation: pageFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* View Header */}
      <div className="flex justify-between items-center pb-2 border-b border-zinc-900 animate-page-fade">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-555 font-bold">KNOWLEDGE WAREHOUSE</span>
          <h1 className="text-sm font-bold font-mono text-zinc-100 uppercase tracking-widest">SECOND BRAIN LEDGER</h1>
        </div>
        <button
          onClick={handleNewNoteWorkspace}
          className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-md font-mono font-bold text-[9px] tracking-widest uppercase transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" /> Create Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-page-fade">
        {/* Left Side: Ledger List & Filters */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Ledger Search & Filter matrix */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardContent className="p-3 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-600" />
                <input
                  type="text"
                  placeholder="QUERY INDEX (TITLE/CONTENT/TAG)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#000000] border border-zinc-850 rounded px-8 py-2 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-700"
                />
              </div>

              {/* Category tabs */}
              <div className="grid grid-cols-5 gap-1 border border-zinc-900 p-1 bg-[#000000]/60 rounded">
                {(["all", "notes", "ideas", "meetings", "books"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`py-1 rounded text-[8px] font-mono font-bold uppercase tracking-wider transition-all ${
                      activeCategory === cat
                        ? "bg-zinc-200 text-zinc-950"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-[#0a0a0a]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes List */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredNotes.map((note) => {
              const isSelected = selectedNoteId === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`group border rounded p-3 flex flex-col gap-2 cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-zinc-900/30 border-zinc-300" 
                      : "bg-[#0a0a0a] border-zinc-850 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 pr-4">
                      <h2 className="text-xs font-bold text-zinc-150 line-clamp-1 group-hover:text-zinc-50">
                        {note.title}
                      </h2>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <span className="flex items-center gap-1">
                          {getCategoryIcon(note.category)}
                          {note.category}
                        </span>
                        <span>●</span>
                        <span>{note.date}</span>
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="text-zinc-650 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] font-mono text-zinc-450 line-clamp-2 leading-normal">
                    {note.content}
                  </p>

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((t) => (
                        <span key={t} className="text-[8px] font-mono border border-zinc-900 bg-[#000000]/60 text-zinc-550 px-1 rounded uppercase tracking-wider font-bold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredNotes.length === 0 && (
              <div className="text-center py-8 text-[9px] font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-900 rounded-md">
                No entries index matching criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Note Creator / Editor Workspace */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md h-full flex flex-col">
            <CardHeader className="p-4 border-b border-zinc-800 flex justify-between flex-row items-center gap-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">WORKSPACE SHELL</span>
                <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">
                  {selectedNoteId ? "MODIFY ENTRY" : "INITIALIZE ENTRY"}
                </CardTitle>
              </div>
              
              <button
                onClick={handleSaveNote}
                disabled={!editTitle.trim() || !editContent.trim()}
                className="px-3 py-1 bg-zinc-100 hover:bg-white disabled:opacity-50 disabled:hover:bg-zinc-100 text-zinc-950 rounded text-[9.5px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
              >
                <Save className="h-3.5 w-3.5 stroke-[2.5]" /> Save
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
              
              {/* Form Input Matrix */}
              <div className="space-y-3.5 flex-1 flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  {/* Title */}
                  <div className="sm:col-span-8 space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">ENTRY TITLE</label>
                    <input
                      type="text"
                      placeholder="ENTER MEMORY KEY TITLE..."
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-[#000000] border border-zinc-850 rounded px-3 py-1.5 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-800"
                    />
                  </div>

                  {/* Category */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">CATEGORY INDEX</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as any)}
                      className="w-full bg-[#000000] border border-zinc-850 rounded px-3 py-1.5 text-xs font-mono text-zinc-350 outline-none focus:border-zinc-700"
                    >
                      <option value="notes">NOTES</option>
                      <option value="ideas">IDEAS</option>
                      <option value="meetings">MEETINGS</option>
                      <option value="books">BOOKS</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1">
                    <Tag className="h-3 w-3" /> LABELS/TAGS (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    placeholder="design, learning, database, protocol..."
                    value={editTagsString}
                    onChange={(e) => setEditTagsString(e.target.value)}
                    className="w-full bg-[#000000] border border-zinc-850 rounded px-3 py-1.5 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-800"
                  />
                </div>

                {/* Content Workspace */}
                <div className="space-y-1 flex-1 flex flex-col min-h-[220px]">
                  <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">CONTENT BODY</label>
                  <textarea
                    placeholder="BEGIN WRITING MEMORY COMPONENT..."
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full flex-1 bg-[#000000] border border-zinc-850 rounded p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-800 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Status footer */}
              <div className="text-[8.5px] font-mono text-zinc-555 uppercase tracking-wide leading-relaxed border-t border-zinc-900/50 pt-2.5 mt-2">
                <span className="font-bold text-zinc-400">MEMORY ALLOCATION STATE:</span> Saved entries populate the active state in memory and are written to local logs.
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
