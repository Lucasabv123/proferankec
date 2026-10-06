import React from 'react';

export const Loading: React.FC = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
        </div>
    );
};
