import { useNavigate } from 'react-router-dom';

const BackButton = ({ style = {}, to }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => to ? navigate(to) : navigate(-1)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(255,255,255,0.15)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '8px',
        padding: '7px 14px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        marginBottom: '16px',
        backdropFilter: 'blur(4px)',
        ...style,
      }}
    >
      ← Back
    </button>
  );
};

export default BackButton;
