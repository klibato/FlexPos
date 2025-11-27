import React from 'react';
import { formatPrice } from '../../utils/constants';

/**
 * Carte produit optimisée tactile (min 80x80px)
 * Utilise React.memo pour optimiser les performances
 */
const ProductCard = React.memo(({ product, onClick }) => {
  const { name, price_ttc, category, image_url, is_menu, is_out_of_stock, is_low_stock, quantity } = product;

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

  // Désactiver le clic si rupture de stock
  const handleClick = () => {
    if (is_out_of_stock && !is_menu) {
      alert(`⚠️ ${name} est en rupture de stock !`);
      return;
    }
    onClick(product);
  };

  return (
    <div
      onClick={handleClick}
      className={`product-card group relative ${is_out_of_stock && !is_menu ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {/* Badge stock (en haut à gauche) */}
      {!is_menu && is_out_of_stock && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
          RUPTURE
        </div>
      )}
      {!is_menu && !is_out_of_stock && is_low_stock && (
        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
          ⚡ {quantity}
        </div>
      )}

      {/* Badge menu (en haut à droite) */}
      {is_menu && (
        <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          MENU
        </div>
      )}

      {/* Image ou icône - responsive */}
      <div className="flex items-center justify-center h-12 sm:h-16 md:h-20 mb-2 sm:mb-3">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              // Si l'image ne charge pas, afficher l'icône de catégorie
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'inline';
            }}
          />
        ) : null}
        <span
          className="text-3xl sm:text-4xl md:text-5xl"
          style={{ display: image_url ? 'none' : 'inline' }}
        >
          {getCategoryIcon()}
        </span>
      </div>

      {/* Nom du produit - responsive */}
      <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-center mb-1 sm:mb-2 line-clamp-2 text-xs sm:text-sm md:text-base min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3rem]">
        {name}
      </h3>

      {/* Prix - responsive */}
      <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400 text-center">
        {formatPrice(price_ttc)}
      </p>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
