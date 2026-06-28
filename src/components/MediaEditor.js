"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Video, AlertCircle, GripVertical } from 'lucide-react';
import { uploadMedia } from '../lib/mediaService';

export default function MediaEditor({ currentUserId, mediaFiles, setMediaFiles, maxFiles = 10 }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  // Drag to reorder state
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (files) => {
    setError(null);
    const validFiles = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
    
    if (validFiles.length === 0) {
      setError("Please upload images or videos only.");
      return;
    }

    if (mediaFiles.length + validFiles.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} media files.`);
      return;
    }

    const newMediaObjects = validFiles.map(file => {
      const isVideo = file.type.startsWith('video/');
      const id = Math.random().toString(36).substring(2, 9);
      
      // Create a local object URL for instant preview
      const previewUrl = URL.createObjectURL(file);
      
      const mediaObj = {
        id,
        file,
        type: isVideo ? 'video' : 'image',
        previewUrl,
        url: null, // Populated after upload
        progress: 0,
        status: 'uploading' // uploading, complete, error
      };

      // Start upload immediately
      beginUpload(mediaObj);
      return mediaObj;
    });

    setMediaFiles(prev => [...prev, ...newMediaObjects]);
  };

  const beginUpload = async (mediaObj) => {
    try {
      const downloadUrl = await uploadMedia(mediaObj.file, currentUserId, (prog) => {
        setMediaFiles(prev => prev.map(m => 
          m.id === mediaObj.id ? { ...m, progress: prog } : m
        ));
      });

      setMediaFiles(prev => prev.map(m => 
        m.id === mediaObj.id ? { ...m, url: downloadUrl, status: 'complete', progress: 100 } : m
      ));
    } catch (err) {
      setMediaFiles(prev => prev.map(m => 
        m.id === mediaObj.id ? { ...m, status: 'error' } : m
      ));
    }
  };

  const removeMedia = (id) => {
    setMediaFiles(prev => {
      const target = prev.find(m => m.id === id);
      if (target && target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(m => m.id !== id);
    });
  };

  // Basic Drag to Reorder logic
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverItem = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Swap items
    const items = [...mediaFiles];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setMediaFiles(items);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Upload Zone */}
      {mediaFiles.length < maxFiles && (
        <div 
          className={`relative w-full border-2 border-dashed rounded-2xl p-6 transition-colors flex flex-col items-center justify-center text-center cursor-pointer ${
            dragActive ? 'border-acid-green bg-acid-green/5' : 'border-card-border hover:border-muted bg-surface/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files) handleFiles(Array.from(e.target.files));
              e.target.value = ''; // Reset
            }}
            multiple
            accept="image/*,video/*"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-surface border border-card-border flex items-center justify-center mb-3">
            <Upload className="w-5 h-5 text-muted" />
          </div>
          <p className="text-sm font-bold text-foreground">Click or drag media here</p>
          <p className="text-[10px] font-medium text-muted uppercase tracking-widest mt-1">Up to {maxFiles} images/videos</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Media Grid (Reorderable) */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        <AnimatePresence>
          {mediaFiles.map((media, index) => (
            <motion.div
              key={media.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOverItem(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-square rounded-xl overflow-hidden group bg-surface border border-card-border cursor-grab active:cursor-grabbing ${
                draggedIndex === index ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {/* Preview */}
              {media.type === 'video' ? (
                <video src={media.previewUrl} className="w-full h-full object-cover" />
              ) : (
                <img src={media.previewUrl} alt="upload" className="w-full h-full object-cover" />
              )}
              
              {/* Top left icon */}
              <div className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/50 backdrop-blur-md">
                {media.type === 'video' ? <Video className="w-3 h-3 text-white" /> : <ImageIcon className="w-3 h-3 text-white" />}
              </div>

              {/* Remove Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); removeMedia(media.id); }}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 backdrop-blur-md hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3 text-white" />
              </button>

              {/* Cover Badge (First Item) */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-acid-green text-accent-foreground text-[8px] font-black uppercase tracking-widest shadow-lg">
                  Cover
                </div>
              )}

              {/* Progress Bar Overlay */}
              {media.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                  <div className="w-3/4 h-1.5 bg-surface rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-acid-green transition-all duration-300 ease-out" style={{ width: `${media.progress}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-white">{Math.round(media.progress)}%</span>
                </div>
              )}

              {/* Error Overlay */}
              {media.status === 'error' && (
                <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white mb-1" />
                  <span className="text-[10px] font-bold text-white">Failed</span>
                </div>
              )}

              {/* Drag Handle Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                <GripVertical className="w-6 h-6 text-white/70" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
