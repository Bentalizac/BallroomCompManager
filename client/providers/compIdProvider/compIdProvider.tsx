'use client';

import React from 'react';
import { useParams } from 'next/navigation';

type IdProviderProps = {
    id: string;
};

export const IdContext = React.createContext<IdProviderProps | null>(null);

type ProviderProps = {
    id: string;
    children: React.ReactNode;
};

export const IdProvider: React.FC<ProviderProps> = ({ id, children }) => {
    // If id is not provided, try to get it from the URL params
    const params = useParams();
    const routeId = id || (params && typeof params.id === 'string' ? params.id : '');
    return (
        <IdContext.Provider value={{ id: routeId }}>
            {children}
        </IdContext.Provider>
    );
};