import '../../../styles/profile/cards.scss';

interface CardProps {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}

export default function Card({ title, subtitle, right, children }: CardProps) {
  return (
    <section className="card">
      {(title || subtitle || right) && (
        <header className="card__header">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {right && <div className="card__right">{right}</div>}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}
