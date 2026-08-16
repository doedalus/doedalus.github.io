export default function Footer() {
  return (
    <footer className="footer">
      <div className="rosette-divider rosette-divider--soft" />
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="mark">𒀭</span> Esagila
        </div>
        <a
          className="footer__github"
          href="https://github.com/doedalus/esagila"
          target="_blank"
          rel="noreferrer noopener"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.1c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11.02 11.02 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
          <span>doedalus/esagila</span>
        </a>
        <div className="footer__copy">© {new Date().getFullYear()} Esagila</div>
      </div>
    </footer>
  )
}
