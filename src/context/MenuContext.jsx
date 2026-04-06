/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { menuItems as fallbackMenuItems } from '../data/menu';
import { subscribeMenuItems } from '../services/menuService';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [remoteMenus, setRemoteMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeMenuItems((incomingMenus) => {
      setRemoteMenus(incomingMenus);
      setLoadingMenus(false);
    });

    return unsubscribe;
  }, []);

  const menuItems = useMemo(() => {
    const sourceMenus = remoteMenus.length ? remoteMenus : fallbackMenuItems;
    return sourceMenus.filter((menu) => menu.isActive !== false);
  }, [remoteMenus]);

  const menuById = useMemo(
    () =>
      menuItems.reduce((result, item) => {
        result[item.id] = item;
        return result;
      }, {}),
    [menuItems]
  );

  return (
    <MenuContext.Provider
      value={{
        loadingMenus,
        menuItems,
        menuById,
        rawMenus: remoteMenus,
        hasRemoteMenus: remoteMenus.length > 0
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error('useMenu harus dipakai di dalam MenuProvider.');
  }

  return context;
}
