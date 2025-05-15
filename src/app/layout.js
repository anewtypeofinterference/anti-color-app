// src/app/layout.js
import "./globals.css";
import AuthProvider from "./SessionProvider";
import SessionGuard from "./SessionGuard";

export const metadata = {
  title: "Color-App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="no">
      <body>
        <AuthProvider>
          {/* this will redirect to /auth/signin if you’re not logged in */}
          <SessionGuard>
            {children}
          </SessionGuard>
        </AuthProvider>
      </body>
    </html>
  );
}