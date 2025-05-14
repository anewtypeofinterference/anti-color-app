import "./globals.css";

export const metadata = {
  title: "Color-App",
};

export default async function RootLayout({ children }) {

  return (
    <html lang="no">
      <body>
        {children}
      </body>
    </html>
  );
}