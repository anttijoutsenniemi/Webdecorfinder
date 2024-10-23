import React, { useState } from 'react';
import { CompareObject } from './../App';
import './../styles/products.css';

interface ProductCardProps {
  products: CompareObject[];
  onCardClick: (product : any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ products, onCardClick }) => {
  const [visibleCount, setVisibleCount] = useState(3);

  // Function to load more products
  const loadMoreProducts = () => {
    setVisibleCount(prevCount => prevCount + 3);
  };

  return (
    <div className="product-card-container">
      {products.slice(0, visibleCount).map((product, index) => (
        <div
          key={index}
          className="product-card"
          onClick={() => onCardClick(product)}
        >
          {index === 0 && <div className="best-match-label">Paras osuma</div>}
          <img src={product.picUrl.replace('_thumb', '')} alt={product.title} className="product-image" />
          <div className="product-details">
            <h2 className="product-title">{product.title}</h2>
            {product.quantity && <p className="product-quantity">Saatavuus: {product.quantity}</p>}
            {product.price && <p className="product-price">Hinta: {product.price}</p>}
          </div>
        </div>
      ))}

      {/* Show the button only if there are more products to display */}
      {visibleCount < products.length && (
        <div className='load-more-container'>
        <button className="load-more-button" onClick={loadMoreProducts}>
          Näytä lisää suosituksia
        </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
