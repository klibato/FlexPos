import React from 'react';
import { formatPrice } from '../../utils/constants';

/**
 * Carte produit optimisée tactile (min 80x80px)
 * Utilise React.memo pour optimiser les performances
 */
const ProductCard = React.memo(({ product, onClick }) => {
  const { name, price_ttc, category, image_url, is_menu } = product;

  // Icône par défaut selon la catégorie
  const getCategoryIcon = () => {
    const icons = {
      burgers: '🍔',
      sides: '🍟',
      drinks: '🥤',
      desserts: '🍰',
      menus: '📦',
    };
    return icons[category] || '🍽️';
  };

  return (
    <div
      onClick={() => onClick(product)}
      className="product-card group relative"
    >
      {/* Badge menu */}
      {is_menu && (
        <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          MENU
        </div>
      )}

      {/* Image ou icône */}
      <div className="flex items-center justify-center h-20 mb-3">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <span className="text-5xl">{getCategoryIcon()}</span>
        )}
      </div>

      {/* Nom du produit */}
      <h3 className="font-semibold text-gray-800 text-center mb-2 line-clamp-2 min-h-[3rem]">
        {name}
      </h3>

      {/* Prix */}
      <p className="text-2xl font-bold text-primary-600 text-center">
        {formatPrice(price_ttc)}
      </p>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
