// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { Bureau, bureauService } from '../services/bureauService';
// import { useAuth } from './AuthContext';

// interface BureauContextType {
//   bureaux: Bureau[];
//   currentBureau: Bureau | null;
//   isLoading: boolean;
//   setCurrentBureau: (bureau: Bureau | null) => void;
//   refreshBureaux: () => Promise<void>;
//   createBureau: (data: any) => Promise<Bureau>;
//   updateBureauColor: (bureauId: string, color: string) => Promise<void>;
// }

// const BureauContext = createContext<BureauContextType | undefined>(undefined);

// export const BureauProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [bureaux, setBureaux] = useState<Bureau[]>([]);
//   const [currentBureau, setCurrentBureau] = useState<Bureau | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const { user } = useAuth();

//   const refreshBureaux = async () => {
//     if (!user?.bureauId) return;
    
//     try {
//       setIsLoading(true);
//       // Pour l'instant, on récupère tous les espaces puis on filtre
//       // Dans une version future, on aura un endpoint spécifique
//       const espaces = await bureauService.getBureauxByEspace('default'); // À adapter
//       setBureaux(espaces);
      
//       // Si l'utilisateur a un bureau, le définir comme courant
//       if (user.bureauId && !currentBureau) {
//         const userBureau = espaces.find(b => b.id === user.bureauId);
//         if (userBureau) {
//           setCurrentBureau(userBureau);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching bureaux:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const createBureau = async (data: any): Promise<Bureau> => {
//     const newBureau = await bureauService.createBureau(data);
//     await refreshBureaux();
//     return newBureau;
//   };

//   const updateBureauColor = async (bureauId: string, color: string) => {
//     await bureauService.updateBureauColor(bureauId, color);
//     await refreshBureaux();
    
//     // Mettre à jour le bureau courant si c'est celui qui a changé
//     if (currentBureau?.id === bureauId) {
//       setCurrentBureau({ ...currentBureau, color });
//     }
//   };

//   useEffect(() => {
//     refreshBureaux();
//   }, [user]);

//   return (
//     <BureauContext.Provider value={{
//       bureaux,
//       currentBureau,
//       isLoading,
//       setCurrentBureau,
//       refreshBureaux,
//       createBureau,
//       updateBureauColor
//     }}>
//       {children}
//     </BureauContext.Provider>
//   );
// };

// export const useBureau = () => {
//   const context = useContext(BureauContext);
//   if (context === undefined) {
//     throw new Error('useBureau must be used within a BureauProvider');
//   }
//   return context;
// };

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bureau, bureauService } from '../services/bureauService';
import { useAuth } from './AuthContext';

interface BureauContextType {
  bureaux: Bureau[];
  currentBureau: Bureau | null;
  isLoading: boolean;
  setCurrentBureau: (bureau: Bureau | null) => void;
  refreshBureaux: () => Promise<void>;
  createBureau: (data: any) => Promise<Bureau>;
  updateBureauColor: (bureauId: string, color: string) => Promise<void>;
  loadBureaux: () => Promise<void>;
}

const BureauContext = createContext<BureauContextType | undefined>(undefined);

export const BureauProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bureaux, setBureaux] = useState<Bureau[]>([]);
  const [currentBureau, setCurrentBureau] = useState<Bureau | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadBureaux = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Essayer de récupérer le bureau spécifique
      if (user.bureauId) {
        const specificBureau = await bureauService.getBureauById(user.bureauId);
        if (specificBureau) {
          setBureaux([specificBureau]);
          setCurrentBureau(specificBureau);
          return;
        }
      }

      // Fallback: bureaux par espace
      const espaces = await bureauService.getBureauxByEspace('default');
      setBureaux(espaces);
      
      if (espaces.length > 0) {
        setCurrentBureau(espaces[0]);
      }
      
    } catch (error) {
      console.error('Error loading bureaux:', error);
      setBureaux([]);
      setCurrentBureau(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBureaux = async () => {
    await loadBureaux();
  };

  const createBureau = async (data: any): Promise<Bureau> => {
    const newBureau = await bureauService.createBureau(data);
    await refreshBureaux();
    return newBureau;
  };

  const updateBureauColor = async (bureauId: string, color: string) => {
    await bureauService.updateBureauColor(bureauId, color);
    await refreshBureaux();
  };

  useEffect(() => {
    loadBureaux();
  }, [user]);

  return (
    <BureauContext.Provider value={{
      bureaux,
      currentBureau,
      isLoading,
      setCurrentBureau,
      refreshBureaux,
      createBureau,
      updateBureauColor,
      loadBureaux
    }}>
      {children}
    </BureauContext.Provider>
  );
};

export const useBureau = () => {
  const context = useContext(BureauContext);
  if (context === undefined) {
    throw new Error('useBureau must be used within a BureauProvider');
  }
  return context;
};