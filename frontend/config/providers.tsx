'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { Provider as JotaiProvider } from 'jotai';

const queryClient = new QueryClient();

export default function Providers({
    children
}: React.PropsWithChildren) {
    return (
        <JotaiProvider>
            <QueryClientProvider client={queryClient}>{children} </QueryClientProvider>
        </JotaiProvider>
        );
}