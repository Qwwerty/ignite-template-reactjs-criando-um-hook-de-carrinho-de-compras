import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  useEffect(() => {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
  }, [cart]);

  const addProduct = async (productId: number) => {
    try {
      const [response, responseStock] = await Promise.all([await api.get(`/products/${productId}`), await api.get(`/stock/${productId}`)])

      const product = cart.find(product => product.id === response.data.id);

      toast.error('Quantidade solicitada fora de estoque');
      if (!product) {
        const { id, title, image, price } = response.data as Product;

        const newProduct = {
          id,
          title,
          image,
          price,
          amount: 1
        }

        if (newProduct.amount <= responseStock.data.amount) {
          setCart([...cart, newProduct]);
        }
        else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      }

      else {
        if (product.amount < responseStock.data.amount) {
          setCart(cart.map(p => {
            if (p.id === product.id) {
              p.amount++;
            }

            return p;
          }));
        }
        else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      }

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      await api.get(`/products/${productId}`);
      setCart(cart.filter(product => product.id !== productId));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const response = await api.get(`/products/${productId}`);
      const responseStock = await api.get(`/stock/${productId}`);

      const product = cart.find(product => product.id === response.data.id);

      if(!product) {
        return;
      }

      if (product?.amount === 1 && amount <= product?.amount){
        return;
      }

      if(product) {
        if (amount <= responseStock.data.amount) {
          setCart(cart.map(product => {
            if (product.id === productId) {
              product.amount = amount;
            }
    
            return product;
          }));
        }
        else {
          toast.error('Quantidade solicitada fora de estoque');
        }

      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
