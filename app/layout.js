import './globals.css';
import { Providers } from '../providers';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'CodeBox — AI Coding Assistant',
  description: 'Your intelligent coding companion. Debug, learn, and build faster with AI-powered programming help.',
  keywords: 'coding assistant, AI programming, code help, debugging, developer tools',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1a1f',
                color: '#f0f0f5',
                border: '1px solid #2a2a35',
                borderRadius: '10px',
                fontFamily: 'Syne, sans-serif',
                fontSize: '13px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#1a1a1f' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a1f' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}