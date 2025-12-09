import React, { useState, useEffect } from 'react';
import { Wishlist, Transaction } from './types';
import { Dashboard } from './components/Dashboard';
import { WishlistDetail } from './components/WishlistDetail';
import { AddWishlistModal, AddSavingsModal, ConfirmationModal } from './components/Modals';

const STORAGE_KEY = 'dreamsaver_data_v1';

const App: React.FC = () => {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [activeWishlistId, setActiveWishlistId] = useState<string | null>(null);
  
  // Modal States
  const [isAddWishlistOpen, setIsAddWishlistOpen] = useState(false);
  const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);
  const [savingsMode, setSavingsMode] = useState<'save' | 'withdraw'>('save');
  
  // Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{isOpen: boolean, id: string | null, title: string}>({
    isOpen: false, id: null, title: ''
  });

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWishlists(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse storage", e);
      }
    }
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlists));
  }, [wishlists]);

  const handleAddWishlist = (newWishlist: Omit<Wishlist, 'id' | 'savedAmount' | 'transactions' | 'createdAt'>) => {
    const item: Wishlist = {
      ...newWishlist,
      id: crypto.randomUUID(),
      savedAmount: 0,
      transactions: [],
      createdAt: new Date().toISOString(),
    };
    setWishlists(prev => [item, ...prev]);
  };

  const openDeleteConfirmation = (id: string, title: string) => {
    setDeleteConfirmation({ isOpen: true, id, title });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.id) {
      setWishlists(prev => prev.filter(w => w.id !== deleteConfirmation.id));
      // If we are deleting the active item, close it
      if (activeWishlistId === deleteConfirmation.id) {
        setActiveWishlistId(null);
      }
      setDeleteConfirmation({ isOpen: false, id: null, title: '' });
    }
  };

  const handleAddSavings = (amount: number, note: string) => {
    if (!activeWishlistId) return;

    setWishlists(prev => prev.map(w => {
      if (w.id === activeWishlistId) {
        const newTransaction: Transaction = {
          id: crypto.randomUUID(),
          amount,
          date: new Date().toISOString(),
          note
        };
        // amount can be negative for withdrawals, math still works
        const newSavedAmount = w.savedAmount + amount;
        
        return {
          ...w,
          savedAmount: Math.max(0, newSavedAmount), // Ensure it doesn't go below 0 purely visually, though logic allows it
          transactions: [...w.transactions, newTransaction]
        };
      }
      return w;
    }));
  };

  const activeWishlist = wishlists.find(w => w.id === activeWishlistId);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* View Controller */}
      {activeWishlist ? (
        <WishlistDetail 
          wishlist={activeWishlist} 
          onBack={() => setActiveWishlistId(null)}
          onAddSavings={() => {
            setSavingsMode('save');
            setIsAddSavingsOpen(true);
          }}
          onWithdraw={() => {
            setSavingsMode('withdraw');
            setIsAddSavingsOpen(true);
          }}
          onDelete={openDeleteConfirmation}
        />
      ) : (
        <Dashboard 
          wishlists={wishlists} 
          onAddClick={() => setIsAddWishlistOpen(true)}
          onSelectWishlist={setActiveWishlistId}
          onDelete={openDeleteConfirmation}
        />
      )}

      {/* Modals */}
      <AddWishlistModal 
        isOpen={isAddWishlistOpen} 
        onClose={() => setIsAddWishlistOpen(false)}
        onSave={handleAddWishlist}
      />

      {activeWishlist && (
        <AddSavingsModal
          isOpen={isAddSavingsOpen}
          onClose={() => setIsAddSavingsOpen(false)}
          onSave={handleAddSavings}
          itemName={activeWishlist.title}
          initialMode={savingsMode}
          currentSaved={activeWishlist.savedAmount}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
        onConfirm={confirmDelete}
        title="Hapus Tabungan?"
        message={`Apakah kamu yakin ingin menghapus "${deleteConfirmation.title}"? Data yang dihapus tidak dapat dikembalikan.`}
      />
    </div>
  );
};

export default App;