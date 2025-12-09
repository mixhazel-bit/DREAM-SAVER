import React from 'react';
import { Plus, Wallet, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { Wishlist } from '../types';

interface DashboardProps {
  wishlists: Wishlist[];
  onAddClick: () => void;
  onSelectWishlist: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ wishlists, onAddClick, onSelectWishlist, onDelete }) => {
  const totalSaved = wishlists.reduce((sum, item) => sum + item.savedAmount, 0);
  const totalGoals = wishlists.reduce((sum, item) => sum + item.targetAmount, 0);
  const progress = totalGoals > 0 ? (totalSaved / totalGoals) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* Header Summary */}
      <div className="mb-10 text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
          ODARCH SAVER
        </h1>
        <p className="text-slate-500">Wujudkan semua keinginan, satu per satu.</p>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 mb-10 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div>
            <p className="text-slate-500 font-medium mb-1 flex items-center gap-2">
              <Wallet size={18} className="text-emerald-500"/> Total Tabunganmu
            </p>
            <h2 className="text-4xl font-bold text-slate-800 tracking-tight">
              {formatCurrency(totalSaved)}
            </h2>
            <div className="mt-2 text-sm text-slate-500">
              dari total target <span className="font-semibold text-slate-700">{formatCurrency(totalGoals)}</span>
            </div>
          </div>
          
          <div className="w-full md:w-1/3">
             <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
               <span>Progress Global</span>
               <span>{progress.toFixed(1)}%</span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
               <div 
                 className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 ease-out" 
                 style={{ width: `${progress}%` }}
               ></div>
             </div>
          </div>
        </div>
      </div>

      {/* Grid of Wishlists - 1:1 Aspect Ratio Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Add New Card */}
        <button 
          onClick={onAddClick}
          className="group relative flex flex-col items-center justify-center aspect-square rounded-3xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all duration-300 cursor-pointer overflow-hidden bg-slate-50"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors mb-4 transform group-hover:scale-110 duration-300">
            <Plus className="text-slate-400 group-hover:text-emerald-600 transition-colors" size={32} />
          </div>
          <span className="text-slate-500 font-semibold group-hover:text-emerald-700 transition-colors">Tambah Impian</span>
        </button>

        {/* Existing Wishlists */}
        {wishlists.map((item) => {
          const itemProgress = (item.savedAmount / item.targetAmount) * 100;
          const daysLeft = Math.ceil((new Date(item.targetDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          const isCompleted = item.savedAmount >= item.targetAmount;

          return (
            <div 
              key={item.id}
              onClick={() => onSelectWishlist(item.id)}
              className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 bg-white"
            >
              {/* Delete Button - Hidden by default, shown on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id, item.title);
                }}
                className="absolute top-3 left-3 z-30 p-2 rounded-full bg-black/20 backdrop-blur-md text-white/80 hover:bg-rose-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100"
                title="Hapus Tabungan"
              >
                <Trash2 size={16} />
              </button>

              {/* Image Background */}
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                   <span className="text-4xl">✨</span>
                </div>
              )}

              {/* Gradient Overlay - Clean bottom gradient only */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

              {/* Content Overlay */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white z-10">
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {isCompleted && (
                    <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg animate-bounce">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                </div>

                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-bold truncate mb-1 leading-tight drop-shadow-md">{item.title}</h3>
                  
                  <div className="flex items-center gap-2 text-xs text-white/90 mb-3 font-medium drop-shadow-sm">
                    <Calendar size={12}/>
                    {isCompleted ? (
                      <span className="text-emerald-400 font-bold drop-shadow-md">Tercapai! 🎉</span>
                    ) : (
                      <span>{daysLeft > 0 ? `${daysLeft} hari lagi` : 'Terlewat'}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end drop-shadow-md">
                       <span className="text-lg font-bold text-white tracking-tight">{formatCurrency(item.savedAmount)}</span>
                       <span className="text-xs text-white/90 mb-1">{Math.min(itemProgress, 100).toFixed(0)}%</span>
                    </div>
                    
                    <div className="w-full bg-white/30 rounded-full h-1.5 overflow-hidden backdrop-blur-md">
                      <div 
                        className={`h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] ${isCompleted ? 'bg-emerald-400' : 'bg-white'}`} 
                        style={{ width: `${Math.min(itemProgress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};