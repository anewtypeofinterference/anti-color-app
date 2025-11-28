// src/app/layout.js
import "./globals.css";
import AuthProvider from "./SessionProvider";
import SessionGuard from "./SessionGuard";
import { ToastProvider } from "./components/ToastContext";
import { ThemeProvider } from "./utils/ThemeContext";

export const metadata = {
  title: "Color-App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="no">
      
      <body>
        <AuthProvider>
          {/* this will redirect to /auth/signin if you're not logged in */}
          <SessionGuard>
            <ThemeProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </ThemeProvider>
          </SessionGuard>
        </AuthProvider>
      </body>
    </html>
  );
}