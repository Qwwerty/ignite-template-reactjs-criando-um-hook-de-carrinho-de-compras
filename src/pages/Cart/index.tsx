import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

interface ProductCartFormatted {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
  priceFormatted: string;
  subTotal: string;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(product => {
    const newProduct = Object.assign(product) as ProductCartFormatted;
    newProduct.priceFormatted = formatPrice(product.price);
    newProduct.subTotal = formatPrice(product.amount * product.price);
    return newProduct;
  });
  const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        return sumTotal += (product.price * product.amount);
      }, 0)
    )

  function handleProductIncrement(product: Product) {
    let { id, amount } = product;

    amount = amount + 1;

    updateProductAmount({
      productId: id,
      amount
    })
  }

  function handleProductDecrement(product: Product) {
    let { id, amount } = product;

    amount = amount - 1;
    updateProductAmount({
      productId: id,
      amount,
    });
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map(p => (
            <tr data-testid="product" key={p.id}>
              <td>
                <img src={p.image} alt={p.title} />
              </td>
              <td>
                <strong>{p.title}</strong>
                <span>{p.priceFormatted}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                  disabled={p.amount <= 1}
                  onClick={() => handleProductDecrement(p)}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={p.amount}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                  onClick={() => handleProductIncrement(p)}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{p.subTotal}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                onClick={() => handleRemoveProduct(p.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}


        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
