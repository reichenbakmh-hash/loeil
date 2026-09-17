export default function WhatsAppButton(): JSX.Element {
  return (
    <a
      href="https://wa.me/261378903367"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-hairline bg-panel px-4 py-3 font-data text-xs text-paper shadow-lg transition hover:border-signal hover:text-signal"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l4.93-1.38C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.2c-.22.62-1.28 1.18-1.77 1.25-.45.07-1.02.1-1.65-.1-.38-.12-.87-.28-1.5-.55-2.64-1.14-4.36-3.8-4.5-3.98-.13-.18-1.08-1.43-1.08-2.73 0-1.3.68-1.93.92-2.2.24-.26.53-.33.7-.33.18 0 .35 0 .5.01.16.01.38-.06.6.46.22.53.75 1.83.82 1.96.07.13.12.29.02.46-.1.18-.15.29-.29.44-.14.16-.3.35-.42.47-.14.14-.29.29-.12.58.16.29.75 1.24 1.62 2 1.12.99 2.06 1.3 2.35 1.44.29.14.46.12.62-.05.17-.17.7-.81.89-1.09.19-.28.38-.24.63-.14.26.1 1.63.77 1.91.91.28.14.46.21.53.33.07.12.07.7-.15 1.32z" />
      </svg>
      Me contacter
    </a>
  );
}
