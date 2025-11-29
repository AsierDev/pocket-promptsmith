'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to console in development
        console.error('Global error boundary caught:', error);

        // TODO: En producción, enviar a Sentry o servicio de monitoring
        // if (process.env.NODE_ENV === 'production') {
        //   Sentry.captureException(error);
        // }
    }, [error]);

    return (
        <html lang="es">
            <body
                style={{
                    fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    color: '#F8FAFC',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        maxWidth: '28rem',
                        padding: '2rem',
                        background: 'rgba(30, 41, 59, 0.8)',
                        borderRadius: '1rem',
                        border: '1px solid rgba(124, 58, 237, 0.3)'
                    }}
                >
                    <div
                        style={{
                            fontSize: '4rem',
                            marginBottom: '1rem'
                        }}
                    >
                        ⚠️
                    </div>
                    <h2
                        style={{
                            fontSize: '1.875rem',
                            fontWeight: '700',
                            marginBottom: '0.75rem',
                            color: '#F8FAFC'
                        }}
                    >
                        Algo salió mal
                    </h2>
                    <p
                        style={{
                            fontSize: '1rem',
                            color: '#CBD5E1',
                            lineHeight: '1.5',
                            marginBottom: '1.5rem'
                        }}
                    >
                        {error.message || 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.'}
                    </p>
                    {error.digest && (
                        <p
                            style={{
                                fontSize: '0.875rem',
                                color: '#94A3B8',
                                marginBottom: '1.5rem',
                                fontFamily: 'monospace'
                            }}
                        >
                            Error ID: {error.digest}
                        </p>
                    )}
                    <div
                        style={{
                            display: 'flex',
                            gap: '0.75rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}
                    >
                        <button
                            onClick={reset}
                            style={{
                                background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '9999px',
                                border: 'none',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Intentar de nuevo
                        </button>
                        <button
                            onClick={() => (window.location.href = '/prompts')}
                            style={{
                                background: 'transparent',
                                color: '#7C3AED',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '9999px',
                                border: '1px solid #7C3AED',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Ir al inicio
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
