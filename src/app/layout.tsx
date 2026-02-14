import "./globals.css";

export const metadata = {
  title: "Real-Time Poll Rooms",
  description: "Create and share live polls."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
