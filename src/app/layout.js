// src/app/layout.js
import "./globals.css";
import AuthProvider from "./SessionProvider";
import SessionGuard from "./SessionGuard";
import ViewportGate from "./components/ViewportGate";
import { ToastProvider } from "./components/ToastContext";
import { ThemeProvider } from "./utils/ThemeContext";

export const metadata = {
  title: "ANTI Fargeverktøy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="no">
      
      <body>
        <AuthProvider>
          <SessionGuard>
            <ThemeProvider>
              <ToastProvider>
                <ViewportGate>{children}</ViewportGate>
              </ToastProvider>
            </ThemeProvider>
          </SessionGuard>
        </AuthProvider>
      </body>
    </html>
  );
}