import "./globals.css";

export const metadata = {
  title: "Рассадка гостей — Андрей и Юля",
  description: "Интерактивный план рассадки гостей на свадьбе"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
