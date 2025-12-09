import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Calendar, Target, Type, DollarSign, ZoomIn, Move, ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react';
import { Wishlist } from '../types';

interface AddWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wishlist: Omit<Wishlist, 'id' | 'savedAmount' | 'transactions' | 'createdAt'>) => void;
}

export const AddWishlistModal: React.FC<AddWishlistModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  
  // Image Editor States
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form on close
      setTitle('');
      setTargetAmount('');
      setTargetDate('');
      setOriginalImage(null);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setScale(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getCroppedImage = (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!originalImage || !canvasRef.current) {
        resolve(null);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = originalImage;
      
      img.onload = () => {
        // Set canvas to high resolution 1:1 aspect ratio
        canvas.width = 800;
        canvas.height = 800;
        
        if (ctx) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Calculate drawing params based on the visual editor
          // We need to map the DOM coordinate system (container) to Canvas coordinate system
          const container = containerRef.current;
          if (container) {
             const domWidth = container.clientWidth;
             const domHeight = container.clientHeight;
             
             // The ratio between the actual canvas output and the DOM display
             const ratio = canvas.width / domWidth; 

             ctx.save();
             // Move to center of canvas
             ctx.translate(canvas.width / 2, canvas.height / 2);
             // Apply user's translation (scaled up)
             ctx.translate(position.x * ratio, position.y * ratio);
             // Apply scale
             ctx.scale(scale, scale);
             // Draw image centered
             ctx.drawImage(img, -img.width / 2, -img.height / 2);
             ctx.restore();
             
             resolve(canvas.toDataURL('image/jpeg', 0.9));
          } else {
             resolve(null);
          }
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImage = null;
    if (originalImage) {
        finalImage = await getCroppedImage();
    }

    onSave({
      title,
      targetAmount: Number(targetAmount),
      targetDate,
      image: finalImage,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in my-8">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white sticky top-0 z-20">
          <h2 className="text-xl font-bold text-slate-800">Tambah Wishlist Baru</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Image Editor Area */}
          <div className="space-y-3">
             <label className="block text-sm font-semibold text-slate-700">Gambar Tabungan (1:1)</label>
             
             <div 
               ref={containerRef}
               className={`relative w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed ${!originalImage ? 'border-slate-300 hover:border-emerald-400 cursor-pointer' : 'border-emerald-500'}`}
               onMouseDown={originalImage ? handleMouseDown : undefined}
               onMouseMove={originalImage ? handleMouseMove : undefined}
               onMouseUp={originalImage ? handleMouseUp : undefined}
               onMouseLeave={originalImage ? handleMouseUp : undefined}
               onTouchStart={originalImage ? handleMouseDown : undefined}
               onTouchMove={originalImage ? handleMouseMove : undefined}
               onTouchEnd={originalImage ? handleMouseUp : undefined}
             >
               {!originalImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    <Upload size={32} className="mb-2" />
                    <span className="text-xs font-medium">Klik untuk upload</span>
                  </div>
               ) : (
                  <>
                    <img 
                      ref={imageRef}
                      src={originalImage} 
                      alt="Preview" 
                      draggable={false}
                      className="absolute max-w-none cursor-move select-none"
                      style={{ 
                        left: '50%', 
                        top: '50%',
                        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center'
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md pointer-events-none flex items-center gap-1">
                      <Move size={10} /> Geser untuk atur
                    </div>
                  </>
               )}
               <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
               />
             </div>

             {/* Controls */}
             {originalImage && (
               <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                 <ZoomIn size={18} className="text-slate-400" />
                 <input 
                   type="range" 
                   min="0.5" 
                   max="3" 
                   step="0.1" 
                   value={scale}
                   onChange={(e) => setScale(parseFloat(e.target.value))}
                   className="w-full accent-emerald-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                 />
                 <button 
                   type="button" 
                   onClick={() => fileInputRef.current?.click()}
                   className="text-xs font-medium text-emerald-600 whitespace-nowrap px-2 py-1 hover:bg-emerald-50 rounded"
                 >
                   Ganti Foto
                 </button>
               </div>
             )}
             
             {/* Hidden Canvas for processing */}
             <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Nama Barang (Contoh: iPhone 15)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="number"
                placeholder="Target Harga (Rp)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                min="1"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-600 font-medium"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-2 text-lg"
          >
            Buat Tabungan
          </button>
        </form>
      </div>
    </div>
  );
};

interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number, note: string) => void;
  itemName: string;
  initialMode?: 'save' | 'withdraw';
  currentSaved: number;
}

export const AddSavingsModal: React.FC<AddSavingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  itemName, 
  initialMode = 'save',
  currentSaved 
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<'save' | 'withdraw'>('save');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setAmount('');
      setNote('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    
    // Send negative amount if withdrawing
    const finalAmount = mode === 'withdraw' ? -numAmount : numAmount;
    
    onSave(finalAmount, note);
    onClose();
  };

  const isSave = mode === 'save';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in transition-all">
        <div className="p-2 m-2 mb-0 flex bg-slate-100 rounded-2xl relative overflow-hidden">
           <div 
             className={`absolute inset-y-2 w-[calc(50%-8px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${isSave ? 'left-2' : 'left-[calc(50%+4px)]'}`}
           ></div>
           
           <button 
             type="button" 
             onClick={() => setMode('save')}
             className={`relative z-10 flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-colors ${isSave ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <ArrowUp size={16} className={isSave ? 'text-emerald-500' : ''}/> Nabung
           </button>
           <button 
             type="button" 
             onClick={() => setMode('withdraw')}
             className={`relative z-10 flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-colors ${!isSave ? 'text-rose-700' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <ArrowDown size={16} className={!isSave ? 'text-rose-500' : ''}/> Tarik
           </button>
        </div>

        <div className="px-6 py-4 text-center">
          <h2 className="text-xl font-bold text-slate-800">
            {isSave ? 'Tambah Tabungan' : 'Tarik Saldo'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isSave ? `untuk ${itemName}` : `dari ${itemName}`}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          <div className="relative">
            <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 ${isSave ? 'text-emerald-500' : 'text-rose-500'}`} size={18} />
            <input
              type="number"
              placeholder="Jumlah Nominal (Rp)"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all font-semibold ${isSave ? 'focus:ring-emerald-500 border-slate-200' : 'focus:ring-rose-500 border-slate-200'}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
              max={!isSave ? currentSaved : undefined}
            />
          </div>

          <div className="relative">
             <input
              type="text"
              placeholder="Catatan (Opsional)"
              className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all ${isSave ? 'focus:ring-emerald-500' : 'focus:ring-rose-500'}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {!isSave && currentSaved > 0 && (
            <div className="text-xs text-center text-slate-400">
              Saldo tersedia: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(currentSaved)}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 text-white font-semibold rounded-xl shadow-lg transition-all transform active:scale-[0.98] ${isSave ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}`}
            >
              {isSave ? 'Simpan' : 'Tarik'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
            <AlertTriangle size={32} />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">{message}</p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-colors"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};