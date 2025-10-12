import React, { useState } from 'react';
import { useBureau } from '../../contexts/BureauContext';
import { useAccounts } from '../../hooks/useAccounts';
import { BalanceCard } from '../../components/financial/BalanceCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { AccountForm } from '../../components/financial/AccountForm';
import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';

export const Accounts: React.FC = () => {
  const { currentBureau } = useBureau();
  const { accounts, isLoading, createAccount, deleteAccount } = useAccounts(currentBureau?.id);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAccount = async (data: any) => {
    if (!currentBureau) return;
    
    setIsCreating(true);
    try {
      await createAccount({
        ...data,
        bureauId: currentBureau.id
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      try {
        await deleteAccount(accountId);
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Impossible de supprimer un compte avec des transactions');
      }
    }
  };

  const getAccountTypeDisplayName = (type: string) => {
    const types: { [key: string]: string } = {
      'BANQUE': 'Banque',
      'PAYPAL': 'PayPal',
      'CAISSE': 'Caisse',
      'MOBILE_MONEY': 'Mobile Money',
      'OTHER': 'Autre'
    };
    
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des comptes...</p>
        </div>
      </div>
    );
  }

  if (!currentBureau) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏢</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun bureau sélectionné
        </h3>
        <p className="text-gray-600">
          Veuillez sélectionner un bureau pour gérer les comptes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comptes</h1>
          <p className="text-gray-600 mt-2">
            Gestion des comptes de <strong>{currentBureau.name}</strong>
          </p>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)}>
          + Nouveau compte
        </Button>
      </div>

      {/* Résumé global */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Solde total</h2>
        <div className="text-center py-4">
          <CurrencyDisplay
            amount={accounts.reduce((sum, acc) => sum + acc.balance, 0)}
            className="text-4xl font-bold"
            showColor
          />
          <p className="text-gray-600 mt-2">
            Réparti sur {accounts.length} compte(s)
          </p>
        </div>
      </div>

      {/* Liste des comptes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="card relative">
            <BalanceCard
              title={account.name}
              balance={account.balance}
              currency={account.currency}
              type={account.type.toLowerCase() as any}
            />
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{getAccountTypeDisplayName(account.type)}</span>
                <span>{account._count?.transactions || 0} transactions</span>
              </div>
              
              <div className="flex space-x-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  Détails
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 border-red-300"
                  onClick={() => handleDeleteAccount(account.id)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun compte créé
          </h3>
          <p className="text-gray-600 mb-6">
            Créez votre premier compte pour commencer à gérer votre trésorerie
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            Créer mon premier compte
          </Button>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer un nouveau compte"
        size="md"
      >
        <AccountForm
          onSubmit={handleCreateAccount}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isCreating}
        />
      </Modal>
    </div>
  );
};