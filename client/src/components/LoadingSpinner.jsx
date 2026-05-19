import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  return (
    <div className={`spinner-wrapper spinner-${size}`}>
      <div className="spinner">
        <div className="spinner-ring" />
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}
