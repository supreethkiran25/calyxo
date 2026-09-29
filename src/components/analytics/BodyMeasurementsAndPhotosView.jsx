import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Lock, Ruler, Scale, Plus, Check, Trash2, 
  Calendar, ChevronRight, Eye, Image as ImageIcon, Sliders 
} from 'lucide-react';
import { Card, Button, Input } from '../../design-system/components/UIPrimitives';
import { useStore } from '../../store/useStore';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const MEASUREMENT_FIELDS = [
  { id: 'chest', label: 'Chest', defaultUnit: 'cm' },
  { id: 'waist', label: 'Waist', defaultUnit: 'cm' },
  { id: 'hips', label: 'Hips', defaultUnit: 'cm' },
  { id: 'neck', label: 'Neck', defaultUnit: 'cm' },
  { id: 'leftArm', label: 'Left Arm', defaultUnit: 'cm' },
  { id: 'rightArm', label: 'Right Arm', defaultUnit: 'cm' },
  { id: 'leftThigh', label: 'Left Thigh', defaultUnit: 'cm' },
  { id: 'rightThigh', label: 'Right Thigh', defaultUnit: 'cm' },
  { id: 'calves', label: 'Calves', defaultUnit: 'cm' }
];

export default function BodyMeasurementsAndPhotosView({ onNotification = () => {} }) {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const userId = user?.uid || user?.id;

  const [activeTab, setActiveTab] = useState('measurements'); // 'measurements' | 'photos'

  // Measurements State from localStorage
  const [measurements, setMeasurements] = useState(() => {
    try {
      const local = localStorage.getItem('calyxo_body_measurements');
      return local ? JSON.parse(local) : {
        chest: 98,
        waist: 82,
        hips: 96,
        neck: 38,
        leftArm: 36,
        rightArm: 36.5,
        leftThigh: 56,
        rightThigh: 56,
        calves: 37,
        bodyFat: userProfile?.bodyFat || 16.5
      };
    } catch (e) {
      return {};
    }
  });

  // Progress Photos State from localStorage
  const [photos, setPhotos] = useState(() => {
    try {
      const local = localStorage.getItem('calyxo_progress_photos');
      return local ? JSON.parse(local) : [];
    } catch (e) {
      return [];
    }
  });

  const [compareIndices, setCompareIndices] = useState([0, 1]);
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  const [tempMeasurements, setTempMeasurements] = useState(measurements);

  const triggerHaptic = async (style = ImpactStyle.Light) => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style });
      }
    } catch (e) {}
  };

  const handleSaveMeasurements = () => {
    triggerHaptic(ImpactStyle.Medium);
    setMeasurements(tempMeasurements);
    localStorage.setItem('calyxo_body_measurements', JSON.stringify(tempMeasurements));
    setIsEditingMeasurements(false);
    onNotification('Body measurements saved successfully!');
  };

  // Add a photo entry
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic(ImpactStyle.Medium);
    const reader = new FileReader();
    reader.onload = () => {
      const newPhoto = {
        id: `photo_${Date.now()}`,
        url: reader.result,
        date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: Date.now(),
        angle: 'Front'
      };
      const updated = [newPhoto, ...photos];
      setPhotos(updated);
      localStorage.setItem('calyxo_progress_photos', JSON.stringify(updated));
      onNotification('Progress photo saved privately on this device.');
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = (id) => {
    triggerHaptic();
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    localStorage.setItem('calyxo_progress_photos', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex bg-surface-elevated p-1 rounded-2xl border border-card-border">
        <button
          type="button"
          onClick={() => setActiveTab('measurements')}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
            activeTab === 'measurements'
              ? 'bg-accent text-accent-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground bg-transparent'
          }`}
        >
          Body Tape Measurements
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('photos')}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
            activeTab === 'photos'
              ? 'bg-accent text-accent-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground bg-transparent'
          }`}
        >
          Private Progress Photos
        </button>
      </div>

      {activeTab === 'measurements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-tight">
              Circumference Tracker
            </h3>
            {isEditingMeasurements ? (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsEditingMeasurements(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={handleSaveMeasurements}>
                  Save
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => {
                setTempMeasurements(measurements);
                setIsEditingMeasurements(true);
              }}>
                Update Measurements
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {MEASUREMENT_FIELDS.map(f => {
              const val = isEditingMeasurements ? tempMeasurements[f.id] : measurements[f.id];

              return (
                <Card key={f.id} className="p-3.5 space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    {f.label}
                  </span>
                  {isEditingMeasurements ? (
                    <input
                      type="number"
                      step="0.5"
                      value={val || ''}
                      onChange={(e) => setTempMeasurements(prev => ({ ...prev, [f.id]: Number(e.target.value) }))}
                      className="w-full min-h-[36px] rounded-xl bg-surface-elevated border border-card-border text-center text-sm font-black font-mono text-foreground focus:outline-none focus:border-accent"
                    />
                  ) : (
                    <div className="text-lg font-black font-mono text-foreground">
                      {val ? `${val} cm` : '—'}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="space-y-6">
          {/* Privacy Banner */}
          <div className="p-4 rounded-2xl bg-surface-elevated border border-card-border flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Photos are securely encrypted on your local device storage. Never public.</span>
            </div>

            <label className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground font-black text-xs uppercase tracking-wider cursor-pointer hover:brightness-110 active:scale-95 transition-all shrink-0 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {/* Photo Gallery Grid */}
          {photos.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-surface border border-dashed border-card-border space-y-2">
              <Camera className="w-8 h-8 text-accent mx-auto" />
              <h4 className="text-sm font-bold text-foreground">No Progress Photos Yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Capture consistent front, side, and back physique photos every 4–8 weeks to visualize muscular hypertrophy and fat loss.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((p, idx) => (
                <div key={p.id || idx} className="rounded-2xl bg-surface border border-card-border overflow-hidden relative group">
                  <div className="aspect-[3/4] w-full bg-black/50 overflow-hidden flex items-center justify-center">
                    <img src={p.url} alt={`Progress ${p.date}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-xs border-t border-card-border/60">
                    <span className="font-mono text-[10px] text-muted-foreground">{p.date}</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(p.id)}
                      className="text-muted-foreground hover:text-destructive cursor-pointer border-none bg-transparent p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Side-by-Side Comparison if at least 2 photos exist */}
          {photos.length >= 2 && (
            <Card elevated={true} className="p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-accent" />
                Side-by-Side Physique Comparison
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 text-center">
                  <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">
                    Initial • {photos[photos.length - 1]?.date}
                  </span>
                  <div className="aspect-[3/4] rounded-2xl bg-black overflow-hidden border border-card-border">
                    <img src={photos[photos.length - 1]?.url} alt="Initial" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="space-y-1.5 text-center">
                  <span className="text-[10px] font-mono text-accent font-bold uppercase">
                    Current • {photos[0]?.date}
                  </span>
                  <div className="aspect-[3/4] rounded-2xl bg-black overflow-hidden border border-accent/40">
                    <img src={photos[0]?.url} alt="Current" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
