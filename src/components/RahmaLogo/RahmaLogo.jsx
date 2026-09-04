import React from 'react';
import './RahmaLogo.css';
import logoImg from '../../assets/rahma-logo.png';

export const RahmaLogo = ({ size = 'md', className = '', alt = 'رحمة للمستلزمات الطبية' }) => {
  // size: 'sm' | 'md' | 'lg' | 'xl'
  return (
    <div className={`rahma-logo-wrapper rahma-logo-size-${size} ${className}`}>
      <img
        src={logoImg}
        alt={alt}
        className="rahma-logo-image"
        loading="eager"
      />
    </div>
  );
};

export default RahmaLogo;
