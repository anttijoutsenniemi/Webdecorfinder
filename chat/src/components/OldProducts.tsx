// ProductCard.tsx
import React from 'react';
import { CompareObject } from './../App';
import './../styles/products.css';

interface ProductCardProps {
  products: CompareObject[];
  onCardClick: (product : any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ products, onCardClick }) => {
  return (
    <div className="product-card-container">
      {products.map((product, index) => (
        <div
          key={index}
          className="product-card"
          onClick={() => onCardClick(product)}
        >
          {index === 0 && <div className="best-match-label">Paras osuma</div>}
          <img src={product.picUrl} alt={product.title} className="product-image" />
          <div className="product-details">
            <h2 className="product-title">{product.title}</h2>
            {product.quantity && <p className="product-quantity">Saatavuus: {product.quantity}</p>}
            {product.price && <p className="product-price">Hinta: {product.price}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCard;
