import React, { useState } from 'react';
import { ArrowLeft, Plus, Calendar, Target, CheckCircle, TrendingUp, Sparkles, AlertCircle, ArrowDown, ArrowUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wishlist, Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

interface WishlistDetailProps {
  wishlist: Wishlist;
  onBack: () => void;
  onAddSavings: () => void;
  onWithdraw: () => void;
  onDelete: (id: string, title: string) => void;
}

export const WishlistDetail: React.FC<WishlistDetailProps> = ({ wishlist, onBack, onAddSavings, onWithdraw, onDelete }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const remaining = Math.max(0, wishlist.targetAmount - wishlist.savedAmount);
  const progress = (wishlist.savedAmount / wishlist.targetAmount) * 100;
  
  const today = new Date();
  const target = new Date(wishlist.targetDate);
  const diffTime = target.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const dailySavingNeeded = daysLeft > 0 ? remaining / daysLeft : 0;
  const isCompleted = remaining <= 0;

  // Prepare chart data (cumulative)
  const chartData = wishlist.transactions.map((t, index) => {
    // Calculate cumulative sum up to this transaction
    const cumulative = wishlist.transactions
      .slice(0, index + 1)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return {
      date: new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      amount: cumulative,
      rawAmount: t.amount // for tooltip if needed
    };
  });

  // If no transactions, add a starting point (0) and maybe today (0) if empty
  if (chartData.length === 0) {
    chartData.push({ date: 'Start', amount: 0, rawAmount: 0 });
  }

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    setAdvice(null);
    const result = await getFinancialAdvice({
      title: wishlist.title,
      targetAmount: wishlist.targetAmount,
      savedAmount: wishlist.savedAmount,
      targetDate: wishlist.targetDate,
      daysRemaining: daysLeft
    });
    setAdvice(result);
    setLoadingAdvice(false);
  };

  const handleDelete = () => {
    onDelete(wishlist.id, wishlist.title);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32 animate-fade-in">
      {/* Header Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
          <ArrowLeft size={20} /> Kembali
        </button>
        <button onClick={handleDelete} className="text-red-400 hover:text-red-600 text-sm font-medium">
          Hapus Wishlist
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
            {wishlist.image && (
              <div className="w-full relative aspect-square bg-slate-50">
                 <img src={wishlist.image} alt={wishlist.title} className="w-full h-full object-cover" />
                 {/* Clean bottom gradient */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                 <div className="absolute bottom-6 left-6 text-white max-w-[90%]">
                    <h1 className="text-3xl font-bold mb-1 drop-shadow-md">{wishlist.title}</h1>
                    <p className="opacity-90 flex items-center gap-2 text-sm drop-shadow-sm font-medium"><Target size={14}/> Target: {formatDate(wishlist.targetDate)}</p>
                 </div>
              </div>
            )}
            {!wishlist.image && (
              <div className="h-32 bg-indigo-600 flex items-center justify-center">
                 <h1 className="text-3xl font-bold text-white">{wishlist.title}</h1>
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                <div>
                  <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Terkumpul</p>
                  <div className="text-4xl font-extrabold text-slate-800 flex items-baseline gap-2">
                    {formatCurrency(wishlist.savedAmount)}
                    <span className="text-lg text-slate-400 font-medium">/ {formatCurrency(wishlist.targetAmount)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                   {!isCompleted && (
                      <button 
                        onClick={onAddSavings}
                        className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 font-semibold transition-all transform hover:scale-105"
                      >
                        <Plus size={20} /> Nabung
                      </button>
                   )}
                   {wishlist.savedAmount > 0 && (
                      <button 
                        onClick={onWithdraw}
                        className="flex-1 md:flex-initial bg-white border border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all"
                      >
                        <ArrowDown size={20} /> Tarik
                      </button>
                   )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className={`${isCompleted ? 'text-emerald-600' : 'text-indigo-600'}`}>{progress.toFixed(1)}% Tercapai</span>
                  <span className="text-slate-400">Sisa {formatCurrency(remaining)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} 
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm">
                      <Calendar size={16} /> Sisa Waktu
                    </div>
                    <div className="font-bold text-slate-800 text-lg">
                      {isCompleted ? "Selesai!" : daysLeft > 0 ? `${daysLeft} Hari` : <span className="text-red-500">Lewat Batas</span>}
                    </div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm">
                      <TrendingUp size={16} /> Rekomendasi
                    </div>
                    <div className="font-bold text-slate-800 text-lg">
                      {isCompleted ? "-" : daysLeft > 0 ? `${formatCurrency(Math.ceil(dailySavingNeeded))}/hari` : "Segera lunasi"}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-indigo-500" size={20}/> Grafik Tabungan
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `Rp${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(val: number) => [formatCurrency(val), 'Total']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: History & AI */}
        <div className="space-y-6">
          
          {/* AI Advisor Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
             <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
               <Sparkles className="text-yellow-300" /> Smart Advisor
             </h3>
             <p className="text-indigo-100 text-sm mb-4">Butuh motivasi atau tips biar target "{wishlist.title}" cepat tercapai?</p>
             
             {advice ? (
               <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-sm leading-relaxed border border-white/20 animate-fade-in">
                 "{advice}"
               </div>
             ) : (
                <button 
                  onClick={handleGetAdvice}
                  disabled={loadingAdvice}
                  className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                >
                  {loadingAdvice ? "Menganalisis..." : "Minta Saran AI"}
                </button>
             )}
          </div>

          {/* History List */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-fit max-h-[500px] overflow-y-auto">
             <h3 className="text-lg font-bold text-slate-800 mb-4 sticky top-0 bg-white pb-2 border-b border-slate-50">Riwayat Transaksi</h3>
             
             {wishlist.transactions.length === 0 ? (
               <div className="text-center py-8 text-slate-400">
                 <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertCircle size={24} />
                 </div>
                 <p className="text-sm">Belum ada transaksi.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {[...wishlist.transactions].reverse().map((t) => {
                   const isIncome = t.amount > 0;
                   return (
                    <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {isIncome ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                        </div>
                        <div>
                          <p className={`font-bold ${isIncome ? 'text-slate-700' : 'text-rose-600'}`}>
                            {isIncome ? '+' : ''}{formatCurrency(t.amount)}
                          </p>
                          <p className="text-xs text-slate-400">{formatDate(t.date)}</p>
                        </div>
                      </div>
                      {t.note && (
                        <span className="text-xs text-slate-500 max-w-[80px] truncate bg-slate-100 px-2 py-1 rounded">
                          {t.note}
                        </span>
                      )}
                    </div>
                   );
                 })}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};